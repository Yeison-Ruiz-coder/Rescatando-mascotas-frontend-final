// src/hooks/useVeterinariaProfile.js
import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profileService';

export const useVeterinariaProfile = (profile) => {
  const [veterinariaData, setVeterinariaData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchVeterinariaData = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const data = await profileService.getVeterinariaProfile(profile.id);
      setVeterinariaData(data);
    } catch (err) {
      console.error('Error fetching veterinary profile:', err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const updateGeneralInfo = async (data) => {
    try {
      const updated = await profileService.updateVeterinariaProfile(data);
      setVeterinariaData(updated);
      return updated;
    } catch (err) {
      console.error('Error updating veterinary profile:', err);
      throw err;
    }
  };

  const updateServices = async (services) => {
    try {
      const updated = await profileService.updateVeterinariaServices(services);
      setVeterinariaData(prev => ({ ...prev, ...updated }));
      return updated;
    } catch (err) {
      console.error('Error updating services:', err);
      throw err;
    }
  };

  const updateSchedule = async (horario, urgencias24h) => {
    try {
      const updated = await profileService.updateVeterinariaSchedule({ horario, urgencias24h });
      setVeterinariaData(prev => ({ ...prev, ...updated }));
      return updated;
    } catch (err) {
      console.error('Error updating schedule:', err);
      throw err;
    }
  };

  const uploadLogo = async (file) => {
    try {
      const result = await profileService.uploadVeterinariaLogo(file);
      setVeterinariaData(prev => ({ ...prev, logo: result.logo }));
      return result;
    } catch (err) {
      console.error('Error uploading logo:', err);
      throw err;
    }
  };

  const deleteLogo = async () => {
    try {
      await profileService.deleteVeterinariaLogo();
      setVeterinariaData(prev => ({ ...prev, logo: null }));
    } catch (err) {
      console.error('Error deleting logo:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchVeterinariaData();
  }, [fetchVeterinariaData]);

  return {
    veterinariaData,
    loading,
    updateGeneralInfo,
    updateServices,
    updateSchedule,
    uploadLogo,
    deleteLogo,
  };
};