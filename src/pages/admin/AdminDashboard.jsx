import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { Users, Briefcase, Trash2, ShieldAlert, Activity, Settings } from 'lucide-react'
import AdminGigList from './AdminGigList'
import AdminUserList from './AdminUserList'
import AdminCMS from './AdminCMS'
import AdminKYCRequests from './AdminKYCRequests'
import AdminNotifications from './AdminNotifications'
import AdminProfessionals from './AdminProfessionals'
import AdminSuggestions from './AdminSuggestions'

const ADMIN_EMAIL = 'nsjdfmjr@gmail.com'

export default function AdminDashboard() {
    const { user, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({ users: 0, gigs: 0, reports: 0 })
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('overview') // 'overview', 'users', 'gigs', 'cms', 'notifications'

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.email !== ADMIN_EMAIL) {
                navigate('/')
            } else {
                fetchStats()
            }
        }
    }, [user, authLoading, navigate])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
            const { count: gigCount } = await supabase.from('gigs').select('*', { count: 'exact', head: true })

            setStats({
                users: userCount || 0,
                gigs: gigCount || 0,
                reports: 0
            })
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-indigo-100 rounded-xl text-indigo-600">
                        <Users className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Users</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.users}</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-green-100 rounded-xl text-green-600">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Gigs</p>
                        <p className="text-2xl font-bold text-slate-900">{stats.gigs}</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
                    <div className="p-4 bg-orange-100 rounded-xl text-orange-600">
                        <Activity className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">System Status</p>
                        <p className="text-2xl font-bold text-slate-900">Healthy</p>
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
