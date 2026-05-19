// src/components/ThemeToggle.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../common/FloatingButtons/FloatingLanguageSelector.css';

const ThemeToggle = () => {
  const { t } = useTranslation('common');
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
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
    <button 
      className="theme-toggle" 
      onClick={() => setIsDark(!isDark)} 
      aria-label={t('theme_toggle', 'Cambiar tema')}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;