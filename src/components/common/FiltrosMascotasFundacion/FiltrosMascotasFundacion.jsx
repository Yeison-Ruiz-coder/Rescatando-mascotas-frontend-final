// src/components/common/FiltrosMascotasFundacion/FiltrosMascotasFundacion.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../ProgressBar/ProgressBar';
import CustomSelect from '../CustomSelect/CustomSelect';
import './FiltrosMascotasFundacion.css';

const FiltrosMascotasFundacion = ({ 
  onFilterChange, 
  mascotas = [],
  isLoading = false,
  especies = []
}) => {
  const { t } = useTranslation(['mascotas', 'fundacion']);
  
  const [buscar, setBuscar] = useState('');
  const [especie, setEspecie] = useState('');
  const [genero, setGenero] = useState('');
  const [tamano, setTamano] = useState('');
  const [estado, setEstado] = useState('');
  const [progress, setProgress] = useState(0);
  
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState(-1);
  
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);
  const timeoutRef = useRef(null);
  const mascotasRef = useRef(mascotas);
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

  // ===== OPCIONES =====
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

  // 🔥 NUEVA: Opciones de estado para fundación
  const opcionesEstado = [
    { value: '', label: t('fundacion:todos_estados', 'Todos los estados') },
    { value: 'En adopcion', label: t('mascotas:en_adopcion', 'En adopción') },
    { value: 'Adoptado', label: t('mascotas:adoptado', 'Adoptado') },
    { value: 'Rescatada', label: t('mascotas:rescatada', 'Rescatada') },
    { value: 'En acogida', label: t('mascotas:en_acogida', 'En acogida') },
  ];

  const opcionesEspecies = [
    { value: '', label: t('todas', 'Todas') },
    ...especies.map(esp => ({ value: esp, label: esp }))
  ];

  useEffect(() => {
    mascotasRef.current = mascotas;
  }, [mascotas]);

  const aplicarFiltros = useCallback(() => {
    const filtros = {};
    if (buscar.trim()) filtros.buscar = buscar.trim();
    if (especie) filtros.especie = especie;
    if (genero) filtros.genero = genero;
    if (tamano) filtros.tamano = tamano;
    if (estado) filtros.estado = estado;
    onFilterChange(filtros);
    setMostrarSugerencias(false);
  }, [buscar, especie, genero, tamano, estado, onFilterChange]);

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
    aplicarFiltros();
  };

  const limpiarTodo = () => {
    setBuscar('');
    setEspecie('');
    setGenero('');
    setTamano('');
    setEstado('');
    onFilterChange({});
    setSugerencias([]);
    setMostrarSugerencias(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  const handleSelectChange = (tipo, valor) => {
    if (tipo === 'especie') setEspecie(valor);
    if (tipo === 'genero') setGenero(valor);
    if (tipo === 'tamano') setTamano(valor);
    if (tipo === 'estado') setEstado(valor);
    
    const nuevosFiltros = {};
    if (buscar.trim()) nuevosFiltros.buscar = buscar.trim();
    if (tipo === 'especie' && valor) nuevosFiltros.especie = valor;
    else if (tipo !== 'especie' && especie) nuevosFiltros.especie = especie;
    if (tipo === 'genero' && valor) nuevosFiltros.genero = valor;
    else if (tipo !== 'genero' && genero) nuevosFiltros.genero = genero;
    if (tipo === 'tamano' && valor) nuevosFiltros.tamano = valor;
    else if (tipo !== 'tamano' && tamano) nuevosFiltros.tamano = tamano;
    if (tipo === 'estado' && valor) nuevosFiltros.estado = valor;
    else if (tipo !== 'estado' && estado) nuevosFiltros.estado = estado;
    
    onFilterChange(nuevosFiltros);
  };

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
    });

    return Array.from(palabrasUnicas).slice(0, 10);
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

  const hayFiltrosActivos = buscar || especie || genero || tamano || estado;

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

          {/* Progress Bar */}
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

        {/* Selects con etiquetas */}
        <div className="fm-selects-group">
          <div className="fm-select-item">
            <label className="fm-filter-label">
              <i className="fas fa-paw"></i> {t("especie", "Especie")}
            </label>
            <CustomSelect
              options={opcionesEspecies}
              value={especie}
              onChange={(e) => handleSelectChange('especie', e.target.value)}
              placeholder={t('seleccionar_especie', 'Seleccionar especie')}
            />
          </div>
          
          <div className="fm-select-item">
            <label className="fm-filter-label">
              <i className="fas fa-venus-mars"></i> {t("genero", "Género")}
            </label>
            <CustomSelect
              options={opcionesGenero}
              value={genero}
              onChange={(e) => handleSelectChange('genero', e.target.value)}
              placeholder={t('seleccionar_genero', 'Seleccionar género')}
            />
          </div>
          
          <div className="fm-select-item">
            <label className="fm-filter-label">
              <i className="fas fa-ruler"></i> {t("tamano", "Tamaño")}
            </label>
            <CustomSelect
              options={opcionesTamano}
              value={tamano}
              onChange={(e) => handleSelectChange('tamano', e.target.value)}
              placeholder={t('seleccionar_tamano', 'Seleccionar tamaño')}
            />
          </div>

          {/* 🔥 NUEVO: Select de Estado */}
          <div className="fm-select-item">
            <label className="fm-filter-label">
              <i className="fas fa-circle"></i> {t("fundacion:estado", "Estado")}
            </label>
            <CustomSelect
              options={opcionesEstado}
              value={estado}
              onChange={(e) => handleSelectChange('estado', e.target.value)}
              placeholder={t('fundacion:seleccionar_estado', 'Seleccionar estado')}
            />
          </div>
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

export default FiltrosMascotasFundacion;