// src/pages/public/Login/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { publicApi } from '../../../services/api';
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
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  // 🔥 VERIFICACIÓN DE EMAIL
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(null); // null = no verificado, true = existe, false = no existe
  
  // Imágenes rotativas
  const backgroundImages = [
    '/img/login/login1.jpg',
    '/img/login/login2.jpg',
    '/img/login/login3.jpg',
    '/img/login/login4.jpg',
    '/img/login/login5.jpg'
  ];
  
  const [currentBackground, setCurrentBackground] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackground((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Frases motivacionales desde traducciones
  const quotes = [
    t('quotes.quote1'),
    t('quotes.quote2'),
    t('quotes.quote3'),
    t('quotes.quote4'),
    t('quotes.quote5')
  ];
  
  const [currentQuote, setCurrentQuote] = useState(0);

  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(quoteInterval);
  }, [quotes.length]);

  // ============================================
  // 🔥 VERIFICACIÓN DE EMAIL EN TIEMPO REAL
  // ============================================
  
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailExists = async (email) => {
    if (!email || !validateEmail(email)) return false;
    
    try {
      const response = await publicApi.get('/auth/check-email', {
        params: { email }
      });
      return response.data?.data?.exists === true;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  // Verificar email con debounce (500ms después de dejar de escribir)
  useEffect(() => {
    if (!formData.email || !validateEmail(formData.email)) {
      setEmailExists(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingEmail(true);
      const exists = await checkEmailExists(formData.email);
      setIsCheckingEmail(false);
      setEmailExists(exists);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Limpiar error del campo cuando el usuario escribe
    if (submitted && errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
    // Limpiar error de autenticación cuando el usuario escribe
    if (authError) {
      setAuthError(null);
    }
  };

  // Validación de campo
  const validateField = (field, value) => {
    let error = '';
    if (field === 'email' && !value.trim()) {
      error = t('login.email_required') || 'El correo electrónico es requerido';
    } else if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = t('login.email_invalid') || 'Ingresa un correo electrónico válido';
    } else if (field === 'password' && !value) {
      error = t('login.password_required') || 'La contraseña es requerida';
    }
    return error;
  };

  // Validar todo el formulario
  const validateForm = () => {
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    const newErrors = {};
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getDashboardPathByRole = (user) => {
    if (!user) return '/';
    switch(user.tipo) {
      case 'admin': return '/admin/dashboard';
      case 'veterinaria': return '/veterinaria/dashboard';
      case 'fundacion': return '/fundacion/dashboard';
      default: return '/';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marcar que se intentó enviar
    setSubmitted(true);
    setAuthError(null); // Limpiar error anterior
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        const dashboardPath = getDashboardPathByRole(result.user);
        navigate(dashboardPath);
      } else {
        // Mostrar el error específico del backend
        setAuthError(result.message || t('login.error'));
      }
    } catch (error) {
      console.error('Error inesperado:', error);
      setAuthError('Error al iniciar sesión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-grid">
        
        {/* COLUMNA IZQUIERDA */}
        <div 
          className="login-left"
          style={{ backgroundImage: `url('${backgroundImages[currentBackground]}')` }}
        >
          <div className="login-left-content">
            
            <div className="login-logo-container">
              <img src="/img/logo-claro.png" alt="Rescatando Mascotas Forever" className="login-logo" />
              <h1>Rescatando<br />Mascotas Forever</h1>
              <p>Sanando su historia</p>
            </div>
            
            <div className="login-quote-container">
              <i className="fas fa-quote-left"></i>
              <p>{quotes[currentQuote]}</p>
            </div>
            
            <div className="login-image-indicators">
              {backgroundImages.map((_, index) => (
                <span 
                  key={index}
                  className={`login-indicator ${currentBackground === index ? 'active' : ''}`}
                  onClick={() => setCurrentBackground(index)}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* COLUMNA DERECHA - Formulario */}
        <div className="login-right">
          <button 
            className="login-home-btn"
            onClick={handleGoHome}
            aria-label={t('home_button')}
          >
            <i className="fas fa-home"></i>
            <span>{t('home_button')}</span>
          </button>
          
          <div className="login-card">
            <h2>{t('login.title')}</h2>
            <p className="login-subtitle">{t('login.subtitle')}</p>
            
            {authError && (
              <div className="login-error-general">
                <i className="fas fa-exclamation-circle"></i>
                {authError}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-form-group">
                <label>{t('login.email')}</label>
                <div className="login-input-wrapper">
                  <input
                    type="text"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('login.email_placeholder')}
                    className={submitted && errors.email ? 'error' : ''}
                  />
                  {/* 🔥 INDICADORES DE VERIFICACIÓN DE EMAIL */}
                  {isCheckingEmail && (
                    <span className="login-input-loading">
                      <i className="fas fa-spinner fa-spin"></i>
                    </span>
                  )}
                  {!isCheckingEmail && formData.email && validateEmail(formData.email) && emailExists === true && (
                    <span className="login-input-check">
                      <i className="fas fa-check-circle" style={{ color: 'var(--color-success)' }}></i>
                    </span>
                  )}
                  {!isCheckingEmail && formData.email && validateEmail(formData.email) && emailExists === false && (
                    <span className="login-input-check">
                      <i className="fas fa-times-circle" style={{ color: 'var(--color-warning)' }}></i>
                    </span>
                  )}
                </div>
                {submitted && errors.email && (
                  <span className="login-field-error">{errors.email}</span>
                )}
                {!isCheckingEmail && formData.email && validateEmail(formData.email) && emailExists === false && (
                  <span className="login-field-hint" style={{ color: 'var(--color-warning)' }}>
                    <i className="fas fa-info-circle"></i> Este correo no está registrado
                  </span>
                )}
              </div>
              
              <div className="login-form-group">
                <label>{t('login.password')}</label>
                <div className="login-password-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('login.password_placeholder')}
                    className={submitted && errors.password ? 'error' : ''}
                  />
                  <button 
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {submitted && errors.password && (
                  <span className="login-field-error">{errors.password}</span>
                )}
              </div>
              
              <div className="login-options">
                <label className="login-checkbox">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>{t('login.remember')}</span>
                </label>
                <Link to="/forgot-password" className="login-forgot">
                  {t('login.forgot')}
                </Link>
              </div>
              
              <button 
                type="submit" 
                className="login-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> {t('login.loading')}
                  </>
                ) : (
                  t('login.button')
                )}
              </button>
            </form>
            
            <div className="login-divider">
              <span>{t('login.or')}</span>
            </div>
            
            <Link to="/register" className="login-register-btn">
              <i className="fas fa-user-plus"></i>
              {t('login.register')}
            </Link>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Login;