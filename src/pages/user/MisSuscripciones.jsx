// src/pages/user/MisSuscripciones.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { suscripcionService } from '../../services/suscripcionService';
import { toast } from 'react-toastify';

const UserSuscripciones = () => {
  const [suscripciones, setSuscripciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarMisSuscripciones();
  }, []);

  const cargarMisSuscripciones = async () => {
    try {
      setLoading(true);
      const response = await suscripcionService.getUserSuscripciones();
      
      // Manejar la respuesta correctamente
      let suscripcionesData = [];
      if (response?.data) {
        suscripcionesData = response.data;
      } else if (Array.isArray(response)) {
        suscripcionesData = response;
      }
      
      setSuscripciones(suscripcionesData);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar tus suscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = async (id) => {
    if (window.confirm('¿Estás seguro de cancelar esta suscripción?')) {
      try {
        await suscripcionService.cancelUserSuscripcion(id);
        toast.success('Suscripción cancelada');
        cargarMisSuscripciones();
      } catch (error) {
        toast.error('Error al cancelar');
      }
    }
  };

  if (loading) return <div className="text-center p-5">Cargando...</div>;

  return (
    <div className="container p-4">
      <h1>Mis Suscripciones</h1>
      
      {suscripciones.length === 0 ? (
        <div className="text-center p-5">
          <p>No tienes suscripciones activas</p>
          <Link to="/suscripciones" className="btn btn-primary">
            Ver planes de membresía
          </Link>
        </div>
      ) : (
        <div className="row">
          {suscripciones.map(suscripcion => (
            <div key={suscripcion.id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">
                    {suscripcion.mascota ? 
                      `Apadrinando a ${suscripcion.mascota.nombre}` : 
                      'Membresía General'}
                  </h5>
                  <p><strong>Monto:</strong> ${suscripcion.monto_mensual}/mes</p>
                  <p><strong>Estado:</strong> 
                    <span className={`badge bg-${suscripcion.estado === 'activo' ? 'success' : 'danger'}`}>
                      {suscripcion.estado}
                    </span>
                  </p>
                  <p><strong>Desde:</strong> {new Date(suscripcion.fecha_inicio).toLocaleDateString()}</p>
                  
                  {suscripcion.estado === 'activo' && (
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancelar(suscripcion.id)}
                    >
                      Cancelar Suscripción
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserSuscripciones;  // ← IMPORTANTE: exporta con este nombre