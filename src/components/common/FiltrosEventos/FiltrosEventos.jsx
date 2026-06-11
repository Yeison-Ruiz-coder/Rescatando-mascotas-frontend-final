// src/components/common/FiltrosEventos/FiltrosEventos.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../ProgressBar/ProgressBar';
import './FiltrosEventos.css';

const FiltrosEventos = ({ 
  onFilterChange, 
  eventos = [],
  isLoading = false 
}) => {
  const { t } = useTranslation('eventos');
  const [buscar, setBuscar] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(-1);
  
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);
  const timeoutRef = useRef(null);
  const eventosRef = useRef(eventos);

  // Mantener referencia actualizada
  useEffect(() => {
    eventosRef.current = eventos;
  }, [eventos]);

  // Función para obtener sugerencias - CON MÁS CAMPOS Y SIN EMOJIS
  const obtenerSugerencias = useCallback((texto) => {
    if (!texto.trim() || texto.length < 2) return [];

    const textoLower = texto.toLowerCase();
    const palabrasUnicas = new Set();
    const eventosActuales = eventosRef.current;

    eventosActuales.forEach(evento => {
      // ===== CAMPOS BÁSICOS =====
      if (evento.nombre_evento?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(evento.nombre_evento);
      }
      if (evento.lugar_evento?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(evento.lugar_evento);
      }
      if (evento.descripcion?.toLowerCase().includes(textoLower)) {
        const palabras = evento.descripcion.split(' ').slice(0, 3);
        palabras.forEach(palabra => {
          if (palabra.toLowerCase().includes(textoLower) && palabra.length > 3) {
            palabrasUnicas.add(palabra);
          }
        });
      }
      if (evento.categoria?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(evento.categoria);
      }
      if (evento.organizador?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(evento.organizador);
      }

      // ===== TIPO =====
      if (evento.tipo?.toLowerCase().includes(textoLower)) {
        if (evento.tipo === 'fundacion') {
          palabrasUnicas.add(t('tipo_fundacion', 'Evento de fundación'));
        } else if (evento.tipo === 'admin') {
          palabrasUnicas.add(t('tipo_admin', 'Evento oficial'));
        }
      }

      // ===== COSTO =====
      if (evento.costo?.toLowerCase().includes(textoLower)) {
        if (evento.costo === 'gratis' || evento.costo === 'free' || parseFloat(evento.costo) === 0) {
          palabrasUnicas.add(t('gratis', 'Gratis'));
        } else {
          palabrasUnicas.add(`${evento.costo}`);
        }
      }

      // ===== CAPACIDAD =====
      if (evento.capacidad_maxima) {
        const capacidadStr = evento.capacidad_maxima.toString();
        if (capacidadStr.includes(textoLower)) {
          palabrasUnicas.add(`${evento.capacidad_maxima} ${t('personas', 'personas')}`);
        }
        if (textoLower.includes('poco') && evento.capacidad_maxima < 20) {
          palabrasUnicas.add(t('capacidad_pequeña', 'Aforo pequeño'));
        }
        if (textoLower.includes('mucho') && evento.capacidad_maxima > 100) {
          palabrasUnicas.add(t('capacidad_grande', 'Aforo grande'));
        }
      }

      // ===== FECHAS =====
      if (evento.fecha_evento) {
        const fecha = new Date(evento.fecha_evento);
        const mes = fecha.toLocaleString('es', { month: 'long' });
        const year = fecha.getFullYear().toString();
        
        if (mes?.toLowerCase().includes(textoLower)) {
          palabrasUnicas.add(mes);
        }
        if (year.includes(textoLower)) {
          palabrasUnicas.add(year);
        }
        
        // Eventos próximos
        const hoy = new Date();
        if (textoLower.includes('próximo') || textoLower.includes('proximo') || textoLower.includes('cercano')) {
          if (fecha > hoy) {
            palabrasUnicas.add(t('eventos_proximos', 'Eventos próximos'));
          }
        }
        
        // Eventos pasados
        if (textoLower.includes('pasado') || textoLower.includes('terminado')) {
          if (fecha < hoy) {
            palabrasUnicas.add(t('eventos_pasados', 'Eventos pasados'));
          }
        }
        
        // Eventos hoy
        if (textoLower.includes('hoy') || textoLower.includes('ahora')) {
          if (fecha.toDateString() === hoy.toDateString()) {
            palabrasUnicas.add(t('eventos_hoy', 'Eventos hoy'));
          }
        }
      }

      if (evento.fecha_fin) {
        const fechaFin = new Date(evento.fecha_fin);
        const mesFin = fechaFin.toLocaleString('es', { month: 'long' });
        if (mesFin?.toLowerCase().includes(textoLower)) {
          palabrasUnicas.add(`${t('hasta', 'Hasta')} ${mesFin}`);
        }
      }

      // ===== CONTACTO =====
      if (evento.telefono_contacto?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(`📞 ${evento.telefono_contacto}`);
      }
      if (evento.email_contacto?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(`✉️ ${evento.email_contacto}`);
      }

      // ===== TAGS (JSON) =====
      if (evento.tags) {
        let tags = [];
        try {
          tags = typeof evento.tags === 'string' 
            ? JSON.parse(evento.tags) 
            : evento.tags;
        } catch(e) { tags = []; }
        
        tags.forEach(tag => {
          if (tag?.toLowerCase().includes(textoLower)) {
            palabrasUnicas.add(tag);
          }
        });
      }

      // ===== FUNDACIÓN (relación) =====
      if (evento.fundacion?.nombre?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(evento.fundacion.nombre);
      }

      // ===== LIKES =====
      if (textoLower.includes('popular') || textoLower.includes('destacado') || textoLower.includes('tendencia')) {
        if (evento.likes && evento.likes > 10) {
          palabrasUnicas.add(t('evento_popular', 'Evento popular'));
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
          const sugerenciaLimpia = sugerencias[sugerenciaSeleccionada].replace(/^[📞✉️]\s*/, '');
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
    <div className="fe-container">
      {isLoading && (
        <div className="fe-progress">
          <ProgressBar progress={100} height="3px" animated={true} variant="gradient" />
        </div>
      )}

      <div className="fe-search-wrapper">
        <div className="fe-search-box">
          <span className="fe-search-icon">
            <i className="fas fa-search"></i>
          </span>
          <input
            ref={inputRef}
            type="text"
            className="fe-search-input"
            placeholder={t("buscar_placeholder", "Buscar eventos...")}
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
          <button className="fe-search-btn" onClick={handleSearch} disabled={isLoading}>
            <i className="fas fa-search"></i>
            <span>{isLoading ? '...' : t("buscar", "Buscar")}</span>
          </button>
        </div>

        {mostrarSugerencias && sugerencias.length > 0 && (
          <div ref={sugerenciasRef} className="fe-sugerencias-dropdown">
            {sugerencias.map((sugerencia, index) => (
              <div
                key={index}
                className={`fe-sugerencia-item ${index === sugerenciaSeleccionada ? 'fe-selected' : ''}`}
                onClick={() => seleccionarSugerencia(sugerencia.replace(/^[📞✉️]\s*/, ''))}
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

      {buscar && (
        <div className="fe-limpiar-wrapper">
          <button className="fe-btn-limpiar" onClick={limpiarBusqueda}>
            <i className="fas fa-trash-alt"></i>
            <span>{t("limpiar", "Limpiar")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltrosEventos;