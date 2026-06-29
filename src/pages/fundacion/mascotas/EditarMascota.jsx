// src/pages/fundacion/mascotas/EditarMascota.jsx
import React, { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import useEditarMascota from '../../../hooks/useEditarMascota';
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
const EditarMascota = () => {
  const { t } = useTranslation('nuevaMascota');
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const {
    form,
    setForm,
    errors,
    loading,
    initialLoading,
    currentStep,
    esFundacion,
    especies,
    generos,
    estados,
    steps,
    totalSteps,
    razasList,
    vacunasList,
    galeriaExistente,
    setCurrentStep,
    nextStep,
    prevStep,
    handleSubmit,
    getImageUrl,
    handleRemoveExistingFoto,
    fundacionNombre,
  } = useEditarMascota(id);

  // ===== MEMOIZACIÓN =====
  const adminName = useMemo(() => 
    user?.name || user?.nombre || t('fundacion', 'Fundación'),
    [user, t]
  );

  const adminAvatar = useMemo(() => user?.avatar || null, [user]);

  // ===== CALLBACKS =====
  const handleGoBack = useCallback(() => {
    if (currentStep > 1) {
      prevStep();
    } else if (window.confirm(t('confirmaciones.salir', { 
      defaultValue: '¿Estás seguro de que quieres salir? Los datos no guardados se perderán.' 
    }))) {
      navigate('/fundacion/mascotas');
    }
  }, [currentStep, prevStep, navigate, t]);

  // ===== RENDERIZADO CONDICIONAL =====
  if (initialLoading) {
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
        t={t}
      />

      <div className="nueva-mascota-content">
        <div className="bento-container">
          <BackButton onGoBack={handleGoBack} t={t} />

          <div className="mascota-form-container">
            <EditFormHeader
              fundacionNombre={fundacionNombre}
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
                  galeriaExistente={galeriaExistente}
                  onRemoveExistingFoto={handleRemoveExistingFoto}
                />

                <FormActions
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onPrev={prevStep}
                  onNext={nextStep}
                  onSubmit={handleSubmit}
                  loading={loading}
                  isEditMode={true}
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

const ProfileBannerSection = ({ name, avatar, t }) => (
  <div className="nueva-mascota-banner-wrapper">
    <ProfileBanner
      user={{
        nombre: name,
        avatar: avatar,
        titulo: t('titulo_editar', { defaultValue: 'Editar Mascota' }),
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

const EditFormHeader = ({ fundacionNombre, t }) => (
  <div className="form-header">
    <h1>
      <i className="fas fa-edit"></i>
      {t('titulo_editar', { defaultValue: 'Editar Mascota' })}
    </h1>
    <p className="form-subtitle">
      {fundacionNombre 
        ? `${t('fundacion_label', { defaultValue: 'Fundación' })}: ${fundacionNombre}` 
        : t('subtitulo_editar', { defaultValue: 'Actualiza los datos de la mascota' })
      }
    </p>
  </div>
);

export default EditarMascota;