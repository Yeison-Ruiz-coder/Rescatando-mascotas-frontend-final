// src/pages/public/Home/components/AnimatedStats.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './AnimatedStats.css';

const Counter = ({ end, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    
    let startTime;
    let animationFrame;
    const startValue = 0;
    const endValue = end;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOutCubic;
      setCount(Math.floor(currentValue));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isVisible]);

  return <span ref={ref}>{count.toLocaleString()}+</span>;
};

const AnimatedStats = ({ stats }) => {
  const { t } = useTranslation('home');

  const statsData = [
    { value: stats.mascotas_rescatadas, label: t('stats.rescates'), icon: 'fas fa-paw' },
    { value: stats.adopciones_exitosas, label: t('stats.adopciones'), icon: 'fas fa-heart' },
    { value: stats.voluntarios_activos, label: t('stats.voluntarios'), icon: 'fas fa-users' },
    { value: stats.anos_experiencia, label: t('stats.experiencia'), icon: 'fas fa-calendar-alt' }
  ];

  return (
    <section className="as-stats-modern">
      <div className="as-stats-container-modern">
        <div className="as-stats-grid-modern stagger-children">
          {statsData.map((stat, index) => (
            <div key={index} className="as-stats-card-modern">
              <div className="as-stats-icon-modern">
                <i className={stat.icon}></i>
              </div>
              <div className="as-stats-number-modern">
                <Counter end={stat.value} />
              </div>
              <p className="as-stats-label-modern">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedStats;