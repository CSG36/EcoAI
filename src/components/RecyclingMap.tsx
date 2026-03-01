import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Fix for default marker icons in Leaflet with React
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Center {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  types: string[];
}

interface RecyclingMapProps {
  centers: Center[];
  userLocation: [number, number] | null;
}

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

export const RecyclingMap: React.FC<RecyclingMapProps> = ({ centers, userLocation }) => {
  const defaultCenter: [number, number] = userLocation || [0, 0];

  return (
    <div className="h-[400px] w-full rounded-3xl overflow-hidden border-2 border-stone-200 shadow-inner relative z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={userLocation ? 13 : 2} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>
              <div className="font-bold text-eco-600">You are here</div>
            </Popup>
          </Marker>
        )}

        {centers.map((center) => (
          <Marker key={center.id} position={[center.lat, center.lng]}>
            <Popup>
              <div className="p-2 max-w-[200px]">
                <h3 className="font-bold text-stone-900 mb-1">{center.name}</h3>
                <p className="text-xs text-stone-500 mb-2">{center.address}</p>
                <div className="flex flex-wrap gap-1">
                  {center.types.map((type, i) => (
                    <span key={i} className="text-[10px] bg-eco-100 text-eco-700 px-1.5 py-0.5 rounded-md font-bold uppercase">
                      {type}
                    </span>
                  ))}
                </div>
                <button 
                  className="mt-3 w-full bg-stone-900 text-white text-[10px] py-1.5 rounded-lg font-bold flex items-center justify-center gap-1"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lng}`, '_blank')}
                >
                  <Navigation size={10} />
                  Get Directions
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {userLocation && <ChangeView center={userLocation} />}
      </MapContainer>
    </div>
  );
};
