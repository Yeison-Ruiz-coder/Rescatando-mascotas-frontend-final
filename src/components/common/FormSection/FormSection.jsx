import React from 'react';
import './FormSection.css';

const FormSection = ({ title, icon, children }) => {
  return (
    <div className="form-section">
      <div className="form-section-header">
        <i className={`fas fa-${icon}`}></i>
        <h3>{title}</h3>
      </div>
      <div className="form-section-body">
        {children}
      </div>
    </div>
  );
};

export default FormSection;