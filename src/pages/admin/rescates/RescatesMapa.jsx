// src/pages/admin/rescates/RescatesMapa.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ArrowLeft, Filter, MapPin, Eye, Info } from 'lucide-react';
import L from 'leaflet';
import { rescateService } from '../../../services/rescateService';
import { getImageUrl } from '../../../utils/imageUtils';
import './RescatesMapa.css';

// Reparar problemas de íconos por defecto de Leaflet en entornos de empaquetado (Vite/Webpack)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const RescatesMapa = () => {
  const navigate = useNavigate();
  const [casos, setCasos] = useState([]); // Garantizamos un array inicial seguro
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Centro inicial del mapa por defecto (Ajusta estas coordenadas a tu ciudad/región base)
  const centroPorDefecto = [2.4419, -76.6063]; 

  useEffect(() => {
    const fetchCoordenadas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await rescateService.getCoordenadasRescates();
        
        if (response && response.data) {
          const respuestaApi = response.data;
          
          if (respuestaApi.success) {
            // Desenvolvemos la paginación de Laravel si existe (.data.data) o tomamos la respuesta limpia (.data)
            const dataExtraida = respuestaApi.data?.data || respuestaApi.data;
            
            if (Array.isArray(dataExtraida)) {
              setCasos(dataExtraida);
            } else {
              console.warn("Los datos recibidos no poseen estructura de Array:", dataExtraida);
              setCasos([]);
            }
          } else {
            setError(respuestaApi.message || "El servidor falló al procesar la colección.");
          }
        }
      } catch (err) {
        console.error("Error cargando el geovisor:", err);
        setError("No se pudieron cargar los puntos georreferenciados.");
        setCasos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordenadas();
  }, []);

  // Filtrado reactivo de casos según la prioridad seleccionada
  const casosFiltrados = Array.isArray(casos)
    ? casos.filter(caso => {
        // Validamos que el caso tenga propiedades latitud y longitud válidas
        const tieneCoordenadas = caso.latitud && caso.longitud;
        if (!tieneCoordenadas) return false;

        if (filtroPrioridad === 'todos') return true;
        return String(caso.prioridad).toLowerCase() === filtroPrioridad.toLowerCase();
      })
    : [];

  // Retorna una clase CSS para los puntos de la leyenda según prioridad
  const obtenerColorPrioridad = (prioridad) => {
    switch (String(prioridad).toLowerCase()) {
      case 'alta': return 'red';
      case 'media': return 'orange';
      case 'baja': return 'green';
      default: return 'orange';
    }
  };

  return (
    <div className="ram-container">
      {/* ===== CONTROL CABECERA MAPA ===== */}
      <header className="ram-map-header">
        <button className="ram-btn-back" onClick={() => navigate('/admin/rescates')}>
          <ArrowLeft size={16} />
          Volver a Consola
        </button>

        <div className="ram-filter-bar">
          <span className="ram-filter-label">
            <Filter size={14} />
            Prioridad:
          </span>
          <select 
            className="ram-select-filter"
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
          >
            <option value="todos">Todos los Casos</option>
            <option value="alta">Alta Urgencia</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </header>

      {/* ===== CONTENEDOR DE MAPA Y HOVER CARDS ===== */}
      <main className="ram-map-wrapper">
        {loading ? (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', background: 'var(--color-card-bg)', gap: '10px' }}>
            <span>Cargando Geovisor...</span>
          </div>
        ) : error ? (
          <div style={{ display: 'flex', height: '100%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--color-card-bg)', padding: '20px', color: '#ef4444' }}>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <MapContainer 
              center={centroPorDefecto} 
              zoom={13} 
              className="ram-leaflet-container"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="leaflet-tile-layer" // Aplica tu filtro CSS de modo oscuro automáticamente
              />

              {casosFiltrados.map((caso) => {
                const lat = parseFloat(caso.latitud);
                const lng = parseFloat(caso.longitud);

                if (isNaN(lat) || isNaN(lng)) return null;

                return (
                  <Marker key={caso.id} position={[lat, lng]}>
                    <Popup className="ram-popup-custom">
                      <div className="ram-popup-content">
                        {caso.foto_principal && (
                          <img 
                            src={getImageUrl(caso.foto_principal)} 
                            alt={caso.titulo || "Mascota"} 
                            className="ram-popup-img"
                          />
                        )}
                        <h3>{caso.titulo || 'Caso sin Título'}</h3>
                        <p className="ram-popup-desc">{caso.descripcion || 'Sin descripción provista.'}</p>
                        
                        <div className="ram-popup-meta">
                          <MapPin size={12} />
                          <span>Prioridad: <strong>{caso.prioridad || 'Media'}</strong></span>
                        </div>

                        <button 
                          className="ram-popup-btn"
                          onClick={() => navigate(`/admin/rescates/show/${caso.id}`)}
                        >
                          <Eye size={12} />
                          Ver Detalles
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* ===== TARJETA DE LEYENDA FLOTANTE ===== */}
            <div className="ram-legend-card">
              <h4>
                <Info size={12} />
                Leyenda de Alertas
              </h4>
              <div className="legend-item">
                <span className="dot red"></span> Urgencia Alta
              </div>
              <div className="legend-item">
                <span className="dot orange"></span> Emergencia Media
              </div>
              <div className="legend-item">
                <span className="dot green"></span> Estado Estable / Baja
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default RescatesMapa;