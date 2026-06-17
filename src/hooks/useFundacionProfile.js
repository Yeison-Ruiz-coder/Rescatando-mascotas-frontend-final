// src/hooks/useFundacionProfile.js
import { useState, useEffect, useCallback } from 'react';
import { profileService } from '../services/profileService';

export const useFundacionProfile = (profile) => {
  const [fundacionData, setFundacionData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFundacionData = useCallback(async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const data = await profileService.getFundacionProfile(profile.id);
      setFundacionData(data);
    } catch (err) {
      console.error('Error fetching foundation profile:', err);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const updateGeneralInfo = async (data) => {
    try {
      const updated = await profileService.updateFundacionProfile(data);
      setFundacionData(updated);
      return updated;
    } catch (err) {
      console.error('Error updating foundation profile:', err);
      throw err;
    }
  };

  const updateNeeds = async (needs) => {
    try {
      const updated = await profileService.updateFundacionNeeds(needs);
      setFundacionData(prev => ({ ...prev, necesidades_actuales: updated }));
      return updated;
    } catch (err) {
      console.error('Error updating needs:', err);
      throw err;
    }
  };

  const updateSchedule = async (horario, recibeVoluntarios) => {
    try {
      const updated = await profileService.updateFundacionSchedule({ horario, recibeVoluntarios });
      setFundacionData(prev => ({ ...prev, ...updated }));
      return updated;
    } catch (err) {
      console.error('Error updating schedule:', err);
      throw err;
    }
  };

  const uploadCoverImage = async (file) => {
    try {
      const result = await profileService.uploadFundacionCover(file);
      setFundacionData(prev => ({ ...prev, imagen_portada: result.imagen_portada }));
      return result;
    } catch (err) {
      console.error('Error uploading cover:', err);
      throw err;
    }
  };

  const deleteCoverImage = async () => {
    try {
      await profileService.deleteFundacionCover();
      setFundacionData(prev => ({ ...prev, imagen_portada: null }));
    } catch (err) {
      console.error('Error deleting cover:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchFundacionData();
  }, [fetchFundacionData]);

  return {
    fundacionData,
    loading,
    updateGeneralInfo,
    updateNeeds,
    updateSchedule,
    uploadCoverImage,
    deleteCoverImage,
  };
};