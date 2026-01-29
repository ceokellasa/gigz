import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'

export default function BroadcastListener() {
    const { user } = useAuth()
    const { toast } = useToast()

    useEffect(() => {
        // Request Notification Permission on mount
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().catch(err => console.error('Notification permission error:', err))
        }

        const channel = supabase
            .channel('global-notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload) => {
                    const newNotification = payload.new

                    // Check if the notification is relevant to the current user
                    // 1. It is a global broadcast
                    // 2. OR it is specifically for this user
                    const isGlobal = newNotification.is_global
                    const isForMe = user && newNotification.user_id === user.id

                    if (isGlobal || isForMe) {
                        // Display In-App Toast
                        toast(newNotification.title + ': ' + newNotification.message, 'info')

                        // Display System Notification (if supported and allowed)
                        if ('Notification' in window && Notification.permission === 'granted') {
                            try {
                                new Notification(newNotification.title, {
                                    body: newNotification.message,
                                    // icon: '/pwa-192x192.png' // Add icon if available
                                })
                            } catch (e) {
                                console.error('Error showing system notification:', e)
                            }
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user, toast])

    return null
}
