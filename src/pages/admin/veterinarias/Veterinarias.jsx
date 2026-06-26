import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import adminService from '../../../services/adminService';
import './Veterinarias.css';

const initialForm = {
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
  descripcion: '',
  estado: 'activo'
};

const normalizeVeterinaria = (vet = {}) => ({
  id: vet.id,
  nombre: vet.Nombre_vet || vet.nombre || vet.name || 'Sin nombre',
  email: vet.Email || vet.email || '-',
  telefono: vet.Telefono || vet.telefono || '-',
  direccion: vet.Direccion || vet.direccion || '-',
  descripcion: vet.descripcion || 'Sin descripción disponible.',
  estado: vet.estado || (vet.verificado ? 'activo' : 'inactivo'),
  raw: vet,
});

const VeterinariasAdmin = () => {
  const location = useLocation();
  const [veterinarias, setVeterinarias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [isCreating, setIsCreating] = useState(location.pathname.endsWith('/nueva'));
  const [submitting, setSubmitting] = useState(false);

  const loadVeterinarias = async () => {
    try {
      setLoading(true);
      const response = await adminService.getVeterinarias({
        search,
        estado: estadoFiltro,
        per_page: 50
      });

      const payload = response?.data?.data?.data
        ?? response?.data?.data
        ?? response?.data
        ?? response
        ?? [];

      const data = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : [];

      setVeterinarias(data.map(normalizeVeterinaria));
    } catch (error) {
      console.error('Error al cargar veterinarias:', error);
      toast.error('No se pudieron cargar las veterinarias');
      setVeterinarias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVeterinarias();
  }, [search, estadoFiltro]);

  useEffect(() => {
    setIsCreating(location.pathname.endsWith('/nueva'));
  }, [location.pathname]);

  const filteredVeterinarias = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return veterinarias;

    return veterinarias.filter((vet) => {
      const text = `${vet.nombre || ''} ${vet.email || ''} ${vet.direccion || ''}`.toLowerCase();
      return text.includes(term);
    });
  }, [veterinarias, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        direccion: form.direccion.trim(),
        telefono: form.telefono.trim(),
        descripcion: form.descripcion.trim()
      };

      if (!payload.nombre || !payload.email) {
        toast.warning('Nombre y correo son obligatorios');
        return;
      }

      await adminService.createVeterinaria(payload);
      toast.success('Veterinaria creada correctamente');
      setForm(initialForm);
      setIsCreating(false);
      await loadVeterinarias();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'No se pudo crear la veterinaria');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEstado = async (vet) => {
    const nextEstado = vet.estado === 'activo' ? 'inactivo' : 'activo';

    try {
      await adminService.updateVeterinaria(vet.id, {
        ...vet,
        estado: nextEstado
      });
      toast.success(`Estado actualizado a ${nextEstado}`);
      await loadVeterinarias();
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cambiar el estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Deseas eliminar esta veterinaria?')) return;

    try {
      await adminService.deleteVeterinaria(id);
      toast.success('Veterinaria eliminada');
      await loadVeterinarias();
      if (selected?.id === id) setSelected(null);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo eliminar la veterinaria');
    }
  };

  return (
    <div className="admin-veterinarias-page">
      <div className="admin-veterinarias-header">
        <div>
          <p className="eyebrow">Panel administrativo</p>
          <h1>Gestión de Veterinarias</h1>
        </div>
        <button
          className="btn-primary"
          onClick={() => setIsCreating((prev) => !prev)}
        >
          {isCreating ? 'Cancelar' : '+ Nueva veterinaria'}
        </button>
      </div>

      {isCreating && (
        <form className="veterinaria-form-card" onSubmit={handleSubmit}>
          <h2>{'Registrar veterinaria'}</h2>
          <div className="veterinaria-form-grid">
            <label>
              Nombre
              <input name="nombre" value={form.nombre} onChange={handleChange} required />
            </label>
            <label>
              Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>
              Teléfono
              <input name="telefono" value={form.telefono} onChange={handleChange} />
            </label>
            <label>
              Estado
              <select name="estado" value={form.estado} onChange={handleChange}>
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </label>
            <label className="full-width">
              Dirección
              <input name="direccion" value={form.direccion} onChange={handleChange} />
            </label>
            <label className="full-width">
              Descripción
              <textarea name="descripcion" rows="3" value={form.descripcion} onChange={handleChange} />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar veterinaria'}
            </button>
          </div>
        </form>
      )}

      <div className="admin-veterinarias-controls">
        <input
          className="search-input"
          placeholder="Buscar por nombre, email o dirección"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="activo">Activo</option>
          <option value="inactivo">Inactivo</option>
          <option value="pendiente">Pendiente</option>
        </select>
        <button className="btn-secondary" onClick={() => loadVeterinarias()}>Actualizar</button>
      </div>

      {loading ? (
        <div className="empty-state">Cargando veterinarias...</div>
      ) : filteredVeterinarias.length === 0 ? (
        <div className="empty-state">No hay veterinarias para mostrar.</div>
      ) : (
        <div className="veterinarias-table-wrap">
          <table className="veterinarias-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredVeterinarias.map((vet) => (
                <tr key={vet.id}>
                  <td>
                    <strong>{vet.nombre}</strong>
                    <div className="table-subtext">{vet.direccion}</div>
                  </td>
                  <td>{vet.email}</td>
                  <td>{vet.telefono}</td>
                  <td>
                    <span className={`estado-badge ${vet.estado}`}>
                      {vet.estado}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-action btn-view" onClick={() => setSelected(vet)}>
                        Ver
                      </button>
                      <button className="btn-action btn-toggle" onClick={() => handleToggleEstado(vet)}>
                        {vet.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      </button>
                      <button className="btn-action btn-delete" onClick={() => handleDelete(vet.id)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <div className="veterinaria-detail-card">
          <div className="veterinaria-detail-header">
            <div>
              <p className="eyebrow">Detalle</p>
              <h3>{selected.nombre}</h3>
            </div>
            <button className="btn-secondary" onClick={() => setSelected(null)}>Cerrar</button>
          </div>
          <div className="detail-grid">
            <div><strong>Email:</strong> {selected.email}</div>
            <div><strong>Teléfono:</strong> {selected.telefono}</div>
            <div><strong>Dirección:</strong> {selected.direccion}</div>
            <div><strong>Estado:</strong> {selected.estado}</div>
          </div>
          <p>{selected.descripcion}</p>
        </div>
      )}
    </div>
  );
};

export default VeterinariasAdmin;
