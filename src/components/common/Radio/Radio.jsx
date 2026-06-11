// src/components/common/Radio/Radio.jsx
import React from 'react';
import './Radio.css';

const Radio = ({
  label,
  checked,
  onChange,
  name,
  value,
  disabled = false,
  className = '',
  id
}) => {
  const radioId = id || `radio-${name}-${value}`;

  return (
    <label className={`radio-collage ${className}`} htmlFor={radioId}>
      <input
        type="radio"
        id={radioId}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="radio-custom"></span>
      {label && <span className="radio-label">{label}</span>}
    </label>
  );
};

// Grupo de radios
export const RadioGroup = ({
  options = [],
  value,
  onChange,
  name,
  direction = 'vertical'
}) => {
  return (
    <div className={`radio-group radio-group-${direction}`}>
      {options.map(option => (
        <Radio
          key={option.value}
          label={option.label}
          name={name}
          value={option.value}
          checked={value === option.value}
          onChange={onChange}
        />
      ))}
    </div>
  );
};

export default Radio;