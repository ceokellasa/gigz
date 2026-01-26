import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, MailCheck } from 'lucide-react'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function EmailVerified() {
    const navigate = useNavigate()

    useEffect(() => {
        // Handle the Supabase implicit flow hash fragment if present
        // Hash looks like: #access_token=...&refresh_token=...&type=signup etc
        const handleSession = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (session) {
                // Determine where to send them. Usually, if they just verified, they are logged in.
                // However, user specifically asked for "Email Verified" page with "Login Now" button.
                // But if they are *already* logged in via the link, we might want to just show the success message.
            }
        }
        handleSession()
    }, [])

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MailCheck className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified Successfully!</h2>
                <p className="text-slate-600 mb-8">
                    Thank you for verifying your email address. Your account is now fully active.
                </p>
                <Link
                    to="/login"
                    className="btn-primary w-full block py-3"
                >
                    Login Now
                </Link>
            </div>
        </div>
    )
}
