// src/pages/veterinaria/perfil/VeterinariaProfile.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../../hooks/useProfile';
import { veterinariaProfileService } from '../../../services/veterinariaProfileService';
import ProfileLayout from '../../../components/profile/layout/ProfileLayout';
import {
  PersonalSection,
  LocationSection,
  SocialSection,
  SecuritySection,
  VeterinarySection,
  ServicesSection,
  ScheduleSection,
  MediaSection,
} from '../../../components/profile/sections';
import './VeterinariaProfile.css';

const VeterinariaProfile = () => {
  const { t } = useTranslation();
  const { 
    profile, 
    loading, 
    updateAvatar, 
    deleteAvatar, 
    updateProfile,
    updateLocation,
    updateSocialNetworks,
    changePassword,
    completionStatus
  } = useProfile();
  
  const [veterinariaData, setVeterinariaData] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [loadingVet, setLoadingVet] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadVeterinariaProfile = async () => {
    setLoadingVet(true);
    try {
      const data = await veterinariaProfileService.getProfile();
      setVeterinariaData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingVet(false);
    }
  };

  useEffect(() => {
    loadVeterinariaProfile();
  }, []);

  const handlePersonalInfoSubmit = async (data) => {
    setSaving(true);
    try {
      await updateProfile(data);
    } finally {
      setSaving(false);
    }
  };

  const handleLocationSubmit = async (data) => {
    setSaving(true);
    try {
      await updateLocation(data);
    } finally {
      setSaving(false);
    }
  };

  const handleSocialSubmit = async (data) => {
    setSaving(true);
    try {
      await updateSocialNetworks(data);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGeneral = async (data) => {
    setSaving(true);
    try {
      const result = await veterinariaProfileService.updateGeneralInfo(data);
      setVeterinariaData(prev => ({ 
        ...prev, 
        veterinaria: { ...prev.veterinaria, ...result } 
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateServices = async (data) => {
    setSaving(true);
    try {
      const result = await veterinariaProfileService.updateServices(data);
      setVeterinariaData(prev => ({ 
        ...prev, 
        veterinaria: { ...prev.veterinaria, ...result } 
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSchedule = async (schedule, urgencias) => {
    setSaving(true);
    try {
      const result = await veterinariaProfileService.updateSchedule(schedule, urgencias);
      setVeterinariaData(prev => ({ 
        ...prev, 
        veterinaria: { 
          ...prev.veterinaria, 
          horario_atencion: result.horario_atencion,
          urgencias_24h: result.urgencias_24h
        } 
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleUploadLogo = async (file) => {
    setSaving(true);
    try {
      const result = await veterinariaProfileService.uploadLogo(file);
      setVeterinariaData(prev => ({ 
        ...prev, 
        veterinaria: { ...prev.veterinaria, logo: result.logo } 
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLogo = async () => {
    setSaving(true);
    try {
      await veterinariaProfileService.deleteLogo();
      setVeterinariaData(prev => ({ 
        ...prev, 
        veterinaria: { ...prev.veterinaria, logo: null } 
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleAddGalleryPhotos = async (files) => {
    setSaving(true);
    try {
      const result = await veterinariaProfileService.addGalleryPhotos(files);
      setVeterinariaData(prev => ({ 
        ...prev, 
        veterinaria: { ...prev.veterinaria, galeria_fotos: result.galeria_fotos } 
      }));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveGalleryPhoto = async (photoUrl) => {
    setSaving(true);
    try {
      const result = await veterinariaProfileService.removeGalleryPhoto(photoUrl);
      setVeterinariaData(prev => ({ 
        ...prev, 
        veterinaria: { ...prev.veterinaria, galeria_fotos: result.galeria_fotos } 
      }));
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingVet) {
    return (
      <div className="veterinaria-profile-page">
        <div className="container">
          <div className="skeleton" style={{ height: '400px', borderRadius: '32px' }}></div>
        </div>
      </div>
    );
  }

  const veterinaria = veterinariaData?.veterinaria || {};

  return (
    <ProfileLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role="veterinaria"
      profile={profile}
      onAvatarUpload={updateAvatar}
      onAvatarDelete={deleteAvatar}
      completionStatus={completionStatus}
      title={t('profile.veterinaryProfile')}
      description={t('profile.veterinaryProfileDescription')}
    >
      {/* Sección: Información Personal */}
      {activeSection === 'personal' && (
        <PersonalSection
          profile={profile}
          onSubmit={handlePersonalInfoSubmit}
          isLoading={saving}
        />
      )}

      {/* Sección: Ubicación */}
      {activeSection === 'location' && (
        <LocationSection
          profile={profile}
          onSubmit={handleLocationSubmit}
          isLoading={saving}
        />
      )}

      {/* Sección: Redes Sociales */}
      {activeSection === 'social' && (
        <SocialSection
          profile={profile}
          onSubmit={handleSocialSubmit}
          isLoading={saving}
        />
      )}

      {/* Sección: Datos de Veterinaria */}
      {activeSection === 'veterinary' && (
        <VeterinarySection
          veterinariaData={veterinaria}
          onUpdate={handleUpdateGeneral}
          isLoading={saving}
        />
      )}

      {/* Sección: Servicios */}
      {activeSection === 'services' && (
        <ServicesSection
          veterinariaData={veterinaria}
          onUpdate={handleUpdateServices}
          isLoading={saving}
        />
      )}

      {/* Sección: Horarios */}
      {activeSection === 'schedule' && (
        <ScheduleSection
          horario={veterinaria.horario_atencion}
          urgencias24h={veterinaria.urgencias_24h}
          onUpdate={handleUpdateSchedule}
          isLoading={saving}
          type="veterinaria"
        />
      )}

      {/* Sección: Multimedia */}
      {activeSection === 'media' && (
        <MediaSection
          type="veterinaria"
          logo={veterinaria.logo}
          gallery={veterinaria.galeria_fotos || []}
          onUploadLogo={handleUploadLogo}
          onDeleteLogo={handleDeleteLogo}
          onAddGalleryPhotos={handleAddGalleryPhotos}
          onRemoveGalleryPhoto={handleRemoveGalleryPhoto}
          isLoading={saving}
        />
      )}

      {/* Sección: Seguridad */}
      {activeSection === 'security' && (
        <SecuritySection
          onChangePassword={changePassword}
          isLoading={saving}
        />
      )}
    </ProfileLayout>
  );
};

export default VeterinariaProfile;