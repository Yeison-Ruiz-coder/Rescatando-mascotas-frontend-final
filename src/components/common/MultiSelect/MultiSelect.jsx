import React, { useState, useRef, useEffect } from 'react';
import './MultiSelect.css';

const MultiSelect = ({ 
  label, 
  options, 
  value = [], 
  onChange, 
  placeholder = 'Seleccione...',
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (optionId) => {
    if (value.includes(optionId)) {
      onChange(value.filter(id => id !== optionId));
    } else {
      onChange([...value, optionId]);
    }
  };

  const removeOption = (optionId, e) => {
    e.stopPropagation();
    onChange(value.filter(id => id !== optionId));
  };

  const selectedLabels = value.map(id => 
    options.find(opt => opt.value === id)?.label
  ).filter(Boolean);

  return (
    <div className="multi-select" ref={containerRef}>
      {label && <label className="multi-select-label">{label} {required && <span className="required">*</span>}</label>}
      
      <div className={`multi-select-container ${disabled ? 'disabled' : ''}`} onClick={() => !disabled && setIsOpen(!isOpen)}>
        <div className="multi-select-values">
          {selectedLabels.length > 0 ? (
            selectedLabels.map((label, idx) => (
              <span key={idx} className="multi-select-tag">
                {label}
                <button type="button" onClick={(e) => removeOption(value[idx], e)}>
                  <i className="fas fa-times"></i>
                </button>
              </span>
            ))
          ) : (
            <span className="multi-select-placeholder">{placeholder}</span>
          )}
        </div>
        <i className={`fas fa-chevron-down ${isOpen ? 'open' : ''}`}></i>
      </div>

      {isOpen && !disabled && (
        <div className="multi-select-dropdown">
          <div className="multi-select-search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="multi-select-options">
            {filteredOptions.length === 0 ? (
              <div className="multi-select-no-results">No hay resultados</div>
            ) : (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  className={`multi-select-option ${value.includes(option.value) ? 'selected' : ''}`}
                  onClick={() => toggleOption(option.value)}
                >
                  <i className={`fas ${value.includes(option.value) ? 'fa-check-square' : 'fa-square'}`}></i>
                  <span>{option.label}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;