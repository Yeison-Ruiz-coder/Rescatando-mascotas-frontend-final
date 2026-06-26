// src/components/layout/Sidebar/SidebarOverlay.jsx
import React, { memo } from 'react';
import { useSidebar } from '../../../contexts/SidebarContext';

const SidebarOverlay = memo(({ sidebarType = 'public' }) => {
  const { 
    isPublicSidebarOpen, 
    closePublicSidebar,
    isAdminSidebarOpen,
    closeAdminSidebar
  } = useSidebar();

  const isOpen = sidebarType === 'admin' ? isAdminSidebarOpen : isPublicSidebarOpen;
  const onClose = sidebarType === 'admin' ? closeAdminSidebar : closePublicSidebar;

  if (!isOpen) return null;

  return (
    <div 
      className="sidebar-overlay active" 
      onClick={onClose}
      onTouchStart={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 999,
        cursor: 'pointer',
        willChange: 'opacity',
        backfaceVisibility: 'hidden',
        contain: 'layout style'
      }}
    />
  );
});

SidebarOverlay.displayName = 'SidebarOverlay';
export default SidebarOverlay;