// src/pages/fundacion/suscripciones/SuscripcionesCreate.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';

const FundacionSuscripcionesCreate = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mascotas, setMascotas] = useState([]);
  const [loadingMascotas, setLoadingMascotas] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    mascota_id: '',
    monto_mensual: '',
    frecuencia: 'mensual',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    mensaje_apoyo: '',
    estado: 'activo'
  });

  useEffect(() => {
    cargarMascotas();
  }, []);

  const cargarMascotas = async () => {
    try {
      setLoadingMascotas(true);
      // Endpoint para obtener mascotas de la fundación
      const response = await suscripcionService.getMascotasFundacion();
      setMascotas(response);
    } catch (error) {
      toast.error('Error al cargar mascotas');
      console.error(error);
    } finally {
      setLoadingMascotas(false);
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
    
    // Validaciones
    if (!formData.mascota_id) {
      toast.error('Debes seleccionar una mascota');
      return;
    }
    
    if (formData.monto_mensual <= 0) {
      toast.error('El monto debe ser mayor a 0');
      return;
    }
    
    setLoading(true);
    
    try {
      await suscripcionService.createFundacionSuscripcion(formData);
      toast.success('Suscripción creada exitosamente');
      navigate('/fundacion/suscripciones');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear la suscripción');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingMascotas) return <div className="text-center p-5">Cargando mascotas...</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Crear Nueva Suscripción</h1>
        <Link to="/fundacion/suscripciones" className="btn btn-secondary">
          Volver
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Información de la Suscripción</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Mascota *</label>
                <select
                  name="mascota_id"
                  className="form-control"
                  value={formData.mascota_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecciona una mascota</option>
                  {mascotas.map(mascota => (
                    <option key={mascota.id} value={mascota.id}>
                      {mascota.nombre} - {mascota.especie} ({mascota.raza})
                    </option>
                  ))}
                </select>
                <small className="text-muted">
                  La suscripción se asociará a esta mascota
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Monto Mensual *</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    step="0.01"
                    name="monto_mensual"
                    className="form-control"
                    placeholder="Ej: 15000"
                    value={formData.monto_mensual}
                    onChange={handleChange}
                    required
                  />
                </div>
                <small className="text-muted">
                  Monto sugerido mínimo: $5,000
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Frecuencia de Pago *</label>
                <select
                  name="frecuencia"
                  className="form-control"
                  value={formData.frecuencia}
                  onChange={handleChange}
                  required
                >
                  <option value="unica">Única (Pago único)</option>
                  <option value="mensual">Mensual</option>
                  <option value="trimestral">Trimestral (Cada 3 meses)</option>
                  <option value="anual">Anual</option>
                </select>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Fecha de Inicio *</label>
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
                <label className="form-label">Fecha de Finalización (Opcional)</label>
                <input
                  type="date"
                  name="fecha_fin"
                  className="form-control"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                />
                <small className="text-muted">
                  Dejar en blanco para suscripción indefinida
                </small>
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Estado Inicial *</label>
                <select
                  name="estado"
                  className="form-control"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                >
                  <option value="activo">Activo (Comenzar inmediatamente)</option>
                  <option value="pausado">Pausado (Iniciar después)</option>
                </select>
              </div>

              <div className="col-12 mb-3">
                <label className="form-label">Mensaje de Agradecimiento</label>
                <textarea
                  name="mensaje_apoyo"
                  className="form-control"
                  rows="3"
                  placeholder="Mensaje personalizado para el donante..."
                  value={formData.mensaje_apoyo}
                  onChange={handleChange}
                />
                <small className="text-muted">
                  Este mensaje será visible para el donante
                </small>
              </div>
            </div>

            {/* Resumen */}
            <div className="alert alert-info mt-3">
              <h6>Resumen de la Suscripción:</h6>
              <ul className="mb-0">
                <li>💰 <strong>Monto:</strong> ${formData.monto_mensual || 0}</li>
                <li>🔄 <strong>Frecuencia:</strong> {
                  formData.frecuencia === 'unica' ? 'Pago único' :
                  formData.frecuencia === 'mensual' ? 'Mensual' :
                  formData.frecuencia === 'trimestral' ? 'Trimestral' : 'Anual'
                }</li>
                <li>📅 <strong>Inicio:</strong> {formData.fecha_inicio || 'No seleccionada'}</li>
              </ul>
            </div>

            <div className="mt-4">
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creando suscripción...' : 'Crear Suscripción'}
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
  );
};

export default FundacionSuscripcionesCreate;