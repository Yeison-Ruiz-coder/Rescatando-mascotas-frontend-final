// src/components/common/Toast/Toast.jsx
import React, { useState, useEffect } from 'react';
import './Toast.css';

// Tipos de toast
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Iconos por tipo
const getIcon = (type) => {
  switch (type) {
    case TOAST_TYPES.SUCCESS: return 'fas fa-check-circle';
    case TOAST_TYPES.ERROR: return 'fas fa-exclamation-circle';
    case TOAST_TYPES.WARNING: return 'fas fa-exclamation-triangle';
    case TOAST_TYPES.INFO: return 'fas fa-info-circle';
    default: return 'fas fa-bell';
  }
};

// Títulos por tipo
const getTitle = (type) => {
  switch (type) {
    case TOAST_TYPES.SUCCESS: return 'Éxito';
    case TOAST_TYPES.ERROR: return 'Error';
    case TOAST_TYPES.WARNING: return 'Advertencia';
    case TOAST_TYPES.INFO: return 'Información';
    default: return 'Notificación';
  }
};

// Componente individual de toast
const ToastItem = ({ id, type, title, message, duration = 5000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 200);
  };

  return (
    <div className={`toast toast-${type} ${isExiting ? 'toast-exit' : ''}`}>
      <i className={`toast-icon ${getIcon(type)}`}></i>
      <div className="toast-content">
        <div className="toast-title">{title || getTitle(type)}</div>
        {message && <div className="toast-message">{message}</div>}
      </div>
      <button className="toast-close" onClick={handleClose}>
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
};

// Container de toasts (context provider)
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          {...toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

// Hook para usar toasts
let toastCounter = 0;
let addToastFunction = null;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = toast.id || ++toastCounter;
    setToasts(prev => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, title, duration) => addToast({ type: TOAST_TYPES.SUCCESS, message, title, duration });
  const error = (message, title, duration) => addToast({ type: TOAST_TYPES.ERROR, message, title, duration });
  const warning = (message, title, duration) => addToast({ type: TOAST_TYPES.WARNING, message, title, duration });
  const info = (message, title, duration) => addToast({ type: TOAST_TYPES.INFO, message, title, duration });

  // Registrar función global
  if (typeof window !== 'undefined') {
    window.toast = { success, error, warning, info };
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
    ToastContainer: () => <ToastContainer toasts={toasts} removeToast={removeToast} />
  };
};

// Provider global
export const ToastProvider = ({ children }) => {
  const { toasts, removeToast, addToast, success, error, warning, info } = useToast();

  // Exponer funciones globalmente
  useEffect(() => {
    window.toast = { success, error, warning, info };
    addToastFunction = addToast;
  }, [success, error, warning, info, addToast]);

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

// Función global para usar fuera de React
export const showToast = (toast) => {
  if (addToastFunction) {
    addToastFunction(toast);
  } else {
    console.warn('Toast not initialized. Wrap your app with ToastProvider');
  }
};

export default ToastItem;