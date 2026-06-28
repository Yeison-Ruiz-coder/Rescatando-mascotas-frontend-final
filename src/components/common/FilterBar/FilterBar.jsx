// src/components/common/FilterBar/FilterBar.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../ProgressBar/ProgressBar';
import CustomSelect from '../CustomSelect/CustomSelect';
import './FilterBar.css';

const FilterBar = ({
  filters = {},
  onFilterChange,
  placeholder = 'Buscar...',
  showSearch = true,
  showTypeFilter = true,
  showStatusFilter = true,
  showSort = true,
  isLoading = false,
  typeOptions = [],
  statusOptions = [],
  sortOptions = [],
  className = '',
}) => {
  const { t } = useTranslation('admin');
  
  // Estados internos sincronizados con props
  const [buscar, setBuscar] = useState(filters.search || '');
  const [tipo, setTipo] = useState(filters.tipo || '');
  const [estado, setEstado] = useState(filters.estado || '');
  const [sort, setSort] = useState(filters.sort || '');
  const [progress, setProgress] = useState(0);
  
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(-1);
  
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);
  const timeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const isInternalUpdate = useRef(false);

  // Default options con i18n
  const defaultTypeOptions = [
    { value: '', label: t('todos_tipos', 'Todos los tipos') },
    { value: 'usuario', label: t('usuario', 'Usuarios') },
    { value: 'fundacion', label: t('fundacion', 'Fundaciones') },
    { value: 'veterinaria', label: t('veterinaria', 'Veterinarias') },
  ];

  const defaultStatusOptions = [
    { value: '', label: t('todos_estados', 'Todos los estados') },
    { value: 'activo', label: t('activo', 'Activo') },
    { value: 'inactivo', label: t('inactivo', 'Inactivo') },
    { value: 'pendiente', label: t('pendiente', 'Pendiente') },
  ];

  const defaultSortOptions = [
    { value: 'created_at_desc', label: t('mas_recientes', 'Más recientes') },
    { value: 'created_at_asc', label: t('mas_antiguos', 'Más antiguos') },
    { value: 'nombre_asc', label: t('nombre_az', 'Nombre A-Z') },
    { value: 'nombre_desc', label: t('nombre_za', 'Nombre Z-A') },
  ];

  const finalTypeOptions = typeOptions.length > 0 ? typeOptions : defaultTypeOptions;
  const finalStatusOptions = statusOptions.length > 0 ? statusOptions : defaultStatusOptions;
  const finalSortOptions = sortOptions.length > 0 ? sortOptions : defaultSortOptions;

  // Efecto para animar la barra de progreso
  useEffect(() => {
    if (isLoading) {
      setProgress(0);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 15;
        });
      }, 200);
    } else {
      setProgress(100);
      setTimeout(() => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
      }, 500);
    }
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isLoading]);

  // Sincronizar con filtros externos (cuando el padre actualiza)
  useEffect(() => {
    if (!isInternalUpdate.current) {
      if (filters.search !== undefined && filters.search !== buscar) {
        setBuscar(filters.search || '');
      }
      if (filters.tipo !== undefined && filters.tipo !== tipo) {
        setTipo(filters.tipo || '');
      }
      if (filters.estado !== undefined && filters.estado !== estado) {
        setEstado(filters.estado || '');
      }
      if (filters.sort !== undefined && filters.sort !== sort) {
        setSort(filters.sort || '');
      }
    }
    isInternalUpdate.current = false;
  }, [filters.search, filters.tipo, filters.estado, filters.sort]);

  // Función para notificar cambios al padre
  const notifyFilterChange = useCallback((nuevosFiltros) => {
    isInternalUpdate.current = true;
    if (onFilterChange) {
      onFilterChange(nuevosFiltros);
    }
  }, [onFilterChange]);

  // Aplicar filtros (buscar)
  const aplicarFiltros = useCallback(() => {
    const filtros = {};
    if (buscar.trim()) filtros.search = buscar.trim();
    if (tipo) filtros.tipo = tipo;
    if (estado) filtros.estado = estado;
    if (sort) filtros.sort = sort;
    notifyFilterChange(filtros);
    setMostrarSugerencias(false);
  }, [buscar, tipo, estado, sort, notifyFilterChange]);

  const handleBuscarChange = (e) => {
    const value = e.target.value;
    setBuscar(value);
  };

  const handleBuscarClick = () => {
    aplicarFiltros();
  };

  const handleKeyDown = (e) => {
    if (!mostrarSugerencias || sugerencias.length === 0) {
      if (e.key === 'Enter') {
        e.preventDefault();
        aplicarFiltros();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSugerenciaSeleccionada(prev => 
          prev < sugerencias.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSugerenciaSeleccionada(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (sugerenciaSeleccionada >= 0) {
          const sugerencia = sugerencias[sugerenciaSeleccionada];
          setBuscar(sugerencia);
          setMostrarSugerencias(false);
          const filtros = {};
          if (sugerencia.trim()) filtros.search = sugerencia.trim();
          if (tipo) filtros.tipo = tipo;
          if (estado) filtros.estado = estado;
          if (sort) filtros.sort = sort;
          notifyFilterChange(filtros);
        } else {
          aplicarFiltros();
        }
        break;
      case 'Escape':
        setMostrarSugerencias(false);
        setSugerenciaSeleccionada(-1);
        break;
    }
  };

  const seleccionarSugerencia = (sugerencia) => {
    setBuscar(sugerencia);
    setMostrarSugerencias(false);
    const filtros = {};
    if (sugerencia.trim()) filtros.search = sugerencia.trim();
    if (tipo) filtros.tipo = tipo;
    if (estado) filtros.estado = estado;
    if (sort) filtros.sort = sort;
    notifyFilterChange(filtros);
  };

  const limpiarTodo = () => {
    setBuscar('');
    setTipo('');
    setEstado('');
    setSort('');
    setSugerencias([]);
    setMostrarSugerencias(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    notifyFilterChange({
      search: '',
      tipo: '',
      estado: '',
      sort: '',
    });
  };

  const handleSelectChange = (tipoSelect, valor) => {
    if (tipoSelect === 'tipo') {
      setTipo(valor);
      const nuevosFiltros = {};
      if (buscar.trim()) nuevosFiltros.search = buscar.trim();
      if (valor) nuevosFiltros.tipo = valor;
      if (estado) nuevosFiltros.estado = estado;
      if (sort) nuevosFiltros.sort = sort;
      notifyFilterChange(nuevosFiltros);
    } else if (tipoSelect === 'estado') {
      setEstado(valor);
      const nuevosFiltros = {};
      if (buscar.trim()) nuevosFiltros.search = buscar.trim();
      if (tipo) nuevosFiltros.tipo = tipo;
      if (valor) nuevosFiltros.estado = valor;
      if (sort) nuevosFiltros.sort = sort;
      notifyFilterChange(nuevosFiltros);
    } else if (tipoSelect === 'sort') {
      setSort(valor);
      const nuevosFiltros = {};
      if (buscar.trim()) nuevosFiltros.search = buscar.trim();
      if (tipo) nuevosFiltros.tipo = tipo;
      if (estado) nuevosFiltros.estado = estado;
      if (valor) nuevosFiltros.sort = valor;
      notifyFilterChange(nuevosFiltros);
    }
  };

  const obtenerSugerencias = useCallback((texto) => {
    if (!texto.trim() || texto.length < 2) return [];
    return [];
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (buscar.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        const nuevasSugerencias = obtenerSugerencias(buscar);
        setSugerencias(nuevasSugerencias);
        setMostrarSugerencias(nuevasSugerencias.length > 0);
      }, 300);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [buscar, obtenerSugerencias]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sugerenciasRef.current && 
          !sugerenciasRef.current.contains(event.target) &&
          inputRef.current &&
          !inputRef.current.contains(event.target)) {
        setMostrarSugerencias(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hayFiltrosActivos = buscar || tipo || estado;

  return (
    <div className="filter-bar-container reveal-up delay-100">
      <div className="filter-bar-filters-row">
        {/* Buscador */}
        <div className="filter-bar-search-wrapper">
          <label className="filter-bar-label">
            <i className="fas fa-search"></i> {t("buscar", "Buscar")}
          </label>
          <div className="filter-bar-search-box">
            <span className="filter-bar-search-icon">
              <i className="fas fa-search"></i>
            </span>
            <input
              ref={inputRef}
              type="text"
              className="filter-bar-search-input"
              placeholder={placeholder}
              value={buscar}
              onChange={handleBuscarChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (buscar.length >= 2 && sugerencias.length > 0) {
                  setMostrarSugerencias(true);
                }
              }}
              autoComplete="off"
            />
            {buscar && (
              <button className="filter-bar-clear-btn" onClick={() => setBuscar('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
            <button className="filter-bar-search-btn" onClick={handleBuscarClick} disabled={isLoading}>
              <i className="fas fa-search"></i>
              <span>{isLoading ? '...' : t("buscar", "Buscar")}</span>
            </button>
          </div>

          {/* Progress Bar */}
          {isLoading && (
            <div className="filter-bar-progress-inline">
              <ProgressBar progress={progress} height="3px" animated={true} variant="gradient" />
            </div>
          )}

          {/* Sugerencias */}
          {mostrarSugerencias && sugerencias.length > 0 && (
            <div ref={sugerenciasRef} className="filter-bar-sugerencias-dropdown">
              {sugerencias.map((sugerencia, index) => (
                <div
                  key={index}
                  className={`filter-bar-sugerencia-item ${index === sugerenciaSeleccionada ? 'filter-bar-selected' : ''}`}
                  onClick={() => seleccionarSugerencia(sugerencia)}
                  onMouseEnter={() => setSugerenciaSeleccionada(index)}
                >
                  <span className="filter-bar-sugerencia-icon">
                    <i className="fas fa-search"></i>
                  </span>
                  <span className="filter-bar-sugerencia-text">{sugerencia}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selects con etiquetas */}
        <div className="filter-bar-selects-group">
          {showTypeFilter && (
            <div className="filter-bar-select-item">
              <label className="filter-bar-label">
                <i className="fas fa-users"></i> {t("tipo", "Tipo")}
              </label>
              <CustomSelect
                options={finalTypeOptions}
                value={tipo}
                onChange={(e) => handleSelectChange('tipo', e.target.value)}
                placeholder={t('seleccionar_tipo', 'Seleccionar tipo')}
              />
            </div>
          )}
          
          {showStatusFilter && (
            <div className="filter-bar-select-item">
              <label className="filter-bar-label">
                <i className="fas fa-circle"></i> {t("estado", "Estado")}
              </label>
              <CustomSelect
                options={finalStatusOptions}
                value={estado}
                onChange={(e) => handleSelectChange('estado', e.target.value)}
                placeholder={t('seleccionar_estado', 'Seleccionar estado')}
              />
            </div>
          )}
          
          {showSort && (
            <div className="filter-bar-select-item">
              <label className="filter-bar-label">
                <i className="fas fa-sort"></i> {t("ordenar", "Ordenar")}
              </label>
              <CustomSelect
                options={finalSortOptions}
                value={sort}
                onChange={(e) => handleSelectChange('sort', e.target.value)}
                placeholder={t('seleccionar_orden', 'Seleccionar orden')}
              />
            </div>
          )}
        </div>
      </div>

      {/* Botón limpiar filtros */}
      {hayFiltrosActivos && (
        <div className="filter-bar-limpiar-wrapper">
          <button className="filter-bar-btn-limpiar reveal-up delay-200" onClick={limpiarTodo}>
            <i className="fas fa-trash-alt"></i>
            <span>{t("limpiar_todo", "Limpiar filtros")}</span>
          </button>
        </div>
      )}

      {/* Resultados */}
      {filters.total !== undefined && filters.total !== null && (
        <div className="filter-bar-results">
          <i className="fas fa-list"></i>
          <span>{filters.total} {t("resultados", "resultados")}</span>
        </div>
      )}
    </div>
  );
};

export default FilterBar;