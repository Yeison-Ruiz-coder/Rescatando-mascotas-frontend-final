// src/components/common/MascotaCardFundacion/MascotaCardFundacion.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../../utils/imageUtils';
import './MascotaCardFundacion.css';

const MascotaCardFundacion = ({ 
  mascota, 
  onEliminar,
  getImageUrl: propGetImageUrl
}) => {
  const { t } = useTranslation(['mascotas', 'fundacion']);
  const [eliminando, setEliminando] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const { 
    id, 
    nombre_mascota, 
    descripcion, 
    estado,
    foto_principal
  } = mascota;

  const getImageUrlSafe = (path) => {
    if (propGetImageUrl && typeof propGetImageUrl === 'function') {
      return propGetImageUrl(path);
    }
    return getImageUrl(path);
  };

  const getEstadoConfig = (estadoActual) => {
    const estados = {
      'En adopcion': { 
        class: 'estado-adopcion', 
        icon: 'fa-heart', 
        label: t('mascotas:en_adopcion')
      },
      'Adoptado': { 
        class: 'estado-adoptado', 
        icon: 'fa-check-circle', 
        label: t('mascotas:adoptado')
      },
      'Rescatada': { 
        class: 'estado-rescatada', 
        icon: 'fa-hand-holding-heart', 
        label: t('mascotas:rescatada')
      },
      'En acogida': { 
        class: 'estado-acogida', 
        icon: 'fa-home', 
        label: t('mascotas:en_acogida')
      }
    };
    return estados[estadoActual] || estados['En adopcion'];
  };

  const estadoConfig = getEstadoConfig(estado);

  const handleEliminar = async (e) => {
    e.stopPropagation();
    if (eliminando || !onEliminar) return;
    
    const confirmacion = window.confirm(
      t('fundacion:confirmar_eliminar', { nombre: nombre_mascota })
    );
    
    if (!confirmacion) return;
    
    setEliminando(true);
    try {
      await onEliminar(id, nombre_mascota);
    } catch (error) {
      console.error('Error al eliminar:', error);
      toast.error(t('fundacion:error_eliminar'));
    } finally {
      setEliminando(false);
    }
  };

  const imageUrl = getImageUrlSafe(foto_principal);

  return (
    <div className="mascota-card-fundacion">
      {/* Imagen */}
      {imageUrl && !imgError ? (
        <img 
          src={imageUrl}
          alt={nombre_mascota}
          className="card-image-fundacion"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="card-image-placeholder-fundacion">
          <span>🐾</span>
        </div>
      )}

      {/* Badge de estado - SOLO ESTO QUEDA */}
      <div className={`estado-badge-fundacion ${estadoConfig.class}`}>
        <i className={`fas ${estadoConfig.icon}`}></i>
        <span>{estadoConfig.label}</span>
      </div>

      {/* Nombre */}
      <h3 className="card-title-fundacion">{nombre_mascota}</h3>

      {/* ID - Opcional, solo en hover */}
      <span className="card-id-fundacion">#{id}</span>

      {/* Overlay siempre visible con acciones */}
      <div className="card-overlay-fundacion">
        {descripcion && (
          <p className="card-overlay-desc">
            {descripcion.length > 80 ? descripcion.substring(0, 80) + '...' : descripcion}
          </p>
        )}
        
        <div className="card-overlay-actions">
          <Link 
            to={`/fundacion/mascotas/${id}`} 
            className="action-btn-fundacion view"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fas fa-eye"></i>
            <span className="btn-text">{t('fundacion:ver')}</span>
          </Link>
          
          <Link 
            to={`/fundacion/mascotas/editar/${id}`} 
            className="action-btn-fundacion edit"
            onClick={(e) => e.stopPropagation()}
          >
            <i className="fas fa-edit"></i>
            <span className="btn-text">{t('fundacion:editar')}</span>
          </Link>
          
          <button 
            onClick={handleEliminar} 
            className="action-btn-fundacion delete" 
            disabled={eliminando}
          >
            <i className={eliminando ? "fas fa-spinner fa-spin" : "fas fa-trash"}></i>
            <span className="btn-text">{eliminando ? t('fundacion:eliminando') : t('fundacion:eliminar')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MascotaCardFundacion;