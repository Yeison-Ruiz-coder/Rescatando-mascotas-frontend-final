// src/pages/veterinaria/suscripciones/SuscripcionesIndex.jsx
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
      // Endpoint específico para veterinaria (solo suscripciones de mascotas que atiende)
      const data = await suscripcionService.getVeterinariaSuscripciones();
      setSuscripciones(data);
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
    if (filters.busqueda) {
      const busquedaLower = filters.busqueda.toLowerCase();
      return (
        suscripcion.mascota?.nombre?.toLowerCase().includes(busquedaLower) ||
        suscripcion.user?.name?.toLowerCase().includes(busquedaLower)
      );
    }
    return true;
  });

  if (loading) return <div className="text-center p-5">Cargando suscripciones...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Suscripciones de Pacientes</h1>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <label className="form-label">Buscar</label>
              <input
                type="text"
                name="busqueda"
                className="form-control"
                placeholder="Buscar por mascota o donante..."
                value={filters.busqueda}
                onChange={handleFilterChange}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Estado</label>
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
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Mascota</th>
                  <th>Donante</th>
                  <th>Monto</th>
                  <th>Estado</th>
                  <th>Inicio</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {suscripcionesFiltradas.map(suscripcion => (
                  <tr key={suscripcion.id}>
                    <td>
                      <strong>{suscripcion.mascota?.nombre}</strong>
                      <br/>
                      <small className="text-muted">
                        {suscripcion.mascota?.especie} - {suscripcion.mascota?.raza}
                      </small>
                    </td>
                    <td>{suscripcion.user?.name || `Usuario #${suscripcion.user_id}`}</td>
                    <td>${suscripcion.monto_mensual}</td>
                    <td>
                      <span className={`badge bg-${
                        suscripcion.estado === 'activo' ? 'success' :
                        suscripcion.estado === 'pausado' ? 'warning' : 'danger'
                      }`}>
                        {suscripcion.estado}
                      </span>
                    </td>
                    <td>{new Date(suscripcion.fecha_inicio).toLocaleDateString()}</td>
                    <td>
                      <Link 
                        to={`/veterinaria/suscripciones/${suscripcion.id}`} 
                        className="btn btn-sm btn-info"
                      >
                        Ver Detalle
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VeterinariaSuscripcionesIndex;