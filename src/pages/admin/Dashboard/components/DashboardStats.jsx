// src/pages/admin/Dashboard/components/DashboardStats.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  PawPrint,
  CheckCircle,
  Calendar,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

const DashboardStats = ({ stats, loading }) => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

  const statItems = [
    {
      key: 'totalUsuarios',
      label: t('stats.total_usuarios', 'Total Usuarios'),
      value: stats.totalUsuarios,
      icon: Users,
      color: 'primary',
      path: '/admin/usuarios',
    },
    {
      key: 'totalMascotas',
      label: t('stats.total_mascotas', 'Total Mascotas'),
      value: stats.totalMascotas,
      icon: PawPrint,
      color: 'success',
      path: '/admin/mascotas',
    },
    {
      key: 'adopcionesCompletadas',
      label: t('stats.adopciones_completadas', 'Adopciones Completadas'),
      value: stats.adopcionesCompletadas,
      icon: CheckCircle,
      color: 'info',
      path: '/admin/adopciones',
    },
    {
      key: 'eventosActivos',
      label: t('stats.eventos_activos', 'Eventos Activos'),
      value: stats.eventosActivos,
      icon: Calendar,
      color: 'warning',
      path: '/admin/eventos',
    },
    {
      key: 'rescatesPendientes',
      label: t('stats.rescates_pendientes', 'Rescates Pendientes'),
      value: stats.rescatesPendientes,
      icon: AlertTriangle,
      color: 'danger',
      path: '/admin/rescates/pendientes',
    },
    {
      key: 'suscripcionesActivas',
      label: t('stats.suscripciones_activas', 'Suscripciones Activas'),
      value: stats.suscripcionesActivas,
      icon: CreditCard,
      color: 'purple',
      path: '/admin/suscripciones',
    },
  ];

  const getColorClass = (color) => {
    const classes = {
      primary: 'ds-color-primary',
      success: 'ds-color-success',
      info: 'ds-color-info',
      warning: 'ds-color-warning',
      danger: 'ds-color-danger',
      purple: 'ds-color-purple',
    };
    return classes[color] || classes.primary;
  };

  const getIconBgClass = (color) => {
    const classes = {
      primary: 'ds-icon-bg-primary',
      success: 'ds-icon-bg-success',
      info: 'ds-icon-bg-info',
      warning: 'ds-icon-bg-warning',
      danger: 'ds-icon-bg-danger',
      purple: 'ds-icon-bg-purple',
    };
    return classes[color] || classes.primary;
  };

  if (loading) {
    return (
      <div className="ds-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="ds-stat-card ds-skeleton">
            <div className="ds-skeleton-icon"></div>
            <div className="ds-skeleton-content">
              <div className="ds-skeleton-label"></div>
              <div className="ds-skeleton-value"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="ds-grid">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className={`ds-stat-card ${getColorClass(item.color)}`}
            onClick={() => item.path && navigate(item.path)}
            role="button"
            tabIndex={0}
          >
            <div className="ds-stat-left">
              <div className={`ds-stat-icon ${getIconBgClass(item.color)}`}>
                <Icon size={20} />
              </div>
              <div className="ds-stat-content">
                <span className="ds-stat-label">{item.label}</span>
                <span className="ds-stat-value">{item.value}</span>
              </div>
            </div>
            <div className="ds-stat-right">
              <TrendingUp size={16} className="ds-trend-icon" />
              <ArrowRight size={16} className="ds-arrow-icon" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;