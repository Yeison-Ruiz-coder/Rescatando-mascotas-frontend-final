// src/components/common/StatusBadge/StatusBadge.jsx
import React from 'react';
import './StatusBadge.css';

const StatusBadge = ({ 
  status, 
  type = 'estado',
  size = 'md',
  showDot = true,
  className = ''
}) => {
  const getStatusConfig = (status, type) => {
    const configs = {
      estado: {
        activo: { label: 'Activo', color: 'status-success' },
        inactivo: { label: 'Inactivo', color: 'status-danger' },
        pendiente: { label: 'Pendiente', color: 'status-warning' },
        suspendido: { label: 'Suspendido', color: 'status-dark' },
      },
      prioridad: {
        alta: { label: 'Alta', color: 'priority-high' },
        media: { label: 'Media', color: 'priority-medium' },
        baja: { label: 'Baja', color: 'priority-low' },
      },
      tipo: {
        usuario: { label: 'Usuario', color: 'type-user' },
        fundacion: { label: 'Fundación', color: 'type-fundacion' },
        veterinaria: { label: 'Veterinaria', color: 'type-veterinaria' },
        admin: { label: 'Admin', color: 'type-admin' },
      },
      verificacion: {
        verified: { label: 'Verificado', color: 'verif-success' },
        unverified: { label: 'No verificado', color: 'verif-warning' },
      }
    };

    for (const category of Object.values(configs)) {
      if (category[status]) {
        return category[status];
      }
    }

    return { label: status || 'Desconocido', color: 'status-default' };
  };

  const config = getStatusConfig(status, type);
  const sizeClass = `badge-size-${size}`;

  return (
    <span className={`status-badge ${config.color} ${sizeClass} ${className}`}>
      {showDot && <span className="status-badge-dot"></span>}
      <span className="status-badge-label">{config.label}</span>
    </span>
  );
};

export default StatusBadge;