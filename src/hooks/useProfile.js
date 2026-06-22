// src/hooks/useProfile.js
import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';

export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCompletionStatus = useCallback(async () => {
    try {
      const status = await profileService.getCompletionStatus();
      setCompletionStatus(status);
    } catch (err) {
      console.error('Error fetching completion status:', err);
    }
  }, []);

  const { refreshUser } = useAuth();

  const updateProfile = async (data) => {
    setLoading(true);
    try {
      const updated = await profileService.updateProfile(data);
      setProfile(updated);
      // Actualiza también el usuario en el contexto de autenticación
      try { await refreshUser(); } catch (e) { /* noop */ }
      await fetchCompletionStatus();
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAvatar = async (file) => {
    setLoading(true);
    try {
      const result = await profileService.updateAvatar(file);
      setProfile(prev => ({ ...prev, avatar: result.avatar }));
      // Refrescar el usuario global para que sidebars y demás reflejen el cambio
      try { await refreshUser(); } catch (e) { /* noop */ }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteAvatar = async () => {
    setLoading(true);
    try {
      await profileService.deleteAvatar();
      setProfile(prev => ({ ...prev, avatar: null }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = async (location) => {
    setLoading(true);
    try {
      const updated = await profileService.updateLocation(location);
      setProfile(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSocialNetworks = async (networks) => {
    setLoading(true);
    try {
      const updated = await profileService.updateSocialNetworks(networks);
      setProfile(updated);
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (data) => {
    setLoading(true);
    try {
      await profileService.changePassword(data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendPhoneVerification = async () => {
    try {
      return await profileService.sendPhoneVerification();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const confirmPhoneVerification = async (code) => {
    setLoading(true);
    try {
      const result = await profileService.confirmPhoneVerification(code);
      setProfile(prev => ({ ...prev, telefono_verificado: true }));
      await fetchCompletionStatus();
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchCompletionStatus();
  }, [fetchProfile, fetchCompletionStatus]);

  return {
    profile,
    loading,
    error,
    completionStatus,
    updateProfile,
    updateAvatar,
    deleteAvatar,
    updateLocation,
    updateSocialNetworks,
    changePassword,
    sendPhoneVerification,
    confirmPhoneVerification,
    refetch: fetchProfile
  };
};