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
        const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
            body: {
                plan_id: plan.id,
                price: plan.price,
                user_id: user.id,
                user_email: user.email,
                user_phone: profile?.phone_number || '9999999999',
                user_name: profile?.full_name || 'User'
            }
        })

        if (error) {
            console.error('Supabase Function Error:', error)
            throw new Error('Failed to initiate payment. Please try again.')
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
        redirectTarget: '_self', // or '_blank'
        returnUrl: `${window.location.origin}/subscription/success?order_id={order_id}`
    })
}
