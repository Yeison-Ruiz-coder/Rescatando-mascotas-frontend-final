// src/hooks/useSuscripciones.js
import { useState, useEffect, useCallback } from 'react';
import { suscripcionService } from '../services/suscripcionService';
import { toast } from 'react-toastify';

export const useSuscripciones = () => {
  const [loading, setLoading] = useState(false);
  const [suscripciones, setSuscripciones] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    activas: 0,
    pendientes: 0,
    montoTotal: 0,
  });

  const cargarSuscripciones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await suscripcionService.getMisSuscripciones();
      setSuscripciones(data);
      
      // Calcular estadísticas
      const activas = data.filter(s => s.estado === 'activo').length;
      const pendientes = data.filter(s => s.estado === 'pendiente').length;
      const montoTotal = data.reduce((sum, s) => sum + parseFloat(s.monto_mensual || 0), 0);
      
      setStats({
        total: data.length,
        activas,
        pendientes,
        montoTotal,
      });
    } catch (error) {
      toast.error('Error al cargar suscripciones');
    } finally {
      setLoading(false);
    }
  }, []);

  const crearSuscripcion = useCallback(async (data) => {
    setLoading(true);
    try {
      const result = await suscripcionService.crearSuscripcion(data);
      toast.success('¡Suscripción creada! Completa el pago para activarla.');
      return result;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear la suscripción');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelarSuscripcion = useCallback(async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta suscripción?')) return;
    
    setLoading(true);
    try {
      await suscripcionService.cancelarSuscripcion(id);
      toast.success('Suscripción cancelada');
      await cargarSuscripciones();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cancelar');
    } finally {
      setLoading(false);
    }
  }, [cargarSuscripciones]);

  const pausarSuscripcion = useCallback(async (id) => {
    setLoading(true);
    try {
      await suscripcionService.pausarSuscripcion(id);
      toast.success('Suscripción pausada');
      await cargarSuscripciones();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al pausar');
    } finally {
      setLoading(false);
    }
  }, [cargarSuscripciones]);

  const reactivarSuscripcion = useCallback(async (id) => {
    setLoading(true);
    try {
      await suscripcionService.reactivarSuscripcion(id);
      toast.success('Suscripción reactivada');
      await cargarSuscripciones();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al reactivar');
    } finally {
      setLoading(false);
    }
  }, [cargarSuscripciones]);

  useEffect(() => {
    cargarSuscripciones();
  }, [cargarSuscripciones]);

  return {
    loading,
    suscripciones,
    stats,
    cargarSuscripciones,
    crearSuscripcion,
    cancelarSuscripcion,
    pausarSuscripcion,
    reactivarSuscripcion,
  };
};