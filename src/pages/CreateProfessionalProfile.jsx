import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Save, Plus, X, Upload } from 'lucide-react'

export default function CreateProfessionalProfile() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [existingProfile, setExistingProfile] = useState(null)

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
        previous_works: []
    })

    const [newSkill, setNewSkill] = useState('')
    const [newCert, setNewCert] = useState({ name: '', issuer: '', year: '' })
    const [newWork, setNewWork] = useState({ title: '', description: '', year: '' })

    const professions = [
        'Lawyer', 'Plumber', 'Electrician', 'Carpenter', 'Designer',
        'Developer', 'Photographer', 'Videographer', 'Tutor', 'Consultant',
        'Accountant', 'Mechanic', 'Chef', 'Cleaner', 'Other'
    ]

    useEffect(() => {
        if (user) {
            fetchExistingProfile()
        }
    }, [user])

    const fetchExistingProfile = async () => {
        try {
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
                    previous_works: data.previous_works || []
                })
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
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

    const addCertification = () => {
        if (newCert.name && newCert.issuer) {
            setFormData(prev => ({
                ...prev,
                certifications: [...prev.certifications, newCert]
            }))
            setNewCert({ name: '', issuer: '', year: '' })
        }
    }

    const removeCertification = (index) => {
        setFormData(prev => ({
            ...prev,
            certifications: prev.certifications.filter((_, i) => i !== index)
        }))
    }

    const addWork = () => {
        if (newWork.title && newWork.description) {
            setFormData(prev => ({
                ...prev,
                previous_works: [...prev.previous_works, newWork]
            }))
            setNewWork({ title: '', description: '', year: '' })
        }
    }

    const removeWork = (index) => {
        setFormData(prev => ({
            ...prev,
            previous_works: prev.previous_works.filter((_, i) => i !== index)
        }))
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Profession *
                            </label>
                            <select
                                required
                                value={formData.profession}
                                onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                                <option value="">Select profession</option>
                                {professions.map(prof => (
                                    <option key={prof} value={prof}>{prof}</option>
                                ))}
                            </select>
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
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                min="0"
                                step="0.01"
                            />
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

                {/* Submit */}
                <div className="flex gap-4">
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
            </form>
        </div>
    )
}
