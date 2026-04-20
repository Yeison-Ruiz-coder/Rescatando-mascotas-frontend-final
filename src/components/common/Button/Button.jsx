// src/components/common/Button/Button.jsx
import React from 'react';
import './Button.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) => {
  const variants = {
    primary: 'app-btn-primary',
    secondary: 'app-btn-secondary',
    danger: 'app-btn-danger',
    success: 'app-btn-success',
    warning: 'app-btn-warning'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`app-btn ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;