// src/pages/public/SolicitarAdopcion/components/TarjetaMascotaInfo.jsx
import React, { useState, useMemo, useCallback } from 'react';

const TarjetaMascotaInfo = ({ mascota, getImageUrl, t }) => {
  const [imagenActual, setImagenActual] = useState(0);

  // Obtener todas las imágenes de la mascota (memorizado)
  const images = useMemo(() => {
    const imagenes = [];
    
    // Foto principal
    if (mascota?.foto_principal) {
      imagenes.push(getImageUrl(mascota.foto_principal));
    }
    
    // Galería de fotos
    if (mascota?.galeria_fotos) {
      try {
        let galeria = mascota.galeria_fotos;
        if (typeof galeria === 'string') {
          galeria = JSON.parse(galeria);
        }
        if (Array.isArray(galeria)) {
          galeria.forEach((foto) => {
            if (foto) imagenes.push(getImageUrl(foto));
          });
        }
      } catch (e) {
        console.error('Error parsing galeria:', e);
      }
    }
    
    return imagenes;
  }, [mascota, getImageUrl]);

  const tieneGaleria = images.length > 1;

  const cambiarImagen = useCallback((index) => {
    setImagenActual(index);
  }, []);

  // Función para optimizar imágenes en Cloudinary
  const getOptimizedImageUrl = (path, width, height) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `https://res.cloudinary.com/dixyebg5i/image/upload/w_${width},h_${height},c_fill,q_auto,f_auto/${path.replace(/^.*?\/upload\//, '')}`;
  };

  return (
    <div className="collage-card mascota-info-card">
      {/* Sticker decorativo */}
      <div className="collage-sticker sticker-top-right">
        <span className="collage-sticker-icon">⭐</span>
        <span>¡Adóptame!</span>
      </div>

      {/* Sticker urgente si aplica */}
      {mascota.prioridad === 'alta' && (
        <div className="collage-sticker sticker-urgente sticker-top-left">
          <span className="collage-sticker-icon">❤️</span>
          <span>Urgente</span>
        </div>
      )}

      {/* Cinta adhesiva */}
      <div className="collage-tape tape-top"></div>

      {/* Foto principal - con lazy loading y optimización */}
      <div className="mascota-foto-wrapper">
        <img 
          src={getOptimizedImageUrl(images[imagenActual] || mascota?.foto_principal, 400, 400)} 
          alt={mascota.nombre_mascota}
          loading="lazy"
          className="mascota-foto-collage"
        />
      </div>

      {/* Miniaturas de galería */}
      {tieneGaleria && (
        <div className="mascota-galeria-thumbs">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`mascota-thumb ${imagenActual === idx ? 'active' : ''}`}
              onClick={() => cambiarImagen(idx)}
            >
              <img 
                src={getOptimizedImageUrl(img, 60, 60)} 
                alt={`${mascota.nombre_mascota} - ${idx + 1}`}
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}

      {/* Información */}
      <div className="mascota-info-content">
        <h2 className="mascota-nombre">{mascota.nombre_mascota}</h2>
        
        <div className="mascota-detalle-item">
          <span className="detalle-icon">🐾</span>
          <span><strong>{t('especie')}:</strong> {mascota.especie}</span>
        </div>
        
        <div className="mascota-detalle-item">
          <span className="detalle-icon">⚥</span>
          <span><strong>{t('genero')}:</strong> {mascota.genero}</span>
        </div>
        
        <div className="mascota-detalle-item">
          <span className="detalle-icon">🎂</span>
          <span><strong>{t('edad')}:</strong> {mascota.edad_aprox} {t('años')}</span>
        </div>
        
        <div className="mascota-detalle-item">
          <span className="detalle-icon">📏</span>
          <span><strong>{t('tamaño')}:</strong> {mascota.tamaño || t('no_especificado')}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="collage-divider"></div>

      {/* Tips de adopción */}
      <div className="tips-container">
        <h3 className="tips-title">
          <span>📋</span> {t('tips_adopcion')}
        </h3>
        <ul className="tips-list">
          <li>✓ {t('tip_preparar_hogar')}</li>
          <li>✓ {t('tip_gastos_veterinarios')}</li>
          <li>✓ {t('tip_tiempo_dedicacion')}</li>
          <li>✓ {t('tip_amor_incondicional')}</li>
        </ul>
      </div>

      {/* Documentos necesarios */}
      <div className="documentos-container">
        <h3 className="documentos-title">
          <span>📄</span> {t('documentos_necesarios')}
        </h3>
        <ul className="documentos-list">
          <li>✓ {t('doc_identidad')}</li>
          <li>✓ {t('doc_comprobante_domicilio')}</li>
          <li>✓ {t('doc_compromiso')}</li>
        </ul>
      </div>
    </div>
  );
};

export default TarjetaMascotaInfo;