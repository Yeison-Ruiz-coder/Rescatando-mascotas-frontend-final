// src/components/veterinaria/CitaCard/CitaCard.jsx
import React from 'react';
import './CitaCard.css';

const CitaCard = ({ cita, onCambiarEstado, onEliminar, onVerDetalle, onEditar }) => {
  const getEstadoBadge = () => {
    switch (cita.estado) {
      case 'pendiente':
        return <span className="estado-badge estado-pendiente">⏳ Pendiente</span>;
      case 'confirmada':
        return <span className="estado-badge estado-confirmada">✅ Confirmada</span>;
      case 'completada':
        return <span className="estado-badge estado-completada">✔️ Completada</span>;
      case 'cancelada':
        return <span className="estado-badge estado-cancelada">❌ Cancelada</span>;
      default:
        return null;
    }
  };

  const getEstadoActions = () => {
    if (cita.estado === 'pendiente') {
      return (
        <>
          <button className="action-confirm" onClick={() => onCambiarEstado(cita.id, 'confirmada')}>
            Confirmar
          </button>
          <button className="action-cancel" onClick={() => onCambiarEstado(cita.id, 'cancelada')}>
            Cancelar
          </button>
        </>
      );
    }
    if (cita.estado === 'confirmada') {
      return (
        <button className="action-complete" onClick={() => onCambiarEstado(cita.id, 'completada')}>
          Completar
        </button>
      );
    }
    return null;
  };

  return (
    <div className="cita-card">
      <div className="cita-card-header">
        <div className="cita-info">
          <div className="cita-fecha">
            <i className="fas fa-calendar-day"></i>
            <strong>{cita.fecha}</strong> - {cita.hora}
          </div>
          {getEstadoBadge()}
        </div>
      </div>

      <div className="cita-card-body">
        <div className="cita-paciente">
          <div className="paciente-icon">
            {cita.especie === 'Perro' ? '🐕' : '🐱'}
          </div>
          <div>
            <h4>{cita.mascota_nombre}</h4>
            <p>{cita.especie} {cita.raza}</p>
          </div>
        </div>

        <div className="cita-detalles">
          <div className="detalle-item">
            <i className="fas fa-user"></i>
            <span>{cita.dueno_nombre}</span>
          </div>
          <div className="detalle-item">
            <i className="fas fa-stethoscope"></i>
            <span>{cita.servicio || 'Consulta general'}</span>
          </div>
          <div className="detalle-item">
            <i className="fas fa-user-md"></i>
            <span>{cita.veterinario_nombre || 'No asignado'}</span>
          </div>
        </div>

        {cita.motivo && (
          <div className="cita-motivo">
            <strong>Motivo:</strong> {cita.motivo}
          </div>
        )}
      </div>

      <div className="cita-card-footer">
        <div className="cita-actions">
          <button className="action-view" onClick={() => onVerDetalle(cita.id)}>
            <i className="fas fa-eye"></i> Ver
          </button>
          <button className="action-edit" onClick={() => onEditar(cita.id)}>
            <i className="fas fa-edit"></i> Editar
          </button>
          {getEstadoActions()}
          <button className="action-delete" onClick={() => onEliminar(cita.id)}>
            <i className="fas fa-trash"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CitaCard;