import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FixAuth = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Forzar recarga de datos si hay usuario pero no token
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedUser && !token) {
      console.warn('Usuario sin token - limpiando...');
      localStorage.removeItem('user');
      window.location.reload();
    }
  }, []);

  return <>{children}</>;
};

export default FixAuth;