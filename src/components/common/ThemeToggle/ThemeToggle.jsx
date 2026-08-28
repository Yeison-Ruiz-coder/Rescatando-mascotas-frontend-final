// src/components/ThemeToggle.jsx
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import '../../common/FloatingButtons/FloatingLanguageSelector.css';

const ThemeToggle = () => {
  const { t } = useTranslation('common');
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.dataset.theme === 'dark';
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content',
      isDark ? '#0f172a' : '#f7f2fc'
    );
    localStorage.setItem('theme', theme);
  }, [isDark]);

  return (
    <button 
      className="theme-toggle" 
      onClick={() => setIsDark(currentTheme => !currentTheme)}
      aria-label={t('theme_toggle', 'Cambiar tema')}
      aria-pressed={isDark}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
};

export default ThemeToggle;
