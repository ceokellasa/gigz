import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { initializeCashfree, createPaymentSession, doPayment } from '../lib/cashfree'
import { ArrowRight, Search, Shield, Zap, TrendingUp, Check, ChevronLeft, ChevronRight, Sparkles, Star, Briefcase, Users, DollarSign } from 'lucide-react'
import GigList from '../components/GigList'
import { useSettings } from '../context/SettingsContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { useTypewriter } from '../hooks/useTypewriter'
import { HomePageSkeleton } from '../components/Skeleton'
import clsx from 'clsx'

const defaultPlans = [
    {
        id: '1_day',
        name: 'Day Pass',
        price: 49,
        duration_days: 1,
        features: ['Full Contact Access', 'Unlimited Job Views', 'Direct Messaging'],
        popular: false
    },
    {
        id: '1_week',
        name: 'Weekly Pro',
        price: 270,
        duration_days: 7,
        features: ['Full Contact Access', 'Unlimited Job Views', 'Direct Messaging', 'Priority Support'],
        popular: true
    },
    {
        id: '1_month',
        name: 'Monthly Elite',
        price: 1000,
        duration_days: 30,
        features: ['Full Contact Access', 'Unlimited Job Views', 'Direct Messaging', 'Priority Support', 'Featured Profile'],
        popular: false
    }
]

export default function Home() {
    const { settings } = useSettings()
    const { user, profile } = useAuth()
    const navigate = useNavigate()
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(1)
    const [plans, setPlans] = useState(defaultPlans)
    const carouselRef = useRef(null)

    // Simulate initial page load
    useEffect(() => {
        const timer = setTimeout(() => setPageLoading(false), 1000)
        return () => clearTimeout(timer)
    }, [])

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
            const paymentSessionId = await createPaymentSession(plan, user, profile)
            await doPayment(paymentSessionId)
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
            const card = carouselRef.current.children[0]
            if (card) {
                const cardWidth = card.offsetWidth
                const gap = 24
                const scrollPosition = index * (cardWidth + gap) - (carouselRef.current.offsetWidth - cardWidth) / 2
                carouselRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' })
            }
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
    }, [plans])

    if (pageLoading) {
        return <HomePageSkeleton />
    }

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans">
            {/* Announcement Banner */}
            {settings.site_banner_text && (
                <div className="bg-black text-white text-center py-3 px-4 text-sm font-bold tracking-wide">
                    {settings.site_banner_text}
                </div>
            )}

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden perspective-1000">
                {/* 3D Floating Background Elements */}
                <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-[#FACC15]/10 rounded-full blur-[100px] animate-pulse3d" />
                <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-slate-100/50 rounded-full blur-[80px] animate-float3d" />

                {/* 3D Floating Icons */}
                <div className="absolute top-24 left-[5%] sm:top-32 sm:left-[10%]">
                    <div className="backdrop-blur-md p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-floating animate-float3d border-2 border-white/50" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                        <Briefcase className="h-6 w-6 sm:h-12 sm:w-12 text-[#FACC15]" />
                    </div>
                </div>
                <div className="absolute top-32 right-[8%] sm:top-48 sm:right-[15%]">
                    <div className="backdrop-blur-md p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-floating animate-float3d-delayed border-2 border-[#FACC15]/60" style={{ backgroundColor: 'rgba(250, 204, 21, 0.15)' }}>
                        <DollarSign className="h-6 w-6 sm:h-12 sm:w-12 text-[#FACC15]" />
                    </div>
                </div>
                <div className="absolute bottom-20 right-[5%] sm:bottom-32 sm:right-[8%]">
                    <div className="backdrop-blur-md p-3 sm:p-6 rounded-2xl sm:rounded-3xl shadow-floating animate-spin3d border-2 border-slate-300/50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.08)', animationDuration: '30s' }}>
                        <Users className="h-6 w-6 sm:h-12 sm:w-12 text-black" />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold mb-8 shadow-sm animate-float">
                        <Sparkles className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" />
                        <span>The Future of Professional Work</span>
                    </div>

                    <TypewriterHero settings={settings} />

                    <p className="mt-4 max-w-2xl mx-auto text-xl md:text-2xl text-slate-500 font-medium leading-relaxed">
                        {settings.hero_subheadline || 'Find verified gigs, get paid instantly, and take full control of your earnings. Simple, secure, and built for you.'}
                    </p>

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                        <Link to="/post-gig" className="btn-primary px-10 py-5 text-lg rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
                            {settings.hero_cta_text_1 || 'Post a Gig'}
                        </Link>
                        <Link to="/professionals" className="btn-secondary px-10 py-5 text-lg rounded-full hover:-translate-y-1 transition-all bg-white">
                            {settings.hero_cta_text_3 || 'Hire Pros'}
                        </Link>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Link to="/gigs" className="btn-secondary px-10 py-5 text-lg rounded-full hover:-translate-y-1 transition-all bg-slate-50 border-2 border-slate-200">
                            Find Work
                        </Link>
                    </div>

                    <div className="mt-20 relative max-w-5xl mx-auto">
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#FACC15] to-black opacity-20 blur-2xl rounded-[3rem] -z-10"></div>
                        <img
                            src={settings.hero_image_url || "/artifacts/fintech_hero_mockup.png"}
                            alt="App Preview"
                            className="w-full rounded-[2.5rem] shadow-2xl border border-white/50 bg-white"
                        />
                        {/* Floating Stats - Decoration */}
                        <div className="absolute -right-8 top-20 bg-white p-4 rounded-2xl shadow-floating hidden lg:block animate-float">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Revenue</p>
                                    <p className="text-lg font-bold text-slate-900">+124%</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -left-8 bottom-20 bg-white p-4 rounded-2xl shadow-floating hidden lg:block animate-float-delayed">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-[#FACC15]/20 rounded-full flex items-center justify-center">
                                    <Star className="h-5 w-5 text-black fill-black" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-bold uppercase">Rating</p>
                                    <p className="text-lg font-bold text-slate-900">4.9/5.0</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-32 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-bold text-slate-900 mb-4">Why Kellasa?</h2>
                        <p className="text-xl text-slate-500 max-w-2xl mx-auto">Everything you need to succeed in the gig economy, all in one place.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Zap,
                                title: settings.feature_1_title || 'Instant Connections',
                                desc: settings.feature_1_desc || 'Connect with talent or clients in seconds. No lengthy waiting periods.',
                                color: 'bg-[#FACC15]'
                            },
                            {
                                icon: Shield,
                                title: settings.feature_2_title || 'Verified Profiles',
                                desc: settings.feature_2_desc || 'Every user is verified via mobile number to ensure a safe community.',
                                color: 'bg-green-400'
                            },
                            {
                                icon: TrendingUp,
                                title: settings.feature_3_title || 'Grow Your Income',
                                desc: settings.feature_3_desc || 'Access high-paying gigs and keep 100% of your earnings.',
                                color: 'bg-blue-400'
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="bg-white p-10 rounded-[2.5rem] shadow-soft border border-slate-100 hover:shadow-floating transition-all duration-300 group">
                                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-8 rotate-3 group-hover:rotate-6 transition-transform`}>
                                    <feature.icon className="h-8 w-8 text-black" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                                <p className="text-lg text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-2">Featured Gigs</h2>
                            <p className="text-lg text-slate-500">Fresh opportunities posted just now.</p>
                        </div>
                        <Link to="/gigs" className="btn-secondary rounded-full px-6 py-3 text-sm">
                            View all Gigs <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                    <GigList limit={3} />
                </div>
            </section>

            {/* Carousel Subscription Section */}
            {(!profile?.subscription_expires_at || new Date(profile.subscription_expires_at) < new Date()) && (
                <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
                    {/* Background noise/pattern */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16 relative z-10">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold mb-8 border border-white/20">
                            <Sparkles className="h-4 w-4 text-[#FACC15]" />
                            <span className="text-[#FACC15]">Premium Plans</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            Unlock Full Access
                        </h2>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto font-medium">
                            Get access to direct contact numbers and land your next gig faster.
                        </p>
                    </div>

                    <div className="relative z-10 w-full">
                        {/* Centered Scroll Container */}
                        <div className="flex justify-center mb-8">
                            <div className="flex items-center gap-4">
                                <button onClick={handlePrev} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"><ChevronLeft className="h-6 w-6" /></button>
                                <div className="flex gap-2">
                                    {plans.map((_, i) => (
                                        <div key={i} className={`h-2 rounded-full transition-all ${i === currentIndex ? 'w-8 bg-[#FACC15]' : 'w-2 bg-white/20'}`} />
                                    ))}
                                </div>
                                <button onClick={handleNext} className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all text-white"><ChevronRight className="h-6 w-6" /></button>
                            </div>
                        </div>

                        <div
                            ref={carouselRef}
                            className="flex gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 sm:px-[calc(50%-12rem)] pb-12"
                            style={{ scrollbarWidth: 'none' }}
                        >
                            {plans.map((plan, index) => (
                                <div
                                    key={plan.id}
                                    className={clsx(
                                        'flex-shrink-0 w-80 sm:w-96 snap-center rounded-[2.5rem] overflow-hidden transition-all duration-500 ease-out transform',
                                        currentIndex === index ? 'scale-100 opacity-100' : 'scale-90 opacity-50'
                                    )}
                                >
                                    <div className={clsx(
                                        'h-full p-8 flex flex-col',
                                        plan.popular
                                            ? 'bg-[#FACC15] text-slate-900'
                                            : 'bg-white text-slate-900'
                                    )}>
                                        <div className="flex justify-between items-start mb-6">
                                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                                            {plan.popular && (
                                                <span className="bg-black text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                                    Popular
                                                </span>
                                            )}
                                        </div>

                                        <div className="mb-8">
                                            <span className="text-5xl font-extrabold tracking-tighter">₹{plan.price}</span>
                                            <span className="text-lg font-bold opacity-60">/{plan.duration_days === 1 ? 'day' : 'mo'}</span>
                                        </div>

                                        <ul className="space-y-4 mb-8 flex-1">
                                            {plan.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <Check className="h-5 w-5 shrink-0 mt-0.5" strokeWidth={3} />
                                                    <span className="font-medium text-sm leading-tight">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <button
                                            onClick={() => handleSubscribe(plan)}
                                            disabled={loading}
                                            className={clsx(
                                                'w-full py-4 rounded-full font-bold text-lg transition-all transform active:scale-95',
                                                plan.popular
                                                    ? 'bg-black text-white hover:bg-slate-800 shadow-xl'
                                                    : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                            )}
                                        >
                                            {loading ? 'Processing...' : `Get Started`}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}

// Typewriter Hero Component
function TypewriterHero({ settings }) {
    const line1 = useTypewriter('Build your', 80, 500)
    const line2 = useTypewriter('money future.', 80, line1.isComplete ? 1500 : 0)

    return (
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-slate-900 mb-8 leading-[1.1] min-h-[200px] md:min-h-[280px]">
            {settings.hero_headline || (
                <>
                    <div className="mb-4">
                        {line1.displayedText}
                        {!line1.isComplete && <span className="typewriter-cursor"></span>}
                    </div>
                    <span className="relative inline-block text-black">
                        {line2.displayedText}
                        {line2.isComplete && (
                            <svg className="absolute w-full h-4 -bottom-1 left-0 text-[#FACC15] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="12" fill="none" />
                            </svg>
                        )}
                        {line1.isComplete && !line2.isComplete && <span className="typewriter-cursor"></span>}
                    </span>
                </>
            )}
        </h1>
    )
}
