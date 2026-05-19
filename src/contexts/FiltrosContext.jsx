// src/contexts/FiltrosContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';

const FiltrosContext = createContext();

export const useFiltros = (namespace = null) => {
  const context = useContext(FiltrosContext);
  if (!context) {
    throw new Error('useFiltros must be used within FiltrosProvider');
  }
  
  if (namespace) {
    return {
      filtros: context.filtros[namespace] || {},
      actualizarFiltros: (nuevosFiltros) => context.actualizarFiltros(namespace, nuevosFiltros),
      limpiarFiltros: () => context.limpiarFiltros(namespace),
      tieneFiltrosActivos: () => context.tieneFiltrosActivos(namespace)
    };
  }
  
  return {
    filtros: context.filtros,
    actualizarFiltros: context.actualizarFiltrosGlobal,
    limpiarFiltros: context.limpiarFiltrosGlobal
  };
};

// Hooks específicos para cada módulo
export const useFiltrosMascotas = () => useFiltros('mascotas');
export const useFiltrosEventos = () => useFiltros('eventos');
export const useFiltrosUsuarios = () => useFiltros('usuarios');
export const useFiltrosFundaciones = () => useFiltros('fundaciones'); // ✅ Agregado
export const useFiltrosVeterinarias = () => useFiltros('veterinarias'); // ✅ Agregado

export const FiltrosProvider = ({ children, initialFilters = {} }) => {
  // ✅ Estado inicial con estructura consistente
  const [filtros, setFiltros] = useState({
    mascotas: {
      busqueda: '',
      especie: '',
      genero: ''
    },
    eventos: {
      busqueda: '',
      categoria: ''
    },
    usuarios: {
      busqueda: '',
      rol: '',
      estado: ''
    },
    // ✅ Agregar fundaciones
    fundaciones: {
      busqueda: '',
      ciudad: ''
    },
    // ✅ Agregar veterinarias
    veterinarias: {
      busqueda: '',
      ciudad: ''
    },
    ...initialFilters
  });

  const actualizarFiltros = useCallback((namespace, nuevosFiltros) => {
    setFiltros(prev => ({
      ...prev,
      [namespace]: { ...prev[namespace], ...nuevosFiltros }
    }));
  }, []);

  // ✅ Limpiar filtros - RESETEAR a valores vacíos, NO borrar el objeto
  const limpiarFiltros = useCallback((namespace) => {
    setFiltros(prev => {
      const estadoActual = prev[namespace];
      // Si no existe el namespace, crear uno básico
      if (!estadoActual) {
        return {
          ...prev,
          [namespace]: { busqueda: '' }
        };
      }
      
      // Resetear cada propiedad a string vacío
      const reseteados = {};
      Object.keys(estadoActual).forEach(key => {
        reseteados[key] = '';
      });
      
      return {
        ...prev,
        [namespace]: reseteados
      };
    });
  }, []);

  const actualizarFiltrosGlobal = useCallback((nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);

  const limpiarFiltrosGlobal = useCallback(() => {
    setFiltros({
      mascotas: { busqueda: '', especie: '', genero: '' },
      eventos: { busqueda: '', categoria: '' },
      usuarios: { busqueda: '', rol: '', estado: '' },
      fundaciones: { busqueda: '', ciudad: '' },      // ✅ Agregado
      veterinarias: { busqueda: '', ciudad: '' }      // ✅ Agregado
    });
  }, []);

  const tieneFiltrosActivos = useCallback((namespace) => {
    const filtrosNamespace = filtros[namespace] || {};
    return Object.values(filtrosNamespace).some(valor => valor && valor !== '');
  }, [filtros]);

  const limpiarTodosFiltros = useCallback(() => {
    setFiltros({
      mascotas: { busqueda: '', especie: '', genero: '' },
      eventos: { busqueda: '', categoria: '' },
      usuarios: { busqueda: '', rol: '', estado: '' },
      fundaciones: { busqueda: '', ciudad: '' },      // ✅ Agregado
      veterinarias: { busqueda: '', ciudad: '' }      // ✅ Agregado
    });
  }, []);

  return (
    <FiltrosContext.Provider value={{
      filtros,
      actualizarFiltros,
      limpiarFiltros,
      actualizarFiltrosGlobal,
      limpiarFiltrosGlobal,
      tieneFiltrosActivos,
      limpiarTodosFiltros
    }}>
      {children}
    </FiltrosContext.Provider>
  );
};