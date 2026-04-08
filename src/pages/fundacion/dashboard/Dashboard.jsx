// src/pages/fundacion/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { t } = useTranslation('fundacion');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    pets: 24,
    adoptions: 156,
    donations: 12500,
    pendingAdoptions: 8,
    monthlyGrowth: 12,
    donationGoal: 20000
  });

  const donationPercentage = (stats.donations / stats.donationGoal) * 100;

  const actividadesRecientes = [
    {
      id: 1,
      titulo: t('actividad_adopcion_titulo'),
      descripcion: t('actividad_adopcion_desc', { nombre: 'Luna', familia: 'González' }),
      tiempo: t('hace_2_horas'),
      icono: 'fa-check-circle',
      color: 'success'
    },
    {
      id: 2,
      titulo: t('actividad_mascota_titulo'),
      descripcion: t('actividad_mascota_desc', { nombre: 'Max', raza: 'Golden Retriever', edad: '2' }),
      tiempo: t('ayer'),
      icono: 'fa-plus-circle',
      color: 'primary'
    },
    {
      id: 3,
      titulo: t('actividad_donacion_titulo'),
      descripcion: t('actividad_donacion_desc', { monto: '50,000', programa: 'esterilización' }),
      tiempo: t('hace_3_dias'),
      icono: 'fa-donate',
      color: 'warning'
    },
    {
      id: 4,
      titulo: t('actividad_voluntario_titulo'),
      descripcion: t('actividad_voluntario_desc', { nombre: 'Carlos' }),
      tiempo: t('hace_4_dias'),
      icono: 'fa-user-plus',
      color: 'info'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Header de bienvenida */}
      <div className="welcome-header">
        <div>
          <h1>{t('bienvenido', { nombre: user?.nombre || user?.email?.split('@')[0] })}</h1>
          <p>{t('resumen_fundacion')}</p>
        </div>
        <div className="date-badge">
          {new Date().toLocaleDateString(t('locale', { defaultValue: 'es-ES' }), { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">
            <i className="fas fa-paw"></i>
          </div>
          <div className="stat-info">
            <h3>{t('mascotas_registradas')}</h3>
            <p className="stat-number">{stats.pets}</p>
            <span className="stat-trend positive">
              <i className="fas fa-arrow-up"></i> +4 {t('este_mes')}
            </span>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon">
            <i className="fas fa-heart"></i>
          </div>
          <div className="stat-info">
            <h3>{t('adopciones_exitosas')}</h3>
            <p className="stat-number">{stats.adoptions}</p>
            <span className="stat-trend positive">
              <i className="fas fa-arrow-up"></i> +{stats.monthlyGrowth} {t('este_mes')}
            </span>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="stat-icon">
            <i className="fas fa-hand-holding-heart"></i>
          </div>
          <div className="stat-info">
            <h3>{t('donaciones_recibidas')}</h3>
            <p className="stat-number">${stats.donations.toLocaleString()}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${donationPercentage}%` }}></div>
            </div>
            <span className="stat-trend">
              <i className="fas fa-chart-line"></i> {t('meta', { meta: `$${stats.donationGoal.toLocaleString()}` })}
            </span>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3>{t('adopciones_proceso')}</h3>
            <p className="stat-number">{stats.pendingAdoptions}</p>
            <span className="stat-trend">
              <i className="fas fa-users"></i> {t('familias_interesadas')}
            </span>
          </div>
        </div>
      </div>

      {/* Layout de dos columnas */}
      <div className="dashboard-two-columns">
        {/* Actividad Reciente */}
        <div className="recent-activity">
          <div className="activity-header">
            <h2>
              <i className="fas fa-history"></i>
              {t('actividad_reciente')}
            </h2>
            <button className="btn-link" onClick={() => navigate('/fundacion/actividad')}>
              {t('ver_todas')} <i className="fas fa-arrow-right"></i>
            </button>
          </div>
          <div className="activity-list">
            {actividadesRecientes.map((actividad) => (
              <div key={actividad.id} className="activity-item">
                <div className={`activity-icon bg-${actividad.color}`}>
                  <i className={`fas ${actividad.icono}`}></i>
                </div>
                <div className="activity-details">
                  <p className="activity-title">{actividad.titulo}</p>
                  <p className="activity-desc">{actividad.descripcion}</p>
                  <span className="activity-time">
                    <i className="fas fa-clock"></i> {actividad.tiempo}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="quick-actions">
          <h2>
            <i className="fas fa-bolt"></i>
            {t('acciones_rapidas')}
          </h2>
          <div className="actions-grid">
            <button 
              className="action-btn" 
              onClick={() => navigate('/fundacion/mascotas/nueva')}
            >
              <i className="fas fa-plus-circle"></i>
              <span>{t('registrar_mascota')}</span>
            </button>
            <button 
              className="action-btn" 
              onClick={() => navigate('/fundacion/eventos/nuevo')}
            >
              <i className="fas fa-calendar-alt"></i>
              <span>{t('programar_evento')}</span>
            </button>
            <button 
              className="action-btn" 
              onClick={() => navigate('/fundacion/reportes')}
            >
              <i className="fas fa-file-alt"></i>
              <span>{t('generar_reporte')}</span>
            </button>
            <button 
              className="action-btn" 
              onClick={() => navigate('/fundacion/voluntarios')}
            >
              <i className="fas fa-users"></i>
              <span>{t('gestionar_voluntarios')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resumen adicional */}
      <div className="stats-summary">
        <div className="summary-card">
          <h3>
            <i className="fas fa-calendar-week"></i>
            {t('adopciones_este_mes')}
          </h3>
          <div className="summary-stats">
            <span className="summary-number">{stats.monthlyGrowth}</span>
            <span className="summary-label">{t('nuevas_familias')}</span>
          </div>
        </div>
        <div className="summary-card">
          <h3>
            <i className="fas fa-chart-line"></i>
            {t('tasa_exito')}
          </h3>
          <div className="summary-stats">
            <span className="summary-number">94%</span>
            <span className="summary-label">{t('adopciones_exitosas_label')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;