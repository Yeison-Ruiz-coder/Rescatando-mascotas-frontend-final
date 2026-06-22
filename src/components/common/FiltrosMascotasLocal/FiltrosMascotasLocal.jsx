import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CustomSelect from '../CustomSelect/CustomSelect';
import '../FiltrosMascotas/FiltrosMascotas.css';

const FiltrosMascotasLocal = ({
  especies = [],
  variant = 'inline',
  initialValues = { busqueda: '', especie: '', genero: '' },
  onApply = () => {},
  onClear = () => {},
}) => {
  const { t } = useTranslation('mascotas');
  const [showModal, setShowModal] = useState(false);
  const [busqueda, setBusqueda] = useState(initialValues.busqueda || '');
  const [especie, setEspecie] = useState(initialValues.especie || '');
  const [genero, setGenero] = useState(initialValues.genero || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setBusqueda(initialValues.busqueda || '');
    setEspecie(initialValues.especie || '');
    setGenero(initialValues.genero || '');
  }, [initialValues.busqueda, initialValues.especie, initialValues.genero]);

  const especiesOptions = [
    { value: '', label: t('todas_especies') || 'Todas las especies' },
    ...especies.map((esp) => ({ value: esp, label: esp })),
  ];

  const generosOptions = [
    { value: '', label: t('todos_generos') || 'Todos los géneros' },
    { value: 'Macho', label: t('macho') || 'Macho' },
    { value: 'Hembra', label: t('hembra') || 'Hembra' },
  ];

  const handleApply = () => {
    onApply({ busqueda, especie, genero });
    setShowModal(false);
  };

  const handleClear = () => {
    setBusqueda('');
    setEspecie('');
    setGenero('');
    onClear();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleBusquedaChange = (e) => setBusqueda(e.target.value);
  const handleEspecieChange = (e) => setEspecie(e.target.value);
  const handleGeneroChange = (e) => setGenero(e.target.value);

  const FormContent = () => (
    <form className="filtros-form" onSubmit={(e) => e.preventDefault()}>
      <div className="filtros-grid">
        <div className="filtro-group filtro-busqueda">
          <label><i className="fas fa-search"></i> {t('buscar') || 'Buscar'}</label>
          <input
            ref={inputRef}
            type="text"
            name="busqueda"
            value={busqueda}
            onChange={handleBusquedaChange}
            placeholder={t('buscar_placeholder') || 'Buscar por nombre...'}
            className="filtro-input"
            autoComplete="off"
          />
        </div>

        <div className="filtro-group">
          <CustomSelect
            options={especiesOptions}
            value={especie}
            onChange={handleEspecieChange}
            name="especie"
            label={<><i className="fas fa-paw"></i> {t('especie') || 'Especie'}</>}
          />
        </div>

        <div className="filtro-group">
          <CustomSelect
            options={generosOptions}
            value={genero}
            onChange={handleGeneroChange}
            name="genero"
            label={<><i className="fas fa-venus-mars"></i> {t('genero') || 'Género'}</>}
          />
        </div>

        <div className="filtro-buttons">
          <button type="button" onClick={handleClear} className="btn-limpiar">
            <i className="fas fa-undo-alt"></i> {t('limpiar') || 'Limpiar'}
          </button>
          <button type="button" onClick={handleApply} className="btn-primary">
            <i className="fas fa-search"></i> {t('buscar') || 'Buscar'}
          </button>
        </div>
      </div>
    </form>
  );

  if (variant === 'modal') {
    const hasActiveFilters = !!(busqueda || especie || genero);

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

export default FiltrosMascotasLocal;
