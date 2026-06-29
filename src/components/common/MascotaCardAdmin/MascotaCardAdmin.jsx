// src/components/common/MascotaCardAdmin/MascotaCardAdmin.jsx
import React, { memo, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trash2, Eye, Edit, Pencil } from 'lucide-react';
import { getImageUrl as getImageUrlUtil } from '../../../utils/imageUtils';
import './MascotaCardAdmin.css';

const MascotaCardAdmin = memo(({ 
  mascota, 
  getImageUrl: propGetImageUrl,
  onDelete,
  onEdit,
  onVerDetalle,
  showActions = true,
  showFundacion = true,
  tipoUsuario = 'admin'
}) => {
  const { t } = useTranslation(['admin', 'mascotas']);
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const {
    id,
    nombre_mascota,
    descripcion,
    estado,
    foto_principal,
    especie,
    edad_aprox,
    genero,
    fundacion,
    lugar_rescate
  } = mascota || {};

  const getImageUrlSafe = (path) => {
    if (propGetImageUrl && typeof propGetImageUrl === 'function') {
      return propGetImageUrl(path);
    }
    return getImageUrlUtil(path);
  };

  const imageUrl = useMemo(() => {
    if (!foto_principal || imgError) return null;
    try {
      return getImageUrlSafe(foto_principal);
    } catch (error) {
      return null;
    }
  }, [foto_principal, getImageUrlSafe, imgError]);

  const getEstadoConfig = () => {
    const estados = {
      'En adopcion': { 
        class: 'mcf-estado-adopcion', 
        icon: 'fa-heart', 
        label: t('mascotas:en_adopcion', 'En adopción')
      },
      'Adoptado': { 
        class: 'mcf-estado-adoptado', 
        icon: 'fa-check-circle', 
        label: t('mascotas:adoptado', 'Adoptado')
      },
      'Rescatada': { 
        class: 'mcf-estado-rescatada', 
        icon: 'fa-hand-holding-heart', 
        label: t('mascotas:rescatada', 'Rescatada')
      },
      'En acogida': { 
        class: 'mcf-estado-acogida', 
        icon: 'fa-home', 
        label: t('mascotas:en_acogida', 'En acogida')
      }
    };
    return estados[estado] || estados['En adopcion'];
  };

  const estadoConfig = getEstadoConfig();

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(id, nombre_mascota);
    }
  };

  const handleVerDetalle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onVerDetalle) {
      onVerDetalle(id);
    } else {
      navigate(`/${tipoUsuario}/mascotas/${id}`);
    }
  };

  const getEspecieIcon = () => {
    if (!especie) return 'fa-paw';
    const especieLower = especie.toLowerCase();
    if (especieLower.includes('perro') || especieLower.includes('canino')) return 'fa-dog';
    if (especieLower.includes('gato') || especieLower.includes('felino')) return 'fa-cat';
    return 'fa-paw';
  };

  const getSexoIcon = () => {
    if (!genero) return 'fa-genderless';
    const generoLower = genero.toLowerCase();
    if (generoLower.includes('macho') || generoLower === 'm') return 'fa-mars';
    if (generoLower.includes('hembra') || generoLower === 'f') return 'fa-venus';
    return 'fa-genderless';
  };

  const formatEdad = (edad) => {
    if (!edad && edad !== 0) return null;
    const edadNum = parseFloat(edad);
    if (isNaN(edadNum)) return null;
    
    if (edadNum < 1) {
      const meses = Math.round(edadNum * 12);
      return `${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }
    if (Number.isInteger(edadNum)) {
      return `${edadNum} ${edadNum === 1 ? 'año' : 'años'}`;
    }
    return `${edadNum.toFixed(1)} años`;
  };

  const edadFormateada = formatEdad(edad_aprox);

  return (
    <div className="mascota-card-admin">
      <div className="mcf-image">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={nombre_mascota || 'Mascota'} 
            loading="lazy" 
            onError={() => setImgError(true)} 
          />
        ) : (
          <div className="mcf-placeholder">
            <i className="fas fa-paw"></i>
          </div>
        )}
        
        {/* Badge de estado */}
        <div className={`mcf-estado-badge ${estadoConfig.class}`}>
          <i className={`fas ${estadoConfig.icon}`}></i>
          <span>{estadoConfig.label}</span>
        </div>

        {/* Nombre sobre la imagen */}
        <h3 className="mcf-titulo">{nombre_mascota || 'Sin nombre'}</h3>
      </div>

      {/* Contenido */}
      <div className="mcf-content">
        {/* Mostrar fundación si está disponible */}
        {showFundacion && fundacion && (
          <div className="mcf-fundacion">
            <i className="fas fa-building"></i>
            <span>{fundacion.nombre || fundacion.Nombre_1 || 'Fundación'}</span>
          </div>
        )}

        {descripcion && (
          <p className="mcf-descripcion">
            {descripcion.length > 80 ? descripcion.substring(0, 80) + '...' : descripcion}
          </p>
        )}

        <div className="mcf-info-grid">
          {especie && (
            <div className="mcf-info-item">
              <i className={`fas ${getEspecieIcon()}`}></i>
              <span>{especie}</span>
            </div>
          )}
          {genero && (
            <div className="mcf-info-item">
              <i className={`fas ${getSexoIcon()}`}></i>
              <span>{genero}</span>
            </div>
          )}
          {edadFormateada && (
            <div className="mcf-info-item">
              <i className="fas fa-calendar-alt"></i>
              <span>{edadFormateada}</span>
            </div>
          )}
          {lugar_rescate && (
            <div className="mcf-info-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>{lugar_rescate}</span>
            </div>
          )}
        </div>

        {/* Acciones para ADMIN */}
        {showActions && (
          <div className="mcf-actions">
            <button 
              onClick={handleVerDetalle}
              className="mcf-btn mcf-btn-ver"
              title={t('admin:ver_detalle', 'Ver detalle')}
            >
              <Eye size={16} />
              <span>{t('admin:ver', 'Ver')}</span>
            </button>
            
            {/* Admin NO tiene editar */}
            
            <button 
              className="mcf-btn mcf-btn-eliminar"
              onClick={handleDeleteClick}
              title={t('admin:eliminar', 'Eliminar')}
            >
              <Trash2 size={16} />
              <span>{t('admin:eliminar', 'Eliminar')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

MascotaCardAdmin.displayName = 'MascotaCardAdmin';

export default MascotaCardAdmin;