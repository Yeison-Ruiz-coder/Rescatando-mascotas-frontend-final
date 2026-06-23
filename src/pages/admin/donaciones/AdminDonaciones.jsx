import React from 'react';
import { useTranslation } from 'react-i18next';
import './AdminDonaciones.css';

const sampleDonaciones = [
  {
    id: 1,
    titulo: 'Alimento para mascotas en refugio',
    descripcion: 'Donación de alimento balanceado para cubrir 30 días de rescate animal.',
    monto: '$250.000',
    estado: 'En curso',
  },
  {
    id: 2,
    titulo: 'Jornadas médicas móviles',
    descripcion: 'Apoyo para vacunas y atención veterinaria en cuatro albergues.',
    monto: '$180.000',
    estado: 'Finalizada',
  },
  {
    id: 3,
    titulo: 'Campaña de esterilización',
    descripcion: 'Fondos para esterilizar 50 perros y gatos en comunidades vulnerables.',
    monto: '$320.000',
    estado: 'Pendiente',
  },
];

const AdminDonaciones = () => {
  const { t } = useTranslation('admin');

  return (
    <div className="admin-donaciones-page">
      <header className="admin-donaciones-hero">
        <div className="admin-donaciones-hero-content">
          <span>{t('donaciones_hero_badge', 'Donaciones Admin')}</span>
          <h1>{t('donaciones_hero_title', 'Gestión de donaciones')}</h1>
          <p>{t('donaciones_hero_desc', 'Revisa el flujo de donaciones, estados y campañas activas con datos de prueba.')}</p>
        </div>
      </header>

      <section className="admin-donaciones-summary">
        <div className="donacion-card resumen-card">
          <h2>{t('donaciones_total', 'Total donado')}</h2>
          <strong>$750.000</strong>
          <p>{t('donaciones_total_desc', 'Recibo de donaciones procesadas en el último mes.')}</p>
        </div>
        <div className="donacion-card resumen-card">
          <h2>{t('donaciones_campanas', 'Campañas activas')}</h2>
          <strong>3</strong>
          <p>{t('donaciones_campanas_desc', 'Número de campañas de donación actualmente abiertas.')}</p>
        </div>
        <div className="donacion-card resumen-card">
          <h2>{t('donaciones_fundaciones', 'Fundaciones apoyadas')}</h2>
          <strong>5</strong>
          <p>{t('donaciones_fundaciones_desc', 'Fundaciones y refugios que reciben ayuda este mes.')}</p>
        </div>
      </section>

      <section className="admin-donaciones-list">
        <div className="section-header">
          <h2>{t('donaciones_lista_title', 'Donaciones de prueba')}</h2>
          <p>{t('donaciones_lista_desc', 'Estos son ejemplos de campañas y donaciones registradas para revisión.')}</p>
        </div>

        <div className="admin-donaciones-grid">
          {sampleDonaciones.map((item) => (
            <article key={item.id} className="admin-donacion-item">
              <div className="donacion-item-header">
                <h3>{item.titulo}</h3>
                <span className={`status status-${item.estado.toLowerCase()}`}>{item.estado}</span>
              </div>
              <p>{item.descripcion}</p>
              <div className="donacion-item-footer">
                <span>{t('donaciones_monto', 'Monto')}:</span>
                <strong>{item.monto}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDonaciones;
