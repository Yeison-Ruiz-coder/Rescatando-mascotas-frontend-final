// src/pages/public/SolicitarAdopcion/components/Paso2InformacionAdicional.jsx
import React from 'react';

const Paso2InformacionAdicional = ({ formData, handleInputChange, errores, t }) => {
  return (
    <div className="paso-contenido">
      <h2> {t('informacion_adicional')}</h2>
      <p className="paso-descripcion">{t('info_vivienda')}</p>

      <div className="formulario-grid">
        <div className="form-grupo">
          <label>{t('direccion')} *</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            placeholder={t('ingresa_direccion')}
            className={errores.direccion ? 'error' : ''}
          />
          {errores.direccion && <small className="error-mensaje">{errores.direccion}</small>}
        </div>

        <div className="form-grupo">
          <label>{t('ciudad')} *</label>
          <input
            type="text"
            name="ciudad"
            value={formData.ciudad}
            onChange={handleInputChange}
            placeholder={t('ingresa_ciudad')}
            className={errores.ciudad ? 'error' : ''}
          />
          {errores.ciudad && <small className="error-mensaje">{errores.ciudad}</small>}
        </div>

        <div className="form-grupo">
          <label>{t('departamento')}</label>
          <input
            type="text"
            name="departamento"
            value={formData.departamento}
            onChange={handleInputChange}
            placeholder={t('ingresa_departamento')}
          />
        </div>

        <div className="form-grupo">
          <label>{t('codigo_postal')}</label>
          <input
            type="text"
            name="codigo_postal"
            value={formData.codigo_postal}
            onChange={handleInputChange}
            placeholder="110111"
          />
        </div>

        <div className="form-grupo">
          <label>{t('estado_civil')}</label>
          <select name="estado_civil" value={formData.estado_civil} onChange={handleInputChange}>
            <option value="">{t('selecciona')}</option>
            <option value="soltero">{t('soltero')}</option>
            <option value="casado">{t('casado')}</option>
            <option value="union_libre">{t('union_libre')}</option>
            <option value="divorciado">{t('divorciado')}</option>
            <option value="viudo">{t('viudo')}</option>
          </select>
        </div>

        <div className="form-grupo">
          <label>{t('cantidad_hijos')}</label>
          <input
            type="number"
            name="cantidad_hijos"
            value={formData.cantidad_hijos}
            onChange={handleInputChange}
            min="0"
            placeholder="0"
          />
        </div>

        <div className="form-grupo">
          <label>{t('tipo_vivienda')} *</label>
          <select 
            name="tipo_vivienda" 
            value={formData.tipo_vivienda} 
            onChange={handleInputChange}
            className={errores.tipo_vivienda ? 'error' : ''}
          >
            <option value="">{t('selecciona')}</option>
            <option value="casa">{t('casa')}</option>
            <option value="apartamento">{t('apartamento')}</option>
            <option value="finca">{t('finca')}</option>
            <option value="otra">{t('otra')}</option>
          </select>
          {errores.tipo_vivienda && <small className="error-mensaje">{errores.tipo_vivienda}</small>}
        </div>

        <div className="form-grupo">
          <label>{t('es_propietario')}</label>
          <select name="es_propietario" value={formData.es_propietario} onChange={handleInputChange}>
            <option value="">{t('selecciona')}</option>
            <option value="si">{t('si')}</option>
            <option value="no">{t('no')}</option>
            <option value="familiar">{t('arrendamos')}</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Paso2InformacionAdicional;