// src/pages/admin/catalogos/razas/RazaForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import ProfileBanner from '../../../../components/common/ProfileBanner/ProfileBanner';
import CustomSelect from '../../../../components/common/CustomSelect/CustomSelect';
import './Razas.css';

const RazaForm = () => {
  const { t } = useTranslation(['admin', 'catalogos']);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    nombre_raza: '',
    especie: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  const especieOptions = [
    { value: '', label: t('catalogos:seleccionar_especie') },
    { value: 'Perro', label: 'Perro' },
    { value: 'Gato', label: 'Gato' },
    { value: 'Conejo', label: 'Conejo' },
    { value: 'Ave', label: 'Ave' },
    { value: 'Otro', label: 'Otro' },
  ];

  // ============================================
  // CARGAR DATOS PARA EDICIÓN
  // ============================================
  useEffect(() => {
    if (isEdit) {
      const cargarRaza = async () => {
        try {
          const response = await api.get(`/admin/razas/${id}`);
          if (response.data.success) {
            const data = response.data.data.raza || response.data.data;
            setForm({
              nombre_raza: data.nombre_raza || '',
              especie: data.especie || '',
            });
          } else {
            toast.error(t('error_carga'));
            navigate('/admin/catalogos/razas');
          }
        } catch (err) {
          console.error('Error:', err);
          toast.error(err.response?.data?.message || t('error_carga'));
          navigate('/admin/catalogos/razas');
        } finally {
          setInitialLoading(false);
        }
      };
      cargarRaza();
    }
  }, [id, isEdit, navigate, t]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCustomSelectChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const data = {
        nombre_raza: form.nombre_raza.trim(),
        especie: form.especie || null,
      };

      let response;
      if (isEdit) {
        response = await api.put(`/admin/razas/${id}`, data);
      } else {
        response = await api.post('/admin/razas', data);
      }

      if (response.data.success) {
        toast.success(
          isEdit
            ? t('catalogos:raza_actualizada')
            : t('catalogos:raza_creada')
        );
        navigate('/admin/catalogos/razas');
      } else {
        if (response.data.errors) {
          setErrors(response.data.errors);
        } else {
          toast.error(response.data.message || t('error_guardar'));
        }
      }
    } catch (err) {
      console.error('Error:', err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error(err.response?.data?.message || t('error_guardar'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm(t('catalogos:confirmar_cancelar'))) {
      navigate('/admin/catalogos/razas');
    }
  };

  // ============================================
  // RENDER
  // ============================================
  if (initialLoading) {
    return (
      <div className="admin-catalogos-page-wrapper">
        <div className="admin-catalogos-loading-container">
          <div className="admin-catalogos-spinner"></div>
          <p>{t('catalogos:cargando')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-catalogos-page-wrapper">
      {/* ===== BANNER ===== */}
      <div className="admin-catalogos-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: isEdit
              ? t('catalogos:editar_raza')
              : t('catalogos:nueva_raza'),
            solicitudes: 0,
            adopciones: 0,
            eventos: 0,
          }}
        />
      </div>

      {/* ===== CONTENIDO ===== */}
      <div className="admin-catalogos-content-wrapper">
        <div className="admin-catalogos-bento-container">
          <div className="admin-catalogos-form-container">
            {/* HEADER */}
            <div className="admin-catalogos-form-header">
              <button onClick={handleCancel} className="admin-catalogos-btn-back">
                <i className="fas fa-arrow-left"></i>
                {t('catalogos:volver')}
              </button>
              <h2>
                {isEdit
                  ? t('catalogos:editar_raza')
                  : t('catalogos:nueva_raza')}
              </h2>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="admin-catalogos-form">
              <div className="admin-catalogos-form-group">
                <label>
                  {t('catalogos:nombre_raza')} <span className="admin-catalogos-required">*</span>
                </label>
                <input
                  type="text"
                  name="nombre_raza"
                  value={form.nombre_raza}
                  onChange={handleChange}
                  placeholder={t('catalogos:nombre_raza_placeholder')}
                  className={errors.nombre_raza ? 'admin-catalogos-input-error' : ''}
                  maxLength="255"
                  required
                />
                {errors.nombre_raza && (
                  <span className="admin-catalogos-error-message">{errors.nombre_raza}</span>
                )}
              </div>

              <div className="admin-catalogos-form-group">
                <label>{t('catalogos:especie')}</label>
                <CustomSelect
                  options={especieOptions}
                  value={form.especie}
                  onChange={(e) => handleCustomSelectChange('especie', e.target.value)}
                  name="especie"
                  placeholder={t('catalogos:seleccionar_especie')}
                />
                {errors.especie && (
                  <span className="admin-catalogos-error-message">{errors.especie}</span>
                )}
                <small className="admin-catalogos-form-hint">
                  {t('catalogos:especie_hint')}
                </small>
              </div>

              <div className="admin-catalogos-form-actions">
                <button type="button" onClick={handleCancel} className="admin-catalogos-btn-cancel-form">
                  <i className="fas fa-times"></i>
                  {t('catalogos:cancelar')}
                </button>
                <button type="submit" className="admin-catalogos-btn-submit" disabled={loading}>
                  <i className="fas fa-save"></i>
                  {loading
                    ? t('catalogos:guardando')
                    : isEdit
                      ? t('catalogos:actualizar')
                      : t('catalogos:guardar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazaForm;