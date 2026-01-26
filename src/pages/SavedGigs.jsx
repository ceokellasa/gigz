import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Heart, Briefcase, Globe, Trash2, IndianRupee, Clock } from 'lucide-react'
import { CategoryIcon } from '../components/CategoryIcon'

export default function SavedGigs() {
    const { user } = useAuth()
    const [savedGigs, setSavedGigs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (user) {
            fetchSavedGigs()
        }
    }, [user])

    const fetchSavedGigs = async () => {
        try {
            const { data, error } = await supabase
                .from('saved_gigs')
                .select(`
                    id,
                    gig_id,
                    created_at,
                    gigs (
                        id,
                        title,
                        description,
                        category,
                        budget,
                        budget_type,
                        is_remote,
                        location,
                        image_url,
                        status,
                        profiles:client_id (full_name, avatar_url)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setSavedGigs(data.filter(s => s.gigs)) // Filter out any with deleted gigs
        } catch (error) {
            console.error('Error fetching saved gigs:', error)
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    const removeSavedGig = async (savedId) => {
        try {
            await supabase
                .from('saved_gigs')
                .delete()
                .eq('id', savedId)

            setSavedGigs(savedGigs.filter(s => s.id !== savedId))
        } catch (error) {
            console.error('Error removing saved gig:', error)
        }
    }

    if (!user) {
        return (
            <div className="max-w-md mx-auto px-4 py-12 text-center">
                <Heart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Saved Gigs</h2>
                <p className="text-slate-500 mb-6">Sign in to save gigs and access them later.</p>
                <Link to="/login" className="btn-primary">Sign In</Link>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="pb-6">
                <h2 className="text-3xl font-bold leading-7 text-slate-900 flex items-center gap-3">
                    <Heart className="h-8 w-8 text-red-500 fill-current" />
                    Saved Gigs
                </h2>
                <p className="mt-2 text-slate-500">Gigs you've bookmarked for later.</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                    Error loading saved gigs: {error.message}
                </div>
            )}

            {loading ? (
                <div className="mt-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-slate-500">Loading saved gigs...</p>
                </div>
            ) : savedGigs.length === 0 ? (
                <div className="text-center py-16">
                    <Heart className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No saved gigs yet</h3>
                    <p className="text-slate-500 mb-6">Browse gigs and tap the heart icon to save them.</p>
                    <Link to="/gigs" className="btn-primary">Browse Gigs</Link>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {savedGigs.map((saved) => {
                        const gig = saved.gigs
                        return (
                            <div key={saved.id} className="glass-card flex flex-col h-full group relative">
                                {/* Remove Button */}
                                <button
                                    onClick={() => removeSavedGig(saved.id)}
                                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:bg-white transition-all"
                                    title="Remove from saved"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>

                                {/* Status Badge */}
                                {gig.status !== 'open' && (
                                    <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-slate-900/80 text-white text-xs font-medium">
                                        {gig.status === 'in_progress' ? 'In Progress' : 'Closed'}
                                    </div>
                                )}

                                <Link to={`/gigs/${gig.id}`} className="flex flex-col h-full">
                                    <div className="h-40 w-full overflow-hidden rounded-t-xl relative bg-slate-100 flex items-center justify-center">
                                        {gig.image_url ? (
                                            <img src={gig.image_url} alt={gig.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <CategoryIcon category={gig.category} className="h-14 w-14 text-slate-300" />
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
                                                    {gig.budget_type === 'hourly' && <span className="text-sm font-normal text-slate-500">/hr</span>}
                                                </p>
                                                <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
                                                    {gig.budget_type === 'hourly' ? (
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
                        )
                    })}
                </div>
            )}
        </div>
    )
}
