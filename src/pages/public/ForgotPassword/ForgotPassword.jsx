// src/pages/public/ForgotPassword/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../../services/authService';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [currentBackground, setCurrentBackground] = useState(0);
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
    const interval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);

    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(quoteInterval);
    };
  }, [backgroundImages.length, motivationalQuotes.length]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (!email || !validateEmail(email)) {
      return;
    }

    setLoading(true);
    setError('');

    const result = await authService.forgotPassword(email);

    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message || t('error_conexion'));
    }

    setLoading(false);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  if (success) {
    return (
      <div className="forgot-page">
        <div className="forgot-success-fullscreen">
          <div className="forgot-success-card">
            <div className="forgot-success-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <h2>{t('forgot.check_your_email')}</h2>
            <p>
              {t('forgot.reset_link_sent')} <strong>{email}</strong>
            </p>
            <div className="forgot-success-buttons">
              <button onClick={handleGoToLogin} className="forgot-btn-success">
                <i className="fas fa-arrow-left"></i>
                {t('forgot.back_to_login')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-page">
      <div className="forgot-grid">
        <div
          className="forgot-left"
          style={{ backgroundImage: `url('${backgroundImages[currentBackground]}')` }}
        >
          <div className="forgot-left-content">
            <div className="forgot-logo-container">
              <img
                src="/img/logo-claro.png"
                alt="Rescatando Mascotas Forever"
                className="forgot-logo"
              />
              <h1>
                Rescatando
                <br />
                Mascotas Forever
              </h1>
              <p>Sanando su historia</p>
            </div>

            <div className="forgot-quote-container">
              <i className="fas fa-quote-left"></i>
              <p>{motivationalQuotes[currentQuote]}</p>
            </div>

            <div className="forgot-image-indicators">
              {backgroundImages.map((_, index) => (
                <span
                  key={index}
                  className={`forgot-indicator ${currentBackground === index ? 'active' : ''}`}
                  onClick={() => setCurrentBackground(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="forgot-right">
          <button
            className="forgot-home-btn"
            onClick={handleGoHome}
            aria-label={t('home_button')}
          >
            <i className="fas fa-home"></i>
            <span>{t('home_button')}</span>
          </button>

          <div className="forgot-card">
            <h2>{t('forgot.title')}</h2>
            <p className="forgot-subtitle">{t('forgot.subtitle')}</p>

            {error && (
              <div className="forgot-error-general">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="forgot-form-group">
                <label>{t('email')}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (submitted && error) setError('');
                  }}
                  placeholder={t('placeholders.email')}
                  className={submitted && !email ? 'error' : ''}
                  required
                />
                {submitted && !email && (
                  <span className="forgot-field-error">
                    {t('email_requerido') || 'El email es requerido'}
                  </span>
                )}
                {submitted && email && !validateEmail(email) && (
                  <span className="forgot-field-error">
                    {t('email_invalido') || 'Ingresa un correo electrónico válido'}
                  </span>
                )}
              </div>

              <button type="submit" className="forgot-btn" disabled={loading}>
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {t('loading')}
                  </>
                ) : (
                  t('forgot.send_link')
                )}
              </button>

              <div className="forgot-login-link">
                <Link to="/login">{t('forgot.back_to_login')}</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;