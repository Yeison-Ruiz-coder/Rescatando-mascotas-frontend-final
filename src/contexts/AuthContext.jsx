import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      const authenticated = authService.isAuthenticated();
      
      console.log('=== VERIFICACIÓN DE AUTENTICACIÓN ===');
      console.log('Token existe:', !!token);
      console.log('Usuario:', currentUser);
      console.log('Autenticado:', authenticated);
      console.log('=====================================');
      
      setUser(currentUser);
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    console.log('Iniciando login...');
    const result = await authService.login(credentials);
    
    if (result.success) {
      const currentUser = authService.getCurrentUser();
      const token = authService.getToken();
      
      console.log('Login exitoso - Token guardado:', !!token);
      console.log('Login exitoso - Usuario:', currentUser);
      
      setUser(currentUser);
      setIsAuthenticated(true);
      
      return { success: true, user: currentUser };
    }
    
    console.log('Login fallido:', result.error);
    return result;
  };

  const register = async (userData) => {
    console.log('Iniciando registro...');
    const result = await authService.register(userData);
    
    if (result.success) {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
      return { success: true, user: currentUser };
    }
    
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    
    const rolePaths = {
      'admin': '/admin/dashboard',
      'veterinaria': '/veterinaria/dashboard',
      'fundacion': '/fundacion/dashboard',
      'user': '/user/dashboard'
    };
    
    return rolePaths[user.tipo] || '/user/dashboard';
  };

  const getDashboardTitle = () => {
    if (!user) return 'Iniciar Sesión';
    
    const titles = {
      'admin': 'Panel de Administración',
      'veterinaria': 'Panel Veterinaria',
      'fundacion': 'Panel Fundación',
      'user': 'Mi Panel'
    };
    
    return titles[user.tipo] || 'Mi Panel';
  };

  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.tipo);
    }
    return user.tipo === role;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    getDashboardPath,
    getDashboardTitle,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};