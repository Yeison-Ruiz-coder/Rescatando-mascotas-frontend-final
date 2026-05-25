// src/pages/fundacion/perfil/FundacionProfile.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProfile } from '../../../hooks/useProfile';
import { fundacionProfileService } from '../../../services/fundacionProfileService';
import ProfileLayout from '../../../components/profile/layout/ProfileLayout';
import {
  PersonalSection,
  LocationSection,
  SocialSection,
  SecuritySection,
  FoundationSection,
  NeedsSection,
  ScheduleSection,
  MediaSection,
} from '../../../components/profile/sections';
import './FundacionProfile.css';

const FundacionProfile = () => {
  const { t } = useTranslation();
  const { profile, loading, updateAvatar, deleteAvatar, updateProfile, updateLocation, updateSocialNetworks, changePassword, completionStatus } = useProfile();
  const [fundacionData, setFundacionData] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [loadingFundacion, setLoadingFundacion] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadData = async () => { setLoadingFundacion(true); try { const data = await fundacionProfileService.getProfile(); setFundacionData(data); } finally { setLoadingFundacion(false); } };
  useEffect(() => { loadData(); }, []);

  const handlePersonalSubmit = async (data) => { setSaving(true); try { await updateProfile(data); } finally { setSaving(false); } };
  const handleLocationSubmit = async (data) => { setSaving(true); try { await updateLocation(data); } finally { setSaving(false); } };
  const handleSocialSubmit = async (data) => { setSaving(true); try { await updateSocialNetworks(data); } finally { setSaving(false); } };
  const handleUpdateGeneral = async (data) => { setSaving(true); try { const result = await fundacionProfileService.updateGeneralInfo(data); setFundacionData(prev => ({ ...prev, fundacion: { ...prev.fundacion, ...result } })); } finally { setSaving(false); } };
  const handleUpdateNeeds = async (needs) => { setSaving(true); try { const result = await fundacionProfileService.updateNeeds(needs); setFundacionData(prev => ({ ...prev, fundacion: { ...prev.fundacion, necesidades_actuales: result.necesidades_actuales } })); } finally { setSaving(false); } };
  const handleUpdateSchedule = async (schedule, recibe) => { setSaving(true); try { const result = await fundacionProfileService.updateSchedule(schedule, recibe); setFundacionData(prev => ({ ...prev, fundacion: { ...prev.fundacion, horario_atencion: result.horario_atencion, recibe_voluntarios: result.recibe_voluntarios } })); } finally { setSaving(false); } };
  const handleUploadCover = async (file) => { setSaving(true); try { const result = await fundacionProfileService.uploadCoverImage(file); setFundacionData(prev => ({ ...prev, fundacion: { ...prev.fundacion, imagen_portada: result.imagen_portada } })); } finally { setSaving(false); } };
  const handleDeleteCover = async () => { setSaving(true); try { await fundacionProfileService.deleteCoverImage(); setFundacionData(prev => ({ ...prev, fundacion: { ...prev.fundacion, imagen_portada: null } })); } finally { setSaving(false); } };

  if (loading || loadingFundacion) return <div className="fundacion-loading"><div className="spinner"></div></div>;
  const fundacion = fundacionData?.fundacion || {};

  return (
    <ProfileLayout activeSection={activeSection} onSectionChange={setActiveSection} role="fundacion" profile={profile} onAvatarUpload={updateAvatar} onAvatarDelete={deleteAvatar} title={t('profile.foundationProfile')} description={t('profile.foundationProfileDescription')}>
      {activeSection === 'personal' && <PersonalSection profile={profile} onSubmit={handlePersonalSubmit} isLoading={saving} />}
      {activeSection === 'location' && <LocationSection profile={profile} onSubmit={handleLocationSubmit} isLoading={saving} />}
      {activeSection === 'social' && <SocialSection profile={profile} onSubmit={handleSocialSubmit} isLoading={saving} />}
      {activeSection === 'foundation' && <FoundationSection fundacionData={fundacion} onUpdate={handleUpdateGeneral} isLoading={saving} />}
      {activeSection === 'needs' && <NeedsSection necesidades={fundacion.necesidades_actuales} onUpdate={handleUpdateNeeds} isLoading={saving} />}
      {activeSection === 'schedule' && <ScheduleSection horario={fundacion.horario_atencion} recibeVoluntarios={fundacion.recibe_voluntarios} onUpdate={handleUpdateSchedule} isLoading={saving} type="fundacion" />}
      {activeSection === 'media' && <MediaSection type="fundacion" coverImage={fundacion.imagen_portada} onUploadCover={handleUploadCover} onDeleteCover={handleDeleteCover} isLoading={saving} />}
      {activeSection === 'security' && <SecuritySection onChangePassword={changePassword} isLoading={saving} />}
    </ProfileLayout>
  );
};

export default FundacionProfile;