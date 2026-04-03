// src/contexts/FiltrosContext.jsx
import React, { createContext, useState, useContext, useCallback } from 'react';

const FiltrosContext = createContext();

export const useFiltros = () => {
  const context = useContext(FiltrosContext);
  if (!context) {
    throw new Error('useFiltros must be used within FiltrosProvider');
  }
  return context;
};

export const FiltrosProvider = ({ children }) => {
  const [filtros, setFiltros] = useState({
    busqueda: '',
    especie: '',
    genero: '',
  });

  const actualizarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  }, []);

  const limpiarFiltros = useCallback(() => {
    setFiltros({ busqueda: '', especie: '', genero: '' });
  }, []);

  return (
    <FiltrosContext.Provider value={{ filtros, actualizarFiltros, limpiarFiltros }}>
      {children}
    </FiltrosContext.Provider>
  );
};