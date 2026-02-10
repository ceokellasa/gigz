import { useEffect, useState, useRef, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { Send, User, MessageSquare, ArrowLeft, Loader2, RefreshCw, Paperclip, Image as ImageIcon, X } from 'lucide-react'
import clsx from 'clsx'

export default function Messages() {
    const { user, profile, fetchUnreadCount } = useAuth()
    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [attachment, setAttachment] = useState(null)
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)
    const [isGlobalSubscribed, setIsGlobalSubscribed] = useState(false)

    // Rate Limit State
    const [recentMessages, setRecentMessages] = useState([])
    const [rateLimitExpiresAt, setRateLimitExpiresAt] = useState(null)
    const [timeLeft, setTimeLeft] = useState(0)

    const fetchConversations = useCallback(async () => {
        if (!user) return

        try {
            const { data: messagesData, error } = await supabase
                .from('messages')
                .select(`
                    id,
                    gig_id,
                    sender_id,
                    receiver_id,
                    content,
                    created_at,
                    gigs:gig_id(id, title, client_id)
                `)
                .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching conversations:', error)
                return
            }

            const conversationMap = new Map()
            const participantIds = new Set()

            messagesData?.forEach(msg => {
                let otherPersonId = null
                if (msg.sender_id === user.id) {
                    otherPersonId = msg.receiver_id || (msg.gigs?.client_id && msg.gigs.client_id !== user.id ? msg.gigs.client_id : null)
                } else {
                    otherPersonId = msg.sender_id
                }

                // Fallback for old messages without receiver_id where gig structure was implied
                if (!otherPersonId && msg.gigs) {
                    otherPersonId = msg.gigs.client_id === user.id ? null : msg.gigs.client_id // Can't determine easily without analyzing previous messages or role
                    // Actually, if I am sender, and receiver is null, and it's a gig message, it went to gig owner? 
                    // Or if I am owner, it went to... unknown?
                    // With receiver_id added, this is cleaner.
                }

                if (otherPersonId && otherPersonId !== user.id) {
                    participantIds.add(otherPersonId)
                    msg._otherPersonId = otherPersonId
                }
            })

            let profilesMap = new Map()
            if (participantIds.size > 0) {
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', Array.from(participantIds))
                profiles?.forEach(p => profilesMap.set(p.id, p))
            }

            messagesData?.forEach(msg => {
                if (!msg._otherPersonId) return
                const otherPersonId = msg._otherPersonId
                // If gig_id is null, use 'dm' as prefix
                const convKey = `${msg.gig_id || 'dm'}-${otherPersonId}`

                if (!conversationMap.has(convKey)) {
                    const otherProfile = profilesMap.get(otherPersonId)
                    conversationMap.set(convKey, {
                        id: convKey,
                        gig_id: msg.gig_id,
                        gig_title: msg.gigs?.title || 'Support / Direct Message',
                        participant_id: otherPersonId,
                        participant_name: otherProfile?.full_name || 'Unknown User',
                        participant_avatar: otherProfile?.avatar_url,
                        last_message: msg.content,
                        last_message_at: msg.created_at,
                        isOwner: msg.gigs?.client_id === user.id
                    })
                }
            })

            setConversations(Array.from(conversationMap.values()))
            setLoading(false)
        } catch (error) {
            console.error('Error in fetchConversations:', error)
            setLoading(false)
        }
    }, [user])

    // URL params for deep linking
    const [searchParams] = useSearchParams()

    useEffect(() => {
        if (user) {
            fetchConversations()
            const channel = supabase
                .channel(`global-messages-${user.id}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                }, (payload) => {
                    const msg = payload.new
                    if (msg.sender_id === user.id || msg.receiver_id === user.id) {
                        fetchConversations()
                    }
                })
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') setIsGlobalSubscribed(true)
                })
            return () => {
                supabase.removeChannel(channel)
            }
        }
    }, [user, fetchConversations])

    useEffect(() => {
        let cleanup = null
        if (selectedConversation) {
            fetchMessages()
            cleanup = subscribeToActiveConversation()
        }
        return () => {
            if (cleanup) cleanup()
        }
    }, [selectedConversation])

    // Handle Support Mode deep link & Direct Message deep link
    useEffect(() => {
        const initChat = async () => {
            const mode = searchParams.get('mode')
            const recipientId = searchParams.get('userId')
            const initialMsg = searchParams.get('message')

            if (initialMsg) {
                setNewMessage(initialMsg)
            }

            if (user && !loading) {
                if (mode === 'support') {
                    // Find Admin ID - trying simple role lookup
                    const { data: adminProfile } = await supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url')
                        .eq('role', 'admin')
                        .limit(1)
                        .single()

                    if (adminProfile) {
                        const adminId = adminProfile.id
                        const existingConv = conversations.find(c => c.participant_id === adminId && !c.gig_id)

                        if (existingConv) {
                            setSelectedConversation(existingConv)
                        } else {
                            setSelectedConversation({
                                id: 'draft-support',
                                gig_id: null,
                                gig_title: 'Support Chat',
                                participant_id: adminId,
                                participant_name: adminProfile.full_name || 'Support Admin',
                                participant_avatar: adminProfile.avatar_url,
                                last_message: '',
                                last_message_at: new Date().toISOString()
                            })
                        }
                    }
                } else if (recipientId && recipientId !== user.id) {
                    // Direct Message to specific user
                    const existingConv = conversations.find(c => c.participant_id === recipientId && !c.gig_id)

                    if (existingConv) {
                        setSelectedConversation(existingConv)
                    } else {
                        // Fetch profile to make draft
                        const { data: recipientProfile } = await supabase
                            .from('profiles')
                            .select('id, full_name, avatar_url')
                            .eq('id', recipientId)
                            .single()

                        if (recipientProfile) {
                            setSelectedConversation({
                                id: `draft-${recipientId}`,
                                gig_id: null,
                                gig_title: 'Direct Message',
                                participant_id: recipientId,
                                participant_name: recipientProfile.full_name || 'User',
                                participant_avatar: recipientProfile.avatar_url,
                                last_message: '',
                                last_message_at: new Date().toISOString()
                            })
                        }
                    }
                }
            }
        }
        initChat()
    }, [searchParams, user, loading, conversations])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return
        if (file.size > 5 * 1024 * 1024) {
            alert('File size too large. Please select an image under 5MB.')
            return
        }
        const preview = URL.createObjectURL(file)
        setAttachment({ file, preview })
    }

    const clearAttachment = () => {
        if (attachment?.preview) URL.revokeObjectURL(attachment.preview)
        setAttachment(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    const uploadFile = async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${selectedConversation.gig_id || 'dm'}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('chat-attachments')
            .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('chat-attachments')
            .getPublicUrl(fileName)

        return publicUrl
    }

    const fetchMessages = async () => {
        if (!selectedConversation) return

        let query = supabase
            .from('messages')
            .select('*, sender:sender_id(full_name, avatar_url)')
            .or(`sender_id.eq.${user.id},sender_id.eq.${selectedConversation.participant_id}`)
            .order('created_at', { ascending: true })

        if (selectedConversation.gig_id) {
            query = query.eq('gig_id', selectedConversation.gig_id)
        } else {
            query = query.is('gig_id', null)
        }

        const { data, error } = await query

        if (!error && data) {
            const filtered = data.filter(msg => {
                const isMe = msg.sender_id === user.id
                const isThem = msg.sender_id === selectedConversation.participant_id

                if (isThem) {
                    // Start of support chat: accept if it matches our criteria
                    return true
                }
                if (isMe) {
                    return !msg.receiver_id || msg.receiver_id === selectedConversation.participant_id
                }
                return false
            })
            setMessages(filtered)
        }
    }

    const subscribeToActiveConversation = () => {
        if (!selectedConversation) return null

        const filter = selectedConversation.gig_id
            ? `gig_id=eq.${selectedConversation.gig_id}`
            : `gig_id=is.null`
        // Postgres filter syntax for null might be tricky in realtime. 
        // Usually 'gig_id=is.null' works OR we filter client side differently.
        // Let's rely on receiving ALL inserts and filtering in the callback if realtime filter fails.

        const channel = supabase
            .channel(`active-conv-${selectedConversation.id}-${Date.now()}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                // filter: filter // Removing server-side filter for robustness with nulls, filtering client-side below
            }, async (payload) => {
                const msg = payload.new

                // Check if this message belongs to current conversation
                const isSameGig = selectedConversation.gig_id ? (msg.gig_id === selectedConversation.gig_id) : (msg.gig_id === null)
                if (!isSameGig) return

                const isMe = msg.sender_id === user.id
                const isThem = msg.sender_id === selectedConversation.participant_id

                if (isThem || (isMe && (!msg.receiver_id || msg.receiver_id === selectedConversation.participant_id))) {

                    let newMsg = { ...msg }
                    if (isThem) {
                        const { data: sender } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', msg.sender_id).single()
                        newMsg.sender = sender
                    }

                    setMessages(prev => {
                        if (prev.find(m => m.id === msg.id)) return prev
                        const tempMatch = prev.find(m =>
                            m.id.toString().startsWith('temp-') &&
                            (m.content === msg.content || (m.attachment_url && m.attachment_url === msg.attachment_url)) &&
                            m.sender_id === msg.sender_id)
                        if (tempMatch) return prev.map(m => m.id === tempMatch.id ? newMsg : m)
                        return [...prev, newMsg]
                    })
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }

    // Rate Limit Timer Effect
    useEffect(() => {
        let interval
        if (rateLimitExpiresAt) {
            interval = setInterval(() => {
                const remaining = Math.ceil((rateLimitExpiresAt - Date.now()) / 1000)
                if (remaining <= 0) {
                    setRateLimitExpiresAt(null)
                    setTimeLeft(0)
                    setRecentMessages([])
                } else {
                    setTimeLeft(remaining)
                }
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [rateLimitExpiresAt])

    const checkRateLimit = () => {
        const now = Date.now()
        const validMsgs = recentMessages.filter(time => now - time < 30000)

        if (validMsgs.length >= 10) {
            const expireTime = now + 30000
            setRateLimitExpiresAt(expireTime)
            setTimeLeft(30)
            setRecentMessages(validMsgs)
            return false
        }

        setRecentMessages([...validMsgs, now])
        return true
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if ((!newMessage.trim() && !attachment) || !selectedConversation || sending) return

        if (!checkRateLimit()) return

        const messageContent = newMessage.trim() || (attachment ? 'Sent a photo' : '')
        const tempId = `temp-${Date.now()}`

        const optimisticMessage = {
            id: tempId,
            gig_id: selectedConversation.gig_id,
            sender_id: user.id,
            receiver_id: selectedConversation.participant_id,
            content: messageContent,
            created_at: new Date().toISOString(),
            attachment_url: attachment?.preview,
            attachment_type: attachment ? 'image' : null,
            sender: { full_name: profile?.full_name, avatar_url: profile?.avatar_url }
        }

        setMessages(prev => [...prev, optimisticMessage])
        setNewMessage('')
        const fileToUpload = attachment?.file
        setAttachment(null)
        setSending(true)

        try {
            let attachmentUrl = null
            if (fileToUpload) {
                attachmentUrl = await uploadFile(fileToUpload)
            }

            const { data, error } = await supabase.from('messages').insert([{
                gig_id: selectedConversation.gig_id,
                sender_id: user.id,
                receiver_id: selectedConversation.participant_id,
                content: messageContent,
                attachment_url: attachmentUrl,
                attachment_type: attachmentUrl ? 'image' : null
            }]).select('*, sender:sender_id(full_name, avatar_url)').single()

            if (error) throw error

            if (data) {
                setMessages(prev => prev.map(m => m.id === tempId ? data : m))
            }
        } catch (error) {
            console.error('Error sending message:', error)
            setMessages(prev => prev.filter(m => m.id !== tempId))
            setNewMessage(messageContent)
            if (fileToUpload) setAttachment({ file: fileToUpload, preview: URL.createObjectURL(fileToUpload) })
            alert('Failed to send message.')
        } finally {
            setSending(false)
        }
    }

    if (!user) {
        return (
            <div className="max-w-md mx-auto px-4 py-12">
                <div className="glass-panel rounded-2xl p-8 text-center">
                    <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
                        <MessageSquare className="h-12 w-12 text-slate-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Login to Chat</h1>
                    <p className="text-slate-500 mb-8">Sign in to message clients and view your conversations.</p>

                    <div className="space-y-4">
                        <Link
                            to="/login"
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <User className="h-5 w-5" />
                            Sign In
                        </Link>
                        <Link
                            to="/signup"
                            className="btn-secondary w-full flex items-center justify-center gap-2"
                        >
                            <div className="h-5 w-5 rounded-full border-2 border-current" />
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 h-[calc(100vh-180px)] md:h-[calc(100vh-80px)]">
            <div className="flex h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                {/* Sidebar */}
                <div className={clsx(
                    "w-full md:w-1/3 border-r border-slate-200 flex flex-col",
                    selectedConversation ? "hidden md:flex" : "flex"
                )}>
                    <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center bg-gradient-to-r from-slate-50 to-indigo-50/30">
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-indigo-600" />
                                Messages
                            </h2>
                            <p className="text-[10px] text-slate-500 mt-1 font-medium">
                                Logged in as: {profile?.full_name || user.email}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${isGlobalSubscribed ? 'bg-green-500' : 'bg-red-400'}`} title={isGlobalSubscribed ? "Realtime Active" : "Connecting..."}></div>
                            <button onClick={fetchConversations} className="p-2 hover:bg-white rounded-full transition-colors shadow-sm">
                                <RefreshCw className={`h-4 w-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 && !loading ? (
                            <div className="p-8 text-center text-slate-500">
                                <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No conversations yet.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-slate-100">
                                {conversations.map((conv) => (
                                    <li
                                        key={conv.id}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={clsx(
                                            'p-4 cursor-pointer hover:bg-slate-50 transition-colors relative',
                                            selectedConversation?.id === conv.id ? 'bg-indigo-50 border-l-4 border-indigo-600' : ''
                                        )}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {conv.participant_avatar ? (
                                                <img className="h-12 w-12 rounded-full object-cover border border-slate-200" src={conv.participant_avatar} alt="" />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                                    {conv.participant_name?.[0]}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <p className="text-sm font-bold text-slate-900 truncate">
                                                        {conv.participant_name}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(conv.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-indigo-600 font-medium truncate mb-0.5">
                                                    {conv.gig_title}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    {conv.last_message}
                                                </p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={clsx(
                    "flex-1 flex flex-col bg-slate-50",
                    selectedConversation ? "flex" : "hidden md:flex"
                )}>
                    {selectedConversation ? (
                        <>
                            <div className="p-4 bg-white border-b border-slate-200 shadow-sm flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedConversation(null)}
                                    className="md:hidden p-2 hover:bg-slate-100 rounded-lg"
                                >
                                    <ArrowLeft className="h-5 w-5" />
                                </button>
                                <div className="flex items-center gap-3">
                                    {selectedConversation.participant_avatar ? (
                                        <img className="h-10 w-10 rounded-full object-cover" src={selectedConversation.participant_avatar} alt="" />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                            {selectedConversation.participant_name?.[0]}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-slate-800">{selectedConversation.participant_name}</h3>
                                        <p className="text-sm text-slate-500">{selectedConversation.gig_title}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="flex-1 flex items-center justify-center h-full">
                                        <div className="text-center text-slate-400">
                                            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                            <p>No messages yet</p>
                                        </div>
                                    </div>
                                ) : (
                                    messages.map((msg) => {
                                        const isMe = msg.sender_id === user.id
                                        const isTemp = msg.id.toString().startsWith('temp-')
                                        return (
                                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`flex max-w-[70%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                                    {!isMe && (
                                                        <div className="flex-shrink-0">
                                                            {msg.sender?.avatar_url ? (
                                                                <img className="h-8 w-8 rounded-full object-cover" src={msg.sender.avatar_url} alt="" />
                                                            ) : (
                                                                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                                                                    {msg.sender?.full_name?.[0] || 'U'}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className={`px-4 py-2 rounded-2xl shadow-sm ${isMe
                                                        ? 'bg-indigo-600 text-white rounded-br-none'
                                                        : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'
                                                        } ${isTemp ? 'opacity-70' : ''}`}>
                                                        {!isMe && (
                                                            <p className="text-[10px] font-bold text-slate-500 mb-0.5">
                                                                {msg.sender?.full_name || 'User'}
                                                            </p>
                                                        )}

                                                        {msg.attachment_url && (
                                                            <div className="mb-2 rounded-lg overflow-hidden border border-slate-100 max-w-[200px]">
                                                                <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                                                    <img
                                                                        src={msg.attachment_url}
                                                                        alt="Attachment"
                                                                        className="w-full h-auto object-cover"
                                                                        loading="lazy"
                                                                    />
                                                                </a>
                                                            </div>
                                                        )}

                                                        {msg.content && <p className="text-sm">{msg.content}</p>}
                                                        <p className={`text-[10px] mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                            {isTemp ? 'Sending...' : new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-4 bg-white border-t border-slate-200">
                                {attachment && (
                                    <div className="mb-3 flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200 animate-in slide-in-from-bottom-2">
                                        <div className="relative h-12 w-12 rounded overflow-hidden group">
                                            <img src={attachment.preview} className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                                                <ImageIcon className="h-4 w-4 text-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-slate-700 truncate">{attachment.file.name}</p>
                                            <p className="text-[10px] text-slate-500">{(attachment.file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button onClick={clearAttachment} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {timeLeft > 0 && (
                                    <div className="mb-2 text-center">
                                        <span className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                                            🛑 Limit Exceeded! Wait {timeLeft}s
                                        </span>
                                    </div>
                                )}

                                <form onSubmit={handleSend} className="flex gap-2 items-end">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="p-3 rounded-full text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                                        title="Attach photo"
                                        disabled={timeLeft > 0 || sending}
                                    >
                                        <Paperclip className="h-5 w-5" />
                                    </button>
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        className="flex-1 px-4 py-3 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[46px]"
                                        placeholder={timeLeft > 0 ? `Wait ${timeLeft}s to send...` : (attachment ? "Add a caption..." : "Type a message...")}
                                        disabled={sending || timeLeft > 0}
                                    />
                                    <button
                                        type="submit"
                                        disabled={sending || (!newMessage.trim() && !attachment) || timeLeft > 0}
                                        className="btn-primary rounded-full p-3 flex items-center justify-center disabled:opacity-50"
                                    >
                                        {sending ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Send className="h-5 w-5" />
                                        )}
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-slate-400 flex-col gap-4">
                            <MessageSquare className="h-16 w-16 opacity-20" />
                            <p>Select a conversation to start messaging</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
