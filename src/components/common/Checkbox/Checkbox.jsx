// src/components/common/Checkbox/Checkbox.jsx
import React from 'react';
import './Checkbox.css';

const Checkbox = ({
  label,
  checked,
  onChange,
  name,
  disabled = false,
  className = '',
  id
}) => {
  const checkboxId = id || `checkbox-${name}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label className={`checkbox-collage ${className}`} htmlFor={checkboxId}>
      <input
        type="checkbox"
        id={checkboxId}
        name={name}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="checkbox-custom"></span>
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
};

// Grupo de checkboxes
export const CheckboxGroup = ({
  options = [],
  values = [],
  onChange,
  name,
  direction = 'vertical' // 'vertical' o 'horizontal'
}) => {
  const handleChange = (value, checked) => {
    let newValues = [...values];
    if (checked) {
      newValues.push(value);
    } else {
      newValues = newValues.filter(v => v !== value);
    }
    onChange({ target: { name, value: newValues } });
  };

  return (
    <div className={`checkbox-group checkbox-group-${direction}`}>
      {options.map(option => (
        <Checkbox
          key={option.value}
          label={option.label}
          checked={values.includes(option.value)}
          onChange={(e) => handleChange(option.value, e.target.checked)}
          name={name}
        />
      ))}
    </div>
  );
};

export default Checkbox;