// src/pages/fundacion/rescates/MisRescates.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { rescateService } from '../../../services/rescateService';
import RescateCard from '../../../components/common/RescateCard/RescateCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Rescates.css';

const MisRescates = ({ tipoUsuario }) => {
  const { t } = useTranslation('rescate');
  const navigate = useNavigate();
  const [rescates, setRescates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMisRescates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rescateService.getMisRescates();
      if (response.data.success) {
        setRescates(response.data.data.data || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || t('errors.general'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMisRescates();
  }, [fetchMisRescates]);

  const handleVerDetalle = (id) => {
    navigate(`/${tipoUsuario}/rescates/${id}`);
  };

  const handleRegistrar = (id) => {
    // Redirigir a la página de registro de mascotas con el rescate_id como parámetro
    navigate(`/${tipoUsuario}/mascotas/nueva?rescate_id=${id}`);
  };

  if (loading) {
    return (
      <div className="rescates-container">
        <LoadingSpinner text={t('cargando_rescates')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rescates-container">
        <div className="error-card">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>{t('error_carga')}</h3>
          <p>{error}</p>
          <button onClick={fetchMisRescates} className="btn-reload">
            <i className="fas fa-sync-alt"></i> {t('reintentar')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rescates-container">
      <div className="rescates-header">
        <h1>
          <i className="fas fa-clipboard-list"></i> {t('mis_rescates')}
        </h1>
        <p>{t('mis_rescates_desc')}</p>
      </div>

      {rescates.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-paw"></i>
          <h3>{t('no_rescates_asignados')}</h3>
          <p>{t('no_rescates_asignados_desc')}</p>
        </div>
      ) : (
        <div className="rescates-list">
          {rescates.map((rescate) => (
            <RescateCard
              key={rescate.id}
              rescate={rescate}
              onVerDetalle={handleVerDetalle}
              onRegistrar={handleRegistrar}  // ← Cambiado
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MisRescates;