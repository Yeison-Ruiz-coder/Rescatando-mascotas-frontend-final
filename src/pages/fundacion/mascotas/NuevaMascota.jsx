// src/pages/fundacion/mascotas/NuevaMascota.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import useNuevaMascota from '../../../hooks/useNuevaMascota';
import MascotaFormSteps from '../../../components/fundacion/mascotas/MascotaFormSteps';
import FormStep1 from '../../../components/fundacion/mascotas/FormStep1';
import FormStep2 from '../../../components/fundacion/mascotas/FormStep2';
import FormStep3 from '../../../components/fundacion/mascotas/FormStep3';
import FormStep4 from '../../../components/fundacion/mascotas/FormStep4';
import FormActions from '../../../components/fundacion/mascotas/FormActions';
import './NuevaMascota.css';

const NuevaMascota = () => {
  const { t } = useTranslation('nuevaMascota');
  const navigate = useNavigate();
  const {
    form,
    setForm,
    errors,
    loading,
    initialLoading,
    loadingRescate,
    loadingMascota,
    currentStep,
    rescateInfo,
    rescateId,
    esFundacion,
    isEditMode,
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
  } = useNuevaMascota();

  const getTitle = () => {
    if (isEditMode) return t('editar_mascota');
    if (isFromRescate) return t('registrar_mascota_rescatada');
    return t('titulo');
  };

  const getSubtitle = () => {
    if (isEditMode) return t('editar_mascota_desc');
    if (isFromRescate) return t('registrar_mascota_rescatada_desc');
    return t('subtitulo');
  };

  if (initialLoading || loadingRescate || loadingMascota) {
    return (
      <div className="nueva-mascota-page">
        <div className="loading-container">
          <LoadingSpinner text={t('cargando')} />
        </div>
      </div>
    );
  }

  if (!esFundacion) {
    return (
      <div className="nueva-mascota-page">
        <div className="error-container">
          <i className="fas fa-building"></i>
          <h2>{t('acceso_no_autorizado.titulo')}</h2>
          <p>{t('acceso_no_autorizado.mensaje')}</p>
          <button onClick={() => navigate('/')} className="btn-prev">
            {t('acceso_no_autorizado.volver_inicio')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nueva-mascota-page">
      <div className="mascota-form-container">
        <div className="form-header">
          <h1>
            <i className="fas fa-paw"></i> 
            {getTitle()}
          </h1>
          <p>{getSubtitle()}</p>
          
          {rescateInfo && !isEditMode && (
            <div className="rescate-info-banner">
              <i className="fas fa-ambulance"></i>
              <span>{t('registrando_mascota_rescatada_en')}: {rescateInfo.lugar_rescate}</span>
            </div>
          )}
          
          <div className="fundacion-info">
            <i className="fas fa-building"></i> {t('fundacion_label')}: <strong>{fundacionNombre}</strong>
          </div>
        </div>

        <MascotaFormSteps steps={steps} currentStep={currentStep} setCurrentStep={setCurrentStep} />

        <div className="form-content">
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <FormStep1 
                form={form} setForm={setForm} errors={errors}
                especies={especies} generos={generos} estados={estados} razasList={razasList}
              />
            )}
            {currentStep === 2 && (
              <FormStep2 form={form} setForm={setForm} errors={errors} />
            )}
            {currentStep === 3 && (
              <FormStep3 form={form} setForm={setForm} vacunasList={vacunasList} />
            )}
            {currentStep === 4 && (
              <FormStep4 form={form} setForm={setForm} errors={errors} getImageUrl={getImageUrl} />
            )}
            
            <FormActions 
              currentStep={currentStep} totalSteps={totalSteps}
              onPrev={prevStep} onNext={nextStep} onSubmit={handleSubmit} loading={loading}
              isEditMode={isEditMode}
            />
          </form>
        </div>
      </div>
    </div>
  );
};

export default NuevaMascota;