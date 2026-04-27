// src/pages/public/Login/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import './Login.css';

const Login = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(1);

  // Lista de imágenes locales
  const backgroundImages = [
    '/img/login/login1.jpg',
    '/img/login/login2.jpg',
    '/img/login/login3.jpg',
    '/img/login/login4.jpg',
    '/img/login/login5.jpg'
  ];

  // Frases motivacionales para cambiar cada cierto tiempo
  const motivationalQuotes = [
    t('quotes.quote1', { defaultValue: 'Adoptar no es comprar, es salvar una vida' }),
    t('quotes.quote2', { defaultValue: 'Ellos no necesitan palabras, solo amor y un hogar' }),
    t('quotes.quote3', { defaultValue: 'Un amigo fiel te espera para cambiar tu vida' }),
    t('quotes.quote4', { defaultValue: 'La mejor inversión es dar amor a quien no lo tiene' }),
    t('quotes.quote5', { defaultValue: 'Cada mascota rescatada es una historia de esperanza' })
  ];

  const [currentQuote, setCurrentQuote] = useState(0);

  // Cambiar fondo cada 5 segundos
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const interval = setInterval(() => {
      setCurrentBackground((prev) => {
        const nextIndex = (prev) % backgroundImages.length + 1;
        return nextIndex;
      });
    }, 5000);

    // Cambiar frase cada 5 segundos también
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length);
    }, 5000);

    return () => {
      document.body.style.overflow = 'auto';
      clearInterval(interval);
      clearInterval(quoteInterval);
    };
  }, []);

  // Actualizar el fondo del contenedor
  useEffect(() => {
    const container = document.querySelector('.login-container');
    if (container) {
      container.style.backgroundImage = `url('${backgroundImages[currentBackground - 1]}')`;
    }
  }, [currentBackground]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const getDashboardPathByRole = (user) => {
    if (!user) return '/login';
    
    switch(user.tipo) {
      case 'admin':
        return '/admin/dashboard';
      case 'veterinaria':
        return '/veterinaria/dashboard';
      case 'fundacion':
        return '/fundacion/dashboard';
      default:
        return '/';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const result = await login(formData);
    
    if (result.success) {
      const dashboardPath = getDashboardPathByRole(result.user);
      setTimeout(() => {
        navigate(dashboardPath);
      }, 50);
    } else {
      setErrors({ general: result.message });
    }
    
    setLoading(false);
  };

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div className="login-container">
      <div className="login-overlay"></div>
      
      {/* Botón de volver atrás - Clase encapsulada */}
      <button 
        className="login-back-button"
        onClick={handleGoBack}
        aria-label={t('buttons.back')}
      >
        <i className="fas fa-arrow-left"></i>
        <span>{t('buttons.back')}</span>
      </button>
      
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-wrapper">
            <img src="/img/logo-claro.png" alt="Logo" className="login-logo" />
          </div>
          <h1 className="login-title">{t('login.title')}</h1>
          <p className="login-subtitle">{t('welcome_back')}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <i className="fas fa-envelope input-icon"></i>
            <Input
              label={t('email')}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder={t('placeholders.email')}
            />
          </div>
          
          <div className="input-group">
            <i className="fas fa-lock input-icon"></i>
            <div className="password-wrapper">
              <Input
                label={t('password')}
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                required
                placeholder={t('placeholders.password')}
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
          </div>
          
          <div className="login-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>{t('remember')}</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              {t('forgot_password')}
            </Link>
          </div>
          
          {errors.general && (
            <div className="login-error-general">
              <i className="fas fa-exclamation-circle"></i>
              {errors.general}
            </div>
          )}
          
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="login-button"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                {t('loading')}
              </>
            ) : (
              <>
                {t('buttons.submit')}
              </>
            )}
          </Button>
        </form>
        
        <div className="login-divider">
          <span>{t('no_account')}</span>
        </div>
        
        <Link to="/register" className="register-button">
          <i className="fas fa-user-plus"></i>
          {t('register_now')}
        </Link>
      </div>
      
      {/* Texto motivacional - Clase encapsulada */}
      <div className="login-motivational-text">
        <p className="login-motivational-quote">
          <i className="fas fa-paw"></i>
          <span>{motivationalQuotes[currentQuote]}</span>
          <i className="fas fa-heart"></i>
        </p>
      </div>
      
      {/* Decoración - Clases encapsuladas */}
      <div className="login-decoration">
        <div className="login-decoration-circle circle-1"></div>
        <div className="login-decoration-circle circle-2"></div>
        <div className="login-decoration-circle circle-3"></div>
      </div>
      
      {/* Indicadores de cambio de imagen - Clases encapsuladas */}
      <div className="login-image-indicators">
        {backgroundImages.map((_, index) => (
          <span 
            key={index}
            className={`login-indicator ${currentBackground === index + 1 ? 'active' : ''}`}
            onClick={() => setCurrentBackground(index + 1)}
          />
        ))}
      </div>
    </div>
  );
};

export default Login;