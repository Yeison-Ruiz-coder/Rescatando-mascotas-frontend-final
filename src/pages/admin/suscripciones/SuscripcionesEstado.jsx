// src/pages/admin/suscripciones/SuscripcionesEstado.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import StatCard from '../../../components/common/StatCard/StatCard';
import { 
  RefreshCw, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  Calendar,
  Users,
  PawPrint,
  Wallet,
  BarChart3,
  AlertCircle
} from 'lucide-react';
import './SuscripcionesEstado.css';

// Funciones de formato
const formatCurrency = (value) => {
  const num = typeof value === 'number' ? value : parseFloat(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

const formatNumber = (value) => {
  const num = typeof value === 'number' ? value : parseInt(value) || 0;
  return new Intl.NumberFormat('es-CO').format(num);
};

const SuscripcionesEstado = () => {
  const { t } = useTranslation(['admin', 'suscripciones']);
  const { user } = useAuth();
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await suscripcionService.getEstadisticasCompletas();
      
      let stats = response;
      if (response?.data) {
        stats = response.data;
      }
      
      setEstadisticas(stats);
      
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || t('suscripciones:error_cargar_estadisticas'));
      toast.error(t('suscripciones:error_cargar_estadisticas'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    cargarEstadisticas();
  };

  if (loading) {
    return (
      <div className="se-container">
        <div className="se-loading">
          <div className="se-spinner"></div>
          <p>{t('suscripciones:cargando_estadisticas')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="se-container">
        <div className="bento-container">
          <div className="se-error">
            <AlertCircle size={48} className="se-error-icon" />
            <h3>{t('suscripciones:error_cargar_estadisticas')}</h3>
            <p>{error}</p>
            <button onClick={cargarEstadisticas} className="se-btn-retry">
              {t('admin:reintentar', 'Reintentar')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!estadisticas) return null;

  const { por_estado, ingresos, top_mascotas, top_usuarios, promedio_por_suscripcion, distribucion_mensual } = estadisticas;
  const total = estadisticas.total || 0;

  return (
    <div className="se-container">
      <div className="se-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('suscripciones:panel_estadisticas', 'Panel de Estadísticas'),
            solicitudes: total,
            adopciones: por_estado?.activas || 0,
            eventos: por_estado?.pendientes || 0,
          }}
        />
      </div>

      <div className="bento-container">
        {/* HEADER */}
        <div className="se-header">
          <div className="se-header-left">
            <h1>{t('suscripciones:panel_estadisticas', 'Panel de Estadísticas')}</h1>
            <p>{t('suscripciones:analisis_completo', 'Análisis completo de las suscripciones')}</p>
          </div>
          <div className="se-header-right">
            <button 
              className="se-btn-refresh"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? 'se-spin' : ''} />
              {t('suscripciones:actualizar_datos', 'Actualizar datos')}
            </button>
          </div>
        </div>

        {/* STATS - Estado */}
        <div className="se-stats-grid">
          <StatCard
            icon={<CreditCard size={24} />}
            label={t('suscripciones:total_suscripciones', 'Total Suscripciones')}
            value={formatNumber(total)}
            color="primary"
            subtitle={t('suscripciones:total', 'Total')}
          />
          <StatCard
            icon={<CheckCircle size={24} />}
            label={t('suscripciones:activas', 'Activas')}
            value={formatNumber(por_estado?.activas || 0)}
            color="success"
            subtitle={`${total > 0 ? Math.round((por_estado?.activas || 0) / total * 100) : 0}%`}
          />
          <StatCard
            icon={<Clock size={24} />}
            label={t('suscripciones:pendientes', 'Pendientes')}
            value={formatNumber(por_estado?.pendientes || 0)}
            color="warning"
            subtitle={`${total > 0 ? Math.round((por_estado?.pendientes || 0) / total * 100) : 0}%`}
          />
          <StatCard
            icon={<XCircle size={24} />}
            label={t('suscripciones:canceladas', 'Canceladas')}
            value={formatNumber(por_estado?.canceladas || 0)}
            color="danger"
            subtitle={`${total > 0 ? Math.round((por_estado?.canceladas || 0) / total * 100) : 0}%`}
          />
        </div>

        {/* INGRESOS */}
        <div className="se-ingresos-grid">
          <StatCard
            icon={<Wallet size={24} />}
            label={t('suscripciones:ingresos_totales', 'Ingresos Totales')}
            value={formatCurrency(ingresos?.total || 0)}
            color="primary"
            subtitle={t('suscripciones:de_todas_suscripciones', 'De todas las suscripciones')}
          />
          <StatCard
            icon={<TrendingUp size={24} />}
            label={t('suscripciones:ingresos_mensuales', 'Ingresos Mensuales')}
            value={formatCurrency(ingresos?.mensual || 0)}
            color="success"
            subtitle={t('suscripciones:de_suscripciones_activas', 'De suscripciones activas')}
          />
          <StatCard
            icon={<Calendar size={24} />}
            label={t('suscripciones:ingresos_anuales', 'Ingresos Anuales')}
            value={formatCurrency(ingresos?.anual || 0)}
            color="info"
            subtitle={t('suscripciones:proyeccion_anual', 'Proyección anual')}
          />
          <StatCard
            icon={<BarChart3 size={24} />}
            label={t('suscripciones:promedio_suscripcion', 'Promedio por Suscripción')}
            value={formatCurrency(promedio_por_suscripcion || 0)}
            color="warning"
            subtitle={t('suscripciones:valor_promedio_mensual', 'Valor promedio mensual')}
          />
        </div>

        {/* GRÁFICO DE DISTRIBUCIÓN MENSUAL */}
        <div className="se-chart-container">
          <h2 className="se-section-title">
            <BarChart3 size={18} />
            {t('suscripciones:distribucion_mensual', 'Distribución Mensual')}
          </h2>
          <div className="se-chart-bars">
            {(distribucion_mensual || []).map((item) => {
              const maxValor = Math.max(...(distribucion_mensual || []).map(d => d.valor));
              const altura = maxValor > 0 ? (item.valor / maxValor) * 100 : 0;
              
              return (
                <div key={item.mes} className="se-chart-bar-wrapper">
                  <div className="se-chart-bar-container">
                    <div 
                      className="se-chart-bar" 
                      style={{ height: `${Math.max(altura, 5)}%` }}
                    >
                      <span className="se-chart-bar-value">{formatCurrency(item.valor)}</span>
                    </div>
                  </div>
                  <span className="se-chart-bar-label">{item.mes}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TABLA: Top Mascotas */}
        {(top_mascotas || []).length > 0 && (
          <div className="se-top-container">
            <h2 className="se-section-title">
              <PawPrint size={18} />
              {t('suscripciones:top_mascotas', 'Top Mascotas')}
            </h2>
            <div className="se-table-container">
              <table className="se-top-table">
                <thead>
                  <tr>
                    <th>{t('suscripciones:posicion', '#')}</th>
                    <th>{t('suscripciones:mascota', 'Mascota')}</th>
                    <th className="text-center">{t('suscripciones:suscripciones', 'Suscripciones')}</th>
                    <th className="text-right">{t('suscripciones:ingresos', 'Ingresos')}</th>
                    <th className="text-right">{t('suscripciones:promedio', 'Promedio')}</th>
                  </tr>
                </thead>
                <tbody>
                  {top_mascotas.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center">
                        <span className={`se-position-badge ${index < 3 ? 'se-position-top' : 'se-position-normal'}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="se-font-medium">{item.nombre}</td>
                      <td className="text-center">
                        <span className="se-count-badge">{item.count}</span>
                      </td>
                      <td className="text-right se-font-medium">{formatCurrency(item.ingresos || 0)}</td>
                      <td className="text-right se-text-muted">{formatCurrency(item.promedio || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLA: Top Usuarios */}
        {(top_usuarios || []).length > 0 && (
          <div className="se-top-container">
            <h2 className="se-section-title">
              <Users size={18} />
              {t('suscripciones:top_usuarios', 'Top Usuarios')}
            </h2>
            <div className="se-table-container">
              <table className="se-top-table">
                <thead>
                  <tr>
                    <th>{t('suscripciones:posicion', '#')}</th>
                    <th>{t('suscripciones:usuario', 'Usuario')}</th>
                    <th className="text-center">{t('suscripciones:suscripciones', 'Suscripciones')}</th>
                    <th className="text-right">{t('suscripciones:ingresos', 'Ingresos')}</th>
                    <th className="text-right">{t('suscripciones:promedio', 'Promedio')}</th>
                  </tr>
                </thead>
                <tbody>
                  {top_usuarios.map((item, index) => (
                    <tr key={index}>
                      <td className="text-center">
                        <span className={`se-position-badge ${index < 3 ? 'se-position-top' : 'se-position-normal'}`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="se-font-medium">{item.nombre}</td>
                      <td className="text-center">
                        <span className="se-count-badge">{item.count}</span>
                      </td>
                      <td className="text-right se-font-medium">{formatCurrency(item.ingresos || 0)}</td>
                      <td className="text-right se-text-muted">{formatCurrency(item.promedio || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuscripcionesEstado;