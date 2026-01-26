import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import { Mail, Loader2, KeyRound, ArrowLeft } from 'lucide-react'
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
        setSuccess(false) // Allow retrying if needed

        const emailError = validateField(email, [validators.required, validators.email], 'Email')
        if (emailError) {
            setError(emailError)
            return
        }

        const redirectTo = `${window.location.origin}/update-password`
        console.log('Sending reset email to:', email, 'Redirecting to:', redirectTo)

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
            setCooldown(60) // Start 60s cooldown
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
            <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
                <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20 bg-white/90 backdrop-blur-md text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                            <Mail className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Check your email</h3>
                        <p className="text-slate-600 mb-6">
                            We've sent a password reset link to <strong>{email}</strong>.
                        </p>
                        <Link to="/login" className="btn-primary w-full block">
                            Back to Login
                        </Link>
                        <div className="mt-4 text-sm text-slate-500">
                            Didn't receive it?
                            {cooldown > 0 ? (
                                <span className="ml-1 text-slate-400 font-medium">Resend in {cooldown}s</span>
                            ) : (
                                <button onClick={handleSubmit} disabled={loading} className="text-indigo-600 hover:text-indigo-500 font-medium ml-1">Click to resend</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                        <KeyRound className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-slate-900">
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Enter your email and we'll send you a link to reset your password.
                </p>
            </div>

            <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20 bg-white/90 backdrop-blur-md">
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    className={clsx('input-field pl-10', error && 'border-red-500')}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Sending Link...
                                </>
                            ) : 'Send Reset Link'}
                        </button>
                    </form>

                    <div className="mt-6">
                        <Link
                            to="/login"
                            className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
