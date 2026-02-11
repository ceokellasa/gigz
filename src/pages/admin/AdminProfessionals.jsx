import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Trash2, ExternalLink, Mail, Phone, MapPin, Search } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminProfessionals() {
    const [professionals, setProfessionals] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchProfessionals()
    }, [])

    const fetchProfessionals = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('professional_profiles')
                .select('*, profiles:user_id(full_name, email, avatar_url, phone_number)')
                .order('created_at', { ascending: false })

            if (error) throw error
            if (data) setProfessionals(data)
        } catch (error) {
            console.error('Error fetching professionals:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this professional profile? This action cannot be undone.')) return

        try {
            const { error } = await supabase
                .from('professional_profiles')
                .delete()
                .eq('id', id)

            if (error) throw error
            setProfessionals(prev => prev.filter(p => p.id !== id))
        } catch (error) {
            alert('Error deleting profile: ' + error.message)
        }
    }

    const filtered = professionals.filter(p =>
        p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.profession?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="text-center py-8">Loading professionals...</div>

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">Professional Profiles ({professionals.length})</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search professionals..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Professional</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title/Location</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rate</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                                        No professional profiles found.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((prof) => (
                                    <tr key={prof.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0">
                                                    {prof.profiles?.avatar_url ? (
                                                        <img className="h-10 w-10 rounded-full object-cover" src={prof.profiles.avatar_url} alt="" />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                            {prof.profiles?.full_name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900">{prof.profiles?.full_name}</div>
                                                    <div className="text-sm text-slate-500">{prof.profiles?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-slate-900 font-medium">{prof.profession}</div>
                                            <div className="text-sm text-slate-500 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" /> {prof.location || 'Remote'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {prof.contact_for_pricing ? (
                                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    Contact
                                                </span>
                                            ) : (
                                                <div className="text-sm text-slate-900">
                                                    {prof.hourly_rate ? `₹${prof.hourly_rate}/hr` : '-'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            <div className="flex flex-col gap-1">
                                                {prof.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {prof.phone}</span>}
                                                {prof.website && <span className="flex items-center gap-1 max-w-[150px] truncate"><ExternalLink className="h-3 w-3" /> {prof.website}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    to={`/professionals/${prof.user_id}`}
                                                    target="_blank"
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="View Public Profile"
                                                >
                                                    <ExternalLink className="h-5 w-5" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(prof.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete Profile"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
