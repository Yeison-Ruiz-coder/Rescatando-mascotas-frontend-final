// src/pages/fundacion/rescates/MisRescates.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { rescateService } from '../../../services/rescateService';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import RescateCard from '../../../components/common/RescateCard/RescateCard';
import {
  AlertCircle,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  PawPrint,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import './MisRescates.css';

// ===== CONSTANTES =====
const ESTADOS = {
  PENDIENTE: 'pendiente',
  EN_PROCESO: 'en_proceso',
  COMPLETADO: 'completado'
};

const ESTADOS_CONFIG = {
  [ESTADOS.PENDIENTE]: { label: 'stats.pendientes', icon: Clock, color: 'warning' },
  [ESTADOS.EN_PROCESO]: { label: 'stats.en_proceso', icon: PawPrint, color: 'info' },
  [ESTADOS.COMPLETADO]: { label: 'stats.completados', icon: CheckCircle, color: 'success' }
};

// ===== HOOK PERSONALIZADO PARA ESTADÍSTICAS =====
const useRescateStats = (rescates) => {
  return useMemo(() => {
    const total = rescates.length;
    const pendientes = rescates.filter(r => r.estado === ESTADOS.PENDIENTE).length;
    const enProceso = rescates.filter(r => r.estado === ESTADOS.EN_PROCESO).length;
    const completados = rescates.filter(r => r.estado === ESTADOS.COMPLETADO).length;
    const tasaExito = total > 0 ? Math.round((completados / total) * 100) : 0;

    return { total, pendientes, enProceso, completados, tasaExito };
  }, [rescates]);
};

// ===== COMPONENTE PRINCIPAL =====
const MisRescates = ({ tipoUsuario = 'fundacion' }) => {
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  const navigate = useNavigate();

  // ===== ESTADO =====
  const [state, setState] = useState({
    rescates: [],
    loading: true,
    refreshing: false,
    error: null
  });

  // ===== MEMOIZACIÓN =====
  const stats = useRescateStats(state.rescates);
  
  const fundacionName = useMemo(() => 
    user?.name || user?.nombre || t('fundacion', 'Fundación'),
    [user, t]
  );

  const fundacionAvatar = useMemo(() => user?.avatar || null, [user]);

  // ===== FUNCIONES =====
  const fetchMisRescates = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await rescateService.getMisRescates();
      
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

  const handleRefresh = useCallback(() => {
    setState(prev => ({ ...prev, refreshing: true }));
    fetchMisRescates();
  }, [fetchMisRescates]);

  const handleVerDetalle = useCallback((id) => {
    navigate(`/${tipoUsuario}/rescates/${id}`);
  }, [navigate, tipoUsuario]);

  const handleRegistrar = useCallback((id) => {
    navigate(`/${tipoUsuario}/mascotas/nueva?rescate_id=${id}`);
  }, [navigate, tipoUsuario]);

  // ===== EFECTOS =====
  useEffect(() => {
    fetchMisRescates();
  }, [fetchMisRescates]);

  // ===== RENDERIZADO CONDICIONAL =====
  if (state.loading) {
    return <LoadingState t={t} />;
  }

  if (state.error) {
    return <ErrorState error={state.error} onRetry={fetchMisRescates} t={t} />;
  }

  return (
    <div className="mr-container">
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
        onRefresh={handleRefresh}
        onVerDetalle={handleVerDetalle}
        onRegistrar={handleRegistrar}
        t={t}
      />
    </div>
  );
};

// ===== COMPONENTES SECUNDARIOS =====

// Estado de carga
const LoadingState = ({ t }) => (
  <div className="mr-container">
    <div className="panel-loading-modern">
      <div className="spinner-modern" aria-label={t('cargando_rescates', 'Cargando rescates...')} />
      <p>{t('cargando_rescates', 'Cargando rescates...')}</p>
    </div>
  </div>
);

// Estado de error
const ErrorState = ({ error, onRetry, t }) => (
  <div className="mr-container">
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
  <div className="mr-banner-wrapper">
    <ProfileBanner
      user={{
        nombre: name,
        avatar: avatar,
        titulo: t('banner.titulo', {
          defaultValue: '{{count}} rescates gestionados · {{percent}}% completados',
          count: stats.total,
          percent: stats.tasaExito,
        }),
        solicitudes: stats.total,
        adopciones: stats.completados,
        eventos: stats.enProceso,
      }}
    />
  </div>
);

// Sección de estadísticas
const StatsSection = ({ stats, t }) => {
  const statItems = [
    { 
      key: 'total',
      icon: ClipboardList, 
      label: 'stats.total', 
      value: stats.total, 
      color: 'primary' 
    },
    { 
      key: 'pendientes',
      icon: Clock, 
      label: 'stats.pendientes', 
      value: stats.pendientes, 
      color: 'warning' 
    },
    { 
      key: 'en_proceso',
      icon: PawPrint, 
      label: 'stats.en_proceso', 
      value: stats.enProceso, 
      color: 'info' 
    },
    { 
      key: 'completados',
      icon: CheckCircle, 
      label: 'stats.completados', 
      value: stats.completados, 
      color: 'success' 
    }
  ];

  return (
    <section className="mr-stats-section">
      <div className="bento-container">
        <div className="mr-stats-grid">
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
  onRefresh, 
  onVerDetalle, 
  onRegistrar, 
  t 
}) => (
  <section className="mr-list-section">
    <div className="bento-container">
      <div className="mr-header">
        <div className="mr-header-left">
          <ClipboardList size={20} className="mr-header-icon" />
          <h2>{t('mis_rescates', 'Mis Rescates')}</h2>
          <span className="mr-badge-count">{total}</span>
        </div>
        <button 
          onClick={onRefresh} 
          className="mr-btn-refresh" 
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
        <div className="mr-grid">
          {rescates.map((rescate) => (
            <RescateCard
              key={rescate.id}
              rescate={rescate}
              onVerDetalle={onVerDetalle}
              onRegistrar={onRegistrar}
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
    <ClipboardList size={48} className="empty-icon" />
    <h3>{t('no_rescates_asignados', 'No hay rescates asignados')}</h3>
    <p>{t('no_rescates_asignados_desc', 'Aún no tienes rescates asignados. Revisa los rescates disponibles.')}</p>
  </div>
);

// ===== STAT CARD =====
const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    primary: 'stat-primary',
    warning: 'stat-warning',
    success: 'stat-success',
    info: 'stat-info'
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

export default MisRescates;