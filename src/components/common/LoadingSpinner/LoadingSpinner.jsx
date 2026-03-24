import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'md', color = '#667eea', text = 'Cargando...' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="loading-container">
      <div 
        className={`spinner ${sizes[size]}`}
        style={{ borderTopColor: color }}
      />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;