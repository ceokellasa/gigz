import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { User, MapPin, Briefcase, Camera, Save, LogOut, LogIn, UserPlus, Crown, Heart, LayoutDashboard, ShieldAlert, MessageSquare, LifeBuoy, Receipt } from 'lucide-react'
import KYCVerification from '../components/KYCVerification'
import FeatureSuggestionModal from '../components/FeatureSuggestionModal'

export default function Profile() {
    const { user, profile, signOut, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [showFeatureModal, setShowFeatureModal] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        location: '',
        bio: '',
        skills: '',
        avatar_url: ''
    })

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                location: profile.location || '',
                bio: profile.bio || '',
                skills: profile.skills ? profile.skills.join(', ') : '',
                avatar_url: profile.avatar_url || ''
            })
        }
    }, [profile])

    const handleSignOut = async () => {
        await signOut()
        navigate('/login')
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setLoading(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `${user.id}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }))

            // Auto-save avatar update
            await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)

            setMessage({ type: 'success', text: 'Avatar updated successfully!' })
        } catch (error) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const skillsArray = formData.skills
                .split(',')
                .map(skill => skill.trim())
                .filter(skill => skill.length > 0)

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    location: formData.location,
                    bio: formData.bio,
                    skills: skillsArray,
                    updated_at: new Date()
                })
                .eq('id', user.id)

            if (error) throw error
            setMessage({ type: 'success', text: 'Profile updated successfully!' })
        } catch (error) {
            setMessage({ type: 'error', text: error.message })
        } finally {
            setLoading(false)
        }
    }

    // If user is not logged in, show login/signup options
    if (!user) {
        return (
            <div className="max-w-md mx-auto px-4 py-12">
                <div className="glass-panel rounded-2xl p-8 text-center">
                    <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                        <User className="h-12 w-12 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">WELLCOME TO KELLASA</h1>
                    <p className="text-slate-500 mb-8">Sign in to manage your profile and access all features.</p>

                    <div className="space-y-4">
                        <Link
                            to="/login"
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <LogIn className="h-5 w-5" />
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="btn-secondary w-full flex items-center justify-center gap-2"
                        >
                            <UserPlus className="h-5 w-5" />
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="glass-panel rounded-2xl p-6 sm:p-8">
                {/* Header with message */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Your Profile</h1>
                    {message && (
                        <div className={`px-4 py-2 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                            {message.text}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Avatar Section - Mobile Optimized */}
                    <div className="flex flex-col items-center gap-6 pb-8 border-b border-slate-200">
                        <div className="relative">
                            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full overflow-hidden bg-slate-100 ring-4 ring-white shadow-xl">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                                        <span className="text-4xl sm:text-5xl font-bold">
                                            {formData.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <label className="absolute bottom-2 right-2 bg-indigo-600 text-white p-3 rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors">
                                <Camera className="h-5 w-5" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={loading}
                                />
                            </label>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-slate-900">{formData.full_name || 'Add your name'}</h3>
                            <p className="text-sm text-slate-500">{user.email}</p>
                            <button
                                type="button"
                                className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1 mx-auto"
                                onClick={() => document.querySelector('input[type="file"]').click()}
                            >
                                <Camera className="h-4 w-4" />
                                {formData.avatar_url ? 'Change Photo' : 'Upload Photo'}
                            </button>
                        </div>
                    </div>

                    {/* Quick Actions - Mobile */}
                    <div className="grid grid-cols-2 gap-4 sm:hidden">
                        <Link
                            to="/saved"
                            className="flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 px-4 rounded-xl font-medium border border-red-100"
                        >
                            <Heart className="h-5 w-5" />
                            Saved
                        </Link>
                        <Link
                            to="/dashboard"
                            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-medium"
                        >
                            <LayoutDashboard className="h-5 w-5" />
                            Dashboard
                        </Link>
                        <Link
                            to="/payments"
                            className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-medium"
                        >
                            <Receipt className="h-5 w-5" />
                            Payments
                        </Link>

                        {user.email === 'nsjdfmjr@gmail.com' && (
                            <Link
                                to="/admin"
                                className="flex items-center justify-center gap-2 bg-slate-900 text-white py-3 px-4 rounded-xl font-medium col-span-2 shadow-lg"
                            >
                                <ShieldAlert className="h-5 w-5" />
                                Admin Panel
                            </Link>
                        )}

                        {profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date() ? (
                            <div className="col-span-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl">
                                <div className="flex items-center justify-center gap-2 font-medium">
                                    <Crown className="h-5 w-5" />
                                    Premium Active
                                </div>
                                <p className="text-center text-xs text-indigo-200 mt-1">
                                    Expires: {new Date(profile.subscription_expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        ) : (
                            <Link
                                to="/subscription"
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl font-medium shadow-lg"
                            >
                                <Crown className="h-5 w-5" />
                                Get Premium
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className={`flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-medium hover:bg-slate-200 transition-colors ${profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date() ? '' : ''}`}
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>
                    </div>

                    {/* Support & Feedback Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        <div className="bg-indigo-50 rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div>
                                <h3 className="text-sm font-semibold text-indigo-900 flex items-center gap-2">
                                    <LifeBuoy className="h-4 w-4" />
                                    Need Help?
                                </h3>
                                <p className="text-xs text-indigo-700">Chat with support</p>
                            </div>
                            <Link
                                to="/messages?mode=support"
                                className="bg-white text-indigo-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-100 transition-colors"
                            >
                                Chat
                            </Link>
                        </div>

                        <div className="bg-yellow-50 rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div>
                                <h3 className="text-sm font-semibold text-yellow-900 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4" />
                                    Have an Idea?
                                </h3>
                                <p className="text-xs text-yellow-700">Suggest a feature</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowFeatureModal(true)}
                                className="bg-white text-yellow-600 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm hover:bg-yellow-100 transition-colors"
                            >
                                Suggest
                            </button>
                        </div>
                    </div>

                    {/* KYC Verification Section */}
                    <KYCVerification profile={profile} onUpdate={refreshProfile} />

                    {/* Professional Profile Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white mb-8">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Briefcase className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Professional Profile</h2>
                                    <p className="text-blue-100 mt-1">
                                        Showcase your skills and get hired for gigs.
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/professionals/create"
                                className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-sm whitespace-nowrap"
                            >
                                Manage Profile
                            </Link>
                        </div>
                    </div>

                    {/* Profile Details Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <LayoutDashboard className="h-5 w-5 text-indigo-600" />
                                Profile Details
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">
                                        Full Name
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="full_name"
                                            id="full_name"
                                            value={formData.full_name}
                                            onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                            className="input-field pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="location" className="block text-sm font-medium text-slate-700">
                                        Location
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="location"
                                            id="location"
                                            placeholder="e.g. New York, NY"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                            className="input-field pl-10"
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <label htmlFor="bio" className="block text-sm font-medium text-slate-700">
                                        Bio
                                    </label>
                                    <div className="mt-1">
                                        <textarea
                                            id="bio"
                                            name="bio"
                                            rows={4}
                                            className="input-field"
                                            placeholder="Tell us about yourself, your experience, and what you're looking for."
                                            value={formData.bio}
                                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-6">
                                    <label htmlFor="skills" className="block text-sm font-medium text-slate-700">
                                        Skills
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Briefcase className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="skills"
                                            id="skills"
                                            placeholder="e.g. React, Design, Writing (comma separated)"
                                            value={formData.skills}
                                            onChange={e => setFormData({ ...formData, skills: e.target.value })}
                                            className="input-field pl-10"
                                        />
                                    </div>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Separate skills with commas.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200">
                        {/* Desktop Sign Out */}
                        <button
                            type="button"
                            onClick={handleSignOut}
                            className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-red-600 transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            Sign Out
                        </button>

                        {user.email === 'nsjdfmjr@gmail.com' && (
                            <Link
                                to="/admin"
                                className="hidden sm:flex items-center gap-2 text-slate-900 font-bold hover:text-indigo-600 transition-colors mr-auto ml-6"
                            >
                                <ShieldAlert className="h-5 w-5" />
                                Admin
                            </Link>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
                        >
                            <Save className="h-5 w-5" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <FeatureSuggestionModal
                isOpen={showFeatureModal}
                onClose={() => setShowFeatureModal(false)}
            />
        </div>
    )
}
