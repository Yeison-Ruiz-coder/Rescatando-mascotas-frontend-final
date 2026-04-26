// src/pages/fundacion/suscripciones/SuscripcionesIndex.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';

const FundacionSuscripcionesIndex = () => {
  const { user } = useAuth();
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: '',
    frecuencia: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    activas: 0,
    montoTotal: 0
  });

  useEffect(() => {
    cargarSuscripciones();
  }, []);

  const cargarSuscripciones = async () => {
    try {
      setLoading(true);
      // Endpoint específico para fundación (solo sus propias mascotas)
      const data = await suscripcionService.getFundacionSuscripciones();
      setSuscripciones(data);
      
      // Calcular estadísticas
      const activas = data.filter(s => s.estado === 'activo').length;
      const montoTotal = data.reduce((sum, s) => sum + parseFloat(s.monto_mensual), 0);
      
      setStats({
        total: data.length,
        activas: activas,
        montoTotal: montoTotal
      });
    } catch (error) {
      toast.error('Error al cargar suscripciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const suscripcionesFiltradas = suscripciones.filter(suscripcion => {
    if (filters.estado && suscripcion.estado !== filters.estado) return false;
    if (filters.frecuencia && suscripcion.frecuencia !== filters.frecuencia) return false;
    return true;
  });

  const getEstadoColor = (estado) => {
    const colores = {
      activo: 'success',
      pausado: 'warning',
      cancelado: 'danger',
      finalizado: 'secondary'
    };
    return colores[estado] || 'secondary';
  };

  if (loading) return <div className="text-center p-5">Cargando suscripciones...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Suscripciones de Mis Mascotas</h1>
        <Link to="/fundacion/suscripciones/crear" className="btn btn-primary">
          + Nueva Suscripción
        </Link>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Total Suscripciones</h5>
              <h2 className="mb-0">{stats.total}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Suscripciones Activas</h5>
              <h2 className="mb-0">{stats.activas}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Monto Total Mensual</h5>
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
                  <th>ID</th>
                  <th>Mascota</th>
                  <th>Donante</th>
                  <th>Monto</th>
                  <th>Frecuencia</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Próximo Pago</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suscripcionesFiltradas.map(suscripcion => (
                  <tr key={suscripcion.id}>
                    <td>{suscripcion.id}</td>
                    <td>
                      <strong>{suscripcion.mascota?.nombre}</strong>
                      <br/>
                      <small className="text-muted">ID: {suscripcion.mascota_id}</small>
                    </td>
                    <td>{suscripcion.user?.name || `Usuario #${suscripcion.user_id}`}</td>
                    <td>${parseFloat(suscripcion.monto_mensual).toLocaleString()}</td>
                    <td>
                      <span className="badge bg-info">
                        {suscripcion.frecuencia === 'unica' ? 'Única' :
                         suscripcion.frecuencia === 'mensual' ? 'Mensual' :
                         suscripcion.frecuencia === 'trimestral' ? 'Trimestral' : 'Anual'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge bg-${getEstadoColor(suscripcion.estado)}`}>
                        {suscripcion.estado}
                      </span>
                    </td>
                    <td>{new Date(suscripcion.fecha_inicio).toLocaleDateString()}</td>
                    <td>
                      {suscripcion.estado === 'activo' && (
                        <span className="text-success">
                          {calcularProximoPago(suscripcion.fecha_inicio, suscripcion.frecuencia)}
                        </span>
                      )}
                    </td>
                    <td>
                      <Link 
                        to={`/fundacion/suscripciones/${suscripcion.id}`} 
                        className="btn btn-sm btn-info me-1"
                        title="Ver detalle"
                      >
                        👁️
                      </Link>
                      <Link 
                        to={`/fundacion/suscripciones/${suscripcion.id}/editar`} 
                        className="btn btn-sm btn-warning me-1"
                        title="Editar"
                      >
                        ✏️
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {suscripcionesFiltradas.length === 0 && (
            <div className="text-center py-5">
              <p className="text-muted">No hay suscripciones registradas</p>
              <Link to="/fundacion/suscripciones/crear" className="btn btn-primary">
                Crear primera suscripción
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Función auxiliar para calcular próximo pago
const calcularProximoPago = (fechaInicio, frecuencia) => {
  const inicio = new Date(fechaInicio);
  const hoy = new Date();
  let proximo = new Date(inicio);
  
  while (proximo <= hoy) {
    switch(frecuencia) {
      case 'mensual':
        proximo.setMonth(proximo.getMonth() + 1);
        break;
      case 'trimestral':
        proximo.setMonth(proximo.getMonth() + 3);
        break;
      case 'anual':
        proximo.setFullYear(proximo.getFullYear() + 1);
        break;
      default:
        return 'N/A';
    }
  }
  
  return proximo.toLocaleDateString();
};

export default FundacionSuscripcionesIndex;