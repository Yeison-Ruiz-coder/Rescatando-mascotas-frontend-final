import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, Building, MapPin, Phone, Mail, 
  Clock, Users, Heart, FileText, 
  CheckCircle, Award, PawPrint, ExternalLink, 
  HelpCircle, Calendar
} from 'lucide-react';
import api from '../../../services/api';
import './Fundaciones.css';

const MapaSimple = ({ direccion, nombre }) => {
  const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(direccion)}&output=embed`;
  return (
    <div className="mapa-container">
      <iframe
        title={`Mapa de ${nombre}`}
        src={mapUrl}
        width="100%"
        height="280"
        style={{ border: 0, borderRadius: '12px' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
};

const FundacionDetalle = () => {
  const { id } = useParams();
  const { t } = useTranslation('fundaciones');
  const [fundacion, setFundacion] = useState(null);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:8000${url}`;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fundacionRes, mascotasRes] = await Promise.all([
          api.get(`/fundaciones/${id}`),
          api.get(`/mascotas/fundacion/${id}`)
        ]);
        
        setFundacion(fundacionRes.data?.data || fundacionRes.data);
        setMascotas(mascotasRes.data?.data || mascotasRes.data || []);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="detalle-loading">
        <div className="spinner"></div>
        <p>Cargando información...</p>
      </div>
    );
  }

  if (!fundacion) {
    return (
      <div className="detalle-empty">
        <Building size={48} />
        <h4>Fundación no encontrada</h4>
        <Link to="/fundaciones" className="btn-back-link">Volver a fundaciones</Link>
      </div>
    );
  }

  return (
    <div className="fundacion-detalle">
      <div className="detalle-container">
        {/* Header con navegación - SIN BOTÓN COMPARTIR */}
        <div className="detalle-nav">
          <Link to="/fundaciones" className="nav-back">
            <ArrowLeft size={18} />
            <span>Volver a fundaciones</span>
          </Link>
        </div>

        {/* Card principal */}
        <div className="detalle-card">
          {/* Portada */}
          <div className="card-portada">
            {fundacion.imagen_portada ? (
              <img src={getImageUrl(fundacion.imagen_portada)} alt={fundacion.Nombre_1} />
            ) : (
              <div className="portada-placeholder">
                <Building size={64} />
              </div>
            )}
            {fundacion.verificado && (
              <div className="portada-badge">
                <CheckCircle size={16} />
                <span>Verificada</span>
              </div>
            )}
          </div>

          {/* Contenido */}
          <div className="card-contenido">
            {/* Título y ciudad */}
            <div className="contenido-header">
              <h1>{fundacion.Nombre_1}</h1>
              {fundacion.ciudad && (
                <div className="header-ciudad">
                  <MapPin size={16} />
                  <span>{fundacion.ciudad}</span>
                </div>
              )}
            </div>

            {/* Grid de información - 2 columnas */}
            <div className="info-grid">
              {/* Columna 1 - Contacto */}
              <div className="info-col">
                <div className="info-box">
                  <div className="info-box-header">
                    <Phone size={18} />
                    <h3>Contacto</h3>
                  </div>
                  <div className="info-box-content">
                    {fundacion.Direccion && (
                      <div className="info-field">
                        <label>Dirección</label>
                        <p>{fundacion.Direccion}</p>
                      </div>
                    )}
                    {fundacion.Telefono && (
                      <div className="info-field">
                        <label>Teléfono</label>
                        <p>{fundacion.Telefono}</p>
                      </div>
                    )}
                    {fundacion.Email && (
                      <div className="info-field">
                        <label>Email</label>
                        <p>{fundacion.Email}</p>
                      </div>
                    )}
                    {fundacion.horario_atencion && (
                      <div className="info-field">
                        <label>Horario</label>
                        <p>{fundacion.horario_atencion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Columna 2 - Datos */}
              <div className="info-col">
                <div className="info-box">
                  <div className="info-box-header">
                    <Heart size={18} />
                    <h3>Datos</h3>
                  </div>
                  <div className="info-box-content">
                    {fundacion.registro_sanitario && (
                      <div className="info-field">
                        <label>Registro Sanitario</label>
                        <p>{fundacion.registro_sanitario}</p>
                      </div>
                    )}
                    {fundacion.capacidad_maxima && (
                      <div className="info-field">
                        <label>Capacidad</label>
                        <p>{fundacion.capacidad_maxima} animales</p>
                      </div>
                    )}
                    {mascotas.length > 0 && (
                      <div className="info-field">
                        <label>Mascotas</label>
                        <p>{mascotas.length} rescatadas</p>
                      </div>
                    )}
                    {fundacion.recibe_voluntarios !== undefined && (
                      <div className="info-field">
                        <label>Voluntarios</label>
                        <p>{fundacion.recibe_voluntarios ? 'Sí recibe' : 'No recibe'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            {fundacion.Descripcion && (
              <div className="descripcion-box">
                <div className="descripcion-header">
                  <FileText size={18} />
                  <h3>Descripción</h3>
                </div>
                <p>{fundacion.Descripcion}</p>
              </div>
            )}

            {/* Necesidades actuales */}
            {fundacion.necesidades_actuales && fundacion.necesidades_actuales.length > 0 && (
              <div className="necesidades-box">
                <div className="necesidades-header">
                  <Heart size={18} />
                  <h3>Necesidades</h3>
                </div>
                <div className="necesidades-tags">
                  {fundacion.necesidades_actuales.map((item, index) => (
                    <span key={index} className="tag">{item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Mapa */}
            {fundacion.Direccion && (
              <div className="mapa-box">
                <div className="mapa-header">
                  <div className="mapa-header-left">
                    <MapPin size={18} />
                    <h3>Ubicación</h3>
                  </div>
                  <a 
                    href={`https://maps.google.com/?q=${encodeURIComponent(fundacion.Direccion)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mapa-link"
                  >
                    Ver en Google Maps <ExternalLink size={14} />
                  </a>
                </div>
                <MapaSimple direccion={fundacion.Direccion} nombre={fundacion.Nombre_1} />
              </div>
            )}

            {/* Mascotas en adopción */}
            {mascotas.length > 0 && (
              <div className="mascotas-box">
                <div className="mascotas-header">
                  <PawPrint size={18} />
                  <h3>Mascotas en adopción</h3>
                </div>
                <div className="mascotas-grid">
                  {mascotas.slice(0, 4).map((mascota) => (
                    <Link key={mascota.id} to={`/mascota/${mascota.id}`} className="mascota-item">
                      <div className="mascota-img">
                        {mascota.foto_principal ? (
                          <img src={getImageUrl(mascota.foto_principal)} alt={mascota.nombre_mascota} />
                        ) : (
                          <div className="mascota-placeholder">
                            <PawPrint size={24} />
                          </div>
                        )}
                      </div>
                      <div className="mascota-info">
                        <strong>{mascota.nombre_mascota}</strong>
                        <span>{mascota.especie}</span>
                      </div>
                    </Link>
                  ))}
                </div>
                {mascotas.length > 4 && (
                  <Link to={`/mascotas?fundacion=${id}`} className="ver-mas">
                    Ver todas ({mascotas.length})
                  </Link>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="detalle-footer">
              <small>
                Actualizado: {new Date(fundacion.updated_at).toLocaleDateString()}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundacionDetalle;