// src/pages/public/MascotaDetalle/components/ModalFundacion.jsx
import React, { useEffect } from 'react';
import './ModalFundacion.css';

const ModalFundacion = ({ isOpen, onClose, fundacion, t }) => {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !fundacion) return null;

  const handleContactClick = (tipo, valor) => {
    if (tipo === 'email' && valor) {
      window.location.href = `mailto:${valor}`;
    } else if (tipo === 'telefono' && valor) {
      window.location.href = `tel:${valor}`;
    } else if (tipo === 'whatsapp' && valor) {
      window.open(`https://wa.me/${valor.replace(/[^0-9]/g, '')}`, '_blank');
    }
  };

  return (
    <div className="modal-overlay-fundacion" onClick={onClose}>
      <div className="modal-container-fundacion" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-fundacion">
          <div className="modal-titulo">
            <i className="fas fa-building"></i>
            <h2>{fundacion.nombre_entidad || fundacion.nombre}</h2>
          </div>
          <button className="modal-close-fundacion" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="modal-body-fundacion">
          {/* Logo/Banner */}
          {fundacion.banner && (
            <div className="fundacion-banner">
              <img src={fundacion.banner} alt={fundacion.nombre_entidad} />
            </div>
          )}

          {/* Descripción */}
          {fundacion.descripcion && (
            <div className="fundacion-descripcion-modal">
              <h3><i className="fas fa-info-circle"></i> {t('sobre_nosotros')}</h3>
              <p>{fundacion.descripcion}</p>
            </div>
          )}

          {/* Misión y Visión */}
          {(fundacion.mision || fundacion.vision) && (
            <div className="fundacion-mision-vision">
              {fundacion.mision && (
                <div className="mision">
                  <h4><i className="fas fa-bullseye"></i> {t('mision')}</h4>
                  <p>{fundacion.mision}</p>
                </div>
              )}
              {fundacion.vision && (
                <div className="vision">
                  <h4><i className="fas fa-eye"></i> {t('vision')}</h4>
                  <p>{fundacion.vision}</p>
                </div>
              )}
            </div>
          )}

          {/* Información de contacto detallada */}
          <div className="contacto-detallado">
            <h3><i className="fas fa-address-card"></i> {t('informacion_contacto')}</h3>
            <div className="contacto-grid">
              {fundacion.direccion && (
                <div className="contacto-item" onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(fundacion.direccion)}`, '_blank')}>
                  <i className="fas fa-map-marker-alt"></i>
                  <div>
                    <strong>{t('direccion')}</strong>
                    <p>{fundacion.direccion}</p>
                  </div>
                </div>
              )}
              {fundacion.telefono && (
                <div className="contacto-item" onClick={() => handleContactClick('telefono', fundacion.telefono)}>
                  <i className="fas fa-phone-alt"></i>
                  <div>
                    <strong>{t('telefono')}</strong>
                    <p>{fundacion.telefono}</p>
                  </div>
                </div>
              )}
              {fundacion.telefono_alternativo && (
                <div className="contacto-item" onClick={() => handleContactClick('telefono', fundacion.telefono_alternativo)}>
                  <i className="fas fa-mobile-alt"></i>
                  <div>
                    <strong>{t('telefono_alternativo')}</strong>
                    <p>{fundacion.telefono_alternativo}</p>
                  </div>
                </div>
              )}
              {fundacion.whatsapp && (
                <div className="contacto-item" onClick={() => handleContactClick('whatsapp', fundacion.whatsapp)}>
                  <i className="fab fa-whatsapp"></i>
                  <div>
                    <strong>{t('whatsapp')}</strong>
                    <p>{fundacion.whatsapp}</p>
                  </div>
                </div>
              )}
              {fundacion.email && (
                <div className="contacto-item" onClick={() => handleContactClick('email', fundacion.email)}>
                  <i className="fas fa-envelope"></i>
                  <div>
                    <strong>{t('email')}</strong>
                    <p>{fundacion.email}</p>
                  </div>
                </div>
              )}
              {fundacion.horario_atencion && (
                <div className="contacto-item">
                  <i className="fas fa-clock"></i>
                  <div>
                    <strong>{t('horario_atencion')}</strong>
                    <p>{fundacion.horario_atencion}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Redes sociales */}
          {(fundacion.facebook || fundacion.instagram || fundacion.twitter) && (
            <div className="redes-sociales">
              <h3><i className="fas fa-share-alt"></i> {t('redes_sociales')}</h3>
              <div className="redes-lista">
                {fundacion.facebook && (
                  <a href={fundacion.facebook} target="_blank" rel="noopener noreferrer" className="red-link facebook">
                    <i className="fab fa-facebook-f"></i> Facebook
                  </a>
                )}
                {fundacion.instagram && (
                  <a href={fundacion.instagram} target="_blank" rel="noopener noreferrer" className="red-link instagram">
                    <i className="fab fa-instagram"></i> Instagram
                  </a>
                )}
                {fundacion.twitter && (
                  <a href={fundacion.twitter} target="_blank" rel="noopener noreferrer" className="red-link twitter">
                    <i className="fab fa-twitter"></i> Twitter
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer-fundacion">
          <button onClick={onClose} className="btn-cerrar">
            <i className="fas fa-times"></i> {t('cerrar')}
          </button>
          {fundacion.telefono && (
            <button onClick={() => handleContactClick('telefono', fundacion.telefono)} className="btn-llamar">
              <i className="fas fa-phone"></i> {t('llamar_ahora')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalFundacion;