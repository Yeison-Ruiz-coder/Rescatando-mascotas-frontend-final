import React from 'react';

const CitaCard = ({ cita, onCambiarEstado, onEliminar, onVerDetalle, onEditar }) => {
  const estado = cita.estado || 'pendiente';

  return (
    <article className={`cita-card cita-card-${estado}`}>
      <div className="cita-card-content">
        <div>
          <h3>{cita.mascota_nombre || 'Mascota'}</h3>
          <p>{cita.servicio || 'Consulta'} {cita.dueno_nombre ? `- ${cita.dueno_nombre}` : ''}</p>
          <p>{cita.fecha || ''}{cita.hora ? ` ${cita.hora}` : ''}</p>
        </div>
        <span className="cita-card-status">{estado}</span>
      </div>
      <div className="cita-card-actions">
        <button type="button" onClick={() => onVerDetalle(cita.id)}>Ver detalle</button>
        <button type="button" onClick={() => onEditar(cita.id)}>Editar</button>
        {estado === 'pendiente' && (
          <button type="button" onClick={() => onCambiarEstado(cita.id, 'confirmada')}>
            Confirmar
          </button>
        )}
        <button type="button" onClick={() => onEliminar(cita.id)}>Eliminar</button>
      </div>
    </article>
  );
};

export default CitaCard;
