// src/components/fundacion/MascotaCardFundacion/MascotaCardFundacion.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../../utils/imageUtils';
import './MascotaCardFundacion.css';

const MascotaCardFundacion = ({ 
  mascota, 
  onEstadoChange, 
  onEliminar,
  onVerDetalle,
  onEditar,
  getImageUrl: propGetImageUrl
}) => {
  const { t } = useTranslation(['mascotas', 'fundacion']);
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
    lugar_rescate
  } = mascota;

  // Función unificada para obtener URL de imagen
  const getImageUrlSafe = (path) => {
    if (propGetImageUrl && typeof propGetImageUrl === 'function') {
      return propGetImageUrl(path);
    }
    return getImageUrl(path);
  };

  // Función para formatear edad (sin decimales)
  const formatEdad = (edad) => {
    if (!edad && edad !== 0) return '?';
    const edadNum = parseFloat(edad);
    if (isNaN(edadNum)) return '?';
    const edadRedondeada = Math.round(edadNum);
    if (edadRedondeada === 0) return t('mascotas:menos_de_un_año', 'Menos de 1 año');
    return `${edadRedondeada} ${edadRedondeada === 1 ? t('mascotas:año', 'año') : t('mascotas:años', 'años')}`;
  };

  // Configuración del estado
  const getEstadoConfig = (estadoActual) => {
    const estados = {
      'En adopcion': { 
        class: 'estado-adopcion', 
        icon: 'fa-heart', 
        label: t('mascotas:en_adopcion', 'En adopción')
      },
      'Adoptado': { 
        class: 'estado-adoptado', 
        icon: 'fa-check-circle', 
        label: t('mascotas:adoptado', 'Adoptado')
      },
      'Rescatada': { 
        class: 'estado-rescatada', 
        icon: 'fa-hand-holding-heart', 
        label: t('mascotas:rescatada', 'Rescatada')
      },
      'En acogida': { 
        class: 'estado-acogida', 
        icon: 'fa-home', 
        label: t('mascotas:en_acogida', 'En acogida')
      }
    };
    return estados[estadoActual] || estados['En adopcion'];
  };

  const estadoConfig = getEstadoConfig(estado);

  // ✅ Manejador de cambio de estado (con toast aquí está bien porque es específico de esta acción)
  const handleEstadoChange = async (nuevoEstado) => {
    if (cambiandoEstado) return;
    setCambiandoEstado(true);
    try {
      await onEstadoChange(id, nuevoEstado);
      // ✅ Este toast está bien porque es una acción independiente
      toast.success(t('fundacion:estado_actualizado_exito', { 
        estado: getEstadoConfig(nuevoEstado).label,
        defaultValue: `Estado actualizado a ${getEstadoConfig(nuevoEstado).label}`
      }));
    } catch (error) {
      toast.error(t('fundacion:error_actualizar_estado', 'Error al actualizar el estado'));
    } finally {
      setCambiandoEstado(false);
    }
  };

  // ✅ CORREGIDO: Manejador de eliminación SIN toast de éxito
  const handleEliminar = async (e) => {
    e.stopPropagation();
    
    if (eliminando) return;
    
    const confirmacion = window.confirm(
      t('fundacion:confirmar_eliminar', { 
        nombre: nombre_mascota,
        defaultValue: `¿Estás seguro de que quieres eliminar a ${nombre_mascota}? Esta acción no se puede deshacer.`
      })
    );
    
    if (!confirmacion) return;
    
    setEliminando(true);
    try {
      // ✅ Llamar a onEliminar sin mostrar toast aquí
      // El toast de éxito lo mostrará el componente padre (Mascotas.jsx)
      await onEliminar(id, nombre_mascota);
      // ❌ NO mostrar toast de éxito aquí para evitar duplicados
    } catch (error) {
      // ✅ Solo mostrar errores aquí
      console.error('Error al eliminar:', error);
      toast.error(
        t('fundacion:error_eliminar', { 
          defaultValue: 'Error al eliminar la mascota' 
        })
      );
    } finally {
      setEliminando(false);
    }
  };

  // Obtener URL de imagen
  const imageUrl = getImageUrlSafe(foto_principal);

  return (
    <div className="mascota-card-fundacion">
      {/* Badge de estado */}
      <div className={`estado-badge-fundacion ${estadoConfig.class}`}>
        <i className={`fas ${estadoConfig.icon}`}></i>
        <span>{estadoConfig.label}</span>
      </div>

      {/* Imagen */}
      <div className="card-image-fundacion">
        {imageUrl ? (
          <img 
            src={imageUrl}
            alt={nombre_mascota}
            onError={(e) => {
              console.error('Error cargando imagen:', imageUrl);
              e.target.src = 'https://placehold.co/400x300?text=Sin+Imagen';
            }}
          />
        ) : (
          <div className="image-placeholder-fundacion">
            <i className="fas fa-paw"></i>
            <span>{t('mascotas:sin_imagen', 'Sin imagen')}</span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="card-content-fundacion">
        <div className="card-header-fundacion">
          <h3 className="card-title-fundacion">{nombre_mascota}</h3>
        
        </div>

        {/* Detalles básicos */}
        <div className="card-details-fundacion">
          <div className="detail-item">
            <i className="fas fa-tag"></i>
            <span className="detail-label">{t('mascotas:especie', 'Especie')}:</span>
            <span className="detail-value">{especie || t('mascotas:no_especificada', 'No especificada')}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-calendar"></i>
            <span className="detail-label">{t('mascotas:edad', 'Edad')}:</span>
            <span className="detail-value">{formatEdad(edad_aprox)}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-venus-mars"></i>
            <span className="detail-label">{t('mascotas:genero', 'Género')}:</span>
            <span className="detail-value">
              {genero === 'Macho' ? t('mascotas:macho', 'Macho') : 
               genero === 'Hembra' ? t('mascotas:hembra', 'Hembra') : 
               t('mascotas:no_especificado', 'No especificado')}
            </span>
          </div>
          {lugar_rescate && (
            <div className="detail-item">
              <i className="fas fa-map-marker-alt"></i>
              <span className="detail-label">{t('mascotas:lugar_rescate', 'Rescate')}:</span>
              <span className="detail-value">{lugar_rescate}</span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="card-actions-fundacion">
          <Link to={`/fundacion/mascotas/${id}`} className="action-btn-fundacion view">
            <i className="fas fa-eye"></i>
            {t('fundacion:ver_detalles', 'Ver')}
          </Link>
          <Link to={`/fundacion/mascotas/editar/${id}`} className="action-btn-fundacion edit">
            <i className="fas fa-edit"></i>
            {t('fundacion:editar', 'Editar')}
          </Link>
          <button onClick={handleEliminar} className="action-btn-fundacion delete" disabled={eliminando}>
            <i className={eliminando ? "fas fa-spinner fa-spin" : "fas fa-trash"}></i>
            {eliminando ? t('fundacion:eliminando', '...') : t('fundacion:eliminar', 'Eliminar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MascotaCardFundacion;