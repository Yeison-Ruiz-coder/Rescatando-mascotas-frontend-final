// src/components/profile/sections/SecuritySection.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const SecuritySection = ({ onChangePassword, saving }) => {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm_password) {
      setError(t('profile.passwordMismatch'));
      return;
    }
    if (form.new_password.length < 8) {
      setError(t('profile.passwordMinLength'));
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
    }
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

      <div className="profile-security-card">
        <div className="profile-security-icon">
          <i className="fas fa-key"></i>
        </div>
        <div className="profile-security-info">
          <h4>{t('profile.changePassword')}</h4>
          <p>{t('profile.securityInfo')}</p>
        </div>
        <button className="btn btn-outline" onClick={() => setShowModal(true)}>
          <i className="fas fa-edit"></i> {t('profile.changePassword')}
        </button>
      </div>

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

      {showModal && (
        <div className="profile-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <h4><i className="fas fa-key"></i> {t('profile.changePassword')}</h4>
              <button className="profile-modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="profile-form-group">
                <label>{t('profile.currentPassword')}</label>
                <input 
                  type="password" 
                  value={form.current_password} 
                  onChange={(e) => setForm({ ...form, current_password: e.target.value })} 
                  required 
                />
              </div>
              <div className="profile-form-group">
                <label>{t('profile.newPassword')}</label>
                <input 
                  type="password" 
                  value={form.new_password} 
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })} 
                  required 
                />
              </div>
              <div className="profile-form-group">
                <label>{t('profile.confirmNewPassword')}</label>
                <input 
                  type="password" 
                  value={form.confirm_password} 
                  onChange={(e) => setForm({ ...form, confirm_password: e.target.value })} 
                  required 
                />
              </div>
              {error && <p className="profile-error">{error}</p>}
              <div className="profile-form-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? (
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