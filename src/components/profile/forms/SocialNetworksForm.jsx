// src/components/profile/forms/SocialNetworksForm.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './SocialNetworksForm.css';

const SocialNetworksForm = ({ initialData, onSubmit, isLoading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    youtube: '',
    tiktok: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        facebook: initialData.facebook || '',
        instagram: initialData.instagram || '',
        twitter: initialData.twitter || '',
        linkedin: initialData.linkedin || '',
        youtube: initialData.youtube || '',
        tiktok: initialData.tiktok || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanData = Object.fromEntries(Object.entries(formData).filter(([_, v]) => v && v.trim() !== ''));
    onSubmit(cleanData);
  };

  const socials = [
    { name: 'facebook', icon: 'fab fa-facebook', placeholder: 'https://facebook.com/tu-usuario' },
    { name: 'instagram', icon: 'fab fa-instagram', placeholder: '@usuario' },
    { name: 'twitter', icon: 'fab fa-twitter', placeholder: 'https://twitter.com/usuario' },
    { name: 'linkedin', icon: 'fab fa-linkedin', placeholder: 'https://linkedin.com/in/usuario' },
    { name: 'youtube', icon: 'fab fa-youtube', placeholder: 'https://youtube.com/@usuario' },
    { name: 'tiktok', icon: 'fab fa-tiktok', placeholder: '@usuario' }
  ];

  return (
    <form onSubmit={handleSubmit} className="social-form">
      {socials.map(social => (
        <div key={social.name} className="form-group">
          <label className="form-label">
            <i className={`${social.icon} me-2`}></i>
            {t(`profile.${social.name}`)}
          </label>
          <input type="text" name={social.name} className="form-input" value={formData[social.name]} onChange={handleChange} placeholder={social.placeholder} />
        </div>
      ))}

      <div className="form-actions">
        <button type="submit" className="btn-primary-global" disabled={isLoading}>
          {isLoading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default SocialNetworksForm;