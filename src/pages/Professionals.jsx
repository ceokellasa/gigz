import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, MapPin, Star, Briefcase, DollarSign, User, Filter, Share2, Sparkles, ArrowRight } from 'lucide-react'
import { useToast } from '../components/Toast'

export default function Professionals() {
    const [professionals, setProfessionals] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedProfession, setSelectedProfession] = useState('All')
    const [priceRange, setPriceRange] = useState('all')
    const toast = useToast()

    const professions = [
        'All', 'Lawyer', 'Plumber', 'Electrician', 'Carpenter', 'Designer',
        'Developer', 'Photographer', 'Videographer', 'Tutor', 'Consultant',
        'Accountant', 'Mechanic', 'Chef', 'Cleaner', 'Other'
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
            toast.error('Failed to load professionals')
        } finally {
            setLoading(false)
        }
    }

    const handleShare = async (e, prof) => {
        e.preventDefault() // Prevent navigation to details page
        e.stopPropagation()

        const shareData = {
            title: `Check out ${prof.profiles?.full_name} on Kellasa`,
            text: `I found this professional on Kellasa: ${prof.profession}`,
            url: `${window.location.origin}/professionals/${prof.id}`
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(shareData.url)
                toast.success('Link copied to clipboard!')
            }
        } catch (err) {
            console.error('Error sharing:', err)
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
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative bg-slate-900 pb-24 pt-16 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 to-slate-900" />
                    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6 backdrop-blur-sm">
                        <Sparkles className="h-4 w-4" />
                        <span>Discover Top Talent</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
                        Find the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">professional</span>
                    </h1>

                    <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
                        Connect with skilled experts for any job. From home repairs to creative projects, we have got you covered.
                    </p>

                    <Link
                        to="/professionals/create"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:bg-indigo-50 transition-all hover:scale-105 shadow-lg shadow-indigo-500/20 group"
                    >
                        <User className="h-5 w-5 text-indigo-600" />
                        <span>Create Your Profile</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-20">
                {/* Search & Filters */}
                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 mb-12 border border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Search */}
                        <div className="md:col-span-5 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by vibe, skill, or name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Profession Filter */}
                        <div className="md:col-span-4 relative">
                            <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select
                                value={selectedProfession}
                                onChange={(e) => setSelectedProfession(e.target.value)}
                                className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                {professions.map(prof => (
                                    <option key={prof} value={prof}>{prof}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div className="md:col-span-3 relative">
                            <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none cursor-pointer hover:bg-slate-100 transition-colors"
                            >
                                <option value="all">Any Price</option>
                                <option value="low">Under ₹500/hr</option>
                                <option value="medium">₹500 - ₹1500/hr</option>
                                <option value="high">₹1500+/hr</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-xl font-bold text-slate-900">
                        Top Professionals
                        <span className="ml-3 text-sm font-normal text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                            {filteredProfessionals.length} results
                        </span>
                    </h2>
                </div>

                {/* Professionals Grid */}
                {filteredProfessionals.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="h-10 w-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No matches found</h3>
                        <p className="text-slate-500 max-w-md mx-auto">
                            We couldn't find any professionals matching your criteria. Try adjusting your filters or search terms.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProfessionals.map((prof) => (
                            <Link
                                key={prof.id}
                                to={`/professionals/${prof.id}`}
                                className="group bg-white rounded-3xl p-6 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 border border-slate-100 relative overflow-hidden flex flex-col h-full"
                            >
                                {/* Hover Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Header: Avatar & Share */}
                                <div className="relative flex justify-between items-start mb-6">
                                    <div className="relative">
                                        {prof.profiles?.avatar_url ? (
                                            <img
                                                src={prof.profiles.avatar_url}
                                                alt={prof.profiles.full_name}
                                                className="h-20 w-20 rounded-2xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-2xl font-bold text-indigo-600 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                {prof.profiles?.full_name?.[0] || 'U'}
                                            </div>
                                        )}
                                        {prof.available && (
                                            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full z-10" title="Available now" />
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => handleShare(e, prof)}
                                        className="p-2 rounded-full text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                        title="Share Profile"
                                    >
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="relative flex-1">
                                    <h3 className="font-bold text-xl text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                        {prof.profiles?.full_name || 'Professional'}
                                    </h3>
                                    <p className="text-indigo-600 font-medium mb-4 flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {prof.profession}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mb-5 text-sm text-slate-500">
                                        {prof.years_of_experience && (
                                            <div className="bg-slate-50 px-3 py-1 rounded-lg">
                                                <span className="font-semibold text-slate-900">{prof.years_of_experience}y</span> exp
                                            </div>
                                        )}
                                        {prof.location && (
                                            <div className="flex items-center gap-1 truncate max-w-[120px]">
                                                <MapPin className="h-3.5 w-3.5" />
                                                <span className="truncate">{prof.location}</span>
                                            </div>
                                        )}
                                    </div>

                                    {prof.bio && (
                                        <p className="text-slate-600 text-sm mb-6 line-clamp-2 leading-relaxed">
                                            {prof.bio}
                                        </p>
                                    )}

                                    {/* Skills */}
                                    {prof.skills && prof.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {prof.skills.slice(0, 3).map((skill, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                            {prof.skills.length > 3 && (
                                                <span className="px-2 py-1 text-slate-400 text-xs">
                                                    +{prof.skills.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Footer: Rate & Action */}
                                <div className="relative pt-6 mt-auto border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        {prof.hourly_rate ? (
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Rate</span>
                                                <span className="text-lg font-bold text-slate-900">₹{prof.hourly_rate}<span className="text-sm text-slate-400 font-normal">/hr</span></span>
                                            </div>
                                        ) : (
                                            <span className="text-sm font-medium text-slate-500">Contact for price</span>
                                        )}
                                    </div>

                                    <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20">
                                        <ArrowRight className="h-5 w-5 -ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
