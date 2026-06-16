// src/pages/fundacion/perfil/FundacionProfile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useProfile } from '../../../hooks/useProfile';
import { fundacionProfileService } from '../../../services/fundacionProfileService';
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
  const [fundacionData, setFundacionData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!profile || loaded) return;
    const loadData = async () => {
      try {
        const data = await fundacionProfileService.getProfile();
        setFundacionData(data?.fundacion || {});
        setLoaded(true);
      } catch (error) {
        console.error('Error loading fundacion data:', error);
      }
    };
    loadData();
  }, [profile, loaded]);

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

  const handleUpdateFundacion = useCallback(async (data) => {
    setSaving(true);
    try {
      const result = await fundacionProfileService.updateGeneralInfo(data);
      setFundacionData(prev => ({ ...prev, ...result }));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUpdateNeeds = useCallback(async (needs) => {
    setSaving(true);
    try {
      const result = await fundacionProfileService.updateNeeds(needs);
      setFundacionData(prev => ({ ...prev, necesidades_actuales: result.necesidades_actuales }));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUpdateSchedule = useCallback(async (schedule, extra) => {
    setSaving(true);
    try {
      const result = await fundacionProfileService.updateSchedule(schedule, extra);
      setFundacionData(prev => ({ 
        ...prev, 
        horario_atencion: result.horario_atencion, 
        recibe_voluntarios: result.recibe_voluntarios 
      }));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUploadCover = useCallback(async (file) => {
    setSaving(true);
    try {
      const result = await fundacionProfileService.uploadCoverImage(file);
      setFundacionData(prev => ({ ...prev, imagen_portada: result.imagen_portada }));
    } finally {
      setSaving(false);
    }
  }, []);

  const handleDeleteCover = useCallback(async () => {
    setSaving(true);
    try {
      await fundacionProfileService.deleteCoverImage();
      setFundacionData(prev => ({ ...prev, imagen_portada: null }));
    } finally {
      setSaving(false);
    }
  }, []);

  const sectionProps = {
    personal: { profile, onSave: handleSave, saving },
    location: { profile, onSave: handleSave, saving },
    social: { profile, onSave: handleSave, saving },
    foundation: { fundacionData, onUpdate: handleUpdateFundacion, saving },
    needs: { necesidades: fundacionData?.necesidades_actuales, onUpdate: handleUpdateNeeds, saving },
    schedule: { 
      horario: fundacionData?.horario_atencion, 
      extra: fundacionData?.recibe_voluntarios, 
      onUpdate: handleUpdateSchedule, 
      saving, 
      type: 'fundacion' 
    },
    cover: { coverImage: fundacionData?.imagen_portada, onUploadCover: handleUploadCover, onDeleteCover: handleDeleteCover, saving },
    security: { onChangePassword: changePassword, saving },
  };

  const SectionComponent = sectionMap[activeSection] || PersonalSection;

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