import React from 'react';
import { useTranslation } from 'react-i18next';
import './Input.css';

const Input = ({ 
  label, 
  labelKey,
  type = 'text', 
  name, 
  value, 
  onChange, 
  error, 
  errorKey,
  placeholder,
  placeholderKey,
  required = false,
  className = ''
}) => {
  const { t } = useTranslation('common');
  
  const displayLabel = labelKey ? t(labelKey, label) : label;
  const displayPlaceholder = placeholderKey ? t(placeholderKey, placeholder) : placeholder;
  const displayError = errorKey ? t(errorKey, error) : error;
  
  return (
    <div className={`form-group ${className}`}>
      {displayLabel && (
        <label htmlFor={name} className="form-label">
          {displayLabel}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={displayPlaceholder}
        required={required}
        className={`form-input ${displayError ? 'input-error' : ''}`}
      />
      {displayError && <span className="error-message">{displayError}</span>}
    </div>
  );
};

export default Input;