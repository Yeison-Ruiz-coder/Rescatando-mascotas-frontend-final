// src/components/common/FiltrosVeterinarias/FiltrosVeterinarias.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../ProgressBar/ProgressBar';
import './FiltrosVeterinarias.css';

const FiltrosVeterinarias = ({ 
  onFilterChange, 
  veterinarias = [],
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
  const veterinariasRef = useRef(veterinarias);
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
    veterinariasRef.current = veterinarias;
  }, [veterinarias]);

  // Función para obtener sugerencias
  const obtenerSugerencias = useCallback((texto) => {
    if (!texto.trim() || texto.length < 2) return [];

    const textoLower = texto.toLowerCase();
    const palabrasUnicas = new Set();
    const veterinariasActuales = veterinariasRef.current;

    veterinariasActuales.forEach(veterinaria => {
      // Campos básicos
      if (veterinaria.Nombre_vet?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(veterinaria.Nombre_vet);
      }
      if (veterinaria.Direccion?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(veterinaria.Direccion);
      }
      if (veterinaria.ciudad?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(veterinaria.ciudad);
      }
      if (veterinaria.departamento?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(veterinaria.departamento);
      }
      if (veterinaria.Telefono?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(veterinaria.Telefono);
      }
      if (veterinaria.Email?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(veterinaria.Email);
      }

      // Servicios
      if (veterinaria.servicios) {
        let servicios = [];
        try {
          servicios = typeof veterinaria.servicios === 'string' 
            ? JSON.parse(veterinaria.servicios) 
            : veterinaria.servicios;
        } catch(e) { servicios = []; }
        
        servicios.forEach(servicio => {
          if (servicio?.toLowerCase().includes(textoLower)) {
            palabrasUnicas.add(`${t('servicio', 'Servicio')}: ${servicio}`);
          }
        });
      }

      // Horario
      if (veterinaria.horario_atencion?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(`${t('horario', 'Horario')}: ${veterinaria.horario_atencion}`);
      }

      // Urgencias 24h
      if (textoLower.includes('urgencia') || textoLower.includes('emergencia') || textoLower.includes('24h')) {
        if (veterinaria.urgencias_24h === true) {
          palabrasUnicas.add(t('urgencias_24h', 'Urgencias 24 horas'));
        }
      }

      // Verificado
      if (textoLower.includes('verificado') || textoLower.includes('oficial')) {
        if (veterinaria.verificado === true) {
          palabrasUnicas.add(t('verificado', 'Verificado'));
        }
      }

      // Años de experiencia
      if (veterinaria.anios_experiencia) {
        const expStr = veterinaria.anios_experiencia.toString();
        if (expStr.includes(textoLower)) {
          palabrasUnicas.add(`${veterinaria.anios_experiencia} ${t('años_experiencia', 'años de experiencia')}`);
        }
      }

      // Precio consulta
      if (veterinaria.precio_consulta) {
        const precioStr = veterinaria.precio_consulta.toString();
        if (precioStr.includes(textoLower)) {
          palabrasUnicas.add(`${t('consulta', 'Consulta')}: $${veterinaria.precio_consulta}`);
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