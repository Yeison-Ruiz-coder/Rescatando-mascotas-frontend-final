// src/components/common/EmptyState/EmptyState.jsx
import React from 'react';
import './EmptyState.css';

const EmptyState = ({ 
  icon = 'fas fa-folder-open',
  title = 'No hay datos',
  description = 'No se encontraron elementos para mostrar',
  actionText,
  onAction,
  onClearFilters,
  showClearButton = false
}) => {
  return (
    <div className="empty-state">
      <i className={icon}></i>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="empty-actions">
        {showClearButton && onClearFilters && (
          <button className="btn-secondary" onClick={onClearFilters}>
            <i className="fas fa-eraser"></i> Limpiar filtros
          </button>
        )}
        {actionText && onAction && (
          <button className="btn-primary" onClick={onAction}>
            <i className="fas fa-plus"></i> {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;