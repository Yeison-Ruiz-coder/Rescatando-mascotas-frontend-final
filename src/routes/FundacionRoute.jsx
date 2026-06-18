import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FundacionRoute = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return null;
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