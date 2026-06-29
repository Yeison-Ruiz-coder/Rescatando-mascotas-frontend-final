// src/pages/admin/suscripciones/SuscripcionesShow.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import { ChevronLeft, User, Mail, Phone, PawPrint, Calendar, Clock, MessageSquare ,CreditCard, } from 'lucide-react';
import './SuscripcionesShow.css';

const AdminSuscripcionesShow = () => {
  const { t } = useTranslation(['admin', 'suscripciones']);
  const { id } = useParams();
  const { user } = useAuth();
  const [suscripcion, setSuscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const adminName = user?.name || user?.nombre || t('admin', 'Administrador');
  const adminAvatar = user?.avatar || null;

  useEffect(() => {
    cargarSuscripcion();
  }, [id]);

  const cargarSuscripcion = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await suscripcionService.getById(id);
      
      let data = response;
      if (response?.data) {
        data = response.data;
      }
      
      setSuscripcion(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || t('suscripciones:error_cargar_suscripcion'));
      toast.error(t('suscripciones:error_cargar_suscripcion'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return date;
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      activo: { class: 'estado-activo', label: t('suscripciones:estado_activo') },
      pendiente: { class: 'estado-pendiente', label: t('suscripciones:estado_pendiente') },
      pausado: { class: 'estado-pausado', label: t('suscripciones:estado_pausado') },
      inactivo: { class: 'estado-inactivo', label: t('suscripciones:estado_inactivo') },
      cancelado: { class: 'estado-cancelado', label: t('suscripciones:estado_cancelado') },
      finalizado: { class: 'estado-finalizado', label: t('suscripciones:estado_finalizado') }
    };
    return config[estado?.toLowerCase()] || config.pendiente;
  };

  if (loading) {
    return (
      <div className="ass-container">
        <div className="ass-loading">
          <div className="ass-spinner"></div>
          <p>{t('suscripciones:cargando_suscripcion')}</p>
        </div>
      </div>
    );
  }

  if (error || !suscripcion) {
    return (
      <div className="ass-container">
        <div className="bento-container">
          <div className="ass-error">
            <div className="ass-error-icon">⚠️</div>
            <h3>{t('suscripciones:error_carga')}</h3>
            <p>{error || t('suscripciones:suscripcion_no_encontrada')}</p>
            <Link to="/admin/suscripciones" className="ass-btn-back">
              <ChevronLeft size={18} />
              {t('suscripciones:volver')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const estado = getEstadoBadge(suscripcion.estado);

  return (
    <div className="ass-container">
      <div className="ass-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t('admin:banner_suscripcion_titulo', {
              defaultValue: 'Suscripción #{{id}}',
              id: suscripcion.id,
            }),
            solicitudes: 1,
            adopciones: suscripcion.estado?.toLowerCase() === 'activo' ? 1 : 0,
            eventos: 0,
          }}
        />
      </div>

      <div className="bento-container">
        <header className="ass-show-header">
          <Link to="/admin/suscripciones" className="ass-btn-back">
            <ChevronLeft size={18} />
            {t('suscripciones:volver')}
          </Link>
          <div className="ass-header-actions">
            <span className="ass-case-id">{t('suscripciones:id')}: #{suscripcion.id}</span>
            <span className={`ass-status-badge ${estado.class}`}>
              {estado.label}
            </span>
          </div>
        </header>

        <div className="ass-bento-grid">
          <div className="ass-card ass-main-info">
            <h3><CreditCard size={18} /> {t('suscripciones:informacion_suscripcion')}</h3>

            <div className="ass-info-item">
              <div className="ass-info-label">
                <CreditCard size={14} />
                <span>{t('suscripciones:monto_mensual')}</span>
              </div>
              <div className="ass-info-value">${parseFloat(suscripcion.monto_mensual || 0).toLocaleString()}</div>
            </div>

            <div className="ass-info-item">
              <div className="ass-info-label">
                <Calendar size={14} />
                <span>{t('suscripciones:frecuencia')}</span>
              </div>
              <div className="ass-info-value">
                {t(`suscripciones:frecuencia_${suscripcion.frecuencia}`) || suscripcion.frecuencia}
              </div>
            </div>

            <div className="ass-info-item">
              <div className="ass-info-label">
                <Calendar size={14} />
                <span>{t('suscripciones:fecha_inicio')}</span>
              </div>
              <div className="ass-info-value">{formatDate(suscripcion.fecha_inicio)}</div>
            </div>

            {suscripcion.fecha_fin && (
              <div className="ass-info-item">
                <div className="ass-info-label">
                  <Calendar size={14} />
                  <span>{t('suscripciones:fecha_fin')}</span>
                </div>
                <div className="ass-info-value">{formatDate(suscripcion.fecha_fin)}</div>
              </div>
            )}

            <div className="ass-info-item">
              <div className="ass-info-label">
                <Clock size={14} />
                <span>{t('suscripciones:creado')}</span>
              </div>
              <div className="ass-info-value">{formatDate(suscripcion.created_at)}</div>
            </div>

            <div className="ass-info-item">
              <div className="ass-info-label">
                <Clock size={14} />
                <span>{t('suscripciones:actualizado')}</span>
              </div>
              <div className="ass-info-value">{formatDate(suscripcion.updated_at)}</div>
            </div>
          </div>

          <div className="ass-card">
            <h3><User size={18} /> {t('suscripciones:informacion_donante')}</h3>

            {suscripcion.user || suscripcion.usuario ? (
              <>
                <div className="ass-info-item">
                  <div className="ass-info-label">
                    <User size={14} />
                    <span>{t('suscripciones:nombre')}</span>
                  </div>
                  <div className="ass-info-value">
                    {suscripcion.user?.name || suscripcion.user?.nombre || 
                     suscripcion.usuario?.name || suscripcion.usuario?.nombre || 'N/A'}
                  </div>
                </div>

                <div className="ass-info-item">
                  <div className="ass-info-label">
                    <Mail size={14} />
                    <span>{t('suscripciones:email')}</span>
                  </div>
                  <div className="ass-info-value">
                    {suscripcion.user?.email || suscripcion.usuario?.email || 'N/A'}
                  </div>
                </div>

                {suscripcion.user?.telefono || suscripcion.usuario?.telefono && (
                  <div className="ass-info-item">
                    <div className="ass-info-label">
                      <Phone size={14} />
                      <span>{t('suscripciones:telefono')}</span>
                    </div>
                    <div className="ass-info-value">
                      {suscripcion.user?.telefono || suscripcion.usuario?.telefono}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="ass-no-info">{t('suscripciones:donante_no_disponible')}</p>
            )}
          </div>

          <div className="ass-card">
            <h3><PawPrint size={18} /> {t('suscripciones:informacion_mascota')}</h3>

            {suscripcion.mascota ? (
              <>
                <div className="ass-info-item">
                  <div className="ass-info-label">
                    <PawPrint size={14} />
                    <span>{t('suscripciones:nombre')}</span>
                  </div>
                  <div className="ass-info-value">
                    {suscripcion.mascota.nombre_mascota || suscripcion.mascota.nombre || 'N/A'}
                  </div>
                </div>

                {suscripcion.mascota.especie && (
                  <div className="ass-info-item">
                    <div className="ass-info-label">
                      <PawPrint size={14} />
                      <span>{t('suscripciones:especie')}</span>
                    </div>
                    <div className="ass-info-value">{suscripcion.mascota.especie}</div>
                  </div>
                )}

                {suscripcion.mascota.raza && (
                  <div className="ass-info-item">
                    <div className="ass-info-label">
                      <PawPrint size={14} />
                      <span>{t('suscripciones:raza')}</span>
                    </div>
                    <div className="ass-info-value">{suscripcion.mascota.raza}</div>
                  </div>
                )}
              </>
            ) : (
              <p className="ass-no-info">{t('suscripciones:mascota_no_disponible')}</p>
            )}
          </div>

          {suscripcion.mensaje_apoyo && (
            <div className="ass-card ass-card-full">
              <h3><MessageSquare size={18} /> {t('suscripciones:mensaje_apoyo')}</h3>
              <p className="ass-mensaje-apoyo">"{suscripcion.mensaje_apoyo}"</p>
            </div>
          )}
        </div>

        <div className="ass-show-actions">
          <Link to="/admin/suscripciones" className="ass-btn-secondary">
            <ChevronLeft size={16} />
            {t('suscripciones:volver_lista')}
          </Link>
          <button className="ass-btn-print" onClick={() => window.print()}>
            🖨️ {t('suscripciones:imprimir')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSuscripcionesShow;