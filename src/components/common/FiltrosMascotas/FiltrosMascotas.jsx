// src/components/common/FiltrosMascotas/FiltrosMascotas.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFiltros } from '../../../contexts/FiltrosContext';
import CustomSelect from '../CustomSelect/CustomSelect';
import './FiltrosMascotas.css';

const FiltrosMascotas = ({ especies = [], variant = 'inline' }) => {
  const { t } = useTranslation('mascotas');
  const { filtros, actualizarFiltros, limpiarFiltros } = useFiltros();
  const [showModal, setShowModal] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda);
  const inputRef = useRef(null);

  // Opciones para los selects
  const especiesOptions = [
    { value: '', label: t('todas_especies') || 'Todas las especies' },
    ...especies.map(esp => ({ value: esp, label: esp }))
  ];

  const generosOptions = [
    { value: '', label: t('todos_generos') || 'Todos los géneros' },
    { value: 'Macho', label: t('macho') || 'Macho' },
    { value: 'Hembra', label: t('hembra') || 'Hembra' }
  ];

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleBusquedaChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    setBusquedaLocal(value);
    actualizarFiltros({ busqueda: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    actualizarFiltros({ [name]: value });
  };

  const handleReset = () => {
    setBusquedaLocal('');
    limpiarFiltros();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const FormContent = () => (
    <form className="filtros-form" onSubmit={(e) => e.preventDefault()}>
      <div className="filtros-grid">
        <div className="filtro-group filtro-busqueda">
          <label><i className="fas fa-search"></i> {t('buscar') || 'Buscar'}</label>
          <input
            ref={inputRef}
            type="text"
            name="busqueda"
            value={busquedaLocal}
            onChange={handleBusquedaChange}
            placeholder={t('buscar_placeholder') || 'Buscar por nombre...'}
            className="filtro-input"
            autoComplete="off"
            autoFocus={true}
          />
        </div>

        <div className="filtro-group">
          <CustomSelect
            options={especiesOptions}
            value={filtros.especie}
            onChange={handleChange}
            name="especie"
            label={<><i className="fas fa-paw"></i> {t('especie') || 'Especie'}</>}
          />
        </div>

        <div className="filtro-group">
          <CustomSelect
            options={generosOptions}
            value={filtros.genero}
            onChange={handleChange}
            name="genero"
            label={<><i className="fas fa-venus-mars"></i> {t('genero') || 'Género'}</>}
          />
        </div>

        <div className="filtro-buttons">
          <button type="button" onClick={handleReset} className="btn-limpiar">
            <i className="fas fa-undo-alt"></i> {t('limpiar') || 'Limpiar'}
          </button>
        </div>
      </div>
    </form>
  );

  if (variant === 'modal') {
    const hasActiveFilters = filtros.especie || filtros.genero || filtros.busqueda;
    
    return (
      <>
        <button className="btn-filtros-mobile" onClick={() => setShowModal(true)}>
          <i className="fas fa-filter"></i> {t('filtros') || 'Filtros'}
          {hasActiveFilters && <span className="badge-filtros">●</span>}
        </button>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-filter"></i> {t('filtros') || 'Filtros'}</h3>
                <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              </div>
              <div className="modal-body">
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

export default FiltrosMascotas;