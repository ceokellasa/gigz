import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Lightbulb, Trash2, User } from 'lucide-react'
import { useToast } from '../../components/Toast'

export default function AdminSuggestions() {
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(true)
    const toast = useToast()

    useEffect(() => {
        fetchSuggestions()
    }, [])

    const fetchSuggestions = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('feature_suggestions')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            if (data && data.length > 0) {
                // Fetch user profiles manually to avoid complex FK issues
                const userIds = [...new Set(data.map(s => s.user_id))]
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, email')
                    .in('id', userIds)

                const profileMap = {}
                profiles?.forEach(p => profileMap[p.id] = p)

                const joined = data.map(s => ({
                    ...s,
                    user: profileMap[s.user_id]
                }))
                setSuggestions(joined)
            } else {
                setSuggestions([])
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error)
            toast.error('Failed to load suggestions')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this suggestion?')) return
        try {
            const { error } = await supabase.from('feature_suggestions').delete().eq('id', id)
            if (error) throw error
            setSuggestions(prev => prev.filter(s => s.id !== id))
            toast.success('Suggestion deleted')
        } catch (e) {
            toast.error(e.message)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-500">Loading suggestions...</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                    Feature Suggestions
                </h2>
                <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">
                    {suggestions.length} Total
                </span>
            </div>

            {suggestions.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <Lightbulb className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No suggestions received yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {suggestions.map(s => (
                        <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <p className="text-slate-900 font-medium whitespace-pre-wrap mb-4 text-base">{s.suggestion}</p>

                            <div className="flex flex-wrap items-center justify-between text-sm pt-4 border-t border-slate-100 gap-4">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                        <User className="h-3 w-3" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{s.user?.full_name || 'Unknown User'}</span>
                                        <span className="text-xs text-slate-400">{s.user?.email || 'No Email'}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <span className="text-slate-400 text-xs">
                                        {new Date(s.created_at).toLocaleDateString()} • {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                        title="Delete Suggestion"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
