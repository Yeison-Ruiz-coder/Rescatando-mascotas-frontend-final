import React from 'react';
import { useTranslation } from 'react-i18next';

const Testimonios = () => {
  const { t } = useTranslation('home');

  const testimonios = [
    {
      name: t('testimonios.maria.name'),
      role: t('testimonios.maria.role'),
      text: t('testimonios.maria.text'),
      image: 'https://img.freepik.com/foto-gratis/retrato-joven-hermosa-nina-morena-sonriendo_176420-9836.jpg'
    },
    {
      name: t('testimonios.carlos.name'),
      role: t('testimonios.carlos.role'),
      text: t('testimonios.carlos.text'),
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: t('testimonios.ana.name'),
      role: t('testimonios.ana.role'),
      text: t('testimonios.ana.text'),
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  return (
    <section className="section testimonios">
      <div className="container">
        <h2 className="section-title">{t('testimonios.title')}</h2>
        <p className="section-subtitle">{t('testimonios.subtitle')}</p>

        <div className="testimonios-grid">
          {testimonios.map((testimonio, index) => (
            <div key={index} className="testimonial">
              <div className="testimonial-author">
                <img
                  src={testimonio.image}
                  className="testimonial-avatar"
                  alt={testimonio.name}
                />
                <div>
                  <h4 className="testimonial-name">{testimonio.name}</h4>
                  <p className="testimonial-role">{testimonio.role}</p>
                </div>
              </div>
              <p className="testimonial-text">"{testimonio.text}"</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonios;