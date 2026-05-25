// src/pages/admin/perfil/AdminProfile.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../../hooks/useProfile';
import ProfileLayout from '../../../components/profile/layout/ProfileLayout';
import {
  PersonalSection,
  LocationSection,
  SocialSection,
  SecuritySection,
} from '../../../components/profile/sections';
import './AdminProfile.css';

const AdminProfile = () => {
  const { t } = useTranslation();
  const { profile, loading, updateProfile, updateAvatar, deleteAvatar, updateLocation, updateSocialNetworks, changePassword } = useProfile();
  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving] = useState(false);

  const handlePersonalSubmit = async (data) => { setSaving(true); try { await updateProfile(data); } finally { setSaving(false); } };
  const handleLocationSubmit = async (data) => { setSaving(true); try { await updateLocation(data); } finally { setSaving(false); } };
  const handleSocialSubmit = async (data) => { setSaving(true); try { await updateSocialNetworks(data); } finally { setSaving(false); } };

  if (loading && !profile) return <div className="admin-profile-loading"><div className="spinner"></div></div>;

  return (
    <ProfileLayout
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      role="admin"
      profile={profile}
      onAvatarUpload={updateAvatar}
      onAvatarDelete={deleteAvatar}
      title={t('profile.adminProfile')}
      description={t('profile.adminProfileDescription')}
    >
      {activeSection === 'personal' && <PersonalSection profile={profile} onSubmit={handlePersonalSubmit} isLoading={saving} />}
      {activeSection === 'location' && <LocationSection profile={profile} onSubmit={handleLocationSubmit} isLoading={saving} />}
      {activeSection === 'social' && <SocialSection profile={profile} onSubmit={handleSocialSubmit} isLoading={saving} />}
      {activeSection === 'security' && <SecuritySection onChangePassword={changePassword} isLoading={saving} />}
    </ProfileLayout>
  );
};

export default AdminProfile;