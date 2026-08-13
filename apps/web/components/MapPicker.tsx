"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapPickerProps {
  pincode: string;
  onLocationSelect: (lat: number, lng: number) => void;
  initialCoordinates?: [number, number] | null;
}

function LocationMarker({ onSelect, defaultPos }: { onSelect: (l: [number, number]) => void, defaultPos: [number, number] }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? <Marker position={position} /> : (defaultPos[0] !== 0 ? <Marker position={defaultPos} /> : null);
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center[0] !== 0 && center[1] !== 0) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function MapPicker({ pincode, onLocationSelect, initialCoordinates }: MapPickerProps) {
  const [center, setCenter] = useState<[number, number]>(initialCoordinates || [0, 0]);

  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  // Auto-locate based on pincode when it's exactly 6 digits
  useEffect(() => {
    if (pincode.length === 6) {
      setLoading(true);
      fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&countrycodes=in&format=json`)
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);
            setCenter([lat, lon]);
            onLocationSelect(lat, lon);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [pincode]);

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCenter([lat, lon]);
          onLocationSelect(lat, lon);
        },
        (error) => {
          alert("Could not detect location. Please tap on the map.");
        }
      );
    }
  };

  return (
    <div className="relative w-full h-[300px] rounded-xl overflow-hidden border-2 border-gray-200 z-10">
      <div className="absolute top-2 right-2 z-[1000]">
        <button 
          onClick={(e) => { e.preventDefault(); handleDetectLocation(); }}
          className="bg-black text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-gray-800 transition-colors"
        >
          Detect My Location
        </button>
      </div>
      
      {/* Default view is center of India if no pincode/location yet */}
      <MapContainer 
        center={center[0] === 0 ? [20.5937, 78.9629] : center} 
        zoom={center[0] === 0 ? 4 : 13} 
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} />
        <LocationMarker onSelect={(pos) => onLocationSelect(pos[0], pos[1])} defaultPos={initialCoordinates || center} />
      </MapContainer>
      
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[2000] flex items-center justify-center">
          <span className="font-bold">Locating...</span>
        </div>
      )}
    </div>
  );
}
