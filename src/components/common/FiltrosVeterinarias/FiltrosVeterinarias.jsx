// src/components/common/FiltrosVeterinarias/FiltrosVeterinarias.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../ProgressBar/ProgressBar';
import { publicApi } from '../../../services/api';
import { extractArrayFromResponse } from '../../../utils/responseUtils';
import './FiltrosVeterinarias.css';

const FiltrosVeterinarias = ({ 
  onFilterChange, 
  isLoading = false 
}) => {
  const { t } = useTranslation('veterinarias');
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

  const fetchSugerencias = useCallback(async (texto) => {
    if (!texto.trim() || texto.length < 2) return;

    if (suggestionsAbortControllerRef.current) {
      suggestionsAbortControllerRef.current.abort();
    }

    const controller = new AbortController();
    suggestionsAbortControllerRef.current = controller;
    currentQueryRef.current = texto;

    try {
      const response = await publicApi.get('/veterinarias/obtener-sugerencias', {
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

  const handleKeyDown = (e) => {
    if (!mostrarSugerencias || sugerencias.length === 0) {
      if (e.key === 'Enter') handleSearch();
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
          const sugerenciaLimpia = sugerencias[sugerenciaSeleccionada].replace(/^(Servicio:|Horario:|Consulta:)\s*/, '');
          seleccionarSugerencia(sugerenciaLimpia);
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setMostrarSugerencias(false);
        setSugerenciaSeleccionada(-1);
        break;
    }
  };

  const handleSearch = () => {
    const filtros = {};
    if (buscar.trim()) {
      filtros.buscar = buscar.trim();
      filtros.reiniciar_filtros = true;
    }
    onFilterChange(filtros);
    setMostrarSugerencias(false);
  };

  const seleccionarSugerencia = (sugerencia) => {
    setBuscar(sugerencia);
    setMostrarSugerencias(false);
    onFilterChange({ buscar: sugerencia.trim(), reiniciar_filtros: true });
  };

  const limpiarBusqueda = () => {
    setBuscar('');
    onFilterChange({});
    setSugerencias([]);
    setMostrarSugerencias(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (suggestionsAbortControllerRef.current) {
      suggestionsAbortControllerRef.current.abort();
      suggestionsAbortControllerRef.current = null;
    }
  };

  return (
    <div className="fv-container">
      <div className="fv-search-wrapper">
        <div className="fv-search-box">
          <span className="fv-search-icon">
            <i className="fas fa-search"></i>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="fv-search-input"
            placeholder={t("buscar_placeholder", "Buscar veterinarias por nombre, servicio, ciudad, especialidad...")}
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
            <button className="fv-clear-btn" onClick={() => setBuscar('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
          <button className="fv-search-btn" onClick={handleSearch} disabled={isLoading}>
            <i className="fas fa-search"></i>
            <span>{isLoading ? '...' : t("buscar", "Buscar")}</span>
          </button>
        </div>

        {/* Progress Bar - DENTRO del buscador */}
        {isLoading && (
          <div className="fv-progress-inline">
            <ProgressBar progress={progress} height="3px" animated={true} variant="gradient" />
          </div>
        )}

        {mostrarSugerencias && sugerencias.length > 0 && (
          <div ref={sugerenciasRef} className="fv-sugerencias-dropdown">
            {sugerencias.map((sugerencia, index) => (
              <div
                key={index}
                className={`fv-sugerencia-item ${index === sugerenciaSeleccionada ? 'fv-selected' : ''}`}
                onClick={() => seleccionarSugerencia(sugerencia.replace(/^(Servicio:|Horario:|Consulta:)\s*/, ''))}
                onMouseEnter={() => setSugerenciaSeleccionada(index)}
              >
                <span className="fv-sugerencia-icon">
                  <i className="fas fa-search"></i>
                </span>
                <span className="fv-sugerencia-text">{sugerencia}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {buscar && (
        <div className="fv-limpiar-wrapper">
          <button className="fv-btn-limpiar" onClick={limpiarBusqueda}>
            <i className="fas fa-trash-alt"></i>
            <span>{t("limpiar", "Limpiar")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltrosVeterinarias;