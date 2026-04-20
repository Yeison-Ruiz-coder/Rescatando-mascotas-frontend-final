// src/pages/public/ReportarRescate/ReportarRescate.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/common/Input/Input';
import Textarea from '../../../components/common/Textarea/Textarea';
import Button from '../../../components/common/Button/Button';
import LocationPicker from '../../../components/common/LocationPicker/LocationPicker';
import useRescate from '../../../hooks/useRescate';
import './ReportarRescate.css';

const ReportarRescate = () => {
  const navigate = useNavigate();
  const {
    formData,
    errors,
    loading,
    submitSuccess,
    gettingLocation,
    prioridad,
    handleChange,
    handleLocationChange,
    getCurrentLocation,
    setPrioridadManual,
    handleSubmit,
    prioridadConfig,
    prioridadTexto,
    botonesPrioridad,
    t,
  } = useRescate();

  // Renderizar tarjeta de prioridad
  const renderPrioridadCard = () => {
    if (!prioridad) return null;

    const info = prioridadConfig[prioridad.tipo] || prioridadConfig.otro;

    return (
      <div
        className="prioridad-card"
        style={{ backgroundColor: info.bgColor, borderLeftColor: info.color }}
      >
        <div className="prioridad-header">
          <i className={`fas ${info.icon}`} style={{ color: info.color, fontSize: '1.5rem' }}></i>
          <span className="prioridad-title" style={{ color: info.color }}>{info.title}</span>
          <span className={`prioridad-badge prioridad-${prioridad.prioridad}`}>
            <i className="fas fa-flag"></i> {t('prioridad_label')}: {prioridadTexto[prioridad.prioridad]}
          </span>
        </div>
        <p className="prioridad-descripcion">{info.description}</p>
        <div className="prioridad-recomendacion">
          <strong><i className="fas fa-lightbulb"></i> {t('recomendacion_label')}:</strong> {info.recomendacion}
        </div>
      </div>
    );
  };

  // Botones de prioridad manual
  const renderPrioridadButtons = () => (
    <div className="prioridad-buttons-container">
      <label className="form-label">
        <i className="fas fa-exclamation-triangle"></i> {t('manual_classify')}
      </label>
      <div className="prioridad-buttons">
        {botonesPrioridad.map((btn) => (
          <button
            key={btn.tipo}
            type="button"
            className={`prioridad-btn ${btn.tipo} ${prioridad?.tipo === btn.tipo ? 'active' : ''}`}
            onClick={() => setPrioridadManual(btn.tipo)}
          >
            <i className={`fas ${btn.icono}`}></i>
            <span>{btn.label}</span>
            <small>{btn.desc}</small>
          </button>
        ))}
      </div>
      <small className="form-hint">
        <i className="fas fa-microphone-alt"></i> {t('auto_classify_hint')}
      </small>
    </div>
  );

  if (submitSuccess) {
    return (
      <div className="rescate-success">
        <div className="success-card">
          <i className="fas fa-check-circle"></i>
          <h2>{t('success_title')}</h2>
          <p>{t('success_message')}</p>
          <Button onClick={() => navigate('/')} variant="primary">
            <i className="fas fa-home"></i> {t('back_home')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rescate-page">
      <div className="container">
        <div className="rescate-header">
          <h1><i className="fas fa-paw"></i> {t('title')}</h1>
          <p className="subtitle">{t('subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="rescate-form">
          {errors.general && (
            <div className="alert alert-error">
              <i className="fas fa-exclamation-circle"></i> {errors.general}
            </div>
          )}

          <Input
            label={t('lugar_label')}
            name="lugar_rescate"
            value={formData.lugar_rescate}
            onChange={handleChange}
            error={errors.lugar_rescate}
            required
            placeholder={t('lugar_placeholder')}
          />

          <Textarea
            label={t('descripcion_label')}
            name="descripcion_rescate"
            value={formData.descripcion_rescate}
            onChange={handleChange}
            error={errors.descripcion_rescate}
            required
            placeholder={t('descripcion_placeholder')}
            rows={5}
          />

          {renderPrioridadButtons()}
          {renderPrioridadCard()}

          <Input
            label={t('fecha_label')}
            name="fecha_rescate"
            type="date"
            value={formData.fecha_rescate}
            onChange={handleChange}
            error={errors.fecha_rescate}
            required
          />

          <div className="form-row">
            <label className="form-label">
              <i className="fas fa-map-marker-alt"></i> {t('map_label')}
            </label>
            <div className="location-buttons">
              <Button
                type="button"
                variant="secondary"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
              >
                <i className="fas fa-location-dot"></i>
                {gettingLocation ? t('getting_location') : t('use_my_location')}
              </Button>
            </div>
            <LocationPicker
              onLocationChange={handleLocationChange}
              initialLat={formData.lat}
              initialLng={formData.lng}
              height="300px"
            />
            {formData.lat && formData.lng && (
              <div className="location-confirmed">
                <i className="fas fa-check-circle"></i>
                <span>{t('location_selected')}: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}</span>
              </div>
            )}
            <small className="form-hint">
              <i className="fas fa-info-circle"></i> {t('map_hint')}
            </small>
          </div>

          <div className="form-divider">
            <span><i className="fas fa-user-edit"></i> {t('optional_data')}</span>
          </div>

          <Input
            label={t('nombre_label')}
            name="nombre_reportante"
            value={formData.nombre_reportante}
            onChange={handleChange}
            placeholder={t('nombre_placeholder')}
          />

          <Input
            label={t('email_label')}
            name="email_reportante"
            type="email"
            value={formData.email_reportante}
            onChange={handleChange}
            error={errors.email_reportante}
            placeholder={t('email_placeholder')}
          />

          <Input
            label={t('telefono_label')}
            name="telefono_reportante"
            value={formData.telefono_reportante}
            onChange={handleChange}
            placeholder={t('telefono_placeholder')}
          />

          <div className="form-actions">
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paw"></i>}
              {loading ? ` ${t('sending')}` : ` ${t('submit_btn')}`}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
              <i className="fas fa-times"></i> {t('cancel_btn')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportarRescate;