// src/pages/fundacion/mascotas/Mascotas.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import MascotaCardFundacion from '../../../components/common/MascotaCardFundacion/MascotaCardFundacion';
import './Mascotas.css';

const Mascotas = () => {
  const { t } = useTranslation(['fundacion', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    cargarMascotas();
  }, []);

  const cargarMascotas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/entity/mascotas');
      
      let mascotasData = [];
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        mascotasData = response.data.data;
      } else if (Array.isArray(response.data)) {
        mascotasData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        mascotasData = response.data.data;
      } else if (response.data && response.data.mascotas && Array.isArray(response.data.mascotas)) {
        mascotasData = response.data.mascotas;
      }
      
      setMascotas(mascotasData);
      
    } catch (error) {
      console.error('Error cargando mascotas:', error);
      
      if (error.response?.status === 403) {
        toast.error(t('error_permisos', { defaultValue: 'No tienes permisos para ver las mascotas.' }));
      } else if (error.response?.status === 401) {
        toast.error(t('error_sesion', { defaultValue: 'Sesión expirada. Por favor inicia sesión nuevamente.' }));
      } else {
        toast.error(t('error_carga_mascotas', { defaultValue: 'Error al cargar las mascotas' }));
      }
      
      setMascotas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    try {
      const response = await api.delete(`/entity/mascotas/${id}`);
      
      if (response.data.success) {
        toast.success(t('mascota_eliminada_exito', { nombre, defaultValue: `${nombre} ha sido eliminado(a)` }));
        cargarMascotas();
      } else {
        toast.error(response.data.message || t('error_eliminar', { defaultValue: 'Error al eliminar' }));
      }
    } catch (error) {
      console.error('Error eliminando mascota:', error);
      toast.error(t('error_eliminar_mascota', { defaultValue: 'Error al eliminar la mascota' }));
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await api.put(`/entity/mascotas/${id}`, {
        estado: nuevoEstado
      });
      
      if (response.data.success) {
        const estadoTexto = nuevoEstado === 'En adopcion' ? t('estado_en_adopcion', { defaultValue: 'En adopción' }) :
                           nuevoEstado === 'Adoptado' ? t('estado_adoptado', { defaultValue: 'Adoptado' }) :
                           nuevoEstado === 'Rescatada' ? t('estado_rescatada', { defaultValue: 'Rescatada' }) :
                           t('estado_en_acogida', { defaultValue: 'En acogida' });
        
        toast.success(t('estado_actualizado_exito', { estado: estadoTexto, defaultValue: `Estado actualizado a ${estadoTexto}` }));
        cargarMascotas();
      } else {
        toast.error(response.data.message || t('error_actualizar_estado', { defaultValue: 'Error al actualizar estado' }));
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error(t('error_actualizar_estado', { defaultValue: 'Error al actualizar el estado' }));
    }
  };

  const mascotasArray = Array.isArray(mascotas) ? mascotas : [];
  
  const mascotasFiltradas = mascotasArray.filter(mascota => {
    if (filter === 'en_adopcion' && mascota.estado !== 'En adopcion') return false;
    if (filter === 'adoptado' && mascota.estado !== 'Adoptado') return false;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (mascota.nombre_mascota && mascota.nombre_mascota.toLowerCase().includes(term)) ||
             (mascota.especie && mascota.especie.toLowerCase().includes(term)) ||
             (mascota.raza && mascota.raza?.toLowerCase().includes(term));
    }
    
    return true;
  });

  if (loading) {
    return (
      <div className="mascotas-list-page">
        <LoadingSpinner text={t('cargando_mascotas', { defaultValue: 'Cargando mascotas...' })} />
      </div>
    );
  }

  return (
    <div className="mascotas-list-page">
      <div className="page-header">
        <div>
          <h1><i className="fas fa-paw"></i> {t('mis_mascotas', { defaultValue: 'Mis Mascotas' })}</h1>
          <p className="page-subtitle">{t('gestion_mascotas', { defaultValue: 'Gestiona el registro de tus mascotas en adopción' })}</p>
        </div>
        <Link to="/fundacion/mascotas/nueva" className="btn-primary">
          <i className="fas fa-plus"></i> {t('registrar_mascota', { defaultValue: 'Registrar Nueva Mascota' })}
        </Link>
      </div>

      {/* Filtros y búsqueda */}
      <div className="filtros-container">
        <div className="filtros-buttons">
          <button 
            className={`filtro-btn ${filter === 'todos' ? 'active' : ''}`}
            onClick={() => setFilter('todos')}
          >
            {t('todos', { defaultValue: 'Todos' })} ({mascotasArray.length})
          </button>
          <button 
            className={`filtro-btn ${filter === 'en_adopcion' ? 'active' : ''}`}
            onClick={() => setFilter('en_adopcion')}
          >
            {t('estado_en_adopcion', { defaultValue: 'En adopción' })} ({mascotasArray.filter(m => m.estado === 'En adopcion').length})
          </button>
          <button 
            className={`filtro-btn ${filter === 'adoptado' ? 'active' : ''}`}
            onClick={() => setFilter('adoptado')}
          >
            {t('estado_adoptado', { defaultValue: 'Adoptados' })} ({mascotasArray.filter(m => m.estado === 'Adoptado').length})
          </button>
        </div>
        
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder={t('buscar_placeholder', { defaultValue: 'Buscar por nombre, especie o raza...' })}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {mascotasFiltradas.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-dog"></i>
          <h3>{t('sin_mascotas', { defaultValue: 'No hay mascotas para mostrar' })}</h3>
          <p>
            {searchTerm || filter !== 'todos' 
              ? t('sin_resultados_filtros', { defaultValue: 'No se encontraron mascotas con los filtros seleccionados' })
              : t('primer_mascota', { defaultValue: 'Comienza registrando tu primera mascota para encontrarle un hogar' })}
          </p>
          {(searchTerm || filter !== 'todos') && (
            <button 
              className="btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setFilter('todos');
              }}
            >
              <i className="fas fa-eraser"></i> {t('limpiar_filtros', { defaultValue: 'Limpiar filtros' })}
            </button>
          )}
          {!searchTerm && filter === 'todos' && mascotasArray.length === 0 && (
            <Link to="/fundacion/mascotas/nueva" className="btn-primary">
              <i className="fas fa-plus"></i> {t('registrar_primera', { defaultValue: 'Registrar primera mascota' })}
            </Link>
          )}
        </div>
      ) : (
        <div className="mascotas-grid">
          {mascotasFiltradas.map((mascota) => (
            <MascotaCardFundacion
              key={mascota.id}
              mascota={mascota}
              onEstadoChange={handleCambiarEstado}
              onEliminar={handleEliminar}
              onVerDetalle={(id) => navigate(`/fundacion/mascotas/${id}`)}
              onEditar={(id) => navigate(`/fundacion/mascotas/editar/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Mascotas;