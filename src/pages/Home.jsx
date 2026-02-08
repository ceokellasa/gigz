import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { initializeCashfree, createPaymentSession, doPayment } from '../lib/cashfree'
import { ArrowRight, Search, Shield, Zap, TrendingUp, Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import GigList from '../components/GigList'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { supabase } from '../lib/supabase'
import clsx from 'clsx'

const defaultPlans = [
    {
        id: '1_day',
        name: '1 Day Pass',
        price: 49,
        duration_days: 1,
        features: ['Access to all contact numbers', 'Unlimited job views', 'Direct messaging'],
        popular: false
    },
    {
        id: '1_week',
        name: 'Weekly Pro',
        price: 270,
        duration_days: 7,
        features: ['Access to all contact numbers', 'Unlimited job views', 'Direct messaging', 'Priority support'],
        popular: true
    },
    {
        id: '1_month',
        name: 'Monthly Elite',
        price: 1000,
        duration_days: 30,
        features: ['Access to all contact numbers', 'Unlimited job views', 'Direct messaging', 'Priority support', 'Featured profile'],
        popular: false
    }
]

export default function Home() {
    const { settings } = useSettings()
    const { user, profile, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(1)
    const [plans, setPlans] = useState(defaultPlans)
    const carouselRef = useRef(null)

    useEffect(() => {
        if (settings.subscription_plans) {
            try {
                const parsedPlans = JSON.parse(settings.subscription_plans)
                if (Array.isArray(parsedPlans) && parsedPlans.length > 0) {
                    setPlans(parsedPlans)
                }
            } catch (e) {
                console.error('Failed to parse subscription plans:', e)
            }
        }
    }, [settings.subscription_plans])

    useEffect(() => {
        initializeCashfree()
    }, [])

    const handleSubscribe = async (plan) => {
        if (!user) {
            toast.warning('Please sign in to subscribe')
            navigate('/login')
            return
        }

        setLoading(true)
        try {
            // 1. Create Payment Session
            const paymentSessionId = await createPaymentSession(plan, user, profile)

            // 2. Open Checkout
            await doPayment(paymentSessionId)

            // Note: The redirection will happen automatically to /subscription/success
        } catch (error) {
            console.error('Error subscribing:', error)
            toast.error(error.message || 'Failed to process subscription.')
        } finally {
            setLoading(false)
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
        <div className="flex flex-col min-h-screen">
            {/* Announcement Banner */}
            {settings.site_banner_text && (
                <div className="bg-slate-900 text-white text-center py-2 px-4 text-sm font-medium">
                    {settings.site_banner_text}
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 font-sans whitespace-pre-line">
                        {settings.hero_headline || (
                            <>
                                Build your <br className="hidden md:block" />
                                <span className="text-indigo-600">
                                    money future
                                </span>
                            </>
                        )}
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-slate-500 whitespace-pre-line">
                        {settings.hero_subheadline || 'Find gigs, get paid, and take control of your earnings. The modern way to work is here.'}
                    </p>

                    <div className="mt-10 flex flex-wrap justify-center gap-4">
                        <Link to="/post-gig" className="btn-primary px-8 py-4 text-lg">
                            {settings.hero_cta_text_1 || 'Post a Gig'}
                        </Link>
                        <Link to="/gigs" className="btn-secondary px-8 py-4 text-lg">
                            {settings.hero_cta_text_2 || 'Find Work'}
                        </Link>
                        <Link to="/professionals" className="px-8 py-4 text-lg font-bold rounded-full bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-indigo-600 transition-all shadow-sm">
                            {settings.hero_cta_text_3 || 'Hire Pros'}
                        </Link>
                    </div>

                    <div className="mt-16 relative max-w-4xl mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10"></div>
                        <img
                            src={settings.hero_image_url || "/artifacts/fintech_hero_mockup.png"}
                            alt="App Preview"
                            className="w-full rounded-3xl shadow-2xl border border-slate-200 transform hover:scale-[1.01] transition-transform duration-500"
                        />
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Zap className="h-8 w-8 text-slate-900" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{settings.feature_1_title || 'Instant Connections'}</h3>
                            <p className="text-slate-500">{settings.feature_1_desc || 'Connect with talent or clients in seconds. No lengthy waiting periods.'}</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Shield className="h-8 w-8 text-slate-900" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{settings.feature_2_title || 'Verified Profiles'}</h3>
                            <p className="text-slate-500">{settings.feature_2_desc || 'Every user is verified via mobile number to ensure a safe community.'}</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                                <TrendingUp className="h-8 w-8 text-slate-900" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{settings.feature_3_title || 'Grow Your Income'}</h3>
                            <p className="text-slate-500">{settings.feature_3_desc || 'Access high-paying gigs and keep 100% of your earnings.'}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-slate-900">Featured Gigs</h2>
                        <Link to="/gigs" className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1">
                            View all <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                    <GigList limit={3} />
                </div>
            </section>

            {/* Carousel Subscription Section (Replaced Dark Mode) */}
            {(!profile?.subscription_expires_at || new Date(profile.subscription_expires_at) < new Date()) && (
                <section className="py-20 bg-slate-50 border-t border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
                        <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
                            <Sparkles className="h-4 w-4" />
                            Premium Plans
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
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
                            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <div className="flex gap-2">
                            {plans.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollToCard(index)}
                                    className={clsx(
                                        'w-2 h-2 rounded-full transition-all',
                                        currentIndex === index ? 'bg-indigo-600 w-4' : 'bg-slate-300'
                                    )}
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={currentIndex === plans.length - 1}
                            className="p-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                        >
                            <ChevronRight className="h-5 w-5" />
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
                                    'flex-shrink-0 w-[85vw] sm:w-96 snap-center rounded-3xl overflow-hidden transition-all duration-300',
                                    currentIndex === index ? 'scale-100 opacity-100' : 'scale-95 opacity-70'
                                )}
                            >
                                <div className={clsx(
                                    'h-full p-6 sm:p-8 border-2 rounded-3xl text-left',
                                    plan.popular
                                        ? 'bg-slate-900 border-slate-800 shadow-xl shadow-slate-900/20'
                                        : 'bg-white border-slate-200 shadow-lg'
                                )}>
                                    {plan.popular && (
                                        <div className="inline-block bg-white text-slate-900 text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
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
                </section>
            )}
            {/* Mobile-Only Footer */}
            {(settings.show_mobile_footer !== 'false') && (
                <footer className="md:hidden py-8 px-4 border-t border-slate-200 mt-auto bg-slate-50 mb-16">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <p className="text-slate-400 text-sm">
                            {settings.footer_text || '© 2026 KELLASA. All rights reserved.'}
                        </p>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                            <Link to="/contact" className="text-slate-500 text-sm hover:text-indigo-600">Contact</Link>
                            <Link to="/terms" className="text-slate-500 text-sm hover:text-indigo-600">Terms</Link>
                            <Link to="/refunds" className="text-slate-500 text-sm hover:text-indigo-600">Refunds</Link>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    )
}
