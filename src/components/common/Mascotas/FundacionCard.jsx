// src/components/common/Mascotas/FundacionCard.jsx
import React from 'react';
import './FundacionCard.css';

const FundacionCard = ({ fundacion, onContactClick, t }) => {
  // Debug: Ver qué datos llegan
  console.log('🏢 FundacionCard recibió:', fundacion);

  // Si no hay fundación, mostrar mensaje
  if (!fundacion) {
    return (
      <div className="fundacion-card fundacion-card--empty">
        <div className="fundacion-card__empty-content">
          <i className="fas fa-building fundacion-card__empty-icon"></i>
          <h3 className="fundacion-card__empty-title">
            {t('sin_fundacion') || 'Sin fundación'}
          </h3>
          <p className="fundacion-card__empty-text">
            {t('sin_fundacion_desc') || 'Esta mascota no está asociada a ninguna fundación'}
          </p>
        </div>
      </div>
    );
  }

  // Extraer datos con múltiples formatos posibles
  const nombreFundacion = fundacion.Nombre_1 
    || fundacion.nombre_entidad 
    || fundacion.nombre_fundacion 
    || fundacion.nombre 
    || 'Fundación';
  
  const direccion = fundacion.Direccion 
    || fundacion.direccion 
    || fundacion.DIRECCION;
  
  const telefono = fundacion.Telefono 
    || fundacion.telefono 
    || fundacion.TELEFONO;
  
  const email = fundacion.Email 
    || fundacion.email 
    || fundacion.EMAIL;

  const descripcion = fundacion.Descripcion 
    || fundacion.descripcion 
    || fundacion.DESCRIPCION;

  const horario = fundacion.horario_atencion 
    || fundacion.HorarioAtencion;

  // Verificar si hay algún dato para mostrar
  const tieneDatos = nombreFundacion || direccion || telefono || email || descripcion;

  if (!tieneDatos) {
    console.warn('⚠️ Fundación sin datos:', fundacion);
    return (
      <div className="fundacion-card fundacion-card--sin-datos">
        <div className="fundacion-card__empty-content">
          <i className="fas fa-exclamation-triangle fundacion-card__empty-icon"></i>
          <h3 className="fundacion-card__empty-title">
            Información no disponible
          </h3>
          <p className="fundacion-card__empty-text">
            No se pudo cargar la información de la fundación
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fundacion-card fundacion-card--active">
      <div className="fundacion-card__header">
        <div className="fundacion-card__avatar">
          <i className="fas fa-hand-holding-heart"></i>
        </div>
        <div className="fundacion-card__title-section">
          <h3 className="fundacion-card__name">{nombreFundacion}</h3>
          <span className="fundacion-card__badge">
            <i className="fas fa-paw"></i> Fundación responsable
          </span>
        </div>
      </div>

      {/* Descripción */}
      {descripcion && (
        <div className="fundacion-card__description">
          <p>{descripcion}</p>
        </div>
      )}

      {/* Información de contacto */}
      <div className="fundacion-card__info">
        {direccion && (
          <div className="fundacion-card__info-item">
            <i className="fas fa-map-marker-alt"></i>
            <span>{direccion}</span>
          </div>
        )}
        {telefono && (
          <div className="fundacion-card__info-item">
            <i className="fas fa-phone-alt"></i>
            <span>{telefono}</span>
          </div>
        )}
        {email && (
          <div className="fundacion-card__info-item">
            <i className="fas fa-envelope"></i>
            <span>{email}</span>
          </div>
        )}
        {horario && (
          <div className="fundacion-card__info-item">
            <i className="fas fa-clock"></i>
            <span>{horario}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundacionCard;