import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'
import clsx from 'clsx'

// Load Google Maps Script Helper
const loadGoogleMapsScript = (apiKey) => {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places) {
            resolve(window.google.maps)
            return
        }
        if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
            const check = setInterval(() => {
                if (window.google && window.google.maps && window.google.maps.places) {
                    clearInterval(check)
                    resolve(window.google.maps)
                }
            }, 100)
            return
        }

        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => resolve(window.google.maps)
        script.onerror = (err) => reject(err)
        document.head.appendChild(script)
    })
}

export default function LocationInput({ value, onChange, onLocationSelect, disabled, className }) {
    const [query, setQuery] = useState(value || '')
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)

    // Google Status
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const [apiError, setApiError] = useState(null)
    const [debugStatus, setDebugStatus] = useState('Idle')

    const wrapperRef = useRef(null)
    const autocompleteService = useRef(null)
    const sessionToken = useRef(null)

    const googleApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

    // Sync input value
    useEffect(() => {
        if (value !== undefined && value !== query) {
            setQuery(value)
        }
    }, [value])

    // Load Script
    useEffect(() => {
        if (googleApiKey && !scriptLoaded) {
            setDebugStatus('Loading Script...')
            loadGoogleMapsScript(googleApiKey)
                .then((maps) => {
                    setScriptLoaded(true)
                    setDebugStatus('Script Loaded. Init Service...')
                    try {
                        autocompleteService.current = new maps.places.AutocompleteService()
                        sessionToken.current = new maps.places.AutocompleteSessionToken()
                        setDebugStatus('Ready')
                    } catch (e) {
                        console.error("Init Error", e)
                        setApiError("Service Init Failed")
                        setDebugStatus('Init Failed')
                    }
                })
                .catch(err => {
                    console.error("Script Load Error", err)
                    setApiError("Google Script Failed to Load")
                    setDebugStatus('Script Load Error')
                })
        } else if (!googleApiKey) {
            setApiError("Missing API Key")
            setDebugStatus('No Key')
        }
    }, [googleApiKey])

    // Click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const searchGoogle = (input) => {
        if (!input || input.length < 3) {
            setSuggestions([])
            setDebugStatus('Idle')
            return
        }

        // Must have service
        if (!autocompleteService.current) {
            // Try waiting or ignore
            if (scriptLoaded) setApiError("Service Not Ready")
            return
        }

        setLoading(true)
        setDebugStatus(`Searching for "${input}"...`)
        setApiError(null)

        const request = {
            input,
            sessionToken: sessionToken.current,
            // types: ['(cities)'] // Optional: restrict to cities
        }

        // Set a timeout to detect hangs -> Auto switch to OSM
        const timeoutId = setTimeout(() => {
            if (loading) {
                console.warn("Google API Timed Out -> Switching to OSM")
                setApiError("Google Timed Out, used OpenStreetMap fallback.")
                searchOSM(input) // Auto fallback
            }
        }, 3000) // Reduced to 3s for better UX

        try {
            autocompleteService.current.getPlacePredictions(request, (predictions, status) => {
                clearTimeout(timeoutId) // Clear timeout

                if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
                    setLoading(false)
                    setSuggestions(predictions.map(p => ({
                        id: p.place_id,
                        description: p.description,
                        source: 'google',
                        raw: p
                    })))
                    setShowSuggestions(true)
                    setDebugStatus('Google OK')
                } else {
                    console.error("Google Status:", status)
                    // If Google fails (e.g. REQUEST_DENIED), fallback to OSM immediately
                    searchOSM(input)
                }
            })
        } catch (e) {
            clearTimeout(timeoutId)
            console.error("Call Exception", e)
            searchOSM(input) // Fallback on crash
        }
    }

    const searchOSM = async (text) => {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=5`,
                { headers: { 'Accept-Language': 'en-US' } }
            )
            const data = await response.json()
            setSuggestions(data.map(item => ({
                id: item.place_id,
                description: item.display_name,
                source: 'osm',
                raw: item
            })))
            setShowSuggestions(true)
            setDebugStatus('OSM OK')
        } catch (error) {
            console.error('OSM Error:', error)
            setApiError('OSM Search Failed')
            setDebugStatus('OSM Error')
        } finally {
            setLoading(false)
        }
    }

    // Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query && !disabled && query.length > 2) {
                // Only run if we have a key
                if (googleApiKey) {
                    searchGoogle(query)
                }
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [query, googleApiKey])

    const handleSelect = (item) => {
        setQuery(item.description)
        setShowSuggestions(false)
        if (onChange) onChange(item.description)

        // Geocode to get lat/lng
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ placeId: item.id }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const { lat, lng } = results[0].geometry.location
                if (onLocationSelect) {
                    onLocationSelect({
                        address: item.description,
                        lat: lat(),
                        lng: lng()
                    })
                }
            } else {
                setApiError(`Geocode Failed: ${status}`)
            }
        })

        // Reset session
        if (window.google) {
            sessionToken.current = new window.google.maps.places.AutocompleteSessionToken()
        }
    }

    return (
        <div className={clsx("relative", className)} ref={wrapperRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loading ? (
                        <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                    ) : (
                        <MapPin className="h-5 w-5 text-red-500" />
                    )}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        if (onChange) onChange(e.target.value)
                    }}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true)
                    }}
                    disabled={disabled}
                    className={clsx(
                        "input-field pl-10",
                        disabled && "bg-slate-100 text-slate-500 cursor-not-allowed",
                        apiError && "border-red-300"
                    )}
                    placeholder="Search Google Maps..."
                    autoComplete="off"
                />
            </div>

            {/* Debug Line (Visible to User) */}
            <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>Google Maps Only</span>
                <span className={clsx(apiError ? "text-red-500 font-bold" : "text-slate-500")}>
                    {apiError ? apiError : debugStatus}
                </span>
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-[9999] w-full bg-white mt-1 rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-auto divide-y divide-slate-100">
                    {suggestions.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 border-l-4 border-transparent hover:border-red-500"
                            >
                                <MapPin className="h-4 w-4 text-red-500 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900 line-clamp-2">{item.description}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
