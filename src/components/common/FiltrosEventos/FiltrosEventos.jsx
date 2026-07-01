// src/components/common/FiltrosEventos/FiltrosEventos.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../ProgressBar/ProgressBar';
import { publicApi } from '../../../services/api';
import { extractArrayFromResponse } from '../../../utils/responseUtils';
import './FiltrosEventos.css';

const FiltrosEventos = ({ 
  onFilterChange, 
  isLoading = false 
}) => {
  const { t } = useTranslation('eventos');
  
  const [buscar, setBuscar] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(-1);
  const [progress, setProgress] = useState(0);
  
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);
  const timeoutRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const suggestionsAbortControllerRef = useRef(null);
  const currentQueryRef = useRef('');

  // Efecto para animar la barra de progreso cuando isLoading cambia
  useEffect(() => {
    if (isLoading) {
      // Reiniciar progreso
      setProgress(0);
      
      // Animar progreso de 0 a 90 (nunca llega a 100 hasta que termine)
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      
      progressIntervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return 90;
          return prev + Math.random() * 15;
        });
      }, 200);
    } else {
      // Cuando termina la carga, completar al 100
      setProgress(100);
      
      // Limpiar intervalo después de un momento
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

  // Resto de tu código igual...
  // (todas las funciones: aplicarFiltros, handleBuscarClick, handleKeyDown, etc.)
  
  const fetchSugerencias = useCallback(async (texto) => {
    if (!texto.trim() || texto.length < 2) return;

    if (suggestionsAbortControllerRef.current) {
      suggestionsAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    suggestionsAbortControllerRef.current = controller;
    currentQueryRef.current = texto;

    try {
      const response = await publicApi.get('/eventos/obtener-sugerencias', {
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

  const aplicarFiltros = useCallback(() => {
    const filtros = {};
    if (buscar.trim()) {
      filtros.buscar = buscar.trim();
      filtros.reiniciar_filtros = true;
    }
    onFilterChange(filtros);
    setMostrarSugerencias(false);
  }, [buscar, onFilterChange]);

  // Buscar al hacer click en el botón
  const handleBuscarClick = () => {
    aplicarFiltros();
  };

  // Manejo de teclado
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

  // Seleccionar sugerencia
  const seleccionarSugerencia = (sugerencia) => {
    setBuscar(sugerencia);
    setMostrarSugerencias(false);
    onFilterChange({ buscar: sugerencia.trim(), reiniciar_filtros: true });
  };

  // Limpiar búsqueda
  const limpiarBusqueda = () => {
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

  // Efecto para sugerencias con debounce
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [buscar, fetchSugerencias]);

  useEffect(() => {
    return () => {
      if (suggestionsAbortControllerRef.current) {
        suggestionsAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Cerrar sugerencias al hacer clic fuera
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
    <div className="fe-container reveal-up delay-100">
      <div className="fe-search-wrapper">
        <label className="fe-filter-label">
          <i className="fas fa-search"></i> {t("buscar_evento", "Buscar evento")}
        </label>
        <div className="fe-search-box">
          <span className="fe-search-icon">
            <i className="fas fa-search"></i>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="fe-search-input"
            placeholder={t("buscar_placeholder", "Buscar por nombre, lugar o categoría...")}
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (buscar.length >= 2 && sugerencias.length > 0) {
                setMostrarSugerencias(true);
              }
            }}
            autoComplete="off"
          />
          {buscar && (
            <button className="fe-clear-btn" onClick={() => setBuscar('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
          <button className="fe-search-btn" onClick={handleBuscarClick} disabled={isLoading}>
            <i className="fas fa-search"></i>
            <span>{isLoading ? '...' : t("buscar", "Buscar")}</span>
          </button>
        </div>

        {/* Progress Bar - CON PROGRESO ANIMADO */}
        {isLoading && (
          <div className="fe-progress-inline">
            <ProgressBar progress={progress} height="3px" animated={true} variant="gradient" />
          </div>
        )}

        {/* Sugerencias */}
        {mostrarSugerencias && sugerencias.length > 0 && (
          <div ref={sugerenciasRef} className="fe-sugerencias-dropdown">
            {sugerencias.map((sugerencia, index) => (
              <div
                key={index}
                className={`fe-sugerencia-item ${index === sugerenciaSeleccionada ? 'fe-selected' : ''}`}
                onClick={() => seleccionarSugerencia(sugerencia)}
                onMouseEnter={() => setSugerenciaSeleccionada(index)}
              >
                <span className="fe-sugerencia-icon">
                  <i className="fas fa-search"></i>
                </span>
                <span className="fe-sugerencia-text">{sugerencia}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón limpiar búsqueda */}
      {hayFiltrosActivos && (
        <div className="fe-limpiar-wrapper">
          <button className="fe-btn-limpiar reveal-up delay-200" onClick={limpiarBusqueda}>
            <i className="fas fa-trash-alt"></i>
            <span>{t("limpiar", "Limpiar búsqueda")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltrosEventos;