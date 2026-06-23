import React from 'react';
import { useTranslation } from 'react-i18next';

const SuscripcionesReportes = () => {
  const { t } = useTranslation('suscripciones');

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>{t('reportes_suscripciones', 'Reportes de suscripciones')}</h1>
          <p>{t('reportes_descripcion', 'Visualiza métricas y tendencias de suscripciones activas y canceladas.')}</p>
        </div>
      </div>

      <div className="card p-4">
        <h2>{t('reportes_resumen', 'Resumen de reportes')}</h2>
        <p>{t('reportes_resumen_descripcion', 'Estos datos ayudarán a controlar el comportamiento de los planes de patrocinio.')}</p>
        <div className="row mt-4">
          <div className="col-lg-4 mb-3">
            <div className="p-4 border rounded bg-light">
              <h3>{t('total_suscripciones', 'Total de suscripciones')}</h3>
              <p>{t('total_suscripciones_desc', 'Número total de suscripciones registradas.')}</p>
            </div>
          </div>
          <div className="col-lg-4 mb-3">
            <div className="p-4 border rounded bg-light">
              <h3>{t('suscripciones_activas', 'Suscripciones activas')}</h3>
              <p>{t('suscripciones_activas_desc', 'Suscripciones que están generando aporte actualmente.')}</p>
            </div>
          </div>
          <div className="col-lg-4 mb-3">
            <div className="p-4 border rounded bg-light">
              <h3>{t('suscripciones_canceladas', 'Suscripciones canceladas')}</h3>
              <p>{t('suscripciones_canceladas_desc', 'Suscripciones que han sido canceladas o finalizadas.')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuscripcionesReportes;
