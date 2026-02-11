/**
 * Professionals Page
 * Displays a searchable and filterable list of all professionals on the platform.
 * Users can filter by profession, price range, and search by name/skills.
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, MapPin, Star, Briefcase, DollarSign, User, Filter, Share2, Sparkles, ArrowRight, List, Map } from 'lucide-react'
import { useToast } from '../components/Toast'
import { ProfessionalsPageSkeleton } from '../components/Skeleton'
import ProfessionalsMap from '../components/ProfessionalsMap'

export default function Professionals() {
    // State for storing the list of professionals and UI states
    const [professionals, setProfessionals] = useState([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState('list') // 'list' or 'map'

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedProfession, setSelectedProfession] = useState('All')
    const [priceRange, setPriceRange] = useState('all')
    const toast = useToast()

    // Predefined list of professions for the dropdown filter
    const professions = [
        'All', 'Lawyer', 'Plumber', 'Electrician', 'Carpenter', 'Designer',
        'Developer', 'Photographer', 'Videographer', 'Tutor', 'Consultant',
        'Accountant', 'Mechanic', 'Chef', 'Cleaner', 'Other'
    ]

    useEffect(() => {
        fetchProfessionals()
    }, [])

    /**
     * Fetches all visible professionals from Supabase.
     */
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

            // Mock random coordinates for demo purposes if they are missing
            // remove this in prod when real data is populated via geocoding
            const professionalsWithCoords = (data || []).map(p => ({
                ...p,
                // If lat/lng missing, assign random around Bangalore (12.9716, 77.5946) +/- 0.05
                latitude: p.latitude || (12.9716 + (Math.random() - 0.5) * 0.1),
                longitude: p.longitude || (77.5946 + (Math.random() - 0.5) * 0.1)
            }))

            setProfessionals(professionalsWithCoords)
        } catch (error) {
            console.error('Error fetching professionals:', error)
            toast.error('Failed to load professionals')
        } finally {
            setLoading(false)
        }
    }

    /**
     * Handles sharing a professional's profile.
     */
    const handleShare = async (e, prof) => {
        e.preventDefault()
        e.stopPropagation()

        const shareData = {
            title: `Check out ${prof.profiles?.full_name} on Kellasa`,
            text: `I found this professional on Kellasa: ${prof.profession}`,
            url: `${window.location.origin}/professionals/${prof.user_id}`
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

    /**
     * Filters the professionals list
     */
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
        return <ProfessionalsPageSkeleton />
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Clean Light Hero Section */}
            <div className="relative pt-24 pb-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FACC15]/20 text-slate-900 text-sm font-bold mb-8">
                        <Sparkles className="h-4 w-4 fill-slate-900" />
                        <span>Discover Top Talent</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 tracking-tighter">
                        Find the perfect <br />
                        <span className="relative inline-block">
                            professional
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FACC15]" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">
                        Connect with skilled experts for any job. From home repairs to creative projects, we've got you covered.
                    </p>

                    <div className="flex justify-center gap-4">
                        <Link to="/professionals/create" className="btn-primary">
                            Create Profile
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                {/* Floating Filter Bar */}
                <div className="bg-white rounded-[2rem] shadow-floating p-4 mb-8 border border-slate-100 mx-2 transition-all duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        {/* Search */}
                        <div className="md:col-span-5 relative">
                            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by name, vibe, or skill..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-black transition-all font-medium placeholder-slate-400"
                            />
                        </div>

                        {/* Profession Filter */}
                        <div className="md:col-span-4 relative">
                            <Briefcase className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select
                                value={selectedProfession}
                                onChange={(e) => setSelectedProfession(e.target.value)}
                                className="w-full pl-14 pr-10 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-black appearance-none cursor-pointer font-medium text-slate-700"
                            >
                                {professions.map(prof => (
                                    <option key={prof} value={prof}>{prof}</option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <Filter className="h-4 w-4 text-slate-400" />
                            </div>
                        </div>

                        {/* Price Range Filter */}
                        <div className="md:col-span-3 relative">
                            <DollarSign className="absolute left-6 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full pl-14 pr-10 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-black appearance-none cursor-pointer font-medium text-slate-700"
                            >
                                <option value="all">Any Price</option>
                                <option value="low">Under ₹500/hr</option>
                                <option value="medium">₹500 - ₹1500/hr</option>
                                <option value="high">₹1500+/hr</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* View Toggle & Results Count */}
                <div className="flex items-center justify-between mb-8 px-4">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
                        Top Professionals
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-black' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('map')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-black' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Map className="h-5 w-5" />
                            </button>
                        </div>
                    </h2>
                    <span className="text-sm font-bold text-slate-900 bg-[#FACC15] px-4 py-2 rounded-full shadow-sm">
                        {filteredProfessionals.length} results
                    </span>
                </div>

                {viewMode === 'map' ? (
                    <ProfessionalsMap professionals={filteredProfessionals} />
                ) : (
                    /* Professionals Grid - Clean White Cards */
                    filteredProfessionals.length === 0 ? (
                        <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <Search className="h-10 w-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No professionals found</h3>
                            <p className="text-slate-500">Try adjusting your filters for better results.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProfessionals.map((prof) => (
                                <Link
                                    key={prof.id}
                                    to={`/professionals/${prof.user_id}`}
                                    className="group relative bg-white rounded-[2.5rem] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-floating border border-slate-100"
                                >
                                    {/* Header: Avatar */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="relative">
                                            {prof.profiles?.avatar_url ? (
                                                <img
                                                    src={prof.profiles.avatar_url}
                                                    alt={prof.profiles.full_name}
                                                    className="h-24 w-24 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="h-24 w-24 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-900 shadow-sm group-hover:scale-105 transition-transform duration-300">
                                                    {prof.profiles?.full_name?.[0] || 'U'}
                                                </div>
                                            )}
                                            {prof.available && (
                                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full border-4 border-white">
                                                    OPEN
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => handleShare(e, prof)}
                                            className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-black hover:text-white transition-all duration-300"
                                        >
                                            <Share2 className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* Content */}
                                    <div className="mb-6">
                                        <h3 className="font-bold text-2xl text-slate-900 mb-1 leading-tight group-hover:text-black transition-colors">
                                            {prof.profiles?.full_name || 'Professional'}
                                        </h3>
                                        <p className="text-slate-500 font-medium text-lg mb-4">
                                            {prof.profession}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {prof.location && (
                                                <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-slate-50 text-slate-600">
                                                    <MapPin className="h-3 w-3 mr-1" />
                                                    {prof.location}
                                                </span>
                                            )}
                                            {prof.years_of_experience && (
                                                <span className="inline-flex items-center text-xs font-bold px-3 py-1 rounded-full bg-slate-50 text-slate-600">
                                                    <Star className="h-3 w-3 mr-1" />
                                                    {prof.years_of_experience}y Exp
                                                </span>
                                            )}
                                        </div>

                                        {prof.bio && (
                                            <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                                {prof.bio}
                                            </p>
                                        )}
                                    </div>

                                    {/* Clean Divider */}
                                    <div className="h-px bg-slate-100 my-6" />

                                    {/* Footer & Price */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Rate</p>
                                            <p className="text-xl font-bold text-slate-900">
                                                {prof.hourly_rate ? `₹${prof.hourly_rate}` : 'Varied'}
                                                <span className="text-sm font-normal text-slate-400 ml-1">/hr</span>
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-[#FACC15] group-hover:text-black transition-all duration-300 shadow-lg shadow-slate-200">
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    )
}


