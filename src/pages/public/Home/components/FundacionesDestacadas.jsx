// src/pages/public/Home/components/FundacionesDestacadas.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../../services/api';
import './FundacionesDestacadas.css';

const FundacionesDestacadas = () => {
  const [fundaciones, setFundaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_STORAGE_URL || 'https://rescatando-mascotas-backend-final-production.up.railway.app';
    return path.startsWith('/storage') ? `${baseUrl}${path}` : `${baseUrl}/storage/${path}`;
  };

  useEffect(() => {
    const fetchFundaciones = async () => {
      try {
        const response = await api.get('/fundaciones?limit=4');
        let data = [];
        if (response.data?.data?.data) {
          data = response.data.data.data;
        } else if (response.data?.data) {
          data = response.data.data;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        }
        setFundaciones(data);
      } catch (error) {
        console.error('Error fetching fundaciones:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFundaciones();
  }, []);

  if (loading) return null;
  if (fundaciones.length === 0) return null;

  return (
    <section className="fd-fundaciones-section">
      <div className="hp-section-container">
        <h2 className="hp-section-title hp-reveal">Fundaciones Aliadas</h2>
        <p className="hp-section-subtitle hp-reveal hp-delay-100">
          Organizaciones comprometidas con el rescate y bienestar animal
        </p>

        <div className="fd-fundaciones-grid">
          {fundaciones.map((fundacion, index) => (
            <div key={fundacion.id} className={`fd-fundacion-card hp-reveal hp-delay-${(index % 3) * 100}`}>
              <div className="fd-fundacion-card-image">
                <img 
                  src={getImageUrl(fundacion.imagen_portada) || '/img/fundacion-placeholder.jpg'} 
                  alt={fundacion.Nombre_1} 
                />
                {fundacion.recibe_voluntarios && (
                  <span className="fd-fundacion-badge-voluntarios">🙋 Busca Voluntarios</span>
                )}
              </div>
              <div className="fd-fundacion-card-content">
                <h3 className="fd-fundacion-card-title">{fundacion.Nombre_1}</h3>
                <p className="fd-fundacion-card-location">
                  <i className="fas fa-map-marker-alt"></i> {fundacion.ciudad || 'Ciudad no especificada'}
                </p>
                <div className="fd-fundacion-stats">
                  <span><i className="fas fa-paw"></i> {fundacion.total_rescatadas || 'N/A'} rescatados</span>
                </div>
                <Link to={`/fundaciones/${fundacion.id}`} className="fd-fundacion-card-btn">
                  Conocer fundación <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="fd-fundaciones-footer">
          <Link to="/fundaciones" className="fd-fundaciones-view-all">
            Ver todas las fundaciones <i className="fas fa-arrow-right"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FundacionesDestacadas;