'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix ikon marker Leaflet di Next.js
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface WasteLocation {
  id: string;
  waste_type: string;
  weight_kg: number;
  location_name: string;
  lat?: number | null;
  lng?: number | null;
  location_lat?: number | null;
  location_lng?: number | null;
  status: string;
}

interface MapProps {
  locations: WasteLocation[];
}

export default function InteractiveMap({ locations }: MapProps) {
  // Koordinat Default (Jakarta / Pusat Kota)
  const defaultLat = -6.2088;
  const defaultLng = 106.8456;

  return (
    <div className="h-[350px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm z-0 relative">
      <MapContainer
        center={[defaultLat, defaultLng]}
        zoom={12}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {locations.map((loc) => {
          // Only render verifiable location data; no synthetic map markers.
          const lat = loc.lat ?? loc.location_lat;
          const lng = loc.lng ?? loc.location_lng;

          if (typeof lat !== 'number' || typeof lng !== 'number') return null;

          return (
            <Marker key={loc.id} position={[lat, lng]} icon={customIcon}>
              <Popup>
                <div className="p-1 space-y-1">
                  <h4 className="font-bold text-xs text-gray-800">{loc.location_name}</h4>
                  <p className="text-[11px] text-gray-600">
                    📦 {loc.waste_type} ({loc.weight_kg} kg)
                  </p>
                  <span
                    className={`inline-block text-[10px] px-2 py-0.5 rounded font-semibold ${
                      loc.status === 'claimed'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {loc.status === 'claimed' ? 'Telah Diklaim' : 'Siap Di-pickup'}
                  </span>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}   
