// src/pages/fundacion/rescates/RescatesDisponibles.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  PawPrint,
  RefreshCw,
} from 'lucide-react';
import './RescatesDisponibles.css';

// ===== CONSTANTES =====
const PRIORIDADES = {
  ALTA: 'alta',
  MEDIA: 'media',
  BAJA: 'baja'
};

// ===== HOOK PERSONALIZADO PARA ESTADÍSTICAS =====
const useRescatesDisponiblesStats = (rescates) => {
  return useMemo(() => {
    const total = rescates.length;
    const urgentes = rescates.filter(r => r.prioridad === PRIORIDADES.ALTA).length;
    const media = rescates.filter(r => r.prioridad === PRIORIDADES.MEDIA).length;
    const baja = rescates.filter(r => r.prioridad === PRIORIDADES.BAJA).length;

    return { total, urgentes, media, baja };
  }, [rescates]);
};

// ===== COMPONENTE PRINCIPAL =====
const RescatesDisponibles = ({ tipoUsuario = 'fundacion' }) => {
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  const navigate = useNavigate();

  // ===== ESTADO UNIFICADO =====
  const [state, setState] = useState({
    rescates: [],
    loading: true,
    refreshing: false,
    error: null,
    accionId: null
  });

  // ===== MEMOIZACIÓN =====
  const stats = useRescatesDisponiblesStats(state.rescates);
  
  const fundacionName = useMemo(() => 
    user?.name || user?.nombre || t('fundacion', 'Fundación'),
    [user, t]
  );

  const fundacionAvatar = useMemo(() => user?.avatar || null, [user]);

  // ===== FUNCIONES =====
  const fetchRescates = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await rescateService.getDisponibles();
      
      if (response.data.success) {
        setState(prev => ({
          ...prev,
          rescates: response.data.data.data || [],
          error: null
        }));
      }
    } catch (err) {
      console.error('Error fetching rescates:', err);
      setState(prev => ({
        ...prev,
        error: err.response?.data?.message || t('errors.general')
      }));
    } finally {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        refreshing: false 
      }));
    }
  }, [t]);

  useEffect(() => {
    fetchRescates();
  }, [fetchRescates]);

  const handleRefresh = useCallback(() => {
    setState(prev => ({ ...prev, refreshing: true }));
    fetchRescates();
  }, [fetchRescates]);

  const handleAceptar = useCallback(async (id) => {
    setState(prev => ({ ...prev, accionId: id }));
    try {
      const response = await rescateService.aceptarRescate(id);
      if (response.data.success) {
        // Usar toast o notificación en lugar de alert
        alert(t('rescate_aceptado'));
        await fetchRescates();
      }
    } catch (err) {
      console.error('Error al aceptar:', err);
      alert(err.response?.data?.message || t('errors.general'));
    } finally {
      setState(prev => ({ ...prev, accionId: null }));
    }
  }, [fetchRescates, t]);

  const handleRechazar = useCallback(async (id) => {
    setState(prev => ({ ...prev, accionId: id }));
    try {
      const response = await rescateService.rechazarRescate(id);
      if (response.data.success) {
        alert(t('rescate_rechazado'));
        await fetchRescates();
      }
    } catch (err) {
      console.error('Error al rechazar:', err);
      alert(err.response?.data?.message || t('errors.general'));
    } finally {
      setState(prev => ({ ...prev, accionId: null }));
    }
  }, [fetchRescates, t]);

  const handleVerDetalle = useCallback((id) => {
    navigate(`/${tipoUsuario}/rescates/${id}`);
  }, [navigate, tipoUsuario]);

  // ===== RENDERIZADO CONDICIONAL =====
  if (state.loading) {
    return <LoadingState t={t} />;
  }

  if (state.error) {
    return <ErrorState error={state.error} onRetry={fetchRescates} t={t} />;
  }

  return (
    <div className="rd-container">
      <ProfileBannerSection
        name={fundacionName}
        avatar={fundacionAvatar}
        stats={stats}
        t={t}
      />

      <StatsSection stats={stats} t={t} />

      <RescatesList
        rescates={state.rescates}
        total={stats.total}
        refreshing={state.refreshing}
        accionId={state.accionId}
        onRefresh={handleRefresh}
        onAceptar={handleAceptar}
        onRechazar={handleRechazar}
        onVerDetalle={handleVerDetalle}
        t={t}
      />
    </div>
  );
};

// ===== COMPONENTES SECUNDARIOS =====

// Estado de carga
const LoadingState = ({ t }) => (
  <div className="rd-container">
    <div className="panel-loading-modern">
      <div className="spinner-modern" />
      <p>{t('cargando_rescates', 'Cargando rescates disponibles...')}</p>
    </div>
  </div>
);

// Estado de error
const ErrorState = ({ error, onRetry, t }) => (
  <div className="rd-container">
    <div className="bento-container">
      <div className="panel-error-modern">
        <AlertCircle size={48} className="error-icon-modern" />
        <h3>{t('error_carga', 'Error al cargar los rescates')}</h3>
        <p>{error}</p>
        <button onClick={onRetry} className="btn-retry-modern">
          {t('reintentar', 'Reintentar')}
        </button>
      </div>
    </div>
  </div>
);

// Banner de perfil
const ProfileBannerSection = ({ name, avatar, stats, t }) => (
  <div className="rd-banner-wrapper">
    <ProfileBanner
      user={{
        nombre: name,
        avatar: avatar,
        titulo: t('banner.titulo', {
          defaultValue: '{{count}} rescates disponibles para atender',
          count: stats.total,
        }),
        solicitudes: stats.total,
        adopciones: stats.urgentes,
        eventos: stats.media,
      }}
    />
  </div>
);

// Sección de estadísticas
const StatsSection = ({ stats, t }) => {
  const statItems = [
    { 
      key: 'disponibles',
      icon: Ambulance, 
      label: 'stats.disponibles', 
      value: stats.total, 
      color: 'primary' 
    },
    { 
      key: 'urgentes',
      icon: Clock, 
      label: 'stats.urgentes', 
      value: stats.urgentes, 
      color: 'danger' 
    },
    { 
      key: 'media',
      icon: PawPrint, 
      label: 'stats.media', 
      value: stats.media, 
      color: 'warning' 
    },
    { 
      key: 'baja',
      icon: CheckCircle, 
      label: 'stats.baja', 
      value: stats.baja, 
      color: 'success' 
    }
  ];

  return (
    <section className="rd-stats-section">
      <div className="bento-container">
        <div className="rd-stats-grid">
          {statItems.map(item => (
            <StatCard
              key={item.key}
              icon={<item.icon size={24} />}
              label={t(item.label)}
              value={item.value}
              color={item.color}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Lista de rescates
const RescatesList = ({ 
  rescates, 
  total, 
  refreshing, 
  accionId,
  onRefresh, 
  onAceptar, 
  onRechazar, 
  onVerDetalle, 
  t 
}) => (
  <section className="rd-list-section">
    <div className="bento-container">
      <div className="rd-header">
        <div className="rd-header-left">
          <Ambulance size={20} className="rd-header-icon" />
          <h2>{t('rescates_disponibles', 'Rescates Disponibles')}</h2>
          <span className="rd-badge-count">{total}</span>
        </div>
        <button 
          onClick={onRefresh} 
          className="rd-btn-refresh" 
          disabled={refreshing}
          aria-label={t('actualizar', 'Actualizar')}
        >
          <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
          {t('actualizar', 'Actualizar')}
        </button>
      </div>

      {rescates.length === 0 ? (
        <EmptyState t={t} />
      ) : (
        <div className="rd-grid">
          {rescates.map((rescate) => (
            <RescateCard
              key={rescate.id}
              rescate={rescate}
              onAceptar={onAceptar}
              onRechazar={onRechazar}
              onVerDetalle={onVerDetalle}
              loading={accionId === rescate.id}
              showActions={true}
            />
          ))}
        </div>
      )}
    </div>
  </section>
);

// Estado vacío
const EmptyState = ({ t }) => (
  <div className="empty-state-modern">
    <CheckCircle size={48} className="empty-icon" />
    <h3>{t('no_rescates_disponibles', 'No hay rescates disponibles')}</h3>
    <p>{t('no_rescates_disponibles_desc', 'Todos los rescates han sido atendidos. ¡Buen trabajo!')}</p>
  </div>
);

// ===== STAT CARD =====
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    primary: 'stat-primary',
    warning: 'stat-warning',
    success: 'stat-success',
    danger: 'stat-danger'
  };

  return (
    <div className={`stat-card-modern ${colorClasses[color] || 'stat-primary'}`}>
      <div className="stat-header-modern">
        <div className="stat-icon-modern">{icon}</div>
      </div>
      <div className="stat-body-modern">
        <span className="stat-value-modern">{value}</span>
        <span className="stat-label-modern">{label}</span>
      </div>
    </div>
  );
};

export default RescatesDisponibles;