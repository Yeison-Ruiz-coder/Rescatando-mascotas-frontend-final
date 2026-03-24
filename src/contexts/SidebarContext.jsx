import React, { createContext, useState, useContext } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar debe usarse dentro de SidebarProvider');
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false);
  const [isPublicSidebarOpen, setIsPublicSidebarOpen] = useState(false);

  const toggleAdminSidebar = () => {
    setIsAdminSidebarOpen(!isAdminSidebarOpen);
    if (!isAdminSidebarOpen) setIsPublicSidebarOpen(false);
  };

  const closeAdminSidebar = () => {
    setIsAdminSidebarOpen(false);
  };

  const togglePublicSidebar = () => {
    setIsPublicSidebarOpen(!isPublicSidebarOpen);
    if (!isPublicSidebarOpen) setIsAdminSidebarOpen(false);
  };

  const closePublicSidebar = () => {
    setIsPublicSidebarOpen(false);
  };

  const closeAllSidebars = () => {
    setIsAdminSidebarOpen(false);
    setIsPublicSidebarOpen(false);
  };

  return (
    <SidebarContext.Provider value={{
      isAdminSidebarOpen,
      toggleAdminSidebar,
      closeAdminSidebar,
      isPublicSidebarOpen,
      togglePublicSidebar,
      closePublicSidebar,
      closeAllSidebars
    }}>
      {children}
    </SidebarContext.Provider>
  );
};