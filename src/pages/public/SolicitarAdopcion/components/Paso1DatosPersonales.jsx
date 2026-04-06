// src/pages/public/SolicitarAdopcion/components/Paso1DatosPersonales.jsx
import React from 'react';

const Paso1DatosPersonales = ({ formData, handleInputChange, errores, t }) => {
  return (
    <div className="paso-contenido">
      <h2> {t('datos_personales')}</h2>
      <p className="paso-descripcion">{t('completa_datos')}</p>

      <div className="formulario-grid">
        <div className="form-grupo">
          <label>{t('nombre')} *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            placeholder={t('ingresa_nombre')}
            className={errores.nombre ? 'error' : ''}
          />
          {errores.nombre && <small className="error-mensaje">{errores.nombre}</small>}
        </div>

        <div className="form-grupo">
          <label>{t('apellido')} *</label>
          <input
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleInputChange}
            placeholder={t('ingresa_apellido')}
            className={errores.apellido ? 'error' : ''}
          />
          {errores.apellido && <small className="error-mensaje">{errores.apellido}</small>}
        </div>

        <div className="form-grupo">
          <label>{t('documento_identidad')} *</label>
          <input
            type="text"
            name="documento_identidad"
            value={formData.documento_identidad}
            onChange={handleInputChange}
            placeholder={t('ingresa_cedula')}
            className={errores.documento_identidad ? 'error' : ''}
          />
          {errores.documento_identidad && <small className="error-mensaje">{errores.documento_identidad}</small>}
        </div>

        <div className="form-grupo">
          <label>{t('email')} *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="tu@email.com"
            className={errores.email ? 'error' : ''}
          />
          {errores.email && <small className="error-mensaje">{errores.email}</small>}
        </div>

        <div className="form-grupo">
          <label>{t('telefono')} *</label>
          <input
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            placeholder="+57 300 123 4567"
            className={errores.telefono ? 'error' : ''}
          />
          {errores.telefono && <small className="error-mensaje">{errores.telefono}</small>}
        </div>

        <div className="form-grupo">
          <label>{t('fecha_nacimiento')}</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleInputChange}
          />
        </div>

        <div className="form-grupo">
          <label>{t('ocupacion')}</label>
          <input
            type="text"
            name="ocupacion"
            value={formData.ocupacion}
            onChange={handleInputChange}
            placeholder={t('tu_ocupacion')}
          />
        </div>
      </div>
    </div>
  );
};

export default Paso1DatosPersonales;