import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
    MapPin, Briefcase, DollarSign, Globe, Linkedin, Phone,
    Award, Image as ImageIcon,
    ChevronLeft, MessageSquare, Share2, Sparkles, ExternalLink, Star
} from 'lucide-react'
import { useToast } from '../components/Toast'

export default function ProfessionalDetails() {
    const { id } = useParams()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const toast = useToast()

    useEffect(() => {
        fetchProfile()
    }, [id])

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('professional_profiles')
                .select(`
                    *,
                    profiles:user_id (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setProfile(data)
        } catch (err) {
            console.error('Error fetching professional:', err)
            setError(err.message)
        } finally {
            setLoading(false)
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
                <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md w-full">
                    <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
                    <p className="text-slate-600 mb-8">The professional profile you're looking for doesn't exist or has been removed.</p>
                    <Link to="/professionals" className="btn-primary w-full justify-center">
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to Professionals
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Dark Premium Hero Background */}
            <div className="relative h-[250px] md:h-[320px] bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-900" />
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />

                {/* Back Button */}
                <div className="absolute top-6 left-4 md:left-8 z-20">
                    <Link
                        to="/professionals"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full transition-all text-sm font-medium border border-white/10"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Back
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 md:-mt-40 relative z-10">
                {/* Floating Profile Card */}
                <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden mb-8 border border-white/50 backdrop-blur-sm">
                    <div className="p-6 md:p-10">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Avatar Section */}
                            <div className="relative mx-auto md:mx-0 shrink-0">
                                <div className="h-32 w-32 md:h-40 md:w-40 rounded-3xl ring-4 ring-white shadow-2xl overflow-hidden bg-slate-100">
                                    {profile.profiles?.avatar_url ? (
                                        <img
                                            src={profile.profiles.avatar_url}
                                            alt={profile.profiles.full_name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white">
                                            {profile.profiles?.full_name?.[0] || 'U'}
                                        </div>
                                    )}
                                </div>
                                {profile.available && (
                                    <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full border-4 border-white shadow-sm flex items-center gap-1">
                                        <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                                        AVAILABLE
                                    </div>
                                )}
                            </div>

                            {/* Info Section */}
                            <div className="flex-1 text-center md:text-left pt-2">
                                <div className="mb-4">
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                                        {profile.profiles?.full_name}
                                    </h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                                            {profile.profession}
                                        </span>
                                        {profile.years_of_experience && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                                <Star className="h-3.5 w-3.5 mr-1.5" />
                                                {profile.years_of_experience} Years Exp.
                                            </span>
                                        )}
                                        {profile.location && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                <MapPin className="h-3.5 w-3.5 mr-1.5" />
                                                {profile.location}
                                            </span>
                                        )}
                                        {profile.willing_to_travel && (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                                                <Globe className="h-3.5 w-3.5 mr-1.5" />
                                                Willing to Travel
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Bio Snippet */}
                                {profile.bio && (
                                    <p className="text-slate-600 max-w-2xl text-lg leading-relaxed mb-8">
                                        {profile.bio}
                                    </p>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <Link
                                        to={`/messages?userId=${profile.user_id}`}
                                        className="inline-flex items-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all hover:-translate-y-0.5 shadow-lg shadow-slate-900/20"
                                    >
                                        <MessageSquare className="h-5 w-5 mr-2" />
                                        Message
                                    </Link>

                                    {profile.phone && (
                                        <a
                                            href={`tel:${profile.phone}`}
                                            className="inline-flex items-center px-6 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-xl font-bold hover:border-indigo-600 hover:text-indigo-600 transition-all"
                                        >
                                            <Phone className="h-5 w-5 mr-2" />
                                            Call
                                        </a>
                                    )}

                                    <button
                                        onClick={handleShare}
                                        className="inline-flex items-center px-4 py-3 bg-white text-slate-600 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all"
                                        title="Share Profile"
                                    >
                                        <Share2 className="h-5 w-5" />
                                        <span className="hidden sm:inline sm:ml-2">Share</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN */}
                    <div className="space-y-8">
                        {/* Skills Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                Skills & Expertise
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.skills?.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl text-sm font-semibold border border-slate-200 hover:border-indigo-200 transition-all cursor-default"
                                    >
                                        {skill}
                                    </span>
                                ))}
                                {(!profile.skills || profile.skills.length === 0) && (
                                    <p className="text-slate-400 italic text-sm">No specific skills listed.</p>
                                )}
                            </div>
                        </div>

                        {/* Pricing Card */}
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                Pricing
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl">
                                    <span className="text-slate-600 font-medium">Hourly Rate</span>
                                    {profile.contact_for_pricing ? (
                                        <span className="text-indigo-600 font-bold">Ask for Quote</span>
                                    ) : (
                                        <span className="text-slate-900 font-bold text-xl">
                                            ₹{profile.hourly_rate || '0'}<span className="text-sm text-slate-400 font-normal">/hr</span>
                                        </span>
                                    )}
                                </div>
                                {(profile.project_rate_min || profile.project_rate_max) && (
                                    <div className="p-4 border border-slate-100 rounded-2xl">
                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1 block">Project Range</span>
                                        <span className="text-slate-900 font-bold text-lg">
                                            {profile.project_rate_min ? `₹${profile.project_rate_min}` : ''}
                                            {profile.project_rate_max ? ` - ₹${profile.project_rate_max}` : '+'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Connect Card */}
                        {(profile.website || profile.linkedin) && (
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Connect</h3>
                                <div className="flex flex-col gap-3">
                                    {profile.website && (
                                        <a
                                            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="block font-medium text-slate-900">Website</span>
                                                <span className="text-xs text-slate-400 truncate block max-w-[200px]">{profile.website}</span>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-indigo-400" />
                                        </a>
                                    )}
                                    {profile.linkedin && (
                                        <a
                                            href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                        >
                                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                                <Linkedin className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1">
                                                <span className="block font-medium text-slate-900">LinkedIn</span>
                                                <span className="text-xs text-slate-400">View Profile</span>
                                            </div>
                                            <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-blue-400" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Portfolio Grid */}
                        {profile.previous_works && profile.previous_works.length > 0 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                            <ImageIcon className="h-6 w-6" />
                                        </div>
                                        Portfolio
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {profile.previous_works.map((work, index) => (
                                        <div key={index} className="group rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 hover:shadow-lg transition-all duration-300">
                                            {work.image_url ? (
                                                <div className="h-48 overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors z-10" />
                                                    <img
                                                        src={work.image_url}
                                                        alt={work.title}
                                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-48 bg-slate-200 flex items-center justify-center">
                                                    <ImageIcon className="h-12 w-12 text-slate-300" />
                                                </div>
                                            )}
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">{work.title}</h4>
                                                    <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-1 rounded">{work.year}</span>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed">{work.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Certifications List */}
                        {profile.certifications && profile.certifications.length > 0 && (
                            <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                                        <Award className="h-6 w-6" />
                                    </div>
                                    Certifications
                                </h3>

                                <div className="grid grid-cols-1 gap-4">
                                    {profile.certifications.map((cert, index) => (
                                        <div key={index} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-orange-200 transition-colors">
                                            {cert.image_url ? (
                                                <img
                                                    src={cert.image_url}
                                                    alt={cert.name}
                                                    className="h-16 w-16 rounded-xl object-cover bg-white shadow-sm"
                                                />
                                            ) : (
                                                <div className="h-16 w-16 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                                                    <Award className="h-8 w-8" />
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-bold text-slate-900 text-lg">{cert.name}</h4>
                                                <p className="text-slate-600 font-medium">{cert.issuer}</p>
                                                <p className="text-sm text-slate-400 mt-0.5">{cert.year}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
