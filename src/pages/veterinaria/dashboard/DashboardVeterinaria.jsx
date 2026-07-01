// src/pages/veterinaria/dashboard/DashboardVeterinaria.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RefreshCw } from 'lucide-react';
import { useVeterinariaDashboard } from './hooks/useVeterinariaDashboard';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './DashboardVeterinaria.css';

const DashboardVeterinaria = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('veterinaria');
  const { loading, error, stats, handleRefresh } = useVeterinariaDashboard();
  const { citasHoy, pacientesActivos, serviciosDisponibles, totalCitas, totalPacientes } = stats;

  if (loading) {
    return (
      <div className="vet-dashboard-page">
        <LoadingSpinner text={t('cargando_dashboard', 'Cargando panel de veterinaria...')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="vet-dashboard-page">
        <div className="dashboard-error">
          <h2>{t('error_carga_dashboard', 'No se pudo cargar el panel')}</h2>
          <p>{error}</p>
          <button className="dashboard-refresh-btn" onClick={handleRefresh}>
            <RefreshCw size={16} /> {t('reintentar', 'Reintentar')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vet-dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>{t('dashboard.titulo', 'Panel Veterinaria')}</h1>
          <p>{t('dashboard.subtitulo', 'Resumen rápido de tu clínica y acceso directo a tus herramientas principales.')}</p>
        </div>
        <button className="dashboard-refresh-btn" onClick={handleRefresh}>
          <RefreshCw size={16} /> {t('actualizar', 'Actualizar')}
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card stats-card">
          <h2>{t('dashboard.vision_general', 'Visión general')}</h2>
          <div className="stats-list">
            <div>
              <strong>{citasHoy}</strong>
              <span>{t('dashboard.citas_hoy', 'Citas hoy')}</span>
            </div>
            <div>
              <strong>{pacientesActivos}</strong>
              <span>{t('dashboard.pacientes_activos', 'Pacientes activos')}</span>
            </div>
            <div>
              <strong>{serviciosDisponibles}</strong>
              <span>{t('dashboard.servicios', 'Servicios')}</span>
            </div>
            <div>
              <strong>{totalCitas}</strong>
              <span>{t('dashboard.total_citas', 'Total de citas')}</span>
            </div>
            <div>
              <strong>{totalPacientes}</strong>
              <span>{t('dashboard.total_pacientes', 'Total de pacientes')}</span>
            </div>
          </div>
        </div>

        <button className="dashboard-card action-card" onClick={() => navigate('/veterinaria/citas')}>
          <h3><i className="fas fa-calendar-alt"></i> {t('dashboard.ver_citas', 'Ver citas')}</h3>
          <p>{t('dashboard.descripcion_citas', 'Administra tus citas, confírmalas y revisa detalles.')}</p>
        </button>

        <button className="dashboard-card action-card" onClick={() => navigate('/veterinaria/pacientes')}>
          <h3><i className="fas fa-paw"></i> {t('dashboard.ver_pacientes', 'Ver pacientes')}</h3>
          <p>{t('dashboard.descripcion_pacientes', 'Revisa los pacientes registrados y consulta su historial.')}</p>
        </button>

        <button className="dashboard-card action-card" onClick={() => navigate('/veterinaria/citas/nueva')}>
          <h3><i className="fas fa-plus-circle"></i> {t('dashboard.agendar_cita', 'Agendar cita')}</h3>
          <p>{t('dashboard.descripcion_agendar', 'Crea una nueva cita para un paciente.')}</p>
        </button>
      </div>
    </div>
  );
};

export default DashboardVeterinaria;