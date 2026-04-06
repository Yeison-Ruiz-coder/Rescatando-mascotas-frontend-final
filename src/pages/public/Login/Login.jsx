// src/pages/public/Login/Login.jsx
import React, { useState } from 'react';
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

  return (
    <div className="login-container">
      {/* Overlay oscuro para mejorar legibilidad */}
      <div className="login-overlay"></div>
      
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
              placeholder="correo@ejemplo.com"
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
                placeholder="••••••••"
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
            <div className="error-general">
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
      
      {/* Decoración adicional */}
      <div className="login-decoration">
        <div className="decoration-circle circle-1"></div>
        <div className="decoration-circle circle-2"></div>
        <div className="decoration-circle circle-3"></div>
      </div>
    </div>
  );
};

export default Login;