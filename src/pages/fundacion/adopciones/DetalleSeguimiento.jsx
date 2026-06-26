// src/pages/fundacion/adopciones/DetalleSeguimiento.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../../services/api';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import './DetalleSeguimiento.css';

const DetalleSeguimiento = () => {
  const { t } = useTranslation('fundacion');
  const navigate = useNavigate();
  const { id } = useParams();
  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fotos, setFotos] = useState([]);

  useEffect(() => {
    fetchSeguimiento();
  }, [id]);

  const fetchSeguimiento = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/entity/adopciones/seguimientos/${id}`);
      const data = response.data.data;
      setSeguimiento(data);
      
      if (data.fotos_adicionales) {
        const fotosData = typeof data.fotos_adicionales === 'string' 
          ? JSON.parse(data.fotos_adicionales) 
          : data.fotos_adicionales;
        setFotos(Array.isArray(fotosData) ? fotosData : []);
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error(t('error_cargar_seguimiento'));
      navigate('/fundacion/adopciones/seguimientos');
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
      excelente: { label: t('estado_excelente'), class: 'estado-excelente' },
      bueno: { label: t('estado_bueno'), class: 'estado-bueno' },
      regular: { label: t('estado_regular'), class: 'estado-regular' },
      preocupante: { label: t('estado_preocupante'), class: 'estado-preocupante' },
    };
    return estados[estado] || estados.bueno;
  };

  const getResultadoBadge = (resultado) => {
    const resultados = {
      satisfactorio: { label: t('resultado_satisfactorio'), class: 'resultado-satisfactorio' },
      observaciones: { label: t('resultado_observaciones'), class: 'resultado-observaciones' },
      incumplimiento: { label: t('resultado_incumplimiento'), class: 'resultado-incumplimiento' },
      reingreso: { label: t('resultado_reingreso'), class: 'resultado-reingreso' },
    };
    return resultados[resultado] || resultados.satisfactorio;
  };

  if (loading) {
    return (
      <div className="ds-container">
        <LoadingSpinner text={t('cargando')} />
      </div>
    );
  }

  if (!seguimiento) {
    return (
      <div className="ds-container">
        <div className="ds-error">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>{t('no_encontrado')}</h3>
          <p>{t('seguimiento_no_encontrado')}</p>
          <button onClick={() => navigate('/fundacion/adopciones/seguimientos')} className="ds-btn-volver">
            {t('volver')}
          </button>
        </div>
      </div>
    );
  }

  const estado = getEstadoBadge(seguimiento.estado_mascota);
  const resultado = getResultadoBadge(seguimiento.resultado);

  return (
    <div className="ds-container">
      <div className="ds-wrapper">
        {/* Header */}
        <div className="ds-header">
          <button onClick={() => navigate('/fundacion/adopciones/seguimientos')} className="ds-btn-back">
            <i className="fas fa-arrow-left"></i> {t('volver')}
          </button>
          <h1>{t('detalle_seguimiento')}</h1>
          <div className="ds-header-badges">
            <span className={`ds-estado ${estado.class}`}>{estado.label}</span>
            <span className={`ds-resultado ${resultado.class}`}>{resultado.label}</span>
          </div>
        </div>

        {/* Información principal */}
        <div className="ds-grid">
          <div className="ds-card">
            <h3><i className="fas fa-info-circle"></i> {t('informacion_general')}</h3>
            <div className="ds-info-item">
              <strong>{t('tipo_seguimiento')}:</strong>
              <span>
                {seguimiento.tipo_seguimiento === 'virtual' ? '📱' : 
                 seguimiento.tipo_seguimiento === 'domiciliario' ? '🏠' : '📞'}
                {t(`tipo_${seguimiento.tipo_seguimiento}`)}
              </span>
            </div>
            <div className="ds-info-item">
              <strong>{t('fecha_seguimiento')}:</strong>
              <span>{formatDate(seguimiento.fecha_seguimiento)}</span>
            </div>
            <div className="ds-info-item">
              <strong>{t('realizado_por')}:</strong>
              <span>{seguimiento.realizado_por_nombre || t('no_especificado')}</span>
            </div>
            {seguimiento.proximo_seguimiento && (
              <div className="ds-info-item">
                <strong>{t('proximo_seguimiento')}:</strong>
                <span>{formatDate(seguimiento.proximo_seguimiento)}</span>
              </div>
            )}
          </div>

          <div className="ds-card">
            <h3><i className="fas fa-home"></i> {t('condiciones_hogar')}</h3>
            {seguimiento.condiciones_hogar ? (
              <>
                <div className="ds-info-item">
                  <strong>{t('condiciones')}:</strong>
                  <span>{t(`condicion_${seguimiento.condiciones_hogar}`)}</span>
                </div>
                {seguimiento.observaciones_hogar && (
                  <div className="ds-info-item">
                    <strong>{t('observaciones')}:</strong>
                    <span>{seguimiento.observaciones_hogar}</span>
                  </div>
                )}
                <div className="ds-info-item">
                  <strong>{t('convive_con_otros_animales')}:</strong>
                  <span>{seguimiento.convive_con_otros_animales ? '✅ Si' : '❌ No'}</span>
                </div>
              </>
            ) : (
              <p className="ds-no-info">{t('no_informacion_hogar')}</p>
            )}
          </div>

          <div className="ds-card ds-card-full">
            <h3><i className="fas fa-file-alt"></i> {t('observaciones')}</h3>
            <p>{seguimiento.observaciones}</p>
          </div>

          {seguimiento.recomendaciones && (
            <div className="ds-card ds-card-full">
              <h3><i className="fas fa-lightbulb"></i> {t('recomendaciones')}</h3>
              <p>{seguimiento.recomendaciones}</p>
            </div>
          )}

          {seguimiento.comportamiento_observado && (
            <div className="ds-card ds-card-full">
              <h3><i className="fas fa-paw"></i> {t('comportamiento_observado')}</h3>
              <p>{seguimiento.comportamiento_observado}</p>
            </div>
          )}

          {/* Fotos */}
          {fotos.length > 0 && (
            <div className="ds-card ds-card-full">
              <h3><i className="fas fa-images"></i> {t('fotos_adicionales')}</h3>
              <div className="ds-fotos-grid">
                {fotos.map((foto, index) => (
                  <img
                    key={index}
                    src={foto}
                    alt={`Foto ${index + 1}`}
                    className="ds-foto"
                    onClick={() => window.open(foto, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {seguimiento.foto_url && (
            <div className="ds-card ds-card-full">
              <h3><i className="fas fa-camera"></i> {t('foto_principal')}</h3>
              <img
                src={seguimiento.foto_url}
                alt="Foto principal"
                className="ds-foto-principal"
                onClick={() => window.open(seguimiento.foto_url, '_blank')}
              />
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="ds-actions">
          <Link to={`/fundacion/adopciones/seguimientos/${id}/editar`} className="ds-btn-editar">
            <i className="fas fa-edit"></i> {t('editar')}
          </Link>
          <Link to={`/fundacion/adopciones/${seguimiento.adopcion_id}`} className="ds-btn-adopcion">
            <i className="fas fa-paw"></i> {t('ver_adopcion')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DetalleSeguimiento;