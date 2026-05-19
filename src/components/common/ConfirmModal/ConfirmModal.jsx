import React from 'react';
import { useTranslation } from 'react-i18next';
import './ConfirmModal.css';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText }) => {
  const { t } = useTranslation('common');
  
  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-modal-header">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>{title || t('confirm_title', 'Confirmar')}</h3>
        </div>
        <div className="confirm-modal-body">
          <p>{message}</p>
        </div>
        <div className="confirm-modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            <i className="fas fa-times"></i> {cancelText || t('cancel', 'Cancelar')}
          </button>
          <button className="btn-confirm" onClick={onConfirm}>
            <i className="fas fa-check"></i> {confirmText || t('confirm', 'Confirmar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;