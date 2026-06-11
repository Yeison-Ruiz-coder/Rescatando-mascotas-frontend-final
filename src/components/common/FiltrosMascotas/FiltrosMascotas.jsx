// src/components/common/FiltrosMascotas/FiltrosMascotas.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../ProgressBar/ProgressBar';
import CustomSelect from '../CustomSelect/CustomSelect';
import './FiltrosMascotas.css';

const FiltrosMascotas = ({ 
  onFilterChange, 
  mascotas = [],
  isLoading = false,
  especies = []  // Recibir especies desde el padre
}) => {
  const { t } = useTranslation('mascotas');
  
  // Estados de filtros
  const [buscar, setBuscar] = useState('');
  const [especie, setEspecie] = useState('');
  const [genero, setGenero] = useState('');
  const [tamano, setTamano] = useState('');
  
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(-1);
  
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);
  const timeoutRef = useRef(null);
  const mascotasRef = useRef(mascotas);

  // Opciones para los selects
  const opcionesGenero = [
    { value: '', label: t('todos', 'Todos') },
    { value: 'Macho', label: t('macho', 'Macho') },
    { value: 'Hembra', label: t('hembra', 'Hembra') }
  ];
  
  const opcionesTamano = [
    { value: '', label: t('todos', 'Todos') },
    { value: 'pequeño', label: t('pequeño', 'Pequeño') },
    { value: 'mediano', label: t('mediano', 'Mediano') },
    { value: 'grande', label: t('grande', 'Grande') },
    { value: 'muy_grande', label: t('muy_grande', 'Muy grande') }
  ];

  // Opciones para especies (dinámicas desde el backend)
  const opcionesEspecies = [
    { value: '', label: t('todas', 'Todas') },
    ...especies.map(esp => ({ value: esp, label: esp }))
  ];

  // Mantener referencia actualizada
  useEffect(() => {
    mascotasRef.current = mascotas;
  }, [mascotas]);

  // 🔥 Función que aplica TODOS los filtros
  const aplicarFiltros = useCallback(() => {
    const filtros = {};
    if (buscar.trim()) filtros.buscar = buscar.trim();
    if (especie) filtros.especie = especie;
    if (genero) filtros.genero = genero;
    if (tamano) filtros.tamano = tamano;
    onFilterChange(filtros);
    setMostrarSugerencias(false);
  }, [buscar, especie, genero, tamano, onFilterChange]);

  // Función para obtener sugerencias
  const obtenerSugerencias = useCallback((texto) => {
    if (!texto.trim() || texto.length < 2) return [];

    const textoLower = texto.toLowerCase();
    const palabrasUnicas = new Set();
    const mascotasActuales = mascotasRef.current;

    mascotasActuales.forEach(mascota => {
      if (mascota.nombre_mascota?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(mascota.nombre_mascota);
      }
      if (mascota.especie?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(mascota.especie);
      }
      if (mascota.color?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(mascota.color);
      }
      if (mascota.lugar_rescate?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(mascota.lugar_rescate);
      }
      if (mascota.tamano?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(mascota.tamano);
      }
      if (mascota.genero?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(mascota.genero);
      }
    });

    return Array.from(palabrasUnicas).slice(0, 10);
  }, []);

  // Efecto para manejar la búsqueda con debounce
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

  // Aplicar filtros cuando cambian los selects
  useEffect(() => {
    aplicarFiltros();
  }, [especie, genero, tamano, aplicarFiltros]);

  const handleKeyDown = (e) => {
    if (!mostrarSugerencias || sugerencias.length === 0) {
      if (e.key === 'Enter') aplicarFiltros();
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
    aplicarFiltros();
  };

  const limpiarTodo = () => {
    setBuscar('');
    setEspecie('');
    setGenero('');
    setTamano('');
    onFilterChange({});
    setSugerencias([]);
    setMostrarSugerencias(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const hayFiltrosActivos = buscar || especie || genero || tamano;

  return (
    <div className="fm-container">
      {isLoading && (
        <div className="fm-progress">
          <ProgressBar progress={100} height="3px" animated={true} variant="gradient" />
        </div>
      )}

      {/* Fila superior: Búsqueda + Filtros a la derecha */}
      <div className="fm-filters-row">
        {/* Buscador - ocupa más espacio */}
        <div className="fm-search-wrapper">
          <div className="fm-search-box">
            <span className="fm-search-icon">
              <i className="fas fa-search"></i>
            </span>
            <input
              ref={inputRef}
              type="text"
              className="fm-search-input"
              placeholder={t("buscar_placeholder", "Buscar mascotas...")}
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
              <button className="fm-clear-btn" onClick={() => setBuscar('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
            <button className="fm-search-btn" onClick={aplicarFiltros} disabled={isLoading}>
              <i className="fas fa-search"></i>
              <span>{isLoading ? '...' : t("buscar", "Buscar")}</span>
            </button>
          </div>

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

        {/* Filtros a la derecha */}
        <div className="fm-selects-group">
          <CustomSelect
            options={opcionesEspecies}
            value={especie}
            onChange={(e) => setEspecie(e.target.value)}
            placeholder={t('especie', 'Especie')}
          />
          <CustomSelect
            options={opcionesGenero}
            value={genero}
            onChange={(e) => setGenero(e.target.value)}
            placeholder={t('genero', 'Género')}
          />
          <CustomSelect
            options={opcionesTamano}
            value={tamano}
            onChange={(e) => setTamano(e.target.value)}
            placeholder={t('tamano', 'Tamaño')}
          />
        </div>
      </div>

      {/* Botón limpiar filtros */}
      {hayFiltrosActivos && (
        <div className="fm-limpiar-wrapper">
          <button className="fm-btn-limpiar" onClick={limpiarTodo}>
            <i className="fas fa-trash-alt"></i>
            <span>{t("limpiar_todo", "Limpiar filtros")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltrosMascotas;