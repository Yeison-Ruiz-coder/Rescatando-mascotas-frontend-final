// src/components/FloatingLanguageSelector.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './FloatingLanguageSelector.css';

const FloatingLanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'es', name: 'Español', flag: 'co', label: 'ES' },
    { code: 'en', name: 'English', flag: 'us', label: 'EN' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="floating-language" ref={dropdownRef}>
      <button 
        className="floating-language-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Cambiar idioma"
      >
        <span className={`fi fi-${currentLanguage.flag}`}></span>
      </button>
      
      {isOpen && (
        <div className="floating-language-dropdown">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`floating-language-item ${i18n.language === lang.code ? 'active' : ''}`}
            >
              <span className={`fi fi-${lang.flag}`}></span>
              <span className="floating-language-name">{lang.name}</span>
              {i18n.language === lang.code && <i className="fas fa-check floating-language-check"></i>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FloatingLanguageSelector;