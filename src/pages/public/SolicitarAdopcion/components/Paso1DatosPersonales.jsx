// src/pages/public/SolicitarAdopcion/components/Paso1DatosPersonales.jsx
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { registerLocale } from 'react-datepicker';
import es from 'date-fns/locale/es';
import "react-datepicker/dist/react-datepicker.css";

registerLocale('es', es);

const Paso1DatosPersonales = ({ formData, handleInputChange, errores, t }) => {
  const [fechaNacimientoDate, setFechaNacimientoDate] = useState(
    formData.fecha_nacimiento ? new Date(formData.fecha_nacimiento) : null
  );

  const [touched, setTouched] = useState({});

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleDateChange = (date) => {
    setFechaNacimientoDate(date);
    handleInputChange({
      target: {
        name: 'fecha_nacimiento',
        value: date ? date.toISOString().split('T')[0] : ''
      }
    });
    if (errores.fecha_nacimiento) {
      setTouched(prev => ({ ...prev, fecha_nacimiento: true }));
    }
  };

  return (
    <div className="paso-contenido">
      <h2>{t('datos_personales')}</h2>
      <p className="paso-descripcion">{t('completa_datos')}</p>

      <div className="formulario-grid">
        <div className="form-grupo">
          <label>{t('nombre')} *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            onBlur={() => handleBlur('nombre')}
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
            onBlur={() => handleBlur('apellido')}
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
            onBlur={() => handleBlur('documento_identidad')}
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
            onBlur={() => handleBlur('email')}
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
            onBlur={() => handleBlur('telefono')}
            placeholder="+57 300 123 4567"
            className={errores.telefono ? 'error' : ''}
          />
          {errores.telefono && <small className="error-mensaje">{errores.telefono}</small>}
        </div>

        <div className="form-grupo">
          <label>{t('fecha_nacimiento')}</label>
          <div className="datepicker-wrapper">
            <DatePicker
              selected={fechaNacimientoDate}
              onChange={handleDateChange}
              onBlur={() => handleBlur('fecha_nacimiento')}
              dateFormat="dd/MM/yyyy"
              placeholderText="DD/MM/YYYY"
              className={`datepicker-input ${errores.fecha_nacimiento ? 'error' : ''}`}
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              locale="es"
              yearDropdownItemNumber={100}
              scrollableYearDropdown
              maxDate={new Date()}
              isClearable
            />
          </div>
          {errores.fecha_nacimiento && <small className="error-mensaje">{errores.fecha_nacimiento}</small>}
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