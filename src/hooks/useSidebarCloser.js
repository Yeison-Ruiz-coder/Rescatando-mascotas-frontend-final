// src/hooks/useSidebarCloser.js
import { useEffect, useRef } from 'react';
import { useSidebar } from '../contexts/SidebarContext';

const useSidebarCloser = (sidebarRef, isOpen, closeSidebar) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si el sidebar está abierto y el clic NO es dentro del sidebar
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    const handleEscapeKey = (event) => {
      if (isOpen && event.key === 'Escape') {
        closeSidebar();
      }
    };

    // Agregar eventos
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, closeSidebar, sidebarRef]);
};

export default useSidebarCloser;