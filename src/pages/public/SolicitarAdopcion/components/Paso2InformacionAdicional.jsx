// src/pages/public/SolicitarAdopcion/components/Paso2InformacionAdicional.jsx
import React, { useState } from 'react';
import CustomSelect from '../../../../components/common/CustomSelect/CustomSelect';

const Paso2InformacionAdicional = ({ formData, handleInputChange, errores, t }) => {
  const [touched, setTouched] = useState({});

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  // Opciones para los selects
  const estadoCivilOptions = [
    { value: 'soltero', label: t('soltero') },
    { value: 'casado', label: t('casado') },
    { value: 'union_libre', label: t('union_libre') },
    { value: 'divorciado', label: t('divorciado') },
    { value: 'viudo', label: t('viudo') }
  ];

  const tipoViviendaOptions = [
    { value: 'casa', label: t('casa') },
    { value: 'apartamento', label: t('apartamento') },
    { value: 'finca', label: t('finca') },
    { value: 'otra', label: t('otra') }
  ];

  const esPropietarioOptions = [
    { value: 'si', label: t('si') },
    { value: 'no', label: t('no') },
    { value: 'familiar', label: t('arrendamos') }
  ];

  return (
    <div className="paso-contenido">
      <h2>{t('informacion_adicional')}</h2>
      <p className="paso-descripcion">{t('info_vivienda')}</p>

      <div className="formulario-grid">
        <div className="form-grupo">
          <label>{t('direccion')} *</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleInputChange}
            onBlur={() => handleBlur('direccion')}
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
            onBlur={() => handleBlur('ciudad')}
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

        {/* CustomSelect para Estado Civil */}
        <CustomSelect
          name="estado_civil"
          value={formData.estado_civil}
          onChange={handleInputChange}
          options={estadoCivilOptions}
          placeholder={t('selecciona')}
          label={t('estado_civil')}
        />

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

        {/* CustomSelect para Tipo de Vivienda */}
        <CustomSelect
          name="tipo_vivienda"
          value={formData.tipo_vivienda}
          onChange={handleInputChange}
          options={tipoViviendaOptions}
          placeholder={t('selecciona')}
          label={t('tipo_vivienda')}
        />

        {/* CustomSelect para Es Propietario */}
        <CustomSelect
          name="es_propietario"
          value={formData.es_propietario}
          onChange={handleInputChange}
          options={esPropietarioOptions}
          placeholder={t('selecciona')}
          label={t('es_propietario')}
        />
      </div>
    </div>
  );
};

export default Paso2InformacionAdicional;