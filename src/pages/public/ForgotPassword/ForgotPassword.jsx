// src/pages/public/ForgotPassword/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import authService from '../../../services/authService';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Estados para imágenes y frases
  const [currentBackground, setCurrentBackground] = useState(1);
  const [currentQuote, setCurrentQuote] = useState(0);

  const backgroundImages = [
    '/img/login/login1.jpg',
    '/img/login/login2.jpg',
    '/img/login/login3.jpg',
    '/img/login/login4.jpg',
    '/img/login/login5.jpg'
  ];

  const motivationalQuotes = [
    t('quotes.quote1', { defaultValue: 'Adoptar no es comprar, es salvar una vida' }),
    t('quotes.quote2', { defaultValue: 'Ellos no necesitan palabras, solo amor y un hogar' }),
    t('quotes.quote3', { defaultValue: 'Un amigo fiel te espera para cambiar tu vida' }),
    t('quotes.quote4', { defaultValue: 'La mejor inversión es dar amor a quien no lo tiene' }),
    t('quotes.quote5', { defaultValue: 'Cada mascota rescatada es una historia de esperanza' })
  ];

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const interval = setInterval(() => {
      setCurrentBackground((prev) => {
        const nextIndex = (prev) % backgroundImages.length + 1;
        return nextIndex;
      });
    }, 5000);

    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);

    return () => {
      document.body.style.overflow = 'auto';
      clearInterval(interval);
      clearInterval(quoteInterval);
    };
  }, []);

  useEffect(() => {
    const container = document.querySelector('.forgot-container');
    if (container) {
      container.style.backgroundImage = `url('${backgroundImages[currentBackground - 1]}')`;
    }
  }, [currentBackground]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.forgotPassword(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  if (success) {
    return (
      <div className="forgot-container">
        <div className="forgot-overlay"></div>
        <div className="forgot-card">
          <div className="success-icon">
            <i className="fas fa-envelope"></i>
          </div>
          <h2>{t('forgot.check_your_email')}</h2>
          <p>{t('forgot.reset_link_sent')} <strong>{email}</strong></p>
          <button onClick={handleGoBack} className="back-to-login-btn">
            <i className="fas fa-arrow-left"></i>
            {t('forgot.back_to_login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-container">
      <div className="forgot-overlay"></div>
      
      <button 
        className="forgot-back-button"
        onClick={handleGoBack}
        aria-label={t('buttons.back')}
      >
        <i className="fas fa-arrow-left"></i>
        <span>{t('buttons.back')}</span>
      </button>
      
      <div className="forgot-card">
        <div className="forgot-header">
          <div className="forgot-logo-wrapper">
            <img src="/img/logo-claro.png" alt="Logo" className="forgot-logo" />
          </div>
          <h1 className="forgot-title">{t('forgot.title')}</h1>
          <p className="forgot-subtitle">{t('forgot.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="input-group">
            <i className="fas fa-envelope input-icon"></i>
            <Input
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('placeholders.email')}
            />
          </div>

          {error && (
            <div className="error-general">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="forgot-button">
            {loading ? <i className="fas fa-spinner fa-spin"></i> : t('forgot.send_link')}
          </Button>

          <div className="forgot-links">
            <Link to="/login"> {t('forgot.back_to_login')}</Link>
          </div>
        </form>
      </div>
      
      <div className="forgot-motivational-text">
        <p className="forgot-motivational-quote">
          <i className="fas fa-paw"></i>
          <span>{motivationalQuotes[currentQuote]}</span>
          <i className="fas fa-heart"></i>
        </p>
      </div>
      
      <div className="forgot-decoration">
        <div className="forgot-decoration-circle circle-1"></div>
        <div className="forgot-decoration-circle circle-2"></div>
        <div className="forgot-decoration-circle circle-3"></div>
      </div>
      
      <div className="forgot-image-indicators">
        {backgroundImages.map((_, index) => (
          <span 
            key={index}
            className={`forgot-indicator ${currentBackground === index + 1 ? 'active' : ''}`}
            onClick={() => setCurrentBackground(index + 1)}
          />
        ))}
      </div>
    </div>
  );
};

export default ForgotPassword;