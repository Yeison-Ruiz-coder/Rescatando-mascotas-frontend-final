import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { suscripcionService } from '../../services/suscripcionService';
import { toast } from 'react-toastify';
import './MisSuscripciones.css';

const MisSuscripciones = () => {
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
      
      // ✅ CORREGIDO: Usar getMisSuscripciones
      const response = await suscripcionService.getMisSuscripciones();
      
      console.log('📊 Respuesta del backend:', response);
      
      let suscripcionesData = [];
      
      // ✅ Extraer los datos correctamente
      if (response?.data?.data) {
        suscripcionesData = response.data.data;
      } else if (response?.data) {
        suscripcionesData = response.data;
      } else if (Array.isArray(response)) {
        suscripcionesData = response;
      }
      
      console.log('📊 Total de suscripciones del backend:', suscripcionesData.length);
      
      // ✅ Si no hay datos, mostrar mensaje y salir
      if (suscripcionesData.length === 0) {
        setSuscripciones([]);
        setSuscripcionesEliminadas([]);
        setUltimaEliminada(null);
        setLoading(false);
        return;
      }
      
      // ✅ Verificar que cada suscripción tenga la estructura esperada
      const suscripcionesValidas = suscripcionesData.filter(s => s && typeof s === 'object');
      
      // Filtrar solo las activas
      const activas = suscripcionesValidas.filter(s => 
        s.estado?.toLowerCase() === 'activo' || 
        s.estado?.toLowerCase() === 'pendiente'
      );
      
      // Filtrar las canceladas/inactivas
      const eliminadas = suscripcionesValidas.filter(s => 
        s.estado?.toLowerCase() === 'cancelado' || 
        s.estado?.toLowerCase() === 'inactivo' ||
        s.estado?.toLowerCase() === 'expirado' ||
        s.estado?.toLowerCase() === 'finalizado'
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
      
      // ✅ Mensaje de error más amigable
      if (error.response?.status === 500) {
        toast.error('Error en el servidor. Por favor, intenta más tarde.');
      } else if (error.response?.status === 401) {
        toast.error('Tu sesión ha expirado. Inicia sesión nuevamente.');
      } else {
        toast.error('Error al cargar tus suscripciones');
      }
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
    if (window.confirm('¿Estás seguro de que deseas cancelar esta suscripción? Esta acción no se puede deshacer.')) {
      setCancelando(id);
      try {
        console.log('🗑️ Cancelando suscripción:', id);
        
        // ✅ Usar el método correcto para cancelar
        await suscripcionService.cancelarSuscripcion(id);
        
        toast.success('✅ Suscripción cancelada exitosamente');
        
        // Recargar la lista desde el backend
        await cargarMisSuscripciones();
        
      } catch (error) {
        console.error('❌ Error al cancelar:', error);
        toast.error(error.response?.data?.message || 'Error al cancelar la suscripción');
      } finally {
        setCancelando(null);
      }
    }
  };

  const handleRecargar = async () => {
    setRecargando(true);
    await cargarMisSuscripciones();
    toast.info('🔄 Datos actualizados');
  };

  const getNombreMascota = (suscripcion) => {
    if (!suscripcion) return 'Mascota';
    
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
    if (!suscripcion) return null;
    
    if (suscripcion.mascota?.imagen_url) {
      return suscripcion.mascota.imagen_url;
    }
    if (suscripcion.mascota?.foto_url) {
      return suscripcion.mascota.foto_url;
    }
    if (suscripcion.mascota?.foto_principal) {
      return suscripcion.mascota.foto_principal;
    }
    return null;
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      'activo': { class: 'success', icon: '✅', label: 'Activa' },
      'pendiente': { class: 'warning', icon: '⏳', label: 'Pendiente' },
      'pausado': { class: 'warning', icon: '⏸️', label: 'Pausada' },
      'cancelado': { class: 'danger', icon: '❌', label: 'Cancelada' },
      'expirado': { class: 'secondary', icon: '⏰', label: 'Expirada' },
      'inactivo': { class: 'secondary', icon: '⏸️', label: 'Inactiva' },
      'finalizado': { class: 'secondary', icon: '🏁', label: 'Finalizada' }
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
                    esActiva={true}
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

// ============================================
// COMPONENTE: SuscripcionCard
// ============================================
const SuscripcionCard = ({ 
  suscripcion, 
  getNombreMascota, 
  getImagenMascota, 
  getEstadoInfo, 
  handleCancelar, 
  cancelando,
  mostrarBotonEliminar = false,
  esEliminada = false,
  esHistorial = false,
  esActiva = false
}) => {
  const nombreMascota = getNombreMascota(suscripcion);
  const imagenMascota = getImagenMascota(suscripcion);
  const estadoInfo = getEstadoInfo(suscripcion.estado);
  const esActivaEstado = suscripcion.estado?.toLowerCase() === 'activo';
  const fechaInicio = suscripcion.fecha_inicio ? new Date(suscripcion.fecha_inicio) : null;
  const fechaFin = suscripcion.fecha_eliminacion || suscripcion.updated_at || suscripcion.fecha_fin ? 
    new Date(suscripcion.fecha_eliminacion || suscripcion.updated_at || suscripcion.fecha_fin) : null;

  // ✅ Formatear fecha
  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    try {
      return fecha.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className={`suscripcion-card ${esActivaEstado ? 'card-activa' : 'card-inactiva'} ${esHistorial ? 'card-historial' : ''}`}>
      <div className="suscripcion-card-header">
        <div className="suscripcion-mascota">
          {imagenMascota ? (
            <img 
              src={imagenMascota} 
              alt={nombreMascota}
              className="suscripcion-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.querySelector('.suscripcion-avatar-placeholder')?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className="suscripcion-avatar-placeholder">
            {esActivaEstado ? '🐾' : '🗑️'}
          </div>
          <div className="suscripcion-mascota-info">
            <h3>{nombreMascota}</h3>
            <span className="suscripcion-tipo">
              {suscripcion.plan_id ? '📋 Plan' : '🤝 Apadrinamiento'}
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
              ${parseFloat(suscripcion.monto_mensual || suscripcion.monto || 0).toLocaleString()}
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
                {formatearFecha(fechaInicio)}
              </span>
            </div>
          )}
          {fechaFin && esEliminada && (
            <div className="detalle-item">
              <span className="detalle-label">🗑️ Eliminada</span>
              <span className="detalle-valor">
                {formatearFecha(fechaFin)}
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
        {mostrarBotonEliminar && esActivaEstado && (
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
        {esEliminada && !mostrarBotonEliminar && (
          <span className="suscripcion-inactiva-msg">
            {esHistorial ? 'Suscripción eliminada' : 'Esta suscripción fue cancelada'}
          </span>
        )}
        {suscripcion.estado?.toLowerCase() === 'pendiente' && (
          <span className="suscripcion-inactiva-msg">
            ⏳ Pendiente de pago
          </span>
        )}
      </div>
    </div>
  );
};

export default MisSuscripciones;