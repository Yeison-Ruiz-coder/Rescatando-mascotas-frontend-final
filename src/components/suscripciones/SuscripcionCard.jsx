// src/components/SuscripcionCard.jsx
import React from 'react';

const SuscripcionCard = ({ suscripcion, onEdit, onDelete }) => {
  const getEstadoColor = (estado) => {
    const colores = {
      activo: '#4caf50',
      pausado: '#ff9800',
      cancelado: '#f44336',
      finalizado: '#9e9e9e'
    };
    return colores[estado] || '#000';
  };

  const getFrecuenciaLabel = (frecuencia) => {
    const labels = {
      unica: 'Única',
      mensual: 'Mensual',
      trimestral: 'Trimestral',
      anual: 'Anual'
    };
    return labels[frecuencia] || frecuencia;
  };

  return (
    <div className="suscripcion-card">
      <div className="card-header">
        <h3>Suscripción #{suscripcion.id}</h3>
        <span 
          className="estado-badge" 
          style={{ backgroundColor: getEstadoColor(suscripcion.estado) }}
        >
          {suscripcion.estado}
        </span>
      </div>
      
      <div className="card-body">
        <p><strong>Usuario ID:</strong> {suscripcion.user_id}</p>
        <p><strong>Mascota ID:</strong> {suscripcion.mascota_id}</p>
        <p><strong>Monto:</strong> ${suscripcion.monto_mensual}</p>
        <p><strong>Frecuencia:</strong> {getFrecuenciaLabel(suscripcion.frecuencia)}</p>
        <p><strong>Inicio:</strong> {new Date(suscripcion.fecha_inicio).toLocaleDateString()}</p>
        {suscripcion.fecha_fin && (
          <p><strong>Fin:</strong> {new Date(suscripcion.fecha_fin).toLocaleDateString()}</p>
        )}
        {suscripcion.mensaje_apoyo && (
          <p><strong>Mensaje:</strong> {suscripcion.mensaje_apoyo}</p>
        )}
        {suscripcion.user && (
          <p><strong>Usuario:</strong> {suscripcion.user.name}</p>
        )}
        {suscripcion.mascota && (
          <p><strong>Mascota:</strong> {suscripcion.mascota.nombre}</p>
        )}
      </div>
      
      <div className="card-actions">
        <button onClick={onEdit} className="btn-edit">
          ✏️ Editar
        </button>
        <button onClick={onDelete} className="btn-delete">
          🗑️ Eliminar
        </button>
      </div>
    </div>
  );
};

export default SuscripcionCard;