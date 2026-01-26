import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { PlusCircle, MapPin, Upload, X, Briefcase, Code, PenTool, Megaphone, Pen, Music, Video, Settings, Clock, IndianRupee, Truck, UtensilsCrossed, GraduationCap, Sparkles, Wrench, Camera, Car, Home, Scissors, Package } from 'lucide-react'
import clsx from 'clsx'
import LocationInput from '../../components/LocationInput'

const CATEGORIES = [
    { id: 'Tech', name: 'Tech & IT', icon: Code },
    { id: 'Design', name: 'Design', icon: PenTool },
    { id: 'Cleaning', name: 'Cleaning', icon: Sparkles },
    { id: 'Delivery', name: 'Delivery', icon: Truck },
    { id: 'Cooking', name: 'Cooking', icon: UtensilsCrossed },
    { id: 'Tutoring', name: 'Tutoring', icon: GraduationCap },
    { id: 'Beauty', name: 'Beauty & Salon', icon: Scissors },
    { id: 'Repair', name: 'Repair & Maintenance', icon: Wrench },
    { id: 'Photography', name: 'Photography', icon: Camera },
    { id: 'Driving', name: 'Driving', icon: Car },
    { id: 'Moving', name: 'Moving & Packing', icon: Package },
    { id: 'HomeService', name: 'Home Services', icon: Home },
    { id: 'Writing', name: 'Writing', icon: Pen },
    { id: 'Marketing', name: 'Marketing', icon: Megaphone },
    { id: 'Video', name: 'Video & Audio', icon: Video },
    { id: 'Other', name: 'Other', icon: Briefcase },
]

export default function PostGig() {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Tech',
        budget: '',
        budget_type: 'fixed', // 'fixed' or 'hourly'
        deadline: '',
        location: '',
        is_remote: false,
        required_skills: '',
        mobile_number: '',
        contact_for_price: false,
        latitude: null,
        longitude: null
    })

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login')
        }
    }, [user, authLoading, navigate])

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setFormData({ ...formData, [e.target.name]: value })
    }

    const handleCategorySelect = (category) => {
        setFormData({ ...formData, category })
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            let imageUrl = null

            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop()
                const fileName = `${Math.random()}.${fileExt}`
                const filePath = `${user.id}/${fileName}`

                const { error: uploadError } = await supabase.storage
                    .from('gig-images')
                    .upload(filePath, imageFile)

                if (uploadError) throw uploadError

                const { data: { publicUrl } } = supabase.storage
                    .from('gig-images')
                    .getPublicUrl(filePath)

                imageUrl = publicUrl
            }

            const skillsArray = formData.required_skills
                .split(',')
                .map(skill => skill.trim())
                .filter(skill => skill.length > 0)

            // Create gig data object - only include fields that exist in the database
            const gigData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                budget: formData.budget, // Now a string
                deadline: formData.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days from now
                location: formData.location || null,
                is_remote: formData.is_remote,
                required_skills: skillsArray,
                image_url: imageUrl,
                client_id: user.id,
                status: 'open',
                mobile_number: formData.mobile_number,
                latitude: formData.latitude,
                longitude: formData.longitude
            }

            // Try to add budget_type if the column exists
            try {
                gigData.budget_type = formData.budget_type
            } catch (e) {
                // Column doesn't exist, skip it
            }

            const { error } = await supabase.from('gigs').insert([gigData])

            if (error) throw error
            navigate('/')
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || !user) return <div className="p-8 text-center">Loading...</div>

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Post a New Gig</h1>
                <p className="mt-3 text-lg text-slate-500 max-w-2xl mx-auto">
                    Find the perfect talent for your next project. It only takes a few minutes.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl relative">
                        {error}
                    </div>
                )}

                {/* Section 1: Basic Info */}
                <div className="glass-panel p-8 rounded-2xl">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                        Project Basics
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-3">Category</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => handleCategorySelect(cat.id)}
                                            className={clsx(
                                                'flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200',
                                                formData.category === cat.id
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-slate-50'
                                            )}
                                        >
                                            <Icon className="h-6 w-6 mb-2" />
                                            <span className="text-xs font-medium">{cat.name}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Gig Title</label>
                            <input
                                type="text"
                                name="title"
                                id="title"
                                required
                                value={formData.title}
                                onChange={handleChange}
                                className="input-field text-lg"
                                placeholder="e.g. Build a Modern React Website"
                            />
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                rows={5}
                                required
                                value={formData.description}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Describe your project in detail..."
                            />
                        </div>
                    </div>
                </div>

                {/* Section 2: Details & Budget */}
                <div className="glass-panel p-8 rounded-2xl">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                        Details & Budget
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            {/* Budget Type Toggle */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-3">Payment Type</label>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, budget_type: 'fixed' })}
                                        className={clsx(
                                            'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all',
                                            formData.budget_type === 'fixed'
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                        )}
                                    >
                                        <IndianRupee className="h-4 w-4" />
                                        Fixed Price
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, budget_type: 'hourly' })}
                                        className={clsx(
                                            'flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium text-sm transition-all',
                                            formData.budget_type === 'hourly'
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-700'
                                        )}
                                    >
                                        <Clock className="h-4 w-4" />
                                        Hourly Rate
                                    </button>
                                </div>
                            </div>

                            {/* Budget Amount */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label htmlFor="budget" className="block text-sm font-medium text-slate-700">
                                        {formData.budget_type === 'fixed' ? 'Total Budget (₹)' : 'Hourly Rate (₹/hr)'}
                                    </label>

                                    <div className="flex items-center">
                                        <input
                                            id="contact_for_price"
                                            name="contact_for_price"
                                            type="checkbox"
                                            checked={formData.contact_for_price}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFormData({
                                                    ...formData,
                                                    contact_for_price: checked,
                                                    budget: checked ? 'Contact for Price' : (formData.budget === 'Contact for Price' ? '' : formData.budget)
                                                });
                                            }}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                        />
                                        <label htmlFor="contact_for_price" className="ml-2 block text-xs text-slate-500 font-medium cursor-pointer select-none">
                                            Contact for Budget
                                        </label>
                                    </div>
                                </div>

                                <div className="relative">
                                    {!formData.contact_for_price && (
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-slate-500 font-bold">₹</span>
                                        </div>
                                    )}
                                    <input
                                        type="text"
                                        name="budget"
                                        id="budget"
                                        required
                                        disabled={formData.contact_for_price}
                                        value={formData.budget}
                                        onChange={handleChange}
                                        className={clsx(
                                            "input-field",
                                            !formData.contact_for_price && "pl-8",
                                            formData.contact_for_price && "bg-slate-100 text-slate-500 cursor-not-allowed"
                                        )}
                                        placeholder={formData.budget_type === 'fixed' ? 'e.g. 5000 or 15000-20000' : 'e.g. 500'}
                                    />
                                    {formData.budget_type === 'hourly' && !formData.contact_for_price && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                            <span className="text-slate-400 text-sm">/hour</span>
                                        </div>
                                    )}
                                </div>
                                {formData.budget_type === 'hourly' && (
                                    <p className="mt-2 text-xs text-slate-500">
                                        Workers will be paid based on hours worked
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="deadline" className="block text-sm font-medium text-slate-700 mb-1">
                                    Deadline <span className="text-slate-400 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="date"
                                    name="deadline"
                                    id="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label htmlFor="required_skills" className="block text-sm font-medium text-slate-700 mb-1">Required Skills</label>
                                <input
                                    type="text"
                                    name="required_skills"
                                    id="required_skills"
                                    value={formData.required_skills}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g. React, Node.js, Design (comma separated)"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Gig Image</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors bg-slate-50">
                                    {imagePreview ? (
                                        <div className="relative w-full">
                                            <img src={imagePreview} alt="Preview" className="h-48 w-full object-cover rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-slate-400" />
                                            <div className="flex text-sm text-slate-600 justify-center">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                                    <span>Upload a file</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3: Contact & Location */}
                <div className="glass-panel p-8 rounded-2xl">
                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                        Contact & Location
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label htmlFor="mobile_number" className="block text-sm font-medium text-slate-700 mb-1">
                                Mobile Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                name="mobile_number"
                                id="mobile_number"
                                required
                                value={formData.mobile_number}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="+91 98765 43210"
                            />
                            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Visible only to subscribed workers
                            </p>
                        </div>

                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-slate-700 mb-1">Location</label>

                            <LocationInput
                                value={formData.location}
                                disabled={formData.is_remote}
                                onChange={(val) => setFormData(prev => ({ ...prev, location: val }))}
                                onLocationSelect={(data) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        location: data.address,
                                        latitude: data.lat,
                                        longitude: data.lng
                                    }))
                                }}
                            />

                            <div className="mt-4 flex items-center">
                                <input
                                    id="is_remote"
                                    name="is_remote"
                                    type="checkbox"
                                    checked={formData.is_remote}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                                />
                                <label htmlFor="is_remote" className="ml-2 block text-sm text-slate-900">
                                    This is a remote position
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 pb-12">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center gap-2 px-8 py-3 text-lg shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-1 transition-all"
                    >
                        <PlusCircle className="h-6 w-6" />
                        {loading ? 'Publishing...' : 'Publish Gig'}
                    </button>
                </div>
            </form>
        </div>
    )
}
