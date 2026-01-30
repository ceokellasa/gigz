import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
    MapPin, Briefcase, DollarSign, Globe, Linkedin, Phone,
    CheckCircle, Calendar, Award, Image as ImageIcon,
    ChevronLeft, Mail, MessageSquare
} from 'lucide-react'

export default function ProfessionalDetails() {
    const { id } = useParams()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
                <p className="text-slate-600 mb-6">The professional profile you're looking for doesn't exist.</p>
                <Link to="/professionals" className="btn-primary">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to Professionals
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <Link to="/professionals" className="inline-flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to List
            </Link>

            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8 border border-slate-100">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32 md:h-48"></div>
                <div className="px-6 md:px-10 pb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-16 mb-6 gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full ring-4 ring-white bg-white overflow-hidden shadow-lg">
                                {profile.profiles?.avatar_url ? (
                                    <img
                                        src={profile.profiles.avatar_url}
                                        alt={profile.profiles.full_name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-3xl font-bold text-slate-400">
                                        {profile.profiles?.full_name?.[0] || 'U'}
                                    </div>
                                )}
                            </div>
                            {profile.available && (
                                <div className="absolute bottom-2 right-2 h-4 w-4 md:h-5 md:w-5 bg-green-500 border-2 border-white rounded-full" title="Available for work"></div>
                            )}
                        </div>

                        {/* Name & Headline */}
                        <div className="flex-1 pt-2 md:pt-0">
                            <h1 className="text-3xl font-bold text-slate-900 mb-1">{profile.profiles?.full_name}</h1>
                            <p className="text-xl text-indigo-600 font-medium mb-2">{profile.profession}</p>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                {profile.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {profile.location}
                                    </div>
                                )}
                                {profile.age && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {profile.age} years old
                                    </div>
                                )}
                                {profile.years_of_experience && (
                                    <div className="flex items-center gap-1">
                                        <Briefcase className="h-4 w-4" />
                                        {profile.years_of_experience} years exp.
                                    </div>
                                )}
                                {profile.willing_to_travel && (
                                    <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-semibold">
                                        <CheckCircle className="h-3 w-3" />
                                        Willing to travel
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-4 md:mt-0 w-full md:w-auto">
                            <Link
                                to={`/messages?userId=${profile.user_id}`}
                                className="flex-1 md:flex-none btn-secondary flex items-center justify-center gap-2"
                            >
                                <MessageSquare className="h-4 w-4" />
                                Message
                            </Link>
                            {profile.phone && (
                                <a href={`tel:${profile.phone}`} className="flex-1 md:flex-none btn-primary flex items-center justify-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    Call
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <div className="mt-6 border-t border-slate-100 pt-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">About</h3>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{profile.bio}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column (Skills, Rates, Contact) */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Rates Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-indigo-600" />
                            Pricing
                        </h3>
                        <div className="space-y-4">
                            {profile.contact_for_pricing ? (
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-600">Hourly Rate</span>
                                    <span className="font-bold text-indigo-600 text-lg">Contact for Pricing</span>
                                </div>
                            ) : profile.hourly_rate && (
                                <div className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                    <span className="text-slate-600">Hourly Rate</span>
                                    <span className="font-bold text-slate-900 text-lg">₹{profile.hourly_rate}/hr</span>
                                </div>
                            )}
                            {(profile.project_rate_min || profile.project_rate_max) && (
                                <div className="py-2">
                                    <span className="text-slate-600 block mb-1">Project Rate</span>
                                    <span className="font-bold text-slate-900 text-lg">
                                        {profile.project_rate_min ? `₹${profile.project_rate_min}` : ''}
                                        {profile.project_rate_max ? ` - ₹${profile.project_rate_max}` : '+'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Skills Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Award className="h-5 w-5 text-indigo-600" />
                            Skills
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {profile.skills?.map((skill, index) => (
                                <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
                                    {skill}
                                </span>
                            ))}
                            {(!profile.skills || profile.skills.length === 0) && (
                                <p className="text-slate-400 italic">No skills listed</p>
                            )}
                        </div>
                    </div>

                    {/* Contact Links */}
                    {(profile.website || profile.linkedin) && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Connect</h3>
                            <div className="space-y-3">
                                {profile.website && (
                                    <a
                                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Globe className="h-4 w-4" />
                                        </div>
                                        <span className="truncate">Website</span>
                                    </a>
                                )}
                                {profile.linkedin && (
                                    <a
                                        href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-slate-600 hover:text-indigo-600 transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Linkedin className="h-4 w-4" />
                                        </div>
                                        <span className="truncate">LinkedIn</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column (Portfolio, Certifications) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Previous Works / Portfolio */}
                    {profile.previous_works && profile.previous_works.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <ImageIcon className="h-6 w-6 text-indigo-600" />
                                Portfolio & Previous Work
                            </h3>

                            <div className="space-y-8">
                                {profile.previous_works.map((work, index) => (
                                    <div key={index} className="relative pl-6 border-l-2 border-slate-100 last:border-0 pb-8 last:pb-0">
                                        <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-indigo-600 ring-4 ring-white"></div>
                                        <h4 className="text-lg font-bold text-slate-900">{work.title}</h4>
                                        <p className="text-sm text-slate-400 mb-2">{work.year}</p>
                                        <p className="text-slate-600 mb-4">{work.description}</p>
                                        {work.image_url && (
                                            <img
                                                src={work.image_url}
                                                alt={work.title}
                                                className="w-full md:w-2/3 h-48 rounded-lg object-cover border border-slate-100 shadow-sm"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Certifications */}
                    {profile.certifications && profile.certifications.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Award className="h-6 w-6 text-indigo-600" />
                                Certifications
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.certifications.map((cert, index) => (
                                    <div key={index} className="flex gap-4 p-4 rounded-lg bg-slate-50 border border-slate-100">
                                        {cert.image_url ? (
                                            <img
                                                src={cert.image_url}
                                                alt={cert.name}
                                                className="h-16 w-16 rounded object-cover border border-slate-200 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <Award className="h-5 w-5" />
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{cert.name}</h4>
                                            <p className="text-sm text-slate-600">{cert.issuer}</p>
                                            <p className="text-xs text-slate-400 mt-1">{cert.year}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
