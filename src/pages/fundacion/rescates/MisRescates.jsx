// src/pages/fundacion/rescates/MisRescates.jsx
import React, { useState, useEffect, useCallback } from 'react';
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

const MisRescates = ({ tipoUsuario = 'fundacion' }) => {
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rescates, setRescates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // ===== ESTADÍSTICAS =====
  const totalRescates = rescates.length;
  const pendientes = rescates.filter((r) => r.estado === 'pendiente').length;
  const enProceso = rescates.filter((r) => r.estado === 'en_proceso').length;
  const completados = rescates.filter((r) => r.estado === 'completado').length;
  const tasaExito = totalRescates > 0 ? Math.round((completados / totalRescates) * 100) : 0;

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
      setRefreshing(false);
    }
  }, [t]);

  useEffect(() => {
    fetchMisRescates();
  }, [fetchMisRescates]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMisRescates();
  };

  const handleVerDetalle = (id) => {
    navigate(`/${tipoUsuario}/rescates/${id}`);
  };

  const handleRegistrar = (id) => {
    navigate(`/${tipoUsuario}/mascotas/nueva?rescate_id=${id}`);
  };

  // ===== BANNER DATA =====
  const fundacionName = user?.name || user?.nombre || t('fundacion', 'Fundación');
  const fundacionAvatar = user?.avatar || null;

  if (loading) {
    return (
      <div className="mr-container">
        <div className="panel-loading-modern">
          <div className="spinner-modern"></div>
          <p>{t('cargando_rescates', 'Cargando rescates...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mr-container">
        <div className="bento-container">
          <div className="panel-error-modern">
            <AlertCircle size={48} className="error-icon-modern" />
            <h3>{t('error_carga', 'Error al cargar los rescates')}</h3>
            <p>{error}</p>
            <button onClick={fetchMisRescates} className="btn-retry-modern">
              {t('reintentar', 'Reintentar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mr-container">
      {/* ===== BANNER DE PERFIL ===== */}
      <div className="mr-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: fundacionName,
            avatar: fundacionAvatar,
            titulo: t('banner.titulo', {
              defaultValue: '{{count}} rescates gestionados · {{percent}}% completados',
              count: totalRescates,
              percent: tasaExito,
            }),
            solicitudes: totalRescates,
            adopciones: completados,
            eventos: enProceso,
          }}
        />
      </div>

      {/* ===== STATS CARDS ===== */}
      <section className="mr-stats-section">
        <div className="bento-container">
          <div className="mr-stats-grid">
            <StatCard
              icon={<ClipboardList size={24} />}
              label={t('stats.total', 'Total Rescates')}
              value={totalRescates}
              color="primary"
            />
            <StatCard
              icon={<Clock size={24} />}
              label={t('stats.pendientes', 'Pendientes')}
              value={pendientes}
              color="warning"
            />
            <StatCard
              icon={<PawPrint size={24} />}
              label={t('stats.en_proceso', 'En Proceso')}
              value={enProceso}
              color="info"
            />
            <StatCard
              icon={<CheckCircle size={24} />}
              label={t('stats.completados', 'Completados')}
              value={completados}
              color="success"
            />
          </div>
        </div>
      </section>

      {/* ===== LISTA DE RESCATES ===== */}
      <section className="mr-list-section">
        <div className="bento-container">
          <div className="mr-header">
            <div className="mr-header-left">
              <ClipboardList size={20} className="mr-header-icon" />
              <h2>{t('mis_rescates', 'Mis Rescates')}</h2>
              <span className="mr-badge-count">{totalRescates}</span>
            </div>
            <button onClick={handleRefresh} className="mr-btn-refresh" disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              {t('actualizar', 'Actualizar')}
            </button>
          </div>

          {rescates.length === 0 ? (
            <div className="empty-state-modern">
              <ClipboardList size={48} className="empty-icon" />
              <h3>{t('no_rescates_asignados', 'No hay rescates asignados')}</h3>
              <p>{t('no_rescates_asignados_desc', 'Aún no tienes rescates asignados. Revisa los rescates disponibles.')}</p>
            </div>
          ) : (
            <div className="mr-grid">
              {rescates.map((rescate) => (
                <RescateCard
                  key={rescate.id}
                  rescate={rescate}
                  onVerDetalle={handleVerDetalle}
                  onRegistrar={handleRegistrar}
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
      case 'warning': return 'stat-warning';
      case 'success': return 'stat-success';
      case 'info': return 'stat-info';
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

export default MisRescates;