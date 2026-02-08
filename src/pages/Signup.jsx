import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import { UserPlus, Loader2, Mail, Lock, User, Briefcase, Hammer, Phone, Eye, EyeOff } from 'lucide-react'
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
                // Show success modal instead of navigating immediately
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
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h2>
                    <p className="text-slate-600 mb-6">
                        We've sent a verification link to <br />
                        <span className="font-semibold text-slate-900">{formData.email}</span>
                    </p>
                    <p className="text-sm text-slate-500 mb-8">
                        Please verify your email to unlock full access to KELLASA.
                    </p>
                    <Link
                        to="/login"
                        className="btn-primary w-full block py-3"
                    >
                        Continue to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-slate-900">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20 bg-white/90 backdrop-blur-md">
                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                        {/* Full Name */}
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    className={clsx('input-field pl-10', errors.fullName && 'border-red-500')}
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
                        </div>

                        {/* Email */}
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
                                    className={clsx('input-field pl-10', errors.email && 'border-red-500')}
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">
                                Phone Number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    className={clsx('input-field pl-10', errors.phone && 'border-red-500')}
                                    placeholder="+91 9876543210"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    className={clsx('input-field pl-10 pr-10', errors.password && 'border-red-500')}
                                    placeholder="Min 6 characters"
                                    value={formData.password}
                                    onChange={handleChange}
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
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                I want to...
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, role: 'client' }))}
                                    className={clsx(
                                        'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                                        formData.role === 'client'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                    )}
                                    disabled={loading}
                                >
                                    <Briefcase className="h-6 w-6" />
                                    <span className="font-semibold">Hire Talent</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, role: 'worker' }))}
                                    className={clsx(
                                        'p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2',
                                        formData.role === 'worker'
                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300'
                                    )}
                                    disabled={loading}
                                >
                                    <Hammer className="h-6 w-6" />
                                    <span className="font-semibold">Find Work</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                        <p className="text-xs text-center text-slate-500 mt-4">
                            By signing up, you agree to our Terms of Service and Privacy Policy
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
