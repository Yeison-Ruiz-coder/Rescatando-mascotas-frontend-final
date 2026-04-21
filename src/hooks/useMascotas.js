import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import mascotaService from '../services/mascotaService';

// Función para formatear edad sin decimales
const formatEdad = (edad) => {
  if (!edad && edad !== 0) return null;
  
  const edadNum = parseFloat(edad);
  if (isNaN(edadNum)) return null;

  // Redondear al entero más cercano
  const edadRedondeada = Math.round(edadNum);
  
  if (edadRedondeada === 0) return null;
  
  return edadRedondeada;
};

const useMascotas = () => {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ razas: [], vacunas: [] });

  const loadMascotas = async () => {
    try {
      setLoading(true);
      const response = await mascotaService.getMascotas();
      if (response.success) {
        // Limpiar los decimales de la edad en cada mascota
        const mascotasLimpias = response.data.map(mascota => ({
          ...mascota,
          edad_aprox: formatEdad(mascota.edad_aprox)
        }));
        setMascotas(mascotasLimpias);
      }
    } catch (error) {
      toast.error('Error al cargar las mascotas');
    } finally {
      setLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      const response = await mascotaService.getFormData();
      if (response.success) {
        setFormData(response.data);
      }
    } catch (error) {
      toast.error('Error al cargar datos del formulario');
    }
  };

  const createMascota = async (data) => {
    try {
      const response = await mascotaService.createMascota(data);
      if (response.success) {
        toast.success('Mascota creada exitosamente');
        await loadMascotas();
        return true;
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.values(errors).forEach(err => toast.error(err[0]));
      } else {
        toast.error(error.response?.data?.message || 'Error al crear la mascota');
      }
      return false;
    }
  };

  const updateMascota = async (id, data) => {
    try {
      const response = await mascotaService.updateMascota(id, data);
      if (response.success) {
        toast.success('Mascota actualizada exitosamente');
        await loadMascotas();
        return true;
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.values(errors).forEach(err => toast.error(err[0]));
      } else {
        toast.error(error.response?.data?.message || 'Error al actualizar la mascota');
      }
      return false;
    }
  };

  const deleteMascota = async (id) => {
    try {
      const response = await mascotaService.deleteMascota(id);
      if (response.success) {
        toast.success('Mascota eliminada exitosamente');
        await loadMascotas();
        return true;
      }
    } catch (error) {
      toast.error('Error al eliminar la mascota');
      return false;
    }
  };

  useEffect(() => {
    loadMascotas();
    loadFormData();
  }, []);

  return {
    mascotas,
    loading,
    formData,
    createMascota,
    updateMascota,
    deleteMascota,
    loadMascotas,
  };
};

export default useMascotas;