import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { verifyPayment } from '../lib/cashfree'
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
    const [planId] = useState(() => searchParams.get('plan_id') || localStorage.getItem('pending_payment_plan'))

    useEffect(() => {
        if (!orderId) {
            setStatus('failed')
            setError('No Order ID found.')
            return
        }

        const activateSubscription = async () => {
            try {
                // Get user first
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) throw new Error('User not logged in')

                // Verify Payment Status with Server
                // This prevents users from just visiting the URL to activate
                const verifyData = await verifyPayment(orderId)
                console.log('Payment Verification:', verifyData)

                if (verifyData.order_status !== 'PAID') {
                    throw new Error(`Payment verification failed: Status is ${verifyData.order_status}`)
                }

                if (planId === 'professional_fee') {
                    console.log('Processing Professional Fee payment for user:', user.id)
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ has_paid_professional_fee: true })
                        .eq('id', user.id)

                    console.log('DB Update result:', updateError)
                    if (updateError) {
                        console.error('DB Update failed. Using local fallback.', updateError)
                        // Fallback: Store locally
                        localStorage.setItem('has_paid_professional_fee_local', 'true')
                    } else {
                        // Ensure local is synced just in case
                        localStorage.setItem('has_paid_professional_fee_local', 'true')
                    }

                    await refreshProfile()
                    setStatus('success')
                    toast.success('Payment successful! Professional profile unlocked.')
                    return
                }

                // Get plan details from URL or default to 1_week
                const plan = planId || '1_week'

                let durationDays = 7 // default
                if (plan === '1_day') durationDays = 1
                else if (plan === '1_week') durationDays = 7
                else if (plan === '1_month') durationDays = 30

                const now = new Date()
                const expiresAt = new Date(now.setDate(now.getDate() + durationDays))



                // User is already fetched above

                // Calculate reveals based on plan
                let reveals = 50 // default for 1_week
                if (plan === '1_day') reveals = 5
                else if (plan === '1_week') reveals = 50
                else if (plan === '1_month') reveals = 999999 // unlimited

                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        subscription_plan: plan,
                        subscription_status: 'active',
                        subscription_start_date: new Date().toISOString(),
                        subscription_expires_at: expiresAt.toISOString(),
                        reveals_remaining: reveals,
                        reveals_used: 0
                    })
                    .eq('id', user.id)

                if (updateError) throw updateError

                await refreshProfile()
                setStatus('success')
                toast.success('Payment successful! Subscription active.')
            } catch (err) {
                console.error('Activation Error:', err)
                setStatus('failed')
                setError('Error: ' + (err.message || 'Unknown error occurred'))
            } finally {
                localStorage.removeItem('pending_payment_plan')
            }
        }

        activateSubscription()
    }, [orderId, planId, refreshProfile, toast])

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
                            {planId === 'professional_fee'
                                ? 'Your professional account has been activated. You can now create your profile.'
                                : 'Note: The Contact Feature is Currently Unavailable But Will Be Available Soon'
                            }
                        </p>
                        <Link to={planId === 'professional_fee' ? '/professionals/create' : '/'} className="btn-primary w-full block py-3">
                            {planId === 'professional_fee' ? 'Create Profile' : 'Back to Home'}
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
