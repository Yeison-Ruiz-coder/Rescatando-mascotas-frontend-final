// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAuth = async () => {
      const token = authService.getToken();
      
      if (!token) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      try {
        const isValid = await authService.verifyToken();
        
        if (isValid) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verificando token:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        const currentUser = authService.getCurrentUser();
        const token = authService.getToken();
        
        setUser(currentUser);
        setIsAuthenticated(true);
        setLoading(false);
        
        return { success: true, user: currentUser };
      }
      
      setLoading(false);
      
      return { 
        success: false, 
        message: result.message || 'Credenciales incorrectas. Por favor, verifica tu correo y contraseña'
      };
    } catch (error) {
      console.error('Error en login:', error);
      setLoading(false);
      
      let errorMessage = 'Error al iniciar sesión. Intenta nuevamente';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errorObj = error.response.data.errors;
        errorMessage = Object.values(errorObj).flat()[0] || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  // 🔥 REGISTER CORREGIDO - Maneja fundaciones/veterinarias
  const register = async (userData) => {
    setLoading(true);
    
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        const requiereAprobacion = result.requiereAprobacion || 
                                   (result.user?.tipo === 'fundacion' || result.user?.tipo === 'veterinaria');
        
        // Si NO requiere aprobación (usuario normal), autenticar automáticamente
        if (!requiereAprobacion && result.token) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          // Si requiere aprobación (fundación/veterinaria), NO autenticar
          setUser(null);
          setIsAuthenticated(false);
        }
        
        setLoading(false);
        return { 
          success: true, 
          user: result.user,
          token: result.token,
          requiereAprobacion: requiereAprobacion,
          message: result.message
        };
      }
      
      setLoading(false);
      return { 
        success: false, 
        message: result.message || 'Error al registrar usuario'
      };
    } catch (error) {
      console.error('Error en registro:', error);
      setLoading(false);
      
      let errorMessage = 'Error al registrarse. Intenta nuevamente';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errorObj = error.response.data.errors;
        errorMessage = Object.values(errorObj).flat()[0] || errorMessage;
      }
      
      return { 
        success: false, 
        message: errorMessage
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Refresca el usuario desde el servicio de auth (útil después de actualizar perfil/avatar)
  const refreshUser = async () => {
    try {
      const currentUser = await authService.refreshCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      return currentUser;
    } catch (err) {
      console.error('Error refrescando usuario:', err);
      return null;
    }
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
    refreshUser,
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