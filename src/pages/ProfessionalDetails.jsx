/**
 * Professional Details Page
 * Displays detailed information about a specific professional.
 * Vibe: Clean, Minimalist, White, Yellow Accents.
 */
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
    MapPin, Briefcase, DollarSign, Globe, Linkedin, Phone,
    Award, Image as ImageIcon,
    ChevronLeft, MessageSquare, Share2, Sparkles, ExternalLink, Star, CheckCircle, ArrowRight
} from 'lucide-react'
import { useToast } from '../components/Toast'

export default function ProfessionalDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const toast = useToast()
    const [products, setProducts] = useState([])

    const handleBookService = (service) => {
        if (!profile?.user_id) return
        const message = `Hi, I'm interested in your service: ${service.title} for ₹${service.price}.`
        navigate(`/messages?userId=${profile.user_id}&message=${encodeURIComponent(message)}`)
    }

    useEffect(() => {
        fetchProfile()
        fetchServices()
        fetchProducts()
    }, [id])

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('digital_products')
            .select('*')
            .eq('professional_id', id)
        setProducts(data || [])
    }

    const fetchProfile = async () => {
        try {
            console.log('Fetching professional profile for ID:', id)

            // First, get the professional profile
            const { data: profData, error: profError } = await supabase
                .from('professional_profiles')
                .select('*')
                .eq('user_id', id)
                .single()

            if (profError) throw profError

            // Then, get the user profile data
            const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('full_name, avatar_url, email, phone_number')
                .eq('id', id)
                .single()

            if (userError) console.warn('User data fetch failed:', userError)

            // Combine the data
            const combinedData = {
                ...profData,
                profiles: userData
            }

            console.log('Profile query result:', { data: combinedData })

            setProfile(combinedData)
        } catch (err) {
            console.error('Error fetching professional:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const fetchServices = async () => {
        try {
            const { data, error } = await supabase
                .from('professional_services')
                .select('*')
                .eq('professional_id', id)
                .order('price', { ascending: true })

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching services:', error)
                // Don't throw, just empty array
            }

            // Mock services for demo if none exist
            if (!data || data.length === 0) {
                setServices([
                    {
                        id: 'mock-1',
                        title: 'Consultation Call',
                        description: '30-minute video call to discuss your project requirements and feasibility.',
                        price: 499,
                        delivery_time_days: 1
                    },
                    {
                        id: 'mock-2',
                        title: 'Standard Service Package',
                        description: 'Complete execution of the standard task with 1 revision included.',
                        price: 2499,
                        delivery_time_days: 3
                    },
                    {
                        id: 'mock-3',
                        title: 'Premium Project',
                        description: 'End-to-end full service with source files, priority support, and unlimited revisions.',
                        price: 9999,
                        delivery_time_days: 7
                    }
                ])
            } else {
                setServices(data)
            }
        } catch (err) {
            console.error('Error in fetchServices:', err)
        }
    }

    const handleShare = async () => {
        const shareData = {
            title: `Check out ${profile?.profiles?.full_name} on Kellasa`,
            text: `I found this professional on Kellasa: ${profile?.profession}`,
            url: window.location.href
        }

        try {
            if (navigator.share) {
                await navigator.share(shareData)
            } else {
                await navigator.clipboard.writeText(shareData.url)
                toast.success('Link copied to clipboard!')
            }
        } catch (err) {
            console.error('Error sharing:', err)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
                <div className="bg-slate-50 p-12 rounded-[3rem] text-center max-w-md w-full border border-slate-100">
                    <div className="h-24 w-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
                    <p className="text-slate-500 mb-8">The professional profile you're looking for doesn't exist.</p>
                    <Link to="/professionals" className="btn-primary w-full justify-center rounded-full">
                        <ChevronLeft className="h-5 w-5 mr-2" />
                        Back to Professionals
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Minimalist Top Bar */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link
                        to="/professionals"
                        className="inline-flex items-center gap-2 px-4 py-2 hover:bg-slate-50 rounded-full transition-all text-sm font-bold text-slate-900"
                    >
                        <ChevronLeft className="h-5 w-5" />
                        Back
                    </Link>
                    <div className="text-sm font-bold text-slate-400">PROFILE DETAILS</div>
                    <button onClick={handleShare} className="p-2 hover:bg-slate-50 rounded-full">
                        <Share2 className="h-5 w-5 text-slate-900" />
                    </button>
                </div>
            </div>

            <div className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row gap-12 items-start mb-16">
                    {/* Large Avatar */}
                    <div className="relative shrink-0">
                        <div className="h-48 w-48 md:h-64 md:w-64 rounded-[3rem] overflow-hidden bg-slate-50 shadow-soft">
                            {profile.profiles?.avatar_url ? (
                                <img
                                    src={profile.profiles.avatar_url}
                                    alt={profile.profiles.full_name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-6xl font-bold text-slate-200 bg-slate-50">
                                    {profile.profiles?.full_name?.[0] || 'U'}
                                </div>
                            )}
                        </div>
                        {profile.available && (
                            <div className="absolute -bottom-4 right-8 bg-[#FACC15] text-slate-900 text-sm font-black px-6 py-2 rounded-full shadow-lg transform rotate-[-2deg]">
                                AVAILABLE
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 pt-4">
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-4 tracking-tighter leading-none">
                            {profile.profiles?.full_name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <span className="text-2xl font-medium text-slate-500">
                                {profile.profession}
                            </span>
                            <div className="h-2 w-2 rounded-full bg-slate-200" />
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-slate-400" />
                                <span className="text-lg font-medium text-slate-500">{profile.location}</span>
                            </div>
                        </div>

                        {/* Stats / Badges */}
                        <div className="flex flex-wrap gap-3 mb-10">
                            {profile.years_of_experience && (
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-slate-50 text-slate-900 border border-slate-100">
                                    <Star className="h-4 w-4 mr-2 text-[#FACC15] fill-[#FACC15]" />
                                    {profile.years_of_experience} Years Experience
                                </span>
                            )}
                            {profile.willing_to_travel && (
                                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold bg-slate-50 text-slate-900 border border-slate-100">
                                    <Globe className="h-4 w-4 mr-2 text-blue-500" />
                                    Willing to Travel
                                </span>
                            )}
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to={`/messages?userId=${profile.user_id}`}
                                className="btn-primary rounded-full px-10 py-4 text-base"
                            >
                                <MessageSquare className="h-5 w-5 mr-2" />
                                Send Message
                            </Link>

                            {profile.phone && (
                                <a
                                    href={`tel:${profile.phone}`}
                                    className="btn-secondary rounded-full px-10 py-4 text-base"
                                >
                                    <Phone className="h-5 w-5 mr-2" />
                                    Call Now
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content - Left */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Services Section (New) */}
                        <section>
                            <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Briefcase className="h-6 w-6 text-[#FACC15]" />
                                Service Packages
                            </h3>
                            {services.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {services.map(service => (
                                        <div key={service.id} className="border border-slate-100 rounded-xl p-6 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-lg text-slate-900">{service.title}</h3>
                                                <span className="text-indigo-600 font-bold bg-indigo-50 px-3 py-1 rounded-full text-sm">
                                                    ₹{service.price}
                                                </span>
                                            </div>
                                            <p className="text-slate-600 text-sm mb-4 line-clamp-2">{service.description}</p>
                                            <button
                                                onClick={() => handleBookService(service)}
                                                className="w-full btn-secondary text-sm py-2"
                                            >
                                                Book Now
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">No services listed yet.</p>
                            )}
                        </section>

                        {/* Digital Products Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <DollarSign className="h-6 w-6 text-indigo-600" />
                                Digital Products
                            </h2>
                            {products.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {products.map(product => (
                                        <Link key={product.id} to={`/marketplace/${product.id}`} className="group block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all">
                                            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                                <img src={product.cover_image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                            </div>
                                            <div className="p-4">
                                                <h3 className="font-bold text-slate-900 truncate mb-1 text-sm">{product.title}</h3>
                                                <p className="text-indigo-600 font-bold">₹{product.price}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic">No digital products listed.</p>
                            )}
                        </section>

                        {/* Bio */}
                        {profile.bio && (
                            <section>
                                <h3 className="text-2xl font-bold text-slate-900 mb-6">About</h3>
                                <div className="text-xl text-slate-500 leading-relaxed font-medium">
                                    {profile.bio}
                                </div>
                            </section>
                        )}

                        {/* Portfolio Grid */}
                        {profile.previous_works && profile.previous_works.length > 0 && (
                            <section>
                                <h3 className="text-2xl font-bold text-slate-900 mb-8 flex items-center justify-between">
                                    <span>Selected Works</span>
                                    <span className="text-sm font-normal text-slate-400">{profile.previous_works.length} projects</span>
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {profile.previous_works.map((work, index) => (
                                        <div key={index} className="group rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 cursor-pointer">
                                            {work.image_url ? (
                                                <div className="h-64 overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
                                                    <img
                                                        src={work.image_url}
                                                        alt={work.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-64 bg-slate-200 flex items-center justify-center">
                                                    <ImageIcon className="h-12 w-12 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-slate-900 text-xl group-hover:underline decoration-2 decoration-[#FACC15] underline-offset-4">{work.title}</h4>
                                                    <span className="text-xs font-bold bg-white px-3 py-1 rounded-full border border-slate-100">{work.year}</span>
                                                </div>
                                                <p className="text-slate-500 font-medium">{work.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Sidebar - Right */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Rate Card */}
                        <div className="bg-[#F9FAFB] rounded-[2.5rem] p-8 border border-slate-100">
                            <div className="mb-8">
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Hourly Rate</span>
                                <div className="flex items-baseline gap-1">
                                    {profile.contact_for_pricing ? (
                                        <span className="text-3xl font-bold text-slate-900">Ask for Quote</span>
                                    ) : (
                                        <>
                                            <span className="text-5xl font-bold text-slate-900 tracking-tighter">₹{profile.hourly_rate || '0'}</span>
                                            <span className="text-slate-400 font-medium">/hr</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {(profile.project_rate_min || profile.project_rate_max) && (
                                <div className="mb-0">
                                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-2">Project Range</span>
                                    <div className="text-2xl font-bold text-slate-900">
                                        {profile.project_rate_min ? `₹${profile.project_rate_min}` : ''}
                                        {profile.project_rate_max ? ` - ₹${profile.project_rate_max}` : '+'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Skills */}
                        <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-6">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills?.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-3 bg-white text-slate-900 rounded-xl text-sm font-bold border-2 border-slate-100 shadow-sm"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {(!profile.skills || profile.skills.length === 0) && (
                                    <p className="text-slate-400 font-medium italic">No specific skills listed.</p>
                                )}
                            </div>
                        </div>

                        {/* Certifications */}
                        {profile.certifications && profile.certifications.length > 0 && (
                            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-6">Certifications</h3>
                                <div className="space-y-4">
                                    {profile.certifications.map((cert, index) => (
                                        <div key={index} className="flex items-start gap-4">
                                            <div className="h-10 w-10 shrink-0 rounded-full bg-[#FACC15]/20 flex items-center justify-center text-slate-900 mt-1">
                                                <Award className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{cert.name}</h4>
                                                <p className="text-sm text-slate-500 font-medium">{cert.issuer} • {cert.year}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Links */}
                        {(profile.website || profile.linkedin) && (
                            <div className="flex flex-col gap-3">
                                {profile.website && (
                                    <a
                                        href={profile.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-50 hover:bg-slate-100 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Globe className="h-6 w-6 text-slate-400 group-hover:text-black transition-colors" />
                                            <span className="font-bold text-slate-900">Website</span>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-slate-300" />
                                    </a>
                                )}
                                {profile.linkedin && (
                                    <a
                                        href={profile.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-between p-6 rounded-[2rem] bg-[#0077b5]/5 hover:bg-[#0077b5]/10 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Linkedin className="h-6 w-6 text-[#0077b5]" />
                                            <span className="font-bold text-[#0077b5]">LinkedIn</span>
                                        </div>
                                        <ExternalLink className="h-4 w-4 text-[#0077b5]/50" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div >
        </div >
    )
}
