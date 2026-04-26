// src/pages/fundacion/suscripciones/SuscripcionesEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';

const FundacionSuscripcionesEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    monto_mensual: '',
    frecuencia: '',
    fecha_inicio: '',
    fecha_fin: '',
    mensaje_apoyo: '',
    estado: ''
  });

  useEffect(() => {
    cargarSuscripcion();
  }, [id]);

  const cargarSuscripcion = async () => {
    try {
      setLoading(true);
      const data = await suscripcionService.getFundacionSuscripcionById(id);
      setFormData({
        monto_mensual: data.monto_mensual,
        frecuencia: data.frecuencia,
        fecha_inicio: data.fecha_inicio.split('T')[0],
        fecha_fin: data.fecha_fin ? data.fecha_fin.split('T')[0] : '',
        mensaje_apoyo: data.mensaje_apoyo || '',
        estado: data.estado
      });
    } catch (error) {
      toast.error('Error al cargar la suscripción');
      navigate('/fundacion/suscripciones');
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
      await suscripcionService.updateFundacionSuscripcion(id, formData);
      toast.success('Suscripción actualizada exitosamente');
      navigate('/fundacion/suscripciones');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al actualizar');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePausar = async () => {
    if (window.confirm('¿Pausar esta suscripción?')) {
      try {
        await suscripcionService.pausarSuscripcion(id);
        toast.success('Suscripción pausada');
        cargarSuscripcion();
      } catch (error) {
        toast.error('Error al pausar');
      }
    }
  };

  const handleReactivar = async () => {
    if (window.confirm('¿Reactivar esta suscripción?')) {
      try {
        await suscripcionService.reactivarSuscripcion(id);
        toast.success('Suscripción reactivada');
        cargarSuscripcion();
      } catch (error) {
        toast.error('Error al reactivar');
      }
    }
  };

  if (loading) return <div className="text-center p-5">Cargando...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Editar Suscripción #{id}</h1>
        <Link to="/fundacion/suscripciones" className="btn btn-secondary">
          Volver
        </Link>
      </div>

      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Datos de la Suscripción</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
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

                <div className="mb-3">
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

                <div className="mb-3">
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

                <div className="mb-3">
                  <label className="form-label">Fecha Fin</label>
                  <input
                    type="date"
                    name="fecha_fin"
                    className="form-control"
                    value={formData.fecha_fin}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Mensaje de Apoyo</label>
                  <textarea
                    name="mensaje_apoyo"
                    className="form-control"
                    rows="3"
                    value={formData.mensaje_apoyo}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
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

                <div className="mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                  <Link 
                    to="/fundacion/suscripciones" 
                    className="btn btn-secondary ms-2"
                  >
                    Cancelar
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Acciones Rápidas</h5>
            </div>
            <div className="card-body">
              {formData.estado === 'activo' ? (
                <button 
                  onClick={handlePausar}
                  className="btn btn-warning w-100 mb-2"
                >
                  ⏸️ Pausar Suscripción
                </button>
              ) : formData.estado === 'pausado' && (
                <button 
                  onClick={handleReactivar}
                  className="btn btn-success w-100 mb-2"
                >
                  ▶️ Reactivar Suscripción
                </button>
              )}
              
              <button 
                className="btn btn-info w-100"
                onClick={() => window.print()}
              >
                🖨️ Imprimir Detalle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundacionSuscripcionesEdit;