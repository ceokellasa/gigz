import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, MapPin, Star, Briefcase, DollarSign, User, Filter } from 'lucide-react'

export default function Professionals() {
    const [professionals, setProfessionals] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedProfession, setSelectedProfession] = useState('All')
    const [priceRange, setPriceRange] = useState('all')

    const professions = [
        'All',
        'Lawyer',
        'Plumber',
        'Electrician',
        'Carpenter',
        'Designer',
        'Developer',
        'Photographer',
        'Videographer',
        'Tutor',
        'Consultant',
        'Accountant',
        'Mechanic',
        'Chef',
        'Cleaner',
        'Other'
    ]

    useEffect(() => {
        fetchProfessionals()
    }, [])

    const fetchProfessionals = async () => {
        try {
            const { data, error } = await supabase
                .from('professional_profiles')
                .select(`
                    *,
                    profiles:user_id (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('available', true)
                .order('created_at', { ascending: false })

            if (error) throw error
            setProfessionals(data || [])
        } catch (error) {
            console.error('Error fetching professionals:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredProfessionals = professionals.filter(prof => {
        const matchesSearch =
            prof.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prof.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prof.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesProfession = selectedProfession === 'All' || prof.profession === selectedProfession

        const matchesPrice = priceRange === 'all' ||
            (priceRange === 'low' && prof.hourly_rate <= 500) ||
            (priceRange === 'medium' && prof.hourly_rate > 500 && prof.hourly_rate <= 1500) ||
            (priceRange === 'high' && prof.hourly_rate > 1500)

        return matchesSearch && matchesProfession && matchesPrice
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-2">Find Professionals</h1>
                        <p className="text-slate-600">Browse skilled professionals for your needs</p>
                    </div>
                    <Link
                        to="/professionals/create"
                        className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                        <User className="h-5 w-5 relative z-10" />
                        <span className="relative z-10">Create Your Profile</span>
                    </Link>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by profession, skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {/* Profession Filter */}
                    <select
                        value={selectedProfession}
                        onChange={(e) => setSelectedProfession(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        {professions.map(prof => (
                            <option key={prof} value={prof}>{prof}</option>
                        ))}
                    </select>

                    {/* Price Range Filter */}
                    <select
                        value={priceRange}
                        onChange={(e) => setPriceRange(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="all">All Prices</option>
                        <option value="low">₹0 - ₹500/hr</option>
                        <option value="medium">₹500 - ₹1500/hr</option>
                        <option value="high">₹1500+/hr</option>
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-slate-600">
                    {filteredProfessionals.length} professional{filteredProfessionals.length !== 1 ? 's' : ''} found
                </p>
            </div>

            {/* Professionals Grid */}
            {filteredProfessionals.length === 0 ? (
                <div className="text-center py-12">
                    <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No professionals found</h3>
                    <p className="text-slate-600">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProfessionals.map((prof) => (
                        <Link
                            key={prof.id}
                            to={`/professionals/${prof.id}`}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                        >
                            {/* Avatar & Name */}
                            <div className="flex items-center gap-4 mb-4">
                                {prof.profiles?.avatar_url ? (
                                    <img
                                        src={prof.profiles.avatar_url}
                                        alt={prof.profiles.full_name}
                                        className="h-16 w-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                                        {prof.profiles?.full_name?.[0] || 'U'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{prof.profiles?.full_name || 'Professional'}</h3>
                                    <p className="text-indigo-600 font-medium">{prof.profession}</p>
                                </div>
                            </div>

                            {/* Bio */}
                            {prof.bio && (
                                <p className="text-slate-600 text-sm mb-4 line-clamp-2">{prof.bio}</p>
                            )}

                            {/* Experience & Location */}
                            <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                                {prof.years_of_experience && (
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        <span>{prof.years_of_experience} yrs</span>
                                    </div>
                                )}
                                {prof.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>{prof.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Skills */}
                            {prof.skills && prof.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {prof.skills.slice(0, 3).map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {prof.skills.length > 3 && (
                                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                            +{prof.skills.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Pricing */}
                            {prof.hourly_rate && (
                                <div className="flex items-center gap-2 text-green-600 font-semibold">
                                    <DollarSign className="h-4 w-4" />
                                    <span>₹{prof.hourly_rate}/hr</span>
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
