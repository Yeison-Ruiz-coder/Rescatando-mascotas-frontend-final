// src/pages/veterinaria/suscripciones/SuscripcionesShow.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';

const VeterinariaSuscripcionesShow = () => {
  const { id } = useParams();
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
      toast.error('Error al cargar la suscripción');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-5">Cargando...</div>;
  if (!suscripcion) return <div className="text-center p-5">No encontrada</div>;

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
              <h5>Información de la Mascota</h5>
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
              <h5>Información del Donante</h5>
            </div>
            <div className="card-body">
              <p><strong>Nombre:</strong> {suscripcion.user?.name}</p>
              <p><strong>Email:</strong> {suscripcion.user?.email}</p>
              <p><strong>Monto:</strong> ${suscripcion.monto_mensual}</p>
              <p><strong>Estado:</strong> 
                <span className={`badge ms-2 bg-${
                  suscripcion.estado === 'activo' ? 'success' :
                  suscripcion.estado === 'pausado' ? 'warning' : 'danger'
                }`}>
                  {suscripcion.estado}
                </span>
              </p>
            </div>
          </div>
        </div>

        {suscripcion.mensaje_apoyo && (
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5>Mensaje de Apoyo</h5>
              </div>
              <div className="card-body">
                <p>{suscripcion.mensaje_apoyo}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VeterinariaSuscripcionesShow;