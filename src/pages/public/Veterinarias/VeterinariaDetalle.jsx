// src/pages/public/Veterinarias/VeterinariaDetalle.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Veterinarias.css';

const VeterinariaDetalle = () => {
  const { id } = useParams();
  const [veterinaria, setVeterinaria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para extraer datos de la respuesta
  const extractData = (response) => {
    if (response?.data && !Array.isArray(response.data)) return response.data;
    if (Array.isArray(response)) return response[0];
    if (response?.data?.data && !Array.isArray(response.data.data)) return response.data.data;
    return response;
  };

  // Formatear servicios
  const getServiciosList = () => {
    if (!veterinaria) return [];
    
    let servicios = [];
    if (veterinaria.servicios) {
      if (typeof veterinaria.servicios === 'string') {
        try {
          servicios = JSON.parse(veterinaria.servicios);
        } catch {
          servicios = [];
        }
      } else if (Array.isArray(veterinaria.servicios)) {
        servicios = veterinaria.servicios;
      }
    }
    
    // También agregar servicios_detallados si existen
    if (veterinaria.servicios_detallados) {
      let detallados = [];
      if (typeof veterinaria.servicios_detallados === 'string') {
        try {
          detallados = JSON.parse(veterinaria.servicios_detallados);
        } catch {
          detallados = [];
        }
      } else if (Array.isArray(veterinaria.servicios_detallados)) {
        detallados = veterinaria.servicios_detallados;
      }
      servicios = [...servicios, ...detallados];
    }
    
    return [...new Set(servicios)]; // Eliminar duplicados
  };

  // Formatear horario
  const getHorario = () => {
    if (!veterinaria) return null;
    if (veterinaria.horario_atencion) return veterinaria.horario_atencion;
    if (veterinaria.urgencias_24h) return 'Abierto 24 horas, los 7 días de la semana';
    return 'Consultar horario directamente';
  };

  useEffect(() => {
    const loadVeterinaria = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get(`/veterinarias/${id}`);
        
        let data = extractData(response.data);
        
        // Si la respuesta está anidada
        if (data && data.veterinaria) {
          data = data.veterinaria;
        }
        
        if (!data || Object.keys(data).length === 0) {
          setError('No se encontró la veterinaria');
        } else {
          setVeterinaria(data);
        }
      } catch (err) {
        console.error('Error cargando veterinaria:', err);
        if (err.response?.status === 404) {
          setError('Veterinaria no encontrada');
        } else {
          setError(err.response?.data?.message || 'Error al cargar los detalles');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadVeterinaria();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="veterinarias-page">
        <div className="loading-container">
          <LoadingSpinner text="Cargando detalles..." />
        </div>
      </div>
    );
  }

  if (error || !veterinaria) {
    return (
      <div className="veterinarias-page">
        <div className="error-container">
          <i className="fas fa-paw"></i>
          <h3>{error || 'Veterinaria no encontrada'}</h3>
          <p>No pudimos encontrar la información solicitada.</p>
          <Link to="/veterinarias" className="back-link">
            ← Volver a veterinarias
          </Link>
        </div>
      </div>
    );
  }

  const servicios = getServiciosList();

  return (
    <div className="veterinarias-page">
      <div className="detalle-header">
        <div>
          <h1>{veterinaria.Nombre_vet}</h1>
          <div className="detalle-badges">
            {veterinaria.urgencias_24h && (
              <span className="badge-urgente">
                <i className="fas fa-ambulance"></i> Urgencias 24h
              </span>
            )}
            {veterinaria.verificado && (
              <span className="badge-verificado">
                <i className="fas fa-check-circle"></i> Verificado
              </span>
            )}
            {veterinaria.acepta_seguros && (
              <span className="badge-seguro">
                <i className="fas fa-shield-alt"></i> Acepta seguros
              </span>
            )}
          </div>
        </div>
        <Link to="/veterinarias" className="detalle-back-button">
          ← Volver a veterinarias
        </Link>
      </div>

      <div className="detalle-card">
        {/* Descripción */}
        <div className="detalle-section">
          <h3>
            <i className="fas fa-info-circle"></i> Sobre nosotros
          </h3>
          <p>{veterinaria.descripcion || 'Sin descripción disponible'}</p>
        </div>

        {/* Información de contacto */}
        <div className="detalle-grid">
          <div className="detalle-info-item">
            <i className="fas fa-map-marker-alt"></i>
            <div>
              <strong>Dirección</strong>
              <p>{veterinaria.Direccion || 'No disponible'}</p>
            </div>
          </div>
          <div className="detalle-info-item">
            <i className="fas fa-phone"></i>
            <div>
              <strong>Teléfono</strong>
              <p>{veterinaria.Telefono || 'No disponible'}</p>
            </div>
          </div>
          <div className="detalle-info-item">
            <i className="fas fa-envelope"></i>
            <div>
              <strong>Email</strong>
              <p>{veterinaria.Email || 'No disponible'}</p>
            </div>
          </div>
          <div className="detalle-info-item">
            <i className="fas fa-clock"></i>
            <div>
              <strong>Horario</strong>
              <p>{getHorario()}</p>
            </div>
          </div>
        </div>

        {/* Servicios */}
        {servicios.length > 0 && (
          <div className="detalle-section">
            <h3>
              <i className="fas fa-stethoscope"></i> Servicios disponibles
            </h3>
            <div className="servicios-grid">
              {servicios.map((servicio, index) => (
                <span key={index} className="servicio-badge">
                  <i className="fas fa-check"></i> {servicio}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experiencia y equipo */}
        {(veterinaria.anios_experiencia || veterinaria.equipo_medico) && (
          <div className="detalle-section">
            <h3>
              <i className="fas fa-users"></i> Información adicional
            </h3>
            <div className="info-adicional">
              {veterinaria.anios_experiencia && (
                <div className="info-item">
                  <strong>Años de experiencia:</strong> {veterinaria.anios_experiencia}
                </div>
              )}
              {veterinaria.equipo_medico && (
                <div className="info-item">
                  <strong>Equipo médico:</strong> {veterinaria.equipo_medico}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mapa */}
        {veterinaria.Direccion && (
          <div className="detalle-section">
            <h3>
              <i className="fas fa-map"></i> Ubicación
            </h3>
            <div className="mapa-container">
              <iframe
                title={`Mapa de ${veterinaria.Nombre_vet}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(veterinaria.Direccion)}&output=embed`}
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: '12px' }}
                allowFullScreen
                loading="lazy"
              />
            </div>
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(veterinaria.Direccion)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="map-link"
            >
              Abrir en Google Maps <i className="fas fa-external-link-alt"></i>
            </a>
          </div>
        )}

        {/* Valoraciones (si existen) */}
        {veterinaria.valoracion_promedio > 0 && (
          <div className="detalle-section valoracion">
            <h3>
              <i className="fas fa-star"></i> Valoración
            </h3>
            <div className="rating">
              <span className="rating-stars">
                {'★'.repeat(Math.round(veterinaria.valoracion_promedio))}
                {'☆'.repeat(5 - Math.round(veterinaria.valoracion_promedio))}
              </span>
              <span className="rating-number">{veterinaria.valoracion_promedio}/5</span>
              <span className="rating-count">({veterinaria.total_valoraciones || 0} valoraciones)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VeterinariaDetalle;