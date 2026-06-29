// src/pages/admin/Dashboard/Dashboard.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { useAdminDashboard } from './hooks/useAdminDashboard';
import DashboardStats from './components/DashboardStats';
import DashboardCharts from './components/DashboardCharts';
import DashboardActivity from './components/DashboardActivity';
import DashboardAlerts from './components/DashboardAlerts';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation('admin');
  const { user } = useAuth();
  const { loading, refreshing, error, stats, chartData, recentActivity, alerts, handleRefresh } = useAdminDashboard();

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  if (loading) {
    return (
      <div className="ad-dashboard-container">
        <LoadingSpinner text={t('cargando_dashboard', 'Cargando dashboard...')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="ad-dashboard-container">
        <div className="ad-error">
          <h3>{t('error_carga_dashboard', 'Error al cargar el dashboard')}</h3>
          <p>{error}</p>
          <button onClick={handleRefresh} className="ad-btn-retry">
            <RefreshCw size={16} />
            {t('reintentar', 'Reintentar')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ad-dashboard-container">
      {/* ===== BANNER ===== */}
      <div className="ad-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('dashboard.titulo', 'Panel de Administración'),
            solicitudes: stats.totalUsuarios,
            adopciones: stats.adopcionesCompletadas,
            eventos: stats.eventosActivos,
          }}
        />
      </div>

      {/* ===== CONTENIDO ===== */}
      <div className="ad-content">
        <div className="ad-header">
          <div className="ad-header-left">
            <h1>{t('dashboard.estadisticas', 'Estadísticas del sistema')}</h1>
            <p>{t('dashboard.subtitulo', 'Resumen general de toda la plataforma')}</p>
          </div>
          <div className="ad-header-right">
            <button
              className={`ad-btn-refresh ${refreshing ? 'ad-spinning' : ''}`}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={18} />
              {t('actualizar', 'Actualizar')}
            </button>
          </div>
        </div>

        {/* ===== ALERTAS ===== */}
        <section className="ad-section ad-section-alerts">
          <DashboardAlerts alerts={alerts} loading={loading} />
        </section>

        {/* ===== STATS ===== */}
        <section className="ad-section ad-section-stats">
          <DashboardStats stats={stats} loading={loading} />
        </section>

        {/* ===== GRÁFICOS ===== */}
        <section className="ad-section ad-section-charts">
          <DashboardCharts chartData={chartData} loading={loading} />
        </section>

        {/* ===== ACTIVIDAD RECIENTE ===== */}
        <section className="ad-section ad-section-activity">
          <DashboardActivity recentActivity={recentActivity} loading={loading} />
        </section>
      </div>
    </div>
  );
};

export default Dashboard;