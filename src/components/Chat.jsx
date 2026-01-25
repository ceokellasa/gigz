import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { Send, X, Loader2, RefreshCw, User, Paperclip, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Chat({ gigId, recipientId, recipientName, onClose }) {
    const { user, profile, fetchUnreadCount } = useAuth()

    // State
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [attachment, setAttachment] = useState(null) // { file, preview }

    // Rate Limiting State
    const [recentMessages, setRecentMessages] = useState([])
    const [rateLimitExpiresAt, setRateLimitExpiresAt] = useState(null)
    const [timeLeft, setTimeLeft] = useState(0)

    // Refs
    const messagesEndRef = useRef(null)
    const channelRef = useRef(null)
    const fileInputRef = useRef(null)

    // Rate Limit Timer Effect
    useEffect(() => {
        let interval
        if (rateLimitExpiresAt) {
            interval = setInterval(() => {
                const remaining = Math.ceil((rateLimitExpiresAt - Date.now()) / 1000)
                if (remaining <= 0) {
                    setRateLimitExpiresAt(null)
                    setTimeLeft(0)
                    setRecentMessages([]) // Reset count after ban
                } else {
                    setTimeLeft(remaining)
                }
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [rateLimitExpiresAt])

    const fetchMessages = useCallback(async () => {
        const { data, error } = await supabase
            .from('messages')
            .select('*, profiles:sender_id(full_name, avatar_url)')
            .eq('gig_id', gigId)
            .or(`sender_id.eq.${user.id},sender_id.eq.${recipientId}`)
            .order('created_at', { ascending: true })

        if (!error && data) {
            setMessages(data)
        } else if (error) {
            console.error('Error fetching messages:', error)
        }
        setLoading(false)
    }, [gigId, user.id, recipientId])

    useEffect(() => {
        if (user && recipientId) {
            fetchMessages()

            // Mark existing as read
            const markRead = async () => {
                const { error } = await supabase
                    .from('messages')
                    .update({ read: true })
                    .eq('gig_id', gigId)
                    .eq('receiver_id', user.id)
                    .is('read', false)

                if (!error) fetchUnreadCount(user.id)
            }
            markRead()

            channelRef.current = supabase
                .channel(`chat-${gigId}-${user.id}-${recipientId}`)
                .on('postgres_changes', {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `gig_id=eq.${gigId}`
                }, async (payload) => {
                    const msg = payload.new

                    const isFromMe = msg.sender_id === user.id && (!msg.receiver_id || msg.receiver_id === recipientId)
                    const isToMe = msg.sender_id === recipientId && (!msg.receiver_id || msg.receiver_id === user.id)

                    if (isFromMe || isToMe) {

                        // Mark read if form them
                        if (isToMe) {
                            await supabase.from('messages').update({ read: true }).eq('id', msg.id)
                            fetchUnreadCount(user.id)
                        }

                        let newMsg = { ...msg }
                        if (isToMe) {
                            const { data: senderProfile } = await supabase
                                .from('profiles')
                                .select('full_name, avatar_url')
                                .eq('id', msg.sender_id)
                                .single()
                            newMsg.profiles = senderProfile
                        }

                        setMessages((prev) => {
                            if (prev.find(m => m.id === msg.id)) return prev
                            // Replace temp message if exists
                            const tempMatch = prev.find(m =>
                                m.id.toString().startsWith('temp-') &&
                                (m.content === msg.content || (m.attachment_url && m.attachment_url === msg.attachment_url)) &&
                                m.sender_id === msg.sender_id
                            )
                            if (tempMatch) {
                                return prev.map(m => m.id === tempMatch.id ? newMsg : m)
                            }
                            return [...prev, newMsg]
                        })
                    }
                })
                .subscribe()

            return () => {
                if (channelRef.current) {
                    supabase.removeChannel(channelRef.current)
                }
            }
        }
    }, [gigId, user?.id, recipientId, fetchMessages])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const checkRateLimit = () => {
        const now = Date.now()
        // Filter messages from last 30 seconds
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

    const handleFileSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
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
        const fileName = `${gigId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('chat-attachments')
            .upload(fileName, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('chat-attachments')
            .getPublicUrl(fileName)

        return publicUrl
    }

    const handleSend = async (e) => {
        e.preventDefault()
        if ((!newMessage.trim() && !attachment) || sending || !recipientId) return

        if (!checkRateLimit()) return

        const messageContent = newMessage.trim() || (attachment ? 'Sent a photo' : '')
        const tempId = `temp-${Date.now()}`

        const optimisticMessage = {
            id: tempId,
            gig_id: gigId,
            sender_id: user.id,
            receiver_id: recipientId,
            content: messageContent,
            created_at: new Date().toISOString(),
            attachment_url: attachment?.preview,
            attachment_type: attachment ? 'image' : null,
            profiles: { full_name: profile?.full_name, avatar_url: profile?.avatar_url }
        }

        setMessages(prev => [...prev, optimisticMessage])
        setNewMessage('')
        const fileToUpload = attachment?.file
        setAttachment(null) // Clear immediately for UI
        setSending(true)

        try {
            let attachmentUrl = null
            if (fileToUpload) {
                attachmentUrl = await uploadFile(fileToUpload)
            }

            const { data, error } = await supabase.from('messages').insert([{
                gig_id: gigId,
                sender_id: user.id,
                receiver_id: recipientId,
                content: messageContent,
                attachment_url: attachmentUrl,
                attachment_type: attachmentUrl ? 'image' : null
            }]).select('*, profiles:sender_id(full_name, avatar_url)').single()

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

    const handleRefresh = () => {
        setLoading(true)
        fetchMessages()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[500px] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="px-4 py-3 border-b border-slate-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div>
                        <h3 className="text-lg font-semibold text-white">Messages</h3>
                        {recipientName && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <User className="h-3 w-3 text-indigo-300" />
                                <span className="text-sm text-indigo-100">Chatting with {recipientName}</span>
                            </div>
                        )}
                        <p className="text-[10px] text-indigo-200 mt-1 bg-white/10 px-1.5 py-0.5 rounded inline-block">
                            Logged in as: {profile?.full_name || 'Guest'}
                            {user?.id === recipientId && <span className="text-yellow-300 ml-1">(Chatting with self)</span>}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                            title="Refresh messages"
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400">
                            <p>No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = msg.sender_id === user.id
                            const isTemp = msg.id.toString().startsWith('temp-')
                            return (
                                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`flex max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                                        {!isMe && (
                                            <div className="flex-shrink-0">
                                                {msg.profiles?.avatar_url ? (
                                                    <img className="h-8 w-8 rounded-full object-cover" src={msg.profiles.avatar_url} alt="" />
                                                ) : (
                                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                                                        {msg.profiles?.full_name?.[0] || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className={`px-4 py-2 rounded-2xl ${isMe
                                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                                : 'bg-white text-slate-900 shadow-sm border border-slate-200 rounded-bl-sm'
                                            } ${isTemp ? 'opacity-70' : ''}`}>
                                            {!isMe && (
                                                <p className="text-[10px] font-bold text-slate-500 mb-0.5">
                                                    {msg.profiles?.full_name || 'User'}
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

                <div className="p-4 border-t border-slate-200 bg-white">
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
                            className="bg-indigo-600 text-white rounded-full p-3 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {sending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
