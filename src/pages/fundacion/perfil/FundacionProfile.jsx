// src/pages/fundacion/perfil/FundacionProfile.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useProfile } from '../../../hooks/useProfile';
import { ProfileContainer } from '../../../components/profile';
import { fundacionProfileService } from '../../../services/fundacionProfileService';
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
    changePassword,
    refreshUser
  } = useProfile();
  
  // ============================================
  // 🔥 STATE LOCAL PARA FUNDACIÓN
  // ============================================
  const [fundacionData, setFundacionData] = useState(null);
  const [fundacionLoading, setFundacionLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving] = useState(false);

  // ============================================
  // 🔥 CARGAR FUNDACIÓN DIRECTAMENTE
  // ============================================
  const loadFundacion = useCallback(async () => {
    if (profile?.tipo !== 'fundacion') {
      setFundacionLoading(false);
      return;
    }

    try {
      setFundacionLoading(true);
      console.log('🔄 Cargando fundación para usuario:', profile.id);
      
      const data = await fundacionProfileService.getProfile();
      console.log('✅ Fundación cargada:', data);
      
      setFundacionData(data);
    } catch (err) {
      console.error('❌ Error cargando fundación:', err);
      
      // 🔥 Si no existe, crear una por defecto
      if (err.response?.status === 404 || err.response?.status === 500) {
        try {
          console.log('🆕 Creando fundación por defecto...');
          const newData = await fundacionProfileService.updateGeneralInfo({
            Nombre_1: profile?.nombre || 'Mi Fundación',
            Email: profile?.email,
            Direccion: profile?.direccion || 'Por definir',
            ciudad: profile?.ciudad || null,
          });
          console.log('✅ Fundación creada:', newData);
          setFundacionData({ fundacion: newData });
        } catch (createErr) {
          console.error('❌ Error creando fundación:', createErr);
          // Si falla la creación, mostrar un objeto vacío para no romper la UI
          setFundacionData({ fundacion: {} });
        }
      } else {
        setFundacionData({ fundacion: {} });
      }
    } finally {
      setFundacionLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    loadFundacion();
  }, [loadFundacion]);

  // ============================================
  // 🔥 FUNCIONES DE ACTUALIZACIÓN
  // ============================================

  const handleSave = useCallback(async (data) => {
    setSaving(true);
    try {
      const actions = {
        personal: () => updateProfile(data),
        location: () => updateLocation(data),
        social: () => updateSocialNetworks(data),
      };
      await actions[activeSection]?.();
      
      // Refrescar usuario después de guardar
      await refreshUser();
    } catch (error) {
      console.error('Error guardando:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [activeSection, updateProfile, updateLocation, updateSocialNetworks, refreshUser]);

  const handleUpdateGeneralInfo = useCallback(async (data) => {
    setSaving(true);
    try {
      const updated = await fundacionProfileService.updateGeneralInfo(data);
      setFundacionData(prev => ({ 
        ...prev, 
        fundacion: { ...prev?.fundacion, ...updated } 
      }));
      console.log('✅ Información general actualizada:', updated);
    } catch (error) {
      console.error('❌ Error actualizando información general:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUpdateNeeds = useCallback(async (needs) => {
    setSaving(true);
    try {
      const updated = await fundacionProfileService.updateNeeds(needs);
      setFundacionData(prev => ({ 
        ...prev, 
        fundacion: { ...prev?.fundacion, necesidades_actuales: updated } 
      }));
      console.log('✅ Necesidades actualizadas:', updated);
    } catch (error) {
      console.error('❌ Error actualizando necesidades:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUpdateSchedule = useCallback(async (horario, recibeVoluntarios) => {
    setSaving(true);
    try {
      const updated = await fundacionProfileService.updateSchedule(horario, recibeVoluntarios);
      setFundacionData(prev => ({ 
        ...prev, 
        fundacion: { ...prev?.fundacion, ...updated } 
      }));
      console.log('✅ Horario actualizado:', updated);
    } catch (error) {
      console.error('❌ Error actualizando horario:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const handleUploadCover = useCallback(async (file) => {
    setSaving(true);
    try {
      const result = await fundacionProfileService.uploadCoverImage(file);
      setFundacionData(prev => ({ 
        ...prev, 
        fundacion: { ...prev?.fundacion, imagen_portada: result.imagen_portada } 
      }));
      console.log('✅ Portada subida:', result);
    } catch (error) {
      console.error('❌ Error subiendo portada:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  const handleDeleteCover = useCallback(async () => {
    setSaving(true);
    try {
      await fundacionProfileService.deleteCoverImage();
      setFundacionData(prev => ({ 
        ...prev, 
        fundacion: { ...prev?.fundacion, imagen_portada: null } 
      }));
      console.log('✅ Portada eliminada');
    } catch (error) {
      console.error('❌ Error eliminando portada:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  }, []);

  // ============================================
  // 🔥 PROPS PARA SECCIONES
  // ============================================

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

  const sectionProps = useMemo(() => ({
    personal: { profile, onSave: handleSave, saving },
    location: { profile, onSave: handleSave, saving },
    social: { profile, onSave: handleSave, saving },
    foundation: { 
      fundacionData: fundacionData?.fundacion || {}, 
      onUpdate: handleUpdateGeneralInfo, 
      saving 
    },
    needs: { 
      necesidades: fundacionData?.fundacion?.necesidades_actuales || [], 
      onUpdate: handleUpdateNeeds, 
      saving 
    },
    schedule: { 
      horario: fundacionData?.fundacion?.horario_atencion || '', 
      extra: fundacionData?.fundacion?.recibe_voluntarios || false, 
      onUpdate: handleUpdateSchedule, 
      saving, 
      type: 'fundacion' 
    },
    cover: { 
      coverImage: fundacionData?.fundacion?.imagen_portada || null, 
      onUploadCover: handleUploadCover, 
      onDeleteCover: handleDeleteCover, 
      saving 
    },
    security: { onChangePassword: changePassword, saving },
  }), [
    profile, 
    saving, 
    fundacionData, 
    handleSave, 
    handleUpdateGeneralInfo, 
    handleUpdateNeeds, 
    handleUpdateSchedule, 
    handleUploadCover, 
    handleDeleteCover, 
    changePassword
  ]);

  const SectionComponent = sectionMap[activeSection] || PersonalSection;
  const loading = profileLoading || fundacionLoading;

  // ============================================
  // 🔥 RENDER
  // ============================================

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