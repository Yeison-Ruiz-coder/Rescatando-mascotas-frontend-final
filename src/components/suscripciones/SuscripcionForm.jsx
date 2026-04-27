// src/components/SuscripcionForm.jsx
import React, { useState, useEffect } from 'react';

const SuscripcionForm = ({ initialData, onSubmit, onClose, isEditing = false }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    mascota_id: '',
    monto_mensual: '',
    frecuencia: 'mensual',
    fecha_inicio: '',
    fecha_fin: '',
    mensaje_apoyo: '',
    estado: 'activo'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        user_id: initialData.user_id || '',
        mascota_id: initialData.mascota_id || '',
        monto_mensual: initialData.monto_mensual || '',
        frecuencia: initialData.frecuencia || 'mensual',
        fecha_inicio: initialData.fecha_inicio?.split('T')[0] || '',
        fecha_fin: initialData.fecha_fin?.split('T')[0] || '',
        mensaje_apoyo: initialData.mensaje_apoyo || '',
        estado: initialData.estado || 'activo'
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Suscripción' : 'Nueva Suscripción'}</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Usuario ID:</label>
            <input
              type="number"
              name="user_id"
              value={formData.user_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Mascota ID:</label>
            <input
              type="number"
              name="mascota_id"
              value={formData.mascota_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Monto Mensual:</label>
            <input
              type="number"
              name="monto_mensual"
              value={formData.monto_mensual}
              onChange={handleChange}
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Frecuencia:</label>
            <select
              name="frecuencia"
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

          <div className="form-group">
            <label>Fecha Inicio:</label>
            <input
              type="date"
              name="fecha_inicio"
              value={formData.fecha_inicio}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Fecha Fin (opcional):</label>
            <input
              type="date"
              name="fecha_fin"
              value={formData.fecha_fin}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Mensaje de Apoyo:</label>
            <textarea
              name="mensaje_apoyo"
              value={formData.mensaje_apoyo}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Estado:</label>
            <select
              name="estado"
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

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuscripcionForm;