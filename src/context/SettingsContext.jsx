import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const SettingsContext = createContext()

export function useSettings() {
    return useContext(SettingsContext)
}

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        site_name: 'Gigz',
        site_description: 'Modern Work Marketplace',
        site_logo_url: '/kelasa-logo.png',
        primary_color: '#4f46e5',
        hero_headline: 'Find the perfect match for your work',
        hero_subheadline: 'Connect with top talent and get work done quickly and securely.',
        hero_image_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2850&q=80',
        footer_text: '© 2026 Kelasa, Inc. All rights reserved.',
        contact_email: 'support@kelasa.com',
        is_maintenance_mode: 'false'
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSettings()

        // Subscribe to realtime changes for instant updates
        const subscription = supabase
            .channel('public:site_settings')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, () => {
                fetchSettings()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(subscription)
        }
    }, [])

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')

            if (error) throw error

            if (data) {
                const newSettings = { ...settings }
                data.forEach(item => {
                    newSettings[item.key] = item.value
                })
                setSettings(newSettings)

                // improved: Apply CSS variable for primary color dynamically
                if (newSettings.primary_color) {
                    document.documentElement.style.setProperty('--color-primary', newSettings.primary_color)
                }
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        } finally {
            setLoading(false)
        }
    }

    const value = {
        settings,
        loading,
        refreshSettings: fetchSettings
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}
