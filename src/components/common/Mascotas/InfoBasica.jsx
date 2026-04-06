// src/pages/public/MascotaDetalle/components/InfoBasica.jsx
import React from 'react';
import './InfoBasica.css';

const InfoBasica = ({ mascota, t }) => {
  const getEstadoBadge = (estado) => {
    const estados = {
      'En adopcion': { class: 'adopcion', icon: 'fa-heart', text: t('en_adopcion') },
      'Adoptado': { class: 'adoptado', icon: 'fa-check-circle', text: t('adoptado') },
      'Rescatada': { class: 'rescatada', icon: 'fa-ambulance', text: t('rescatada') },
      'En acogida': { class: 'acogida', icon: 'fa-home', text: t('en_acogida') }
    };
    return estados[estado] || estados['En adopcion'];
  };

  const estadoBadge = getEstadoBadge(mascota.estado);

  return (
    <div className="info-basica">
      <div className="estado-badge">
        <span className={`badge ${estadoBadge.class}`}>
          <i className={`fas ${estadoBadge.icon}`}></i> {estadoBadge.text}
        </span>
      </div>

      <h1 className="nombre-mascota">{mascota.nombre_mascota}</h1>

      <div className="info-resumen">
        <div className="info-item">
          <i className="fas fa-paw"></i>
          <span>{mascota.especie || t('especie_no_especificada')}</span>
        </div>
        <div className="info-item">
          <i className={`fas ${mascota.genero === 'Macho' ? 'fa-mars' : 'fa-venus'}`}></i>
          <span>{mascota.genero === 'Macho' ? t('macho') : mascota.genero === 'Hembra' ? t('hembra') : t('desconocido')}</span>
        </div>
        <div className="info-item">
          <i className="fas fa-calendar-alt"></i>
          <span>{mascota.edad_aprox ? `${mascota.edad_aprox} ${mascota.edad_aprox === 1 ? t('año') : t('años')}` : t('edad_desconocida')}</span>
        </div>
      </div>

      {mascota.descripcion && (
        <div className="descripcion">
          <h3><i className="fas fa-align-left"></i> {t('descripcion')}</h3>
          <p>{mascota.descripcion}</p>
        </div>
      )}

      {mascota.lugar_rescate && (
        <div className="lugar-rescate">
          <h3><i className="fas fa-map-marker-alt"></i> {t('lugar_rescate')}</h3>
          <p>{mascota.lugar_rescate}</p>
        </div>
      )}

      {(mascota.fecha_ingreso || mascota.fecha_salida) && (
        <div className="fechas">
          {mascota.fecha_ingreso && (
            <div className="fecha-item">
              <i className="fas fa-calendar-plus"></i>
              <span><strong>{t('fecha_ingreso')}:</strong> {new Date(mascota.fecha_ingreso).toLocaleDateString('es-ES')}</span>
            </div>
          )}
          {mascota.fecha_salida && (
            <div className="fecha-item">
              <i className="fas fa-calendar-minus"></i>
              <span><strong>{t('fecha_salida')}:</strong> {new Date(mascota.fecha_salida).toLocaleDateString('es-ES')}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfoBasica;