import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Save, RefreshCw, AlertTriangle, Layout, Type, Image, Link as LinkIcon, Palette, CreditCard, Settings } from 'lucide-react'
import { useToast } from '../../components/Toast'
import { useSettings } from '../../context/SettingsContext'

export default function AdminCMS() {
    // Use local state for form editing, init from context
    const { settings: globalSettings, refreshSettings } = useSettings()
    const [localSettings, setLocalSettings] = useState(globalSettings)
    const [saving, setSaving] = useState(false)
    const [activeSection, setActiveSection] = useState('general')
    const toast = useToast()

    useEffect(() => {
        setLocalSettings(globalSettings)
    }, [globalSettings])

    const sections = [
        { id: 'general', label: 'General', icon: Layout },
        { id: 'hero', label: 'Home Page', icon: Image },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'content', label: 'Content', icon: Type },
        { id: 'logic', label: 'Logic & Toggles', icon: Settings },
        { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    ]

    const settingGroups = {
        general: [
            { key: 'site_name', label: 'Site Name', type: 'text' },
            { key: 'site_description', label: 'Site Description', type: 'text' },
            { key: 'contact_email', label: 'Contact Email', type: 'email' },
            { key: 'footer_text', label: 'Footer Text', type: 'text' },
            { key: 'is_maintenance_mode', label: 'Maintenance Mode', type: 'boolean' },
        ],
        hero: [
            { key: 'hero_headline', label: 'Hero Headline', type: 'text', multiline: true },
            { key: 'hero_subheadline', label: 'Hero Subheadline', type: 'text', multiline: true },
            { key: 'hero_image_url', label: 'Hero Image URL', type: 'text' },
            { key: 'hero_cta_text_1', label: 'Button 1 Text (Post Gig)', type: 'text' },
            { key: 'hero_cta_text_2', label: 'Button 2 Text (Find Work)', type: 'text' },
            { key: 'hero_cta_text_3', label: 'Button 3 Text (Hire Pros)', type: 'text' },
            { key: 'feature_1_title', label: 'Feature 1 Title', type: 'text' },
            { key: 'feature_1_desc', label: 'Feature 1 Description', type: 'text', multiline: true },
            { key: 'feature_2_title', label: 'Feature 2 Title', type: 'text' },
            { key: 'feature_2_desc', label: 'Feature 2 Description', type: 'text', multiline: true },
            { key: 'feature_3_title', label: 'Feature 3 Title', type: 'text' },
            { key: 'feature_3_desc', label: 'Feature 3 Description', type: 'text', multiline: true },
        ],
        appearance: [
            { key: 'primary_color', label: 'Primary Color', type: 'color' },
            { key: 'site_logo_url', label: 'Logo URL', type: 'text' },
            { key: 'social_facebook', label: 'Facebook URL', type: 'text' },
            { key: 'social_instagram', label: 'Instagram URL', type: 'text' },
            { key: 'social_twitter', label: 'Twitter/X URL', type: 'text' },
        ],
        content: [
            { key: 'site_banner_text', label: 'Announcement Banner', type: 'text' },
        ],
        logic: [
            { key: 'enable_signups', label: 'Enable New Signups', type: 'boolean' },
            { key: 'enable_payments', label: 'Enable Payments', type: 'boolean' },
            { key: 'show_mobile_footer', label: 'Show Mobile Footer', type: 'boolean' },
            { key: 'require_email_verification', label: 'Require Email Verification', type: 'boolean' },
        ],
        subscriptions: [
            { key: 'subscription_plans', label: 'Plans Configuration (JSON)', type: 'json', multiline: true, height: 'h-96' },
        ]
    }

    // Helper to format JSON for display
    const formatValue = (key, value) => {
        if (key === 'subscription_plans' && typeof value === 'string') {
            try {
                return JSON.stringify(JSON.parse(value), null, 2)
            } catch (e) {
                return value
            }
        }
        return value
    }

    const handleJsonChange = (key, value) => {
        // Just update raw string, validation happens on save or could happen here
        setLocalSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }))
    }

    const saveSettings = async () => {
        setSaving(true)
        try {
            const updates = Object.entries(localSettings).map(([key, value]) => ({
                key,
                value: String(value),
                updated_at: new Date()
            }))

            const { error } = await supabase.from('site_settings').upsert(updates, { onConflict: 'key' })

            if (error) throw error

            await refreshSettings() // Update global context
            toast.success('Site settings saved!')
        } catch (error) {
            console.error('Error saving settings:', error)
            toast.error(`Failed to save: ${error.message || error.details || 'Unknown error'}`)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        {sections.map((section) => {
                            const Icon = section.icon
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeSection === section.id
                                        ? 'bg-indigo-50 text-indigo-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <Icon className={`mr-3 h-5 w-5 ${activeSection === section.id ? 'text-indigo-500' : 'text-slate-400'
                                        }`} />
                                    {section.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">
                            {sections.find(s => s.id === activeSection)?.label} Settings
                        </h2>

                        <div className="space-y-6">
                            {settingGroups[activeSection]?.map((field) => (
                                <div key={field.key}>
                                    <label htmlFor={field.key} className="block text-sm font-medium text-slate-700 mb-1">
                                        {field.label}
                                    </label>

                                    {field.type === 'boolean' ? (
                                        <div className="flex items-center mt-2">
                                            <button
                                                onClick={() => handleChange(field.key, localSettings[field.key] === 'true' ? 'false' : 'true')}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${localSettings[field.key] === 'true' ? 'bg-indigo-600' : 'bg-slate-200'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${localSettings[field.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                            <span className="ml-3 text-sm text-slate-600">
                                                {localSettings[field.key] === 'true' ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </div>
                                    ) : (field.multiline || field.type === 'json') ? (
                                        <textarea
                                            id={field.key}
                                            rows={field.type === 'json' ? 15 : 3}
                                            value={formatValue(field.key, localSettings[field.key] || '')}
                                            onChange={(e) => handleChange(field.key, e.target.value)}
                                            className="input-field font-mono text-sm"
                                            placeholder={`Enter ${field.label}...`}
                                        />
                                    ) : (
                                        <div className="flex gap-2">
                                            {field.type === 'color' && (
                                                <div
                                                    className="w-10 h-10 rounded-lg border border-slate-200 shadow-sm flex-shrink-0"
                                                    style={{ backgroundColor: localSettings[field.key] }}
                                                />
                                            )}
                                            <input
                                                type={field.type === 'color' ? 'text' : field.type}
                                                id={field.key}
                                                value={localSettings[field.key] || ''}
                                                onChange={(e) => handleChange(field.key, e.target.value)}
                                                className="input-field"
                                                placeholder={field.type === 'color' ? '#000000' : `Enter ${field.label}...`}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={saveSettings}
                                disabled={saving}
                                className="btn-primary flex items-center gap-2 px-6 py-2.5"
                            >
                                {saving ? (
                                    <>
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
