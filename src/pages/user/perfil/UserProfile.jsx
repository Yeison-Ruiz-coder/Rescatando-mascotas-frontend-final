// src/pages/user/perfil/UserProfile.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { useProfile } from '../../../hooks/useProfile';
import { ProfileContainer } from '../../../components/profile';
import {
  PersonalSection,
  LocationSection,
  SocialSection,
  SecuritySection,
  VerificationSection,
  PreferencesSection,
} from '../../../components/profile/sections';

const UserProfile = () => {
  const { 
    profile, 
    loading, 
    updateProfile, 
    updateAvatar, 
    deleteAvatar, 
    updateLocation, 
    updateSocialNetworks, 
    changePassword,
    sendPhoneVerification,
    confirmPhoneVerification
  } = useProfile();
  
  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving] = useState(false);

  const sectionMap = {
    personal: PersonalSection,
    location: LocationSection,
    social: SocialSection,
    verification: VerificationSection,
    preferences: PreferencesSection,
    security: SecuritySection,
  };

  const handleSave = useCallback(async (data) => {
    setSaving(true);
    try {
      const actions = {
        personal: () => updateProfile(data),
        location: () => updateLocation(data),
        social: () => updateSocialNetworks(data),
        preferences: () => updateProfile(data),
      };
      await actions[activeSection]?.();
    } finally {
      setSaving(false);
    }
  }, [activeSection, updateProfile, updateLocation, updateSocialNetworks]);

  // ✅ OPTIMIZADO: sectionProps con useMemo
  const sectionProps = useMemo(() => ({
    personal: { profile, onSave: handleSave, saving },
    location: { profile, onSave: handleSave, saving },
    social: { profile, onSave: handleSave, saving },
    verification: { profile, onSendPhoneCode: sendPhoneVerification, onVerifyPhone: confirmPhoneVerification },
    preferences: { profile, onSave: handleSave, saving },
    security: { onChangePassword: changePassword, saving },
  }), [
    profile, 
    saving, 
    handleSave, 
    sendPhoneVerification, 
    confirmPhoneVerification, 
    changePassword
  ]);

  const SectionComponent = sectionMap[activeSection] || PersonalSection;

  return (
    <ProfileContainer
      profile={profile}
      loading={loading}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role="user"
      onAvatarUpload={updateAvatar}
      onAvatarDelete={deleteAvatar}
    >
      <SectionComponent {...sectionProps[activeSection]} />
    </ProfileContainer>
  );
};

export default UserProfile;