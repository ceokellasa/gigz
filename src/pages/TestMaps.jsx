import { useState, useEffect, useRef } from 'react'

export default function TestMaps() {
    const [status, setStatus] = useState('Idle')
    const [logs, setLogs] = useState([])
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

    const addLog = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${msg}`])

    useEffect(() => {
        addLog(`Checking API Key: ${apiKey ? 'Present' : 'Missing'}`)
        if (!apiKey) return

        // Try to load script
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
        script.async = true
        script.defer = true

        script.onload = () => {
            addLog("Script Loaded Successfully!")
            // Check Places Service
            try {
                if (window.google.maps.places) {
                    addLog("Places Library Available")
                    // Try a dummy search
                    const service = new window.google.maps.places.AutocompleteService()
                    addLog("AutocompleteService Initialized. Sending Request...")

                    service.getPlacePredictions({ input: 'New York' }, (predictions, status) => {
                        addLog(`API Response Status: ${status}`)
                        if (predictions) {
                            addLog(`Predictions received: ${predictions.length}`)
                        } else {
                            addLog(`No predictions.`)
                        }
                    })
                } else {
                    addLog("Places Library MISSING! (Did you add &libraries=places?)")
                }
            } catch (e) {
                addLog(`Error using Maps API: ${e.message}`)
            }
        }

        script.onerror = () => {
            addLog("Script Load FAILED. Check console for 'Google Maps JavaScript API' errors.")
        }

        document.head.appendChild(script)

        return () => {
            // cleanup if needed
        }
    }, [])

    return (
        <div className="p-10 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Google Maps API Tester</h1>
            <div className="bg-slate-100 p-4 rounded font-mono text-sm">
                <p><strong>API Key:</strong> {apiKey || "NOT FOUND IN .ENV"}</p>
                <div className="mt-4 border-t border-slate-300 pt-2 space-y-1">
                    {logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            </div>

            <p className="mt-8 text-sm text-slate-500">
                If Status is <strong>REQUEST_DENIED</strong>: Key is invalid or API not enabled.<br />
                If Status is <strong>BILLING_NOT_ENABLED</strong>: Enable billing in Google Cloud.<br />
                If Status is <strong>REFERER_NOT_ALLOWED</strong>: Key restrictions are blocking localhost.
            </p>
        </div>
    )
}
