import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { DollarSign, Clock, Calendar, User, MessageSquare, CheckCircle, MapPin, Globe, Briefcase, AlertCircle, Phone, Lock, Eye } from 'lucide-react'
import Chat from '../../components/Chat'
import { CategoryIcon } from '../../components/CategoryIcon'

export default function GigDetails() {
    const { id } = useParams()
    const { user, profile, refreshProfile } = useAuth()
    const navigate = useNavigate()
    const [gig, setGig] = useState(null)
    const [loading, setLoading] = useState(true)
    const [applying, setApplying] = useState(false)
    const [coverLetter, setCoverLetter] = useState('')
    const [hasApplied, setHasApplied] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [contactNumber, setContactNumber] = useState(null)
    const [numberRevealed, setNumberRevealed] = useState(false)
    const [revealing, setRevealing] = useState(false)

    const isSubscribed = profile?.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date()

    useEffect(() => {
        fetchGigDetails()
        incrementViewCount()
    }, [id])

    const incrementViewCount = async () => {
        try {
            await supabase.rpc('increment_gig_view', { gig_id: id })
        } catch (error) {
            console.error('Error incrementing view count:', error)
        }
    }

    const fetchGigDetails = async () => {
        try {
            const { data, error } = await supabase
                .from('gigs')
                .select('*, profiles:client_id(full_name, avatar_url)')
                .eq('id', id)
                .single()

            if (error) throw error
            setGig(data)
        } catch (error) {
            console.error('Error fetching gig details:', error)
        } finally {
            setLoading(false)
        }
    }

    const revealNumber = async () => {
        if (!user || !profile || !isSubscribed) return

        // Check if user has reveals remaining
        if (!profile.reveals_remaining || profile.reveals_remaining <= 0) {
            alert('You have no reveals remaining. Please upgrade your subscription.')
            return
        }

        setRevealing(true)

        try {
            // Decrement reveals_remaining
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    reveals_remaining: profile.reveals_remaining - 1,
                    reveals_used: (profile.reveals_used || 0) + 1
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            // Fetch the actual number
            const { data, error } = await supabase
                .from('gigs')
                .select('mobile_number')
                .eq('id', id)
                .single()

            if (error) throw error

            if (data?.mobile_number) {
                setContactNumber(data.mobile_number)
                setNumberRevealed(true)
            }


            // Refresh profile to update reveals count
            await refreshProfile()
        } catch (error) {
            console.error('Error revealing number:', error)
            alert(`Failed to reveal number: ${error.message || 'Please try again.'}`)
        } finally {
            setRevealing(false)
        }
    }


    const checkApplicationStatus = async () => {
        const { data } = await supabase
            .from('applications')
            .select('id')
            .eq('gig_id', id)
            .eq('worker_id', user.id)
            .single()

        if (data) setHasApplied(true)
    }

    const handleApply = async (e) => {
        e.preventDefault()
        setApplying(true)
        try {
            const { error } = await supabase.from('applications').insert([
                {
                    gig_id: id,
                    worker_id: user.id,
                    cover_letter: coverLetter,
                },
            ])

            if (error) throw error
            setHasApplied(true)
            alert('Application submitted successfully!')
        } catch (error) {
            alert(error.message)
        } finally {
            setApplying(false)
        }
    }

    const updateStatus = async (newStatus) => {
        try {
            const { error } = await supabase
                .from('gigs')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error
            setGig({ ...gig, status: newStatus })
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    if (loading) return <div className="p-8 text-center">Loading...</div>
    if (!gig) return <div className="p-8 text-center">Gig not found</div>

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="glass-panel rounded-2xl overflow-hidden">
                {/* Gig Image Header */}
                <div className="h-64 w-full relative bg-slate-100 flex items-center justify-center">
                    {gig.image_url ? (
                        <>
                            <img src={gig.image_url} alt={gig.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </>
                    ) : (
                        <div className="text-slate-300">
                            <CategoryIcon category={gig.category} className="h-24 w-24" />
                        </div>
                    )}
                </div>

                <div className="px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {gig.category}
                                </span>
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${gig.status === 'open' ? 'bg-green-100 text-green-800' :
                                    gig.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                        gig.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-slate-100 text-slate-800'
                                    }`}>
                                    {gig.status.replace('_', ' ')}
                                </span>
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-4">{gig.title}</h1>

                            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
                                <div className="flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    {gig.profiles?.full_name || 'Unknown'}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Posted {new Date(gig.created_at).toLocaleDateString()}
                                </div>
                                {gig.is_remote ? (
                                    <div className="flex items-center gap-1 text-green-600 font-medium">
                                        <Globe className="h-4 w-4" />
                                        Remote
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        {gig.location || 'Location not specified'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 min-w-[200px]">
                            <div className="bg-indigo-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-indigo-600 font-medium mb-1">Budget</p>
                                <p className="text-2xl font-bold text-indigo-700">
                                    {gig.budget === 'Contact for Price' ? '' : '₹'}
                                    {gig.budget}
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 text-center">
                                <p className="text-sm text-slate-500 font-medium mb-1">Deadline</p>
                                <p className="text-lg font-semibold text-slate-700">
                                    {gig.deadline ? new Date(gig.deadline).toLocaleDateString() : 'No Deadline'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info Box - Reveal Number */}
                    <div className="mt-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Client Contact</h3>
                        {isSubscribed ? (
                            numberRevealed && contactNumber ? (
                                <a
                                    href={`tel:${contactNumber}`}
                                    className="flex items-center gap-3 text-green-700 bg-green-50 p-3 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
                                >
                                    <Phone className="h-5 w-5" />
                                    <span className="font-bold text-lg">{contactNumber}</span>
                                </a>
                            ) : (
                                <button
                                    onClick={revealNumber}
                                    disabled={revealing || !profile?.reveals_remaining}
                                    className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                                >
                                    <Eye className="h-5 w-5" />
                                    {revealing ? 'Revealing...' : `Reveal Number (${profile?.reveals_remaining || 0} left)`}
                                </button>
                            )
                        ) : (
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
                                    <Lock className="h-5 w-5" />
                                    <span className="font-medium">Number Locked</span>
                                </div>
                                <Link to="/subscription" className="btn-primary w-full text-sm py-2 inline-block">
                                    Subscribe to Reveal
                                </Link>
                            </div>
                        )}
                    </div>


                    <div className="border-t border-slate-200 my-8 pt-8">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Description</h3>
                        <div className="prose prose-indigo max-w-none text-slate-600 whitespace-pre-wrap">
                            {gig.description}
                        </div>
                    </div>

                    {gig.required_skills && gig.required_skills.length > 0 && (
                        <div className="border-t border-slate-200 my-8 pt-8">
                            <h3 className="text-lg font-semibold text-slate-900 mb-4">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {gig.required_skills.map((skill, idx) => (
                                    <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                                        <Briefcase className="h-3 w-3 mr-2 text-slate-400" />
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Contact/Apply Section */}
            {user && user.id !== gig.client_id && (
                <div className="mt-8 glass-panel rounded-2xl p-8">
                    {isSubscribed ? (
                        <>
                            <h3 className="text-xl font-bold text-slate-900 mb-4">Contact Client</h3>
                            <p className="text-slate-500 mb-6">
                                You have access to the client's contact information. Reach out directly to discuss this opportunity.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                {contactNumber && (
                                    <a
                                        href={`tel:${contactNumber}`}
                                        className="btn-primary flex items-center justify-center gap-2 flex-1"
                                    >
                                        <Phone className="h-5 w-5" />
                                        Call Now
                                    </a>
                                )}
                                <button
                                    onClick={() => setShowChat(true)}
                                    className="btn-secondary flex items-center justify-center gap-2 flex-1"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                    Message Client
                                </button>
                            </div>
                            {!hasApplied && (
                                <p className="text-sm text-slate-400 mt-4 text-center">
                                    Tip: Introduce yourself via message or call to discuss the project details.
                                </p>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-200">
                            <AlertCircle className="h-12 w-12 text-indigo-500 mx-auto mb-4" />
                            <h4 className="text-lg font-bold text-slate-900 mb-2">Subscription Required</h4>
                            <p className="text-slate-500 mb-6 max-w-md mx-auto">
                                You need an active subscription to contact clients and view their phone numbers. Unlock access starting at just ₹49.
                            </p>
                            <Link to="/subscription" className="btn-primary inline-flex items-center">
                                Subscribe to Contact
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {/* Client Controls */}
            {user && gig && user.id === gig.client_id && (
                <div className="mt-8 glass-panel rounded-2xl p-8">
                    <h3 className="text-xl font-bold text-slate-900 mb-6">Manage Gig</h3>
                    <div className="flex flex-wrap gap-4">
                        {gig.status === 'open' && (
                            <button
                                onClick={() => updateStatus('in_progress')}
                                className="btn-primary bg-blue-600 hover:bg-blue-700"
                            >
                                Mark In Progress
                            </button>
                        )}
                        {gig.status === 'in_progress' && (
                            <button
                                onClick={() => updateStatus('under_review')}
                                className="btn-primary bg-yellow-600 hover:bg-yellow-700"
                            >
                                Request Review
                            </button>
                        )}
                        {gig.status === 'under_review' && (
                            <button
                                onClick={() => updateStatus('completed')}
                                className="btn-primary bg-green-600 hover:bg-green-700"
                            >
                                Mark Completed
                            </button>
                        )}
                        <Link
                            to="/messages"
                            className="btn-secondary flex items-center gap-2"
                        >
                            <MessageSquare className="h-4 w-4" />
                            View Conversations
                        </Link>
                    </div>
                </div>
            )}

            {/* Chat for job seekers (non-owners) - chat with gig owner */}
            {showChat && user && gig && user.id !== gig.client_id && (
                <Chat
                    gigId={id}
                    recipientId={gig.client_id}
                    recipientName={gig.profiles?.full_name || 'Client'}
                    onClose={() => setShowChat(false)}
                />
            )}

            {/* Chat for owners - they use Messages page to see all conversations */}
            {showChat && user && gig && user.id === gig.client_id && (
                <Chat
                    gigId={id}
                    recipientId={null}
                    recipientName={null}
                    onClose={() => setShowChat(false)}
                />
            )}
        </div>
    )
}
