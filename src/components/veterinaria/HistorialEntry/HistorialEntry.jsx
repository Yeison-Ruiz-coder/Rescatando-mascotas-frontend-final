// src/components/veterinaria/HistorialEntry/HistorialEntry.jsx
import React from 'react';
import './HistorialEntry.css';

const HistorialEntry = ({ entry, isLast }) => {
  const getTipoIcon = () => {
    switch (entry.tipo) {
      case 'consulta': return '🩺';
      case 'vacunacion': return '💉';
      case 'cirugia': return '🔪';
      case 'examen': return '🔬';
      case 'hospitalizacion': return '🏥';
      default: return '📋';
    }
  };

  const getTipoClass = () => {
    switch (entry.tipo) {
      case 'consulta': return 'tipo-consulta';
      case 'vacunacion': return 'tipo-vacunacion';
      case 'cirugia': return 'tipo-cirugia';
      case 'examen': return 'tipo-examen';
      default: return 'tipo-other';
    }
  };

  return (
    <div className={`historial-entry ${!isLast ? 'with-connector' : ''}`}>
      <div className="timeline-marker">
        <div className={`marker-dot ${getTipoClass()}`}>
          {getTipoIcon()}
        </div>
        {!isLast && <div className="marker-line"></div>}
      </div>
      
      <div className="entry-content">
        <div className="entry-header">
          <div className="entry-date">
            <i className="fas fa-calendar-alt"></i>
            {entry.fecha}
          </div>
          <div className={`entry-type ${getTipoClass()}`}>
            {entry.tipo.charAt(0).toUpperCase() + entry.tipo.slice(1)}
          </div>
        </div>
        
        <div className="entry-body">
          <div className="entry-section">
            <strong>Diagnóstico:</strong>
            <p>{entry.diagnostico}</p>
          </div>
          
          {entry.tratamiento && (
            <div className="entry-section">
              <strong>Tratamiento:</strong>
              <p>{entry.tratamiento}</p>
            </div>
          )}
          
          {entry.observaciones && (
            <div className="entry-section">
              <strong>Observaciones:</strong>
              <p>{entry.observaciones}</p>
            </div>
          )}
          
          {entry.veterinario && (
            <div className="entry-veterinario">
              <i className="fas fa-user-md"></i>
              Dr(a). {entry.veterinario}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistorialEntry;