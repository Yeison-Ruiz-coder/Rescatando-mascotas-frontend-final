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
  
  const inputRef = useRef(null);
  const sugerenciasRef = useRef(null);
  const timeoutRef = useRef(null);
  const veterinariasRef = useRef(veterinarias);

  // Mantener referencia actualizada
  useEffect(() => {
    veterinariasRef.current = veterinarias;
  }, [veterinarias]);

  // Función para obtener sugerencias - CON TODOS LOS CAMPOS
  const obtenerSugerencias = useCallback((texto) => {
    if (!texto.trim() || texto.length < 2) return [];

    const textoLower = texto.toLowerCase();
    const palabrasUnicas = new Set();
    const veterinariasActuales = veterinariasRef.current;

    veterinariasActuales.forEach(veterinaria => {
      // ===== CAMPOS BÁSICOS =====
      if (veterinaria.Nombre_vet?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(veterinaria.Nombre_vet);
      }
      if (veterinaria.descripcion?.toLowerCase().includes(textoLower)) {
        const palabras = veterinaria.descripcion.split(' ').slice(0, 3);
        palabras.forEach(palabra => {
          if (palabra.toLowerCase().includes(textoLower) && palabra.length > 3) {
            palabrasUnicas.add(palabra);
          }
        });
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

      // ===== CONTACTO =====
      if (veterinaria.Telefono?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(veterinaria.Telefono);
      }
      if (veterinaria.Email?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(veterinaria.Email);
      }
      if (veterinaria.whatsapp?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(`WhatsApp: ${veterinaria.whatsapp}`);
      }
      if (veterinaria.sitio_web?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(veterinaria.sitio_web);
      }

      // ===== SERVICIOS (JSON) =====
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

      // ===== SERVICIOS DETALLADOS (JSON) =====
      if (veterinaria.servicios_detallados) {
        let serviciosDetallados = [];
        try {
          serviciosDetallados = typeof veterinaria.servicios_detallados === 'string' 
            ? JSON.parse(veterinaria.servicios_detallados) 
            : veterinaria.servicios_detallados;
        } catch(e) { serviciosDetallados = []; }
        
        serviciosDetallados.forEach(servicio => {
          if (servicio?.toLowerCase().includes(textoLower)) {
            palabrasUnicas.add(servicio);
          }
        });
      }

      // ===== EQUIPO MÉDICO (JSON) =====
      if (veterinaria.equipo_medico) {
        let equipo = [];
        try {
          equipo = typeof veterinaria.equipo_medico === 'string' 
            ? JSON.parse(veterinaria.equipo_medico) 
            : veterinaria.equipo_medico;
        } catch(e) { equipo = []; }
        
        equipo.forEach(item => {
          if (item?.toLowerCase().includes(textoLower)) {
            palabrasUnicas.add(`${t('equipo', 'Equipo')}: ${item}`);
          }
        });
      }

      // ===== HORARIO =====
      if (veterinaria.horario_atencion?.toLowerCase().includes(textoLower)) {
        palabrasUnicas.add(`${t('horario', 'Horario')}: ${veterinaria.horario_atencion}`);
      }
      
      // Búsqueda por días de la semana
      const diasSemana = ['lunes', 'martes', 'miércoles', 'miercoles', 'jueves', 'viernes', 'sábado', 'sabado', 'domingo'];
      diasSemana.forEach(dia => {
        if (textoLower.includes(dia) && veterinaria.horario_atencion?.toLowerCase().includes(dia)) {
          palabrasUnicas.add(t(`dia_${dia.replace('á', 'a')}`, dia.charAt(0).toUpperCase() + dia.slice(1)));
        }
      });

      // ===== EXPERIENCIA =====
      if (veterinaria.anios_experiencia) {
        const expStr = veterinaria.anios_experiencia.toString();
        if (expStr.includes(textoLower)) {
          palabrasUnicas.add(`${veterinaria.anios_experiencia} ${t('años_experiencia', 'años de experiencia')}`);
        }
        if (textoLower.includes('experiencia') || textoLower.includes('trayectoria')) {
          if (veterinaria.anios_experiencia > 10) {
            palabrasUnicas.add(t('amplia_experiencia', 'Amplia experiencia'));
          } else if (veterinaria.anios_experiencia < 3) {
            palabrasUnicas.add(t('nueva', 'Nueva en el mercado'));
          }
        }
      }

      // ===== URGENCIAS 24H =====
      if (textoLower.includes('urgencia') || textoLower.includes('emergencia') || textoLower.includes('24h') || textoLower.includes('24 horas')) {
        if (veterinaria.urgencias_24h === true) {
          palabrasUnicas.add(t('urgencias_24h', 'Urgencias 24 horas'));
        }
      }

      // ===== CONVENIOS (JSON) =====
      if (veterinaria.convenios) {
        let convenios = [];
        try {
          convenios = typeof veterinaria.convenios === 'string' 
            ? JSON.parse(veterinaria.convenios) 
            : veterinaria.convenios;
        } catch(e) { convenios = []; }
        
        convenios.forEach(convenio => {
          if (convenio?.toLowerCase().includes(textoLower)) {
            palabrasUnicas.add(`${t('convenio', 'Convenio')}: ${convenio}`);
          }
        });
      }

      // ===== PRECIO CONSULTA =====
      if (veterinaria.precio_consulta) {
        const precioStr = veterinaria.precio_consulta.toString();
        if (precioStr.includes(textoLower)) {
          palabrasUnicas.add(`${t('consulta', 'Consulta')}: $${veterinaria.precio_consulta}`);
        }
        if (textoLower.includes('económico') && veterinaria.precio_consulta < 30000) {
          palabrasUnicas.add(t('precio_economico', 'Precio económico'));
        }
        if (textoLower.includes('caro') && veterinaria.precio_consulta > 80000) {
          palabrasUnicas.add(t('precio_alto', 'Precio elevado'));
        }
      }

      // ===== SEGUROS =====
      if (textoLower.includes('seguro') || textoLower.includes('aseguradora')) {
        if (veterinaria.acepta_seguros === true) {
          palabrasUnicas.add(t('acepta_seguros', 'Acepta seguros'));
        }
      }

      // ===== VALORACIONES =====
      if (veterinaria.valoracion_promedio > 0) {
        if (textoLower.includes('valoración') || textoLower.includes('calificación') || textoLower.includes('puntuación')) {
          palabrasUnicas.add(`${t('valoracion', 'Valoración')}: ${veterinaria.valoracion_promedio} ★`);
        }
        if (textoLower.includes('mejor') && veterinaria.valoracion_promedio >= 4.5) {
          palabrasUnicas.add(t('mejor_valorado', 'Mejor valorado'));
        }
        if (textoLower.includes('recomendado') && veterinaria.valoracion_promedio >= 4) {
          palabrasUnicas.add(t('recomendado', 'Recomendado'));
        }
      }

      if (veterinaria.total_valoraciones > 0 && (textoLower.includes('opinión') || textoLower.includes('reseña'))) {
        palabrasUnicas.add(`${veterinaria.total_valoraciones} ${t('opiniones', 'opiniones')}`);
      }

      // ===== VERIFICACIÓN =====
      if (textoLower.includes('verificado') || textoLower.includes('oficial') || textoLower.includes('confiable')) {
        if (veterinaria.verificado === true) {
          palabrasUnicas.add(t('verificado', 'Verificado'));
        }
      }

      // ===== REDES SOCIALES =====
      if (veterinaria.redes_sociales) {
        let redes = [];
        try {
          redes = typeof veterinaria.redes_sociales === 'string' 
            ? JSON.parse(veterinaria.redes_sociales) 
            : veterinaria.redes_sociales;
        } catch(e) { redes = []; }
        
 Object.keys(redes).forEach(red => {
          if (red?.toLowerCase().includes(textoLower)) {
            palabrasUnicas.add(`${t('red_social', 'Red social')}: ${red}`);
          }
        });
      }

      // ===== COBERTURA ZONA (JSON) =====
      if (veterinaria.cobertura_zona) {
        let coberturas = [];
        try {
          coberturas = typeof veterinaria.cobertura_zona === 'string' 
            ? JSON.parse(veterinaria.cobertura_zona) 
            : veterinaria.cobertura_zona;
        } catch(e) { coberturas = []; }
        
        coberturas.forEach(cobertura => {
          if (cobertura?.toLowerCase().includes(textoLower)) {
            palabrasUnicas.add(`${t('cobertura', 'Cobertura')}: ${cobertura}`);
          }
        });
      }

      // ===== UBICACIÓN (lat/lng/radio) =====
      if (veterinaria.lat && veterinaria.lng) {
        if (textoLower.includes('cerca') || textoLower.includes('cercano') || textoLower.includes('ubicado')) {
          palabrasUnicas.add(t('tiene_ubicacion', 'Ubicación disponible'));
        }
      }

      if (veterinaria.radio_atencion && (textoLower.includes('radio') || textoLower.includes('cobertura'))) {
        palabrasUnicas.add(`${t('radio_atencion', 'Radio de atención')}: ${veterinaria.radio_atencion} km`);
      }

      // ===== LOGO O IMÁGENES =====
      if (textoLower.includes('logo') || textoLower.includes('imagen') || textoLower.includes('foto')) {
        if (veterinaria.logo) {
          palabrasUnicas.add(t('tiene_logo', 'Tiene logo'));
        }
        if (veterinaria.galeria_fotos && JSON.parse(veterinaria.galeria_fotos)?.length > 0) {
          palabrasUnicas.add(t('tiene_galeria', 'Tiene galería de fotos'));
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
          const sugerenciaLimpia = sugerencias[sugerenciaSeleccionada].replace(/^(Servicio:|Equipo:|Horario:|Convenio:|Consulta:|Cobertura:|Radio de atención:|Red social:|WhatsApp:)\s*/, '');
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
      {isLoading && (
        <div className="fv-progress">
          <ProgressBar progress={100} height="3px" animated={true} variant="gradient" />
        </div>
      )}

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

        {mostrarSugerencias && sugerencias.length > 0 && (
          <div ref={sugerenciasRef} className="fv-sugerencias-dropdown">
            {sugerencias.map((sugerencia, index) => (
              <div
                key={index}
                className={`fv-sugerencia-item ${index === sugerenciaSeleccionada ? 'fv-selected' : ''}`}
                onClick={() => seleccionarSugerencia(sugerencia.replace(/^(Servicio:|Equipo:|Horario:|Convenio:|Consulta:|Cobertura:|Radio de atención:|Red social:|WhatsApp:)\s*/, ''))}
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