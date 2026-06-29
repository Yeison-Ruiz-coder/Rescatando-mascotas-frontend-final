// src/components/common/MascotaCardFundacion/MascotaCardFundacion.jsx
import React, { memo, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Edit, Trash2, Eye } from 'lucide-react';
import { getImageUrl as getImageUrlUtil } from '../../../utils/imageUtils';
import './MascotaCardFundacion.css';

const MascotaCardFundacion = memo(({ 
  mascota, 
  getImageUrl: propGetImageUrl,
  onDelete,
  onEdit,
  showActions = true
}) => {
  const { t } = useTranslation('fundacion');
  const [imgError, setImgError] = useState(false);

  const {
    id,
    nombre_mascota,
    descripcion,
    estado,
    foto_principal,
    especie,
    edad,
    sexo
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
        label: t('estado_adopcion', 'En adopción')
      },
      'Adoptado': { 
        class: 'mcf-estado-adoptado', 
        icon: 'fa-check-circle', 
        label: t('estado_adoptado', 'Adoptado')
      },
      'Rescatada': { 
        class: 'mcf-estado-rescatada', 
        icon: 'fa-hand-holding-heart', 
        label: t('estado_rescatada', 'Rescatada')
      },
      'En acogida': { 
        class: 'mcf-estado-acogida', 
        icon: 'fa-home', 
        label: t('estado_acogida', 'En acogida')
      }
    };
    return estados[estado] || estados['En adopcion'];
  };

  const estadoConfig = getEstadoConfig();

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(id);
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit(id);
  };

  const getEspecieIcon = () => {
    if (!especie) return 'fa-paw';
    const especieLower = especie.toLowerCase();
    if (especieLower.includes('perro') || especieLower.includes('canino')) return 'fa-dog';
    if (especieLower.includes('gato') || especieLower.includes('felino')) return 'fa-cat';
    return 'fa-paw';
  };

  const getSexoIcon = () => {
    if (!sexo) return 'fa-genderless';
    const sexoLower = sexo.toLowerCase();
    if (sexoLower.includes('macho') || sexoLower === 'm') return 'fa-mars';
    if (sexoLower.includes('hembra') || sexoLower === 'f') return 'fa-venus';
    return 'fa-genderless';
  };

  return (
    <div className="mascota-card-fundacion">
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

        {/* Nombre - ahora sobre la imagen como en eventos */}
        <h3 className="mcf-titulo">{nombre_mascota || 'Sin nombre'}</h3>
      </div>

      {/* Contenido */}
      <div className="mcf-content">
        {descripcion && (
          <p className="mcf-descripcion">
            {descripcion.length > 100 ? descripcion.substring(0, 100) + '...' : descripcion}
          </p>
        )}

        <div className="mcf-info-grid">
          {especie && (
            <div className="mcf-info-item">
              <i className={`fas ${getEspecieIcon()}`}></i>
              <span>{especie}</span>
            </div>
          )}
          {sexo && (
            <div className="mcf-info-item">
              <i className={`fas ${getSexoIcon()}`}></i>
              <span>{sexo}</span>
            </div>
          )}
          {edad && (
            <div className="mcf-info-item">
              <i className="fas fa-calendar-alt"></i>
              <span>{edad} {parseInt(edad) > 1 ? 'años' : 'año'}</span>
            </div>
          )}
        </div>

        {/* Acciones - igual que eventos */}
        {showActions && (
          <div className="mcf-actions">
            <Link 
              to={`/fundacion/mascotas/${id}`} 
              className="mcf-btn mcf-btn-ver"
              title={t('ver_detalle', 'Ver detalle')}
            >
              <Eye size={16} />
              <span>{t('ver', 'Ver')}</span>
            </Link>
            <Link 
              to={`/fundacion/mascotas/editar/${id}`} 
              className="mcf-btn mcf-btn-editar"
              title={t('editar', 'Editar')}
              onClick={(e) => {
                if (onEdit) {
                  e.preventDefault();
                  handleEditClick(e);
                }
              }}
            >
              <Edit size={16} />
              <span>{t('editar', 'Editar')}</span>
            </Link>
            <button 
              className="mcf-btn mcf-btn-eliminar"
              onClick={handleDeleteClick}
              title={t('eliminar', 'Eliminar')}
            >
              <Trash2 size={16} />
              <span>{t('eliminar', 'Eliminar')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

MascotaCardFundacion.displayName = 'MascotaCardFundacion';

export default MascotaCardFundacion;