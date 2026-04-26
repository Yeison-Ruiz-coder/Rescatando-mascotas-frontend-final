// src/pages/admin/suscripciones/SuscripcionesEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';

const AdminSuscripcionesEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_id: '',
    mascota_id: '',
    monto_mensual: '',
    frecuencia: '',
    fecha_inicio: '',
    fecha_fin: '',
    mensaje_apoyo: '',
    estado: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cargarSuscripcion();
  }, [id]);

  const cargarSuscripcion = async () => {
    try {
      setLoading(true);
      const data = await suscripcionService.getById(id);
      setFormData({
        user_id: data.user_id,
        mascota_id: data.mascota_id,
        monto_mensual: data.monto_mensual,
        frecuencia: data.frecuencia,
        fecha_inicio: data.fecha_inicio.split('T')[0],
        fecha_fin: data.fecha_fin ? data.fecha_fin.split('T')[0] : '',
        mensaje_apoyo: data.mensaje_apoyo || '',
        estado: data.estado
      });
    } catch (error) {
      toast.error('Error al cargar la suscripción');
      navigate('/admin/suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await suscripcionService.update(id, formData);
      toast.success('Suscripción actualizada exitosamente');
      navigate('/admin/suscripciones');
    } catch (error) {
      toast.error('Error al actualizar la suscripción');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-5">Cargando...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Editar Suscripción #{id}</h1>
        <Link to="/admin/suscripciones" className="btn btn-secondary">
          Volver
        </Link>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Usuario ID *</label>
                <input
                  type="number"
                  name="user_id"
                  className="form-control"
                  value={formData.user_id}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Mascota ID *</label>
                <input
                  type="number"
                  name="mascota_id"
                  className="form-control"
                  value={formData.mascota_id}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Monto Mensual *</label>
                <input
                  type="number"
                  step="0.01"
                  name="monto_mensual"
                  className="form-control"
                  value={formData.monto_mensual}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Frecuencia *</label>
                <select
                  name="frecuencia"
                  className="form-control"
                  value={formData.frecuencia}
                  onChange={handleChange}
                  required
                >
                  <option value="unica">Única</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Fecha Inicio *</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  className="form-control"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Fecha Fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  className="form-control"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                />
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Mensaje de Apoyo</label>
                <textarea
                  name="mensaje_apoyo"
                  className="form-control"
                  rows="3"
                  value={formData.mensaje_apoyo}
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Estado *</label>
                <select
                  name="estado"
                  className="form-control"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                >
                  <option value="activo">Activo</option>
                  <option value="pausado">Pausado</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="finalizado">Finalizado</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Guardando...' : 'Actualizar Suscripción'}
              </button>
              <Link 
                to="/admin/suscripciones" 
                className="btn btn-secondary ms-2"
              >
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSuscripcionesEdit;