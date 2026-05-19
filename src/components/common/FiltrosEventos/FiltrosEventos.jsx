// src/components/common/FiltrosEventos/FiltrosEventos.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, Tag } from 'lucide-react';
import { useFiltrosEventos } from '../../../contexts/FiltrosContext';
import CustomSelect from '../CustomSelect/CustomSelect';
import './FiltrosEventos.css';

const FiltrosEventos = ({ variant = 'inline' }) => {
  const { t } = useTranslation('eventos');
  const { filtros, actualizarFiltros, limpiarFiltros } = useFiltrosEventos();
  const [showModal, setShowModal] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && variant === 'inline') {
      inputRef.current.focus();
    }
  }, [variant]);

  const handleBusquedaChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const value = e.target.value;
    setBusquedaLocal(value);
    actualizarFiltros({ busqueda: value });
  };

  const handleCategoriaChange = (e) => {
    const { value } = e.target;
    actualizarFiltros({ categoria: value });
  };

  const handleClearSearch = () => {
    setBusquedaLocal('');
    actualizarFiltros({ busqueda: '' });
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleReset = () => {
    setBusquedaLocal('');
    limpiarFiltros();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const hasActiveFilters = () => {
    return filtros.busqueda || filtros.categoria;
  };

  const categoriasOptions = [
    { value: "", label: t("todas_categorias") || "Todas las categorías" },
    { value: "Adopción", label: t("categoria_adopcion") || "Adopción" },
    { value: "Kermés", label: t("categoria_kermes") || "Kermés" },
    { value: "Charla", label: t("categoria_charla") || "Charla" },
    { value: "Jornada", label: t("categoria_jornada") || "Jornada" },
    { value: "Taller", label: "Taller" },
  ];

  const FormContent = () => (
    <form className="fe-form" onSubmit={(e) => e.preventDefault()}>
      <div className="fe-grid">
        <div className="fe-group fe-busqueda-group">
          <label>
            <Search size={14} />
            {t('buscar') || 'Buscar'}
          </label>
          <div className="fe-search-wrapper">
            <input
              ref={inputRef}
              type="text"
              name="busqueda"
              value={busquedaLocal}
              onChange={handleBusquedaChange}
              placeholder={t('buscar_evento') || 'Buscar evento...'}
              className="fe-input"
              autoComplete="off"
              autoFocus={true}
            />
            {busquedaLocal && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="fe-clear-search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="fe-group">
          <label>
            <Tag size={14} />
            {t('categoria') || 'Categoría'}
          </label>
          <CustomSelect
            options={categoriasOptions}
            value={filtros.categoria}
            onChange={handleCategoriaChange}
            name="categoria"
          />
        </div>

        <div className="fe-buttons">
          <button type="button" onClick={handleReset} className="fe-btn-limpiar">
            <X size={16} />
            {t('limpiar_filtros') || 'Limpiar'}
          </button>
        </div>
      </div>
    </form>
  );

  if (variant === 'modal') {
    return (
      <>
        <button className="fe-btn-mobile" onClick={() => setShowModal(true)}>
          <Filter size={18} />
          {t('filtros') || 'Filtros'}
          {hasActiveFilters() && <span className="fe-badge" />}
        </button>

        {showModal && (
          <div className="fe-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="fe-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="fe-modal-header">
                <h3>
                  <Filter size={18} />
                  {t('filtros') || 'Filtros'}
                </h3>
                <button className="fe-modal-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="fe-modal-body">
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

export default FiltrosEventos;