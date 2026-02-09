import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import { Mail, Loader2, KeyRound, ArrowLeft, ArrowRight } from 'lucide-react'
import { validators, validateField } from '../lib/validation'
import clsx from 'clsx'

export default function ForgotPassword() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)
    const toast = useToast()
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(c => c - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [cooldown])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSuccess(false)
        const emailError = validateField(email, [validators.required, validators.email], 'Email')
        if (emailError) {
            setError(emailError)
            return
        }
        const redirectTo = `${window.location.origin}/update-password`
        setLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: redirectTo,
            })
            if (error) {
                if (error.message.includes('rate limit') || error.status === 429) {
                    throw new Error('Please wait 60 seconds before trying again.')
                }
                throw error
            }
            setSuccess(true)
            setCooldown(60)
            toast.success('Password reset email sent!')
        } catch (err) {
            console.error('Reset password error:', err)
            setError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white px-4">
                <div className="max-w-md w-full bg-white rounded-[2rem] shadow-floating p-10 text-center border border-slate-100 animate-in fade-in zoom-in duration-300">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Check your email</h3>
                    <p className="text-lg text-slate-500 mb-8 font-medium">
                        We've sent a reset link to <br />
                        <span className="text-slate-900 font-bold">{email}</span>.
                    </p>
                    <Link to="/login" className="btn-primary w-full py-4 text-base rounded-full">
                        Back to Login
                    </Link>
                    <div className="mt-6 text-sm font-medium text-slate-500">
                        Didn't receive it?
                        {cooldown > 0 ? (
                            <span className="ml-1 text-slate-300">Resend in {cooldown}s</span>
                        ) : (
                            <button onClick={handleSubmit} disabled={loading} className="text-black font-bold ml-1 hover:underline">Click to resend</button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-white">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6">
                        <KeyRound className="h-8 w-8 text-black" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                        Reset password
                    </h2>
                    <p className="mt-2 text-slate-500">
                        Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                    <div>
                        <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                            Email address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className={clsx('input-field pl-12', error && 'border-red-500')}
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        {error && <p className="mt-1 text-sm text-red-600 font-medium">{error}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-full text-base"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <span>Send Reset Link</span>
                                <ArrowRight className="h-5 w-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-black transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
