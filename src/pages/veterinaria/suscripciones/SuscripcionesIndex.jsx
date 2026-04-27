import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';

const VeterinariaSuscripcionesIndex = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    estado: '',
    busqueda: ''
  });

  useEffect(() => {
    cargarSuscripciones();
  }, []);

  const cargarSuscripciones = async () => {
    try {
      setLoading(true);
      const data = await suscripcionService.getVeterinariaSuscripciones();
      setSuscripciones(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las suscripciones');
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
    if (filters.busqueda) {
      const busquedaLower = filters.busqueda.toLowerCase();
      return (
        (suscripcion.mascota?.nombre || '').toLowerCase().includes(busquedaLower) ||
        (suscripcion.user?.name || '').toLowerCase().includes(busquedaLower)
      );
    }
    return true;
  });

  const getEstadoBadge = (estado) => {
    const config = {
      activo: { class: 'success', text: 'Activo' },
      pausado: { class: 'warning', text: 'Pausado' },
      cancelado: { class: 'danger', text: 'Cancelado' },
      finalizado: { class: 'secondary', text: 'Finalizado' }
    };
    const cfg = config[estado] || config.cancelado;
    return <span className={`badge bg-${cfg.class}`}>{cfg.text}</span>;
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando suscripciones...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="mb-1">Suscripciones de Pacientes</h1>
          <p className="text-muted mb-0">
            Visualiza las suscripciones activas de los pacientes que atiendes
          </p>
        </div>
        <div className="text-muted">
          Total: {suscripcionesFiltradas.length} suscripciones
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Buscar</label>
              <input
                type="text"
                name="busqueda"
                className="form-control"
                placeholder="Buscar por mascota o dueño..."
                value={filters.busqueda}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Estado</label>
              <select
                name="estado"
                className="form-select"
                value={filters.estado}
                onChange={handleFilterChange}
              >
                <option value="">Todos</option>
                <option value="activo">Activo</option>
                <option value="pausado">Pausado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-secondary w-100"
                onClick={() => setFilters({ estado: '', busqueda: '' })}
              >
                Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {suscripcionesFiltradas.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No hay suscripciones registradas</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Mascota</th>
                    <th>Dueño</th>
                    <th>Monto</th>
                    <th>Estado</th>
                    <th>Inicio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {suscripcionesFiltradas.map((suscripcion) => (
                    <tr key={suscripcion.id}>
                      <td>
                        <strong>{suscripcion.mascota?.nombre || 'N/A'}</strong>
                        <br />
                        <small className="text-muted">
                          {suscripcion.mascota?.especie || ''}
                        </small>
                      </td>
                      <td>{suscripcion.user?.name || `Usuario #${suscripcion.user_id}`}</td>
                      <td>${parseFloat(suscripcion.monto_mensual).toLocaleString()}</td>
                      <td>{getEstadoBadge(suscripcion.estado)}</td>
                      <td>{new Date(suscripcion.fecha_inicio).toLocaleDateString()}</td>
                      <td>
                        <Link
                          to={`/veterinaria/suscripciones/${suscripcion.id}`}
                          className="btn btn-sm btn-outline-info"
                        >
                          Ver
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VeterinariaSuscripcionesIndex;