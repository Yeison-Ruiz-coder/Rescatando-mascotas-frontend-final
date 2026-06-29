// src/pages/admin/catalogos/vacunas/VacunaForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../../services/api';
import ProfileBanner from '../../../../components/common/ProfileBanner/ProfileBanner';
import CustomSelect from '../../../../components/common/CustomSelect/CustomSelect';
import '../razas/Razas.css';

const VacunaForm = () => {
  const { t } = useTranslation(['admin', 'catalogos']);
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    nombre_vacuna: '',
    frecuencia_dias: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  const frecuenciaOptions = [
    { value: '', label: t('catalogos:seleccionar_frecuencia') },
    { value: '30', label: t('catalogos:mensual') },
    { value: '90', label: t('catalogos:trimestral') },
    { value: '180', label: t('catalogos:semestral') },
    { value: '365', label: t('catalogos:anual') },
  ];

  // ============================================
  // CARGAR DATOS PARA EDICIÓN
  // ============================================
  useEffect(() => {
    if (isEdit) {
      const cargarVacuna = async () => {
        try {
          const response = await api.get(`/admin/tipos-vacunas/${id}`);
          if (response.data.success) {
            const data = response.data.data.tipo_vacuna || response.data.data;
            setForm({
              nombre_vacuna: data.nombre_vacuna || '',
              frecuencia_dias: data.frecuencia_dias || '',
            });
          } else {
            toast.error(t('error_carga'));
            navigate('/admin/catalogos/vacunas');
          }
        } catch (err) {
          console.error('Error:', err);
          toast.error(err.response?.data?.message || t('error_carga'));
          navigate('/admin/catalogos/vacunas');
        } finally {
          setInitialLoading(false);
        }
      };
      cargarVacuna();
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
        nombre_vacuna: form.nombre_vacuna.trim(),
        frecuencia_dias: form.frecuencia_dias ? parseInt(form.frecuencia_dias) : null,
      };

      let response;
      if (isEdit) {
        response = await api.put(`/admin/tipos-vacunas/${id}`, data);
      } else {
        response = await api.post('/admin/tipos-vacunas', data);
      }

      if (response.data.success) {
        toast.success(
          isEdit
            ? t('catalogos:vacuna_actualizada')
            : t('catalogos:vacuna_creada')
        );
        navigate('/admin/catalogos/vacunas');
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
      navigate('/admin/catalogos/vacunas');
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
              ? t('catalogos:editar_vacuna')
              : t('catalogos:nueva_vacuna'),
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
                  ? t('catalogos:editar_vacuna')
                  : t('catalogos:nueva_vacuna')}
              </h2>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="admin-catalogos-form">
              <div className="admin-catalogos-form-group">
                <label>
                  {t('catalogos:nombre_vacuna')} <span className="admin-catalogos-required">*</span>
                </label>
                <input
                  type="text"
                  name="nombre_vacuna"
                  value={form.nombre_vacuna}
                  onChange={handleChange}
                  placeholder={t('catalogos:nombre_vacuna_placeholder')}
                  className={errors.nombre_vacuna ? 'admin-catalogos-input-error' : ''}
                  maxLength="255"
                  required
                />
                {errors.nombre_vacuna && (
                  <span className="admin-catalogos-error-message">{errors.nombre_vacuna}</span>
                )}
              </div>

              <div className="admin-catalogos-form-group">
                <label>{t('catalogos:frecuencia')}</label>
                <CustomSelect
                  options={frecuenciaOptions}
                  value={form.frecuencia_dias}
                  onChange={(e) => handleCustomSelectChange('frecuencia_dias', e.target.value)}
                  name="frecuencia_dias"
                  placeholder={t('catalogos:seleccionar_frecuencia')}
                />
                {errors.frecuencia_dias && (
                  <span className="admin-catalogos-error-message">{errors.frecuencia_dias}</span>
                )}
                <small className="admin-catalogos-form-hint">
                  {t('catalogos:frecuencia_hint')}
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

export default VacunaForm;