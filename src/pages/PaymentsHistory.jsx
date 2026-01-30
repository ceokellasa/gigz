import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ChevronLeft, Receipt, CheckCircle, Clock } from 'lucide-react'

export default function PaymentsHistory() {
    const { profile, loading } = useAuth()
    const [payments, setPayments] = useState([])

    useEffect(() => {
        if (profile) {
            const history = []

            // Synthetic Payment History based on current status
            if (profile.has_paid_professional_fee) {
                history.push({
                    id: 'prof-activation',
                    description: 'Professional Profile Activation',
                    amount: 1,
                    currency: 'INR',
                    date: 'One-time Payment', // We don't have the date stored
                    status: 'Paid',
                    method: 'Online'
                })
            }

            if (profile.subscription_plan && profile.subscription_plan !== 'free') {
                history.push({
                    id: 'sub-active',
                    description: `Subscription: ${profile.subscription_plan.replace('_', ' ')}`,
                    amount: profile.subscription_plan === '1_day' ? 9 :
                        profile.subscription_plan === '1_week' ? 49 : 199,
                    currency: 'INR',
                    date: profile.subscription_start_date ? new Date(profile.subscription_start_date).toLocaleDateString() : 'Active',
                    status: 'Active',
                    method: 'Online'
                })
            }

            // In future, fetch real payments table here

            setPayments(history)
        }
    }, [profile])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Link to="/profile" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Profile
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <Receipt className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Payment History</h1>
                        <p className="text-sm text-slate-500">View all your transactions and subscriptions</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {payments.length > 0 ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Method</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900">
                                            {payment.description}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {payment.date}
                                        </td>
                                        <td className="px-6 py-4 text-slate-900 font-bold">
                                            ₹{payment.amount}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                <CheckCircle className="h-3 w-3" />
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {payment.method}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No Payments Yet</h3>
                            <p>Transaction history will appear here once you make a payment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
