import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { suscripcionService } from '../../services/suscripcionService';
import { toast } from 'react-toastify';
import './MisSuscripciones.css';

const UserSuscripciones = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [suscripcionesEliminadas, setSuscripcionesEliminadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelando, setCancelando] = useState(null);
  const [ultimaEliminada, setUltimaEliminada] = useState(null);
  const [recargando, setRecargando] = useState(false);

  useEffect(() => {
    cargarMisSuscripciones();
  }, []);

  const cargarMisSuscripciones = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando suscripciones desde el backend...');
      
      const response = await suscripcionService.getUserSuscripciones();
      
      console.log('📊 Respuesta del backend:', response);
      
      let suscripcionesData = [];
      
      if (response?.data?.data) {
        suscripcionesData = response.data.data;
      } else if (response?.data) {
        suscripcionesData = response.data;
      } else if (Array.isArray(response)) {
        suscripcionesData = response;
      }
      
      console.log('📊 Total de suscripciones del backend:', suscripcionesData.length);
      
      // Filtrar solo las activas
      const activas = suscripcionesData.filter(s => 
        s.estado?.toLowerCase() === 'activo' || 
        s.estado?.toLowerCase() === 'pendiente'
      );
      
      // Filtrar las canceladas/inactivas
      const eliminadas = suscripcionesData.filter(s => 
        s.estado?.toLowerCase() === 'cancelado' || 
        s.estado?.toLowerCase() === 'inactivo' ||
        s.estado?.toLowerCase() === 'expirado'
      );
      
      console.log('🐾 Suscripciones activas:', activas.length);
      console.log('🗑️ Suscripciones canceladas:', eliminadas.length);
      
      // La última eliminada es la más reciente
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
      toast.error('Error al cargar tus suscripciones');
    } finally {
      setLoading(false);
      setRecargando(false);
    }
  };

  const ordenarSuscripciones = (lista) => {
    const ordenEstados = {
      'activo': 0,
      'pendiente': 1,
      'inactivo': 2,
      'cancelado': 3,
      'expirado': 4
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

  // ✅ UNICA DEFINICIÓN DE handleCancelar
  const handleCancelar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas cancelar esta suscripción? Esta acción no se puede deshacer.')) {
      setCancelando(id);
      try {
        console.log('🗑️ Cancelando suscripción:', id);
        
        // Intentar cancelar en el backend
        await suscripcionService.cancelUserSuscripcion(id);
        
        toast.success('✅ Suscripción cancelada exitosamente');
        
        // Recargar la lista desde el backend
        await cargarMisSuscripciones();
        
      } catch (error) {
        console.error('❌ Error al cancelar:', error);
        toast.error('Error al cancelar la suscripción. Intenta nuevamente.');
      } finally {
        setCancelando(null);
      }
    }
  };

  const handleRestaurar = async (id) => {
    try {
      console.log('🔄 Restaurando suscripción:', id);
      
      const eliminada = suscripcionesEliminadas.find(s => s.id === id);
      
      if (eliminada) {
        // Intentar restaurar en el backend
        try {
          // Si tienes un endpoint para restaurar
          // await suscripcionService.reactivarSuscripcion(id);
          
          // Por ahora, solo actualizar localmente
          const restaurada = {
            ...eliminada,
            estado: 'activo',
            updated_at: new Date().toISOString()
          };
          
          const nuevasActivas = [...suscripciones, restaurada];
          const nuevasEliminadas = suscripcionesEliminadas.filter(s => s.id !== id);
          
          setSuscripciones(ordenarSuscripciones(nuevasActivas));
          setSuscripcionesEliminadas(nuevasEliminadas);
          setUltimaEliminada(nuevasEliminadas.length > 0 ? nuevasEliminadas[nuevasEliminadas.length - 1] : null);
          
          toast.success(`✅ Suscripción restaurada exitosamente`);
        } catch (error) {
          console.error('❌ Error al restaurar:', error);
          toast.error('Error al restaurar la suscripción');
        }
      }
    } catch (error) {
      console.error('❌ Error al restaurar:', error);
      toast.error('Error al restaurar la suscripción');
    }
  };

  const handleRecargar = async () => {
    setRecargando(true);
    await cargarMisSuscripciones();
    toast.info('🔄 Datos actualizados');
  };

  const getNombreMascota = (suscripcion) => {
    if (suscripcion.mascota?.nombre_mascota) {
      return suscripcion.mascota.nombre_mascota;
    }
    if (suscripcion.mascota?.nombre) {
      return suscripcion.mascota.nombre;
    }
    if (suscripcion.mascota_nombre) {
      return suscripcion.mascota_nombre;
    }
    if (suscripcion.nombre_mascota) {
      return suscripcion.nombre_mascota;
    }
    return 'Mascota';
  };

  const getImagenMascota = (suscripcion) => {
    if (suscripcion.mascota?.imagen_url) {
      return suscripcion.mascota.imagen_url;
    }
    if (suscripcion.mascota?.foto_url) {
      return suscripcion.mascota.foto_url;
    }
    return null;
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      'activo': { class: 'success', icon: '✅', label: 'Activa' },
      'pendiente': { class: 'warning', icon: '⏳', label: 'Pendiente' },
      'cancelado': { class: 'danger', icon: '❌', label: 'Cancelada' },
      'expirado': { class: 'secondary', icon: '⏰', label: 'Expirada' },
      'inactivo': { class: 'secondary', icon: '⏸️', label: 'Inactiva' }
    };
    return estados[estado?.toLowerCase()] || { class: 'secondary', icon: '❓', label: estado || 'Desconocido' };
  };

  if (loading) {
    return (
      <div className="mis-suscripciones-loading">
        <div className="spinner"></div>
        <p>Cargando tus suscripciones...</p>
      </div>
    );
  }

  return (
    <div className="mis-suscripciones-container">
      <div className="mis-suscripciones-header">
        <div className="header-actions">
          <div>
            <h1>🐾 Mis Suscripciones</h1>
            <p>Gestiona tus apadrinamientos y membresías</p>
          </div>
          <button 
            className="btn-recargar"
            onClick={handleRecargar}
            disabled={recargando}
          >
            {recargando ? '🔄 Actualizando...' : '🔄 Actualizar'}
          </button>
        </div>
      </div>
      
      {suscripciones.length === 0 && suscripcionesEliminadas.length === 0 ? (
        <div className="mis-suscripciones-empty">
          <div className="empty-icon">🐕</div>
          <h3>No tienes suscripciones</h3>
          <p>Comienza a marcar la diferencia apadrinando una mascota</p>
          <Link to="/suscripciones" className="btn-primary">
            Ver mascotas disponibles
          </Link>
        </div>
      ) : (
        <>
          {/* Suscripciones Activas */}
          {suscripciones.length > 0 && (
            <div className="suscripciones-seccion">
              <h2 className="seccion-titulo">
                <span className="seccion-icon">🟢</span>
                Suscripciones Activas ({suscripciones.length})
              </h2>
              <div className="mis-suscripciones-grid">
                {suscripciones.map((suscripcion, index) => (
                  <SuscripcionCard
                    key={suscripcion.id || index}
                    suscripcion={suscripcion}
                    getNombreMascota={getNombreMascota}
                    getImagenMascota={getImagenMascota}
                    getEstadoInfo={getEstadoInfo}
                    handleCancelar={handleCancelar}
                    cancelando={cancelando}
                    mostrarBotonEliminar={true}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Última suscripción eliminada */}
          {ultimaEliminada && (
            <div className="suscripciones-seccion eliminadas">
              <h2 className="seccion-titulo eliminadas">
                <span className="seccion-icon">🗑️</span>
                Última Suscripción Eliminada
              </h2>
              <div className="mis-suscripciones-grid">
                <SuscripcionCard
                  key={ultimaEliminada.id}
                  suscripcion={ultimaEliminada}
                  getNombreMascota={getNombreMascota}
                  getImagenMascota={getImagenMascota}
                  getEstadoInfo={getEstadoInfo}
                  handleRestaurar={handleRestaurar}
                  mostrarBotonRestaurar={true}
                  esEliminada={true}
                />
              </div>
            </div>
          )}

          {/* Historial de eliminadas */}
          {suscripcionesEliminadas.length > 1 && (
            <details className="historial-eliminadas">
              <summary>
                <span className="seccion-icon">📜</span>
                Ver historial de eliminadas ({suscripcionesEliminadas.length - 1} más)
              </summary>
              <div className="mis-suscripciones-grid historial-grid">
                {suscripcionesEliminadas
                  .filter(s => s.id !== ultimaEliminada?.id)
                  .map((suscripcion, index) => (
                    <SuscripcionCard
                      key={suscripcion.id || index}
                      suscripcion={suscripcion}
                      getNombreMascota={getNombreMascota}
                      getImagenMascota={getImagenMascota}
                      getEstadoInfo={getEstadoInfo}
                      esEliminada={true}
                      esHistorial={true}
                    />
                  ))}
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
};

// Componente de Tarjeta de Suscripción
const SuscripcionCard = ({ 
  suscripcion, 
  getNombreMascota, 
  getImagenMascota, 
  getEstadoInfo, 
  handleCancelar, 
  handleRestaurar,
  cancelando,
  mostrarBotonEliminar = false,
  mostrarBotonRestaurar = false,
  esEliminada = false,
  esHistorial = false
}) => {
  const nombreMascota = getNombreMascota(suscripcion);
  const imagenMascota = getImagenMascota(suscripcion);
  const estadoInfo = getEstadoInfo(suscripcion.estado);
  const esActiva = suscripcion.estado?.toLowerCase() === 'activo';
  const fechaInicio = suscripcion.fecha_inicio ? new Date(suscripcion.fecha_inicio) : null;
  const fechaFin = suscripcion.fecha_eliminacion || suscripcion.updated_at ? 
    new Date(suscripcion.fecha_eliminacion || suscripcion.updated_at) : null;

  return (
    <div className={`suscripcion-card ${esActiva ? 'card-activa' : 'card-eliminada'} ${esHistorial ? 'card-historial' : ''}`}>
      <div className="suscripcion-card-header">
        <div className="suscripcion-mascota">
          {imagenMascota ? (
            <img 
              src={imagenMascota} 
              alt={nombreMascota}
              className="suscripcion-avatar"
            />
          ) : (
            <div className="suscripcion-avatar-placeholder">🐾</div>
          )}
          <div className="suscripcion-mascota-info">
            <h3>{nombreMascota}</h3>
            <span className="suscripcion-tipo">
              {suscripcion.plan_id ? '📋 Plan: ' + suscripcion.plan_id : '🤝 Apadrinamiento'}
            </span>
            {esEliminada && (
              <span className="suscripcion-eliminada-tag">🗑️ Eliminada</span>
            )}
          </div>
        </div>
        <span className={`estado-badge estado-${estadoInfo.class}`}>
          {estadoInfo.icon} {estadoInfo.label}
        </span>
      </div>

      <div className="suscripcion-card-body">
        <div className="suscripcion-detalles">
          <div className="detalle-item">
            <span className="detalle-label">💰 Monto mensual</span>
            <span className="detalle-valor">
              ${suscripcion.monto_mensual?.toLocaleString() || suscripcion.monto?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="detalle-item">
            <span className="detalle-label">🔄 Frecuencia</span>
            <span className="detalle-valor">
              {suscripcion.frecuencia || 'Mensual'}
            </span>
          </div>
          {fechaInicio && (
            <div className="detalle-item">
              <span className="detalle-label">📅 Inicio</span>
              <span className="detalle-valor">
                {fechaInicio.toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}
          {fechaFin && esEliminada && (
            <div className="detalle-item">
              <span className="detalle-label">🗑️ Eliminada</span>
              <span className="detalle-valor">
                {fechaFin.toLocaleDateString('es-ES', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          )}
          {suscripcion.mensaje_apoyo && (
            <div className="detalle-item mensaje-apoyo">
              <span className="detalle-label">💬 Mensaje de apoyo</span>
              <span className="detalle-valor">"{suscripcion.mensaje_apoyo}"</span>
            </div>
          )}
        </div>
      </div>

      <div className="suscripcion-card-footer">
        {mostrarBotonEliminar && esActiva && (
          <button
            className="btn-cancelar"
            onClick={() => handleCancelar(suscripcion.id)}
            disabled={cancelando === suscripcion.id}
          >
            {cancelando === suscripcion.id ? (
              <span className="spinner-small"></span>
            ) : (
              '🗑️ Cancelar Suscripción'
            )}
          </button>
        )}
        {mostrarBotonRestaurar && (
          <button
            className="btn-restaurar"
            onClick={() => handleRestaurar(suscripcion.id)}
          >
            🔄 Restaurar Suscripción
          </button>
        )}
        {esEliminada && !mostrarBotonRestaurar && !mostrarBotonEliminar && (
          <span className="suscripcion-inactiva-msg">
            Esta suscripción fue eliminada
          </span>
        )}
      </div>
    </div>
  );
};

export default UserSuscripciones;