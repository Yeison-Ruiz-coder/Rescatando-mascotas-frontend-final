// src/pages/veterinaria/perfil/VeterinariaProfile.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useProfile } from '../../../hooks/useProfile';
import { useVeterinariaProfile } from '../../../hooks/useVeterinariaProfile';
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
    loading: profileLoading, 
    updateProfile, 
    updateAvatar, 
    deleteAvatar, 
    updateLocation, 
    updateSocialNetworks, 
    changePassword
  } = useProfile();
  
  const {
    veterinariaData,
    loading: veterinariaLoading,
    updateGeneralInfo,
    updateServices,
    updateSchedule,
    uploadLogo,
    deleteLogo,
  } = useVeterinariaProfile(profile);

  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving] = useState(false);

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

  const sectionProps = useMemo(() => ({
    personal: { profile, onSave: handleSave, saving },
    location: { profile, onSave: handleSave, saving },
    social: { profile, onSave: handleSave, saving },
    veterinary: { veterinariaData, onUpdate: updateGeneralInfo, saving },
    services: { veterinariaData, onUpdate: updateServices, saving },
    schedule: { 
      horario: veterinariaData?.horario_atencion, 
      extra: veterinariaData?.urgencias24h, 
      onUpdate: updateSchedule, 
      saving, 
      type: 'veterinaria' 
    },
    logo: { logo: veterinariaData?.logo, onUploadLogo: uploadLogo, onDeleteLogo: deleteLogo, saving },
    security: { onChangePassword: changePassword, saving },
  }), [
    profile, 
    saving, 
    veterinariaData, 
    handleSave, 
    updateGeneralInfo, 
    updateServices, 
    updateSchedule, 
    uploadLogo, 
    deleteLogo, 
    changePassword
  ]);

  const SectionComponent = sectionMap[activeSection] || PersonalSection;

  const loading = profileLoading || veterinariaLoading;

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