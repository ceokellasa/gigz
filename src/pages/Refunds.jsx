import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Refunds() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 sm:p-12">
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-4 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-extrabold text-slate-900">Refunds & Cancellation Policy</h1>
                    <p className="text-slate-500 mt-2">Last updated: January 26, 2026</p>
                </div>

                <div className="prose prose-slate max-w-none">
                    <h3>1. Subscription Plans</h3>
                    <p>KELLASA offers various subscription plans (e.g., Daily, Weekly, Monthly) that grant access to premium features such as viewing contact details.</p>

                    <h3>2. No Refunds on Active Plans</h3>
                    <p>Unless explicitly stated otherwise or required by law, <strong>all purchases of subscription plans are non-refundable</strong> once the subscription period has commenced and access to premium features has been granted.</p>

                    <h3>3. Exceptional Circumstances</h3>
                    <p>We may consider refund requests on a case-by-case basis under the following exceptional circumstances:</p>
                    <ul>
                        <li>If a technical error prevented you from accessing the premium features you paid for.</li>
                        <li>If you were charged multiple times for the same transaction due to a billing error.</li>
                    </ul>

                    <h3>4. Cancellation Policy</h3>
                    <p>You may cancel your subscription renewal at any time (if auto-renewal is enabled). However, you will retain access to the premium features until the end of your current billing period. No partial refunds will be issued for unused days.</p>

                    <h3>5. Disputes</h3>
                    <p>Any disputes regarding payments or services between Clients and Workers are the sole responsibility of the involved parties. KELLASA is not a party to these transactions and cannot issue refunds for work performed or not performed by users found on the platform.</p>

                    <h3>6. Contact for Refunds</h3>
                    <p>To request a refund under exceptional circumstances, please email us at <strong>helpatkelasa@gmail.com</strong> with your Transaction ID and a detailed explanation of the issue.</p>
                </div>
            </div>
        </div>
    )
}
