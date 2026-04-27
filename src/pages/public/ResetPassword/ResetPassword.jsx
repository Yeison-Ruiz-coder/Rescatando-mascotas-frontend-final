// src/pages/public/ResetPassword/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import authService from '../../../services/authService';
import './ResetPassword.css';

const ResetPassword = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
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
    const container = document.querySelector('.reset-container');
    if (container) {
      container.style.backgroundImage = `url('${backgroundImages[currentBackground - 1]}')`;
    }
  }, [currentBackground]);

  useEffect(() => {
    if (!token || !email) {
      setError(t('reset.invalid_link'));
    }
  }, [token, email, t]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== passwordConfirmation) {
      setError(t('reset.passwords_do_not_match'));
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError(t('reset.password_min_length'));
      setLoading(false);
      return;
    }

    const result = await authService.resetPassword(token, email, password, passwordConfirmation);

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
      <div className="reset-container">
        <div className="reset-overlay"></div>
        <div className="reset-card">
          <div className="success-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <h2>{t('reset.password_updated')}</h2>
          <p>{t('reset.password_updated_message')}</p>
          
          <div className="success-buttons">
            <button 
              onClick={() => navigate('/login')} 
              className="success-btn-primary"
            >
              <i className="fas fa-sign-in-alt"></i>
              {t('reset.login_now')}
            </button>
            
            <button 
              onClick={() => navigate('/')} 
              className="success-btn-secondary"
            >
              <i className="fas fa-home"></i>
              {t('reset.go_home')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-container">
      <div className="reset-overlay"></div>
      
      <button 
        className="reset-back-button"
        onClick={handleGoBack}
        aria-label={t('buttons.back')}
      >
        <i className="fas fa-arrow-left"></i>
        <span>{t('buttons.back')}</span>
      </button>
      
      <div className="reset-card">
        <div className="reset-header">
          <div className="reset-logo-wrapper">
            <img src="/img/logo-claro.png" alt="Logo" className="reset-logo" />
          </div>
          <h1 className="reset-title">{t('reset.title')}</h1>
          <p className="reset-subtitle">{t('reset.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="reset-form">
          <div className="input-group">
            <i className="fas fa-lock input-icon"></i>
            <div className="password-wrapper">
              <Input
                label={t('reset.new_password')}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t('reset.password_placeholder')}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          <div className="input-group">
            <i className="fas fa-lock input-icon"></i>
            <div className="password-wrapper">
              <Input
                label={t('reset.confirm_password')}
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                placeholder={t('reset.confirm_password_placeholder')}
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>

          {error && (
            <div className="error-general">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="reset-button">
            {loading ? <i className="fas fa-spinner fa-spin"></i> : t('reset.reset_password')}
          </Button>

          <div className="reset-links">
            <Link to="/login"> {t('reset.back_to_login')}</Link>
          </div>
        </form>
      </div>
      
      <div className="reset-motivational-text">
        <p className="reset-motivational-quote">
          <i className="fas fa-paw"></i>
          <span>{motivationalQuotes[currentQuote]}</span>
          <i className="fas fa-heart"></i>
        </p>
      </div>
      
      <div className="reset-decoration">
        <div className="reset-decoration-circle circle-1"></div>
        <div className="reset-decoration-circle circle-2"></div>
        <div className="reset-decoration-circle circle-3"></div>
      </div>
      
      <div className="reset-image-indicators">
        {backgroundImages.map((_, index) => (
          <span 
            key={index}
            className={`reset-indicator ${currentBackground === index + 1 ? 'active' : ''}`}
            onClick={() => setCurrentBackground(index + 1)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResetPassword;