import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import { UserPlus, Loader2, Mail, Lock, User, Briefcase, Hammer, Phone, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react'
import { validators, validateField, sanitizeInput } from '../lib/validation'
import clsx from 'clsx'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'worker'
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [showSuccessModal, setShowSuccessModal] = useState(false)
    const navigate = useNavigate()
    const toast = useToast()
    const { refreshProfile } = useAuth()

    const validateForm = () => {
        const newErrors = {}
        const emailError = validateField(formData.email, [validators.required, validators.email], 'Email')
        if (emailError) newErrors.email = emailError
        const passwordError = validateField(formData.password, [validators.required, validators.minLength(6)], 'Password')
        if (passwordError) newErrors.password = passwordError
        const nameError = validateField(formData.fullName, [validators.required, validators.minLength(2)], 'Name')
        if (nameError) newErrors.fullName = nameError
        const phoneError = validateField(formData.phone, [validators.required, validators.minLength(10)], 'Phone Number')
        if (phoneError) newErrors.phone = phoneError

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            toast.error('Please fix the errors below')
            return
        }

        setLoading(true)
        try {
            const userIdUrl = window.location.origin
            const { data, error } = await supabase.auth.signUp({
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                options: {
                    data: {
                        full_name: sanitizeInput(formData.fullName),
                        phone: formData.phone.trim(),
                        role: formData.role,
                    },
                    emailRedirectTo: `${userIdUrl}/email-verified`
                },
            })

            if (error) {
                if (error.message.includes('already registered')) {
                    toast.error('This email is already registered. Please sign in.')
                } else {
                    toast.error(error.message)
                }
                return
            }

            if (data.user) {
                setShowSuccessModal(true)
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.')
            console.error('Signup error:', err)
        } finally {
            setLoading(false)
        }
    }

    if (showSuccessModal) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white rounded-[2rem] shadow-floating p-10 text-center animate-in fade-in zoom-in duration-300 border border-slate-100">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Check your email</h2>
                    <p className="text-lg text-slate-500 mb-8 font-medium">
                        We've sent a verification link to <br />
                        <span className="text-slate-900 font-bold">{formData.email}</span>
                    </p>
                    <Link
                        to="/login"
                        className="btn-primary w-full py-4 text-base rounded-full"
                    >
                        Continue to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Left: Branding */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-black relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FACC15]/20 rounded-full blur-[100px] transform translate-x-1/3 -translate-y-1/3" />

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-white text-black p-2 rounded-lg">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight">KELLASA</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-bold mb-8 leading-tight">
                        Join the future of <br />
                        <span className="text-[#FACC15]">professional work</span>.
                    </h1>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="font-bold">1</span>
                            </div>
                            <p className="text-lg font-medium text-slate-300">Create your expert profile in minutes.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="font-bold">2</span>
                            </div>
                            <p className="text-lg font-medium text-slate-300">Showcase your portfolio and skills.</p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                                <span className="font-bold">3</span>
                            </div>
                            <p className="text-lg font-medium text-slate-300">Connect with clients and get hired.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-sm font-medium text-slate-500">
                    © 2024 Kellasa Inc.
                </div>
            </div>

            {/* Right: Signup Form */}
            <div className="flex flex-col justify-center items-center p-8 sm:p-12 lg:p-16 bg-white overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Create Account
                        </h2>
                        <p className="mt-2 text-slate-500">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-black border-b-2 border-[#FACC15] hover:bg-[#FACC15]/20 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    I want to...
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, role: 'client' }))}
                                        className={clsx(
                                            'p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3',
                                            formData.role === 'client'
                                                ? 'border-black bg-black text-white shadow-lg'
                                                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                        )}
                                    >
                                        <Briefcase className="h-6 w-6" />
                                        <span className="font-bold text-sm">Hire Talent</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, role: 'worker' }))}
                                        className={clsx(
                                            'p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3',
                                            formData.role === 'worker'
                                                ? 'border-black bg-black text-white shadow-lg'
                                                : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                                        )}
                                    >
                                        <Hammer className="h-6 w-6" />
                                        <span className="font-bold text-sm">Find Work</span>
                                    </button>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="fullName" className="block text-sm font-bold text-slate-700 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        type="text"
                                        required
                                        className={clsx('input-field pl-12', errors.fullName && 'border-red-500')}
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.fullName && <p className="mt-1 text-sm text-red-600 font-medium">{errors.fullName}</p>}
                            </div>

                            <div className="md:col-span-2">
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
                                        required
                                        className={clsx('input-field pl-12', errors.email && 'border-red-500')}
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-sm text-red-600 font-medium">{errors.email}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-2">
                                    Phone Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        required
                                        className={clsx('input-field pl-12', errors.phone && 'border-red-500')}
                                        placeholder="+91 9876543210"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                                {errors.phone && <p className="mt-1 text-sm text-red-600 font-medium">{errors.phone}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        className={clsx('input-field pl-12 pr-12', errors.password && 'border-red-500')}
                                        placeholder="Min 6 characters"
                                        value={formData.password}
                                        onChange={handleChange}
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
                                {errors.password && <p className="mt-1 text-sm text-red-600 font-medium">{errors.password}</p>}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-4 rounded-full text-base mt-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span>Creating account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <ArrowRight className="h-5 w-5" />
                                </>
                            )}
                        </button>

                        <p className="text-xs text-center text-slate-400 mt-4">
                            By signing up, you agree to our Terms of Service.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
