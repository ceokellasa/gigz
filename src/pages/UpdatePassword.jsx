import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/Toast'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { validators, validateField } from '../lib/validation'
import clsx from 'clsx'

export default function UpdatePassword() {
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [hashError, setHashError] = useState(null)
    const navigate = useNavigate()
    const toast = useToast()

    useEffect(() => {
        // Check for error parameters in the URL fragment (Supabase standard)
        const hash = window.location.hash
        if (hash && hash.includes('error=')) {
            // Retrieve error description
            const params = new URLSearchParams(hash.substring(1))
            const errorDesc = params.get('error_description')
            const errorCode = params.get('error_code')

            if (errorDesc) {
                setHashError(errorDesc.replace(/\+/g, ' '))
            } else if (errorCode === 'otp_expired') {
                setHashError('The password reset link has expired.')
            } else {
                setHashError('Invalid or expired link.')
            }
        }
    }, [])

    const validateForm = () => {
        const newErrors = {}
        const passwordError = validateField(password, [validators.required, validators.minLength(6)], 'Password')
        if (passwordError) newErrors.password = passwordError

        if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: password })

            if (error) throw error

            toast.success('Password updated successfully!')
            navigate('/')
        } catch (error) {
            console.error('Error updating password:', error)
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (hashError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-slate-200">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Link Expired</h2>
                    <p className="text-slate-600 mb-8">{hashError}</p>
                    <Link to="/forgot-password" className="btn-primary w-full block py-3">
                        Request New Link
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
                        <Lock className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-bold text-slate-900">
                    Set new password
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Your new password must be at least 6 characters long.
                </p>
            </div>

            <div className="relative z-10 mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="glass-panel py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20 bg-white/90 backdrop-blur-md">
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={clsx('input-field', errors.password && 'border-red-500')}
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-1">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className={clsx('input-field', errors.confirmPassword && 'border-red-500')}
                                placeholder="••••••••"
                            />
                            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Update Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
