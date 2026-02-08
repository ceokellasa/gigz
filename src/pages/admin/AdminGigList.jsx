import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Eye, Trash2, Edit, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useToast } from '../../components/Toast'

export default function AdminGigList() {
    const [gigs, setGigs] = useState([])
    const [loading, setLoading] = useState(true)
    const toast = useToast()

    useEffect(() => {
        fetchGigs()
    }, [])

    const fetchGigs = async () => {
        try {
            const { data, error } = await supabase
                .from('gigs')
                .select('*, profiles:client_id(full_name)')
                .order('created_at', { ascending: false })

            if (error) throw error
            setGigs(data || [])
        } catch (error) {
            console.error('Error fetching gigs:', error)
            toast.error('Failed to load gigs')
        } finally {
            setLoading(false)
        }
    }

    const deleteGig = async (id) => {
        if (!window.confirm('Are you sure you want to delete this gig? This action cannot be undone.')) return

        try {
            const { error } = await supabase.from('gigs').delete().eq('id', id)
            if (error) throw error

            setGigs(gigs.filter(g => g.id !== id))
            toast.success('Gig deleted successfully')
        } catch (error) {
            console.error('Error deleting gig:', error)
            toast.error(`Failed to delete gig: ${error.message || error.details || 'Unknown error'}`)
        }
    }

    if (loading) return <div className="text-center py-8">Loading gigs...</div>

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Views</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {gigs.map((gig) => (
                        <tr key={gig.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-slate-900 truncate max-w-xs" title={gig.title}>
                                    {gig.title}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-slate-500">{gig.profiles?.full_name || 'Unknown'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${gig.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                    }`}>
                                    {gig.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Eye className="h-4 w-4 text-slate-400" />
                                    {gig.views || 0}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-3">
                                    <Link to={`/gigs/${gig.id}`} className="text-indigo-600 hover:text-indigo-900" title="View Live">
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                    <button
                                        onClick={() => deleteGig(gig.id)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
