// src/pages/fundacion/mascotas/Mascotas.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { useFiltros } from '../../../contexts/FiltrosContext';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import MascotaCardFundacion from '../../../components/common/MascotaCardFundacion/MascotaCardFundacion';
import FiltrosMascotas from '../../../components/common/FiltrosMascotas/FiltrosMascotas';
import './Mascotas.css';

const Mascotas = () => {
  const { t } = useTranslation('fundacion');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { filtros } = useFiltros();
  const [mascotas, setMascotas] = useState([]);
  const [mascotasFiltradas, setMascotasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const especies = ["Perro", "Gato", "Conejo", "Ave", "Otro"];

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  useEffect(() => {
    cargarMascotas();
  }, []);

  useEffect(() => {
    if (mascotas.length > 0) {
      let resultado = [...mascotas];

      if (filtros.busqueda && filtros.busqueda.trim()) {
        const busquedaLower = filtros.busqueda.toLowerCase().trim();
        resultado = resultado.filter((m) =>
          m.nombre_mascota?.toLowerCase().includes(busquedaLower) ||
          m.especie?.toLowerCase().includes(busquedaLower) ||
          m.raza?.toLowerCase().includes(busquedaLower)
        );
      }

      if (filtros.especie && filtros.especie.trim()) {
        resultado = resultado.filter((m) =>
          m.especie?.toLowerCase() === filtros.especie.toLowerCase()
        );
      }

      if (filtros.genero && filtros.genero.trim()) {
        resultado = resultado.filter((m) =>
          m.genero?.toLowerCase() === filtros.genero.toLowerCase()
        );
      }

      setMascotasFiltradas(resultado);
    }
  }, [filtros, mascotas]);

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
        toast.error(t('error_permisos'));
      } else if (error.response?.status === 401) {
        toast.error(t('error_sesion'));
      } else {
        toast.error(t('error_carga_mascotas'));
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
        toast.success(t('mascota_eliminada_exito', { nombre }));
        cargarMascotas();
      } else {
        toast.error(response.data.message || t('error_eliminar'));
      }
    } catch (error) {
      console.error('Error eliminando mascota:', error);
      toast.error(t('error_eliminar_mascota'));
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    try {
      const response = await api.put(`/entity/mascotas/${id}`, {
        estado: nuevoEstado
      });
      
      if (response.data.success) {
        const estadoTexto = nuevoEstado === 'En adopcion' ? t('estado_en_adopcion') :
                           nuevoEstado === 'Adoptado' ? t('estado_adoptado') :
                           nuevoEstado === 'Rescatada' ? t('estado_rescatada') :
                           t('estado_en_acogida');
        
        toast.success(t('estado_actualizado_exito', { estado: estadoTexto }));
        cargarMascotas();
      } else {
        toast.error(response.data.message || t('error_actualizar_estado'));
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error(t('error_actualizar_estado'));
    }
  };

  if (loading) {
    return (
      <div className="mascotas-list-page">
        <div className="loading-container">
          <LoadingSpinner text={t('cargando_mascotas')} />
        </div>
      </div>
    );
  }

  return (
    <div className="mascotas-list-page">
      <div className="mascotas-header">
        <div className="container">
          <h1>
            <i className="fas fa-paw"></i> 
            {t('mis_mascotas')}
          </h1>
          <p className="subtitle">
            {t('gestion_mascotas')}
          </p>
          {mascotas.length > 0 && (
            <p className="info">
              <i className="fas fa-heart" style={{ color: "var(--color-heart)" }}></i>
              {t('mensaje_bienvenida', { total: mascotas.length })}
            </p>
          )}
        </div>
      </div>

      <div className="filtros-section sticky-glass glass-auto shadow-sticky">
        <div className="container">
          <FiltrosMascotas
            especies={especies}
            variant={isMobile ? "modal" : "inline"}
          />
        </div>
      </div>

      <div className="resultados-section">
        <div className="container">
          <div className="resultados-header">
            <div className="resultados-count">
              <i className="fas fa-list"></i> {t('mostrando')} <strong>{mascotasFiltradas.length}</strong> {t('de')} <strong>{mascotas.length}</strong> {t('mascotas')}
            </div>
            <Link to="/fundacion/mascotas/nueva" className="btn-primary">
              <i className="fas fa-plus"></i> 
              {t('agregar_mascota')}
            </Link>
          </div>

          {mascotasFiltradas.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-search"></i>
              <h3>{t('sin_mascotas')}</h3>
              <p>
                {filtros.busqueda || filtros.especie || filtros.genero
                  ? t('sin_resultados_filtros')
                  : t('primer_mascota')}
              </p>
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
      </div>
    </div>
  );
};

export default Mascotas;