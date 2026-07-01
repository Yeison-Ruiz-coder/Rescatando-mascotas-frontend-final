// src/components/common/FiltrosMascotas/FiltrosMascotas.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../ProgressBar/ProgressBar';
import { publicApi } from '../../../services/api';
import { extractArrayFromResponse } from '../../../utils/responseUtils';
import './FiltrosMascotas.css';

const FiltrosMascotas = ({ 
  onFilterChange, 
  isLoading = false,
}) => {
  const { t } = useTranslation('mascotas');
  
  const [buscar, setBuscar] = useState('');
  const [progress, setProgress] = useState(0);
  
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(-1);
  
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);
  const timeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const suggestionsAbortControllerRef = useRef(null);
  const currentQueryRef = useRef('');

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

  const aplicarFiltros = useCallback(() => {
    const filtros = {};
    if (buscar.trim()) {
      filtros.buscar = buscar.trim();
      filtros.reiniciar_filtros = true;
    }
    onFilterChange(filtros);
    setMostrarSugerencias(false);
  }, [buscar, onFilterChange]);

  const fetchSugerencias = useCallback(async (texto) => {
    if (!texto.trim() || texto.length < 2) return;

    if (suggestionsAbortControllerRef.current) {
      suggestionsAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    suggestionsAbortControllerRef.current = controller;
    currentQueryRef.current = texto;

    try {
      const response = await publicApi.get('/mascotas/obtener-sugerencias', {
        params: { q: texto, limit: 10 },
        signal: controller.signal,
      });

      const nuevasSugerencias = extractArrayFromResponse(response).slice(0, 10);

      if (currentQueryRef.current !== texto) return;

      setSugerencias(nuevasSugerencias);
      setMostrarSugerencias(nuevasSugerencias.length > 0);
    } catch (error) {
      if (error.name === 'CanceledError' || error.name === 'AbortError') return;
      console.error('Error obteniendo sugerencias:', error);
    }
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (buscar.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        fetchSugerencias(buscar);
      }, 300);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
      if (suggestionsAbortControllerRef.current) {
        suggestionsAbortControllerRef.current.abort();
        suggestionsAbortControllerRef.current = null;
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [buscar, fetchSugerencias]);

  useEffect(() => {
    return () => {
      if (suggestionsAbortControllerRef.current) {
        suggestionsAbortControllerRef.current.abort();
      }
    };
  }, []);

  const handleBuscarChange = (e) => {
    setBuscar(e.target.value);
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
          aplicarFiltros();
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
    onFilterChange({ buscar: sugerencia.trim(), reiniciar_filtros: true });
  };

  const limpiarTodo = () => {
    setBuscar('');
    onFilterChange({});
    setSugerencias([]);
    setMostrarSugerencias(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (suggestionsAbortControllerRef.current) {
      suggestionsAbortControllerRef.current.abort();
      suggestionsAbortControllerRef.current = null;
    }
  };

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

  const hayFiltrosActivos = buscar;

  return (
    <div className="fm-container reveal-up delay-100">
      <div className="fm-filters-row">
        {/* Buscador */}
        <div className="fm-search-wrapper">
          <label className="fm-filter-label">
            <i className="fas fa-search"></i> {t("buscar_mascota", "Buscar mascota")}
          </label>
          <div className="fm-search-box">
            <span className="fm-search-icon">
              <i className="fas fa-search"></i>
            </span>
            <input
              ref={inputRef}
              type="text"
              className="fm-search-input"
              placeholder={t("buscar_placeholder", "Nombre, especie, ubicación...")}
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
              <button className="fm-clear-btn" onClick={() => setBuscar('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
            <button className="fm-search-btn" onClick={handleBuscarClick} disabled={isLoading}>
              <i className="fas fa-search"></i>
              <span>{isLoading ? '...' : t("buscar", "Buscar")}</span>
            </button>
          </div>

          {/* Progress Bar - DENTRO del buscador */}
          {isLoading && (
            <div className="fm-progress-inline">
              <ProgressBar progress={progress} height="3px" animated={true} variant="gradient" />
            </div>
          )}

          {/* Sugerencias */}
          {mostrarSugerencias && sugerencias.length > 0 && (
            <div ref={sugerenciasRef} className="fm-sugerencias-dropdown">
              {sugerencias.map((sugerencia, index) => (
                <div
                  key={index}
                  className={`fm-sugerencia-item ${index === sugerenciaSeleccionada ? 'fm-selected' : ''}`}
                  onClick={() => seleccionarSugerencia(sugerencia)}
                  onMouseEnter={() => setSugerenciaSeleccionada(index)}
                >
                  <span className="fm-sugerencia-icon">
                    <i className="fas fa-search"></i>
                  </span>
                  <span className="fm-sugerencia-text">{sugerencia}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Botón limpiar filtros */}
      {hayFiltrosActivos && (
        <div className="fm-limpiar-wrapper">
          <button className="fm-btn-limpiar reveal-up delay-200" onClick={limpiarTodo}>
            <i className="fas fa-trash-alt"></i>
            <span>{t("limpiar_todo", "Limpiar filtros")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltrosMascotas;