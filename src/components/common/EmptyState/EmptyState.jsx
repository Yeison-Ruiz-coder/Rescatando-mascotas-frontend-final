// src/components/common/EmptyState/EmptyState.jsx
import React from 'react';
import Button from '../Button/Button';
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
          <Button variant="secondary" onClick={onClearFilters}>
            <i className="fas fa-eraser"></i> Limpiar filtros
          </Button>
        )}
        {actionText && onAction && (
          <Button variant="primary" onClick={onAction}>
            <i className="fas fa-plus"></i> {actionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;