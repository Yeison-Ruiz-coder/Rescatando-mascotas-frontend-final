// src/pages/fundacion/mascotas/CrearMascota.jsx
import React, { useMemo, useCallback } from 'react';
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

// ===== MAPA DE PASOS =====
const STEP_COMPONENTS = {
  1: FormStep1,
  2: FormStep2,
  3: FormStep3,
  4: FormStep4,
  5: FormStep5,
  6: FormStep6,
};

// ===== COMPONENTE PRINCIPAL =====
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

  // ===== MEMOIZACIÓN =====
  const adminName = useMemo(() => 
    user?.name || user?.nombre || t('fundacion', 'Fundación'),
    [user, t]
  );

  const adminAvatar = useMemo(() => user?.avatar || null, [user]);

  const titulo = useMemo(() => 
    isFromRescate 
      ? t('titulo_registrar_rescate', { defaultValue: 'Registrar Mascota Rescatada' })
      : t('titulo_nueva', { defaultValue: 'Registrar Nueva Mascota' }),
    [isFromRescate, t]
  );

  // ===== CALLBACKS =====
  const handleGoBack = useCallback(() => {
    if (currentStep > 1) {
      prevStep();
    } else if (window.confirm(t('confirmaciones.salir', { 
      defaultValue: '¿Estás seguro de que quieres salir? Los datos no guardados se perderán.' 
    }))) {
      navigate(-1);
    }
  }, [currentStep, prevStep, navigate, t]);

  // ===== RENDERIZADO CONDICIONAL =====
  if (initialLoading || loadingRescate) {
    return <LoadingState t={t} />;
  }

  if (!esFundacion) {
    return <UnauthorizedState navigate={navigate} t={t} />;
  }

  const CurrentStepComponent = STEP_COMPONENTS[currentStep] || FormStep1;

  return (
    <div className="nueva-mascota-page">
      <ProfileBannerSection
        name={adminName}
        avatar={adminAvatar}
        titulo={titulo}
        fundacionNombre={fundacionNombre}
        rescateInfo={rescateInfo}
        t={t}
      />

      <div className="nueva-mascota-content">
        <div className="bento-container">
          <BackButton onGoBack={handleGoBack} t={t} />

          <div className="mascota-form-container">
            <FormHeader
              titulo={titulo}
              fundacionNombre={fundacionNombre}
              rescateInfo={rescateInfo}
              t={t}
            />

            <MascotaFormSteps 
              steps={steps} 
              currentStep={currentStep} 
              setCurrentStep={setCurrentStep} 
            />

            <div className="form-content">
              <form onSubmit={handleSubmit}>
                <CurrentStepComponent
                  form={form}
                  setForm={setForm}
                  errors={errors}
                  especies={especies}
                  generos={generos}
                  estados={estados}
                  razasList={razasList}
                  vacunasList={vacunasList}
                  getImageUrl={getImageUrl}
                />

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

// ===== COMPONENTES SECUNDARIOS =====

const LoadingState = ({ t }) => (
  <div className="nueva-mascota-page">
    <LoadingSpinner text={t('cargando', { defaultValue: 'Cargando...' })} />
  </div>
);

const UnauthorizedState = ({ navigate, t }) => (
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

const ProfileBannerSection = ({ name, avatar, titulo, fundacionNombre, rescateInfo, t }) => (
  <div className="nueva-mascota-banner-wrapper">
    <ProfileBanner
      user={{
        nombre: name,
        avatar: avatar,
        titulo: titulo,
        solicitudes: 0,
        adopciones: 0,
        eventos: 0,
      }}
    />
  </div>
);

const BackButton = ({ onGoBack, t }) => (
  <div className="page-header-buttons">
    <button className="btn-back-page" onClick={onGoBack}>
      <i className="fas fa-arrow-left"></i>
      <span>{t('botones.volver', { defaultValue: 'Volver' })}</span>
    </button>
  </div>
);

const FormHeader = ({ titulo, fundacionNombre, rescateInfo, t }) => (
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
);

export default CrearMascota;