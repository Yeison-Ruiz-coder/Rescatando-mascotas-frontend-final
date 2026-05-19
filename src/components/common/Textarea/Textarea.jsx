import React from 'react';
import { useTranslation } from 'react-i18next';

const Textarea = ({ 
  label, 
  labelKey,
  name, 
  value, 
  onChange, 
  error, 
  errorKey,
  required, 
  placeholder,
  placeholderKey,
  rows = 4 
}) => {
  const { t } = useTranslation('common');
  
  const displayLabel = labelKey ? t(labelKey, label) : label;
  const displayPlaceholder = placeholderKey ? t(placeholderKey, placeholder) : placeholder;
  const displayError = errorKey ? t(errorKey, error) : error;

  return (
    <div className="form-group">
      {displayLabel && (
        <label htmlFor={name}>
          {displayLabel} {required && <span className="required">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={displayPlaceholder}
        rows={rows}
        className={displayError ? 'error' : ''}
      />
      {displayError && <span className="error-message">{displayError}</span>}
    </div>
  );
};

export default Textarea;