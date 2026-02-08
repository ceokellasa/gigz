import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { createPaymentSession, doPayment } from '../lib/cashfree'
import { Save, Plus, X, Upload, Trash2, ChevronDown, Search, Check, CreditCard, Loader2 } from 'lucide-react'
import clsx from 'clsx'
import { PROFESSIONS } from '../constants/professions'

export default function CreateProfessionalProfile() {
    const { user, profile, loading: authLoading } = useAuth()
    const navigate = useNavigate()

    const [loading, setLoading] = useState(false)
    const [existingProfile, setExistingProfile] = useState(null)
    const [checkingProfile, setCheckingProfile] = useState(true)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [dropdownSearch, setDropdownSearch] = useState('')
    const [isOtherSelected, setIsOtherSelected] = useState(false)
    const [paymentPhone, setPaymentPhone] = useState('')
    const [hasPaid, setHasPaid] = useState(false)

    const [formData, setFormData] = useState({
        profession: '',
        bio: '',
        age: '',
        years_of_experience: '',
        hourly_rate: '',
        project_rate_min: '',
        project_rate_max: '',
        location: '',
        willing_to_travel: false,
        available: true,
        website: '',
        linkedin: '',
        phone: '',
        skills: [],
        certifications: [],
        previous_works: [],
        contact_for_pricing: false
    })

    const [newSkill, setNewSkill] = useState('')
    const [newCert, setNewCert] = useState({ name: '', issuer: '', year: '' })
    const [newWork, setNewWork] = useState({ title: '', description: '', year: '' })
    const [newCertFile, setNewCertFile] = useState(null)
    const [newWorkFile, setNewWorkFile] = useState(null)
    const [uploading, setUploading] = useState(false)

    const uploadImage = async (file) => {
        if (!file) return null

        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('professional_assets')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('professional_assets')
                .getPublicUrl(filePath)

            return data.publicUrl
        } catch (error) {
            console.error('Error uploading image:', error)
            alert('Failed to upload image')
            return null
        }
    }



    useEffect(() => {
        if (user) {
            fetchExistingProfile()
        } else if (!authLoading) {
            setCheckingProfile(false)
        }

        // Sync from context initially, but fetchExistingProfile will confirm truth
        if (profile?.phone_number) {
            setPaymentPhone(profile.phone_number || '')
        }
        if (profile?.has_paid_professional_fee) {
            setHasPaid(true)
        }
    }, [user, profile, authLoading])

    // KYC Blocking Check
    // We check if the user is verified. If not, we return a blocking UI.



    const fetchExistingProfile = async () => {
        try {
            // Check payment status directly to avoid context lag
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('has_paid_professional_fee, phone_number')
                .eq('id', user.id)
                .single()

            // Local fallback check
            if (localStorage.getItem('has_paid_professional_fee_local') === 'true') {
                setHasPaid(true)
            }

            if (profileData) {
                if (profileData.has_paid_professional_fee) setHasPaid(true)
                if (profileData.phone_number) setPaymentPhone(profileData.phone_number || '')
            }

            const { data, error } = await supabase
                .from('professional_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single()

            if (data) {
                setExistingProfile(data)
                setFormData({
                    profession: data.profession || '',
                    bio: data.bio || '',
                    age: data.age || '',
                    years_of_experience: data.years_of_experience || '',
                    hourly_rate: data.hourly_rate || '',
                    project_rate_min: data.project_rate_min || '',
                    project_rate_max: data.project_rate_max || '',
                    location: data.location || '',
                    willing_to_travel: data.willing_to_travel || false,
                    available: data.available !== false,
                    website: data.website || '',
                    linkedin: data.linkedin || '',
                    phone: data.phone || '',
                    skills: data.skills || [],
                    certifications: data.certifications || [],
                    previous_works: data.previous_works || [],
                    contact_for_pricing: data.contact_for_pricing || false
                })

                if (data.profession && !PROFESSIONS.includes(data.profession)) {
                    setIsOtherSelected(true)
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setCheckingProfile(false)
        }
    }

    const handlePayment = async () => {
        if (!paymentPhone || paymentPhone.length < 10) {
            alert('Please enter a valid phone number for payment')
            return
        }

        setLoading(true)
        try {
            const plan = { id: 'professional_fee', price: 99, name: 'Professional Activation' }
            // Store plan type in local storage to handle redirect back
            localStorage.setItem('pending_payment_plan', plan.id)

            // Pass updated phone number
            const sessionId = await createPaymentSession(plan, user, { ...profile, phone_number: paymentPhone })
            await doPayment(sessionId)
        } catch (error) {
            console.error('Payment Error:', error)
            alert('Payment failed: ' + error.message)
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!existingProfile) return
        if (!window.confirm('Are you sure you want to delete your professional profile? This action cannot be undone.')) return

        setLoading(true)
        try {
            const { error } = await supabase
                .from('professional_profiles')
                .delete()
                .eq('user_id', user.id)

            if (error) throw error

            alert('Professional profile deleted.')
            navigate('/profile')
        } catch (error) {
            console.error('Error deleting profile:', error)
            alert('Failed to delete profile')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const profileData = {
                user_id: user.id,
                ...formData,
                age: formData.age ? parseInt(formData.age) : null,
                years_of_experience: formData.years_of_experience ? parseInt(formData.years_of_experience) : null,
                hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : null,
                project_rate_min: formData.project_rate_min ? parseFloat(formData.project_rate_min) : null,
                project_rate_max: formData.project_rate_max ? parseFloat(formData.project_rate_max) : null,
            }

            if (existingProfile) {
                // Update existing profile
                const { error } = await supabase
                    .from('professional_profiles')
                    .update(profileData)
                    .eq('user_id', user.id)

                if (error) throw error
                alert('Profile updated successfully!')
            } else {
                // Create new profile
                const { error } = await supabase
                    .from('professional_profiles')
                    .insert([profileData])

                if (error) throw error
                alert('Profile created successfully!')
            }

            navigate('/professionals')
        } catch (error) {
            console.error('Error saving profile:', error)
            alert(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const addSkill = () => {
        if (newSkill.trim()) {
            setFormData(prev => ({
                ...prev,
                skills: [...prev.skills, newSkill.trim()]
            }))
            setNewSkill('')
        }
    }

    const removeSkill = (index) => {
        setFormData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }))
    }

    const addCertification = async () => {
        if (newCert.name && newCert.issuer) {
            setUploading(true)
            let imageUrl = null
            if (newCertFile) {
                imageUrl = await uploadImage(newCertFile)
            }

            setFormData(prev => ({
                ...prev,
                certifications: [...prev.certifications, { ...newCert, image_url: imageUrl }]
            }))
            setNewCert({ name: '', issuer: '', year: '' })
            setNewCertFile(null)
            setUploading(false)
        }
    }

    const removeCertification = (index) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index)
        }))
    }

    const addWork = async () => {
        if (newWork.title && newWork.description) {
            setUploading(true)
            let imageUrl = null
            if (newWorkFile) {
                imageUrl = await uploadImage(newWorkFile)
            }

            setFormData(prev => ({
                ...prev,
                previous_works: [...prev.previous_works, { ...newWork, image_url: imageUrl }]
            }))
            setNewWork({ title: '', description: '', year: '' })
            setNewWorkFile(null)
            setUploading(false)
        }
    }

    const removeWork = (index) => {
        setFormData(prev => ({
            ...prev,
            previous_works: prev.previous_works.filter((_, i) => i !== index)
        }))
    }

    if (authLoading || checkingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    // Require Authentication
    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in Required</h2>
                    <p className="text-slate-600 mb-8">
                        You need to be logged in to create a professional profile.
                    </p>
                    <div className="space-y-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="btn-primary w-full flex items-center justify-center"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="btn-secondary w-full flex items-center justify-center"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Payment Block Logic
    if (!existingProfile && !hasPaid) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-slate-200">
                    <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CreditCard className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Professional Activation</h2>
                    <p className="text-slate-600 mb-6">
                        To maintain quality and trust, we charge a one-time activation fee of <strong>₹99</strong> for professional profiles.
                    </p>

                    <div className="mb-4 text-left">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Confirm Phone Number
                        </label>
                        <input
                            type="tel"
                            value={paymentPhone}
                            onChange={(e) => setPaymentPhone(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="+91"
                        />
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={loading}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                        Pay ₹99 to Unlock
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 text-slate-500 hover:text-slate-700 text-sm font-medium"
                    >
                        Cancel & Go Home
                    </button>
                </div>
            </div>
        )
    }

    if (!profile || profile.kyc_status !== 'verified') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-slate-200">
                    <div className="h-16 w-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Upload className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Identity Verification Required</h2>
                    <p className="text-slate-600 mb-6">
                        To maintain a trusted environment, all professionals must verify their identity before creating a profile.
                    </p>
                    <button
                        onClick={() => navigate('/profile')}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                    >
                        Go to Verification Settings
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 text-slate-500 hover:text-slate-700 text-sm font-medium"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                    {existingProfile ? 'Edit' : 'Create'} Professional Profile
                </h1>
                <p className="text-slate-600">Showcase your skills and get hired</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Basic Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Profession *
                            </label>

                            <div className="relative">
                                <button
                                    type="button"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg text-left bg-white flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                >
                                    <span className={formData.profession ? 'text-slate-900' : 'text-slate-400'}>
                                        {isOtherSelected ? 'Other (Custom)' : (formData.profession || 'Select profession')}
                                    </span>
                                    <ChevronDown className="h-5 w-5 text-slate-400" />
                                </button>

                                {isDropdownOpen && (
                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                        <div className="sticky top-0 bg-white p-2 border-b border-slate-100 z-10">
                                            <div className="relative">
                                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                                                <input
                                                    type="text"
                                                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-indigo-500"
                                                    placeholder="Search..."
                                                    value={dropdownSearch}
                                                    onChange={(e) => setDropdownSearch(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        {PROFESSIONS.filter(p => p.toLowerCase().includes(dropdownSearch.toLowerCase())).map((prof) => (
                                            <div
                                                key={prof}
                                                className={clsx(
                                                    'cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-50',
                                                    formData.profession === prof ? 'text-indigo-600 bg-indigo-50' : 'text-slate-900'
                                                )}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, profession: prof }))
                                                    setIsOtherSelected(false)
                                                    setIsDropdownOpen(false)
                                                    setDropdownSearch('')
                                                }}
                                            >
                                                {prof}
                                                {formData.profession === prof && (
                                                    <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600" />
                                                )}
                                            </div>
                                        ))}

                                        <div
                                            className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-50 font-medium text-indigo-600 border-t border-slate-100"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, profession: '' }))
                                                setIsOtherSelected(true)
                                                setIsDropdownOpen(false)
                                            }}
                                        >
                                            Other (Specify)
                                        </div>
                                    </div>
                                )}
                            </div>

                            {isOtherSelected && (
                                <div className="mt-2 text-left">
                                    <input
                                        type="text"
                                        placeholder="Please specify your profession"
                                        value={formData.profession}
                                        onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent animate-in fade-in slide-in-from-top-1"
                                        autoFocus
                                    />
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Age
                            </label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                min="18"
                                max="100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Years of Experience
                            </label>
                            <input
                                type="number"
                                value={formData.years_of_experience}
                                onChange={(e) => setFormData(prev => ({ ...prev, years_of_experience: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                min="0"
                                max="50"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="City, State"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Bio
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                            rows={4}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Tell clients about yourself..."
                        />
                    </div>

                    <div className="mt-4 flex items-center gap-6">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.willing_to_travel}
                                onChange={(e) => setFormData(prev => ({ ...prev, willing_to_travel: e.target.checked }))}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">Willing to travel</span>
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.available}
                                onChange={(e) => setFormData(prev => ({ ...prev, available: e.target.checked }))}
                                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">Available for work</span>
                        </label>
                    </div>
                </div>

                {/* Pricing */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Pricing</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Hourly Rate (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.hourly_rate}
                                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-100 disabled:text-slate-400"
                                min="0"
                                step="0.01"
                                disabled={formData.contact_for_pricing}
                            />
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.contact_for_pricing}
                                    onChange={(e) => setFormData(prev => ({ ...prev, contact_for_pricing: e.target.checked }))}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-slate-600">Contact for pricing</span>
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Project Min (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.project_rate_min}
                                onChange={(e) => setFormData(prev => ({ ...prev, project_rate_min: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Project Max (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.project_rate_max}
                                onChange={(e) => setFormData(prev => ({ ...prev, project_rate_max: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Contact Information</h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Website
                            </label>
                            <input
                                type="url"
                                value={formData.website}
                                onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="https://"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                LinkedIn
                            </label>
                            <input
                                type="url"
                                value={formData.linkedin}
                                onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Skills</h2>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Add a skill..."
                        />
                        <button
                            type="button"
                            onClick={addSkill}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full"
                            >
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => removeSkill(idx)}
                                    className="hover:text-indigo-900"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Certifications */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Certifications</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input
                            type="text"
                            value={newCert.name}
                            onChange={(e) => setNewCert(prev => ({ ...prev, name: e.target.value }))}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Certificate Name"
                        />
                        <input
                            type="text"
                            value={newCert.issuer}
                            onChange={(e) => setNewCert(prev => ({ ...prev, issuer: e.target.value }))}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Issuing Organization"
                        />
                        <input
                            type="text"
                            value={newCert.year}
                            onChange={(e) => setNewCert(prev => ({ ...prev, year: e.target.value }))}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Year"
                        />
                        <div className="relative">
                            <input
                                type="file"
                                onChange={(e) => setNewCertFile(e.target.files[0])}
                                className="hidden"
                                id="cert-file"
                                accept="image/*"
                            />
                            <label
                                htmlFor="cert-file"
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 text-slate-600"
                            >
                                <Upload className="h-4 w-4" />
                                {newCertFile ? newCertFile.name : 'Upload Certificate Photo'}
                            </label>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addCertification}
                        disabled={uploading || !newCert.name || !newCert.issuer}
                        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {uploading ? 'Uploading...' : 'Add Certification'}
                    </button>

                    <div className="space-y-3">
                        {formData.certifications.map((cert, idx) => (
                            <div key={idx} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg">
                                <div className="flex gap-4">
                                    {cert.image_url && (
                                        <img src={cert.image_url} alt="Cert" className="h-12 w-12 rounded object-cover border border-slate-200" />
                                    )}
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{cert.name}</h4>
                                        <p className="text-sm text-slate-600">{cert.issuer} • {cert.year}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeCertification(idx)}
                                    className="text-slate-400 hover:text-red-500"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Portfolio / Previous Works */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Portfolio / Previous Work</h2>

                    <div className="grid grid-cols-1 gap-4 mb-4">
                        <input
                            type="text"
                            value={newWork.title}
                            onChange={(e) => setNewWork(prev => ({ ...prev, title: e.target.value }))}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Project Title"
                        />
                        <textarea
                            value={newWork.description}
                            onChange={(e) => setNewWork(prev => ({ ...prev, description: e.target.value }))}
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Description of work..."
                            rows={2}
                        />
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={newWork.year}
                                onChange={(e) => setNewWork(prev => ({ ...prev, year: e.target.value }))}
                                className="w-32 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Year"
                            />
                            <div className="flex-1 relative">
                                <input
                                    type="file"
                                    onChange={(e) => setNewWorkFile(e.target.files[0])}
                                    className="hidden"
                                    id="work-file"
                                    accept="image/*"
                                />
                                <label
                                    htmlFor="work-file"
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 text-slate-600"
                                >
                                    <Upload className="h-4 w-4" />
                                    {newWorkFile ? newWorkFile.name : 'Upload Project Photo'}
                                </label>
                            </div>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={addWork}
                        disabled={uploading || !newWork.title || !newWork.description}
                        className="mb-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        {uploading ? 'Uploading...' : 'Add Project'}
                    </button>

                    <div className="space-y-4">
                        {formData.previous_works.map((work, idx) => (
                            <div key={idx} className="flex items-start justify-between p-4 bg-slate-50 rounded-lg">
                                <div className="flex gap-4 w-full">
                                    {work.image_url && (
                                        <img src={work.image_url} alt="Work" className="h-16 w-16 rounded object-cover border border-slate-200 flex-shrink-0" />
                                    )}
                                    <div className="min-w-0">
                                        <h4 className="font-semibold text-slate-900 truncate">{work.title}</h4>
                                        <p className="text-xs text-slate-500 mb-1">{work.year}</p>
                                        <p className="text-sm text-slate-600 line-clamp-2">{work.description}</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeWork(idx)}
                                    className="text-slate-400 hover:text-red-500 ml-2"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pb-24 md:pb-0">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="h-5 w-5" />
                        {loading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/professionals')}
                        className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
                {existingProfile && (
                    <div className="flex justify-center border-t border-slate-200 pt-6">
                        <button
                            type="button"
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-6 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                        >
                            <Trash2 className="h-5 w-5" />
                            Delete Professional Profile
                        </button>
                    </div>
                )}
            </form>
        </div>
    )
}
