import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { CheckCircle2, XCircle, Search, Shield, Filter } from 'lucide-react'
import { useToast } from '../../components/Toast'

export default function AdminKYCRequests() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const toast = useToast()

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            // Fetch users where kyc_status is 'pending' or 'verified' or 'rejected' to show history too?
            // Let's focus on Pending first.
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('kyc_status', 'pending')
                .order('kyc_submitted_at', { ascending: true })

            if (error) throw error
            setRequests(data || [])
        } catch (error) {
            console.error('Error fetching KYC requests:', error)
            toast.error('Failed to load KYC requests')
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async (userId, newStatus) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ kyc_status: newStatus })
                .eq('id', userId)

            if (error) throw error

            setRequests(requests.filter(r => r.id !== userId))
            toast.success(`Request ${newStatus}`)
        } catch (err) {
            console.error(err)
            toast.error("Failed to update status")
        }
    }

    if (loading) return <div className="text-center py-12">Loading requests...</div>

    if (requests.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">All Caught Up!</h3>
                <p className="text-slate-500 mt-2">No pending verification requests.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                Pending Verification Requests ({requests.length})
            </h2>

            <div className="grid gap-4">
                {requests.map(user => (
                    <div key={user.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {user.avatar_url ? (
                                    <img src={user.avatar_url} className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-slate-500 font-bold text-lg">{user.full_name?.[0]}</span>
                                )}
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 text-lg">{user.full_name}</h3>
                                <p className="text-slate-500 text-sm">{user.role} • Submitted: {new Date(user.kyc_submitted_at).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {user.kyc_document_url ? (
                                <a
                                    href={`https://rhqzywqsfjzjzbfqlyqf.supabase.co/storage/v1/object/public/kyc-documents/${user.kyc_document_url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-100 transition-colors flex items-center gap-2"
                                >
                                    <Search className="h-4 w-4" />
                                    View ID Proof
                                </a>
                            ) : (
                                <span className="text-slate-400 text-sm italic">No document attached</span>
                            )}

                            <div className="flex items-center gap-2 ml-auto md:ml-0">
                                <button
                                    onClick={() => handleUpdate(user.id, 'verified')}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm shadow-green-200"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleUpdate(user.id, 'rejected')}
                                    className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
