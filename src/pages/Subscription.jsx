import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { initializeCashfree, createPaymentSession, doPayment } from '../lib/cashfree'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import { Check, Shield, ChevronLeft, ChevronRight, Sparkles, Loader2, Crown } from 'lucide-react'
import clsx from 'clsx'

const plans = [
    {
        id: '1_day',
        name: '1 Day Pass',
        price: 49,
        duration_days: 1,
        features: ['5 number reveals', 'Unlimited job views', 'Direct messaging'],
        popular: false
    },
    {
        id: '1_week',
        name: 'Weekly Pro',
        price: 270,
        duration_days: 7,
        features: ['50 number reveals', 'Unlimited job views', 'Direct messaging', 'Priority support'],
        popular: true
    },
    {
        id: '1_month',
        name: 'Monthly Elite',
        price: 1000,
        duration_days: 30,
        features: ['Unlimited reveals', 'Unlimited job views', 'Direct messaging', 'Priority support', 'Featured profile'],
        popular: false
    }
]

export default function Subscription() {
    const { user, profile, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [currentIndex, setCurrentIndex] = useState(1)
    const carouselRef = useRef(null)

    const isSubscribed = profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()

    useEffect(() => {
        initializeCashfree().catch(err => console.error('Cashfree init error:', err))
    }, [])

    const handleSubscribe = async (plan) => {
        if (!user) {
            toast.warning('Please sign in to subscribe')
            navigate('/login')
            return
        }

        setLoading(true)
        setSelectedPlan(plan.id)

        try {
            // 1. Create Payment Session
            const paymentSessionId = await createPaymentSession(plan, user, profile)

            // 2. Open Checkout
            await doPayment(paymentSessionId)

        } catch (error) {
            console.error('Error subscribing:', error)
            toast.error(error.message || 'Failed to process subscription. Please try again.')
        } finally {
            setLoading(false)
            setSelectedPlan(null)
        }
    }

    const scrollToCard = (index) => {
        setCurrentIndex(index)
        if (carouselRef.current) {
            const cardWidth = carouselRef.current.children[0]?.offsetWidth || 0
            const gap = 24
            const scrollPosition = index * (cardWidth + gap) - (carouselRef.current.offsetWidth - cardWidth) / 2
            carouselRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' })
        }
    }

    const handlePrev = () => {
        const newIndex = Math.max(0, currentIndex - 1)
        scrollToCard(newIndex)
    }

    const handleNext = () => {
        const newIndex = Math.min(plans.length - 1, currentIndex + 1)
        scrollToCard(newIndex)
    }

    useEffect(() => {
        const timer = setTimeout(() => scrollToCard(1), 100)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <Sparkles className="h-4 w-4" />
                    Premium Plans
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                    Unlock Full Access
                </h2>
                <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                    Get access to client contact numbers and land your next gig faster.
                </p>
            </div>

            {/* Carousel Navigation */}
            <div className="flex justify-center items-center gap-4 mb-8">
                <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronLeft className="h-6 w-6" />
                </button>
                <div className="flex gap-2">
                    {plans.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToCard(index)}
                            className={clsx(
                                'w-3 h-3 rounded-full transition-all',
                                currentIndex === index ? 'bg-indigo-600 scale-125' : 'bg-slate-300 hover:bg-slate-400'
                            )}
                        />
                    ))}
                </div>
                <button
                    onClick={handleNext}
                    disabled={currentIndex === plans.length - 1}
                    className="p-3 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    <ChevronRight className="h-6 w-6" />
                </button>
            </div>

            {/* Carousel */}
            <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-8 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {plans.map((plan, index) => (
                    <div
                        key={plan.id}
                        className={clsx(
                            'flex-shrink-0 w-80 sm:w-96 snap-center rounded-3xl overflow-hidden transition-all duration-300',
                            currentIndex === index ? 'scale-100 opacity-100' : 'scale-95 opacity-70'
                        )}
                    >
                        <div className={clsx(
                            'h-full p-8 border-2 rounded-3xl',
                            plan.popular
                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 shadow-xl shadow-indigo-500/30'
                                : 'bg-white border-slate-200 shadow-lg'
                        )}>
                            {plan.popular && (
                                <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}

                            <h3 className={clsx(
                                'text-2xl font-bold mb-2',
                                plan.popular ? 'text-white' : 'text-slate-900'
                            )}>{plan.name}</h3>

                            <div className="mb-6">
                                <span className={clsx(
                                    'text-5xl font-extrabold',
                                    plan.popular ? 'text-white' : 'text-slate-900'
                                )}>₹{plan.price}</span>
                                <span className={clsx(
                                    'text-lg ml-2',
                                    plan.popular ? 'text-indigo-100' : 'text-slate-500'
                                )}>
                                    /{plan.duration_days === 1 ? 'day' : plan.duration_days === 7 ? 'week' : 'month'}
                                </span>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3">
                                        <div className={clsx(
                                            'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center',
                                            plan.popular ? 'bg-white/20' : 'bg-green-100'
                                        )}>
                                            <Check className={clsx(
                                                'h-4 w-4',
                                                plan.popular ? 'text-white' : 'text-green-600'
                                            )} />
                                        </div>
                                        <span className={plan.popular ? 'text-indigo-100' : 'text-slate-600'}>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSubscribe(plan)}
                                disabled={loading}
                                className={clsx(
                                    'w-full py-4 px-6 rounded-full font-bold text-lg transition-all',
                                    plan.popular
                                        ? 'bg-white text-indigo-600 hover:bg-slate-100 shadow-lg'
                                        : 'bg-slate-900 text-white hover:bg-slate-800',
                                    loading && 'opacity-50 cursor-not-allowed'
                                )}
                            >
                                {loading ? 'Processing...' : `Get ${plan.name}`}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Security Badge */}
            <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 text-slate-500 bg-white px-6 py-3 rounded-full text-sm border border-slate-200 shadow-sm">
                    <Shield className="h-5 w-5 text-green-500" />
                    Secure Payment via Cashfree
                </div>
            </div>
        </div>
    )
}
