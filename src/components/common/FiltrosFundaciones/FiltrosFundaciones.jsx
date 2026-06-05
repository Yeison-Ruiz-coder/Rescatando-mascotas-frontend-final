// src/components/common/FiltrosFundaciones/FiltrosFundaciones.jsx
import React, { useState } from 'react';

const FiltrosFundaciones = ({ onFilterChange, ciudades = [] }) => {
  const [buscar, setBuscar] = useState('');
  const [ciudad, setCiudad] = useState('');

  const handleSearch = () => {
    const filtros = {};
    if (buscar.trim()) filtros.buscar = buscar.trim();
    if (ciudad) filtros.ciudad = ciudad;
    onFilterChange(filtros);
  };

  const handleClear = () => {
    setBuscar('');
    setCiudad('');
    onFilterChange({});
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      alignItems: 'end',
      background: 'var(--bg-card)',
      padding: '1rem',
      borderRadius: '8px'
    }}>
      {/* Buscador */}
      <div style={{ gridColumn: 'span 2' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
          🔍 Buscar
        </label>
        <input
          type="text"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Buscar por nombre o descripción..."
          style={{
            width: '100%',
            padding: '0.6rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
          autoComplete="off"
        />
      </div>

      {/* Ciudad */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
          📍 Ciudad
        </label>
        <select
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
        >
          <option value="">Todas las ciudades</option>
          {ciudades.map(ciu => (
            <option key={ciu} value={ciu}>{ciu}</option>
          ))}
        </select>
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleSearch}
          style={{
            padding: '0.6rem 1.2rem',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🔍 Buscar
        </button>
        <button
          onClick={handleClear}
          style={{
            padding: '0.6rem 1.2rem',
            background: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🗑️ Limpiar
        </button>
      </div>
    </div>
  );
};

export default FiltrosFundaciones;