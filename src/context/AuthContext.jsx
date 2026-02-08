import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                console.error("Error checking session:", error)
                setLoading(false)
                return
            }

            const session = data?.session
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
                fetchUnreadCount(session.user.id)
            } else {
                setLoading(false)
            }
        }).catch(err => {
            console.error("Unexpected error checking session:", err)
            setLoading(false)
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
            if (session?.user) {
                fetchProfile(session.user.id)
                fetchUnreadCount(session.user.id)
            } else {
                setProfile(null)
                setUnreadCount(0)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchUnreadCount = async (userId) => {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .eq('read', false)

        if (!error) {
            setUnreadCount(count || 0)
        }
    }

    // Subscribe to unread count changes
    useEffect(() => {
        if (!user) return

        const channel = supabase
            .channel(`unread-count-${user.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user.id}`
            }, () => {
                fetchUnreadCount(user.id)
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
            } else {
                setProfile(data)
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    // Function to refresh profile data (call after subscription updates, etc.)
    const refreshProfile = useCallback(async () => {
        if (user) {
            await fetchProfile(user.id)
            await fetchUnreadCount(user.id)
        }
    }, [user])

    const signUp = async (email, password, role, fullName) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role,
                    full_name: fullName,
                },
            },
        })
        return { data, error }
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        return { data, error }
    }

    const signOut = async () => {
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    return (
        <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile, unreadCount, fetchUnreadCount }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

