import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './Modal.css';

const Modal = ({ isOpen, onClose, children, showCloseButton = true }) => {
  const { t } = useTranslation('common');
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-container">
        <div className="modal-content">
          {showCloseButton && (
            <button className="modal-close" onClick={onClose} aria-label={t('close', 'Cerrar')}>
              <i className="fas fa-times"></i>
            </button>
          )}
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;