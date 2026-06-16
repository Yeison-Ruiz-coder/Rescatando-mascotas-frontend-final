// src/pages/veterinaria/perfil/VeterinariaProfile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useProfile } from '../../../hooks/useProfile';
import { veterinariaProfileService } from '../../../services/veterinariaProfileService';
import { ProfileContainer } from '../../../components/profile';
import {
  PersonalSection,
  LocationSection,
  SocialSection,
  SecuritySection,
  VeterinarySection,
  ServicesSection,
  ScheduleSection,
  LogoSection,
} from '../../../components/profile/sections';

const VeterinariaProfile = () => {
  const { 
    profile, 
    loading, 
    updateProfile, 
    updateAvatar, 
    deleteAvatar, 
    updateLocation, 
    updateSocialNetworks, 
    changePassword
  } = useProfile();
  
  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving] = useState(false);
  const [veterinariaData, setVeterinariaData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!profile || loaded) return;
    const loadData = async () => {
      try {
        const data = await veterinariaProfileService.getProfile();
        setVeterinariaData(data?.veterinaria || {});
        setLoaded(true);
      } catch (error) {
        console.error('Error loading veterinaria data:', error);
      }
    };
    loadData();
  }, [profile, loaded]);

  const sectionMap = {
    personal: PersonalSection,
    location: LocationSection,
    social: SocialSection,
    veterinary: VeterinarySection,
    services: ServicesSection,
    schedule: ScheduleSection,
    logo: LogoSection,
    security: SecuritySection,
  };

  const handleSave = useCallback(async (data) => {
    setSaving(true);
    try {
      const actions = {
        personal: () => updateProfile(data),
        location: () => updateLocation(data),
        social: () => updateSocialNetworks(data),
      };
      await actions[activeSection]?.();
    } finally {
      setSaving(false);
    }
  }, [activeSection, updateProfile, updateLocation, updateSocialNetworks]);

  const handleUpdateVeterinaria = useCallback(async (data) => {
    setSaving(true);
    try {
      const result = await veterinariaProfileService.updateGeneralInfo(data);
      setVeterinariaData(prev => ({ ...prev, ...result }));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUpdateServices = useCallback(async (data) => {
    setSaving(true);
    try {
      const result = await veterinariaProfileService.updateServices(data);
      setVeterinariaData(prev => ({ ...prev, ...result }));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUpdateSchedule = useCallback(async (schedule, extra) => {
    setSaving(true);
    try {
      const result = await veterinariaProfileService.updateSchedule(schedule, extra);
      setVeterinariaData(prev => ({ 
        ...prev, 
        horario_atencion: result.horario_atencion, 
        urgencias24h: result.urgencias24h 
      }));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUploadLogo = useCallback(async (file) => {
    setSaving(true);
    try {
      const result = await veterinariaProfileService.uploadLogo(file);
      setVeterinariaData(prev => ({ ...prev, logo: result.logo }));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleDeleteLogo = useCallback(async () => {
    setSaving(true);
    try {
      await veterinariaProfileService.deleteLogo();
      setVeterinariaData(prev => ({ ...prev, logo: null }));
    } finally {
      setSaving(false);
    }
  }, []);

  const sectionProps = {
    personal: { profile, onSave: handleSave, saving },
    location: { profile, onSave: handleSave, saving },
    social: { profile, onSave: handleSave, saving },
    veterinary: { veterinariaData, onUpdate: handleUpdateVeterinaria, saving },
    services: { veterinariaData, onUpdate: handleUpdateServices, saving },
    schedule: { 
      horario: veterinariaData?.horario_atencion, 
      extra: veterinariaData?.urgencias24h, 
      onUpdate: handleUpdateSchedule, 
      saving, 
      type: 'veterinaria' 
    },
    logo: { logo: veterinariaData?.logo, onUploadLogo: handleUploadLogo, onDeleteLogo: handleDeleteLogo, saving },
    security: { onChangePassword: changePassword, saving },
  };

  const SectionComponent = sectionMap[activeSection] || PersonalSection;

  return (
    <ProfileContainer
      profile={profile}
      loading={loading}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role="veterinaria"
      onAvatarUpload={updateAvatar}
      onAvatarDelete={deleteAvatar}
    >
      <SectionComponent {...sectionProps[activeSection]} />
    </ProfileContainer>
  );
};

export default VeterinariaProfile;