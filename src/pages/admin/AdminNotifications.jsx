import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Bell, Send, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminNotifications() {
    const [formData, setFormData] = useState({
        title: '',
        message: ''
    })
    const [sending, setSending] = useState(false)
    const [status, setStatus] = useState(null) // { type: 'success' | 'error', message: '' }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.title || !formData.message) return

        setSending(true)
        setStatus(null)

        try {
            const { error } = await supabase
                .from('notifications')
                .insert([
                    {
                        type: 'system_broadcast',
                        title: formData.title,
                        message: formData.message,
                        is_global: true,
                        link: '/', // Default link to home
                        user_id: null // Global
                    }
                ])

            if (error) throw error

            setStatus({ type: 'success', message: 'Notification broadcasted successfully!' })
            setFormData({ title: '', message: '' })
        } catch (error) {
            console.error('Error sending notification:', error)
            setStatus({ type: 'error', message: error.message || 'Failed to send notification' })
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-8 w-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Push Notification Broadcast</h2>
                <p className="text-slate-500 mt-2">
                    Send a system-wide notification to all users mobile apps and web dashboard.
                </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                {status && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {status.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                        {status.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Notification Title
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full input-field"
                            placeholder="e.g. System Maintenance Update"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Message
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                            className="w-full input-field"
                            rows={4}
                            placeholder="Write your message here..."
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={sending}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                    >
                        <Send className="h-5 w-5" />
                        {sending ? 'Broadcasting...' : 'Send Broadcast'}
                    </button>
                </form>
            </div>
        </div>
    )
}
