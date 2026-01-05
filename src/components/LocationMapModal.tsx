// components/LocationMapModal.tsx
"use client";

import { useState, useEffect } from "react";
import LocationMap from "./LocationMap";
import { X, MapPin, CheckCircle } from "lucide-react";

interface LocationMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (coords: { lat: number; lng: number }) => void;
  initialCoords?: { lat: number; lng: number };
}

export default function LocationMapModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialCoords,
}: LocationMapModalProps) {
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(initialCoords || null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    console.log("LocationMapModal isOpen:", isOpen);
    console.log("Selected coords:", selectedCoords);
  }, [isOpen, selectedCoords]);

  const handleLocationSelect = (coords: { lat: number; lng: number }) => {
    setSelectedCoords(coords);
  };

  const handleConfirm = () => {
    if (selectedCoords) {
      onLocationSelect(selectedCoords);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex  items-center justify-center p-4">
        <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0A2647] to-[#1e3a5f] p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-[#FF6B35] p-3 rounded-xl">
                  <MapPin size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Select Job Location</h2>
                  <p className="text-blue-100 mt-1">
                    Click on the map to set exact coordinates for fundis to find
                    you
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={28} />
              </button>
            </div>

            {/* Selected Coordinates Bar */}
            {selectedCoords && (
              <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <CheckCircle className="text-green-400" size={24} />
                    <div>
                      <p className="font-semibold">Location Selected</p>
                      <p className="text-sm text-blue-200 font-mono">
                        Lat: {selectedCoords.lat.toFixed(6)}, Lng:{" "}
                        {selectedCoords.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={onClose}
                      className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#ff5722] text-white rounded-lg hover:from-[#ff5722] hover:to-[#FF6B35] transition-all font-medium flex items-center gap-3"
                    >
                      <CheckCircle size={20} />
                      Confirm Location
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Body - Location Map */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <LocationMap
              onLocationSelect={handleLocationSelect}
              initialCoords={selectedCoords || initialCoords}
              required={true}
              height="500px"
              zoom={13}
            />
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    1
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Click to Select
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Click anywhere on the map to drop a pin at your exact
                    location
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold">
                    2
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Use Current Location
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Let your device automatically detect your current location
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                    3
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Search Locations
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Search for Kenyan towns and cities by name
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
