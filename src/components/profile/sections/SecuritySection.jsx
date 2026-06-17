// src/components/profile/sections/SecuritySection.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SecuritySection.css';

const SecuritySection = ({ onChangePassword, saving }) => {
  const { t } = useTranslation('profile');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (form.new_password !== form.confirm_password) {
      setError(t('profile.passwordMismatch'));
      setIsSubmitting(false);
      return;
    }
    if (form.new_password.length < 8) {
      setError(t('profile.passwordMinLength'));
      setIsSubmitting(false);
      return;
    }
    try {
      await onChangePassword({ 
        current_password: form.current_password, 
        new_password: form.new_password, 
        new_password_confirmation: form.confirm_password 
      });
      setShowModal(false);
      setForm({ current_password: '', new_password: '', confirm_password: '' });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setForm({ current_password: '', new_password: '', confirm_password: '' });
    setError('');
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-shield-alt"></i>
        </div>
        <div>
          <h3>{t('profile.security')}</h3>
          <p>{t('profile.securityDescription')}</p>
        </div>
      </div>

      {/* TARJETA: Cambiar contraseña */}
      <div className="profile-security-card">
        <div className="profile-security-icon">
          <i className="fas fa-key"></i>
        </div>
        <div className="profile-security-info">
          <h4>{t('profile.changePassword')}</h4>
          <p>{t('profile.securityInfo')}</p>
        </div>
        <button 
          className="btn btn-outline" 
          onClick={() => setShowModal(true)}
          disabled={saving}
        >
          <i className="fas fa-edit"></i> {t('profile.changePassword')}
        </button>
      </div>

      {/* TARJETA: Autenticación de dos factores */}
      <div className="profile-security-card">
        <div className="profile-security-icon">
          <i className="fas fa-mobile-alt"></i>
        </div>
        <div className="profile-security-info">
          <h4>{t('profile.twoFactorAuth')}</h4>
          <p>{t('profile.twoFactorDescription')}</p>
        </div>
        <button className="btn btn-outline" disabled>
          {t('profile.comingSoon')}
        </button>
      </div>

      {/* MODAL: Cambiar contraseña */}
      {showModal && (
        <div className="ss-modal-overlay" onClick={handleCancel}>
          <div className="ss-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ss-modal-header">
              <h4>
                <i className="fas fa-key"></i> {t('profile.changePassword')}
              </h4>
              <button 
                className="ss-modal-close" 
                onClick={handleCancel}
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">{t('profile.currentPassword')}</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={form.current_password} 
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })} 
                  placeholder="••••••••"
                  required 
                  autoComplete="current-password"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('profile.newPassword')}</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={form.new_password} 
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })} 
                  placeholder="••••••••"
                  required 
                  autoComplete="new-password"
                  minLength="8"
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('profile.confirmNewPassword')}</label>
                <input 
                  type="password" 
                  className="form-input"
                  value={form.confirm_password} 
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} 
                  placeholder="••••••••"
                  required 
                  autoComplete="new-password"
                />
              </div>
              {error && (
                <div className="ss-error">
                  <i className="fas fa-exclamation-circle"></i> {error}
                </div>
              )}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn btn-outline btn-cancel" 
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  <i className="fas fa-times"></i> {t('common.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  disabled={isSubmitting || saving}
                >
                  {(isSubmitting || saving) ? (
                    <><i className="fas fa-spinner fa-spin"></i> {t('common.saving')}</>
                  ) : (
                    t('profile.changePassword')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default SecuritySection;