// src/components/common/FiltrosFundaciones/FiltrosFundaciones.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../ProgressBar/ProgressBar';
import './FiltrosFundaciones.css';

const FiltrosFundaciones = ({ 
  onFilterChange, 
  fundaciones = [],
  isLoading = false 
}) => {
  const { t } = useTranslation('fundaciones');
  const [buscar, setBuscar] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(-1);
  const [progress, setProgress] = useState(0);
  
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);
  const timeoutRef = useRef(null);
  const fundacionesRef = useRef(fundaciones);
  const progressIntervalRef = useRef(null);

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

  // Mantener referencia actualizada
  useEffect(() => {
    fundacionesRef.current = fundaciones;
  }, [fundaciones]);

  // Función para obtener sugerencias
  const obtenerSugerencias = useCallback((texto) => {
    if (!texto.trim() || texto.length < 2) return [];

    const textoLower = texto.toLowerCase();
    const palabrasUnicas = new Set();
    const fundacionesActuales = fundacionesRef.current;

    fundacionesActuales.forEach(fundacion => {
      if (fundacion.Nombre_1?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(fundacion.Nombre_1);
      }
      if (fundacion.Direccion?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(fundacion.Direccion);
      }
      if (fundacion.ciudad?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(fundacion.ciudad);
      }
      if (fundacion.Telefono?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(fundacion.Telefono);
      }
      if (fundacion.Email?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(fundacion.Email);
      }
      if (fundacion.registro_sanitario?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(`${t('registro_sanitario', 'Registro sanitario')}: ${fundacion.registro_sanitario}`);
      }
      if (fundacion.horario_atencion?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(`${t('horario', 'Horario')}: ${fundacion.horario_atencion}`);
      }
      
      // Búsqueda por días de la semana
      const diasSemana = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo'];
      diasSemana.forEach(dia => {
        if (textoLower.includes(dia) && fundacion.horario_atencion?.toLowerCase().includes(dia)) {
          palabrasUnicas.add(t(`dia_${dia.replace('á', 'a')}`, dia.charAt(0).toUpperCase() + dia.slice(1)));
        }
      });

      // Necesidades actuales
      if (fundacion.necesidades_actuales) {
        let necesidades = [];
        try {
          necesidades = typeof fundacion.necesidades_actuales === 'string' 
            ? JSON.parse(fundacion.necesidades_actuales) 
            : fundacion.necesidades_actuales;
        } catch(e) { necesidades = []; }
        
        necesidades.forEach(necesidad => {
          if (necesidad?.toLowerCase().includes(textoLower)) {
            palabrasUnicas.add(`${t('necesita', 'Necesita')}: ${necesidad}`);
          }
        });
      }

      // Voluntarios
      if (textoLower.includes('voluntario') || textoLower.includes('voluntarios') || textoLower.includes('ayudar')) {
        if (fundacion.recibe_voluntarios === true) {
          palabrasUnicas.add(t('recibe_voluntarios', 'Recibe voluntarios'));
        } else if (fundacion.recibe_voluntarios === false) {
          palabrasUnicas.add(t('no_recibe_voluntarios', 'No recibe voluntarios'));
        }
      }

      // Verificado
      if (textoLower.includes('verificado') || textoLower.includes('oficial') || textoLower.includes('confiable')) {
        if (fundacion.verificado === true) {
          palabrasUnicas.add(t('verificado', 'Verificado'));
        }
      }

      // Fecha de fundación
      if (fundacion.fecha_fundacion) {
        const fecha = new Date(fundacion.fecha_fundacion);
        const año = fecha.getFullYear().toString();
        const mes = fecha.toLocaleString('es', { month: 'long' });
        
        if (año.includes(textoLower)) {
          palabrasUnicas.add(`${t('fundada_en', 'Fundada en')} ${año}`);
        }
        if (mes?.toLowerCase().includes(textoLower)) {
          palabrasUnicas.add(mes);
        }
      }
    });

    return Array.from(palabrasUnicas).slice(0, 10);
  }, [t]);

  // Efecto para manejar la búsqueda con debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [buscar, obtenerSugerencias]);

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
          const sugerenciaLimpia = sugerencias[sugerenciaSeleccionada].replace(/^(Registro sanitario:|Necesita:|Horario:|Fundada en:)\s*/, '');
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
    if (buscar.trim()) filtros.buscar = buscar.trim();
    onFilterChange(filtros);
    setMostrarSugerencias(false);
  };

  const seleccionarSugerencia = (sugerencia) => {
    setBuscar(sugerencia);
    setMostrarSugerencias(false);
    onFilterChange({ buscar: sugerencia.trim() });
  };

  const limpiarBusqueda = () => {
    setBuscar('');
    onFilterChange({});
    setSugerencias([]);
    setMostrarSugerencias(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  return (
    <div className="ff-container">
      <div className="ff-search-wrapper">
        <div className="ff-search-box">
          <span className="ff-search-icon">
            <i className="fas fa-search"></i>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="ff-search-input"
            placeholder={t("buscar_placeholder", "Buscar fundaciones por nombre, ciudad, dirección, necesidades...")}
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
            <button className="ff-clear-btn" onClick={() => setBuscar('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
          <button className="ff-search-btn" onClick={handleSearch} disabled={isLoading}>
            <i className="fas fa-search"></i>
            <span>{isLoading ? '...' : t("buscar", "Buscar")}</span>
          </button>
        </div>

        {/* Progress Bar - DENTRO del buscador */}
        {isLoading && (
          <div className="ff-progress-inline">
            <ProgressBar progress={progress} height="3px" animated={true} variant="gradient" />
          </div>
        )}

        {mostrarSugerencias && sugerencias.length > 0 && (
          <div ref={sugerenciasRef} className="ff-sugerencias-dropdown">
            {sugerencias.map((sugerencia, index) => (
              <div
                key={index}
                className={`ff-sugerencia-item ${index === sugerenciaSeleccionada ? 'ff-selected' : ''}`}
                onClick={() => seleccionarSugerencia(sugerencia.replace(/^(Registro sanitario:|Necesita:|Horario:|Fundada en:)\s*/, ''))}
                onMouseEnter={() => setSugerenciaSeleccionada(index)}
              >
                <span className="ff-sugerencia-icon">
                  <i className="fas fa-search"></i>
                </span>
                <span className="ff-sugerencia-text">{sugerencia}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {buscar && (
        <div className="ff-limpiar-wrapper">
          <button className="ff-btn-limpiar" onClick={limpiarBusqueda}>
            <i className="fas fa-trash-alt"></i>
            <span>{t("limpiar", "Limpiar")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltrosFundaciones;