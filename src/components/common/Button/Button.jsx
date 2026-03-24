import React from 'react';
import './Button.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled = false, className = '' }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    warning: 'btn-warning'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;