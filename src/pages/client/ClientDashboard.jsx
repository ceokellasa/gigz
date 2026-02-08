import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { PlusCircle, Briefcase, Eye, Users, CheckCircle, Clock, TrendingUp, IndianRupee } from 'lucide-react'
import clsx from 'clsx'

export default function ClientDashboard() {
    const { user, profile, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [gigs, setGigs] = useState([])
    const [stats, setStats] = useState({
        totalGigs: 0,
        openGigs: 0,
        completedGigs: 0,
        totalViews: 0,
        totalApplications: 0,
        totalBudget: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate('/login')
            } else {
                fetchGigs()
            }
        }
    }, [user, authLoading, navigate])

    const fetchGigs = async () => {
        try {
            const { data, error } = await supabase
                .from('gigs')
                .select('*, applications(count)')
                .eq('client_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setGigs(data)

            // Calculate stats
            const totalGigs = data.length
            const openGigs = data.filter(g => g.status === 'open').length
            const completedGigs = data.filter(g => g.status === 'completed').length
            const totalViews = data.reduce((sum, g) => sum + (g.views || 0), 0)
            const totalApplications = data.reduce((sum, g) => sum + (g.applications?.[0]?.count || 0), 0)
            const totalBudget = data.reduce((sum, g) => sum + (g.budget || 0), 0)

            setStats({ totalGigs, openGigs, completedGigs, totalViews, totalApplications, totalBudget })
        } catch (error) {
            console.error('Error fetching gigs:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-green-100 text-green-800'
            case 'in_progress': return 'bg-blue-100 text-blue-800'
            case 'under_review': return 'bg-yellow-100 text-yellow-800'
            case 'completed': return 'bg-slate-100 text-slate-800'
            default: return 'bg-slate-100 text-slate-800'
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    )

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
                    </h1>
                    <p className="text-slate-500 mt-1">Here's an overview of your gigs</p>
                </div>
                <Link to="/post-gig" className="btn-primary flex items-center gap-2">
                    <PlusCircle className="h-5 w-5" />
                    Post New Gig
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <Briefcase className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalGigs}</p>
                            <p className="text-xs text-slate-500">Total Gigs</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Clock className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.openGigs}</p>
                            <p className="text-xs text-slate-500">Active</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.completedGigs}</p>
                            <p className="text-xs text-slate-500">Completed</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Eye className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalViews}</p>
                            <p className="text-xs text-slate-500">Views</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Users className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{stats.totalApplications}</p>
                            <p className="text-xs text-slate-500">Applications</p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <IndianRupee className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">₹{stats.totalBudget.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Total Budget</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gigs List */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Your Gigs</h2>
            </div>

            {gigs.length === 0 ? (
                <div className="text-center py-12 glass-panel rounded-2xl">
                    <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No gigs posted yet</h3>
                    <p className="mt-1 text-slate-500 mb-6">Get started by creating your first gig.</p>
                    <Link to="/post-gig" className="btn-primary">Post Your First Gig</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {gigs.map((gig) => (
                        <div key={gig.id} className="glass-panel p-5 rounded-xl hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-bold text-slate-900">
                                            <Link to={`/gigs/${gig.id}`} className="hover:text-indigo-600 transition-colors">
                                                {gig.title}
                                            </Link>
                                        </h3>
                                        <span className={clsx(
                                            'px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
                                            getStatusColor(gig.status)
                                        )}>
                                            {gig.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <IndianRupee className="h-4 w-4" />
                                            {gig.budget}{gig.budget_type === 'hourly' && '/hr'}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Eye className="h-4 w-4" />
                                            {gig.views || 0} views
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {gig.applications?.[0]?.count || 0} applications
                                        </span>
                                        <span className="text-slate-400">
                                            Posted {new Date(gig.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Link
                                        to={`/gigs/${gig.id}`}
                                        className="btn-secondary text-sm py-2"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
