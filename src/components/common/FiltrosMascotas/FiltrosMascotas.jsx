// src/components/common/FiltrosMascotas/FiltrosMascotas.jsx
import React, { useState } from 'react';

const FiltrosMascotas = ({ onFilterChange, especies = [] }) => {
  // Estado local - CADA input tiene su propio estado
  const [buscar, setBuscar] = useState('');
  const [especie, setEspecie] = useState('');
  const [genero, setGenero] = useState('');
  const [tamano, setTamano] = useState('');

  // Cuando hace clic en Buscar
  const handleSearch = () => {
    const filtros = {};
    if (buscar.trim()) filtros.buscar = buscar.trim();
    if (especie) filtros.especie = especie;
    if (genero) filtros.genero = genero;
    if (tamano) filtros.tamano = tamano;
    onFilterChange(filtros);
  };

  // Limpiar todo
  const handleClear = () => {
    setBuscar('');
    setEspecie('');
    setGenero('');
    setTamano('');
    onFilterChange({});
  };

  // Enter para buscar
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
          placeholder="Buscar por nombre..."
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

      {/* Especie */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
          🐾 Especie
        </label>
        <select
          value={especie}
          onChange={(e) => setEspecie(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
        >
          <option value="">Todas las especies</option>
          {especies.map(esp => (
            <option key={esp} value={esp}>{esp}</option>
          ))}
        </select>
      </div>

      {/* Género */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
          ⚥ Género
        </label>
        <select
          value={genero}
          onChange={(e) => setGenero(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
        >
          <option value="">Todos</option>
          <option value="Macho">Macho</option>
          <option value="Hembra">Hembra</option>
        </select>
      </div>

      {/* Tamaño */}
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
          📏 Tamaño
        </label>
        <select
          value={tamano}
          onChange={(e) => setTamano(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}
        >
          <option value="">Todos</option>
          <option value="Pequeño">Pequeño</option>
          <option value="Mediano">Mediano</option>
          <option value="Grande">Grande</option>
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

export default FiltrosMascotas;