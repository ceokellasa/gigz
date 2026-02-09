import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { LogIn, Loader2, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'
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
    const [showResend, setShowResend] = useState(false)

    const validateForm = () => {
        const newErrors = {}
        const emailError = validateField(email, [validators.required, validators.email], 'Email')
        if (emailError) newErrors.email = emailError
        const passwordError = validateField(password, [validators.required, validators.minLength(6)], 'Password')
        if (passwordError) newErrors.password = passwordError
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

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
        setShowResend(false)

        if (!validateForm()) {
            toast.error('Please fix the errors below')
            return
        }

        setLoading(true)
        try {
            const { error } = await signIn(email.trim().toLowerCase(), password)
            if (error) {
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
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Left: Branding & Vibe */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-slate-50 relative overflow-hidden">
                {/* Decorative blob */}
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FACC15]/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-black text-white p-2 rounded-lg">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">KELLASA</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
                        Welcome back to the <span className="text-[#EAB308]">community</span>.
                    </h1>
                    <p className="text-xl text-slate-500 font-medium">
                        Connect with top professionals or find your next big project. It's all happening here.
                    </p>
                </div>

                <div className="relative z-10 text-sm font-medium text-slate-400">
                    © 2024 Kellasa Inc.
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-24 bg-white">
                <div className="w-full max-w-sm space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Sign in
                        </h2>
                        <p className="mt-2 text-slate-500">
                            New here?{' '}
                            <Link to="/signup" className="font-bold text-black border-b-2 border-[#FACC15] hover:bg-[#FACC15]/20 transition-colors">
                                Create account
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                                    Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className={`input-field pl-12 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            if (errors.email) setErrors({ ...errors, email: null })
                                        }}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                                        Password
                                    </label>
                                    <Link to="/forgot-password" className="text-sm font-bold text-slate-400 hover:text-black transition-colors">
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
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
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-black transition-colors focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 font-medium">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-full text-base"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {showResend && (
                        <div className="text-center p-4 bg-yellow-50 rounded-2xl border border-yellow-100">
                            <p className="text-sm text-yellow-800 mb-2 font-medium">
                                Didn't receive the email?
                            </p>
                            <button
                                type="button"
                                onClick={handleResendVerification}
                                disabled={loading}
                                className="text-black underline font-bold text-sm hover:no-underline"
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
