// src/components/common/MultiSelect/MultiSelect.jsx
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import './MultiSelect.css';

// ===== COMPONENTE PRINCIPAL =====
const MultiSelect = ({ options = [], selected = [], onChange, placeholder, disabled }) => {
  const { t } = useTranslation('nuevaMascota');
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  // ===== EFECTOS =====
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ===== MEMOIZACIÓN =====
  const safeOptions = useMemo(() => Array.isArray(options) ? options : [], [options]);
  
  const filteredOptions = useMemo(() => 
    safeOptions.filter(opt =>
      opt.label?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [safeOptions, searchTerm]
  );

  const selectedLabels = useMemo(() => 
    selected.map(id => {
      const opt = safeOptions.find(o => o.value === id);
      return opt ? opt.label : '';
    }).filter(Boolean),
    [selected, safeOptions]
  );

  // ===== CALLBACKS =====
  const toggleOption = useCallback((value) => {
    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value));
    } else {
      onChange([...selected, value]);
    }
  }, [selected, onChange]);

  const removeOption = useCallback((value, e) => {
    e.stopPropagation();
    onChange(selected.filter(v => v !== value));
  }, [selected, onChange]);

  const toggleDropdown = useCallback(() => {
    if (!disabled) setIsOpen(prev => !prev);
  }, [disabled]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const getLabelFromValue = useCallback((value) => {
    const opt = safeOptions.find(o => o.value === value);
    return opt?.label || '';
  }, [safeOptions]);

  return (
    <div className="multi-select-container" ref={wrapperRef}>
      <div className="multi-select-input" onClick={toggleDropdown}>
        {selectedLabels.length > 0 ? (
          <div className="multi-select-tags">
            {selectedLabels.map(label => (
              <span key={label} className="multi-select-tag">
                {label}
                <button 
                  type="button" 
                  onClick={(e) => {
                    const opt = safeOptions.find(o => o.label === label);
                    if (opt) removeOption(opt.value, e);
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="multi-select-placeholder">
            {placeholder || t('seleccionar_opciones')}
          </span>
        )}
        <i className={`fas fa-chevron-down ${isOpen ? 'open' : ''}`}></i>
      </div>
      
      {isOpen && !disabled && (
        <div className="multi-select-dropdown">
          <input
            type="text"
            className="multi-select-search"
            placeholder={t('buscar')}
            value={searchTerm}
            onChange={handleSearchChange}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="multi-select-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <label key={opt.value} className="multi-select-option" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.includes(opt.value)}
                    onChange={() => toggleOption(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))
            ) : (
              <div className="multi-select-empty">{t('sin_opciones')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;