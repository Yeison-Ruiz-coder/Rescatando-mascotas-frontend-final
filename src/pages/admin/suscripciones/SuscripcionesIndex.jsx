// src/pages/admin/suscripciones/SuscripcionesIndex.jsx

import React, { useState, useEffect } from 'react';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';
import './SuscripcionesIndex.css';

const AdminSuscripcionesIndex = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const [actualizando, setActualizando] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
    last_page: 1
  });

  const cargarSuscripciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando suscripciones para admin...');
      
      const response = await suscripcionService.getAll();
      console.log('📊 Respuesta completa:', response);
      
      let suscripcionesData = [];
      
      if (response?.data && Array.isArray(response.data)) {
        suscripcionesData = response.data;
        console.log(`✅ ${suscripcionesData.length} suscripciones cargadas`);
      } else {
        console.warn('⚠️ No se encontró un array en la respuesta');
        suscripcionesData = [];
      }
      
      if (response?.pagination) {
        setPagination(response.pagination);
      }
      
      setSuscripciones(suscripcionesData);
      
    } catch (error) {
      console.error('❌ Error al cargar suscripciones:', error);
      setError(error.message || 'Error al cargar las suscripciones');
      toast.error('Error al cargar las suscripciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarSuscripciones();
  }, []);

  // ✅ Función para CANCELAR suscripción (ADMIN)
  const handleCancelar = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta suscripción?')) {
      return;
    }
    
    setCancelando(id);
    
    try {
      console.log(`🗑️ Admin cancelando suscripción ${id}`);
      
      // ✅ USAR EL MÉTODO DE ADMIN, NO EL DE USUARIO
      await suscripcionService.cancelarSuscripcionAdmin(id);
      
      toast.success('✅ Suscripción cancelada exitosamente');
      
      // ✅ Recargar la lista
      await cargarSuscripciones();
      
    } catch (error) {
      console.error('❌ Error al cancelar:', error);
      toast.error(error.message || 'Error al cancelar la suscripción');
    } finally {
      setCancelando(null);
    }
  };

  // ✅ Función para REACTIVAR suscripción (ADMIN)
  const handleReactivar = async (id) => {
    if (!window.confirm('¿Estás seguro de reactivar esta suscripción?')) {
      return;
    }
    
    setActualizando(id);
    
    try {
      console.log(`🔄 Admin reactivando suscripción ${id}`);
      
      // ✅ USAR EL MÉTODO DE ADMIN
      await suscripcionService.actualizarSuscripcionAdmin(id, { estado: 'activo' });
      
      toast.success('✅ Suscripción reactivada exitosamente');
      
      // ✅ Recargar la lista
      await cargarSuscripciones();
      
    } catch (error) {
      console.error('❌ Error al reactivar:', error);
      toast.error(error.message || 'Error al reactivar la suscripción');
    } finally {
      setActualizando(null);
    }
  };

  // ✅ Función para PAUSAR suscripción (ADMIN)
  const handlePausar = async (id) => {
    if (!window.confirm('¿Estás seguro de pausar esta suscripción?')) {
      return;
    }
    
    setActualizando(id);
    
    try {
      console.log(`⏸️ Admin pausando suscripción ${id}`);
      
      // ✅ USAR EL MÉTODO DE ADMIN
      await suscripcionService.actualizarSuscripcionAdmin(id, { estado: 'inactivo' });
      
      toast.success('✅ Suscripción pausada exitosamente');
      
      // ✅ Recargar la lista
      await cargarSuscripciones();
      
    } catch (error) {
      console.error('❌ Error al pausar:', error);
      toast.error(error.message || 'Error al pausar la suscripción');
    } finally {
      setActualizando(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-suscripciones-loading">
        <div className="spinner"></div>
        <p>Cargando suscripciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-suscripciones-error">
        <h3>❌ Error al cargar</h3>
        <p>{error}</p>
        <button onClick={cargarSuscripciones} className="btn-primary">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  // ✅ Calcular estadísticas
  const suscripcionesActivas = Array.isArray(suscripciones) 
    ? suscripciones.filter(s => s.estado?.toLowerCase() === 'activo')
    : [];

  const suscripcionesPendientes = Array.isArray(suscripciones)
    ? suscripciones.filter(s => s.estado?.toLowerCase() === 'pendiente')
    : [];

  const suscripcionesCanceladas = Array.isArray(suscripciones)
    ? suscripciones.filter(s => s.estado?.toLowerCase() === 'cancelado')
    : [];

  const suscripcionesInactivas = Array.isArray(suscripciones)
    ? suscripciones.filter(s => s.estado?.toLowerCase() === 'inactivo')
    : [];

  return (
    <div className="admin-suscripciones-container">
      <div className="admin-header">
        <h1>📋 Gestión de Suscripciones</h1>
        <div className="admin-stats">
          <span className="stat-activas">🟢 Activas: {suscripcionesActivas.length}</span>
          <span className="stat-pendientes">🟡 Pendientes: {suscripcionesPendientes.length}</span>
          <span className="stat-inactivas">⏸️ Inactivas: {suscripcionesInactivas.length}</span>
          <span className="stat-canceladas">🔴 Canceladas: {suscripcionesCanceladas.length}</span>
          <span className="stat-total">📊 Total: {Array.isArray(suscripciones) ? suscripciones.length : 0}</span>
          <span className="stat-paginacion">📄 Página {pagination.current_page} de {pagination.last_page}</span>
        </div>
      </div>

      <div className="admin-table-container">
        <table className="admin-suscripciones-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Mascota</th>
              <th>Monto</th>
              <th>Estado</th>
              <th>Fecha Inicio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {!Array.isArray(suscripciones) || suscripciones.length === 0 ? (
              <tr>
                <td colSpan="8" className="empty-message">
                  No hay suscripciones registradas
                </td>
              </tr>
            ) : (
              suscripciones.map((suscripcion) => {
                const estado = suscripcion.estado?.toLowerCase();
                const estaCancelando = cancelando === suscripcion.id;
                const estaActualizando = actualizando === suscripcion.id;
                
                return (
                  <tr key={suscripcion.id}>
                    <td>#{suscripcion.id}</td>
                    <td>
                      {suscripcion.usuario?.name || 
                       suscripcion.usuario?.nombre || 
                       suscripcion.user?.name ||
                       'Usuario'}
                    </td>
                    <td>
                      {suscripcion.usuario?.email || 
                       suscripcion.user?.email ||
                       'N/A'}
                    </td>
                    <td>
                      {suscripcion.mascota?.nombre_mascota || 
                       suscripcion.mascota?.nombre || 
                       'Mascota'}
                    </td>
                    <td>${suscripcion.monto_mensual || suscripcion.monto || 0}</td>
                    <td>
                      <span className={`estado-badge estado-${estado || 'desconocido'}`}>
                        {suscripcion.estado || 'Desconocido'}
                      </span>
                    </td>
                    <td>
                      {suscripcion.fecha_inicio 
                        ? new Date(suscripcion.fecha_inicio).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td>
                      {/* Botón Cancelar - Solo para activas y pendientes */}
                      {(estado === 'activo' || estado === 'pendiente') && (
                        <button
                          className="btn-cancelar"
                          onClick={() => handleCancelar(suscripcion.id)}
                          disabled={estaCancelando || estaActualizando}
                        >
                          {estaCancelando ? (
                            <span className="spinner-small"></span>
                          ) : (
                            '🗑️ Cancelar'
                          )}
                        </button>
                      )}
                      
                      {/* Botón Reactivar - Solo para canceladas */}
                      {estado === 'cancelado' && (
                        <button
                          className="btn-reactivar"
                          onClick={() => handleReactivar(suscripcion.id)}
                          disabled={estaActualizando}
                        >
                          {estaActualizando ? (
                            <span className="spinner-small"></span>
                          ) : (
                            '🔄 Reactivar'
                          )}
                        </button>
                      )}
                      
                      {/* Botón Pausar - Solo para activas */}
                      {estado === 'activo' && (
                        <button
                          className="btn-pausar"
                          onClick={() => handlePausar(suscripcion.id)}
                          disabled={estaActualizando}
                          style={{ marginLeft: '5px' }}
                        >
                          {estaActualizando ? (
                            <span className="spinner-small"></span>
                          ) : (
                            '⏸️ Pausar'
                          )}
                        </button>
                      )}
                      
                      {/* Botón Reanudar - Solo para inactivas */}
                      {estado === 'inactivo' && (
                        <button
                          className="btn-reactivar"
                          onClick={() => handleReactivar(suscripcion.id)}
                          disabled={estaActualizando}
                          style={{ marginLeft: '5px' }}
                        >
                          {estaActualizando ? (
                            <span className="spinner-small"></span>
                          ) : (
                            '▶️ Reanudar'
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {pagination.total > 0 && (
        <div className="admin-pagination-info">
          Mostrando {suscripciones.length} de {pagination.total} suscripciones
        </div>
      )}
    </div>
  );
};

export default AdminSuscripcionesIndex;