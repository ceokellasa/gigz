import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Users, Briefcase, Trash2, ShieldAlert, Activity, Settings, Eye, MessageSquare, BadgeCheck } from 'lucide-react'
import AdminGigList from './AdminGigList'
import AdminUserList from './AdminUserList'
import AdminCMS from './AdminCMS'
import AdminKYCRequests from './AdminKYCRequests'
import AdminNotifications from './AdminNotifications'
import AdminProfessionals from './AdminProfessionals'
import AdminSuggestions from './AdminSuggestions'
import AdminAnalytics from './AdminAnalytics'

const ADMIN_EMAIL = 'nsjdfmjr@gmail.com'

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({ users: 0, gigs: 0, liveViewers: 0, professionals: 0, messages: 0 })
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview') // 'overview', 'users', 'gigs', 'cms', 'notifications'

    useEffect(() => {
        let channel = null

        if (!authLoading) {
            if (!user || user.email !== ADMIN_EMAIL) {
                navigate('/')
            } else {
                fetchStats()

                // Realtime Presence for Live Viewers
                channel = supabase.channel('global-presence')
                channel
                    .on('presence', { event: 'sync' }, () => {
                        const state = channel.presenceState()
                        // Count unique presence IDs
                        const count = Object.keys(state).length
                        setStats(prev => ({ ...prev, liveViewers: count }))
                    })
                    .subscribe()
            }
        }

        return () => {
            if (channel) supabase.removeChannel(channel)
        }
    }, [user, authLoading, navigate])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase.rpc('get_admin_dashboard_stats')

            if (error) {
                console.error('RPC Error:', error)
                // Fallback
                const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
                const { count: gigCount } = await supabase.from('gigs').select('*', { count: 'exact', head: true })
                setStats(prev => ({ ...prev, users: userCount || 0, gigs: gigCount || 0 }))
            } else if (data) {
                setStats(prev => ({
                    ...prev,
                    users: data.total_users || 0,
                    gigs: data.total_gigs || 0,
                    professionals: data.total_professionals || 0,
                    messages: data.total_messages || 0
                }))
            }
        } catch (error) {
            console.error('Error fetching admin stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (authLoading || loading) {
        return <div className="p-8 text-center">Loading Admin Panel...</div>
    }

    if (!user || user.email !== ADMIN_EMAIL) {
        return null // Should have redirected
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <ShieldAlert className="h-8 w-8 text-red-600" />
                        Admin Dashboard
                    </h1>
                    <p className="text-slate-500 mt-1">authorized access only • {user.email}</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-red-100 rounded-xl text-red-600">
                            <Eye className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full animate-pulse">LIVE</span>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Active Viewers</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.liveViewers || 0}</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                            <Users className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Users</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.users}</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-100 rounded-xl text-green-600">
                            <Briefcase className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Gigs</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.gigs}</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                            <BadgeCheck className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Professionals</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.professionals}</p>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                            <MessageSquare className="h-6 w-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Messages</p>
                        <p className="text-3xl font-bold text-slate-900">{stats.messages}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-8 overflow-x-auto">
                <nav className="-mb-px flex space-x-8 min-w-max">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analytics'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Analytics
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'users'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('gigs')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'gigs'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Gigs
                    </button>
                    <button
                        onClick={() => setActiveTab('cms')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'cms'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        CMS / Settings
                    </button>
                    <button
                        onClick={() => setActiveTab('professionals')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'professionals'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Professionals
                    </button>
                    <button
                        onClick={() => setActiveTab('kyc')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'kyc'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        KYC Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'notifications'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Push Notifications
                    </button>
                    <button
                        onClick={() => setActiveTab('suggestions')}
                        className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'suggestions'
                            ? 'border-indigo-500 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                    >
                        Suggestions
                    </button>
                </nav>
            </div>

            <div className="glass-panel rounded-2xl p-4 sm:p-8 min-h-[400px]">
                {activeTab === 'overview' && (
                    <div className="text-center py-12">
                        <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="h-8 w-8 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">Welcome to Admin Panel</h3>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            Manage users, monitor gigs, and customize your website settings from this centralized dashboard.
                        </p>
                    </div>
                )}

                {activeTab === 'analytics' && <AdminAnalytics />}

                {activeTab === 'users' && <AdminUserList />}

                {activeTab === 'professionals' && <AdminProfessionals />}

                {activeTab === 'kyc' && <AdminKYCRequests />}

                {activeTab === 'gigs' && <AdminGigList />}

                {activeTab === 'cms' && <AdminCMS />}

                {activeTab === 'notifications' && <AdminNotifications />}

                {activeTab === 'suggestions' && <AdminSuggestions />}
            </div>
        </div>
    )
}
