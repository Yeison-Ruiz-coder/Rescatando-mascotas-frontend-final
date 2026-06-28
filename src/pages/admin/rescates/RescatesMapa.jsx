// src/pages/admin/rescates/RescatesMapa.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ArrowLeft, Filter, MapPin, Eye, Info } from 'lucide-react';
import L from 'leaflet';
import { rescateService } from '../../../services/rescateService';
import { getImageUrl } from '../../../utils/imageUtils';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import './RescatesMapa.css';

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
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [casos, setCasos] = useState([]);
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
            const dataExtraida = respuestaApi.data?.data || respuestaApi.data;
            if (Array.isArray(dataExtraida)) {
              setCasos(dataExtraida);
            } else {
              setCasos([]);
            }
          } else {
            setError(respuestaApi.message || t('errors.load_geovisor'));
          }
        }
      } catch (err) {
        console.error("Error:", err);
        setError(t('errors.load_geovisor'));
        setCasos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCoordenadas();
  }, [t]);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  const casosFiltrados = Array.isArray(casos)
    ? casos.filter(caso => {
        const tieneCoordenadas = caso.latitud && caso.longitud;
        if (!tieneCoordenadas) return false;
        if (filtroPrioridad === 'todos') return true;
        return String(caso.prioridad).toLowerCase() === filtroPrioridad.toLowerCase();
      })
    : [];

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
      <div className="ram-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('banner.titulo_mapa', 'Geovisor de Rescates - Popayán'),
            solicitudes: casos.length,
            adopciones: 0,
            eventos: 0,
          }}
        />
      </div>

      <div className="bento-container ram-content">
        <div className="ram-map-header">
          <button className="ram-btn-back" onClick={() => navigate('/admin/rescates')}>
            <ArrowLeft size={16} />
            {t('volver_consola', 'Volver a Consola')}
          </button>

          <div className="ram-filter-bar">
            <span className="ram-filter-label">
              <Filter size={14} />
              {t('prioridad', 'Prioridad')}:
            </span>
            <select 
              className="ram-select-filter"
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
            >
              <option value="todos">{t('todos_casos', 'Todos los Casos')}</option>
              <option value="alta">{t('prioridad_alta', 'Alta Urgencia')}</option>
              <option value="media">{t('prioridad_media', 'Media')}</option>
              <option value="baja">{t('prioridad_baja', 'Baja')}</option>
            </select>
          </div>
        </div>

        <main className="ram-map-wrapper">
          {loading ? (
            <div className="ram-loading">
              <div className="spinner-modern"></div>
              <p>{t('cargando_mapa', 'Cargando Geovisor...')}</p>
            </div>
          ) : error ? (
            <div className="ram-error">
              <AlertCircle size={48} className="error-icon-modern" />
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
                  className="leaflet-tile-layer"
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
                          <h3>{caso.titulo || t('sin_titulo', 'Caso sin título')}</h3>
                          <p className="ram-popup-desc">{caso.descripcion || t('sin_descripcion', 'Sin descripción.')}</p>
                          <div className="ram-popup-meta">
                            <MapPin size={12} />
                            <span>{t('prioridad', 'Prioridad')}: <strong>{caso.prioridad || t('media', 'Media')}</strong></span>
                          </div>
                          <button 
                            className="ram-popup-btn"
                            onClick={() => navigate(`/admin/rescates/show/${caso.id}`)}
                          >
                            <Eye size={12} />
                            {t('ver_detalles', 'Ver Detalles')}
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              <div className="ram-legend-card">
                <h4>
                  <Info size={12} />
                  {t('leyenda', 'Leyenda de Alertas')}
                </h4>
                <div className="legend-item">
                  <span className="dot red"></span> {t('urgencia_alta', 'Urgencia Alta')}
                </div>
                <div className="legend-item">
                  <span className="dot orange"></span> {t('emergencia_media', 'Emergencia Media')}
                </div>
                <div className="legend-item">
                  <span className="dot green"></span> {t('estado_estable', 'Estado Estable / Baja')}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default RescatesMapa;