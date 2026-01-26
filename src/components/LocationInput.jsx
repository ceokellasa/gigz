import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function LocationInput({ value, onChange, onLocationSelect, disabled, className }) {
    const [query, setQuery] = useState(value || '')
    const [suggestions, setSuggestions] = useState([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const wrapperRef = useRef(null)

    useEffect(() => {
        setQuery(value || '')
    }, [value])

    useEffect(() => {
        // Handle clicking outside to close suggestions
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const searchLocation = async (text) => {
        if (!text || text.length < 3) {
            setSuggestions([])
            return
        }

        setLoading(true)
        try {
            // Use Nominatim OpenStreetMap API
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&addressdetails=1&limit=5`
            )
            const data = await response.json()
            setSuggestions(data)
            setShowSuggestions(true)
        } catch (error) {
            console.error('Error fetching location:', error)
        } finally {
            setLoading(false)
        }
    }

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query && query !== value && !disabled) {
                searchLocation(query)
            }
        }, 500)

        return () => clearTimeout(timer)
    }, [query, value, disabled])

    const handleSelect = (item) => {
        const formattedAddress = item.display_name

        // Update local state
        setQuery(formattedAddress)
        setShowSuggestions(false)

        // Pass back to parent
        // item.lat and item.lon are strings from OSM
        if (onLocationSelect) {
            onLocationSelect({
                address: formattedAddress,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon)
            })
        }

        if (onChange) {
            onChange(formattedAddress)
        }
    }

    return (
        <div className={clsx("relative", className)} ref={wrapperRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loading ? (
                        <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                    ) : (
                        <MapPin className="h-5 w-5 text-slate-400" />
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
                        disabled && "bg-slate-100 text-slate-500 cursor-not-allowed"
                    )}
                    placeholder="Search city or address..."
                    autoComplete="off"
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white mt-1 rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-auto divide-y divide-slate-100">
                    {suggestions.map((item) => (
                        <li key={item.place_id}>
                            <button
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3"
                            >
                                <MapPin className="h-4 w-4 text-slate-400 mt-1 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-slate-900 line-clamp-1">
                                        {item.name || item.address?.city || item.address?.town || item.address?.village}
                                    </p>
                                    <p className="text-xs text-slate-500 line-clamp-1">{item.display_name}</p>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
