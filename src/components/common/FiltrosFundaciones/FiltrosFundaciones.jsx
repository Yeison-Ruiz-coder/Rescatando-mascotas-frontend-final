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
  
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);
  const timeoutRef = useRef(null);
  const fundacionesRef = useRef(fundaciones);

  // Mantener referencia actualizada
  useEffect(() => {
    fundacionesRef.current = fundaciones;
  }, [fundaciones]);

  // Función para obtener sugerencias - CON TODOS LOS CAMPOS
  const obtenerSugerencias = useCallback((texto) => {
    if (!texto.trim() || texto.length < 2) return [];

    const textoLower = texto.toLowerCase();
    const palabrasUnicas = new Set();
    const fundacionesActuales = fundacionesRef.current;

    fundacionesActuales.forEach(fundacion => {
      // ===== CAMPOS BÁSICOS =====
      if (fundacion.Nombre_1?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(fundacion.Nombre_1);
      }
      if (fundacion.Direccion?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(fundacion.Direccion);
      }
      if (fundacion.ciudad?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(fundacion.ciudad);
      }

      // ===== CONTACTO =====
      if (fundacion.Telefono?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(fundacion.Telefono);
      }
      if (fundacion.Email?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(fundacion.Email);
      }

      // ===== REGISTROS =====
      if (fundacion.registro_sanitario?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(`${t('registro_sanitario', 'Registro sanitario')}: ${fundacion.registro_sanitario}`);
      }

      // ===== CAPACIDAD =====
      if (fundacion.capacidad_maxima) {
        const capacidadStr = fundacion.capacidad_maxima.toString();
        if (capacidadStr.includes(textoLower)) {
          palabrasUnicas.add(`${fundacion.capacidad_maxima} ${t('animales', 'animales')}`);
        }
        if (textoLower.includes('pequeña') && fundacion.capacidad_maxima < 50) {
          palabrasUnicas.add(t('capacidad_pequeña', 'Capacidad pequeña'));
        }
        if (textoLower.includes('mediana') && fundacion.capacidad_maxima >= 50 && fundacion.capacidad_maxima < 150) {
          palabrasUnicas.add(t('capacidad_mediana', 'Capacidad mediana'));
        }
        if (textoLower.includes('grande') && fundacion.capacidad_maxima >= 150) {
          palabrasUnicas.add(t('capacidad_grande', 'Capacidad grande'));
        }
      }

      // ===== NECESIDADES ACTUALES (JSON) =====
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

      // ===== HORARIO =====
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

      // ===== VOLUNTARIOS =====
      if (textoLower.includes('voluntario') || textoLower.includes('voluntarios') || textoLower.includes('ayudar')) {
        if (fundacion.recibe_voluntarios === true) {
          palabrasUnicas.add(t('recibe_voluntarios', 'Recibe voluntarios'));
        } else if (fundacion.recibe_voluntarios === false) {
          palabrasUnicas.add(t('no_recibe_voluntarios', 'No recibe voluntarios'));
        }
      }

      // ===== VERIFICACIÓN =====
      if (textoLower.includes('verificado') || textoLower.includes('oficial') || textoLower.includes('confiable')) {
        if (fundacion.verificado === true) {
          palabrasUnicas.add(t('verificado', 'Verificado'));
        }
      }

      // ===== UBICACIÓN (lat/lng) =====
      if (fundacion.lat && fundacion.lng) {
        if (textoLower.includes('cerca') || textoLower.includes('cercano') || textoLower.includes('ubicado')) {
          palabrasUnicas.add(t('tiene_ubicacion', 'Ubicación disponible'));
        }
      }

      // ===== RADIO DE ATENCIÓN =====
      if (fundacion.radio_atencion) {
        const radioStr = fundacion.radio_atencion.toString();
        if (radioStr.includes(textoLower)) {
          palabrasUnicas.add(`${t('radio_atencion', 'Radio de atención')}: ${fundacion.radio_atencion} km`);
        }
      }

      // ===== FECHA DE FUNDACIÓN =====
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
        
        // Antigüedad
        const añosAntiguedad = new Date().getFullYear() - fecha.getFullYear();
        if (textoLower.includes('antigua') && añosAntiguedad > 10) {
          palabrasUnicas.add(t('fundacion_antigua', 'Fundación con trayectoria'));
        }
        if (textoLower.includes('nueva') && añosAntiguedad < 3) {
          palabrasUnicas.add(t('fundacion_nueva', 'Fundación nueva'));
        }
      }

      // ===== VERIFICAR SI TIENE IMAGEN =====
      if (textoLower.includes('imagen') || textoLower.includes('foto') || textoLower.includes('portada')) {
        if (fundacion.imagen_portada) {
          palabrasUnicas.add(t('tiene_imagen', 'Tiene imagen de portada'));
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
          const sugerenciaLimpia = sugerencias[sugerenciaSeleccionada].replace(/^(Registro sanitario:|Necesita:|Horario:|Radio de atención:|Fundada en:)\s*/, '');
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
      {isLoading && (
        <div className="ff-progress">
          <ProgressBar progress={100} height="3px" animated={true} variant="gradient" />
        </div>
      )}

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

        {mostrarSugerencias && sugerencias.length > 0 && (
          <div ref={sugerenciasRef} className="ff-sugerencias-dropdown">
            {sugerencias.map((sugerencia, index) => (
              <div
                key={index}
                className={`ff-sugerencia-item ${index === sugerenciaSeleccionada ? 'ff-selected' : ''}`}
                onClick={() => seleccionarSugerencia(sugerencia.replace(/^(Registro sanitario:|Necesita:|Horario:|Radio de atención:|Fundada en:)\s*/, ''))}
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