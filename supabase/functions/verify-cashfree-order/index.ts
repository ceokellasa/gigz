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
        const { order_id } = await req.json()

        if (!order_id) {
            throw new Error('Missing order_id')
        }

        const APP_ID = Deno.env.get('CASHFREE_APP_ID')
        const SECRET_KEY = Deno.env.get('CASHFREE_SECRET_KEY')
        const API_VERSION = '2023-08-01'

        // Use sandbox URL if needed, but usually production in environment implies prod URL
        // Check mode from env or default to production URL
        // We will assume production URL but Cashfree has sandbox URL too 'https://sandbox.cashfree.com/pg/orders'
        // Ideally we should check environment variable for MODE. but usually KEY distinction handles it?
        // Wait, Cashfree SDK handles mode. Here we are making direct fetch.
        // Let's check create-cashfree-order. It used 'https://api.cashfree.com/pg/orders'.

        const URL = `https://api.cashfree.com/pg/orders/${order_id}`

        if (!APP_ID || !SECRET_KEY) {
            throw new Error('Cashfree credentials not configured')
        }

        const response = await fetch(URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': APP_ID,
                'x-client-secret': SECRET_KEY,
                'x-api-version': API_VERSION
            }
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Cashfree API Error:', data);
            throw new Error(data.message || 'Payment verification failed')
        }

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('Verification Error:', error.message)
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
