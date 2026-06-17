// src/pages/fundacion/perfil/FundacionProfile.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useProfile } from '../../../hooks/useProfile';
import { useFundacionProfile } from '../../../hooks/useFundacionProfile';
import { ProfileContainer } from '../../../components/profile';
import {
  PersonalSection,
  LocationSection,
  SocialSection,
  SecuritySection,
  FoundationSection,
  NeedsSection,
  ScheduleSection,
  CoverImageSection,
} from '../../../components/profile/sections';

const FundacionProfile = () => {
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
    fundacionData,
    loading: fundacionLoading,
    updateGeneralInfo,
    updateNeeds,
    updateSchedule,
    uploadCoverImage,
    deleteCoverImage,
  } = useFundacionProfile(profile);

  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving] = useState(false);

  const sectionMap = {
    personal: PersonalSection,
    location: LocationSection,
    social: SocialSection,
    foundation: FoundationSection,
    needs: NeedsSection,
    schedule: ScheduleSection,
    cover: CoverImageSection,
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
    foundation: { fundacionData, onUpdate: updateGeneralInfo, saving },
    needs: { necesidades: fundacionData?.necesidades_actuales, onUpdate: updateNeeds, saving },
    schedule: { 
      horario: fundacionData?.horario_atencion, 
      extra: fundacionData?.recibe_voluntarios, 
      onUpdate: updateSchedule, 
      saving, 
      type: 'fundacion' 
    },
    cover: { coverImage: fundacionData?.imagen_portada, onUploadCover: uploadCoverImage, onDeleteCover: deleteCoverImage, saving },
    security: { onChangePassword: changePassword, saving },
  }), [
    profile, 
    saving, 
    fundacionData, 
    handleSave, 
    updateGeneralInfo, 
    updateNeeds, 
    updateSchedule, 
    uploadCoverImage, 
    deleteCoverImage, 
    changePassword
  ]);

  const SectionComponent = sectionMap[activeSection] || PersonalSection;

  const loading = profileLoading || fundacionLoading;

  return (
    <ProfileContainer
      profile={profile}
      loading={loading}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role="fundacion"
      onAvatarUpload={updateAvatar}
      onAvatarDelete={deleteAvatar}
    >
      <SectionComponent {...sectionProps[activeSection]} />
    </ProfileContainer>
  );
};

export default FundacionProfile;