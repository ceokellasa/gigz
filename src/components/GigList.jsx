import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { MapPin, Globe } from 'lucide-react'
import { CategoryIcon } from './CategoryIcon'

export default function GigList({ limit = 6 }) {
    const [gigs, setGigs] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchGigs()
    }, [limit])

    const fetchGigs = async () => {
        try {
            const { data, error } = await supabase
                .from('gigs')
                .select('*, profiles:client_id(full_name, avatar_url)')
                .eq('status', 'open')
                .order('created_at', { ascending: false })
                .limit(limit)

            if (error) throw error
            setGigs(data)
        } catch (error) {
            console.error('Error fetching gigs:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
                {[...Array(limit)].map((_, i) => (
                    <div key={i} className="glass-card h-96 animate-pulse bg-slate-100"></div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {gigs.map((gig) => (
                <div key={gig.id} className="glass-card flex flex-col h-full group">
                    <div className="h-48 w-full overflow-hidden rounded-t-xl relative bg-slate-100 flex items-center justify-center">
                        {gig.image_url ? (
                            <>
                                <img src={gig.image_url} alt={gig.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </>
                        ) : (
                            <div className="text-slate-300 group-hover:text-indigo-500 transition-colors duration-300">
                                <CategoryIcon category={gig.category} className="h-16 w-16" />
                            </div>
                        )}
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {gig.category}
                            </span>
                            {gig.is_remote && (
                                <span className="inline-flex items-center text-xs text-green-600 font-medium">
                                    <Globe className="h-3 w-3 mr-1" />
                                    Remote
                                </span>
                            )}
                        </div>

                        <Link to={`/gigs/${gig.id}`} className="block group-hover:text-indigo-600 transition-colors">
                            <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-1">{gig.title}</h3>
                        </Link>

                        <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                            {gig.description}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                            <div className="flex items-center">
                                {gig.profiles?.avatar_url ? (
                                    <img className="h-8 w-8 rounded-full" src={gig.profiles.avatar_url} alt="" />
                                ) : (
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                                        {gig.profiles?.full_name?.[0] || 'C'}
                                    </div>
                                )}
                                <span className="ml-2 text-sm text-slate-600 truncate max-w-[100px]">
                                    {gig.profiles?.full_name || 'Client'}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-slate-900">₹{gig.budget}</p>
                                <p className="text-xs text-slate-500">Fixed Price</p>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
