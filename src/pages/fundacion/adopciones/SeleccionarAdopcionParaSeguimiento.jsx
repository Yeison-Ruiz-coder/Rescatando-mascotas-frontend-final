// src/pages/fundacion/adopciones/SeleccionarAdopcionParaSeguimiento.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './SeleccionarAdopcion.css';

const SeleccionarAdopcionParaSeguimiento = () => {
  const { t } = useTranslation('fundacion');
  const navigate = useNavigate();
  const [adopciones, setAdopciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAdopciones();
  }, []);

  const fetchAdopciones = async () => {
    try {
      setLoading(true);
      const response = await api.get('/entity/adopciones', {
        params: { 
          estado: 'en_proceso',
          per_page: 50
        }
      });
      
      // La respuesta puede estar en response.data.data o response.data
      const data = response.data?.data || response.data;
      const list = data?.data || data || [];
      
      setAdopciones(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error cargando adopciones:', error);
      toast.error(t('error_cargar_adopciones'));
    } finally {
      setLoading(false);
    }
  };

  const handleSeleccionar = (adopcionId) => {
    navigate(`/fundacion/adopciones/seguimientos/crear/${adopcionId}`);
  };

  const handleVerDetalle = (adopcionId) => {
    navigate(`/fundacion/adopciones/${adopcionId}`);
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const filteredAdopciones = adopciones.filter(adopcion => {
    const mascotaNombre = adopcion.mascota?.nombre_mascota?.toLowerCase() || '';
    const adoptanteNombre = adopcion.adoptante?.nombre?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return mascotaNombre.includes(search) || adoptanteNombre.includes(search);
  });

  if (loading) {
    return (
      <div className="seleccionar-adopcion-container">
        <LoadingSpinner text={t('cargando_adopciones')} />
      </div>
    );
  }

  return (
    <div className="seleccionar-adopcion-container">
      <div className="seleccionar-adopcion-wrapper">
        <div className="seleccionar-adopcion-header">
          <button 
            className="seleccionar-btn-back"
            onClick={() => navigate('/fundacion/adopciones/seguimientos')}
          >
            <i className="fas fa-arrow-left"></i> {t('volver')}
          </button>
          <h1>
            <i className="fas fa-clipboard-check"></i>
            {t('seleccionar_adopcion')}
          </h1>
          <p>{t('seleccionar_adopcion_desc')}</p>
        </div>

        <div className="seleccionar-adopcion-search">
          <input
            type="text"
            placeholder={t('buscar_por_mascota_o_adoptante')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="seleccionar-search-input"
          />
          <i className="fas fa-search seleccionar-search-icon"></i>
        </div>

        {filteredAdopciones.length === 0 ? (
          <div className="seleccionar-adopcion-empty">
            <i className="fas fa-paw"></i>
            <h3>{searchTerm ? t('sin_resultados') : t('sin_adopciones_en_proceso')}</h3>
            <p>{searchTerm ? t('sin_resultados_desc') : t('sin_adopciones_en_proceso_desc')}</p>
            {!searchTerm && (
              <button 
                className="seleccionar-btn-refresh"
                onClick={fetchAdopciones}
              >
                <i className="fas fa-sync-alt"></i> {t('refrescar')}
              </button>
            )}
          </div>
        ) : (
          <div className="seleccionar-adopcion-grid">
            {filteredAdopciones.map((adopcion) => (
              <div key={adopcion.id} className="seleccionar-adopcion-card">
                <div className="seleccionar-card-header">
                  <div className="seleccionar-mascota-info">
                    <div className="seleccionar-mascota-avatar">
                      {adopcion.mascota?.foto_url ? (
                        <img src={adopcion.mascota.foto_url} alt={adopcion.mascota.nombre_mascota} />
                      ) : (
                        <i className="fas fa-paw"></i>
                      )}
                    </div>
                    <div>
                      <h3>{adopcion.mascota?.nombre_mascota || t('sin_nombre')}</h3>
                      <span className="seleccionar-mascota-especie">
                        {adopcion.mascota?.especie || t('no_especificado')}
                      </span>
                    </div>
                  </div>
                  <span className="seleccionar-estado-badge">
                    {t('en_proceso')}
                  </span>
                </div>

                <div className="seleccionar-card-body">
                  <div className="seleccionar-info-item">
                    <i className="fas fa-user"></i>
                    <span><strong>{t('adoptante')}:</strong> {adopcion.adoptante?.nombre || t('no_especificado')}</span>
                  </div>
                  <div className="seleccionar-info-item">
                    <i className="fas fa-calendar"></i>
                    <span><strong>{t('fecha_adopcion')}:</strong> {formatDate(adopcion.fecha_adopcion)}</span>
                  </div>
                  <div className="seleccionar-info-item">
                    <i className="fas fa-id"></i>
                    <span><strong>{t('id')}:</strong> #{adopcion.id}</span>
                  </div>
                </div>

                <div className="seleccionar-card-actions">
                  <button
                    className="seleccionar-btn-detalle"
                    onClick={() => handleVerDetalle(adopcion.id)}
                  >
                    <i className="fas fa-eye"></i> {t('ver_detalle')}
                  </button>
                  <button
                    className="seleccionar-btn-crear"
                    onClick={() => handleSeleccionar(adopcion.id)}
                  >
                    <i className="fas fa-plus"></i> {t('crear_seguimiento')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SeleccionarAdopcionParaSeguimiento;