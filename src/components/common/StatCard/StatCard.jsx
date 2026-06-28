import React from 'react';
import './StatCard.css';

const StatCard = ({ icon, label, value, color, subtitle }) => {
  const getColorClass = () => {
    switch (color) {
      case 'danger': return 'stat-danger';
      case 'warning': return 'stat-warning';
      case 'success': return 'stat-success';
      default: return 'stat-primary';
    }
  };

  return (
    <div className={`stat-card-modern ${getColorClass()}`}>
      <div className="stat-header-modern">
        <div className="stat-icon-modern">{icon}</div>
        <span className="stat-badge-modern">{label}</span>
      </div>
      <div className="stat-body-modern">
        <span className="stat-value-modern">{value}</span>
        <span className="stat-label-modern">{subtitle || label}</span>
      </div>
    </div>
  );
};

export default StatCard;