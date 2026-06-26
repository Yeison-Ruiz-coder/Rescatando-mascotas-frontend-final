// src/components/common/UsuarioCard/UsuarioCard.jsx
import React from 'react';
import './UsuarioCard.css';

/**
 * Componente UsuarioCard - Tarjeta estilo Bento para mostrar información de usuarios
 */
const UsuarioCard = ({
  usuario,
  children,
  onVer,
  onEditar,
  onEliminar,
  onActivar,
  onVerificar,
  loading = false,
  className = '',
}) => {
  const {
    id,
    nombre,
    nombre_entidad,
    email,
    tipo,
    estado,
    telefono,
    direccion,
    avatar,
    email_verified_at,
    created_at,
  } = usuario || {};

  const displayName = nombre_entidad || nombre || 'Sin nombre';
  const emailVerified = !!(email_verified_at || usuario?.email_verificado || usuario?.email_verified);
  
  const fechaRegistro = created_at 
    ? new Date(created_at).toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : '—';

  const getEstadoClass = (estado) => {
    const map = {
      activo: 'estado-activo',
      inactivo: 'estado-inactivo',
      pendiente: 'estado-pendiente',
    };
    return map[estado] || 'estado-desconocido';
  };

  const getTipoClass = (tipo) => {
    const map = {
      usuario: 'tipo-usuario',
      fundacion: 'tipo-fundacion',
      veterinaria: 'tipo-veterinaria',
    };
    return map[tipo] || 'tipo-default';
  };

  const getAvatarColor = (tipo) => {
    const map = {
      fundacion: 'var(--color-fundacion-primary)',
      veterinaria: 'var(--color-veterinaria-primary)',
    };
    return map[tipo] || 'var(--color-primary)';
  };

  if (loading) {
    return (
      <div className={`usuario-card usuario-card-loading ${className}`}>
        <div className="usuario-card-skeleton">
          <div className="skeleton-avatar"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
          <div className="skeleton-line"></div>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return null;
  }

  return (
    <div className={`usuario-card ${className}`}>
      {/* Header */}
      <div className="usuario-card-header">
        <div className="usuario-card-avatar-wrapper">
          {avatar ? (
            <img 
              src={avatar} 
              alt={displayName} 
              className="usuario-card-avatar"
            />
          ) : (
            <div 
              className="usuario-card-avatar-placeholder"
              style={{ background: getAvatarColor(tipo) }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <span className={`usuario-card-estado ${getEstadoClass(estado)}`}>
            {estado || 'pendiente'}
          </span>
        </div>
        
        <div className="usuario-card-info">
          <h3 className="usuario-card-nombre">{displayName}</h3>
          <span className={`usuario-card-tipo ${getTipoClass(tipo)}`}>
            {tipo || 'usuario'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="usuario-card-body">
        <div className="usuario-card-detail">
          <span className="usuario-card-detail-icon icon-email"></span>
          <span className="usuario-card-detail-text">{email || 'Sin email'}</span>
        </div>
        
        {telefono && (
          <div className="usuario-card-detail">
            <span className="usuario-card-detail-icon icon-phone"></span>
            <span className="usuario-card-detail-text">{telefono}</span>
          </div>
        )}
        
        {direccion && (
          <div className="usuario-card-detail">
            <span className="usuario-card-detail-icon icon-location"></span>
            <span className="usuario-card-detail-text">{direccion}</span>
          </div>
        )}
        
        <div className="usuario-card-meta">
          <span className={`usuario-card-email-status ${emailVerified ? 'verified' : 'unverified'}`}>
            {emailVerified ? 'Verificado' : 'Por verificar'}
          </span>
          <span className="usuario-card-fecha">
            {fechaRegistro}
          </span>
        </div>
        
        {children}
      </div>

      {/* Footer */}
      <div className="usuario-card-footer">
        <div className="usuario-card-actions">
          {onVer && (
            <button 
              className="btn-action btn-ver"
              onClick={() => onVer(id)}
              title="Ver detalles"
            >
              Ver
            </button>
          )}
          
          {onEditar && (
            <button 
              className="btn-action btn-editar"
              onClick={() => onEditar(id)}
              title="Editar usuario"
            >
              Editar
            </button>
          )}
          
          {onActivar && (
            <button 
              className={`btn-action ${estado === 'activo' ? 'btn-desactivar' : 'btn-activar'}`}
              onClick={() => onActivar(usuario)}
              title={estado === 'activo' ? 'Desactivar' : 'Activar'}
            >
              {estado === 'activo' ? 'Desactivar' : 'Activar'}
            </button>
          )}
          
          {!emailVerified && onVerificar && (
            <button 
              className="btn-action btn-verificar"
              onClick={() => onVerificar(id)}
              title="Verificar email"
            >
              Verificar
            </button>
          )}
          
          {onEliminar && (
            <button 
              className="btn-action btn-eliminar"
              onClick={() => onEliminar(usuario)}
              title="Eliminar usuario"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsuarioCard;