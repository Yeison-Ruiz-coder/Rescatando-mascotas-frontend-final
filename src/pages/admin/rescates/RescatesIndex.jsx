// src/pages/admin/rescates/RescatesIndex.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { rescateService } from '../../../services/rescateService';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import RescateCard from '../../../components/common/RescateCard/RescateCard';
import {
  AlertCircle,
  FolderHeart,
  History,
  ShieldCheck,
  CheckCircle,
  MapPin,
  Clock,
  RefreshCw
} from 'lucide-react';
import './RescatesIndex.css';

const RescatesIndex = () => {
  const { t } = useTranslation('rescate');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [rescates, setRescates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const totalCasos = rescates.length;
  const pendientes = rescates.filter(r => r.estado === 'pendiente' || r.estado === 'en_progreso').length;
  const completados = rescates.filter(r => r.estado === 'completado').length;
  const tasaEfectividad = totalCasos > 0 ? Math.round((completados / totalCasos) * 100) : 0;

  const fetchRescatesGlobal = useCallback(async () => {
    try {
      setLoading(true);
      const response = await rescateService.getAllRescatesAdmin(); 
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
    fetchRescatesGlobal();
  }, [fetchRescatesGlobal]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRescatesGlobal();
  };

  const handleVerDetalle = (id) => navigate(`/admin/rescates/show/${id}`);
  const irAPendientes = () => navigate('/admin/rescates/pendientes');
  const irAMapa = () => navigate('/admin/rescates/mapa');

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  if (loading) {
    return (
      <div className="rai-container">
        <div className="panel-loading-modern">
          <div className="spinner-modern"></div>
          <p>{t('cargando_rescates', 'Cargando panel de rescates...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rai-container">
        <div className="bento-container">
          <div className="panel-error-modern">
            <AlertCircle size={48} className="error-icon-modern" />
            <h3>{t('error_carga', 'Error al cargar los rescates')}</h3>
            <p>{error}</p>
            <button onClick={fetchRescatesGlobal} className="btn-retry-modern">
              {t('reintentar', 'Reintentar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rai-container">
      <div className="rai-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('banner.titulo_admin', {
              defaultValue: 'Panel de Administración · {{count}} Casos Reportados',
              count: totalCasos,
            }),
            solicitudes: totalCasos,
            adopciones: completados,
            eventos: pendientes,
          }}
        />
      </div>

      <section className="rai-stats-section">
        <div className="bento-container">
          <div className="rai-stats-grid">
            <StatCard
              icon={<History size={24} />}
              label={t('stats.total_casos', 'Casos Totales')}
              value={totalCasos}
              color="primary"
            />
            <StatCard
              icon={<Clock size={24} />}
              label={t('stats.pendientes', 'Pendientes')}
              value={pendientes}
              color="danger"
              onClick={irAPendientes}
              isAction
            />
            <StatCard
              icon={<ShieldCheck size={24} />}
              label={t('stats.tasa_cierre', 'Tasa de Cierre')}
              value={`${tasaEfectividad}%`}
              color="info"
            />
            <StatCard
              icon={<MapPin size={24} />}
              label={t('stats.geovisor', 'Ver Geovisor')}
              value={t('mapa', 'Mapa')}
              color="success"
              onClick={irAMapa}
              isAction
            />
          </div>
        </div>
      </section>

      <section className="rai-list-section">
        <div className="bento-container">
          <div className="rai-header">
            <div className="rai-header-left">
              <FolderHeart size={20} className="rai-header-icon" />
              <h2>{t('monitoreo_global', 'Monitoreo Global de Rescates')}</h2>
              <span className="rai-badge-count">{totalCasos}</span>
            </div>
            <button onClick={handleRefresh} className="rai-btn-refresh" disabled={refreshing}>
              <RefreshCw size={16} className={refreshing ? 'spin' : ''} />
              {t('sincronizar', 'Sincronizar')}
            </button>
          </div>

          {rescates.length === 0 ? (
            <div className="empty-state-modern">
              <FolderHeart size={48} className="empty-icon" />
              <h3>{t('no_reportes', 'No hay reportes en el sistema')}</h3>
              <p>{t('no_reportes_desc', 'Las solicitudes de la ciudadanía aparecerán listadas aquí.')}</p>
            </div>
          ) : (
            <div className="rai-grid">
              {rescates.map((rescate) => (
                <RescateCard
                  key={rescate.id}
                  rescate={rescate}
                  onVerDetalle={handleVerDetalle}
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

const StatCard = ({ icon, label, value, color, onClick, isAction }) => {
  const { t } = useTranslation('rescate');
  const getColorClass = () => {
    switch (color) {
      case 'success': return 'stat-success';
      case 'info': return 'stat-info';
      case 'danger': return 'stat-danger';
      default: return 'stat-primary';
    }
  };

  return (
    <div 
      className={`stat-card-modern ${getColorClass()} ${isAction ? 'stat-card-clickable' : ''}`}
      onClick={onClick}
    >
      <div className="stat-header-modern">
        <div className="stat-icon-modern">{icon}</div>
        <span className="stat-badge-modern">
          {isAction ? t('acceso_modulo', 'Acceso Módulo') : t('metrica_central', 'Métrica Central')}
        </span>
      </div>
      <div className="stat-body-modern">
        <span className="stat-value-modern">{value}</span>
        <span className="stat-label-modern">{label}</span>
      </div>
    </div>
  );
};

export default RescatesIndex;