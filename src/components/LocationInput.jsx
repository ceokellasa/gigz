import { useState, useEffect, useRef } from 'react'
import { MapPin, Loader2, AlertCircle, Globe } from 'lucide-react' // Added Globe for OSM indicator
import clsx from 'clsx'
import { useLocationSearch } from '../hooks/useLocationSearch'

export default function LocationInput({ value, onChange, onLocationSelect, disabled, className }) {
    const [query, setQuery] = useState(value || '')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const wrapperRef = useRef(null)

    // Use our new hook!
    const { suggestions, loading, error, search, getDetails, provider } = useLocationSearch()

    // Sync input value
    useEffect(() => {
        if (value !== undefined && value !== query) {
            setQuery(value)
        }
    }, [value])

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query && query.length > 2 && !disabled) {
                search(query)
            }
        }, 500)
        return () => clearTimeout(timer)
    }, [query, disabled, search])

    // Click Outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (item) => {
        setQuery(item.description)
        setShowSuggestions(false)
        if (onChange) onChange(item.description)

        getDetails(item, (locationData) => {
            if (onLocationSelect) {
                onLocationSelect(locationData)
            }
        })
    }

    return (
        <div className={clsx("relative", className)} ref={wrapperRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loading ? (
                        <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
                    ) : provider === 'osm' ? (
                        <Globe className="h-4 w-4 text-green-600" /> /* Visual indicator for OSM */
                    ) : (
                        <MapPin className="h-5 w-5 text-slate-400" />
                    )}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        setShowSuggestions(true)
                        if (onChange) onChange(e.target.value)
                    }}
                    onFocus={() => {
                        if (suggestions.length > 0) setShowSuggestions(true)
                    }}
                    disabled={disabled}
                    className={clsx(
                        "input-field pl-10",
                        disabled && "bg-slate-100 text-slate-500 cursor-not-allowed",
                        error && "border-red-300"
                    )}
                    placeholder="City, Area or Zip..."
                    autoComplete="off"
                />
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-[9999] w-full bg-white mt-1 rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-auto divide-y divide-slate-100">
                    {suggestions.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                onClick={() => handleSelect(item)}
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-start gap-3 border-l-4 border-transparent hover:border-indigo-500"
                            >
                                <MapPin className={clsx("h-4 w-4 mt-1 flex-shrink-0",
                                    item.source === 'google' ? "text-slate-400" : "text-green-500"
                                )} />
                                <div>
                                    <p className="text-sm font-medium text-slate-900 line-clamp-2">{item.description}</p>
                                    {item.source === 'osm' && (
                                        <span className="text-[10px] text-green-600 font-medium px-1.5 py-0.5 bg-green-50 rounded-full">OpenStreetMap</span>
                                    )}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
