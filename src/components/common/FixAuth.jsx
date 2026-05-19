import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const FixAuth = ({ children }) => {
  const { t } = useTranslation('common');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedUser && !token) {
      console.warn(t('user_without_token', 'Usuario sin token - limpiando...'));
      localStorage.removeItem('user');
      window.location.reload();
    }
  }, [t]);

  return <>{children}</>;
};

export default FixAuth;