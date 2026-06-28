// src/pages/fundacion/suscripciones/SuscripcionesShow.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';
import './Suscripciones.css';

const FundacionSuscripcionesShow = () => {
  const { id } = useParams();
  const [suscripcion, setSuscripcion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarSuscripcion();
  }, [id]);

  const cargarSuscripcion = async () => {
    try {
      setLoading(true);
      const data = await suscripcionService.getEntitySuscripcionById(id);
      setSuscripcion(data);
    } catch (error) {
      toast.error('Error al cargar la suscripción');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      activo: { class: 'success', text: 'Activa' },
      pendiente: { class: 'warning', text: 'Pendiente' },
      pausado: { class: 'warning', text: 'Pausada' },
      cancelado: { class: 'danger', text: 'Cancelada' },
      finalizado: { class: 'secondary', text: 'Finalizada' }
    };
    const cfg = config[estado] || config.cancelado;
    return <span className={`badge bg-${cfg.class}`}>{cfg.text}</span>;
  };

  const getFrecuenciaTexto = (frecuencia) => {
    const textos = {
      unica: 'Pago único',
      mensual: 'Mensual',
      trimestral: 'Trimestral',
      anual: 'Anual'
    };
    return textos[frecuencia] || frecuencia;
  };

  if (loading) return <div className="text-center p-5">Cargando detalle...</div>;
  if (!suscripcion) return <div className="text-center p-5">Suscripción no encontrada</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>📋 Detalle de Suscripción #{suscripcion.id}</h1>
        <div>
          <Link 
            to={`/fundacion/suscripciones/${id}/editar`} 
            className="btn btn-warning me-2"
          >
            ✏️ Editar
          </Link>
          <Link to="/fundacion/suscripciones" className="btn btn-secondary">
            ⬅️ Volver
          </Link>
        </div>
      </div>

      <div className="row">
        {/* Información de la suscripción */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">📌 Información de la Suscripción</h5>
            </div>
            <div className="card-body">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <th width="40%">ID Suscripción:</th>
                    <td><strong>#{suscripcion.id}</strong></td>
                  </tr>
                  <tr>
                    <th>Estado:</th>
                    <td>{getEstadoBadge(suscripcion.estado)}</td>
                  </tr>
                  <tr>
                    <th>Monto Mensual:</th>
                    <td><strong>${parseFloat(suscripcion.monto_mensual || 0).toLocaleString()}</strong></td>
                  </tr>
                  <tr>
                    <th>Frecuencia:</th>
                    <td>{getFrecuenciaTexto(suscripcion.frecuencia)}</td>
                  </tr>
                  <tr>
                    <th>Fecha Inicio:</th>
                    <td>{suscripcion.fecha_inicio ? new Date(suscripcion.fecha_inicio).toLocaleDateString() : '-'}</td>
                  </tr>
                  {suscripcion.fecha_fin && (
                    <tr>
                      <th>Fecha Fin:</th>
                      <td>{new Date(suscripcion.fecha_fin).toLocaleDateString()}</td>
                    </tr>
                  )}
                  <tr>
                    <th>Fecha Creación:</th>
                    <td>{suscripcion.created_at ? new Date(suscripcion.created_at).toLocaleString() : '-'}</td>
                  </tr>
                  <tr>
                    <th>Es Demo:</th>
                    <td>{suscripcion.es_demo ? '✅ Sí' : '❌ No'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Información del donante */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">👤 Información del Donante</h5>
            </div>
            <div className="card-body">
              {suscripcion.user ? (
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th width="40%">Nombre:</th>
                      <td><strong>{suscripcion.user.name || suscripcion.user.nombre || 'N/A'}</strong></td>
                    </tr>
                    <tr>
                      <th>Email:</th>
                      <td><a href={`mailto:${suscripcion.user.email}`}>{suscripcion.user.email || 'N/A'}</a></td>
                    </tr>
                    {suscripcion.user.telefono && (
                      <tr>
                        <th>Teléfono:</th>
                        <td><a href={`tel:${suscripcion.user.telefono}`}>{suscripcion.user.telefono}</a></td>
                      </tr>
                    )}
                    <tr>
                      <th>ID Usuario:</th>
                      <td>#{suscripcion.user_id}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">Información del donante no disponible</p>
              )}
            </div>
          </div>
        </div>

        {/* Información de la mascota */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">🐾 Información de la Mascota</h5>
            </div>
            <div className="card-body">
              {suscripcion.mascota ? (
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th width="40%">Nombre:</th>
                      <td><strong>{suscripcion.mascota.nombre || 'N/A'}</strong></td>
                    </tr>
                    <tr>
                      <th>Especie:</th>
                      <td>{suscripcion.mascota.especie || 'N/A'}</td>
                    </tr>
                    {suscripcion.mascota.raza && (
                      <tr>
                        <th>Raza:</th>
                        <td>{suscripcion.mascota.raza}</td>
                      </tr>
                    )}
                    {suscripcion.mascota.edad && (
                      <tr>
                        <th>Edad:</th>
                        <td>{suscripcion.mascota.edad} años</td>
                      </tr>
                    )}
                    <tr>
                      <th>ID Mascota:</th>
                      <td>#{suscripcion.mascota_id}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="text-muted">Información de la mascota no disponible</p>
              )}
            </div>
          </div>
        </div>

        {/* Mensaje de apoyo */}
        {suscripcion.mensaje_apoyo && (
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">💬 Mensaje de Apoyo</h5>
              </div>
              <div className="card-body">
                <p className="mb-0">"{suscripcion.mensaje_apoyo}"</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundacionSuscripcionesShow;