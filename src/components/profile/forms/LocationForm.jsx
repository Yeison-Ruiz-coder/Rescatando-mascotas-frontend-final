// src/components/profile/forms/LocationForm.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './LocationForm.css';

const LocationForm = ({ initialData, onSubmit, isLoading }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    direccion: '',
    pais: '',
    ciudad: '',
    codigo_postal: '',
    lat: '',
    lng: ''
  });
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        direccion: initialData.direccion || '',
        pais: initialData.pais || '',
        ciudad: initialData.ciudad || '',
        codigo_postal: initialData.codigo_postal || '',
        lat: initialData.lat || '',
        lng: initialData.lng || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            lat: position.coords.latitude.toString(),
            lng: position.coords.longitude.toString()
          });
          setLocating(false);
        },
        () => setLocating(false)
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="location-form">
      <div className="form-group">
        <label className="form-label">{t('profile.address')}</label>
        <input type="text" name="direccion" className="form-input" value={formData.direccion} onChange={handleChange} placeholder={t('profile.addressPlaceholder')} />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t('profile.country')}</label>
          <input type="text" name="pais" className="form-input" value={formData.pais} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">{t('profile.city')}</label>
          <input type="text" name="ciudad" className="form-input" value={formData.ciudad} onChange={handleChange} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">{t('profile.postalCode')}</label>
        <input type="text" name="codigo_postal" className="form-input" value={formData.codigo_postal} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label className="form-label">{t('profile.coordinates')}</label>
        <div className="form-row">
          <input type="text" name="lat" className="form-input" value={formData.lat} onChange={handleChange} placeholder={t('profile.latitude')} />
          <input type="text" name="lng" className="form-input" value={formData.lng} onChange={handleChange} placeholder={t('profile.longitude')} />
        </div>
        <button type="button" className="location-current-btn" onClick={getCurrentLocation} disabled={locating}>
          <i className={`fas fa-${locating ? 'spinner fa-pulse' : 'location-dot'}`}></i>
          {locating ? t('profile.locating') : t('profile.useCurrentLocation')}
        </button>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary-global" disabled={isLoading}>
          {isLoading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default LocationForm;