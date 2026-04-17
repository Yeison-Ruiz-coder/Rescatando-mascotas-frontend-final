// src/components/veterinaria/PacienteCard/PacienteCard.jsx
import React from 'react';
import './PacienteCard.css';

const PacienteCard = ({ paciente, onVerDetalle, onEditar, onEliminar, onVerHistorial }) => {
  const getEspecieIcon = () => {
    switch (paciente.especie) {
      case 'Perro': return '🐕';
      case 'Gato': return '🐱';
      case 'Conejo': return '🐰';
      default: return '🐾';
    }
  };

  const getStatusBadge = () => {
    if (!paciente.esta_activo) {
      return <span className="badge inactive">Inactivo</span>;
    }
    return <span className="badge active">Activo</span>;
  };

  return (
    <div className="paciente-card">
      <div className="card-header">
        <div className="paciente-avatar">
          {paciente.foto_url ? (
            <img src={paciente.foto_url} alt={paciente.nombre_mascota} />
          ) : (
            <div className="avatar-placeholder">{getEspecieIcon()}</div>
          )}
        </div>
        <div className="paciente-info">
          <h3>{paciente.nombre_mascota}</h3>
          <p className="especie">{paciente.especie} {paciente.raza && `- ${paciente.raza}`}</p>
          {getStatusBadge()}
        </div>
      </div>

      <div className="card-details">
        <div className="detail-item">
          <i className="fas fa-venus-mars"></i>
          <span>{paciente.genero}</span>
        </div>
        {paciente.edad && (
          <div className="detail-item">
            <i className="fas fa-calendar"></i>
            <span>{paciente.edad} años</span>
          </div>
        )}
        {paciente.peso && (
          <div className="detail-item">
            <i className="fas fa-weight-hanging"></i>
            <span>{paciente.peso} kg</span>
          </div>
        )}
        <div className="detail-item">
          <i className="fas fa-user"></i>
          <span>{paciente.dueno_nombre || 'Sin propietario'}</span>
        </div>
      </div>

      <div className="card-actions">
        <button className="action-btn-view" onClick={() => onVerDetalle(paciente.id)}>
          <i className="fas fa-eye"></i>
        </button>
        <button className="action-btn-history" onClick={() => onVerHistorial(paciente.id)}>
          <i className="fas fa-history"></i>
        </button>
        <button className="action-btn-edit" onClick={() => onEditar(paciente.id)}>
          <i className="fas fa-edit"></i>
        </button>
        <button className="action-btn-delete" onClick={() => onEliminar(paciente.id, paciente.nombre_mascota)}>
          <i className="fas fa-trash"></i>
        </button>
      </div>
    </div>
  );
};

export default PacienteCard;