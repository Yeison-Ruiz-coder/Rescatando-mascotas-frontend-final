// src/components/common/LoadingSpinner/LoadingSpinner.jsx
import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', text = 'Cargando...' }) => {
  const sizeClass = {
    sm: 'spinner-sm',
    md: '',
    lg: 'spinner-lg'
  };

  return (
    <div className="loading-container">
      <div className={`spinner ${sizeClass[size]}`} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;