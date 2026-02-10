import { useEffect, useState } from 'react'
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts'
import { supabase } from '../../lib/supabase'

export default function AdminAnalytics() {
    const [data, setData] = useState({ by_hour: [], by_day: [], by_device: [], total: 0, unique: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            // Fetch summary for last 7 days
            const { data: summary, error } = await supabase.rpc('get_analytics_summary', { days: 7 })

            if (error) throw error

            if (summary) {
                // Transform data for charts

                // Hourly Trend (Last 7 Days)
                // Sort by time just in case
                const sortedHours = (summary.by_hour || []).sort((a, b) => new Date(a.hour) - new Date(b.hour))

                const formattedHour = sortedHours.map(item => ({
                    time: new Date(item.hour).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit' }),
                    visitors: item.count
                }))

                // Daily Trend
                const sortedDays = (summary.by_day || []).sort((a, b) => new Date(a.day) - new Date(b.day))
                const formattedDay = sortedDays.map(item => ({
                    day: new Date(item.day).toLocaleDateString([], { weekday: 'short', day: 'numeric' }),
                    visitors: item.count
                }))

                // Device Stats
                const formattedDevice = (summary.by_device || []).map(item => ({
                    name: item.device_type || 'Unknown',
                    value: item.count
                }))

                setData({
                    by_hour: formattedHour,
                    by_day: formattedDay,
                    by_device: formattedDevice,
                    total: summary.total_views || 0,
                    unique: summary.unique_visitors || 0
                })
            }
        } catch (err) {
            console.error('Error fetching analytics:', err)
        } finally {
            setLoading(false)
        }
    }

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
    )

    return (
        <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Total Page Views (7d)</h3>
                        <p className="text-4xl font-bold text-slate-900 mt-2">{data.total}</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded-xl">
                        <AreaChart width={60} height={40} data={data.by_day}>
                            <Area type="monotone" dataKey="visitors" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                        </AreaChart>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wide">Unique Visitors</h3>
                        <p className="text-4xl font-bold text-slate-900 mt-2">{data.unique}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-xl">
                        <div className="h-10 w-10 flex items-center justify-center text-green-600 font-bold text-xl">
                            👥
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Hourly Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-96">
                <h3 className="mb-6 font-bold text-lg text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
                    Traffic Overview (Hourly)
                </h3>
                <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={data.by_hour}>
                        <defs>
                            <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="time"
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            minTickGap={30}
                        />
                        <YAxis
                            tick={{ fill: '#94a3b8', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="visitors"
                            stroke="#6366f1"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorVis)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Daily Trend */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
                    <h3 className="mb-6 font-bold text-lg text-slate-800">Daily Visitors</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <LineChart data={data.by_day}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                            <Line type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Device Stats */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-80">
                    <h3 className="mb-6 font-bold text-lg text-slate-800">Device Breakdown</h3>
                    <div className="flex items-center h-[80%]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.by_device}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.by_device.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
