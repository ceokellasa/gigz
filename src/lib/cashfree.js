import { load } from '@cashfreepayments/cashfree-js'
import { supabase } from './supabase'

let cashfree

export const initializeCashfree = async () => {
    cashfree = await load({
        mode: import.meta.env.VITE_CASHFREE_MODE || 'production'
    })
}

export const createPaymentSession = async (plan, user, profile) => {
    try {
        // Get the current session token
        const { data: { session } } = await supabase.auth.getSession()

        // Call Supabase Edge Function with authentication
        const response = await fetch('https://rhqzywqsfjzjzbfqlyqf.supabase.co/functions/v1/create-cashfree-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
                plan_id: plan.id,
                price: plan.price,
                user_id: user.id,
                user_email: user.email,
                user_phone: profile?.phone_number || '9999999999',
                user_name: profile?.full_name || 'User'
            })
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Payment Error:', data)
            throw new Error(data.error || 'Failed to initiate payment')
        }

        return data.payment_session_id
    } catch (error) {
        console.error('Error creating payment session:', error)
        throw error
    }
}

export const doPayment = async (paymentSessionId) => {
    if (!cashfree) await initializeCashfree()

    return cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
        returnUrl: `${window.location.origin}/subscription/success?order_id={order_id}`
    })
}

export const verifyPayment = async (orderId) => {
    try {
        const { data: { session } } = await supabase.auth.getSession()

        const response = await fetch('https://rhqzywqsfjzjzbfqlyqf.supabase.co/functions/v1/verify-cashfree-order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ order_id: orderId })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to verify payment')
        }

        return data
    } catch (error) {
        console.error('Error verifying payment:', error)
        throw error
    }
}
