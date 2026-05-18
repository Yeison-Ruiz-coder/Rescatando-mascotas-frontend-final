// FiltrosMascotas.jsx - igual que FiltrosEventos pero con tus opciones
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X, PawPrint, Venus, Mars } from 'lucide-react'; // Usa lucide-react como Eventos
import { useFiltros } from '../../../contexts/FiltrosContext';
import './FiltrosMascotas.css';

const FiltrosMascotas = ({ especies = [], variant = 'inline' }) => {
  const { t } = useTranslation('mascotas');
  const { filtros, actualizarFiltros, limpiarFiltros } = useFiltros();
  const [showModal, setShowModal] = useState(false);
  const [busquedaLocal, setBusquedaLocal] = useState(filtros.busqueda);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && variant === 'inline') {
      inputRef.current.focus();
    }
  }, [variant]);

  const handleBusquedaChange = (e) => {
    const value = e.target.value;
    setBusquedaLocal(value);
    actualizarFiltros({ busqueda: value });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    actualizarFiltros({ [name]: value });
  };

  const handleClearSearch = () => {
    setBusquedaLocal('');
    actualizarFiltros({ busqueda: '' });
    if (inputRef.current) inputRef.current.focus();
  };

  const handleReset = () => {
    setBusquedaLocal('');
    limpiarFiltros();
    if (inputRef.current) inputRef.current.focus();
  };

  const hasActiveFilters = () => {
    return filtros.busqueda || filtros.especie || filtros.genero;
  };

  const especiesOptions = [
    { value: "", label: t("todas_especies") || "Todas las especies" },
    ...especies.map(esp => ({ value: esp, label: esp }))
  ];

  const generosOptions = [
    { value: "", label: t("todos_generos") || "Todos los géneros" },
    { value: "Macho", label: t("macho") || "Macho" },
    { value: "Hembra", label: t("hembra") || "Hembra" },
  ];

  const FormContent = () => (
    <form className="fm-form" onSubmit={(e) => e.preventDefault()}>
      <div className="fm-grid">
        <div className="fm-group fm-busqueda-group">
          <label>
            <Search size={14} />
            {t('buscar') || 'Buscar'}
          </label>
          <div className="fm-search-wrapper">
            <Search size={16} className="fm-search-icon" />
            <input
              ref={inputRef}
              type="text"
              name="busqueda"
              value={busquedaLocal}
              onChange={handleBusquedaChange}
              placeholder={t('buscar_placeholder') || 'Buscar mascota...'}
              className="fm-input"
              autoComplete="off"
            />
            {busquedaLocal && (
              <button type="button" onClick={handleClearSearch} className="fm-clear-search">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="fm-group">
          <label>
            <VenusMars size={14} />
            {t('genero') || 'Género'}
          </label>
          <select name="genero" value={filtros.genero} onChange={handleChange} className="fm-select">
            {generosOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="fm-group">
          <label>
            <PawPrint size={14} />
            {t('especie') || 'Especie'}
          </label>
          <select name="especie" value={filtros.especie} onChange={handleChange} className="fm-select">
            {especiesOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="fm-buttons">
          <button type="button" onClick={handleReset} className="fm-btn-limpiar">
            <X size={16} />
            {t('limpiar') || 'Limpiar'}
          </button>
        </div>
      </div>
    </form>
  );

  if (variant === 'modal') {
    return (
      <>
        <button className="fm-btn-mobile" onClick={() => setShowModal(true)}>
          <Filter size={18} />
          {t('filtros') || 'Filtros'}
          {hasActiveFilters() && <span className="fm-badge" />}
        </button>

        {showModal && (
          <div className="fm-modal-overlay" onClick={() => setShowModal(false)}>
            <div className="fm-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="fm-modal-header">
                <div className="fm-modal-title">
                  <Filter size={18} />
                </div>
                <button className="fm-modal-close" onClick={() => setShowModal(false)}>
                  <X size={20} />
                </button>
              </div>
              <div className="fm-modal-body">
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