import { useState, useRef, useEffect, useCallback } from 'react';

// Singleton promise to ensure script loaded once
let googleMapsPromise = null;

const loadGoogleMaps = (apiKey) => {
    if (googleMapsPromise) return googleMapsPromise;

    googleMapsPromise = new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.places) {
            resolve(window.google.maps);
            return;
        }

        // Check if script already exists
        if (document.querySelector('script[src*="maps.googleapis.com"]')) {
            const interval = setInterval(() => {
                if (window.google && window.google.maps) {
                    clearInterval(interval);
                    resolve(window.google.maps);
                }
            }, 100);
            return;
        }

        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = (err) => reject(err);
        document.head.appendChild(script);
    });
    return googleMapsPromise;
};

export function useLocationSearch() {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [provider, setProvider] = useState('google'); // 'google' | 'osm'

    const autocompleteService = useRef(null);
    const sessionToken = useRef(null);
    const geocoder = useRef(null);

    // Initialize Google Maps
    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            setProvider('osm'); // No key? Force OSM immediately
            return;
        }

        loadGoogleMaps(apiKey).then((maps) => {
            try {
                autocompleteService.current = new maps.places.AutocompleteService();
                sessionToken.current = new maps.places.AutocompleteSessionToken();
                geocoder.current = new maps.Geocoder();
            } catch (e) {
                console.error("Maps Init Error", e);
                setProvider('osm');
            }
        }).catch(() => {
            console.warn("Maps Script Failed. Switching to OSM.");
            setProvider('osm');
        });
    }, []);

    // Search Function
    const search = useCallback(async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        setError(null);

        // Strategy: Try Google first (if provider is google), fallback to OSM on error/timeout
        if (provider === 'google' && autocompleteService.current) {
            try {
                const request = {
                    input: query,
                    sessionToken: sessionToken.current,
                };

                // Race Promise: Google vs Timeout (1.5s)
                const googlePromise = new Promise((resolve, reject) => {
                    autocompleteService.current.getPlacePredictions(request, (results, status) => {
                        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                            resolve(results);
                        } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                            resolve([]);
                        } else {
                            reject(status);
                        }
                    });
                });

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject("TIMEOUT"), 1500)
                );

                const results = await Promise.race([googlePromise, timeoutPromise]);

                setSuggestions(results.map(p => ({
                    id: p.place_id,
                    description: p.description,
                    source: 'google',
                    raw: p
                })));

            } catch (err) {
                console.warn(`Google Search Failed (${err}). Switching to OSM.`);
                setProvider('osm'); // Switch permanently for session
                searchOSM(query);   // Retry immediately with OSM
            }
        } else {
            // OSM Search
            searchOSM(query);
        }

        setLoading(false);
    }, [provider]);

    const searchOSM = async (query) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
            if (!res.ok) throw new Error("OSM Error");
            const data = await res.json();

            setSuggestions(data.map(item => ({
                id: item.place_id,
                description: item.display_name,
                source: 'osm',
                raw: item
            })));
        } catch (e) {
            console.error(e);
            setError("Could not search location.");
            setSuggestions([]);
        }
    };

    // Get Lat/Lng Details
    const getDetails = useCallback((item, callback) => {
        if (item.source === 'osm') {
            // OSM has lat/lon directly
            const lat = parseFloat(item.raw.lat);
            const lng = parseFloat(item.raw.lon);
            callback({ address: item.description, lat, lng });
        } else if (item.source === 'google' && geocoder.current) {
            // Google needs Geocoding
            geocoder.current.geocode({ placeId: item.id }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    const loc = results[0].geometry.location;
                    callback({
                        address: item.description,
                        lat: loc.lat(),
                        lng: loc.lng()
                    });
                } else {
                    console.error("Geocode failed");
                }
            });
            // Refresh session token
            if (window.google) {
                sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
            }
        }
    }, []);

    return { suggestions, loading, error, search, getDetails, provider };
}
