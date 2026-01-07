// components/LocationMap.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  MapPin,
  Navigation,
  Target,
  Search,
  RotateCcw,
  AlertCircle,
  Loader2,
  Map,
} from "lucide-react";
import dynamic from "next/dynamic";

// Create custom orange marker icon
const createOrangeMarkerIcon = () => {
  return L.divIcon({
    html: `
      <div style="
        position: relative;
        width: 25px;
        height: 41px;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <!-- Marker pin -->
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="25" height="41" style="position: relative; z-index: 1;">
          <path fill="#FF6B35" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
          <circle cx="192" cy="192" r="80" fill="white"/>
          <circle cx="192" cy="192" r="60" fill="#FF6B35"/>
        </svg>
      </div>
    `,
    className: "custom-orange-marker",
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
    popupAnchor: [0, -41],
  });
};

interface LocationMapProps {
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  initialCoords?: { lat: number; lng: number };
  required?: boolean;
  zoom?: number;
  height?: string;
}

// Component to handle map clicks
function LocationMarker({
  position,
  setPosition,
}: {
  position: { lat: number; lng: number } | null;
  setPosition: (pos: { lat: number; lng: number }) => void;
}) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={createOrangeMarkerIcon()}>
      <Popup>
        <div className="p-2 min-w-[200px]">
          <div className="  text-[#0A2647]">📍 Selected Location</div>
          <div className="text-sm text-gray-600 mt-1">
            <div className="grid grid-cols-2 gap-1">
              <span className="font-medium">Latitude:</span>
              <span className="font-mono">{position.lat.toFixed(6)}</span>
              <span className="font-medium">Longitude:</span>
              <span className="font-mono">{position.lng.toFixed(6)}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Click anywhere else to move this pin
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

// Component to reset view
function ResetView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  return null;
}

// Kenyan counties and major towns data
const kenyanLocations = [
  { name: "Nairobi", lat: -1.2921, lng: 36.8219, type: "city" },
  { name: "Mombasa", lat: -4.0435, lng: 39.6682, type: "city" },
  { name: "Kisumu", lat: -0.1022, lng: 34.7617, type: "city" },
  { name: "Nakuru", lat: -0.3031, lng: 36.08, type: "city" },
  { name: "Eldoret", lat: 0.5143, lng: 35.2698, type: "city" },
  { name: "Thika", lat: -1.0392, lng: 37.0694, type: "town" },
  { name: "Nyeri", lat: -0.4201, lng: 36.9476, type: "town" },
  { name: "Meru", lat: 0.0515, lng: 37.6454, type: "town" },
  { name: "Kakamega", lat: 0.2842, lng: 34.7523, type: "town" },
  { name: "Kitale", lat: 1.0157, lng: 34.9894, type: "town" },
  { name: "Kisii", lat: -0.6773, lng: 34.7796, type: "town" },
  { name: "Malindi", lat: -3.2176, lng: 40.1192, type: "town" },
  { name: "Garissa", lat: -0.4569, lng: 39.6461, type: "town" },
  { name: "Wajir", lat: 1.7488, lng: 40.0586, type: "town" },
  { name: "Lodwar", lat: 3.1199, lng: 35.5964, type: "town" },
];

export default function LocationMap({
  onLocationSelect,
  initialCoords = { lat: -1.2921, lng: 36.8219 }, // Nairobi, Kenya
  required = true,
  zoom = 13,
  height = "500px",
}: LocationMapProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialCoords.lat !== 0 && initialCoords.lng !== 0 ? initialCoords : null
  );
  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const mapRef = useRef<any>(null);

  // Default center for Kenya (Nairobi)
  const defaultCenter: [number, number] = [-1.2921, 36.8219];

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setMapReady(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapReady) return;
    // Set initial position if provided
    if (initialCoords.lat !== 0 && initialCoords.lng !== 0) {
      setPosition(initialCoords);
    }
  }, [initialCoords]);

  // Handle position changes
  useEffect(() => {
    if (position) {
      onLocationSelect(position);
    }
  }, [position, onLocationSelect]);

  // Get current location using geolocation
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setUseCurrentLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPosition = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        // Check if location is in Kenya (rough bounds)
        const isInKenya =
          newPosition.lat >= -4.9 &&
          newPosition.lat <= 5.0 &&
          newPosition.lng >= 33.5 &&
          newPosition.lng <= 42.0;

        if (!isInKenya) {
          alert(
            "Your location appears to be outside Kenya. Please select a location within Kenya."
          );
          setUseCurrentLocation(false);
          return;
        }

        setPosition(newPosition);
        if (mapRef.current) {
          mapRef.current.flyTo([newPosition.lat, newPosition.lng], 15);
        }
        setUseCurrentLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        let message = "Unable to retrieve your location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message +=
              "Please enable location services in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            message += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message += "The request to get your location timed out.";
            break;
          default:
            message += "An unknown error occurred.";
        }

        alert(message);
        setUseCurrentLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Handle search for location
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setShowLocationSuggestions(true);
      return;
    }

    setIsSearching(true);

    // First check our local Kenyan locations
    const matchedLocation = kenyanLocations.find((loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchedLocation) {
      const newPosition = {
        lat: matchedLocation.lat,
        lng: matchedLocation.lng,
      };
      setPosition(newPosition);
      if (mapRef.current) {
        mapRef.current.flyTo([matchedLocation.lat, matchedLocation.lng], 14);
      }
      setIsSearching(false);
      return;
    }

    // Try using OpenStreetMap with proper headers and CORS proxy
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery + ", Kenya"
      )}&limit=1`;

      const response = await fetch(searchUrl, {
        headers: {
          Accept: "application/json",
          "User-Agent": "JobPlatform/1.0", // Required by Nominatim
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();

      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);

        // Check if result is in Kenya
        const isInKenya =
          lat >= -4.9 && lat <= 5.0 && lng >= 33.5 && lng <= 42.0;

        if (!isInKenya) {
          alert(
            "Location found is outside Kenya. Please search for a Kenyan location."
          );
          setIsSearching(false);
          return;
        }

        const newPosition = { lat, lng };
        setPosition(newPosition);
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 15);
        }
      } else {
        alert(
          "Location not found in Kenya. Please try a different search term."
        );
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      alert(
        "Unable to search at the moment. Please use the Kenyan locations list or manually select on the map."
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Reset to default center
  const resetToDefault = () => {
    setPosition(
      defaultCenter ? { lat: defaultCenter[0], lng: defaultCenter[1] } : null
    );
    if (mapRef.current) {
      mapRef.current.flyTo(defaultCenter, zoom);
    }
  };

  // Handle manual coordinate input
  const handleManualCoordinates = () => {
    const latInput = prompt("Enter latitude (e.g., -1.2921):");
    const lngInput = prompt("Enter longitude (e.g., 36.8219):");

    if (latInput && lngInput) {
      const lat = parseFloat(latInput);
      const lng = parseFloat(lngInput);

      if (!isNaN(lat) && !isNaN(lng)) {
        // Validate Kenyan bounds
        const isInKenya =
          lat >= -4.9 && lat <= 5.0 && lng >= 33.5 && lng <= 42.0;

        if (!isInKenya) {
          alert(
            "Coordinates are outside Kenya. Please enter coordinates within Kenya."
          );
          return;
        }

        const newPosition = { lat, lng };
        setPosition(newPosition);
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 15);
        }
      } else {
        alert("Invalid coordinates. Please enter valid numbers.");
      }
    }
  };

  // Filter Kenyan locations based on search
  const filteredLocations =
    searchQuery.trim() === ""
      ? kenyanLocations.slice(0, 5) // Show top 5 when empty
      : kenyanLocations
          .filter((loc) =>
            loc.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          .slice(0, 8); // Limit to 8 results

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowLocationSuggestions(true);
              }}
              onFocus={() => setShowLocationSuggestions(true)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search Kenyan towns or cities..."
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#FF6B35] focus:ring-2 focus:ring-[#FF6B35]/20 focus:outline-none text-base"
            />

            {/* Location Suggestions */}
            {showLocationSuggestions &&
              searchQuery &&
              filteredLocations.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {filteredLocations.map((location, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setSearchQuery(location.name);
                        setPosition({ lat: location.lat, lng: location.lng });
                        if (mapRef.current) {
                          mapRef.current.flyTo(
                            [location.lat, location.lng],
                            14
                          );
                        }
                        setShowLocationSuggestions(false);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                    >
                      <MapPin
                        className="text-[#FF6B35] flex-shrink-0"
                        size={18}
                      />
                      <div>
                        <div className="font-medium text-gray-900">
                          {location.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {location.type === "city" ? "City" : "Town"}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </div>

          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#ff5722] text-white rounded-xl hover:from-[#ff5722] hover:to-[#FF6B35] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium min-w-[120px]"
          >
            {isSearching ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>Search</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetToDefault}
            className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={useCurrentLocation}
            className="flex-1 min-w-[200px] px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {useCurrentLocation ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Detecting Location...</span>
              </>
            ) : (
              <>
                <Navigation size={20} />
                <span>Use My Current Location</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleManualCoordinates}
            className="flex-1 min-w-[200px] px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all flex items-center justify-center gap-3"
          >
            <Target size={20} />
            <span>Enter Coordinates</span>
          </button>
        </div>
      </div>

      {/* Coordinates Display */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold">
                L
              </span>
              Latitude
            </label>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-300 font-mono text-lg text-gray-800">
              {position ? position.lat.toFixed(6) : "---.------"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs font-semibold">
                N
              </span>
              Longitude
            </label>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-300 font-mono text-lg text-gray-800">
              {position ? position.lng.toFixed(6) : "---.------"}
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-3">
            <MapPin className="text-[#FF6B35] flex-shrink-0 mt-0.5" size={18} />
            <div className="text-sm">
              <span className="font-medium text-gray-700">
                {position
                  ? "✓ Location selected! Fundis will use these exact coordinates to find you."
                  : "Click on the map below to select a location or use search/current location."}
              </span>
              {position && (
                <div className="mt-1 text-xs text-gray-500">
                  Drag the map or click elsewhere to adjust the pin location
                </div>
              )}
            </div>
          </div>
        </div>

        {required && !position && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
            <span className="text-sm font-medium text-red-700">
              * Location selection is required. Please select a point on the
              map.
            </span>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div
        className="rounded-xl overflow-hidden border-2 border-gray-300 shadow-lg relative "
        style={{ height }}
      >
        {mapReady ? (
          <MapContainer
            center={position ? [position.lat, position.lng] : defaultCenter}
            zoom={zoom}
            style={{ height: "100%", width: "100%" }}
            ref={mapRef}
            scrollWheelZoom={true}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {position && <ResetView center={[position.lat, position.lng]} />}

            <LocationMarker
              position={position}
              setPosition={(pos) => setPosition(pos)}
            />
          </MapContainer>
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 mx-auto border-4 border-gray-200 border-t-[#FF6B35] rounded-full animate-spin" />
                <Map
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#FF6B35]"
                  size={24}
                />
              </div>
              <div>
                <p className="text-gray-700 font-medium">
                  Loading interactive map...
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Preparing location selection tool
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Map Controls Overlay */}
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            title="Use current location"
          >
            <Navigation size={20} className="text-[#0A2647]" />
          </button>
          <button
            type="button"
            onClick={resetToDefault}
            className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
            title="Reset view"
          >
            <RotateCcw size={20} className="text-[#0A2647]" />
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-l-4 border-[#FF6B35] p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="bg-[#FF6B35] p-2 rounded-lg">
            <MapPin className="text-white" size={20} />
          </div>
          <div>
            <h4 className="  text-gray-900">How to select your location:</h4>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Click on the map</span> to drop
                  a pin at your exact location
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Use "Current Location"</span>{" "}
                  for automatic GPS detection
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Search above</span> for Kenyan
                  towns or cities
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Enter Coordinates</span>{" "}
                  manually if you know them
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">
                Popular Kenyan Locations:
              </h5>
              <div className="flex flex-wrap gap-2">
                {kenyanLocations.slice(0, 6).map((location) => (
                  <button
                    key={location.name}
                    type="button"
                    onClick={() => {
                      setPosition({ lat: location.lat, lng: location.lng });
                      if (mapRef.current) {
                        mapRef.current.flyTo([location.lat, location.lng], 14);
                      }
                    }}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 hover:border-[#FF6B35] transition-colors"
                  >
                    {location.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 p-3 bg-white/50 rounded border border-orange-200">
              <p className="text-sm font-medium text-gray-800">
                🔒 <strong>Privacy Note:</strong> These exact coordinates will
                only be shared with fundis you hire to help them find your
                location accurately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
