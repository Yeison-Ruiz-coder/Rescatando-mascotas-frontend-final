// src/pages/admin/Dashboard/components/DashboardActivity.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  User,
  PawPrint,
  CheckCircle,
  AlertTriangle,
  Calendar,
  ArrowRight,
  Eye,
} from 'lucide-react';

const DashboardActivity = ({ recentActivity, loading }) => {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const getItemIcon = (type) => {
    const icons = {
      usuario: User,
      mascota: PawPrint,
      adopcion: CheckCircle,
      rescate: AlertTriangle,
      evento: Calendar,
    };
    return icons[type] || Calendar;
  };

  const getItemColor = (type) => {
    const colors = {
      usuario: 'da-color-primary',
      mascota: 'da-color-success',
      adopcion: 'da-color-info',
      rescate: 'da-color-danger',
      evento: 'da-color-warning',
    };
    return colors[type] || 'da-color-primary';
  };

  const getItemPath = (type, id) => {
    const paths = {
      usuario: `/admin/usuarios/${id}`,
      mascota: `/admin/mascotas/${id}`,
      adopcion: `/admin/adopciones/${id}`,
      rescate: `/admin/rescates/${id}`,
      evento: `/admin/eventos/${id}`,
    };
    return paths[type] || '#';
  };

  const getItemTitle = (item, type) => {
    switch (type) {
      case 'usuario':
        return item.nombre || item.nombre_entidad || item.email || 'Usuario';
      case 'mascota':
        return item.nombre_mascota || 'Mascota';
      case 'adopcion':
        return item.mascota?.nombre_mascota || 'Adopción';
      case 'rescate':
        return item.titulo || item.lugar_rescate || 'Rescate';
      case 'evento':
        return item.nombre_evento || 'Evento';
      default:
        return 'Item';
    }
  };

  const activitySections = [
    { key: 'usuarios', label: t('recent.usuarios', 'Últimos usuarios'), type: 'usuario', data: recentActivity.usuarios, path: '/admin/usuarios' },
    { key: 'mascotas', label: t('recent.mascotas', 'Últimas mascotas'), type: 'mascota', data: recentActivity.mascotas, path: '/admin/mascotas' },
    { key: 'adopciones', label: t('recent.adopciones', 'Últimas adopciones'), type: 'adopcion', data: recentActivity.adopciones, path: '/admin/adopciones' },
    { key: 'rescates', label: t('recent.rescates', 'Últimos rescates'), type: 'rescate', data: recentActivity.rescates, path: '/admin/rescates' },
    { key: 'eventos', label: t('recent.eventos', 'Próximos eventos'), type: 'evento', data: recentActivity.eventos, path: '/admin/eventos' },
  ];

  if (loading) {
    return (
      <div className="da-grid">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="da-section da-skeleton">
            <div className="da-skeleton-header"></div>
            <div className="da-skeleton-list">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="da-skeleton-item"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="da-grid">
      {activitySections.map((section) => {
        const hasData = section.data && section.data.length > 0;
        const Icon = getItemIcon(section.type);
        const color = getItemColor(section.type);

        return (
          <div key={section.key} className="da-section">
            <div className="da-section-header">
              <div className="da-section-title">
                <Icon size={16} className={`da-icon ${color}`} />
                <h4>{section.label}</h4>
                <span className="da-section-count">{section.data.length}</span>
              </div>
              <button
                className="da-section-view"
                onClick={() => navigate(section.path)}
              >
                <Eye size={14} />
                {t('ver_todos', 'Ver todos')}
              </button>
            </div>

            <div className="da-section-body">
              {hasData ? (
                section.data.slice(0, 4).map((item, index) => (
                  <div
                    key={item.id || index}
                    className="da-item"
                    onClick={() => navigate(getItemPath(section.type, item.id))}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="da-item-info">
                      <span className="da-item-title">{getItemTitle(item, section.type)}</span>
                      <span className="da-item-date">{formatDate(item.created_at || item.fecha_evento)}</span>
                    </div>
                    <ArrowRight size={14} className="da-item-arrow" />
                  </div>
                ))
              ) : (
                <div className="da-empty">
                  {t('sin_registros', 'No hay registros recientes')}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardActivity;