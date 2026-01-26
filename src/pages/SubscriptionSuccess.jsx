import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'

export default function SubscriptionSuccess() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { refreshProfile } = useAuth()
    const toast = useToast()
    const [status, setStatus] = useState('verifying') // verifying, success, failed
    const [error, setError] = useState(null)

    const orderId = searchParams.get('order_id')
    const planId = searchParams.get('plan_id')

    useEffect(() => {
        if (!orderId) {
            setStatus('failed')
            setError('No Order ID found.')
            return
        }

        const verifyPayment = async () => {
            try {
                // 1. Verify with Backend
                const response = await fetch(`/.netlify/functions/verify-payment?order_id=${orderId}`)
                const data = await response.json()

                if (data.status === 'PAID') {
                    // 2. Update Subscription in Supabase
                    // NOTE: Since user is logged in, they can update their own profile via RLS.

                    let durationDays = 0
                    if (planId === '1_day') durationDays = 1
                    else if (planId === '1_week') durationDays = 7
                    else if (planId === '1_month') durationDays = 30

                    const now = new Date()
                    const expiresAt = new Date(now.setDate(now.getDate() + durationDays))

                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({
                            subscription_plan: planId,
                            subscription_expires_at: expiresAt.toISOString()
                        })
                        .eq('id', (await supabase.auth.getUser()).data.user.id)

                    if (updateError) throw updateError

                    await refreshProfile()
                    setStatus('success')
                    toast.success('Payment successful! Subscription active.')
                } else {
                    setStatus('failed')
                    setError('Payment was not completed or failed.')
                }
            } catch (err) {
                console.error('Verification Error:', err)
                setStatus('failed')
                setError(err.message || 'Failed to verify payment.')
            }
        }

        verifyPayment()
    }, [orderId, planId])

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {status === 'verifying' && (
                    <div className="py-8">
                        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Payment</h2>
                        <p className="text-slate-600">Please wait while we confirm your subscription...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="py-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h2>
                        <p className="text-slate-600 mb-8">
                            Note: The Contact Feature is Currently Unavailable But Will Be Available Soon
                        </p>
                        <Link to="/" className="btn-primary w-full block py-3">
                            Back to Home
                        </Link>
                    </div>
                )}

                {status === 'failed' && (
                    <div className="py-8 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Failed</h2>
                        <p className="text-slate-600 mb-8">
                            {error || 'We could not process your payment. Please try again.'}
                        </p>
                        <Link to="/" className="btn-secondary w-full block py-3">
                            Try Again
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
