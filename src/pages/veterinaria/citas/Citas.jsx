// src/pages/veterinaria/citas/Citas.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import SearchFilter from '../../../components/common/SearchFilter/SearchFilter';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import CitaCard from '../../../components/veterinaria/CitaCard/CitaCard';
import './Citas.css';

const Citas = () => {
  const { t } = useTranslation('veterinaria');
  const navigate = useNavigate();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/veterinaria/citas');
      
      let citasData = [];
      if (response.data?.success && Array.isArray(response.data.data)) {
        citasData = response.data.data;
      } else if (Array.isArray(response.data)) {
        citasData = response.data;
      }
      
      setCitas(citasData);
    } catch (error) {
      console.error('Error cargando citas:', error);
      toast.error(t('error_carga_citas'));
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await api.put(`/veterinaria/citas/${id}/estado`, { estado: nuevoEstado });
      if (response.data.success) {
        toast.success(t('estado_actualizado'));
        cargarCitas();
      } else {
        toast.error(response.data.message || t('error_actualizar_estado'));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(t('error_actualizar_estado'));
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm(t('confirmar_eliminar_cita'))) {
      try {
        const response = await api.delete(`/veterinaria/citas/${id}`);
        if (response.data.success) {
          toast.success(t('cita_eliminada'));
          cargarCitas();
        } else {
          toast.error(response.data.message || t('error_eliminar'));
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error(t('error_eliminar_cita'));
      }
    }
  };

  const citasFiltradas = citas.filter(cita => {
    if (filter === 'pendientes' && cita.estado !== 'pendiente') return false;
    if (filter === 'confirmadas' && cita.estado !== 'confirmada') return false;
    if (filter === 'completadas' && cita.estado !== 'completada') return false;
    if (filter === 'canceladas' && cita.estado !== 'cancelada') return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (cita.mascota_nombre?.toLowerCase().includes(term)) ||
             (cita.dueno_nombre?.toLowerCase().includes(term)) ||
             (cita.servicio?.toLowerCase().includes(term));
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="citas-page">
        <LoadingSpinner text={t('cargando_citas')} />
      </div>
    );
  }

  return (
    <div className="citas-page">
      <div className="citas-header">
        <div>
          <h1><i className="fas fa-calendar-alt"></i> {t('mis_citas')}</h1>
          <p className="citas-subtitle">{t('gestion_citas')}</p>
        </div>
        <button className="citas-btn-primary" onClick={() => navigate('/veterinaria/citas/nueva')}>
          <i className="fas fa-plus"></i> {t('agendar_cita')}
        </button>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('buscar_cita')}
        filters={[
          { id: 'todas', label: t('todas'), count: citas.length, color: 'primary' },
          { id: 'pendientes', label: t('pendientes'), count: citas.filter(c => c.estado === 'pendiente').length, color: 'warning' },
          { id: 'confirmadas', label: t('confirmadas'), count: citas.filter(c => c.estado === 'confirmada').length, color: 'success' },
          { id: 'completadas', label: t('completadas'), count: citas.filter(c => c.estado === 'completada').length, color: 'info' },
          { id: 'canceladas', label: t('canceladas'), count: citas.filter(c => c.estado === 'cancelada').length, color: 'danger' }
        ]}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {citasFiltradas.length === 0 ? (
        <EmptyState
          icon="fas fa-calendar-day"
          title={t('sin_citas')}
          description={searchTerm || filter !== 'todas' ? t('sin_resultados') : t('primer_cita')}
          actionText={t('agendar_primera')}
          onAction={() => navigate('/veterinaria/citas/nueva')}
          onClearFilters={() => {
            setSearchTerm('');
            setFilter('todas');
          }}
          showClearButton={!!searchTerm || filter !== 'todas'}
        />
      ) : (
        <div className="citas-list">
          {citasFiltradas.map((cita) => (
            <CitaCard
              key={cita.id}
              cita={cita}
              onCambiarEstado={handleCambiarEstado}
              onEliminar={handleEliminar}
              onVerDetalle={(id) => navigate(`/veterinaria/citas/${id}`)}
              onEditar={(id) => navigate(`/veterinaria/citas/editar/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Citas;