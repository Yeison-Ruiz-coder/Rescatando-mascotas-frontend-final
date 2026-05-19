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

  const getImageUrlSafe = (path) => {
    if (propGetImageUrl && typeof propGetImageUrl === 'function') {
      return propGetImageUrl(path);
    }
    return getImageUrl(path);
  };

  const formatEdad = (edad) => {
    if (!edad && edad !== 0) return '?';
    const edadNum = parseFloat(edad);
    if (isNaN(edadNum)) return '?';
    const edadRedondeada = Math.round(edadNum);
    if (edadRedondeada === 0) return t('mascotas:menos_de_un_año');
    return `${edadRedondeada} ${edadRedondeada === 1 ? t('mascotas:año') : t('mascotas:años')}`;
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

  const handleEstadoChange = async (nuevoEstado) => {
    if (cambiandoEstado) return;
    setCambiandoEstado(true);
    try {
      await onEstadoChange(id, nuevoEstado);
      toast.success(t('fundacion:estado_actualizado_exito', { 
        estado: getEstadoConfig(nuevoEstado).label
      }));
    } catch (error) {
      toast.error(t('fundacion:error_actualizar_estado'));
    } finally {
      setCambiandoEstado(false);
    }
  };

  const handleEliminar = async (e) => {
    e.stopPropagation();
    
    if (eliminando) return;
    
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
      <div className={`estado-badge-fundacion ${estadoConfig.class}`}>
        <i className={`fas ${estadoConfig.icon}`}></i>
        <span>{estadoConfig.label}</span>
      </div>

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
            <span>{t('mascotas:sin_imagen')}</span>
          </div>
        )}
      </div>

      <div className="card-content-fundacion">
        <div className="card-header-fundacion">
          <h3 className="card-title-fundacion">{nombre_mascota}</h3>
        </div>

        <div className="card-details-fundacion">
          <div className="detail-item">
            <i className="fas fa-tag"></i>
            <span className="detail-label">{t('mascotas:especie')}:</span>
            <span className="detail-value">{especie || t('mascotas:no_especificada')}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-calendar"></i>
            <span className="detail-label">{t('mascotas:edad')}:</span>
            <span className="detail-value">{formatEdad(edad_aprox)}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-venus-mars"></i>
            <span className="detail-label">{t('mascotas:genero')}:</span>
            <span className="detail-value">
              {genero === 'Macho' ? t('mascotas:macho') : 
               genero === 'Hembra' ? t('mascotas:hembra') : 
               t('mascotas:no_especificado')}
            </span>
          </div>
          {lugar_rescate && (
            <div className="detail-item">
              <i className="fas fa-map-marker-alt"></i>
              <span className="detail-label">{t('mascotas:lugar_rescate')}:</span>
              <span className="detail-value">{lugar_rescate}</span>
            </div>
          )}
        </div>

        <div className="card-actions-fundacion">
          <Link to={`/fundacion/mascotas/${id}`} className="action-btn-fundacion view">
            <i className="fas fa-eye"></i>
            {t('fundacion:ver_detalles')}
          </Link>
          <Link to={`/fundacion/mascotas/editar/${id}`} className="action-btn-fundacion edit">
            <i className="fas fa-edit"></i>
            {t('fundacion:editar')}
          </Link>
          <button onClick={handleEliminar} className="action-btn-fundacion delete" disabled={eliminando}>
            <i className={eliminando ? "fas fa-spinner fa-spin" : "fas fa-trash"}></i>
            {eliminando ? t('fundacion:eliminando') : t('fundacion:eliminar')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MascotaCardFundacion;