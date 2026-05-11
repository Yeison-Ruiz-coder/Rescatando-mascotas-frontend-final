// src/contexts/FiltrosContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';

const FiltrosContext = createContext();

export const useFiltros = (namespace = null) => {
  const context = useContext(FiltrosContext);
  if (!context) {
    throw new Error('useFiltros must be used within FiltrosProvider');
  }
  
  // Si se especifica un namespace, devolver solo ese
  if (namespace) {
    return {
      filtros: context.filtros[namespace] || {},
      actualizarFiltros: (nuevosFiltros) => context.actualizarFiltros(namespace, nuevosFiltros),
      limpiarFiltros: () => context.limpiarFiltros(namespace),
      tieneFiltrosActivos: () => context.tieneFiltrosActivos(namespace)
    };
  }
  
  // Si no hay namespace, devolver todo (para compatibilidad)
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

export const FiltrosProvider = ({ children, initialFilters = {} }) => {
  // Estado centralizado con namespaces
  const [filtros, setFiltros] = useState(() => ({
    mascotas: {
      busqueda: '',
      especie: '',
      genero: '',
      ...initialFilters.mascotas
    },
    eventos: {
      busqueda: '',
      categoria: '',
      ...initialFilters.eventos
    },
    usuarios: {
      busqueda: '',
      rol: '',
      estado: '',
      ...initialFilters.usuarios
    },
    ...initialFilters
  }));

  // Actualizar filtros de un namespace específico
  const actualizarFiltros = useCallback((namespace, nuevosFiltros) => {
    setFiltros(prev => ({
      ...prev,
      [namespace]: { ...prev[namespace], ...nuevosFiltros }
    }));
  }, []);

  // Limpiar filtros de un namespace específico
  const limpiarFiltros = useCallback((namespace) => {
    setFiltros(prev => ({
      ...prev,
      [namespace]: {}
    }));
  }, []);

  // Actualizar filtros global (sin namespace) - para compatibilidad
  const actualizarFiltrosGlobal = useCallback((nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);

  // Limpiar filtros global (sin namespace) - para compatibilidad
  const limpiarFiltrosGlobal = useCallback(() => {
    setFiltros({
      mascotas: { busqueda: '', especie: '', genero: '' },
      eventos: { busqueda: '', categoria: '' },
      usuarios: { busqueda: '', rol: '', estado: '' }
    });
  }, []);

  // Verificar si un namespace tiene filtros activos
  const tieneFiltrosActivos = useCallback((namespace) => {
    const filtrosNamespace = filtros[namespace] || {};
    return Object.values(filtrosNamespace).some(valor => valor && valor !== '');
  }, [filtros]);

  // Limpiar todos los filtros de todos los namespaces
  const limpiarTodosFiltros = useCallback(() => {
    setFiltros({
      mascotas: { busqueda: '', especie: '', genero: '' },
      eventos: { busqueda: '', categoria: '' },
      usuarios: { busqueda: '', rol: '', estado: '' }
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