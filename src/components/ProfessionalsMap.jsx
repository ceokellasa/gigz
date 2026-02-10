import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowRight } from 'lucide-react';

const containerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '1.5rem', // Matches the rounded theme
};

// Default center (Bangalore) - fall back if user location denied
const defaultCenter = {
    lat: 12.9716,
    lng: 77.5946
};

// Custom map styles (Clean, light theme to match app)
const mapStyles = [
    {
        "featureType": "poi",
        "elementType": "labels.text",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "poi.business",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "road",
        "elementType": "labels.icon",
        "stylers": [{ "visibility": "off" }]
    },
    {
        "featureType": "transit",
        "stylers": [{ "visibility": "off" }]
    }
];

export default function ProfessionalsMap({ professionals }) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const [map, setMap] = useState(null);
    const [selectedProf, setSelectedProf] = useState(null);
    const [userLocation, setUserLocation] = useState(null);

    // Get user location on load
    useState(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                () => {
                    console.log("Location access denied, using default");
                }
            );
        }
    }, []);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    // Filter professionals with valid coordinates (or mock them for demo if needed)
    // For now, we only show valid ones.
    // TODO: In production, ensure backend returns lat/lng
    const validProfessionals = useMemo(() => {
        return professionals.filter(p => p.latitude && p.longitude);
    }, [professionals]);

    if (!isLoaded) return <div className="h-96 w-full bg-slate-100 animate-pulse rounded-[1.5rem]" />;

    return (
        <div className="relative w-full h-[600px] rounded-[1.5rem] overflow-hidden shadow-lg border border-slate-200">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation || defaultCenter}
                zoom={12}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    styles: mapStyles,
                    disableDefaultUI: false, // Keep zoom controls
                    zoomControl: true,
                    streetViewControl: false,
                    mapTypeControl: false,
                    fullscreenControl: true,
                }}
            >
                {/* User Marker */}
                {userLocation && (
                    <Marker
                        position={userLocation}
                        icon={{
                            path: window.google.maps.SymbolPath.CIRCLE,
                            scale: 8,
                            fillColor: "#4F46E5",
                            fillOpacity: 1,
                            strokeColor: "#ffffff",
                            strokeWeight: 2,
                        }}
                        title="You are here"
                    />
                )}

                {/* Professional Markers */}
                {validProfessionals.map((prof) => (
                    <Marker
                        key={prof.id}
                        position={{ lat: prof.latitude, lng: prof.longitude }}
                        onClick={() => setSelectedProf(prof)}
                    // Custom Icon logic could go here (e.g., profession-based icons)
                    />
                ))}

                {/* Info Window for Selected Professional */}
                {selectedProf && (
                    <InfoWindow
                        position={{ lat: selectedProf.latitude, lng: selectedProf.longitude }}
                        onCloseClick={() => setSelectedProf(null)}
                    >
                        <div className="min-w-[200px] max-w-[250px] p-1">
                            <div className="flex items-center gap-3 mb-2">
                                <img
                                    src={selectedProf.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${selectedProf.profiles?.full_name}&background=random`}
                                    alt={selectedProf.profiles?.full_name}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                                <div>
                                    <h3 className="font-bold text-slate-900 text-sm">{selectedProf.profiles?.full_name}</h3>
                                    <p className="text-xs text-slate-500 font-medium">{selectedProf.profession}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-2 text-xs text-slate-600">
                                <span className="font-bold">₹{selectedProf.hourly_rate}/hr</span>
                                <span>•</span>
                                <div className="flex items-center">
                                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                                    <span>{selectedProf.years_of_experience}y Exp</span>
                                </div>
                            </div>

                            <Link
                                to={`/professionals/${selectedProf.id}`}
                                className="block w-full text-center bg-black text-white text-xs font-bold py-2 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                View Profile
                            </Link>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Floating Toggle Hint (Optional) */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-slate-100 z-10">
                Showing {validProfessionals.length} Professionals nearby
            </div>
        </div>
    );
}
