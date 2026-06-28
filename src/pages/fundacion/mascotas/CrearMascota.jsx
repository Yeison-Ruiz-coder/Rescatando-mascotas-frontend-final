// src/pages/fundacion/mascotas/CrearMascota.jsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import useCrearMascota from '../../../hooks/useCrearMascota';
import MascotaFormSteps from './components/MascotaFormSteps';
import FormStep1 from './components/FormStep1';
import FormStep2 from './components/FormStep2';
import FormStep3 from './components/FormStep3';
import FormStep4 from './components/FormStep4';
import FormStep5 from './components/FormStep5';
import FormStep6 from './components/FormStep6';
import FormActions from './components/FormActions';
import './NuevaMascota.css';

const CrearMascota = () => {
  const { t } = useTranslation('nuevaMascota');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const {
    form,
    setForm,
    errors,
    loading,
    initialLoading,
    loadingRescate,
    currentStep,
    rescateInfo,
    rescateId,
    esFundacion,
    isFromRescate,
    especies,
    generos,
    estados,
    steps,
    totalSteps,
    razasList,
    vacunasList,
    setCurrentStep,
    nextStep,
    prevStep,
    handleSubmit,
    getImageUrl,
    fundacionNombre,
  } = useCrearMascota();

  const adminName = user?.name || user?.nombre || t('fundacion', 'Fundación');
  const adminAvatar = user?.avatar || null;

  const handleGoBack = () => {
    if (currentStep > 1) {
      prevStep();
    } else {
      if (window.confirm(t('confirmaciones.salir', { defaultValue: '¿Estás seguro de que quieres salir? Los datos no guardados se perderán.' }))) {
        navigate(-1);
      }
    }
  };

  if (initialLoading || loadingRescate) {
    return (
      <div className="nueva-mascota-page">
        <LoadingSpinner text={t('cargando', { defaultValue: 'Cargando...' })} />
      </div>
    );
  }

  if (!esFundacion) {
    return (
      <div className="nueva-mascota-page">
        <div className="error-container">
          <i className="fas fa-exclamation-triangle"></i>
          <h2>{t('errores.no_autorizado', { defaultValue: 'No autorizado' })}</h2>
          <p>{t('errores.solo_fundacion', { defaultValue: 'Solo las fundaciones pueden acceder a esta página.' })}</p>
          <button className="btn-back-error" onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i> {t('botones.volver', { defaultValue: 'Volver' })}
          </button>
        </div>
      </div>
    );
  }

  const titulo = isFromRescate 
    ? t('titulo_registrar_rescate', { defaultValue: 'Registrar Mascota Rescatada' })
    : t('titulo_nueva', { defaultValue: 'Registrar Nueva Mascota' });

  return (
    <div className="nueva-mascota-page">
      {/* ===== BANNER ===== */}
      <div className="nueva-mascota-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: titulo,
            solicitudes: 0,
            adopciones: 0,
            eventos: 0,
          }}
        />
      </div>

      {/* ===== CONTENIDO ===== */}
      <div className="nueva-mascota-content">
        <div className="bento-container">
          <div className="page-header-buttons">
            <button className="btn-back-page" onClick={handleGoBack}>
              <i className="fas fa-arrow-left"></i>
              <span>{t('botones.volver', { defaultValue: 'Volver' })}</span>
            </button>
          </div>

          <div className="mascota-form-container">
            <div className="form-header">
              <h1>
                <i className="fas fa-paw"></i>
                {titulo}
              </h1>
              <p className="form-subtitle">
                {fundacionNombre 
                  ? `${t('fundacion_label', { defaultValue: 'Fundación' })}: ${fundacionNombre}` 
                  : t('subtitulo', { defaultValue: 'Completa los datos de la mascota' })
                }
              </p>
              {rescateInfo && (
                <div className="rescate-info-badge">
                  <i className="fas fa-ambulance"></i>
                  {t('registrando_desde_rescate', { defaultValue: 'Registrando desde rescate' })}: {rescateInfo.lugar_rescate}
                </div>
              )}
            </div>

            <MascotaFormSteps steps={steps} currentStep={currentStep} setCurrentStep={setCurrentStep} />

            <div className="form-content">
              <form onSubmit={handleSubmit}>
                {currentStep === 1 && (
                  <FormStep1 
                    form={form} 
                    setForm={setForm} 
                    errors={errors} 
                    especies={especies} 
                    generos={generos} 
                    estados={estados} 
                    razasList={razasList} 
                  />
                )}
                {currentStep === 2 && (
                  <FormStep2 
                    form={form} 
                    setForm={setForm} 
                    errors={errors} 
                  />
                )}
                {currentStep === 3 && (
                  <FormStep3 
                    form={form} 
                    setForm={setForm} 
                    errors={errors} 
                  />
                )}
                {currentStep === 4 && (
                  <FormStep4 
                    form={form} 
                    setForm={setForm} 
                    vacunasList={vacunasList} 
                  />
                )}
                {currentStep === 5 && (
                  <FormStep5 
                    form={form} 
                    setForm={setForm} 
                    errors={errors} 
                  />
                )}
                {currentStep === 6 && (
                  <FormStep6 
                    form={form} 
                    setForm={setForm} 
                    errors={errors} 
                    getImageUrl={getImageUrl}
                    galeriaExistente={[]}
                    onRemoveExistingFoto={() => {}}
                  />
                )}
                
                <FormActions 
                  currentStep={currentStep} 
                  totalSteps={totalSteps}
                  onPrev={prevStep} 
                  onNext={nextStep} 
                  onSubmit={handleSubmit} 
                  loading={loading}
                  isEditMode={false}
                  cancelUrl="/fundacion/mascotas"
                />
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrearMascota;