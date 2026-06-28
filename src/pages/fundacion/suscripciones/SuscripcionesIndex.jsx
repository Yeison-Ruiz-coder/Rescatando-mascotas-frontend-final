// src/pages/fundacion/suscripciones/SuscripcionesIndex.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';
import './Suscripciones.css';

const FundacionSuscripcionesIndex = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    activas: 0,
    pendientes: 0,
    montoTotal: 0
  });
  const [filters, setFilters] = useState({
    estado: '',
    frecuencia: ''
  });

  useEffect(() => {
    cargarSuscripciones();
  }, []);

  const cargarSuscripciones = async () => {
    try {
      setLoading(true);
      // ✅ CORREGIDO: usar getSuscripcionesEntity
      const data = await suscripcionService.getSuscripcionesEntity();
      setSuscripciones(data);
      
      const activas = data.filter(s => s.estado === 'activo').length;
      const pendientes = data.filter(s => s.estado === 'pendiente').length;
      const montoTotal = data.reduce((sum, s) => sum + parseFloat(s.monto_mensual || 0), 0);
      
      setStats({
        total: data.length,
        activas: activas,
        pendientes: pendientes,
        montoTotal: montoTotal
      });
    } catch (error) {
      toast.error('Error al cargar suscripciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoColor = (estado) => {
    const colores = {
      activo: 'success',
      pendiente: 'warning',
      pausado: 'warning',
      cancelado: 'danger',
      finalizado: 'secondary'
    };
    return colores[estado] || 'secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      activo: 'Activa',
      pendiente: 'Pendiente',
      pausado: 'Pausada',
      cancelado: 'Cancelada',
      finalizado: 'Finalizada'
    };
    return textos[estado] || estado;
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handlePausar = async (id) => {
    if (!window.confirm('¿Pausar esta suscripción?')) return;
    try {
      await suscripcionService.pausarSuscripcionEntity(id);
      toast.success('⏸️ Suscripción pausada');
      cargarSuscripciones();
    } catch (error) {
      toast.error(error.message || 'Error al pausar');
    }
  };

  const handleReactivar = async (id) => {
    if (!window.confirm('¿Reactivar esta suscripción?')) return;
    try {
      await suscripcionService.reactivarSuscripcionEntity(id);
      toast.success('▶️ Suscripción reactivada');
      cargarSuscripciones();
    } catch (error) {
      toast.error(error.message || 'Error al reactivar');
    }
  };

  const handleCancelar = async (id) => {
    if (!window.confirm('¿Cancelar esta suscripción? Esta acción no se puede deshacer.')) return;
    try {
      await suscripcionService.cancelarSuscripcionEntity(id);
      toast.success('🗑️ Suscripción cancelada');
      cargarSuscripciones();
    } catch (error) {
      toast.error(error.message || 'Error al cancelar');
    }
  };

  const suscripcionesFiltradas = suscripciones.filter(suscripcion => {
    if (filters.estado && suscripcion.estado !== filters.estado) return false;
    if (filters.frecuencia && suscripcion.frecuencia !== filters.frecuencia) return false;
    return true;
  });

  if (loading) return <div className="text-center p-5">Cargando suscripciones...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>📋 Suscripciones Recibidas</h1>
        <button 
          className="btn btn-success"
          onClick={() => {
            const url = `${window.location.origin}/suscripciones`;
            navigator.clipboard?.writeText(url);
            toast.info('📤 Link de suscripciones copiado al portapapeles');
          }}
        >
          📤 Compartir enlace de donación
        </button>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total</h5>
              <h2 className="mb-0">{stats.total}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Activas</h5>
              <h2 className="mb-0">{stats.activas}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">Pendientes</h5>
              <h2 className="mb-0">{stats.pendientes}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Monto Total</h5>
              <h2 className="mb-0">${stats.montoTotal.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label className="form-label">Filtrar por Estado</label>
              <select 
                name="estado" 
                className="form-control"
                value={filters.estado}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="pendiente">Pendiente</option>
                <option value="pausado">Pausado</option>
                <option value="cancelado">Cancelado</option>
                <option value="finalizado">Finalizado</option>
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Filtrar por Frecuencia</label>
              <select 
                name="frecuencia" 
                className="form-control"
                value={filters.frecuencia}
                onChange={handleFilterChange}
              >
                <option value="">Todas</option>
                <option value="unica">Única</option>
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="anual">Anual</option>
              </select>
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button 
                className="btn btn-secondary w-100"
                onClick={() => setFilters({ estado: '', frecuencia: '' })}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de suscripciones */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Mascota</th>
                  <th>Donante</th>
                  <th>Monto</th>
                  <th>Frecuencia</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suscripcionesFiltradas.map((suscripcion, index) => (
                  <tr key={suscripcion.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{suscripcion.mascota?.nombre || 'N/A'}</strong>
                      <br/>
                      <small className="text-muted">ID: {suscripcion.mascota_id}</small>
                    </td>
                    <td>
                      {suscripcion.user?.name || suscripcion.user?.nombre || `Usuario #${suscripcion.user_id}`}
                      <br/>
                      <small className="text-muted">{suscripcion.user?.email || ''}</small>
                    </td>
                    <td>${parseFloat(suscripcion.monto_mensual || 0).toLocaleString()}</td>
                    <td>
                      <span className="badge bg-info">
                        {suscripcion.frecuencia === 'unica' ? 'Única' :
                         suscripcion.frecuencia === 'mensual' ? 'Mensual' :
                         suscripcion.frecuencia === 'trimestral' ? 'Trimestral' : 'Anual'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${getEstadoColor(suscripcion.estado)}`}>
                        {getEstadoTexto(suscripcion.estado)}
                      </span>
                    </td>
                    <td>
                      {suscripcion.fecha_inicio ? new Date(suscripcion.fecha_inicio).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <Link 
                          to={`/fundacion/suscripciones/${suscripcion.id}`} 
                          className="btn btn-info"
                          title="Ver detalle"
                        >
                          👁️
                        </Link>
                        <Link 
                          to={`/fundacion/suscripciones/${suscripcion.id}/editar`} 
                          className="btn btn-warning"
                          title="Editar"
                        >
                          ✏️
                        </Link>
                        {suscripcion.estado === 'activo' && (
                          <button 
                            className="btn btn-warning"
                            onClick={() => handlePausar(suscripcion.id)}
                            title="Pausar"
                          >
                            ⏸️
                          </button>
                        )}
                        {suscripcion.estado === 'pausado' && (
                          <button 
                            className="btn btn-success"
                            onClick={() => handleReactivar(suscripcion.id)}
                            title="Reactivar"
                          >
                            ▶️
                          </button>
                        )}
                        {(suscripcion.estado === 'activo' || suscripcion.estado === 'pausado' || suscripcion.estado === 'pendiente') && (
                          <button 
                            className="btn btn-danger"
                            onClick={() => handleCancelar(suscripcion.id)}
                            title="Cancelar"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {suscripcionesFiltradas.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No hay suscripciones registradas</p>
              <p className="text-muted small">
                Los usuarios pueden apadrinar a tus mascotas desde el enlace de donación
              </p>
              <button 
                className="btn btn-success mt-2"
                onClick={() => {
                  const url = `${window.location.origin}/suscripciones`;
                  navigator.clipboard?.writeText(url);
                  toast.info('📤 Link copiado al portapapeles');
                }}
              >
                📤 Compartir enlace
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FundacionSuscripcionesIndex;