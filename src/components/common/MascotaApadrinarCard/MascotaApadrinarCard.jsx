import React from 'react';
import { useTranslation } from 'react-i18next';
import './MascotaApadrinarCard.css';

const MascotaApadrinarCard = ({ 
  mascota, 
  getImageUrl, 
  onApadrinar,
  loading = false 
}) => {
  const { t } = useTranslation(['suscripciones', 'mascotas']);
  
  const {
    id,
    nombre_mascota,
    especie,
    raza,
    edad_aprox,
    genero,
    descripcion,
    estado
  } = mascota;

  const formatEdad = (edad) => {
    if (!edad && edad !== 0) return '?';
    const edadNum = parseFloat(edad);
    if (isNaN(edadNum)) return '?';
    
    if (edadNum < 1) {
      const meses = Math.round(edadNum * 12);
      return `${meses} ${meses === 1 ? (t('mascotas:mes', 'mes')) : (t('mascotas:meses', 'meses'))}`;
    }
    if (Number.isInteger(edadNum)) {
      return `${edadNum} ${edadNum === 1 ? (t('mascotas:año', 'año')) : (t('mascotas:años', 'años'))}`;
    }
    return `${edadNum.toFixed(1)} ${t('mascotas:años', 'años')}`;
  };

  const getEstadoTexto = () => {
    switch (estado) {
      case 'En adopcion':
        return t('mascotas:en_adopcion', 'En adopción');
      case 'Adoptado':
        return t('mascotas:adoptado', 'Adoptado');
      case 'Rescatada':
        return t('mascotas:rescatada', 'Rescatada');
      default:
        return t('suscripciones:necesita_ayuda', 'Necesita ayuda');
    }
  };

  const getEstadoClass = () => {
    switch (estado) {
      case 'En adopcion':
        return 'estado-adopcion';
      case 'Adoptado':
        return 'estado-adoptado';
      case 'Rescatada':
        return 'estado-rescatada';
      default:
        return 'estado-necesita';
    }
  };

  return (
    <div className="mascota-apadrinar-card">
      <div className="card-imagen">
        {getImageUrl(mascota.foto_principal || mascota.fotos?.[0]) ? (
          <img
            src={getImageUrl(mascota.foto_principal || mascota.fotos?.[0])}
            alt={nombre_mascota}
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x300?text=Sin+Imagen';
            }}
          />
        ) : (
          <div className="image-placeholder">
            <i className="fas fa-paw fa-3x"></i>
            <span>{t('mascotas:sin_imagen', 'Sin imagen')}</span>
          </div>
        )}
        
        <div className={`estado-badge ${getEstadoClass()}`}>
          {getEstadoTexto()}
        </div>
      </div>

      <div className="card-info">
        <h3 className="mascota-nombre">{nombre_mascota}</h3>
        
        <div className="mascota-detalles">
          <span className="detalle-item">
            <i className="fas fa-paw"></i> {especie || '?'}
          </span>
          {raza && (
            <span className="detalle-item">
              <i className="fas fa-tag"></i> {raza}
            </span>
          )}
          <span className="detalle-item">
            <i className="fas fa-calendar"></i> {formatEdad(edad_aprox)}
          </span>
          <span className="detalle-item">
            <i className="fas fa-venus-mars"></i> {genero === 'Macho' ? t('mascotas:macho', 'Macho') : genero === 'Hembra' ? t('mascotas:hembra', 'Hembra') : genero || '?'}
          </span>
        </div>

        <p className="mascota-historia">
          {descripcion 
            ? descripcion.substring(0, 100) + (descripcion.length > 100 ? '...' : '')
            : t('mascotas:sin_descripcion', 'Sin descripción disponible')}
        </p>

        <button 
          className="btn-apadrinar"
          onClick={() => onApadrinar(mascota)}
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> {t('common:loading', 'Procesando...')}
            </>
          ) : (
            <>
              <i className="fas fa-heart"></i> {t('suscripciones:apadrinar', 'Apadrinar')} {nombre_mascota}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MascotaApadrinarCard;