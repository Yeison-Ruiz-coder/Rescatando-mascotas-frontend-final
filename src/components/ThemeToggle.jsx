// src/components/ThemeToggle.jsx
import React, { useEffect, useState } from 'react';
import './FloatingButtons.css';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    // Verificar si hay preferencia guardada
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Si no, verificar preferencia del sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button className="theme-toggle" onClick={() => setIsDark(!isDark)} aria-label="Cambiar tema">
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;