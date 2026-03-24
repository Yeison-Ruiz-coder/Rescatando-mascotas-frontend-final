import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner';

const FundacionRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1f2e 0%, #0f1119 100%)'
      }}>
        <LoadingSpinner />
        <p style={{ marginLeft: '10px', color: '#fff' }}>Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.tipo !== 'fundacion') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default FundacionRoute;