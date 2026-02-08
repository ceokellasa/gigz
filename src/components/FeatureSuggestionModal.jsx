import { useState } from 'react'
import { X, Send, Lightbulb, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useToast } from './Toast'

export default function FeatureSuggestionModal({ isOpen, onClose }) {
    const [suggestion, setSuggestion] = useState('')
    const [loading, setLoading] = useState(false)
    const toast = useToast()

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!suggestion.trim()) return

        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()

            const { error } = await supabase
                .from('feature_suggestions')
                .insert([{
                    suggestion: suggestion.trim(),
                    user_id: user.id
                }])

            if (error) throw error

            toast.success('Thank you! Your suggestion has been sent.')
            setSuggestion('')
            onClose()
        } catch (error) {
            console.error('Error submitting suggestion:', error)
            toast.error('Failed to submit suggestion. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Suggest a Feature
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                <div className="p-6">
                    <p className="text-sm text-slate-600 mb-4">
                        Have an idea to make Kellasa better? We'd love to hear it!
                    </p>

                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={suggestion}
                            onChange={(e) => setSuggestion(e.target.value)}
                            placeholder="I wish Kellasa could..."
                            rows={4}
                            className="w-full rounded-xl border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500 text-slate-900 resize-none p-3 mb-4"
                            autoFocus
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!suggestion.trim() || loading}
                                className="btn-primary px-4 py-2 text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
