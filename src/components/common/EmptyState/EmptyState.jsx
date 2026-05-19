import React from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../Button/Button';
import './EmptyState.css';

const EmptyState = ({ 
  icon = 'fas fa-folder-open',
  title,
  titleKey,
  description,
  descriptionKey,
  actionText,
  actionTextKey,
  onAction,
  onClearFilters,
  showClearButton = false
}) => {
  const { t } = useTranslation(['mascotas', 'fundacion', 'common']);
  
  const displayTitle = titleKey ? t(titleKey, title) : (title || t('common:no_data', 'No hay datos'));
  const displayDescription = descriptionKey ? t(descriptionKey, description) : (description || t('common:no_items', 'No se encontraron elementos para mostrar'));
  const displayActionText = actionTextKey ? t(actionTextKey, actionText) : actionText;
  
  return (
    <div className="empty-state">
      <i className={icon}></i>
      <h3>{displayTitle}</h3>
      <p>{displayDescription}</p>
      <div className="empty-actions">
        {showClearButton && onClearFilters && (
          <Button variant="secondary" onClick={onClearFilters}>
            <i className="fas fa-eraser"></i> {t('common:clear_filters', 'Limpiar filtros')}
          </Button>
        )}
        {displayActionText && onAction && (
          <Button variant="primary" onClick={onAction}>
            <i className="fas fa-plus"></i> {displayActionText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;