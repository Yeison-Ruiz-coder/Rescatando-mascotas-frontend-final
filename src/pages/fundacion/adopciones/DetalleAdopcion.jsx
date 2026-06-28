// src/pages/fundacion/adopciones/DetalleAdopcion.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import ProfileBanner from '../../../components/common/ProfileBanner/ProfileBanner';
import './DetalleAdopcion.css';

const DetalleAdopcion = () => {
  const { t } = useTranslation('fundacion');
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [adopcion, setAdopcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seguimientos, setSeguimientos] = useState([]);

  const fundacionName = user?.nombre || user?.name || t('fundacion');
  const fundacionAvatar = user?.avatar || user?.foto_perfil || null;

  useEffect(() => {
    fetchAdopcion();
  }, [id]);

  const fetchAdopcion = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/entity/adopciones/${id}`, {
        params: {
          fields: 'id,estado,created_at,fecha_adopcion,observaciones,mascota_id,adoptante_id',
          include: 'mascota,adoptante',
        }
      });
      setAdopcion(response.data.data);
      
      const segResponse = await api.get(`/entity/adopciones/${id}/seguimientos`, {
        params: {
          per_page: 10,
          fields: 'id,adopcion_id,tipo_seguimiento,fecha_seguimiento,estado_mascota,resultado,observaciones,proximo_seguimiento',
        }
      });
      setSeguimientos(segResponse.data.data?.data || []);
    } catch (err) {
      console.error('Error:', err);
      toast.error(t('error_cargar_detalle'));
      navigate('/fundacion/adopciones');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      en_proceso: { label: t('estado_en_proceso'), class: 'estado-en_proceso' },
      completada: { label: t('estado_completada'), class: 'estado-completada' },
    };
    return estados[estado] || estados.en_proceso;
  };

  if (loading) {
    return (
      <div className="da-container">
        <LoadingSpinner text={t('cargando')} />
      </div>
    );
  }

  if (!adopcion) {
    return (
      <div className="da-container">
        <div className="da-error">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>{t('no_encontrada')}</h3>
          <p>{t('adopcion_no_encontrada')}</p>
          <button onClick={() => navigate('/fundacion/adopciones')} className="da-btn-volver">
            {t('volver')}
          </button>
        </div>
      </div>
    );
  }

  const estado = getEstadoBadge(adopcion.estado);

  return (
    <div className="da-container">
      <ProfileBanner
        user={{
          nombre: fundacionName,
          avatar: fundacionAvatar,
          titulo: t('banner.titulo_detalle', {
            defaultValue: 'Detalle de adopción - {{nombre}}',
            nombre: adopcion.mascota?.nombre_mascota || t('mascota'),
          }),
          solicitudes: 1,
          adopciones: adopcion.estado === 'completada' ? 1 : 0,
          eventos: 0,
        }}
      />

      <div className="da-wrapper">
        <div className="da-header">
          <button onClick={() => navigate('/fundacion/adopciones')} className="da-btn-back">
            <i className="fas fa-arrow-left"></i> {t('volver')}
          </button>
          <h1>{t('detalle_adopcion')}</h1>
          <span className={`da-estado ${estado.class}`}>{estado.label}</span>
        </div>

        <div className="da-grid">
          <div className="da-card">
            <h3><i className="fas fa-paw"></i> {t('mascota')}</h3>
            <div className="da-info-item">
              <strong>{t('nombre')}:</strong>
              <span>{adopcion.mascota?.nombre_mascota || t('no_disponible')}</span>
            </div>
            <div className="da-info-item">
              <strong>{t('especie')}:</strong>
              <span>{adopcion.mascota?.especie || t('no_especificado')}</span>
            </div>
            <div className="da-info-item">
              <strong>{t('estado_mascota')}:</strong>
              <span>{adopcion.mascota?.estado || t('no_especificado')}</span>
            </div>
          </div>

          <div className="da-card">
            <h3><i className="fas fa-user"></i> {t('adoptante')}</h3>
            <div className="da-info-item">
              <strong>{t('nombre')}:</strong>
              <span>{adopcion.adoptante?.nombre || t('no_disponible')}</span>
            </div>
            <div className="da-info-item">
              <strong>{t('email')}:</strong>
              <span>{adopcion.adoptante?.email || t('no_especificado')}</span>
            </div>
            <div className="da-info-item">
              <strong>{t('telefono')}:</strong>
              <span>{adopcion.adoptante?.telefono || t('no_especificado')}</span>
            </div>
          </div>

          <div className="da-card da-card-full">
            <h3><i className="fas fa-calendar"></i> {t('informacion_adopcion')}</h3>
            <div className="da-info-item">
              <strong>{t('fecha_adopcion')}:</strong>
              <span>{formatDate(adopcion.fecha_adopcion)}</span>
            </div>
            <div className="da-info-item">
              <strong>{t('observaciones')}:</strong>
              <span>{adopcion.observaciones || t('sin_observaciones')}</span>
            </div>
          </div>
        </div>

        <div className="da-seguimientos">
          <div className="da-seguimientos-header">
            <h3><i className="fas fa-clipboard-check"></i> {t('seguimientos')}</h3>
            <Link to={`/fundacion/adopciones/seguimientos/crear/${id}`} className="da-btn-seguimiento">
              <i className="fas fa-plus"></i> {t('nuevo_seguimiento')}
            </Link>
          </div>

          {seguimientos.length === 0 ? (
            <div className="da-empty">
              <i className="fas fa-clipboard-check"></i>
              <p>{t('sin_seguimientos')}</p>
            </div>
          ) : (
            <div className="da-seguimientos-list">
              {seguimientos.map((seg) => (
                <div key={seg.id} className="da-seguimiento-item">
                  <div className="da-seguimiento-info">
                    <span className="da-seguimiento-fecha">
                      <i className="fas fa-calendar"></i> {formatDate(seg.fecha_seguimiento)}
                    </span>
                    <span className="da-seguimiento-tipo">
                      {seg.tipo_seguimiento === 'virtual' ? '📱' : 
                       seg.tipo_seguimiento === 'domiciliario' ? '🏠' : '📞'}
                      {t(`tipo_${seg.tipo_seguimiento}`)}
                    </span>
                    <span className={`da-seguimiento-estado ${seg.estado_mascota}`}>
                      {t(`estado_${seg.estado_mascota}`)}
                    </span>
                  </div>
                  <Link to={`/fundacion/adopciones/seguimientos/${seg.id}`} className="da-btn-ver">
                    <i className="fas fa-eye"></i>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleAdopcion;