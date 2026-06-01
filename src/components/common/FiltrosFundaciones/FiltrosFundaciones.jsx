// src/components/common/FiltrosFundaciones/FiltrosFundaciones.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFiltrosFundaciones } from '../../../contexts/FiltrosContext';
import CustomSelect from '../CustomSelect/CustomSelect';
import './FiltrosFundaciones.css';

const FiltrosFundaciones = ({ ciudades = [], variant = 'inline' }) => {
  const { t } = useTranslation('fundaciones');
  const { filtros, actualizarFiltros, limpiarFiltros } = useFiltrosFundaciones();
  const [showModal, setShowModal] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda);
  const inputRef = useRef(null);

  const ciudadesOptions = [
    { value: '', label: t('todas_ciudades') },
    ...ciudades.map(ciudad => ({ value: ciudad, label: ciudad }))
  ];

  useEffect(() => {
    if (inputRef.current && variant === 'inline') {
      inputRef.current.focus();
    }
  }, [variant]);

  useEffect(() => {
    setBusquedaLocal(filtros.busqueda || '');
  }, [filtros.busqueda]);

  const handleBusquedaChange = (e) => {
    const value = e.target.value;
    setBusquedaLocal(value);
    actualizarFiltros({ busqueda: value });
  };

  const handleCiudadChange = (e) => {
    actualizarFiltros({ ciudad: e.target.value });
  };

  const handleClearSearch = () => {
    setBusquedaLocal('');
    actualizarFiltros({ busqueda: '' });
    inputRef.current?.focus();
  };

  const handleReset = () => {
    setBusquedaLocal('');
    limpiarFiltros();
    inputRef.current?.focus();
  };

  const hasActiveFilters = () => {
    return filtros.busqueda || filtros.ciudad;
  };

  const FormContent = () => (
    <form className="ff-form" onSubmit={(e) => e.preventDefault()}>
      <div className="ff-grid">
        <div className="ff-group ff-busqueda-group">
          <label><i className="fas fa-search"></i> {t('buscar')}</label>
          <div className="ff-search-wrapper">
            <input
              ref={inputRef}
              type="text"
              name="busqueda"
              value={busquedaLocal}
              onChange={handleBusquedaChange}
              placeholder={t('buscar_placeholder')}
              className="ff-input"
              autoComplete="off"
              autoFocus={true}
            />
            {busquedaLocal && (
              <button type="button" onClick={handleClearSearch} className="ff-clear-search">
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>

        <div className="ff-group">
          <CustomSelect
            options={ciudadesOptions}
            value={filtros.ciudad || ''}
            onChange={handleCiudadChange}
            name="ciudad"
            label={<><i className="fas fa-map-marker-alt"></i> {t('ciudad')}</>}
          />
        </div>

        <div className="ff-buttons">
          <button type="button" onClick={handleReset} className="ff-btn-limpiar">
            <i className="fas fa-undo-alt"></i> {t('limpiar')}
          </button>
        </div>
      </div>
    </form>
  );

  if (variant === 'modal') {
    return (
      <>
        <button className="ff-btn-mobile" onClick={() => setShowModal(true)}>
          <i className="fas fa-filter"></i> {t('filtros')}
          {hasActiveFilters() && <span className="ff-badge" />}
        </button>

        {showModal && (
          <div className="ff-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="ff-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="ff-modal-header">
                <h3><i className="fas fa-filter"></i> {t('filtros')}</h3>
                <button className="ff-modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="ff-modal-body">
                <FormContent />
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return <FormContent />;
};

export default FiltrosFundaciones;