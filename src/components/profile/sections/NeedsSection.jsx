// src/components/profile/sections/NeedsSection.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const NeedsSection = ({ necesidades, onUpdate, saving }) => {
  const { t } = useTranslation();
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected(necesidades || []);
  }, [necesidades]);

  const needsList = [
    { id: 'alimento', icon: 'fa-utensils', label: t('profile.need_alimento') },
    { id: 'medicinas', icon: 'fa-pills', label: t('profile.need_medicinas') },
    { id: 'voluntarios', icon: 'fa-hands-helping', label: t('profile.need_voluntarios') },
    { id: 'donaciones', icon: 'fa-hand-holding-heart', label: t('profile.need_donaciones') },
    { id: 'mantenimiento', icon: 'fa-tools', label: t('profile.need_mantenimiento') },
    { id: 'transporte', icon: 'fa-truck', label: t('profile.need_transporte') },
  ];

  const toggleNeed = (id) => {
    const newSelected = selected.includes(id) 
      ? selected.filter(n => n !== id) 
      : [...selected, id];
    setSelected(newSelected);
    onUpdate(newSelected);
  };

  return (
    <section className="profile-section">
      <div className="profile-section-header">
        <div className="profile-section-icon">
          <i className="fas fa-heart"></i>
        </div>
        <div>
          <h3>{t('profile.currentNeeds')}</h3>
          <p>{t('profile.needsDescription')}</p>
        </div>
      </div>
      <div className="profile-needs-grid">
        {needsList.map((need) => (
          <label key={need.id} className="profile-need-card">
            <input 
              type="checkbox" 
              checked={selected.includes(need.id)} 
              onChange={() => toggleNeed(need.id)} 
              disabled={saving} 
            />
            <i className={`fas ${need.icon}`}></i>
            <span>{need.label}</span>
          </label>
        ))}
      </div>
    </section>
  );
};

export default NeedsSection;