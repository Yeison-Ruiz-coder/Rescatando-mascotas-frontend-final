import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';

const VeterinariaSuscripcionesShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [suscripcion, setSuscripcion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarSuscripcion();
  }, [id]);

  const cargarSuscripcion = async () => {
    try {
      setLoading(true);
      const data = await suscripcionService.getVeterinariaSuscripcionById(id);
      setSuscripcion(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar la suscripción');
      navigate('/veterinaria/suscripciones');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!suscripcion) {
    return (
      <div className="text-center p-5">
        <h3>Suscripción no encontrada</h3>
        <Link to="/veterinaria/suscripciones" className="btn btn-primary mt-3">
          Volver
        </Link>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle de Suscripción</h1>
        <Link to="/veterinaria/suscripciones" className="btn btn-secondary">
          Volver
        </Link>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5>Mascota</h5>
            </div>
            <div className="card-body">
              <p><strong>Nombre:</strong> {suscripcion.mascota?.nombre}</p>
              <p><strong>Especie:</strong> {suscripcion.mascota?.especie}</p>
              <p><strong>Raza:</strong> {suscripcion.mascota?.raza}</p>
              <p><strong>Edad:</strong> {suscripcion.mascota?.edad} años</p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5>Donante</h5>
            </div>
            <div className="card-body">
              <p><strong>Nombre:</strong> {suscripcion.user?.name}</p>
              <p><strong>Email:</strong> {suscripcion.user?.email}</p>
              <p><strong>Monto:</strong> ${suscripcion.monto_mensual}</p>
              <p><strong>Estado:</strong> {suscripcion.estado}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VeterinariaSuscripcionesShow;