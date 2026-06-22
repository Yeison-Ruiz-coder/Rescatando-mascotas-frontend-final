// src/components/common/DebouncedFiltrosWrapper/DebouncedFiltrosWrapper.jsx
import React, { useState, useEffect } from 'react';

/**
 * Wrapper para filtros que evita que se apliquen instantáneamente
 * @param {Object} props
 * @param {React.Component} props.FiltrosComponent - El componente de filtros original
 * @param {Function} props.onApplyFilters - Función que se llama al aplicar filtros (recibe los valores)
 * @param {Function} props.onClearFilters - Función que se llama al limpiar filtros
 * @param {Object} props.initialValues - Valores iniciales de los filtros
 * @param {Object} props.componentProps - Props adicionales para el componente de filtros
 */
const DebouncedFiltrosWrapper = ({ 
  FiltrosComponent, 
  onApplyFilters, 
  onClearFilters,
  initialValues = {},
  componentProps = {}
}) => {
  // Estado temporal para los filtros
  const [tempValues, setTempValues] = useState(initialValues);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  // Actualizar valores temporales cuando cambian los iniciales
  useEffect(() => {
    setTempValues(initialValues);
  }, [initialValues]);

  // Manejar cambios en los filtros (solo actualiza estado temporal)
  const handleFilterChange = (newValues) => {
    setTempValues(prev => ({ ...prev, ...newValues }));
    setHasPendingChanges(true);
  };

  // Aplicar filtros (llama a la función del padre)
  const handleApplyFilters = () => {
    onApplyFilters(tempValues);
    setHasPendingChanges(false);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    const emptyValues = {};
    Object.keys(tempValues).forEach(key => {
      emptyValues[key] = '';
    });
    setTempValues(emptyValues);
    setHasPendingChanges(false);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  // Interceptar las props del componente de filtros
  const interceptedProps = {
    ...componentProps,
    // Sobrescribir las funciones del filtro original
    filtros: tempValues, // Usar valores temporales
    actualizarFiltros: handleFilterChange, // Solo actualiza temp, no aplica
    limpiarFiltros: handleClearFilters,
    // Añadir props para los botones
    showApplyButton: true,
    onApply: handleApplyFilters,
  };

  return (
    <div className="debounced-filtros-wrapper">
      {/* Renderizar el componente de filtros original con props interceptadas */}
      <FiltrosComponent {...interceptedProps} />
      
      {/* Botones adicionales si el componente original no los tiene */}
      <div className="debounced-filtros-actions">
        <button 
          type="button" 
          onClick={handleApplyFilters}
          className="apply-filters-btn"
        >
          <i className="fas fa-search"></i> Buscar
        </button>
        {hasPendingChanges && (
          <span className="pending-badge">
            <i className="fas fa-circle"></i> Pendiente
          </span>
        )}
      </div>
    </div>
  );
};

export default DebouncedFiltrosWrapper;