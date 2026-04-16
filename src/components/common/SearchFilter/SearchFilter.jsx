// src/components/common/SearchFilter/SearchFilter.jsx
import React from 'react';
import './SearchFilter.css';

const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  searchPlaceholder = 'Buscar...',
  filters = [],
  activeFilter,
  onFilterChange
}) => {
  const getFilterColor = (color) => {
    switch (color) {
      case 'primary': return 'filter-primary';
      case 'success': return 'filter-success';
      case 'warning': return 'filter-warning';
      case 'danger': return 'filter-danger';
      case 'info': return 'filter-info';
      default: return 'filter-default';
    }
  };

  return (
    <div className="search-filter-container">
      {filters.length > 0 && (
        <div className="filters-group">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''} ${getFilterColor(filter.color)}`}
              onClick={() => onFilterChange(filter.id)}
            >
              {filter.label}
              {filter.count !== undefined && <span className="filter-count">{filter.count}</span>}
            </button>
          ))}
        </div>
      )}
      
      <div className="search-box">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        {searchTerm && (
          <button className="search-clear" onClick={() => onSearchChange('')}>
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchFilter;