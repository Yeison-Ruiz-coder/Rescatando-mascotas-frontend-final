// Stats.jsx (mejorado con div envolvente)
import React from 'react';
import { useTranslation } from 'react-i18next';

const Stats = ({ stats }) => {
  const { t } = useTranslation('home');

  const statsData = [
    { value: stats.mascotas_rescatadas, label: t('stats.rescates') },
    { value: stats.adopciones_exitosas, label: t('stats.adopciones') },
    { value: stats.voluntarios_activos, label: t('stats.voluntarios') },
    { value: stats.anos_experiencia, label: t('stats.experiencia') }
  ];

  return (
    <section className="stats">
      <div className="container">
        <div className="stats-grid">
          {statsData.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-number">{stat.value}</div>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;