// src/pages/admin/rescates/RescatesMapa.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { ArrowLeft, Filter, MapPin, Eye, Info, AlertCircle } from 'lucide-react';
import L from 'leaflet';
import { rescateService } from '../../../services/rescateService';
import { getImageUrl } from '../../../utils/imageUtils';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import CustomSelect from '../../../components/common/CustomSelect/CustomSelect';
import 'leaflet/dist/leaflet.css';
import './RescatesMapa.css';

// ===== CONFIGURACIÓN DE ICONOS =====
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ===== CREAR ICONOS PERSONALIZADOS =====
const createCustomIcon = (prioridad, estado) => {
  const colors = {
    alta: '#ef4444',
    media: '#f59e0b',
    baja: '#10b981',
    default: '#667eea'
  };

  const color = colors[prioridad] || colors.default;
  const size = prioridad === 'alta' ? 32 : prioridad === 'media' ? 28 : 24;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="11" fill="${color}" opacity="0.25" />
      <circle cx="12" cy="12" r="9" fill="${color}" stroke="white" stroke-width="2" />
      <text x="12" y="13" text-anchor="middle" font-size="10" fill="white" font-family="Arial" font-weight="bold">
        ${estado === 'completado' ? '✓' : estado === 'pendiente' ? '!' : estado === 'en_progreso' ? '⏳' : '🐾'}
      </text>
    </svg>
  `;

  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size]
  });
};

// ===== OPCIONES PARA LOS SELECTS =====
const PRIORIDAD_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'alta', label: 'Alta Urgencia' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' }
];

const ESTADO_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'en_progreso', label: 'En Progreso' },
  { value: 'completado', label: 'Completado' },
  { value: 'aprobado', label: 'Aprobado' },
  { value: 'rechazado', label: 'Rechazado' }
];

const RescatesMapa = () => {
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [casos, setCasos] = useState([]);
  const [filtroPrioridad, setFiltroPrioridad] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const centroPorDefecto = [2.4419, -76.6063];

  // ===== ESTADÍSTICAS =====
  const stats = useMemo(() => {
    const total = casos.length;
    const pendientes = casos.filter(c => c.estado === 'pendiente').length;
    const enProceso = casos.filter(c => c.estado === 'en_progreso' || c.estado === 'en_proceso').length;
    const completados = casos.filter(c => c.estado === 'completado').length;
    const alta = casos.filter(c => c.prioridad === 'alta').length;
    const media = casos.filter(c => c.prioridad === 'media').length;
    const baja = casos.filter(c => c.prioridad === 'baja').length;
    return { total, pendientes, enProceso, completados, alta, media, baja };
  }, [casos]);

  useEffect(() => {
    const fetchCoordenadas = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await rescateService.getCoordenadasRescates();
        
        let dataArray = [];
        
        if (response?.data?.success) {
          dataArray = response.data.data?.data || 
                     response.data.data || 
                     response.data || 
                     [];
          
          if (dataArray && typeof dataArray === 'object' && !Array.isArray(dataArray)) {
            dataArray = dataArray.data || dataArray.records || Object.values(dataArray) || [];
          }
        } else if (Array.isArray(response?.data)) {
          dataArray = response.data;
        } else if (Array.isArray(response)) {
          dataArray = response;
        }
        
        const finalData = Array.isArray(dataArray) ? dataArray : [];
        setCasos(finalData);
        
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err.message || t('errors.load_geovisor'));
        setCasos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCoordenadas();
  }, [t]);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  // ===== FILTROS =====
  const casosFiltrados = useMemo(() => {
    if (!Array.isArray(casos) || casos.length === 0) return [];
    
    return casos.filter(caso => {
      const lat = parseFloat(caso.lat || caso.latitud || caso.latitude);
      const lng = parseFloat(caso.lng || caso.longitud || caso.longitude);
      
      if (isNaN(lat) || isNaN(lng)) return false;
      
      if (filtroPrioridad !== 'todos' && caso.prioridad !== filtroPrioridad) {
        return false;
      }
      
      if (filtroEstado !== 'todos' && caso.estado !== filtroEstado) {
        return false;
      }
      
      return true;
    });
  }, [casos, filtroPrioridad, filtroEstado]);

  // ===== AGRUPAR POR UBICACIÓN =====
  const casosAgrupados = useMemo(() => {
    const grupos = {};
    casosFiltrados.forEach(caso => {
      const lat = parseFloat(caso.lat || caso.latitud || caso.latitude);
      const lng = parseFloat(caso.lng || caso.longitud || caso.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      
      const key = `${lat},${lng}`;
      if (!grupos[key]) {
        grupos[key] = {
          lat,
          lng,
          casos: []
        };
      }
      grupos[key].casos.push(caso);
    });
    return Object.values(grupos);
  }, [casosFiltrados]);

  // ===== MANEJADORES DE FILTROS =====
  const handlePrioridadChange = (e) => {
    setFiltroPrioridad(e.target.value);
  };

  const handleEstadoChange = (e) => {
    setFiltroEstado(e.target.value);
  };

  if (loading) {
    return (
      <div className="ram-container">
        <div className="panel-loading-modern">
          <div className="spinner-modern"></div>
          <p>{t('cargando_mapa', 'Cargando Geovisor...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ram-container">
      <div className="ram-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('banner.titulo_mapa', 'Geovisor de Rescates - Popayán'),
            solicitudes: stats.total,
            adopciones: stats.completados,
            eventos: stats.enProceso,
          }}
        />
      </div>

      <div className="bento-container ram-content">
        <div className="ram-map-header">
          <button className="ram-btn-back" onClick={() => navigate('/admin/rescates')}>
            <ArrowLeft size={16} />
            {t('volver_consola', 'Volver a Consola')}
          </button>

          <div className="ram-filter-group">
            {/* 🔥 FILTRO DE PRIORIDAD CON CUSTOM SELECT */}
            <div className="ram-filter-item">
              <span className="ram-filter-label">
                <Filter size={14} />
                {t('prioridad', 'Prioridad')}:
              </span>
              <CustomSelect
                options={PRIORIDAD_OPTIONS.map(opt => ({
                  ...opt,
                  label: `${opt.label} (${stats[opt.value === 'todos' ? 'total' : opt.value] || 0})`
                }))}
                value={filtroPrioridad}
                onChange={handlePrioridadChange}
                name="prioridad"
                placeholder={t('seleccionar_prioridad', 'Seleccionar prioridad')}
              />
            </div>

            {/* 🔥 FILTRO DE ESTADO CON CUSTOM SELECT */}
            <div className="ram-filter-item">
              <span className="ram-filter-label">
                <Filter size={14} />
                {t('estado', 'Estado')}:
              </span>
              <CustomSelect
                options={ESTADO_OPTIONS.map(opt => ({
                  ...opt,
                  label: `${opt.label} (${stats[opt.value === 'todos' ? 'total' : opt.value === 'pendiente' ? 'pendientes' : opt.value === 'en_progreso' ? 'enProceso' : opt.value] || 0})`
                }))}
                value={filtroEstado}
                onChange={handleEstadoChange}
                name="estado"
                placeholder={t('seleccionar_estado', 'Seleccionar estado')}
              />
            </div>
          </div>
        </div>

        <div className="ram-result-count">
          <span>
            <MapPin size={14} />
            {casosFiltrados.length} {t('rescates_mostrados', 'rescates mostrados')}
            {casos.length > 0 && casosFiltrados.length !== casos.length && 
              ` (${t('filtrados_de', 'filtrados de')} ${casos.length} ${t('totales', 'totales')})`
            }
          </span>
        </div>

        <main className="ram-map-wrapper">
          {error ? (
            <div className="ram-error">
              <AlertCircle size={48} className="error-icon-modern" />
              <p>{error}</p>
            </div>
          ) : casosFiltrados.length === 0 && casos.length > 0 ? (
            <div className="ram-empty">
              <Filter size={48} className="empty-icon" />
              <h3>{t('no_rescates_filtro', 'No hay rescates con estos filtros')}</h3>
              <p>{t('no_rescates_filtro_desc', 'Prueba cambiando los filtros para ver más resultados.')}</p>
              <button 
                className="ram-clear-filters"
                onClick={() => {
                  setFiltroPrioridad('todos');
                  setFiltroEstado('todos');
                }}
              >
                {t('limpiar_filtros', 'Limpiar filtros')}
              </button>
            </div>
          ) : casos.length === 0 ? (
            <div className="ram-empty">
              <MapPin size={48} className="empty-icon" />
              <h3>{t('no_rescates_mapa', 'No hay rescates para mostrar')}</h3>
              <p>{t('no_rescates_mapa_desc', 'Aún no se han reportado rescates con ubicación.')}</p>
            </div>
          ) : (
            <>
              <MapContainer
                key="rescates-map"
                center={centroPorDefecto}
                zoom={13}
                className="ram-leaflet-container"
                zoomControl={true}
                scrollWheelZoom={true}
                dragging={true}
                attributionControl={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  updateWhenZooming={false}
                  updateWhenIdle={true}
                  noWrap={false}
                />

                {casosAgrupados.map((grupo) => {
                  const casoPrincipal = grupo.casos.reduce((a, b) => {
                    const prioridadOrder = { alta: 3, media: 2, baja: 1 };
                    return (prioridadOrder[a.prioridad] || 0) > (prioridadOrder[b.prioridad] || 0) ? a : b;
                  });

                  const icon = createCustomIcon(casoPrincipal.prioridad, casoPrincipal.estado);

                  return (
                    <Marker
                      key={`${grupo.lat},${grupo.lng}`}
                      position={[grupo.lat, grupo.lng]}
                      icon={icon}
                    >
                      <Popup className="ram-popup-custom">
                        <div className="ram-popup-content">
                          {grupo.casos.length > 1 && (
                            <div className="ram-popup-multiple">
                              <span className="ram-popup-badge">
                                {grupo.casos.length} {t('casos', 'casos')}
                              </span>
                            </div>
                          )}

                          {casoPrincipal.foto_principal && (
                            <img
                              src={getImageUrl(casoPrincipal.foto_principal)}
                              alt={casoPrincipal.titulo || "Mascota"}
                              className="ram-popup-img"
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/200x100?text=Sin+Imagen';
                              }}
                            />
                          )}

                          <h3>
                            {casoPrincipal.titulo || casoPrincipal.lugar_rescate || t('sin_titulo', 'Caso sin título')}
                          </h3>

                          <p className="ram-popup-desc">
                            {casoPrincipal.descripcion_rescate || casoPrincipal.descripcion || t('sin_descripcion', 'Sin descripción.')}
                          </p>

                          <div className="ram-popup-meta">
                            <span className={`ram-popup-prioridad ${casoPrincipal.prioridad || 'media'}`}>
                              {t('prioridad', 'Prioridad')}: {casoPrincipal.prioridad || 'Media'}
                            </span>
                            <span className={`ram-popup-estado ${casoPrincipal.estado || 'pendiente'}`}>
                              {t(`estado_${casoPrincipal.estado}`) || casoPrincipal.estado || 'Pendiente'}
                            </span>
                          </div>

                          <button
                            className="ram-popup-btn"
                            onClick={() => navigate(`/admin/rescates/${casoPrincipal.id}`)}
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
                  {t('leyenda', 'Leyenda')}
                </h4>
                <div className="legend-item">
                  <span className="dot red"></span> {t('urgencia_alta', 'Alta Urgencia')}
                </div>
                <div className="legend-item">
                  <span className="dot orange"></span> {t('emergencia_media', 'Media')}
                </div>
                <div className="legend-item">
                  <span className="dot green"></span> {t('estado_estable', 'Baja')}
                </div>
                <div className="legend-divider"></div>
                <div className="legend-item">
                  <span className="dot-state">⏳</span> {t('estado_pendiente', 'Pendiente')}
                </div>
                <div className="legend-item">
                  <span className="dot-state">🔄</span> {t('estado_progreso', 'En Progreso')}
                </div>
                <div className="legend-item">
                  <span className="dot-state">✅</span> {t('estado_completado', 'Completado')}
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