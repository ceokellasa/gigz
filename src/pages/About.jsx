import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Users, Target, Heart, Award, Zap } from 'lucide-react'
import { AboutPageSkeleton } from '../components/Skeleton'

export default function About() {
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 800)
        return () => clearTimeout(timer)
    }, [])

    if (loading) {
        return <AboutPageSkeleton />
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-[#FACC15]/10 rounded-full blur-[100px]" />

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-slate-900 text-sm font-bold mb-8">
                        <Sparkles className="h-4 w-4 fill-[#FACC15] text-[#FACC15]" />
                        <span>About Kellasa</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-900 mb-8 leading-[1.1]">
                        Connecting talent <br />
                        <span className="relative inline-block">
                            with opportunity.
                            <svg className="absolute w-full h-4 -bottom-1 left-0 text-[#FACC15] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="12" fill="none" />
                            </svg>
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed max-w-3xl mx-auto">
                        Kellasa is a modern platform that bridges the gap between skilled professionals and clients who need their expertise. We're building the future of work, one gig at a time.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-soft border border-slate-100">
                            <div className="w-16 h-16 bg-[#FACC15] rounded-2xl flex items-center justify-center mb-6 rotate-3">
                                <Target className="h-8 w-8 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Mission</h3>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                To empower professionals and businesses by creating a seamless, transparent marketplace for services and opportunities.
                            </p>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-soft border border-slate-100">
                            <div className="w-16 h-16 bg-green-400 rounded-2xl flex items-center justify-center mb-6 rotate-3">
                                <Heart className="h-8 w-8 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Values</h3>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                Trust, transparency, and quality. We verify every professional and ensure fair opportunities for all members of our community.
                            </p>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] shadow-soft border border-slate-100">
                            <div className="w-16 h-16 bg-blue-400 rounded-2xl flex items-center justify-center mb-6 rotate-3">
                                <Zap className="h-8 w-8 text-black" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">Our Vision</h3>
                            <p className="text-lg text-slate-500 font-medium leading-relaxed">
                                To become the most trusted platform for professional services, making quality work accessible to everyone, everywhere.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-4xl font-bold text-slate-900 mb-8 text-center">Our Story</h2>
                    <div className="prose prose-lg max-w-none">
                        <p className="text-lg text-slate-600 leading-relaxed mb-6">
                            Kellasa was founded with a simple idea: connecting skilled professionals with people who need their services should be easy, transparent, and fair. We saw too many talented individuals struggling to find work, and too many clients unable to find reliable professionals.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed mb-6">
                            Today, Kellasa serves thousands of professionals and clients across various industries. From home services to creative work, from technical expertise to consulting, we're building a community where quality work meets genuine opportunity.
                        </p>
                        <p className="text-lg text-slate-600 leading-relaxed">
                            We're committed to creating a platform that respects both professionals and clients, ensuring fair compensation, verified profiles, and a seamless experience for everyone involved.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-black text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div>
                            <div className="text-5xl font-bold text-[#FACC15] mb-4">10,000+</div>
                            <div className="text-xl text-slate-300 font-medium">Verified Professionals</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-[#FACC15] mb-4">50,000+</div>
                            <div className="text-xl text-slate-300 font-medium">Gigs Completed</div>
                        </div>
                        <div>
                            <div className="text-5xl font-bold text-[#FACC15] mb-4">98%</div>
                            <div className="text-xl text-slate-300 font-medium">Satisfaction Rate</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">Join Our Community</h2>
                    <p className="text-xl text-slate-500 mb-10 font-medium">
                        Whether you're looking for work or looking to hire, Kellasa is here to help you succeed.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/signup" className="btn-primary rounded-full px-10 py-5 text-lg">
                            Get Started
                        </Link>
                        <Link to="/professionals" className="btn-secondary rounded-full px-10 py-5 text-lg">
                            Browse Professionals
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
