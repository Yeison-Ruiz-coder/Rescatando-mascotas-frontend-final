// src/components/profile/sections/SocialSection.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const SocialSection = ({ profile, onSave, saving }) => {
  const { t } = useTranslation('profile');
  const [form, setForm] = useState({ facebook: '', instagram: '', twitter: '', linkedin: '' });

  useEffect(() => {
    if (profile?.redes_sociales) {
      setForm(profile.redes_sociales);
    }
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  const socials = [
    { id: 'facebook', icon: 'fab fa-facebook', label: 'Facebook' },
    { id: 'instagram', icon: 'fab fa-instagram', label: 'Instagram' },
    { id: 'twitter', icon: 'fab fa-twitter', label: 'Twitter' },
    { id: 'linkedin', icon: 'fab fa-linkedin', label: 'LinkedIn' },
  ];

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-share-alt"></i>
        </div>
        <div>
          <h3>{t('profile.socialNetworks')}</h3>
          <p>{t('profile.socialNetworksDescription')}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="form">
        {socials.map((social) => (
          <div key={social.id} className="form-group">
            <label className="form-label">
              <i className={social.icon}></i> {social.label}
            </label>
            <input 
              type="text" 
              className="form-input"
              value={form[social.id] || ''} 
              onChange={(e) => setForm({ ...form, [social.id]: e.target.value })} 
              placeholder={social.label} 
            />
          </div>
        ))}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <><i className="fas fa-spinner fa-spin"></i> {t('common.saving')}</>
            ) : (
              t('common.save')
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default SocialSection;