// src/pages/public/SolicitarAdopcion/components/Paso4Revision.jsx
import React from 'react';

const Paso4Revision = ({ formData, mascota, t, getImageUrl }) => {
  return (
    <div className="paso-contenido">
      <h2>{t('revision')}</h2>
      <p className="paso-descripcion">{t('verifica_informacion')}</p>

      <div className="revision-seccion">
        <h3>{t('datos_personales')}</h3>
        <div className="revision-grid">
          <div className="revision-item">
            <strong>{t('nombre_completo')}</strong>
            <p>{formData.nombre} {formData.apellido}</p>
          </div>
          <div className="revision-item">
            <strong>{t('documento_identidad')}</strong>
            <p>{formData.documento_identidad}</p>
          </div>
          <div className="revision-item">
            <strong>{t('email')}</strong>
            <p>{formData.email}</p>
          </div>
          <div className="revision-item">
            <strong>{t('telefono')}</strong>
            <p>{formData.telefono}</p>
          </div>
          <div className="revision-item">
            <strong>{t('ocupacion')}</strong>
            <p>{formData.ocupacion || t('no_especificado')}</p>
          </div>
        </div>
      </div>

      <div className="revision-seccion">
        <h3>{t('informacion_vivienda')}</h3>
        <div className="revision-grid">
          <div className="revision-item">
            <strong>{t('direccion')}</strong>
            <p>{formData.direccion}</p>
          </div>
          <div className="revision-item">
            <strong>{t('ciudad')}</strong>
            <p>{formData.ciudad}</p>
          </div>
          <div className="revision-item">
            <strong>{t('tipo_vivienda')}</strong>
            <p>{formData.tipo_vivienda ? t(formData.tipo_vivienda) : t('no_especificado')}</p>
          </div>
          <div className="revision-item">
            <strong>{t('es_propietario')}</strong>
            <p>{formData.es_propietario ? t(formData.es_propietario) : t('no_especificado')}</p>
          </div>
        </div>
      </div>

      <div className="revision-seccion">
        <h3>{t('informacion_adicional')}</h3>
        <div className="revision-grid">
          <div className="revision-item full">
            <strong>{t('experiencia_mascotas')}</strong>
            <p>{formData.experiencia_mascotas || t('no_especificado')}</p>
          </div>
          <div className="revision-item full">
            <strong>{t('motivo_adopcion')}</strong>
            <p>{formData.motivo_adopcion || t('no_especificado')}</p>
          </div>
        </div>
      </div>

      <div className="revision-mascota">
        <h3>{t('mascota_a_adoptar')}</h3>
        <div className="revision-mascota-contenido">
          {mascota?.foto_principal && (
            <img 
              src={getImageUrl(mascota.foto_principal)} 
              alt={mascota.nombre_mascota} 
              className="revision-mascota-img" 
            />
          )}
          <div className="revision-mascota-info">
            <h4>{mascota?.nombre_mascota}</h4>
            <p><strong>{t('especie')}:</strong> {mascota?.especie}</p>
            <p><strong>{t('genero')}:</strong> {mascota?.genero}</p>
            <p><strong>{t('edad')}:</strong> {mascota?.edad_aprox} {t('años')}</p>
          </div>
        </div>
      </div>

      <div className="aviso-importante">
        <i className="fas fa-info-circle"></i>
        <p>{t('aviso_revision')}</p>
      </div>
    </div>
  );
};

export default Paso4Revision;