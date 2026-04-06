import React from 'react';

const Paso4Revision = ({ formData, mascota, t = (key) => key, getImageUrl = (path) => path }) => {
  return (
    <div className="paso-contenido">
      <h2>{t('revision') || 'Revisión de tu Solicitud'}</h2>
      <p className="paso-descripcion">{t('verifica_informacion') || 'Verifica que toda la información sea correcta antes de enviar'}</p>

      <div className="revision-seccion">
        <h3>{t('datos_personales') || 'Datos Personales'}</h3>
        <div className="revision-grid">
          <div className="revision-item">
            <strong>{t('nombre')}</strong>
            <p>{formData.nombre} {formData.apellido}</p>
          </div>
          <div className="revision-item">
            <strong>{t('cedula')}</strong>
            <p>{formData.cedula}</p>
          </div>
          <div className="revision-item">
            <strong>{t('email')}</strong>
            <p>{formData.email}</p>
          </div>
          <div className="revision-item">
            <strong>{t('celular')}</strong>
            <p>{formData.celular}</p>
          </div>
          <div className="revision-item">
            <strong>{t('ocupacion')}</strong>
            <p>{formData.ocupacion || t('no_especificado') || 'No especificado'}</p>
          </div>
        </div>
      </div>

      <div className="revision-seccion">
        <h3>{t('informacion_vivienda') || 'Información de Vivienda'}</h3>
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
            <p>{formData.tipo_vivienda}</p>
          </div>
          <div className="revision-item">
            <strong>{t('es_propietario')}</strong>
            <p>{formData.es_propietario}</p>
          </div>
        </div>
      </div>

      <div className="revision-seccion">
        <h3>{t('informacion_adicional') || 'Información Adicional'}</h3>
        <div className="revision-grid">
          <div className="revision-item full">
            <strong>{t('experiencia_mascotas')}</strong>
            <p>{formData.experiencia_mascotas}</p>
          </div>
          <div className="revision-item full">
            <strong>{t('razones_adopcion')}</strong>
            <p>{formData.razones_adopcion}</p>
          </div>
        </div>
      </div>

      <div className="revision-mascota">
        <h3>{t('mascota_a_adoptar') || 'Mascota a Adoptar'}</h3>
        <div className="revision-mascota-contenido">
          {mascota?.foto_principal && (
            <img src={getImageUrl(mascota.foto_principal)} alt={mascota.nombre_mascota} className="revision-mascota-img" />
          )}
          <div className="revision-mascota-info">
            <h4>{mascota?.nombre_mascota}</h4>
            <p><strong>{t('especie')}:</strong> {mascota?.especie}</p>
            <p><strong>{t('genero')}:</strong> {mascota?.genero}</p>
            <p><strong>{t('edad')}:</strong> {mascota?.edad_aprox} años</p>
          </div>
        </div>
      </div>

      <div className="aviso-importante">

        <p>{t('aviso_revision') || 'Esta información será revisada por nuestro equipo. Nos contactaremos contigo si necesitamos aclaraciones.'}</p>
      </div>
    </div>
  );
};

export default Paso4Revision;
