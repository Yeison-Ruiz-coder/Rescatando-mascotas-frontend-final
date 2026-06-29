// src/pages/user/MisSuscripciones/MisSuscripciones.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../contexts/AuthContext';
import { suscripcionService } from '../../../services/suscripcionService';
import mascotaService from '../../../services/mascotaService';
import { toast } from 'react-toastify';
import ProfileBanner from '../../../components/common/ProfileBanner/index.js';
import SuscripcionCard from '../../../components/common/SuscripcionCard/SuscripcionCard.jsx';
import './MisSuscripciones.css';

const MisSuscripciones = () => {
  const { t } = useTranslation('suscripciones');
  const { user } = useAuth();
  const [suscripciones, setSuscripciones] = useState([]);
  const [suscripcionesEliminadas, setSuscripcionesEliminadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(null);
  const [ultimaEliminada, setUltimaEliminada] = useState(null);
  const [recargando, setRecargando] = useState(false);
  const [cargandoMascotas, setCargandoMascotas] = useState(false);
  const [version, setVersion] = useState(0);

  // ✅ Estadísticas para el banner
  const totalSuscripciones = suscripciones.length;
  const activas = suscripciones.filter(s => s.estado?.toLowerCase() === 'activo').length;
  const pendientes = suscripciones.filter(s => s.estado?.toLowerCase() === 'pendiente').length;
  const tasaActividad = totalSuscripciones > 0 ? Math.round((activas / totalSuscripciones) * 100) : 0;

  useEffect(() => {
    cargarMisSuscripciones();
  }, [version]);

  const cargarMisSuscripciones = async () => {
    try {
      setLoading(true);
      
      const suscripcionesData = await suscripcionService.getMisSuscripciones();
      
      if (!Array.isArray(suscripcionesData) || suscripcionesData.length === 0) {
        setSuscripciones([]);
        setSuscripcionesEliminadas([]);
        setUltimaEliminada(null);
        setLoading(false);
        return;
      }
      
      const mascotaIds = [...new Set(suscripcionesData.map(s => s.mascota_id).filter(id => id))];
      
      setCargandoMascotas(true);
      const mascotasMap = await mascotaService.getMascotasEnParalelo(mascotaIds, 8000);
      setCargandoMascotas(false);
      
      const suscripcionesConMascotas = suscripcionesData.map(suscripcion => {
        const mascota = mascotasMap[suscripcion.mascota_id];
        return {
          ...suscripcion,
          mascota: mascota || {
            id: suscripcion.mascota_id,
            nombre_mascota: `Mascota #${suscripcion.mascota_id}`,
            especie: t('no_especificada', 'No especificada'),
            edad_aprox: null,
            foto_principal: null
          }
        };
      });
      
      const activas = suscripcionesConMascotas.filter(s => {
        const estado = s.estado?.toLowerCase() || '';
        return estado === 'activo' || estado === 'pendiente';
      });
      
      const eliminadas = suscripcionesConMascotas.filter(s => {
        const estado = s.estado?.toLowerCase() || '';
        return estado === 'cancelado' || 
               estado === 'inactivo' ||
               estado === 'expirado' ||
               estado === 'finalizado';
      });
      
      const ultima = eliminadas.length > 0 ? 
        eliminadas.sort((a, b) => {
          const fechaA = a.updated_at ? new Date(a.updated_at) : new Date(a.fecha_fin || 0);
          const fechaB = b.updated_at ? new Date(b.updated_at) : new Date(b.fecha_fin || 0);
          return fechaB - fechaA;
        })[0] : null;
      
      setSuscripciones(ordenarSuscripciones(activas));
      setSuscripcionesEliminadas(eliminadas);
      setUltimaEliminada(ultima);
      
    } catch (error) {
      console.error('❌ Error al cargar suscripciones:', error);
      toast.error(t('error_cargar', 'Error al cargar tus suscripciones'));
      setSuscripciones([]);
      setSuscripcionesEliminadas([]);
      setUltimaEliminada(null);
    } finally {
      setLoading(false);
      setRecargando(false);
      setCargandoMascotas(false);
    }
  };

  const ordenarSuscripciones = (lista) => {
    const ordenEstados = {
      'activo': 0,
      'pendiente': 1,
      'inactivo': 2,
      'cancelado': 3,
      'expirado': 4,
      'finalizado': 5
    };

    return [...lista].sort((a, b) => {
      const estadoA = a.estado?.toLowerCase() || '';
      const estadoB = b.estado?.toLowerCase() || '';
      
      const prioridadA = ordenEstados[estadoA] ?? 99;
      const prioridadB = ordenEstados[estadoB] ?? 99;
      
      if (prioridadA !== prioridadB) {
        return prioridadA - prioridadB;
      }
      
      const fechaA = a.fecha_inicio ? new Date(a.fecha_inicio) : new Date(0);
      const fechaB = b.fecha_inicio ? new Date(b.fecha_inicio) : new Date(0);
      return fechaB - fechaA;
    });
  };

  const handleCancelar = async (id) => {
    if (window.confirm(t('confirmar_cancelar', '¿Estás seguro de cancelar esta suscripción?'))) {
      setCancelando(id);
      try {
        await suscripcionService.cancelarSuscripcion(id);
        toast.success(t('cancelada', 'Suscripción cancelada'));
        setVersion(prev => prev + 1);
      } catch (error) {
        toast.error(t('error_cancelar', 'Error al cancelar'));
      } finally {
        setCancelando(null);
      }
    }
  };

  const handleSimularPago = async (id) => {
    if (!window.confirm('💳 ¿Simular pago para esta suscripción?')) {
      return;
    }
    setCancelando(id);
    try {
      await suscripcionService.simularPago(id);
      toast.success(t('pago_simulado', '¡Pago simulado! Suscripción activada.'));
      setVersion(prev => prev + 1);
    } catch (error) {
      toast.error(t('error_pago', 'Error al simular el pago'));
    } finally {
      setCancelando(null);
    }
  };

  // ===== FUNCIONES PARA OBTENER DATOS DE MASCOTA =====
  const getNombreMascota = (suscripcion) => {
    if (!suscripcion) return t('mascota', 'Mascota');
    if (suscripcion.mascota?.nombre_mascota) return suscripcion.mascota.nombre_mascota;
    if (suscripcion.mascota?.nombre) return suscripcion.mascota.nombre;
    return `Mascota #${suscripcion.mascota_id || '?'}`;
  };

  const getImagenMascota = (suscripcion) => {
    if (!suscripcion) return null;
    if (suscripcion.mascota?.foto_principal) return suscripcion.mascota.foto_principal;
    if (suscripcion.mascota?.imagen_url) return suscripcion.mascota.imagen_url;
    return null;
  };

  const getEspecieMascota = (suscripcion) => {
    if (!suscripcion) return t('no_especificada', 'No especificada');
    if (suscripcion.mascota?.especie) return suscripcion.mascota.especie;
    return t('no_especificada', 'No especificada');
  };

  const getEdadMascota = (suscripcion) => {
    if (!suscripcion) return null;
    if (suscripcion.mascota?.edad_aprox) return suscripcion.mascota.edad_aprox;
    return null;
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      'activo': { class: 'success', icon: 'fa-check-circle', label: t('activo', 'Activa') },
      'pendiente': { class: 'warning', icon: 'fa-clock', label: t('pendiente', 'Pendiente') },
      'pausado': { class: 'warning', icon: 'fa-pause-circle', label: t('pausado', 'Pausada') },
      'cancelado': { class: 'danger', icon: 'fa-times-circle', label: t('cancelado', 'Cancelada') },
      'expirado': { class: 'secondary', icon: 'fa-hourglass-end', label: t('expirado', 'Expirada') },
      'inactivo': { class: 'secondary', icon: 'fa-pause-circle', label: t('inactivo', 'Inactiva') },
      'finalizado': { class: 'secondary', icon: 'fa-flag-checkered', label: t('finalizado', 'Finalizada') }
    };
    return estados[estado?.toLowerCase()] || { class: 'secondary', icon: 'fa-question-circle', label: estado || t('desconocido', 'Desconocido') };
  };

  const formatDate = (fecha) => {
    if (!fecha) return '-';
    try {
      return new Date(fecha).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return '-';
    }
  };

  if (loading || cargandoMascotas) {
    return (
      <div className="mis-suscripciones-page">
        <div className="mis-suscripciones-loading">
          <div className="spinner"></div>
          <p>{cargandoMascotas ? t('cargando_mascotas', 'Cargando mascotas...') : t('cargando', 'Cargando tus suscripciones...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mis-suscripciones-page">
      {/* ===== BANNER DE PERFIL ===== */}
      <div className="mis-suscripciones-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: user?.nombre || t('usuario', 'Usuario'),
            avatar: user?.avatar || null,
            titulo: t('banner.titulo', {
              defaultValue: "{{total}} suscripciones · {{activas}} activas · {{tasa}}% activas",
              total: totalSuscripciones,
              activas: activas,
              tasa: tasaActividad,
            }),
            solicitudes: totalSuscripciones,
            adopciones: activas,
            eventos: pendientes,
          }}
        />
      </div>

      {/* ===== CONTENIDO ===== */}
      <div className="mis-suscripciones-wrapper">
        {/* ===== HEADER CENTRADO Y MÁS GRANDE ===== */}
        <div className="mis-suscripciones-header">
          <div className="header-content-centered">
            <h1>
              <i className="fas fa-hand-holding-heart"></i> {t('mis_suscripciones', 'Mis Suscripciones')}
            </h1>
            <p>
              <i className="fas fa-info-circle"></i> {t('gestiona_tus_apadrinamientos', 'Gestiona tus apadrinamientos y membresías')}
            </p>
          </div>
        </div>

        {suscripciones.length === 0 && suscripcionesEliminadas.length === 0 ? (
          <div className="mis-suscripciones-empty-modern">
            <div className="empty-icon">
              <i className="fas fa-hand-holding-heart"></i>
            </div>
            <h3>{t('no_tienes_suscripciones', 'No tienes suscripciones')}</h3>
            <p>{t('comienza_apadrinar', 'Comienza a marcar la diferencia apadrinando una mascota')}</p>
            <Link to="/suscripciones" className="btn-primary-modern">
              <i className="fas fa-paw"></i> {t('ver_mascotas', 'Ver mascotas disponibles')}
            </Link>
          </div>
        ) : (
          <>
            {suscripciones.length > 0 && (
              <div className="suscripciones-seccion-modern">
                <h2 className="seccion-titulo-modern">
                  <span className="seccion-icon">
                    <i className="fas fa-circle" style={{ color: 'var(--color-success)' }}></i>
                  </span>
                  {t('suscripciones_activas', 'Suscripciones Activas')} ({suscripciones.length})
                </h2>
                <div className="mis-suscripciones-grid-modern">
                  {suscripciones.map((suscripcion) => (
                    <SuscripcionCard
                      key={suscripcion.id}
                      suscripcion={suscripcion}
                      getNombreMascota={getNombreMascota}
                      getImagenMascota={getImagenMascota}
                      getEspecieMascota={getEspecieMascota}
                      getEdadMascota={getEdadMascota}
                      getEstadoInfo={getEstadoInfo}
                      handleCancelar={handleCancelar}
                      handleSimularPago={handleSimularPago}
                      cancelando={cancelando}
                      mostrarBotonEliminar={true}
                      formatDate={formatDate}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            )}

            {ultimaEliminada && (
              <div className="suscripciones-seccion-modern eliminadas">
                <h2 className="seccion-titulo-modern eliminadas">
                  <span className="seccion-icon">
                    <i className="fas fa-trash-alt"></i>
                  </span>
                  {t('ultima_eliminada', 'Última Suscripción Eliminada')}
                </h2>
                <div className="mis-suscripciones-grid-modern">
                  <SuscripcionCard
                    suscripcion={ultimaEliminada}
                    getNombreMascota={getNombreMascota}
                    getImagenMascota={getImagenMascota}
                    getEspecieMascota={getEspecieMascota}
                    getEdadMascota={getEdadMascota}
                    getEstadoInfo={getEstadoInfo}
                    esEliminada={true}
                    formatDate={formatDate}
                    t={t}
                  />
                </div>
              </div>
            )}

            {suscripcionesEliminadas.length > 1 && (
              <details className="historial-eliminadas-modern">
                <summary>
                  <span className="seccion-icon">
                    <i className="fas fa-history"></i>
                  </span>
                  {t('ver_historial', 'Ver historial de eliminadas')} ({suscripcionesEliminadas.length - 1} {t('mas', 'más')})
                  <i className="fas fa-chevron-down"></i>
                </summary>
                <div className="mis-suscripciones-grid-modern historial-grid">
                  {suscripcionesEliminadas
                    .filter(s => s.id !== ultimaEliminada?.id)
                    .map((suscripcion) => (
                      <SuscripcionCard
                        key={suscripcion.id}
                        suscripcion={suscripcion}
                        getNombreMascota={getNombreMascota}
                        getImagenMascota={getImagenMascota}
                        getEspecieMascota={getEspecieMascota}
                        getEdadMascota={getEdadMascota}
                        getEstadoInfo={getEstadoInfo}
                        esEliminada={true}
                        esHistorial={true}
                        formatDate={formatDate}
                        t={t}
                      />
                    ))}
                </div>
              </details>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MisSuscripciones;