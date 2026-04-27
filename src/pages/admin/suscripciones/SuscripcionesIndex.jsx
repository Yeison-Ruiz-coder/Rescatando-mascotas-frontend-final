// src/pages/admin/suscripciones/SuscripcionesIndex.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';

const AdminSuscripcionesIndex = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
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
      const data = await suscripcionService.getAll();
      setSuscripciones(data);
    } catch (error) {
      toast.error('Error al cargar suscripciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta suscripción?')) {
      try {
        await suscripcionService.delete(id);
        toast.success('Suscripción eliminada');
        cargarSuscripciones();
      } catch (error) {
        toast.error('Error al eliminar');
      }
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

  if (loading) return <div className="text-center p-5">Cargando...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestión de Suscripciones</h1>
        <Link to="/admin/suscripciones/crear" className="btn btn-primary">
          + Nueva Suscripción
        </Link>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              <label>Estado</label>
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
              <label>Frecuencia</label>
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
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Mascota</th>
              <th>Monto</th>
              <th>Frecuencia</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {suscripcionesFiltradas.map(suscripcion => (
              <tr key={suscripcion.id}>
                <td>{suscripcion.id}</td>
                <td>{suscripcion.user?.name || `ID: ${suscripcion.user_id}`}</td>
                <td>{suscripcion.mascota?.nombre || `ID: ${suscripcion.mascota_id}`}</td>
                <td>${suscripcion.monto_mensual}</td>
                <td>
                  <span className="badge bg-info">
                    {suscripcion.frecuencia}
                  </span>
                </td>
                <td>
                  <span className={`badge bg-${
                    suscripcion.estado === 'activo' ? 'success' :
                    suscripcion.estado === 'pausado' ? 'warning' :
                    suscripcion.estado === 'cancelado' ? 'danger' : 'secondary'
                  }`}>
                    {suscripcion.estado}
                  </span>
                </td>
                <td>{new Date(suscripcion.fecha_inicio).toLocaleDateString()}</td>
                <td>
                  <Link 
                    to={`/admin/suscripciones/${suscripcion.id}`} 
                    className="btn btn-sm btn-info me-2"
                  >
                    Ver
                  </Link>
                  <Link 
                    to={`/admin/suscripciones/${suscripcion.id}/editar`} 
                    className="btn btn-sm btn-warning me-2"
                  >
                    Editar
                  </Link>
                  <button 
                    onClick={() => handleDelete(suscripcion.id)} 
                    className="btn btn-sm btn-danger"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSuscripcionesIndex;