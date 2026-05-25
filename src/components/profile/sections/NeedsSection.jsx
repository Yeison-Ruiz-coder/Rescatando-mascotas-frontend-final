// src/components/profile/sections/NeedsSection.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './NeedsSection.css';

const NeedsSection = ({ necesidades, onUpdate, isLoading }) => {
  const { t } = useTranslation();

  const needsList = [
    { id: 'alimento', icon: 'fas fa-utensils' },
    { id: 'medicinas', icon: 'fas fa-pills' },
    { id: 'voluntarios', icon: 'fas fa-hands-helping' },
    { id: 'donaciones', icon: 'fas fa-hand-holding-heart' },
    { id: 'mantenimiento', icon: 'fas fa-tools' },
    { id: 'transporte', icon: 'fas fa-truck' },
    { id: 'juguetes', icon: 'fas fa-puzzle-piece' },
    { id: 'camas', icon: 'fas fa-bed' },
    { id: 'correas', icon: 'fas fa-dog' },
    { id: 'jaulas', icon: 'fas fa-home' },
  ];

  const handleToggle = (needId) => {
    const current = necesidades || [];
    const newNeeds = current.includes(needId) ? current.filter(n => n !== needId) : [...current, needId];
    onUpdate(newNeeds);
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <div className="section-icon"><i className="fas fa-heart"></i></div>
        <div className="section-info">
          <h3>{t('profile.currentNeeds')}</h3>
          <p>{t('profile.needsDescription')}</p>
        </div>
      </div>

      <div className="needs-grid">
        {needsList.map(need => (
          <label key={need.id} className="need-card">
            <input type="checkbox" checked={necesidades?.includes(need.id) || false} onChange={() => handleToggle(need.id)} disabled={isLoading} />
            <i className={need.icon}></i>
            <span>{t(`profile.need_${need.id}`)}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default NeedsSection;