import { useState, useEffect, useCallback } from 'react';
import adminService from '../services/adminService';
import { toast } from 'react-toastify';

export const useAdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    tipo: '',
    estado: '',
    page: 1
  });

  const fetchUsuarios = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsuarios(filters);
      setUsuarios(response.data || []);
      setPagination(response.meta || {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
      });
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      toast.error(error.response?.data?.message || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleDelete = async (id, nombre) => {
    try {
      await adminService.deleteUsuario(id);
      toast.success(`Usuario ${nombre} eliminado correctamente`);
      fetchUsuarios();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
      return false;
    }
  };

  const handleChangeEstado = async (id, estado) => {
    try {
      await adminService.cambiarEstadoUsuario(id, estado);
      toast.success('Estado actualizado correctamente');
      fetchUsuarios();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al cambiar estado');
      return false;
    }
  };

  const handleVerifyEmail = async (id) => {
    try {
      await adminService.verificarEmailUsuario(id);
      toast.success('Email verificado correctamente');
      fetchUsuarios();
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al verificar email');
      return false;
    }
  };

  return {
    usuarios,
    loading,
    pagination,
    filters,
    handleFilterChange,
    handlePageChange,
    handleDelete,
    handleChangeEstado,
    handleVerifyEmail,
    fetchUsuarios
  };
};