// src/components/common/SlideUpPanel/SlideUpPanel.jsx
import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import './SlideUpPanel.css';

const SlideUpPanel = ({ isOpen, onClose, children, title }) => {
  const panelRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  // Función para cerrar con animación (1 segundo como en CSS)
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 1000); // 1000ms = 1 segundo, igual que la transición CSS
  };

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isClosing]);

  // Bloquear scroll cuando está abierto
  useEffect(() => {
    if (isOpen && !isClosing) {
      document.body.style.overflow = 'hidden';
      setHasOpened(true);
    } else if (!isOpen && !isClosing) {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isClosing]);

  // Resetear estado cuando se cierra completamente
  useEffect(() => {
    if (!isOpen && !isClosing) {
      setHasOpened(false);
    }
  }, [isOpen, isClosing]);

  if (!isOpen && !isClosing && !hasOpened) return null;

  return (
    <div className={`slideup-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
      <div 
        className={`slideup-panel ${!hasOpened && isOpen ? 'entering' : ''} ${isClosing ? 'exiting' : ''}`}
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="slideup-handle">
          <div className="slideup-drag-bar"></div>
        </div>
        
        <div className="slideup-header">
          <h2 className="slideup-title">{title}</h2>
          <button className="slideup-close" onClick={handleClose}>
            <X size={24} />
          </button>
        </div>
        
        <div className="slideup-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default SlideUpPanel;