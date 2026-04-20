import React from 'react';

const Textarea = ({ label, name, value, onChange, error, required, placeholder, rows = 4 }) => {
  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label} {required && <span className="required">*</span>}</label>}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={error ? 'error' : ''}
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default Textarea;