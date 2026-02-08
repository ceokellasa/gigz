import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { Search, MapPin, Briefcase, Globe, Heart, SlidersHorizontal, X, Clock, IndianRupee, Phone, Lock, Shield } from 'lucide-react'
import { CategoryIcon } from '../../components/CategoryIcon'
import clsx from 'clsx'

const CATEGORIES = [
    'All', 'Tech', 'Design', 'Cleaning', 'Delivery', 'Cooking', 'Tutoring',
    'Beauty', 'Repair', 'Photography', 'Driving', 'Moving', 'HomeService',
    'Writing', 'Marketing', 'Video', 'Other'
]

export default function GigFeed() {
    const { user, profile } = useAuth()
    const isSubscribed = profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()
    const [gigs, setGigs] = useState([])
    const [savedGigs, setSavedGigs] = useState([])
    const [loading, setLoading] = useState(true)
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        search: '',
        category: 'All',
        location: '',
        budgetType: 'all', // all, fixed, hourly
        minBudget: '',
        maxBudget: '',
        remoteOnly: false,
        nearMe: false
    })
    const [userLoc, setUserLoc] = useState(null)

    useEffect(() => {
        fetchGigs()
        if (user) {
            fetchSavedGigs()
        }
    }, [user, filters.nearMe]) // Re-fetch when nearMe toggles

    const requestLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLoc({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    })
                    setFilters(prev => ({ ...prev, nearMe: true }))
                },
                (error) => {
                    console.error('Error getting location:', error)
                    alert('Could not get your location. Please enable location services.')
                    setFilters(prev => ({ ...prev, nearMe: false }))
                }
            )
        } else {
            alert('Geolocation is not supported by this browser.')
        }
    }

    const fetchGigs = async () => {
        setLoading(true)
        try {
            let data = []

            if (filters.nearMe && userLoc) {
                // Use RPC for geospatial search
                const { data: nearbyData, error } = await supabase
                    .rpc('get_nearby_gigs', {
                        user_lat: userLoc.lat,
                        user_lng: userLoc.lng,
                        radius_km: 50 // Default 50km radius
                    })

                if (error) throw error
                data = nearbyData || []

                // Need to transform data structure slightly to match standard format if RPC returns different shape
                // But our RPC returns almost same shape, just flattened client info
                // We map it to restore the nested profiles object for UI compatibility
                data = data.map(g => ({
                    ...g,
                    profiles: {
                        full_name: g.client_full_name,
                        avatar_url: g.client_avatar_url
                    }
                }))

            } else {
                // Standard Query
                let query = supabase
                    .from('gigs')
                    .select('*, mobile_number, profiles:client_id(full_name, avatar_url)')
                    .eq('status', 'open')
                    .order('created_at', { ascending: false })

                const { data: standardData, error } = await query
                if (error) throw error
                data = standardData || []
            }

            setGigs(data)
        } catch (error) {
            console.error('Error fetching gigs:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSavedGigs = async () => {
        try {
            const { data, error } = await supabase
                .from('saved_gigs')
                .select('gig_id')
                .eq('user_id', user.id)

            if (error) throw error
            setSavedGigs(data.map(s => s.gig_id))
        } catch (error) {
            console.error('Error fetching saved gigs:', error)
        }
    }

    const toggleSaveGig = async (gigId) => {
        if (!user) return

        const isSaved = savedGigs.includes(gigId)

        try {
            if (isSaved) {
                await supabase
                    .from('saved_gigs')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('gig_id', gigId)
                setSavedGigs(savedGigs.filter(id => id !== gigId))
            } else {
                await supabase
                    .from('saved_gigs')
                    .insert({ user_id: user.id, gig_id: gigId })
                setSavedGigs([...savedGigs, gigId])
            }
        } catch (error) {
            console.error('Error toggling save:', error)
        }
    }

    const filteredGigs = gigs.filter((gig) => {
        // If searching nearby, we already filtered by location/status in RPC
        // But we still apply client-side filters for text, category, etc.

        const matchesSearch = gig.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            gig.description.toLowerCase().includes(filters.search.toLowerCase())

        const matchesCategory = filters.category === 'All' || gig.category === filters.category

        const matchesLocation = filters.location === '' ||
            (gig.is_remote && filters.location.toLowerCase() === 'remote') ||
            (gig.location && gig.location.toLowerCase().includes(filters.location.toLowerCase()))

        const matchesBudgetType = filters.budgetType === 'all' ||
            (gig.budget_type || 'fixed') === filters.budgetType

        // Helper to parse budget
        const getBudgetAmount = (val) => {
            if (typeof val === 'number') return val
            if (!val) return 0
            if (val.toString().includes('-')) {
                const part = val.split('-')[0].trim()
                return parseFloat(part) || 0
            }
            const parsed = parseFloat(val)
            return isNaN(parsed) ? 0 : parsed
        }
        const gigBudget = getBudgetAmount(gig.budget)

        const matchesMinBudget = filters.minBudget === '' || gigBudget >= parseFloat(filters.minBudget)
        const matchesMaxBudget = filters.maxBudget === '' || gigBudget <= parseFloat(filters.maxBudget)

        const matchesRemote = !filters.remoteOnly || gig.is_remote

        // If nearMe is on, we exclude remote gigs usually, but RPC handles that. 
        // Just standard filter checks here.

        return matchesSearch && matchesCategory && matchesLocation &&
            matchesBudgetType && matchesMinBudget && matchesMaxBudget && matchesRemote
    })

    const handleFilterChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
        setFilters({ ...filters, [e.target.name]: value })
    }

    const clearFilters = () => {
        setFilters({
            search: '',
            category: 'All',
            location: '',
            budgetType: 'all',
            minBudget: '',
            maxBudget: '',
            remoteOnly: false,
            nearMe: false
        })
    }

    const activeFilterCount = [
        filters.category !== 'All',
        filters.location !== '',
        filters.budgetType !== 'all',
        filters.minBudget !== '',
        filters.maxBudget !== '',
        filters.remoteOnly,
        filters.nearMe
    ].filter(Boolean).length

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="pb-6">
                <h2 className="text-3xl font-bold leading-7 text-slate-900">
                    Find Your Next Gig
                </h2>
                <p className="mt-2 text-slate-500">Browse opportunities and find the perfect match.</p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        name="search"
                        className="input-field pl-12 py-4 text-lg"
                        placeholder="Search gigs..."
                        value={filters.search}
                        onChange={handleFilterChange}
                    />
                </div>
                <button
                    onClick={filters.nearMe ? () => setFilters(p => ({ ...p, nearMe: false })) : requestLocation}
                    className={clsx(
                        'flex items-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all',
                        filters.nearMe
                            ? 'bg-green-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                >
                    <MapPin className={clsx("h-5 w-5", filters.nearMe && "animate-bounce")} />
                    <span className="hidden sm:inline">{filters.nearMe ? 'Nearby Active' : 'Near Me'}</span>
                </button>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={clsx(
                        'flex items-center gap-2 px-6 py-4 rounded-2xl font-medium transition-all',
                        showFilters || activeFilterCount > 0
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    )}
                >
                    <SlidersHorizontal className="h-5 w-5" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-0.5 rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="glass-panel p-6 rounded-2xl mb-6 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-slate-900">Filters</h3>
                        <button onClick={clearFilters} className="text-sm text-indigo-600 hover:text-indigo-700">
                            Clear all
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                            <select
                                name="category"
                                className="input-field"
                                value={filters.category}
                                onChange={handleFilterChange}
                            >
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                <input
                                    type="text"
                                    name="location"
                                    className="input-field pl-10"
                                    placeholder="City or 'Remote'"
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>

                        {/* Budget Type */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Payment Type</label>
                            <select
                                name="budgetType"
                                className="input-field"
                                value={filters.budgetType}
                                onChange={handleFilterChange}
                            >
                                <option value="all">All Types</option>
                                <option value="fixed">Fixed Price</option>
                                <option value="hourly">Hourly Rate</option>
                            </select>
                        </div>

                        {/* Budget Range */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Budget Range (₹)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    name="minBudget"
                                    className="input-field w-1/2"
                                    placeholder="Min"
                                    value={filters.minBudget}
                                    onChange={handleFilterChange}
                                />
                                <input
                                    type="number"
                                    name="maxBudget"
                                    className="input-field w-1/2"
                                    placeholder="Max"
                                    value={filters.maxBudget}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Remote Toggle */}
                    <div className="mt-4 flex items-center">
                        <input
                            type="checkbox"
                            id="remoteOnly"
                            name="remoteOnly"
                            checked={filters.remoteOnly}
                            onChange={handleFilterChange}
                            className="h-4 w-4 text-indigo-600 border-slate-300 rounded"
                        />
                        <label htmlFor="remoteOnly" className="ml-2 text-sm text-slate-700">
                            Remote only
                        </label>
                    </div>
                </div>
            )}

            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-500">
                    Showing <span className="font-semibold text-slate-900">{filteredGigs.length}</span> gigs
                </p>
            </div>

            {loading ? (
                <div className="mt-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading gigs...</p>
                </div>
            ) : filteredGigs.length === 0 ? (
                <div className="text-center py-16">
                    <Briefcase className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No gigs found</h3>
                    <p className="text-slate-500">Try adjusting your filters or search terms.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredGigs.map((gig) => (
                        <div key={gig.id} className="glass-card flex flex-col h-full group relative">
                            {/* Save Button */}
                            {user && (
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        toggleSaveGig(gig.id)
                                    }}
                                    className={clsx(
                                        'absolute top-4 right-4 z-10 p-2 rounded-full transition-all',
                                        savedGigs.includes(gig.id)
                                            ? 'bg-red-500 text-white'
                                            : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-white'
                                    )}
                                >
                                    <Heart className={clsx('h-5 w-5', savedGigs.includes(gig.id) && 'fill-current')} />
                                </button>
                            )}

                            <Link to={`/gigs/${gig.id}`} className="flex flex-col h-full">
                                <div className="h-40 w-full overflow-hidden rounded-t-xl relative bg-slate-100 flex items-center justify-center">
                                    {gig.image_url ? (
                                        <>
                                            <img src={gig.image_url} alt={gig.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </>
                                    ) : (
                                        <div className="text-slate-300 group-hover:text-indigo-500 transition-colors duration-300">
                                            <CategoryIcon category={gig.category} className="h-14 w-14" />
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                            {gig.category}
                                        </span>
                                        {gig.is_remote && (
                                            <span className="inline-flex items-center text-xs text-green-600 font-medium">
                                                <Globe className="h-3 w-3 mr-1" />
                                                Remote
                                            </span>
                                        )}
                                        {gig.dist_km && (
                                            <span className="inline-flex items-center text-xs text-indigo-600 font-medium ml-2">
                                                <MapPin className="h-3 w-3 mr-1" />
                                                {gig.dist_km.toFixed(1)} km away
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {gig.title}
                                    </h3>

                                    <p className="text-slate-600 text-sm line-clamp-2 mb-4 flex-1">
                                        {gig.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center">
                                            {gig.profiles?.avatar_url ? (
                                                <img src={gig.profiles.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                                            ) : (
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                                                    {gig.profiles?.full_name?.[0] || 'C'}
                                                </div>
                                            )}
                                            <span className="ml-2 text-sm text-slate-600 truncate max-w-[100px]">
                                                {gig.profiles?.full_name || 'Client'}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-slate-900 flex items-center justify-end">
                                                <IndianRupee className="h-4 w-4" />
                                                {gig.budget}
                                                {(gig.budget_type === 'hourly') && <span className="text-sm font-normal text-slate-500">/hr</span>}
                                            </p>
                                            <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
                                                {(gig.budget_type === 'hourly') ? (
                                                    <><Clock className="h-3 w-3" /> Hourly</>
                                                ) : (
                                                    'Fixed'
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
