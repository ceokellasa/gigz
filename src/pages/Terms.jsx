import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Terms() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-12">
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900">Terms and Conditions</h1>
                    <p className="text-slate-500 mt-2">Last updated: January 26, 2026</p>
                </div>

                <div className="prose prose-slate max-w-none">
                    <p>Welcome to KELLASA ("we," "our," or "us"). By accessing or using our platform, website, and services (collectively, the "Service"), you agree to be bound by these Terms and Conditions.</p>

                    <h3>1. Acceptance of Terms</h3>
                    <p>By registering for or using our Service, you agree to these Terms. If you do not agree, strictly do not use our Service.</p>

                    <h3>2. Use of the Service</h3>
                    <ul>
                        <li>You must be at least 18 years old to use this Service.</li>
                        <li>You agree to provide accurate and complete information during registration.</li>
                        <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                    </ul>

                    <h3>3. User Conduct</h3>
                    <p>Users agree NOT to:</p>
                    <ul>
                        <li>Post false, misleading, or fraudulent gigs or profiles.</li>
                        <li>Harass, abuse, or harm another person.</li>
                        <li>Use the platform for any illegal purpose.</li>
                        <li>Attempt to bypass our payment or contact systems inappropriately.</li>
                    </ul>

                    <h3>4. Payments and Fees</h3>
                    <p>We may charge fees for certain premium features (e.g., viewing contact details). All fees are clearly disclosed before purchase. Payments are processed securely via third-party providers.</p>

                    <h3>5. Limitation of Liability</h3>
                    <p>KELLASA is a platform connecting Clients and Workers. We do not employ workers directly and are not responsible for the quality of work or conduct of any user. Use the service at your own risk.</p>

                    <h3>6. Account Termination</h3>
                    <p>We reserve the right to suspend or terminate accounts that violate these Terms or engage in fraudulent activity.</p>

                    <h3>7. Changes to Terms</h3>
                    <p>We may modify these terms at any time. Continued use of the Service constitutes acceptance of the new terms.</p>

                    <h3>8. Contact Us</h3>
                    <p>If you have questions about these Terms, please contact us at helpatkelasa@gmail.com.</p>
                </div>
            </div>
        </div>
    )
}
