// src/pages/veterinaria/Dashboard/DashboardVeterinaria.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardVeterinaria.css';

const DashboardVeterinaria = () => {
  const navigate = useNavigate();

  return (
    <div className="vet-dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Panel Veterinaria</h1>
          <p>Resumen rapido de tu clinica y acceso directo a tus herramientas principales.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card stats-card">
          <h2>Vision general</h2>
          <div className="stats-list">
            <div>
              <strong>24</strong>
              <span>Citas hoy</span>
            </div>
            <div>
              <strong>78</strong>
              <span>Pacientes activos</span>
            </div>
            <div>
              <strong>15</strong>
              <span>Registros recientes</span>
            </div>
          </div>
        </div>

        <button className="dashboard-card action-card" onClick={() => navigate('/veterinaria/citas')}>
          <h3><i className="fas fa-calendar-alt"></i> Ver citas</h3>
          <p>Administra tus citas, confirmalas y revisa detalles.</p>
        </button>

        <button className="dashboard-card action-card" onClick={() => navigate('/veterinaria/mascotas')}>
          <h3><i className="fas fa-paw"></i> Ver pacientes</h3>
          <p>Revisa los pacientes registrados y consulta su historial.</p>
        </button>

        <button className="dashboard-card action-card" onClick={() => navigate('/veterinaria/pacientes/1/historial')}>
          <h3><i className="fas fa-notes-medical"></i> Historial medico</h3>
          <p>Agrega o revisa registros medicos de un paciente.</p>
        </button>
      </div>
    </div>
  );
};

export default DashboardVeterinaria;