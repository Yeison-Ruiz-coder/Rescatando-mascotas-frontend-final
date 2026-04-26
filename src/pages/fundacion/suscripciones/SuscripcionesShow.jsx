// src/pages/fundacion/suscripciones/SuscripcionesShow.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { suscripcionService } from '../../../services/suscripcionService';
import { toast } from 'react-toastify';

const FundacionSuscripcionesShow = () => {
  const { id } = useParams();
  const [suscripcion, setSuscripcion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historialPagos, setHistorialPagos] = useState([]);

  useEffect(() => {
    cargarSuscripcion();
    cargarHistorialPagos();
  }, [id]);

  const cargarSuscripcion = async () => {
    try {
      setLoading(true);
      const data = await suscripcionService.getFundacionSuscripcionById(id);
      setSuscripcion(data);
    } catch (error) {
      toast.error('Error al cargar la suscripción');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const cargarHistorialPagos = async () => {
    try {
      const data = await suscripcionService.getHistorialPagos(id);
      setHistorialPagos(data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      activo: { class: 'success', text: 'Activo' },
      pausado: { class: 'warning', text: 'Pausado' },
      cancelado: { class: 'danger', text: 'Cancelado' },
      finalizado: { class: 'secondary', text: 'Finalizado' }
    };
    const cfg = config[estado] || config.cancelado;
    return <span className={`badge bg-${cfg.class}`}>{cfg.text}</span>;
  };

  if (loading) return <div className="text-center p-5">Cargando detalle...</div>;
  if (!suscripcion) return <div className="text-center p-5">Suscripción no encontrada</div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Detalle de Suscripción #{suscripcion.id}</h1>
        <div>
          <Link 
            to={`/fundacion/suscripciones/${id}/editar`} 
            className="btn btn-warning me-2"
          >
            Editar Suscripción
          </Link>
          <Link to="/fundacion/suscripciones" className="btn btn-secondary">
            Volver
          </Link>
        </div>
      </div>

      <div className="row">
        {/* Información de la suscripción */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Información de la Suscripción</h5>
            </div>
            <div className="card-body">
              <table className="table table-borderless">
                <tbody>
                  <tr>
                    <th width="40%">ID Suscripción:</th>
                    <td>#{suscripcion.id}</td>
                  </tr>
                  <tr>
                    <th>Estado:</th>
                    <td>{getEstadoBadge(suscripcion.estado)}</td>
                  </tr>
                  <tr>
                    <th>Monto Mensual:</th>
                    <td><strong>${parseFloat(suscripcion.monto_mensual).toLocaleString()}</strong></td>
                  </tr>
                  <tr>
                    <th>Frecuencia:</th>
                    <td>
                      {suscripcion.frecuencia === 'unica' ? 'Pago único' :
                       suscripcion.frecuencia === 'mensual' ? 'Mensual' :
                       suscripcion.frecuencia === 'trimestral' ? 'Trimestral' : 'Anual'}
                    </td>
                  </tr>
                  <tr>
                    <th>Fecha Inicio:</th>
                    <td>{new Date(suscripcion.fecha_inicio).toLocaleDateString()}</td>
                  </tr>
                  {suscripcion.fecha_fin && (
                    <tr>
                      <th>Fecha Fin:</th>
                      <td>{new Date(suscripcion.fecha_fin).toLocaleDateString()}</td>
                    </tr>
                  )}
                  <tr>
                    <th>Fecha Creación:</th>
                    <td>{new Date(suscripcion.created_at).toLocaleString()}</td>
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
              <h5 className="mb-0">Información del Donante</h5>
            </div>
            <div className="card-body">
              {suscripcion.user ? (
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th width="40%">Nombre:</th>
                      <td>{suscripcion.user.name}</td>
                    </tr>
                    <tr>
                      <th>Email:</th>
                      <td>{suscripcion.user.email}</td>
                    </tr>
                    {suscripcion.user.telefono && (
                      <tr>
                        <th>Teléfono:</th>
                        <td>{suscripcion.user.telefono}</td>
                      </tr>
                    )}
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
              <h5 className="mb-0">Información de la Mascota</h5>
            </div>
            <div className="card-body">
              {suscripcion.mascota ? (
                <table className="table table-borderless">
                  <tbody>
                    <tr>
                      <th width="40%">Nombre:</th>
                      <td><strong>{suscripcion.mascota.nombre}</strong></td>
                    </tr>
                    <tr>
                      <th>Especie:</th>
                      <td>{suscripcion.mascota.especie}</td>
                    </tr>
                    <tr>
                      <th>Raza:</th>
                      <td>{suscripcion.mascota.raza}</td>
                    </tr>
                    <tr>
                      <th>Edad:</th>
                      <td>{suscripcion.mascota.edad} años</td>
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
                <h5 className="mb-0">Mensaje de Agradecimiento</h5>
              </div>
              <div className="card-body">
                <p className="mb-0">"{suscripcion.mensaje_apoyo}"</p>
              </div>
            </div>
          </div>
        )}

        {/* Historial de pagos */}
        {historialPagos.length > 0 && (
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">Historial de Pagos</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Método</th>
                        <th>Estado</th>
                        <th>Comprobante</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historialPagos.map(pago => (
                        <tr key={pago.id}>
                          <td>{new Date(pago.fecha).toLocaleDateString()}</td>
                          <td>${pago.monto}</td>
                          <td>{pago.metodo}</td>
                          <td>
                            <span className={`badge bg-${pago.estado === 'completado' ? 'success' : 'warning'}`}>
                              {pago.estado}
                            </span>
                          </td>
                          <td>
                            {pago.comprobante && (
                              <a href={pago.comprobante} target="_blank" rel="noopener noreferrer">
                                Ver comprobante
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FundacionSuscripcionesShow;