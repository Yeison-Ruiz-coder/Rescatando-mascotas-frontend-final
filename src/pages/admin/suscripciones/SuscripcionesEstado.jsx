// src/pages/admin/suscripciones/SuscripcionesEstado.jsx

import React, { useState, useEffect } from 'react';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';
import './SuscripcionesEstado.css';

// ✅ Funciones de formato
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
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📊 Cargando estadísticas completas...');
      
      const response = await suscripcionService.getEstadisticasCompletas();
      console.log('📊 Respuesta estadísticas:', response);
      
      // ✅ Extraer los datos correctamente
      let stats = response;
      if (response?.data) {
        stats = response.data;
      }
      
      setEstadisticas(stats);
      
    } catch (error) {
      console.error('❌ Error al cargar estadísticas:', error);
      setError(error.message || 'Error al cargar las estadísticas');
      toast.error('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  if (loading) {
    return (
      <div className="estado-loading">
        <div className="loading-spinner"></div>
        <p>Cargando estadísticas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="estado-error">
        <div className="error-icon">⚠️</div>
        <h3>Error al cargar las estadísticas</h3>
        <p>{error}</p>
        <button onClick={cargarEstadisticas} className="btn-primary">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (!estadisticas) return null;

  const { por_estado, ingresos, top_mascotas, top_usuarios, promedio_por_suscripcion, distribucion_mensual } = estadisticas;

  return (
    <div className="estado-container">
      <div className="estado-header">
        <div>
          <h1>📊 Panel de Estadísticas</h1>
          <p className="estado-subtitle">Análisis completo de las suscripciones</p>
        </div>
        <button 
          className="btn-actualizar"
          onClick={cargarEstadisticas}
          disabled={loading}
        >
          <span className="btn-icon">🔄</span>
          Actualizar datos
        </button>
      </div>

      {/* Tarjetas de resumen - Estado */}
      <div className="stats-grid">
        <div className="stat-card stat-total">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-label">Total Suscripciones</span>
            <span className="stat-value">{formatNumber(estadisticas.total)}</span>
          </div>
        </div>

        <div className="stat-card stat-activas">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <span className="stat-label">Activas</span>
            <span className="stat-value">{formatNumber(por_estado?.activas || 0)}</span>
            <span className="stat-percent">
              {estadisticas.total > 0 ? Math.round((por_estado?.activas || 0) / estadisticas.total * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="stat-card stat-pendientes">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{formatNumber(por_estado?.pendientes || 0)}</span>
            <span className="stat-percent">
              {estadisticas.total > 0 ? Math.round((por_estado?.pendientes || 0) / estadisticas.total * 100) : 0}%
            </span>
          </div>
        </div>

        <div className="stat-card stat-canceladas">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <span className="stat-label">Canceladas</span>
            <span className="stat-value">{formatNumber(por_estado?.canceladas || 0)}</span>
            <span className="stat-percent">
              {estadisticas.total > 0 ? Math.round((por_estado?.canceladas || 0) / estadisticas.total * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de ingresos */}
      <div className="ingresos-grid">
        <div className="ingresos-card">
          <div className="ingresos-icon">💰</div>
          <div className="ingresos-content">
            <span className="ingresos-label">Ingresos Totales</span>
            <span className="ingresos-value">
              {formatCurrency(ingresos?.total || 0)}
            </span>
            <span className="ingresos-sub">De todas las suscripciones</span>
          </div>
        </div>

        <div className="ingresos-card">
          <div className="ingresos-icon">📈</div>
          <div className="ingresos-content">
            <span className="ingresos-label">Ingresos Mensuales</span>
            <span className="ingresos-value">
              {formatCurrency(ingresos?.mensual || 0)}
            </span>
            <span className="ingresos-sub">De suscripciones activas</span>
          </div>
        </div>

        <div className="ingresos-card">
          <div className="ingresos-icon">📅</div>
          <div className="ingresos-content">
            <span className="ingresos-label">Ingresos Anuales</span>
            <span className="ingresos-value">
              {formatCurrency(ingresos?.anual || 0)}
            </span>
            <span className="ingresos-sub">Proyección anual</span>
          </div>
        </div>

        <div className="ingresos-card">
          <div className="ingresos-icon">📊</div>
          <div className="ingresos-content">
            <span className="ingresos-label">Promedio por Suscripción</span>
            <span className="ingresos-value">
              {formatCurrency(promedio_por_suscripcion || 0)}
            </span>
            <span className="ingresos-sub">Valor promedio mensual</span>
          </div>
        </div>
      </div>

      {/* Gráfico de distribución mensual */}
      <div className="chart-container">
        <h2 className="section-title">📈 Distribución Mensual</h2>
        <div className="chart-bars">
          {(distribucion_mensual || []).map((item) => {
            const maxValor = Math.max(...(distribucion_mensual || []).map(d => d.valor));
            const altura = maxValor > 0 ? (item.valor / maxValor) * 100 : 0;
            
            return (
              <div key={item.mes} className="chart-bar-wrapper">
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar" 
                    style={{ height: `${Math.max(altura, 5)}%` }}
                  >
                    <span className="chart-bar-value">{formatCurrency(item.valor)}</span>
                  </div>
                </div>
                <span className="chart-bar-label">{item.mes}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top mascotas */}
      {(top_mascotas || []).length > 0 && (
        <div className="top-container">
          <h2 className="section-title">🐾 Top Mascotas</h2>
          <div className="table-container">
            <table className="top-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mascota</th>
                  <th className="text-center">Suscripciones</th>
                  <th className="text-right">Ingresos</th>
                  <th className="text-right">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {top_mascotas.map((item, index) => (
                  <tr key={index}>
                    <td className="text-center">
                      <span className={`position-badge position-${index < 3 ? 'top' : 'normal'}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="font-medium">{item.nombre}</td>
                    <td className="text-center">
                      <span className="count-badge">{item.count}</span>
                    </td>
                    <td className="text-right font-medium">{formatCurrency(item.ingresos || 0)}</td>
                    <td className="text-right text-muted">{formatCurrency(item.promedio || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Top usuarios */}
      {(top_usuarios || []).length > 0 && (
        <div className="top-container">
          <h2 className="section-title">👤 Top Usuarios</h2>
          <div className="table-container">
            <table className="top-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Usuario</th>
                  <th className="text-center">Suscripciones</th>
                  <th className="text-right">Ingresos</th>
                  <th className="text-right">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {top_usuarios.map((item, index) => (
                  <tr key={index}>
                    <td className="text-center">
                      <span className={`position-badge position-${index < 3 ? 'top' : 'normal'}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="font-medium">{item.nombre}</td>
                    <td className="text-center">
                      <span className="count-badge">{item.count}</span>
                    </td>
                    <td className="text-right font-medium">{formatCurrency(item.ingresos || 0)}</td>
                    <td className="text-right text-muted">{formatCurrency(item.promedio || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuscripcionesEstado;