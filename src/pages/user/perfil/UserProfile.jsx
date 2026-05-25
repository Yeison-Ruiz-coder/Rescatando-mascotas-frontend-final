// src/pages/user/perfil/UserProfile.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../../hooks/useProfile';
import ProfileLayout from '../../../components/profile/layout/ProfileLayout';
import {
  PersonalSection,
  LocationSection,
  SocialSection,
  SecuritySection,
  PreferencesSection,
  VerificationSection,
} from '../../../components/profile/sections';
import './UserProfile.css';

const UserProfile = () => {
  const { t } = useTranslation();
  const { profile, loading, updateProfile, updateAvatar, deleteAvatar, updateLocation, updateSocialNetworks, changePassword, sendPhoneVerification, confirmPhoneVerification, completionStatus } = useProfile();
  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving] = useState(false);

  const handlePersonalSubmit = async (data) => { setSaving(true); try { await updateProfile(data); } finally { setSaving(false); } };
  const handleLocationSubmit = async (data) => { setSaving(true); try { await updateLocation(data); } finally { setSaving(false); } };
  const handleSocialSubmit = async (data) => { setSaving(true); try { await updateSocialNetworks(data); } finally { setSaving(false); } };

  if (loading && !profile) return <div className="user-profile-loading"><div className="spinner"></div></div>;

  return (
    <ProfileLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role="user"
      profile={profile}
      onAvatarUpload={updateAvatar}
      onAvatarDelete={deleteAvatar}
      title={t('profile.userProfile')}
      description={t('profile.userProfileDescription')}
    >
      {activeSection === 'personal' && <PersonalSection profile={profile} onSubmit={handlePersonalSubmit} isLoading={saving} />}
      {activeSection === 'location' && <LocationSection profile={profile} onSubmit={handleLocationSubmit} isLoading={saving} />}
      {activeSection === 'social' && <SocialSection profile={profile} onSubmit={handleSocialSubmit} isLoading={saving} />}
      {activeSection === 'preferences' && <PreferencesSection profile={profile} onSubmit={updateProfile} isLoading={saving} />}
      {activeSection === 'verification' && <VerificationSection profile={profile} onSendCode={sendPhoneVerification} onVerify={confirmPhoneVerification} />}
      {activeSection === 'security' && <SecuritySection onChangePassword={changePassword} isLoading={saving} />}
    </ProfileLayout>
  );
};

export default UserProfile;