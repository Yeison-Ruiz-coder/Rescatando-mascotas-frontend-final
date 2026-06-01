// src/components/profile/forms/ChangePasswordModal.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ChangePasswordModal = ({ onSubmit, onClose, isLoading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.new_password !== formData.new_password_confirmation) {
      setError(t('profile.passwordMismatch'));
      return;
    }
    
    if (formData.new_password.length < 8) {
      setError(t('profile.passwordMinLength'));
      return;
    }

    try {
      await onSubmit({
        current_password: formData.current_password,
        new_password: formData.new_password,
        new_password_confirmation: formData.new_password_confirmation
      });
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5 className="modal-title">
            <i className="fas fa-key me-2"></i>
            {t('profile.changePassword')}
          </h5>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">{t('profile.currentPassword')}</label>
              <input 
                type="password" 
                name="current_password" 
                className="form-input" 
                value={formData.current_password} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('profile.newPassword')}</label>
              <input 
                type="password" 
                name="new_password" 
                className="form-input" 
                value={formData.new_password} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('profile.confirmNewPassword')}</label>
              <input 
                type="password" 
                name="new_password_confirmation" 
                className="form-input" 
                value={formData.new_password_confirmation} 
                onChange={handleChange} 
                required 
              />
            </div>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary-global" onClick={onClose}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn-primary-global" disabled={isLoading}>
              {isLoading && <i className="fas fa-spinner fa-pulse me-2"></i>}
              {isLoading ? t('common.saving') : t('profile.changePassword')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;