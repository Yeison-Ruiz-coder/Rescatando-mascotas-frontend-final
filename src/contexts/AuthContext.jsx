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
      const authenticated = authService.isAuthenticated();
      
      setUser(currentUser);
      setIsAuthenticated(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const result = await authService.login(credentials);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const register = async (userData) => {
    const result = await authService.register(userData);
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    return result;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // 🔥 ACTUALIZA ESTA FUNCIÓN para manejar todos los roles 🔥
  const getDashboardPath = () => {
    if (!user) return '/login';
    
    // Mapeo de roles a sus dashboards
    const rolePaths = {
      'admin': '/admin/dashboard',
      'veterinaria': '/veterinaria/dashboard',
      'fundacion': '/fundacion/dashboard',
      'user': '/user/dashboard'
    };
    
    // Si el rol existe en el mapeo, usa esa ruta, sino usa /user/dashboard
    return rolePaths[user.tipo] || '/user/dashboard';
  };

  // 🔥 NUEVA FUNCIÓN: Obtener el nombre del dashboard según el rol
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

  // 🔥 NUEVA FUNCIÓN: Verificar si tiene un rol específico
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