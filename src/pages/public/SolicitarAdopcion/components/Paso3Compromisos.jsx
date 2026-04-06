// src/pages/public/SolicitarAdopcion/components/Paso3Compromisos.jsx
import React from 'react';

const Paso3Compromisos = ({ formData, handleInputChange, errores, t }) => {
  return (
    <div className="paso-contenido">
      <h2> {t('compromisos')}</h2>
      <p className="paso-descripcion">{t('importante_compromisos')}</p>

      <div className="formulario-grupo-grande">
        <div className="form-grupo">
          <label>{t('experiencia_mascotas')} *</label>
          <textarea
            name="experiencia_mascotas"
            value={formData.experiencia_mascotas}
            onChange={handleInputChange}
            placeholder={t('cuéntanos_experiencia')}
            rows="3"
            className={errores.experiencia_mascotas ? 'error' : ''}
          />
          {errores.experiencia_mascotas && <small className="error-mensaje">{errores.experiencia_mascotas}</small>}
        </div>

        <div className="form-grupo">
          <label>{t('razones_adopcion')} *</label>
          <textarea
            name="motivo_adopcion"
            value={formData.motivo_adopcion}
            onChange={handleInputChange}
            placeholder={t('por_qué_adoptar')}
            rows="3"
            className={errores.motivo_adopcion ? 'error' : ''}
          />
          {errores.motivo_adopcion && <small className="error-mensaje">{errores.motivo_adopcion}</small>}
        </div>
      </div>

      <div className="compromisos-checklist">
        <h3> {t('acepta_compromisos')}</h3>

        <div className="checkbox-item">
          <input
            type="checkbox"
            name="compromiso_cuidado"
            checked={formData.compromiso_cuidado}
            onChange={handleInputChange}
          />
          <label>{t('compromiso1')}</label>
        </div>
        {errores.compromiso_cuidado && <small className="error-mensaje">{errores.compromiso_cuidado}</small>}

        <div className="checkbox-item">
          <input
            type="checkbox"
            name="compromiso_esterilizacion"
            checked={formData.compromiso_esterilizacion}
            onChange={handleInputChange}
          />
          <label>{t('compromiso2')}</label>
        </div>
        {errores.compromiso_esterilizacion && <small className="error-mensaje">{errores.compromiso_esterilizacion}</small>}

        <div className="checkbox-item">
          <input
            type="checkbox"
            name="compromiso_seguimiento"
            checked={formData.compromiso_seguimiento}
            onChange={handleInputChange}
          />
          <label>{t('compromiso3')}</label>
        </div>
        {errores.compromiso_seguimiento && <small className="error-mensaje">{errores.compromiso_seguimiento}</small>}
      </div>
    </div>
  );
};

export default Paso3Compromisos;