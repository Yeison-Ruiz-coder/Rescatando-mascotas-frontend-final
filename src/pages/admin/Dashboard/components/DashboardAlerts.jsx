// src/pages/admin/Dashboard/components/DashboardAlerts.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  AlertTriangle,
  FileText,
  Clock,
  ChevronRight,
} from 'lucide-react';

const DashboardAlerts = ({ alerts, loading }) => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

  const alertItems = [
    {
      key: 'usuariosPendientes',
      label: t('alerts.usuarios_pendientes', 'Usuarios pendientes de aprobación'),
      value: alerts.usuariosPendientes,
      icon: Users,
      color: 'warning',
      path: '/admin/usuarios/pendientes',
      variant: 'warning',
    },
    {
      key: 'rescatesPendientes',
      label: t('alerts.rescates_pendientes', 'Rescates pendientes'),
      value: alerts.rescatesPendientes,
      icon: AlertTriangle,
      color: 'danger',
      path: '/admin/rescates/pendientes',
      variant: 'danger',
    },
    {
      key: 'solicitudesPendientes',
      label: t('alerts.solicitudes_pendientes', 'Solicitudes de adopción pendientes'),
      value: alerts.solicitudesPendientes,
      icon: FileText,
      color: 'info',
      path: '/admin/adopciones/solicitudes',
      variant: 'info',
    },
  ];

  const getVariantClass = (variant) => {
    const classes = {
      primary: 'da-alert-primary',
      danger: 'da-alert-danger',
      warning: 'da-alert-warning',
      info: 'da-alert-info',
      success: 'da-alert-success',
    };
    return classes[variant] || classes.primary;
  };

  const getColorClass = (color) => {
    const classes = {
      primary: 'da-color-primary',
      danger: 'da-color-danger',
      warning: 'da-color-warning',
      info: 'da-color-info',
      success: 'da-color-success',
    };
    return classes[color] || classes.primary;
  };

  if (loading) {
    return (
      <div className="da-alerts-grid">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="da-alert-card da-skeleton">
            <div className="da-skeleton-icon"></div>
            <div className="da-skeleton-content">
              <div className="da-skeleton-label"></div>
              <div className="da-skeleton-value"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasAlerts = Object.values(alerts).some(v => v > 0);

  if (!hasAlerts) {
    return (
      <div className="da-alerts-clean">
        <div className="da-alerts-clean-icon">✅</div>
        <h4>{t('sin_alertas', '¡Todo en orden!')}</h4>
        <p>{t('sin_alertas_desc', 'No hay pendientes que requieran tu atención en este momento.')}</p>
      </div>
    );
  }

  return (
    <div className="da-alerts-grid">
      {alertItems.map((item) => {
        const Icon = item.icon;
        const hasValue = item.value > 0;

        return (
          <div
            key={item.key}
            className={`da-alert-card ${getVariantClass(item.variant)}`}
            onClick={() => hasValue && navigate(item.path)}
            role="button"
            tabIndex={0}
            style={{ cursor: hasValue ? 'pointer' : 'default' }}
          >
            <div className="da-alert-left">
              <div className={`da-alert-icon ${getColorClass(item.color)}`}>
                <Icon size={20} />
              </div>
              <div className="da-alert-content">
                <span className="da-alert-label">{item.label}</span>
                <span className={`da-alert-value ${!hasValue ? 'da-alert-zero' : ''}`}>
                  {item.value}
                </span>
              </div>
            </div>
            {hasValue && (
              <div className="da-alert-right">
                <Clock size={14} className="da-clock-icon" />
                <ChevronRight size={16} className="da-chevron-icon" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default DashboardAlerts;