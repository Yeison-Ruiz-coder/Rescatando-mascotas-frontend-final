// src/hooks/useUserStats.js
import { useState, useEffect, useCallback } from 'react';
import userStatsService from '../services/userStatsService';

export const useUserStats = () => {
  const [stats, setStats] = useState(null);
  const [adoptions, setAdoptions] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userStatsService.getUserStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdoptions = useCallback(async () => {
    try {
      const data = await userStatsService.getUserAdoptions();
      setAdoptions(data.data || []);
    } catch (err) {
      console.error('Error fetching adoptions:', err);
    }
  }, []);

  const fetchDonations = useCallback(async () => {
    try {
      const data = await userStatsService.getUserDonations();
      setDonations(data.data || []);
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchAdoptions();
    fetchDonations();
  }, [fetchStats, fetchAdoptions, fetchDonations]);

  return {
    stats,
    adoptions,
    donations,
    loading,
    error,
    refetch: fetchStats
  };
};