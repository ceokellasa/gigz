import { Link } from 'react-router-dom'
import { CheckCircle, Mail } from 'lucide-react'

export default function EmailVerified() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                </div>

                <h2 className="text-3xl font-bold text-slate-900 mb-2">Email Verified!</h2>

                <p className="text-slate-600 mb-8">
                    Thank you for verifying your email. Your account is now fully active.
                    Welcome to the Kellasa community!
                </p>

                <div className="space-y-4">
                    <Link to="/" className="btn-primary w-full block py-3.5 flex items-center justify-center gap-2">
                        Go to Home
                    </Link>
                    <Link to="/post-gig" className="btn-secondary w-full block py-3.5">
                        Post a Gig
                    </Link>
                </div>
            </div>
        </div>
    )
}
