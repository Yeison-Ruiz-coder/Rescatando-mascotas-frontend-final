// src/components/Suscripciones.jsx
import React, { useState, useEffect } from 'react';
import { suscripcionService } from '../../services/suscripcionService';
import SuscripcionForm from './SuscripcionForm';
import SuscripcionCard from './SuscripcionCard';
import './Suscripciones.css';

const Suscripciones = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSuscripcion, setEditingSuscripcion] = useState(null);

  // Cargar suscripciones al montar el componente
  useEffect(() => {
    cargarSuscripciones();
  }, []);

  const cargarSuscripciones = async () => {
    try {
      setLoading(true);
      const data = await suscripcionService.getAll();
      setSuscripciones(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar las suscripciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const result = await suscripcionService.create(formData);
      setSuscripciones([...suscripciones, result.data]);
      setShowForm(false);
      alert('Suscripción creada exitosamente');
    } catch (err) {
      console.error('Error al crear:', err);
      alert('Error al crear la suscripción');
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      const result = await suscripcionService.update(id, formData);
      setSuscripciones(suscripciones.map(s => 
        s.id === id ? result.data : s
      ));
      setEditingSuscripcion(null);
      alert('Suscripción actualizada exitosamente');
    } catch (err) {
      console.error('Error al actualizar:', err);
      alert('Error al actualizar la suscripción');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta suscripción?')) {
      try {
        await suscripcionService.delete(id);
        setSuscripciones(suscripciones.filter(s => s.id !== id));
        alert('Suscripción eliminada exitosamente');
      } catch (err) {
        console.error('Error al eliminar:', err);
        alert('Error al eliminar la suscripción');
      }
    }
  };

  if (loading) return <div className="loading">Cargando suscripciones...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="suscripciones-container">
      <div className="header">
        <h1>Gestión de Suscripciones</h1>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Nueva Suscripción
        </button>
      </div>

      {showForm && (
        <SuscripcionForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      )}

      {editingSuscripcion && (
        <SuscripcionForm
          initialData={editingSuscripcion}
          onSubmit={(data) => handleUpdate(editingSuscripcion.id, data)}
          onClose={() => setEditingSuscripcion(null)}
          isEditing={true}
        />
      )}

      <div className="suscripciones-grid">
        {suscripciones.map((suscripcion) => (
          <SuscripcionCard
            key={suscripcion.id}
            suscripcion={suscripcion}
            onEdit={() => setEditingSuscripcion(suscripcion)}
            onDelete={() => handleDelete(suscripcion.id)}
          />
        ))}
      </div>

      {suscripciones.length === 0 && (
        <div className="no-data">No hay suscripciones registradas</div>
      )}
    </div>
  );
};

export default Suscripciones;