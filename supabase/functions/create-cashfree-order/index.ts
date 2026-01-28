import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { plan_id, user_id, user_phone, user_email, user_name, price } = await req.json()

        if (!plan_id || !user_id || !price) {
            throw new Error('Missing required fields')
        }

        const APP_ID = Deno.env.get('CASHFREE_APP_ID')
        const SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY')
        const API_VERSION = '2023-08-01'
        const URL = 'https://api.cashfree.com/pg/orders'

        if (!APP_ID || !SECRET_KEY) {
            throw new Error('Cashfree credentials not configured')
        }

        const orderId = `order_${user_id.split('-')[0]}_${Date.now()}`

        const payload = {
            order_id: orderId,
            order_amount: price,
            order_currency: 'INR',
            customer_details: {
                customer_id: user_id,
                customer_email: user_email || 'user@example.com',
                customer_phone: user_phone || '9999999999',
                customer_name: user_name || 'User'
            },
            order_meta: {
                return_url: `${req.headers.get('origin')}/subscription/success?order_id={order_id}&plan_id=${plan_id}`
            },
            order_note: `Subscription for ${plan_id}`
        }

        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': APP_ID,
                'x-client-secret': SECRET_KEY,
                'x-api-version': API_VERSION
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Cashfree API Error:', data);
            throw new Error(data.message || 'Payment gateway error')
        }

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Payment Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
