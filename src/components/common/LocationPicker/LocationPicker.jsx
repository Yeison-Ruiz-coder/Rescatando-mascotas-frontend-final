// src/components/common/LocationPicker/LocationPicker.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Solución para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Componente para capturar clics en el mapa
function LocationMarker({ position, setPosition, map }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      map?.setView(newPos, 15);
    },
  });
  
  return position === null ? null : <Marker position={position} />;
}

const LocationPicker = ({ onLocationChange, initialLat, initialLng, height = '300px' }) => {
  const [position, setPosition] = useState(null);
  const [map, setMap] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Obtener ubicación actual automáticamente al cargar
  useEffect(() => {
    if (navigator.geolocation && !position && !initialLat && !initialLng) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPosition = [pos.coords.latitude, pos.coords.longitude];
          setPosition(newPosition);
          onLocationChange?.(pos.coords.latitude, pos.coords.longitude);
          if (map) {
            map.setView(newPosition, 14);
          }
        },
        (error) => {
          console.warn('Error obteniendo ubicación:', error);
          // No establecer centro por defecto, dejar que el usuario elija
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Sincronizar cuando cambian las props desde fuera
  useEffect(() => {
    if (initialLat && initialLng && map) {
      const newPosition = [initialLat, initialLng];
      setPosition(newPosition);
      map.setView(newPosition, 15);
    }
  }, [initialLat, initialLng, map]);

  const handleLocationChange = (lat, lng) => {
    setPosition([lat, lng]);
    onLocationChange?.(lat, lng);
  };

  // Si no hay posición, mostrar un mensaje para que el usuario seleccione
  if (!position && !initialLat && !initialLng && !isMapReady) {
    return (
      <div className="location-picker-placeholder" style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '16px', flexDirection: 'column', gap: '1rem' }}>
        <i className="fas fa-map-marker-alt" style={{ fontSize: '2rem', color: '#667eea' }}></i>
        <p style={{ color: '#475569', textAlign: 'center', margin: 0 }}>
          Haz clic en el mapa para seleccionar la ubicación del rescate
        </p>
        <button 
          type="button" 
          className="btn-location-picker"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((pos) => {
                const newPos = [pos.coords.latitude, pos.coords.longitude];
                setPosition(newPos);
                onLocationChange?.(pos.coords.latitude, pos.coords.longitude);
                setIsMapReady(true);
              });
            }
          }}
        >
          <i className="fas fa-location-dot"></i> Usar mi ubicación
        </button>
      </div>
    );
  }

  const center = position || (initialLat && initialLng ? [initialLat, initialLng] : [4.5709, -74.2973]);

  return (
    <div className="location-picker">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height, width: '100%', borderRadius: '16px', zIndex: 1 }}
        scrollWheelZoom={true}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker 
          position={position || (initialLat && initialLng ? [initialLat, initialLng] : null)} 
          setPosition={(pos) => handleLocationChange(pos[0], pos[1])}
          map={map}
        />
      </MapContainer>
      {position && (
        <div className="location-coords">
          <i className="fas fa-map-marker-alt"></i>
          <span>Ubicación seleccionada: {position[0].toFixed(6)}, {position[1].toFixed(6)}</span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;