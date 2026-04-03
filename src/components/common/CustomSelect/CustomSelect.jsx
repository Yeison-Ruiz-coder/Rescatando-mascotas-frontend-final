// src/components/common/CustomSelect/CustomSelect.jsx
import React, { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

const CustomSelect = ({ 
  options = [], 
  value = '', 
  onChange, 
  name,
  placeholder = 'Seleccionar...',
  label = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option.value } });
    setIsOpen(false);
  };

  return (
    <div className="custom-select-container">
      {label && <label className="custom-select-label">{label}</label>}
      <div className="custom-select" ref={selectRef}>
        <div 
          className={`custom-select-trigger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="custom-select-value">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
        </div>
        
        {isOpen && (
          <div className="custom-select-options">
            {options.map((option) => (
              <div
                key={option.value}
                className={`custom-select-option ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                <span>{option.label}</span>
                {value === option.value && (
                  <i className="fas fa-check"></i>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomSelect;