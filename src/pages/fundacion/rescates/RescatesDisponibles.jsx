// src/pages/fundacion/rescates/RescatesDisponibles.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { rescateService } from '../../../services/rescateService';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import RescateCard from '../../../components/common/RescateCard/RescateCard';
import {
  AlertCircle,
  Ambulance,
  Clock,
  CheckCircle,
  XCircle,
  PawPrint,
  RefreshCw,
  Users,
  MapPin,
} from 'lucide-react';
import './RescatesDisponibles.css';

const RescatesDisponibles = ({ tipoUsuario = 'fundacion' }) => {
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rescates, setRescates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [accionId, setAccionId] = useState(null);

  // ===== ESTADÍSTICAS =====
  const totalRescates = rescates.length;
  const rescatesUrgentes = rescates.filter((r) => r.prioridad === 'alta').length;
  const rescatesMedia = rescates.filter((r) => r.prioridad === 'media').length;
  const rescatesBaja = rescates.filter((r) => r.prioridad === 'baja').length;

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

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRescates();
  };

  const handleAceptar = async (id) => {
    setAccionId(id);
    try {
      const response = await rescateService.aceptarRescate(id);
      if (response.data.success) {
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

  // ===== BANNER DATA =====
  const fundacionName = user?.name || user?.nombre || t('fundacion', 'Fundación');
  const fundacionAvatar = user?.avatar || null;

  if (loading) {
    return (
      <div className="rd-container">
        <div className="panel-loading-modern">
          <div className="spinner-modern"></div>
          <p>{t('cargando_rescates', 'Cargando rescates disponibles...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rd-container">
        <div className="bento-container">
          <div className="panel-error-modern">
            <AlertCircle size={48} className="error-icon-modern" />
            <h3>{t('error_carga', 'Error al cargar los rescates')}</h3>
            <p>{error}</p>
            <button onClick={fetchRescates} className="btn-retry-modern">
              {t('reintentar', 'Reintentar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rd-container">
      {/* ===== BANNER DE PERFIL ===== */}
      <div className="rd-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: fundacionName,
            avatar: fundacionAvatar,
            titulo: t('banner.titulo', {
              defaultValue: '{{count}} rescates disponibles para atender',
              count: totalRescates,
            }),
            solicitudes: totalRescates,
            adopciones: rescatesUrgentes,
            eventos: rescatesMedia,
          }}
        />
      </div>

      {/* ===== STATS CARDS ===== */}
      <section className="rd-stats-section">
        <div className="bento-container">
          <div className="rd-stats-grid">
            <StatCard
              icon={<Ambulance size={24} />}
              label={t('stats.disponibles', 'Disponibles')}
              value={totalRescates}
              color="primary"
            />
            <StatCard
              icon={<Clock size={24} />}
              label={t('stats.urgentes', 'Urgentes')}
              value={rescatesUrgentes}
              color="danger"
            />
            <StatCard
              icon={<PawPrint size={24} />}
              label={t('stats.media', 'Prioridad Media')}
              value={rescatesMedia}
              color="warning"
            />
            <StatCard
              icon={<CheckCircle size={24} />}
              label={t('stats.baja', 'Prioridad Baja')}
              value={rescatesBaja}
              color="success"
            />
          </div>
        </div>
      </section>

      {/* ===== LISTA DE RESCATES DISPONIBLES ===== */}
      <section className="rd-list-section">
        <div className="bento-container">
          <div className="rd-header">
            <div className="rd-header-left">
              <Ambulance size={20} className="rd-header-icon" />
              <h2>{t('rescates_disponibles', 'Rescates Disponibles')}</h2>
              <span className="rd-badge-count">{totalRescates}</span>
            </div>
            <button onClick={handleRefresh} className="rd-btn-refresh" disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              {t('actualizar', 'Actualizar')}
            </button>
          </div>

          {rescates.length === 0 ? (
            <div className="empty-state-modern">
              <CheckCircle size={48} className="empty-icon" />
              <h3>{t('no_rescates_disponibles', 'No hay rescates disponibles')}</h3>
              <p>{t('no_rescates_disponibles_desc', 'Todos los rescates han sido atendidos. ¡Buen trabajo!')}</p>
            </div>
          ) : (
            <div className="rd-grid">
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
      </section>
    </div>
  );
};

// ===== STAT CARD =====
const StatCard = ({ icon, label, value, color }) => {
  const getColorClass = () => {
    switch (color) {
      case 'danger': return 'stat-danger';
      case 'warning': return 'stat-warning';
      case 'success': return 'stat-success';
      default: return 'stat-primary';
    }
  };

  return (
    <div className={`stat-card-modern ${getColorClass()}`}>
      <div className="stat-header-modern">
        <div className="stat-icon-modern">{icon}</div>
        <span className="stat-badge-modern">{label}</span>
      </div>
      <div className="stat-body-modern">
        <span className="stat-value-modern">{value}</span>
        <span className="stat-label-modern">{label}</span>
      </div>
    </div>
  );
};

export default RescatesDisponibles;