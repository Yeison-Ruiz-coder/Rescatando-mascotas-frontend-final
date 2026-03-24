import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Mascotas.css';

const Mascotas = () => {
  const { t } = useTranslation('mascotas');
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchMascotas = async () => {
      try {
        setLoading(true);
        const response = await api.get('/mascotas');
        
        if (response.data.success) {
          const mascotasData = response.data.data.data || [];
          setMascotas(mascotasData);
          
          setPagination({
            currentPage: response.data.data.current_page,
            lastPage: response.data.data.last_page,
            total: response.data.data.total,
            perPage: response.data.data.per_page
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMascotas();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/300x200?text=Sin+Imagen';
    if (path.startsWith('http')) return path;
    return `http://rescatando-mascotas-forever.test/storage/${path}`;
  };

  if (loading) {
    return (
      <div className="mascotas-container">
        <LoadingSpinner text="Cargando mascotas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error al cargar las mascotas</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="reload-btn">
          Reintentar
        </button>
      </div>
    );
  }

  if (mascotas.length === 0) {
    return (
      <div className="mascotas-container">
        <h1>{t('titulo')}</h1>
        <p className="subtitle">No hay mascotas disponibles en este momento</p>
        {pagination && (
          <p className="info">Total registros: {pagination.total}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mascotas-container">
      <h1>{t('titulo')}</h1>
      <p className="subtitle">Encuentra a tu nuevo mejor amigo</p>
      
      {pagination && pagination.total > 0 && (
        <p className="info">Mostrando {mascotas.length} de {pagination.total} mascotas</p>
      )}
      
      <div className="mascotas-grid">
        {mascotas.map((mascota) => (
          <div key={mascota.id} className="mascota-card">
            <img 
              src={getImageUrl(mascota.foto_principal)} 
              alt={mascota.nombre_mascota}
              className="mascota-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x200?text=Sin+Imagen';
              }}
            />
            <div className="mascota-info">
              <h3>{mascota.nombre_mascota}</h3>
              <p><strong>Especie:</strong> {mascota.especie || 'No especificada'}</p>
              <p><strong>Edad:</strong> {mascota.edad_aprox ? `${mascota.edad_aprox} años` : 'No disponible'}</p>
              <p><strong>Género:</strong> {mascota.genero || 'No especificado'}</p>
              <Link 
                to={`/mascotas/${mascota.id}`} 
                className="ver-detalle-btn"
              >
                {t('verDetalle')}
              </Link>
              <button className="adopt-button">
                {t('adoptar')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mascotas;Mascotas.css