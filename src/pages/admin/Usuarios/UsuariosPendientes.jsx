// src/pages/admin/Usuarios/UsuariosPendientes.jsx
import React, { useState, useEffect } from "react";
import adminService from "../../../services/adminService";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { toast } from "react-toastify";
import "./UsuariosPendientes.css";

const UsuariosPendientes = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});
  
  // Estados para paginación
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPendientes();
  }, [currentPage]);

  const fetchPendientes = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsuarios({ 
        estado: "pendiente",
        page: currentPage,
        per_page: 12
      });
      console.log("📦 Respuesta completa:", response);

      let usuariosData = [];
      let paginationData = {
        current_page: 1,
        last_page: 1,
        per_page: 12,
        total: 0
      };

      if (response && response.success) {
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          usuariosData = response.data.data;
          paginationData = {
            current_page: response.data.current_page || 1,
            last_page: response.data.last_page || 1,
            per_page: response.data.per_page || 12,
            total: response.data.total || 0
          };
        } 
        else if (Array.isArray(response.data)) {
          usuariosData = response.data;
          paginationData.total = usuariosData.length;
          paginationData.last_page = Math.ceil(usuariosData.length / 12);
        }
        else if (Array.isArray(response)) {
          usuariosData = response;
          paginationData.total = usuariosData.length;
          paginationData.last_page = Math.ceil(usuariosData.length / 12);
        }
      }

      console.log("✅ Usuarios pendientes:", usuariosData);
      setUsuarios(usuariosData);
      setPagination(paginationData);
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("Error al cargar usuarios pendientes");
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  const aprobarUsuario = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await adminService.cambiarEstadoUsuario(id, "activo");
      toast.success("✅ Usuario aprobado exitosamente. Ya puede iniciar sesión.");
      fetchPendientes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al aprobar usuario");
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const rechazarUsuario = async (id) => {
    setProcessing((prev) => ({ ...prev, [id]: true }));
    try {
      await adminService.cambiarEstadoUsuario(id, "inactivo");
      toast.warning("❌ Usuario rechazado. Se le notificará por email.");
      fetchPendientes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al rechazar usuario");
    } finally {
      setProcessing((prev) => ({ ...prev, [id]: false }));
    }
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= pagination.last_page) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, pagination.current_page - Math.floor(maxVisible / 2));
    let end = Math.min(pagination.last_page, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="pendientes-loading">
        <div className="loading-spinner-custom"></div>
        <p>Cargando solicitudes pendientes...</p>
      </div>
    );
  }

  if (!usuarios || usuarios.length === 0) {
    return (
      <div className="pendientes-empty">
        <div className="empty-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h2>✨ No hay solicitudes pendientes</h2>
        <p>Todas las fundaciones y veterinarias han sido revisadas</p>
        <button onClick={() => window.location.reload()} className="btn-volver">
          <i className="fas fa-sync-alt"></i> Actualizar
        </button>
      </div>
    );
  }

  return (
    <div className="pendientes-container">
      <div className="pendientes-header">
        <h1>
          <i className="fas fa-clock"></i> 
          Solicitudes Pendientes
          <span className="header-badge">
            <i className="fas fa-users"></i> {pagination.total}
          </span>
        </h1>
        <p>Revisa y aprueba las solicitudes de fundaciones y veterinarias</p>
      </div>

      <div className="pendientes-grid">
        {usuarios.map((usuario) => (
          <div key={usuario.id} className="pendiente-card">
            <div className="pendiente-header">
              <div className="pendiente-avatar">
                {usuario.tipo === "fundacion" ? (
                  <i className="fas fa-building"></i>
                ) : (
                  <i className="fas fa-clinic-medical"></i>
                )}
              </div>
              <div className="pendiente-tipo-badge">
                {usuario.tipo === "fundacion" ? "🏛️ Fundación" : "🏥 Veterinaria"}
              </div>
            </div>

            <div className="pendiente-info">
              <h3>{usuario.nombre_entidad || usuario.nombre}</h3>

              {/* Datos de contacto */}
              <p className="contacto">
                <i className="fas fa-envelope"></i> {usuario.email}
              </p>

              {usuario.telefono && (
                <p className="contacto">
                  <i className="fas fa-phone"></i> {usuario.telefono}
                </p>
              )}

              {usuario.direccion && (
                <p className="contacto">
                  <i className="fas fa-map-marker-alt"></i> {usuario.direccion}
                </p>
              )}

              {/* Datos del representante */}
              <div className="info-section">
                <strong>
                  <i className="fas fa-user-tie"></i> Representante:
                </strong>
                <p>
                  {usuario.nombre} {usuario.apellidos || ""}
                </p>
              </div>

              {/* Documentos */}
              {usuario.tipo_documento && usuario.numero_documento && (
                <div className="info-section">
                  <strong>
                    <i className="fas fa-id-card"></i> Documento:
                  </strong>
                  <p>
                    {usuario.tipo_documento}: {usuario.numero_documento}
                  </p>
                </div>
              )}

              {/* Registro sanitario / NIT */}
              {usuario.registro_sanitario && (
                <div className="info-section registro">
                  <strong>
                    <i className="fas fa-certificate"></i>
                    {usuario.tipo === "fundacion" ? "NIT / Registro:" : "Registro Sanitario:"}
                  </strong>
                  <p>{usuario.registro_sanitario}</p>
                </div>
              )}

              {/* Capacidad (solo fundación) */}
              {usuario.tipo === "fundacion" && usuario.capacidad_maxima && (
                <div className="info-section capacidad">
                  <strong>
                    <i className="fas fa-home"></i> Capacidad máxima:
                  </strong>
                  <p>{usuario.capacidad_maxima} mascotas</p>
                </div>
              )}

              {/* Servicios (solo veterinaria) */}
              {usuario.tipo === "veterinaria" && usuario.servicios && (
                <div className="servicios">
                  <strong>
                    <i className="fas fa-stethoscope"></i> Servicios:
                  </strong>
                  <div className="servicios-lista">
                    {(() => {
                      let servicios = usuario.servicios;
                      if (typeof servicios === "string") {
                        try {
                          servicios = JSON.parse(servicios);
                        } catch (e) {
                          servicios = [servicios];
                        }
                      }
                      return (
                        Array.isArray(servicios) &&
                        servicios.map((servicio, idx) => (
                          <span key={idx} className="servicio-tag">
                            {servicio === "urgencias"
                              ? "🚨 Urgencias 24h"
                              : servicio === "cirugia"
                              ? "🔪 Cirugía"
                              : servicio === "vacunacion"
                              ? "💉 Vacunación"
                              : servicio === "hospitalizacion"
                              ? "🏥 Hospitalización"
                              : servicio}
                          </span>
                        ))
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* Fecha de registro */}
              <div className="info-section fecha">
                <strong>
                  <i className="fas fa-calendar-alt"></i> Fecha de solicitud:
                </strong>
                <p>
                  {new Date(usuario.created_at).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="pendiente-footer">
              <button
                onClick={() => aprobarUsuario(usuario.id)}
                disabled={processing[usuario.id]}
                className="btn-aprobar"
              >
                {processing[usuario.id] ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-check"></i>
                )}
                Aprobar
              </button>
              <button
                onClick={() => rechazarUsuario(usuario.id)}
                disabled={processing[usuario.id]}
                className="btn-rechazar"
              >
                {processing[usuario.id] ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-times"></i>
                )}
                Rechazar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Paginación */}
      {pagination.last_page > 1 && (
        <div className="pagination-wrapper">
          <div className="pagination-info">
            Mostrando {usuarios.length} de {pagination.total} solicitudes
          </div>
          <div className="pagination-controls">
            <button
              onClick={() => goToPage(1)}
              disabled={pagination.current_page === 1}
              className="page-btn"
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button
              onClick={() => goToPage(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className="page-btn"
            >
              <i className="fas fa-angle-left"></i>
            </button>
            
            {getPageNumbers().map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`page-number ${pagination.current_page === page ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => goToPage(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className="page-btn"
            >
              <i className="fas fa-angle-right"></i>
            </button>
            <button
              onClick={() => goToPage(pagination.last_page)}
              disabled={pagination.current_page === pagination.last_page}
              className="page-btn"
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPendientes;