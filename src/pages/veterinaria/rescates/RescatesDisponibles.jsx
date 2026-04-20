// src/pages/fundacion/rescates/RescatesDisponibles.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { rescateService } from '../../../services/rescateService';
import RescateCard from '../../../components/common/RescateCard/RescateCard';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Rescates.css';

const RescatesDisponibles = ({ tipoUsuario }) => {
  const { t } = useTranslation('rescate');
  const navigate = useNavigate();
  const [rescates, setRescates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [accionId, setAccionId] = useState(null);

  const fetchRescates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rescateService.getDisponibles();
      if (response.data.success) {
        setRescates(response.data.data.data || []);
      }
      setError(null);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || t('errors.general'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRescates();
  }, [fetchRescates]);

  const handleAceptar = async (id) => {
    setAccionId(id);
    try {
      const response = await rescateService.aceptarRescate(id);
      if (response.data.success) {
        // Mostrar mensaje de éxito y recargar
        alert(t('rescate_aceptado'));
        fetchRescates();
      }
    } catch (err) {
      console.error('Error al aceptar:', err);
      alert(err.response?.data?.message || t('errors.general'));
    } finally {
      setAccionId(null);
    }
  };

  const handleRechazar = async (id) => {
    setAccionId(id);
    try {
      const response = await rescateService.rechazarRescate(id);
      if (response.data.success) {
        alert(t('rescate_rechazado'));
        fetchRescates();
      }
    } catch (err) {
      console.error('Error al rechazar:', err);
      alert(err.response?.data?.message || t('errors.general'));
    } finally {
      setAccionId(null);
    }
  };

  const handleVerDetalle = (id) => {
    navigate(`/${tipoUsuario}/rescates/${id}`);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRescates();
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
          <button onClick={handleRefresh} className="btn-reload">
            <i className="fas fa-sync-alt"></i> {t('reintentar')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rescates-container">
      <div className="rescates-header">
        <div className="header-title">
          <h1>
            <i className="fas fa-ambulance"></i> {t('rescates_disponibles')}
          </h1>
          <button onClick={handleRefresh} className="btn-refresh" disabled={refreshing}>
            <i className={`fas fa-sync-alt ${refreshing ? 'fa-spin' : ''}`}></i>
          </button>
        </div>
        <p>{t('rescates_disponibles_desc')}</p>
      </div>

      {rescates.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-check-circle"></i>
          <h3>{t('no_rescates_disponibles')}</h3>
          <p>{t('no_rescates_disponibles_desc')}</p>
          <button onClick={handleRefresh} className="btn-refresh-empty">
            <i className="fas fa-sync-alt"></i> {t('buscar_nuevamente')}
          </button>
        </div>
      ) : (
        <div className="rescates-list">
          {rescates.map((rescate) => (
            <RescateCard
              key={rescate.id}
              rescate={rescate}
              onAceptar={handleAceptar}
              onRechazar={handleRechazar}
              onVerDetalle={handleVerDetalle}
              loading={accionId === rescate.id}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RescatesDisponibles;