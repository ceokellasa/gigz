import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Trash2, Mail, Shield, ShieldOff, Search } from 'lucide-react'
import { useToast } from '../../components/Toast'
import clsx from 'clsx'

export default function AdminUserList() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const toast = useToast()

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error('Error fetching users:', error)
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const [error, setError] = useState(null)

    const handleKYCUpdate = async (userId, status) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ kyc_status: status })
                .eq('id', userId)

            if (error) throw error

            setUsers(users.map(u => u.id === userId ? { ...u, kyc_status: status } : u))
            toast.success(`User KYC updated to ${status}`)
        } catch (err) {
            console.error(err)
            toast.error("Failed to update KYC")
        }
    }

    const handlePasswordReset = async (email) => {
        if (!email) {
            toast.error('User email not found')
            return
        }

        if (!window.confirm(`Send password reset link to ${email}?`)) return

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/update-password`,
            })

            if (error) throw error
            toast.success(`Password reset email sent to ${email}`)
        } catch (error) {
            console.error('Error sending reset link:', error)
            toast.error(error.message || 'Failed to send reset link')
        }
    }

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure? This will delete the user and all their gigs/data. This cannot be undone.')) return

        try {
            const { error } = await supabase.from('profiles').delete().eq('id', id)
            if (error) throw error

            setUsers(users.filter(u => u.id !== id))
            toast.success('User profile deleted')
        } catch (error) {
            console.error('Error deleting user:', error)
            toast.error('Failed to delete user profile')
        }
    }

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="text-center py-8">Loading users...</div>

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
                    <span>Error loading users: {error.message}</span>
                    <button
                        onClick={() => { setError(null); fetchUsers(); }}
                        className="text-sm font-semibold underline hover:text-red-800"
                    >
                        Retry
                    </button>
                </div>
            )}

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                />
            </div>

            <div className="overflow-x-auto bg-white rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">KYC Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Document</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                                            {user.avatar_url ? (
                                                <img src={user.avatar_url} className="h-full w-full object-cover" />
                                            ) : (
                                                user.full_name?.[0]
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900">{user.full_name || 'No Name'}</div>
                                            <div className="text-sm text-slate-500">{user.role || 'user'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={clsx("px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                                        user.kyc_status === 'verified' && "bg-green-100 text-green-800",
                                        user.kyc_status === 'pending' && "bg-amber-100 text-amber-800",
                                        user.kyc_status === 'rejected' && "bg-red-100 text-red-800",
                                        user.kyc_status === 'none' && "bg-slate-100 text-slate-800"
                                    )}>
                                        {user.kyc_status || 'none'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {user.kyc_document_url ? (
                                        <a
                                            href={`https://ixplbjvjofjyumjcmgjd.supabase.co/storage/v1/object/public/kyc-documents/${user.kyc_document_url}`} // Assuming public for admin view or use signed url logic if strictly private
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-indigo-600 hover:underline flex items-center gap-1"
                                        >
                                            View ID <Search className="w-3 h-3" />
                                        </a>
                                    ) : (
                                        <span className="text-slate-400">No Doc</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                                    {user.kyc_status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleKYCUpdate(user.id, 'verified')}
                                                className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-full hover:bg-green-100 transition-colors"
                                                title="Approve KYC"
                                            >
                                                <Shield className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleKYCUpdate(user.id, 'rejected')}
                                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full hover:bg-red-100 transition-colors"
                                                title="Reject KYC"
                                            >
                                                <ShieldOff className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => deleteUser(user.id)}
                                        className="text-slate-400 hover:text-red-600 p-2 transition-colors"
                                        title="Delete User"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
