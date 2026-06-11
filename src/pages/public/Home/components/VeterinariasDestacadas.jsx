// src/pages/public/Home/components/VeterinariasDestacadas.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../../services/api';
import './VeterinariasDestacadas.css';

const VeterinariasDestacadas = () => {
  const [veterinarias, setVeterinarias] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_STORAGE_URL || 'https://rescatando-mascotas-backend-final-production.up.railway.app';
    return path.startsWith('/storage') ? `${baseUrl}${path}` : `${baseUrl}/storage/${path}`;
  };

  useEffect(() => {
    const fetchVeterinarias = async () => {
      try {
        const response = await api.get('/veterinarias?limit=4');
        let data = [];
        if (response.data?.data?.data) {
          data = response.data.data.data;
        } else if (response.data?.data) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        }
        setVeterinarias(data);
      } catch (error) {
        console.error('Error fetching veterinarias:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVeterinarias();
  }, []);

  if (loading) return null;
  if (veterinarias.length === 0) return null;

  return (
    <section className="vd-veterinarias-section">
      <div className="hp-section-container">
        <h2 className="hp-section-title hp-reveal">Veterinarias Aliadas</h2>
        <p className="hp-section-subtitle hp-reveal hp-delay-100">
          Clínicas veterinarias comprometidas con el bienestar animal
        </p>

        <div className="vd-veterinarias-grid">
          {veterinarias.map((vet, index) => (
            <div key={vet.id} className={`vd-vet-card hp-reveal hp-delay-${(index % 3) * 100}`}>
              <div className="vd-vet-card-image">
                {/* 🔥 CORREGIDO: vet.logo en lugar de vet.imagen_portada */}
                <img 
                  src={getImageUrl(vet.logo) || '/img/vet-placeholder.jpg'} 
                  alt={vet.Nombre_vet} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/img/vet-placeholder.jpg';
                  }}
                />
                {vet.urgencias_24h && (
                  <span className="vd-vet-badge-urgencia">🚨 Urgencias 24h</span>
                )}
                {vet.verificado && (
                  <span className="vd-vet-badge-verificado">✓ Verificado</span>
                )}
              </div>
              <div className="vd-vet-card-content">
                <h3 className="vd-vet-card-title">{vet.Nombre_vet}</h3>
                <p className="vd-vet-card-location">
                  <i className="fas fa-map-marker-alt"></i> {vet.ciudad || vet.Direccion?.split(',')[0] || 'Ubicación no especificada'}
                </p>
                {vet.Telefono && (
                  <p className="vd-vet-card-phone">
                    <i className="fas fa-phone"></i> {vet.Telefono}
                  </p>
                )}
                <Link to={`/veterinarias/${vet.id}`} className="vd-vet-card-btn">
                  Ver detalles <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="vd-veterinarias-footer">
          <Link to="/veterinarias" className="vd-veterinarias-view-all">
            Ver todas las veterinarias <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default VeterinariasDestacadas;