// src/components/common/SlideUpPanel/SlideUpPanel.jsx
import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { requestManager } from '../../../services/api';
import './SlideUpPanel.css';

const SlideUpPanel = ({ isOpen, onClose, children, title }) => {
  const panelRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);
  const scrollYRef = useRef(0);

  const handleClose = () => {
    console.log('🔄 [SlideUpPanel] Cerrando panel...');
    requestManager.cancelAllRequests();
    setIsClosing(true);
    
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && !isClosing) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, isClosing]);

  useEffect(() => {
    if (isOpen && !isClosing) {
      scrollYRef.current = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.width = '100%';
    } else if (!isOpen && !isClosing) {
      const scrollY = scrollYRef.current;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      if (scrollY > 0) {
        window.scrollTo(0, scrollY);
      }
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
    };
  }, [isOpen, isClosing]);

  if (!isOpen && !isClosing) return null;

  return (
    <div 
      className={`slideup-overlay ${isClosing ? 'closing' : ''}`} 
      onClick={handleClose}
    >
      <div 
        className={`slideup-panel ${isClosing ? 'exiting' : ''}`}
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="slideup-handle">
          <div className="slideup-drag-bar"></div>
        </div>
        
        <div className="slideup-header">
          <h2 className="slideup-title">{title || 'Detalle'}</h2>
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