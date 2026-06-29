// src/pages/admin/suscripciones/SuscripcionesShow.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';

const AdminSuscripcionesShow = () => {
  const { id } = useParams();
  const [suscripcion, setSuscripcion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarSuscripcion();
  }, [id]);

  const cargarSuscripcion = async () => {
    try {
      setLoading(true);
      const response = await suscripcionService.getById(id);
      
      // ✅ Extraer los datos correctamente
      let data = response;
      if (response?.data) {
        data = response.data;
      }
      
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

  const getBadgeColor = (estado) => {
    const colores = {
      'activo': 'success',
      'pendiente': 'warning',
      'pausado': 'warning',
      'inactivo': 'secondary',
      'cancelado': 'danger',
      'finalizado': 'secondary'
    };
    return colores[estado?.toLowerCase()] || 'secondary';
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle de Suscripción #{suscripcion.id}</h1>
        <div>
          <Link to="/admin/suscripciones" className="btn btn-secondary">
            ← Volver
          </Link>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5>Información General</h5>
            </div>
            <div className="card-body">
              <p><strong>ID:</strong> {suscripcion.id}</p>
              <p><strong>Usuario:</strong> {suscripcion.user?.name || suscripcion.usuario?.name || `ID: ${suscripcion.user_id}`}</p>
              <p><strong>Email:</strong> {suscripcion.user?.email || suscripcion.usuario?.email || 'N/A'}</p>
              <p><strong>Mascota:</strong> {suscripcion.mascota?.nombre_mascota || suscripcion.mascota?.nombre || `ID: ${suscripcion.mascota_id}`}</p>
              <p><strong>Monto Mensual:</strong> ${suscripcion.monto_mensual}</p>
              <p><strong>Frecuencia:</strong> {suscripcion.frecuencia}</p>
              <p><strong>Estado:</strong> 
                <span className={`badge bg-${getBadgeColor(suscripcion.estado)} ms-2`}>
                  {suscripcion.estado}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5>Fechas</h5>
            </div>
            <div className="card-body">
              <p><strong>Fecha Inicio:</strong> {suscripcion.fecha_inicio ? new Date(suscripcion.fecha_inicio).toLocaleDateString() : 'N/A'}</p>
              {suscripcion.fecha_fin && (
                <p><strong>Fecha Fin:</strong> {new Date(suscripcion.fecha_fin).toLocaleDateString()}</p>
              )}
              <p><strong>Creado:</strong> {suscripcion.created_at ? new Date(suscripcion.created_at).toLocaleString() : 'N/A'}</p>
              <p><strong>Actualizado:</strong> {suscripcion.updated_at ? new Date(suscripcion.updated_at).toLocaleString() : 'N/A'}</p>
            </div>
          </div>

          {suscripcion.mensaje_apoyo && (
            <div className="card">
              <div className="card-header">
                <h5>💬 Mensaje de Apoyo</h5>
              </div>
              <div className="card-body">
                <p className="fst-italic">"{suscripcion.mensaje_apoyo}"</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSuscripcionesShow;