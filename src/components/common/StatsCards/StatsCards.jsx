// src/components/common/StatsCards/StatsCards.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './StatsCards.css';

const StatsCards = ({ stats }) => {
  const { t } = useTranslation('mascotas');

  const cards = [
    {
      key: 'en_adopcion',
      label: t('stats.en_adopcion') || 'En Adopción',
      icon: 'fas fa-heart',
      color: 'success',
      value: stats.en_adopcion || 0
    },
    {
      key: 'adoptados',
      label: t('stats.adoptados') || 'Adoptados',
      icon: 'fas fa-home',
      color: 'info',
      value: stats.adoptados || 0
    },
    {
      key: 'rescatadas',
      label: t('stats.rescatadas') || 'Rescatadas',
      icon: 'fas fa-shield-alt',
      color: 'warning',
      value: stats.rescatadas || 0
    },
    {
      key: 'total',
      label: t('stats.total') || 'Total en Sistema',
      icon: 'fas fa-paw',
      color: 'secondary',
      value: stats.total || 0
    }
  ];

  return (
    <div className="stats-cards">
      <div className="row g-3">
        {cards.map((card) => (
          <div key={card.key} className="col-md-3 col-sm-6">
            <div className={`stat-card stat-card-${card.color}`}>
              <div className="stat-icon">
                <i className={card.icon}></i>
              </div>
              <div className="stat-info">
                <h4>{card.value}</h4>
                <p>{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsCards;