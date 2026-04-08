// src/components/fundacion/MascotaCardFundacion/MascotaCardFundacion.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import './MascotaCardFundacion.css';

const MascotaCardFundacion = ({ 
  mascota, 
  onEstadoChange, 
  onEliminar,
  onVerDetalle,
  onEditar 
}) => {
  const { t } = useTranslation(['fundacion', 'common']);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  
  const { 
    id, 
    nombre_mascota, 
    descripcion, 
    especie, 
    genero, 
    edad_aprox, 
    estado,
    foto_principal,
    raza,
    lugar_rescate,
    created_at
  } = mascota;

  const formatEdad = (edad) => {
  if (!edad) return '?';
  const anios = parseInt(edad);
  return `${anios} ${anios === 1 ? 'año' : 'años'}`;
};

  const formatFecha = (fecha) => {
    if (!fecha) return t('fecha_no_disponible', { defaultValue: 'Fecha no disponible' });
    return new Date(fecha).toLocaleDateString(t('locale', { defaultValue: 'es-ES' }), {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getEstadoConfig = (estadoActual) => {
    const estados = {
      'En adopcion': { 
        class: 'estado-adopcion', 
        icon: 'fa-heart', 
        label: t('estado_en_adopcion', { defaultValue: 'En adopción' }),
        color: '#4CAF50'
      },
      'Adoptado': { 
        class: 'estado-adoptado', 
        icon: 'fa-check-circle', 
        label: t('estado_adoptado', { defaultValue: 'Adoptado' }),
        color: '#9E9E9E'
      },
      'Rescatada': { 
        class: 'estado-rescatada', 
        icon: 'fa-hand-holding-heart', 
        label: t('estado_rescatada', { defaultValue: 'Rescatada' }),
        color: '#FF9800'
      },
      'En acogida': { 
        class: 'estado-acogida', 
        icon: 'fa-home', 
        label: t('estado_en_acogida', { defaultValue: 'En acogida' }),
        color: '#2196F3'
      }
    };
    return estados[estadoActual] || estados['En adopcion'];
  };

  const estadoConfig = getEstadoConfig(estado);

  const handleEstadoChange = async (nuevoEstado) => {
    if (cambiandoEstado) return;
    setCambiandoEstado(true);
    try {
      await onEstadoChange(id, nuevoEstado);
      toast.success(t('estado_actualizado_exito', { 
        estado: getEstadoConfig(nuevoEstado).label,
        defaultValue: `Estado actualizado a ${getEstadoConfig(nuevoEstado).label}`
      }));
    } catch (error) {
      toast.error(t('error_actualizar_estado', { defaultValue: 'Error al actualizar el estado' }));
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleEliminar = async () => {
    const confirmMessage = t('confirmar_eliminar', { 
      nombre: nombre_mascota,
      defaultValue: `¿Estás seguro de que deseas eliminar a ${nombre_mascota}? Esta acción no se puede deshacer.`
    });
    
    if (window.confirm(confirmMessage)) {
      setEliminando(true);
      try {
        await onEliminar(id, nombre_mascota);
        toast.success(t('mascota_eliminada_exito', { 
          nombre: nombre_mascota,
          defaultValue: `${nombre_mascota} ha sido eliminado(a)`
        }));
      } catch (error) {
        toast.error(t('error_eliminar_mascota', { defaultValue: 'Error al eliminar la mascota' }));
      } finally {
        setEliminando(false);
      }
    }
  };

  return (
    <div className="mascota-card-fundacion">
      {/* Badge de estado */}
      <div className={`estado-badge-fundacion ${estadoConfig.class}`}>
        <i className={`fas ${estadoConfig.icon}`}></i>
        <span>{estadoConfig.label}</span>
      </div>

      {/* Imagen */}
      <div className="card-image-fundacion">
        {foto_principal ? (
          <img 
            src={`http://localhost:8000/storage/${foto_principal}`}
            alt={nombre_mascota}
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x300?text=Sin+Imagen';
            }}
          />
        ) : (
          <div className="image-placeholder-fundacion">
            <i className="fas fa-paw fa-4x"></i>
            <span>{t('sin_imagen', { defaultValue: 'Sin imagen' })}</span>
          </div>
        )}
        
        {/* Overlay con acciones rápidas */}
        <div className="image-overlay-fundacion">
          <button 
            onClick={() => onVerDetalle?.(id)}
            className="overlay-btn"
            title={t('ver_detalles', { defaultValue: 'Ver detalles' })}
          >
            <i className="fas fa-eye"></i>
          </button>
          <button 
            onClick={() => onEditar?.(id)}
            className="overlay-btn"
            title={t('editar', { defaultValue: 'Editar' })}
          >
            <i className="fas fa-edit"></i>
          </button>
          <button 
            onClick={handleEliminar}
            className="overlay-btn delete"
            title={t('eliminar', { defaultValue: 'Eliminar' })}
            disabled={eliminando}
          >
            {eliminando ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-trash"></i>}
          </button>
        </div>
      </div>

      {/* Contenido */}
      <div className="card-content-fundacion">
        <div className="card-header-fundacion">
          <h3 className="card-title-fundacion">{nombre_mascota}</h3>
          <div className="card-id-fundacion">{t('id_label', { defaultValue: 'ID' })}: #{id}</div>
        </div>

        <div className="card-details-fundacion">
          <div className="detail-item">
            <i className="fas fa-tag"></i>
            <span className="detail-label">{t('especie_label', { defaultValue: 'Especie' })}:</span>
            <span className="detail-value">{especie || t('no_especificada', { defaultValue: 'No especificada' })}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-paw"></i>
            <span className="detail-label">{t('raza_label', { defaultValue: 'Raza' })}:</span>
            <span className="detail-value">{raza || t('mixto', { defaultValue: 'Mixto' })}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-calendar"></i>
            <span className="detail-label">{t('edad_label', { defaultValue: 'Edad' })}:</span>
            <span className="detail-value">{formatEdad(edad_aprox)}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-venus-mars"></i>
            <span className="detail-label">{t('genero_label', { defaultValue: 'Género' })}:</span>
            <span className="detail-value">
              {genero === 'Macho' ? t('macho', { defaultValue: 'Macho' }) : 
               genero === 'Hembra' ? t('hembra', { defaultValue: 'Hembra' }) : 
               t('no_especificado', { defaultValue: 'No especificado' })}
            </span>
          </div>
          {lugar_rescate && (
            <div className="detail-item">
              <i className="fas fa-map-marker-alt"></i>
              <span className="detail-label">{t('lugar_rescate_label', { defaultValue: 'Rescate' })}:</span>
              <span className="detail-value">{lugar_rescate}</span>
            </div>
          )}
          <div className="detail-item">
            <i className="fas fa-clock"></i>
            <span className="detail-label">{t('registrado_label', { defaultValue: 'Registrado' })}:</span>
            <span className="detail-value">{formatFecha(created_at)}</span>
          </div>
        </div>

        <p className="card-description-fundacion">
          {descripcion || t('sin_descripcion', { defaultValue: 'Sin descripción disponible' })}
        </p>

        {/* Selector de estado */}
        <div className="estado-selector-fundacion">
          <label>
            <i className="fas fa-tag"></i> {t('cambiar_estado_label', { defaultValue: 'Cambiar estado' })}:
          </label>
          <select 
            value={estado}
            onChange={(e) => handleEstadoChange(e.target.value)}
            className="estado-select-fundacion"
            disabled={cambiandoEstado}
            style={{ borderColor: estadoConfig.color }}
          >
            <option value="En adopcion">🐾 {t('estado_en_adopcion', { defaultValue: 'En adopción' })}</option>
            <option value="Rescatada">🆘 {t('estado_rescatada', { defaultValue: 'Rescatada' })}</option>
            <option value="En acogida">🏠 {t('estado_en_acogida', { defaultValue: 'En acogida' })}</option>
            <option value="Adoptado">❤️ {t('estado_adoptado', { defaultValue: 'Adoptado' })}</option>
          </select>
          {cambiandoEstado && (
            <span className="estado-loading">
              <i className="fas fa-spinner fa-spin"></i>
            </span>
          )}
        </div>

        {/* Botones de acción */}
        <div className="card-actions-fundacion">
          <Link to={`/fundacion/mascotas/${id}`} className="action-btn-fundacion view">
            <i className="fas fa-eye"></i>
            <span>{t('ver_detalles', { defaultValue: 'Ver detalles' })}</span>
          </Link>
          <Link to={`/fundacion/mascotas/editar/${id}`} className="action-btn-fundacion edit">
            <i className="fas fa-edit"></i>
            <span>{t('editar', { defaultValue: 'Editar' })}</span>
          </Link>
          <button onClick={handleEliminar} className="action-btn-fundacion delete" disabled={eliminando}>
            <i className={eliminando ? "fas fa-spinner fa-spin" : "fas fa-trash"}></i>
            <span>{eliminando ? t('eliminando', { defaultValue: 'Eliminando...' }) : t('eliminar', { defaultValue: 'Eliminar' })}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MascotaCardFundacion;