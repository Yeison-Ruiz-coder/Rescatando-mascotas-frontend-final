// src/pages/veterinaria/pacientes/Pacientes.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useAuth } from '../../../contexts/AuthContext';
import { useSearchFilter } from '../../../hooks/useSearchFilter';
import { usePagination } from '../../../hooks/usePagination';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import SearchFilter from '../../../components/common/SearchFilter/SearchFilter';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import PacienteCard from '../../../components/veterinaria/PacienteCard/PacienteCard';
import './Pacientes.css';

const Pacientes = () => {
  const { t } = useTranslation('veterinaria');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  const { searchTerm, setSearchTerm, filteredItems } = useSearchFilter(pacientes, ['nombre_mascota', 'especie', 'dueno_nombre']);
  const { currentItems, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(filteredItems, 12);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/veterinaria/pacientes');
      
      let pacientesData = [];
      if (response.data?.success && Array.isArray(response.data.data)) {
        pacientesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        pacientesData = response.data;
      }
      
      setPacientes(pacientesData);
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      toast.error(t('error_carga_pacientes'));
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(t('confirmar_eliminar', { nombre }))) {
      try {
        const response = await api.delete(`/veterinaria/pacientes/${id}`);
        if (response.data.success) {
          toast.success(t('paciente_eliminado', { nombre }));
          cargarPacientes();
        } else {
          toast.error(response.data.message || t('error_eliminar'));
        }
      } catch (error) {
        console.error('Error eliminando paciente:', error);
        toast.error(t('error_eliminar_paciente'));
      }
    }
  };

  const pacientesFiltrados = filteredItems.filter(paciente => {
    if (filter === 'activos' && !paciente.esta_activo) return false;
    if (filter === 'inactivos' && paciente.esta_activo) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="pacientes-page">
        <LoadingSpinner text={t('cargando_pacientes')} />
      </div>
    );
  }

  return (
    <div className="pacientes-page">
      <div className="page-header">
        <div>
          <h1><i className="fas fa-dog"></i> {t('mis_pacientes')}</h1>
          <p className="page-subtitle">{t('gestion_pacientes')}</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/veterinaria/pacientes/nuevo')}>
          <i className="fas fa-plus"></i> {t('registrar_paciente')}
        </button>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={t('buscar_paciente')}
        filters={[
          { id: 'todos', label: t('todos'), count: pacientes.length },
          { id: 'activos', label: t('activos'), count: pacientes.filter(p => p.esta_activo).length },
          { id: 'inactivos', label: t('inactivos'), count: pacientes.filter(p => !p.esta_activo).length }
        ]}
        activeFilter={filter}
        onFilterChange={setFilter}
      />

      {pacientesFiltrados.length === 0 ? (
        <EmptyState
          icon="fas fa-dog"
          title={t('sin_pacientes')}
          description={searchTerm || filter !== 'todos' ? t('sin_resultados') : t('primer_paciente')}
          actionText={t('registrar_primero')}
          onAction={() => navigate('/veterinaria/pacientes/nuevo')}
          onClearFilters={() => {
            setSearchTerm('');
            setFilter('todos');
          }}
          showClearButton={!!searchTerm || filter !== 'todos'}
        />
      ) : (
        <>
          <div className="pacientes-grid">
            {currentItems.map((paciente) => (
              <PacienteCard
                key={paciente.id}
                paciente={paciente}
                onVerDetalle={(id) => navigate(`/veterinaria/pacientes/${id}`)}
                onEditar={(id) => navigate(`/veterinaria/pacientes/editar/${id}`)}
                onEliminar={handleEliminar}
                onVerHistorial={(id) => navigate(`/veterinaria/pacientes/${id}/historial`)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={prevPage} disabled={currentPage === 1}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <span>{t('pagina', { actual: currentPage, total: totalPages })}</span>
              <button onClick={nextPage} disabled={currentPage === totalPages}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Pacientes;