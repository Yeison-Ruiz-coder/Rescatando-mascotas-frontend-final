// src/components/common/Mascotas/FundacionCard.jsx
import React from 'react';
import './FundacionCard.css';

const FundacionCard = ({ fundacion, onContactClick, t }) => {
  if (!fundacion) {
    return (
      <div className="fundacion-card no-fundacion">
        <div className="fundacion-header">
          <i className="fas fa-building"></i>
          <div>
            <h3>{t('sin_fundacion') || 'Sin fundación'}</h3>
            <p>{t('sin_fundacion_desc') || 'Esta mascota no está asociada a ninguna fundación'}</p>
          </div>
        </div>
      </div>
    );
  }

  const nombreFundacion = fundacion.Nombre_1 || fundacion.nombre_entidad || fundacion.nombre || 'Fundación';
  const direccion = fundacion.Direccion || fundacion.direccion;
  const telefono = fundacion.Telefono || fundacion.telefono;
  const email = fundacion.Email || fundacion.email;

  return (
    <div className="fundacion-card">
      <div className="fundacion-header">
        <div className="fundacion-avatar">
          <i className="fas fa-building"></i>
        </div>
        <div className="fundacion-titulo">
          <h3>{nombreFundacion}</h3>
          <span className="fundacion-tipo">
            <i className="fas fa-paw"></i> {t('fundacion_responsable') || 'Fundación responsable'}
          </span>
        </div>
      </div>

      <div className="fundacion-info">
        <div className="fundacion-detalles">
          {direccion && (
            <div className="detalle-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>{direccion}</span>
            </div>
          )}
          {telefono && (
            <div className="detalle-item">
              <i className="fas fa-phone"></i>
              <span>{telefono}</span>
            </div>
          )}
          {email && (
            <div className="detalle-item">
              <i className="fas fa-envelope"></i>
              <span>{email}</span>
            </div>
          )}
          {fundacion.horario_atencion && (
            <div className="detalle-item">
              <i className="fas fa-clock"></i>
              <span>{fundacion.horario_atencion}</span>
            </div>
          )}
        </div>
      </div>

      {/* ❌ BOTÓN ELIMINADO - Ya no se muestra */}
    </div>
  );
};

export default FundacionCard;