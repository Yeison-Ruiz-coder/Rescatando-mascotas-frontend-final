// src/components/common/SuscripcionCard/SuscripcionCard.jsx
import React from 'react';
import './SuscripcionCard.css';

const SuscripcionCard = ({ 
  suscripcion, 
  getNombreMascota, 
  getImagenMascota,
  getEspecieMascota,
  getEdadMascota,
  getEstadoInfo, 
  handleCancelar,
  handleSimularPago,
  cancelando,
  mostrarBotonEliminar = false,
  esEliminada = false,
  esHistorial = false,
  formatDate,
  t
}) => {
  const nombreMascota = getNombreMascota(suscripcion);
  const imagenMascota = getImagenMascota(suscripcion);
  const especie = getEspecieMascota(suscripcion);
  const edad = getEdadMascota(suscripcion);
  const estadoInfo = getEstadoInfo(suscripcion.estado);
  const esActivaEstado = suscripcion.estado?.toLowerCase() === 'activo';
  const esPendiente = suscripcion.estado?.toLowerCase() === 'pendiente';
  
  const fechaInicio = suscripcion.fecha_inicio ? new Date(suscripcion.fecha_inicio) : null;
  const fechaFin = suscripcion.fecha_eliminacion || suscripcion.updated_at || suscripcion.fecha_fin ? 
    new Date(suscripcion.fecha_eliminacion || suscripcion.updated_at || suscripcion.fecha_fin) : null;

  return (
    <div className={`suscripcion-card ${esActivaEstado ? 'card-activa' : 'card-inactiva'} ${esHistorial ? 'card-historial' : ''}`}>
      <div className="suscripcion-card-header">
        <div className="suscripcion-mascota">
          {imagenMascota ? (
            <img 
              src={imagenMascota} 
              alt={nombreMascota}
              className="suscripcion-avatar"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : null}
          <div className="suscripcion-avatar-placeholder">
            <i className="fas fa-paw"></i>
          </div>
          <div className="suscripcion-mascota-info">
            <h3>{nombreMascota}</h3>
            <span className="suscripcion-tipo">
              <i className="fas fa-tag"></i> {especie} {edad ? `• ${edad} ${t('años', 'años')}` : ''}
            </span>
            {esEliminada && (
              <span className="suscripcion-eliminada-tag">
                <i className="fas fa-trash-alt"></i> {t('eliminada', 'Eliminada')}
              </span>
            )}
          </div>
        </div>
        <span className={`estado-badge estado-${estadoInfo.class}`}>
          <i className={`fas ${estadoInfo.icon}`}></i> {estadoInfo.label}
        </span>
      </div>

      <div className="suscripcion-card-body">
        <div className="suscripcion-detalles">
          <div className="detalle-item">
            <span className="detalle-label">
              <i className="fas fa-money-bill-wave"></i> {t('monto_mensual', 'Monto mensual')}
            </span>
            <span className="detalle-valor">
              ${parseFloat(suscripcion.monto_mensual || suscripcion.monto || 0).toLocaleString()}
            </span>
          </div>
          <div className="detalle-item">
            <span className="detalle-label">
              <i className="fas fa-sync-alt"></i> {t('frecuencia', 'Frecuencia')}
            </span>
            <span className="detalle-valor">
              {suscripcion.frecuencia || t('mensual', 'Mensual')}
            </span>
          </div>
          {fechaInicio && (
            <div className="detalle-item">
              <span className="detalle-label">
                <i className="fas fa-calendar-alt"></i> {t('inicio', 'Inicio')}
              </span>
              <span className="detalle-valor">
                {formatDate(fechaInicio)}
              </span>
            </div>
          )}
          {fechaFin && esEliminada && (
            <div className="detalle-item">
              <span className="detalle-label">
                <i className="fas fa-calendar-times"></i> {t('eliminada', 'Eliminada')}
              </span>
              <span className="detalle-valor">
                {formatDate(fechaFin)}
              </span>
            </div>
          )}
          {suscripcion.mensaje_apoyo && (
            <div className="detalle-item mensaje-apoyo">
              <span className="detalle-label">
                <i className="fas fa-comment-dots"></i> {t('mensaje_apoyo', 'Mensaje de apoyo')}
              </span>
              <span className="detalle-valor">"{suscripcion.mensaje_apoyo}"</span>
            </div>
          )}
        </div>
      </div>

      <div className="suscripcion-card-footer">
        {esPendiente && handleSimularPago && (
          <button
            className="btn-simular-pago"
            onClick={() => handleSimularPago(suscripcion.id)}
            disabled={cancelando === suscripcion.id}
          >
            {cancelando === suscripcion.id ? (
              <span className="spinner-small"></span>
            ) : (
              <>
                <i className="fas fa-credit-card"></i> {t('simular_pago', 'Simular Pago (Demo)')}
              </>
            )}
          </button>
        )}

        {mostrarBotonEliminar && esActivaEstado && (
          <button
            className="btn-cancelar"
            onClick={() => handleCancelar(suscripcion.id)}
            disabled={cancelando === suscripcion.id}
          >
            {cancelando === suscripcion.id ? (
              <span className="spinner-small"></span>
            ) : (
              <>
                <i className="fas fa-trash-alt"></i> {t('cancelar', 'Cancelar Suscripción')}
              </>
            )}
          </button>
        )}
        
        {esEliminada && !mostrarBotonEliminar && (
          <span className="suscripcion-inactiva-msg">
            <i className="fas fa-info-circle"></i> {esHistorial ? t('eliminada_historial', 'Suscripción eliminada') : t('fue_cancelada', 'Esta suscripción fue cancelada')}
          </span>
        )}
      </div>
    </div>
  );
};

export default SuscripcionCard;