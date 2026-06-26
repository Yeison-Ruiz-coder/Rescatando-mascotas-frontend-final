// src/pages/admin/suscripciones/SuscripcionesIndex.jsx

import React, { useState, useEffect } from 'react';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';
import './SuscripcionesIndex.css';

const AdminSuscripcionesIndex = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total: 0,
    per_page: 15,
    last_page: 1
  });

  // ✅ Función para cargar suscripciones
  const cargarSuscripciones = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Cargando suscripciones para admin...');
      
      const response = await suscripcionService.getAll();
      console.log('📊 Respuesta completa:', response);
      
      // ✅ La respuesta ahora es { data: [], pagination: {}, success: true }
      let suscripcionesData = [];
      
      if (response?.data && Array.isArray(response.data)) {
        suscripcionesData = response.data;
        console.log(`✅ ${suscripcionesData.length} suscripciones cargadas`);
      } else {
        console.warn('⚠️ No se encontró un array en la respuesta');
        suscripcionesData = [];
      }
      
      // ✅ Guardar datos de paginación
      if (response?.pagination) {
        setPagination(response.pagination);
      }
      
      // ✅ Mostrar mensaje
      if (suscripcionesData.length > 0) {
        toast.success(`✅ ${suscripcionesData.length} suscripciones cargadas`);
        console.log('📊 Primera suscripción:', suscripcionesData[0]);
      } else {
        toast.info('No hay suscripciones registradas');
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

  // ✅ Función para cancelar suscripción (admin)
  const handleCancelar = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta suscripción?')) {
      return;
    }
    
    try {
      await suscripcionService.cancelUserSuscripcion(id);
      toast.success('✅ Suscripción cancelada exitosamente');
      cargarSuscripciones(); // Recargar
    } catch (error) {
      console.error('Error al cancelar:', error);
      toast.error('Error al cancelar la suscripción');
    }
  };

  // ✅ Renderizado de carga
  if (loading) {
    return (
      <div className="admin-suscripciones-loading">
        <div className="spinner"></div>
        <p>Cargando suscripciones...</p>
      </div>
    );
  }

  // ✅ Renderizado de error
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

  // ✅ Calcular estadísticas solo si es array
  const suscripcionesActivas = Array.isArray(suscripciones) 
    ? suscripciones.filter(s => s.estado?.toLowerCase() === 'activo')
    : [];

  const suscripcionesPendientes = Array.isArray(suscripciones)
    ? suscripciones.filter(s => s.estado?.toLowerCase() === 'pendiente')
    : [];

  const suscripcionesCanceladas = Array.isArray(suscripciones)
    ? suscripciones.filter(s => s.estado?.toLowerCase() === 'cancelado')
    : [];

  return (
    <div className="admin-suscripciones-container">
      <div className="admin-header">
        <h1>📋 Gestión de Suscripciones</h1>
        <div className="admin-stats">
          <span className="stat-activas">🟢 Activas: {suscripcionesActivas.length}</span>
          <span className="stat-pendientes">🟡 Pendientes: {suscripcionesPendientes.length}</span>
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
              suscripciones.map((suscripcion) => (
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
                    <span className={`estado-badge estado-${suscripcion.estado?.toLowerCase() || 'desconocido'}`}>
                      {suscripcion.estado || 'Desconocido'}
                    </span>
                  </td>
                  <td>
                    {suscripcion.fecha_inicio 
                      ? new Date(suscripcion.fecha_inicio).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>
                    {suscripcion.estado?.toLowerCase() === 'activo' && (
                      <button
                        className="btn-cancelar"
                        onClick={() => handleCancelar(suscripcion.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* ✅ Información de paginación */}
      {pagination.total > 0 && (
        <div className="admin-pagination-info">
          Mostrando {suscripciones.length} de {pagination.total} suscripciones
        </div>
      )}
    </div>
  );
};

export default AdminSuscripcionesIndex;