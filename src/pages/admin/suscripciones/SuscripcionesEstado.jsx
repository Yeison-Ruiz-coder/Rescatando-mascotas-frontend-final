import React from 'react';
import { useTranslation } from 'react-i18next';

const SuscripcionesEstado = () => {
  const { t } = useTranslation('suscripciones');

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>{t('gestion_estados', 'Gestión de estados')}</h1>
          <p>{t('estado_descripcion', 'Administra estados, pausas y reactivaciones de suscripciones.')}</p>
        </div>
      </div>

      <div className="card p-4 mb-4">
        <h2>{t('estado_panel', 'Panel de estados')}</h2>
        <p>{t('estado_panel_descripcion', 'Selecciona una suscripción para cambiar su estado o revisar su historial.')}</p>
        <div className="row mt-4">
          <div className="col-lg-4 mb-3">
            <div className="p-4 border rounded bg-light">
              <h3>{t('estado_activos', 'Activas')}</h3>
              <p>{t('estado_activos_desc', 'Suscripciones activas que generan donaciones actualmente.')}</p>
            </div>
          </div>
          <div className="col-lg-4 mb-3">
            <div className="p-4 border rounded bg-light">
              <h3>{t('estado_pausadas', 'Pausadas')}</h3>
              <p>{t('estado_pausadas_desc', 'Suscripciones temporalmente inactivas.')}</p>
            </div>
          </div>
          <div className="col-lg-4 mb-3">
            <div className="p-4 border rounded bg-light">
              <h3>{t('estado_canceladas', 'Canceladas')}</h3>
              <p>{t('estado_canceladas_desc', 'Suscripciones canceladas por el usuario o por el equipo.')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4">
        <h2>{t('acciones', 'Acciones')}</h2>
        <p>{t('acciones_descripcion', 'En esta sección podrás cambiar el estado de las suscripciones y ver las acciones recientes.')}</p>
      </div>
    </div>
  );
};

export default SuscripcionesEstado;
