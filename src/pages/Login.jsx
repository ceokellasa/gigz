import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { LogIn, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { validators, validateField } from '../lib/validation'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()

    const validateForm = () => {
        const newErrors = {}

        const emailError = validateField(email, [validators.required, validators.email], 'Email')
        if (emailError) newErrors.email = emailError

        const passwordError = validateField(password, [validators.required, validators.minLength(6)], 'Password')
        if (passwordError) newErrors.password = passwordError

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const [showResend, setShowResend] = useState(false)

    // ... (existing code)

    const handleResendVerification = async () => {
        if (!email) {
            toast.error('Please enter your email address first')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email.trim()
            })

            if (error) throw error
            toast.success('Verification email sent! Please check your inbox.')
            setShowResend(false)
        } catch (error) {
            console.error('Error resending verification:', error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setShowResend(false) // Reset on new attempt

        if (!validateForm()) {
            toast.error('Please fix the errors below')
            return
        }

        setLoading(true)
        try {
            const { error } = await signIn(email.trim().toLowerCase(), password)
            if (error) {
                // User-friendly error messages
                if (error.message.includes('Invalid login')) {
                    toast.error('Invalid email or password. Please try again.')
                } else if (error.message.includes('Email not confirmed')) {
                    toast.warning('Please verify your email before signing in.')
                    setShowResend(true)
                } else {
                    toast.error(error.message)
                }
            } else {
                toast.success('Welcome back!')
                navigate('/')
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.')
            console.error('Login error:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">

            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                        <LogIn className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-slate-900">
                    Welcome back
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Sign up free
                    </Link>
                </p>
            </div>

            <div className="relatve z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
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
                                    autoComplete="email"
                                    required
                                    className={`input-field pl-10 ${errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (errors.email) setErrors({ ...errors, email: null })
                                    }}
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <Link to="/forgot-password" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    className={`input-field pl-10 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value)
                                        if (errors.password) setErrors({ ...errors, password: null })
                                    }}
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </form>

                    {showResend && (
                        <div className="mt-4 text-center">
                            <p className="text-sm text-slate-600 mb-2">
                                Didn't receive the email?
                            </p>
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={loading}
                                className="text-indigo-600 hover:text-indigo-500 font-medium text-sm"
                            >
                                Resend verification email
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
