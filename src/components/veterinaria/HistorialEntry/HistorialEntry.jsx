import React from 'react';

const HistorialEntry = ({ entry, isLast }) => (
  <article className={`historial-entry${isLast ? ' historial-entry-last' : ''}`}>
    <span className="historial-entry-marker" aria-hidden="true" />
    <div className="historial-entry-content">
      <div className="historial-entry-header">
        <h4>{entry.tipo || 'Consulta'}</h4>
        <time dateTime={entry.fecha}>{entry.fecha || ''}</time>
      </div>
      {entry.diagnostico && <p><strong>Diagnóstico:</strong> {entry.diagnostico}</p>}
      {entry.tratamiento && <p><strong>Tratamiento:</strong> {entry.tratamiento}</p>}
      {entry.observaciones && <p><strong>Observaciones:</strong> {entry.observaciones}</p>}
      {entry.veterinario && <p><strong>Veterinario:</strong> {entry.veterinario}</p>}
    </div>
  </article>
);

export default HistorialEntry;
