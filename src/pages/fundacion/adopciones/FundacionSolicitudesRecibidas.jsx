import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import "./FundacionSolicitudesRecibidas.css";

const PER_PAGE = 10;

const FundacionSolicitudesRecibidas = () => {
  const { t } = useTranslation("fundacion");
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filaAbierta, setFilaAbierta] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    total: 0,
    lastPage: 1,
  });

  const getEstadoBadge = (estado) => {
    const estados = {
      pendiente: { text: t("estado_pendiente"), class: "pendiente" },
      en_revision: { text: t("estado_en_revision"), class: "en_revision" },
      aprobada: { text: t("estado_aprobada"), class: "aprobada" },
      rechazada: { text: t("estado_rechazada"), class: "rechazada" },
      completada: { text: t("estado_completada"), class: "completada" },
    };
    return estados[estado] || estados.pendiente;
  };

  const formatDate = (value) => {
    if (!value) {
      return t("fecha_no_disponible");
    }

    try {
      return new Date(value).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return value;
    }
  };

  const fetchSolicitudes = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
const response = await api.get("/entity/solicitudes", {
          params: {
            page,
            per_page: PER_PAGE,
            sort: "created_at",
            order: "desc",
          },
        });

        const responseData = response.data?.success === false ? response.data : response.data?.data || response.data;
        if (response.data?.success === false) {
          throw new Error(response.data.message || t("error_respuesta"));
        }

        const solicitudesList = responseData?.data || responseData || [];
        const parsed = Array.isArray(solicitudesList) ? solicitudesList : [];

        setSolicitudes(parsed);
        setPagination({
          currentPage: responseData?.current_page || page,
          total: responseData?.total || parsed.length,
          lastPage: responseData?.last_page || 1,
        });
      } catch (err) {
        console.error("Error al cargar solicitudes de fundación:", err);

        let errorMessage = t("error_cargar_solicitudes");

        if (err.response) {
          const status = err.response.status;
          if (status === 401) {
            errorMessage = t("error_sesion_expirada");
            setTimeout(() => (window.location.href = "/login"), 2000);
          } else if (status === 403) {
            errorMessage = t("error_permisos");
          } else if (status === 404) {
            errorMessage = t("error_no_encontradas");
          } else if (status === 500) {
            errorMessage = t("error_servidor");
          } else {
            errorMessage = `${t("error_servidor")} (${status})`;
          }
        } else if (err.request) {
          errorMessage = t("error_conexion");
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchSolicitudes();
  }, [fetchSolicitudes]);

  const cambiarPagina = (page) => {
    if (page < 1 || page > pagination.lastPage) return;
    fetchSolicitudes(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleDetalle = (id) => {
    setFilaAbierta((prev) => (prev === id ? null : id));
  };

  const renderPagination = () => {
    if (pagination.lastPage <= 1) return null;

    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(pagination.lastPage, startPage + maxVisible - 1);

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let page = startPage; page <= endPage; page += 1) {
      pages.push(page);
    }

    return (
      <div className="fundacion-solicitudes-pagination">
        <button
          type="button"
          className="fundacion-solicitudes-pagination-btn"
          disabled={pagination.currentPage === 1}
          onClick={() => cambiarPagina(pagination.currentPage - 1)}
        >
          <i className="fas fa-chevron-left" />
        </button>

        {startPage > 1 && (
          <>
            <button type="button" className="fundacion-solicitudes-pagination-btn" onClick={() => cambiarPagina(1)}>
              1
            </button>
            {startPage > 2 && <span className="fundacion-solicitudes-pagination-dots">...</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`fundacion-solicitudes-pagination-btn ${pagination.currentPage === page ? "active" : ""}`}
            onClick={() => cambiarPagina(page)}
          >
            {page}
          </button>
        ))}

        {endPage < pagination.lastPage && (
          <>
            {endPage < pagination.lastPage - 1 && <span className="fundacion-solicitudes-pagination-dots">...</span>}
            <button type="button" className="fundacion-solicitudes-pagination-btn" onClick={() => cambiarPagina(pagination.lastPage)}>
              {pagination.lastPage}
            </button>
          </>
        )}

        <button
          type="button"
          className="fundacion-solicitudes-pagination-btn"
          disabled={pagination.currentPage === pagination.lastPage}
          onClick={() => cambiarPagina(pagination.currentPage + 1)}
        >
          <i className="fas fa-chevron-right" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fundacion-solicitudes-page">
        <div className="fundacion-solicitudes-loading">
          <LoadingSpinner text={t("cargando_solicitudes")} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fundacion-solicitudes-page">
        <div className="fundacion-solicitudes-wrapper">
          <div className="fundacion-solicitudes-error">
            <i className="fas fa-exclamation-triangle" />
            <h2>{t("error_titulo")}</h2>
            <p>{error}</p>
            <button type="button" className="fundacion-solicitudes-retry-btn" onClick={() => fetchSolicitudes(pagination.currentPage)}>
              <i className="fas fa-redo" /> {t("reintentar")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fundacion-solicitudes-page">
      <div className="fundacion-solicitudes-wrapper">
        <header className="fundacion-solicitudes-header">
          <div>
            <h1>{t("solicitudes_titulo")}</h1>
            <p>{t("solicitudes_subtitulo")}</p>
          </div>
        </header>

        {solicitudes.length === 0 ? (
          <div className="fundacion-solicitudes-empty">
            <i className="fas fa-clipboard-list" />
            <h2>{t("sin_solicitudes")}</h2>
            <p>{t("sin_solicitudes_desc")}</p>
          </div>
        ) : (
          <>
            <div className="fundacion-solicitudes-table-container">
              <div className="fundacion-solicitudes-table">
                <div className="fundacion-solicitudes-table-header">
                  <div>{t("id_label")}</div>
                  <div>{t("mascota_label")}</div>
                  <div>{t("solicitante_label")}</div>
                  <div>{t("fecha_solicitud")}</div>
                  <div>{t("estado_label")}</div>
                  <div>{t("acciones")}</div>
                </div>

                {solicitudes.map((solicitud) => {
                  const estadoBadge = getEstadoBadge(solicitud.estado);
                  const isOpen = filaAbierta === solicitud.id;
                  const mascotaNombre =
                    solicitud.solicitable?.nombre_mascota ||
                    solicitud.mascota?.nombre_mascota ||
                    solicitud.mascota_nombre ||
                    t("mascota_no_disponible");
                  const solicitanteNombre =
                    solicitud.nombre_solicitante ||
                    solicitud.solicitante_nombre ||
                    t("no_especificado");

                  return (
                    <React.Fragment key={solicitud.id}>
                      <div className="fundacion-solicitudes-row">
                        <div className="fundacion-solicitudes-id">#{solicitud.id}</div>
                        <div className="fundacion-solicitudes-cell">{mascotaNombre}</div>
                        <div className="fundacion-solicitudes-cell">{solicitanteNombre}</div>
                        <div className="fundacion-solicitudes-cell">{formatDate(solicitud.created_at)}</div>
                        <div className="fundacion-solicitudes-cell">
                          <span className={`fundacion-solicitudes-estado ${estadoBadge.class}`}>
                            {estadoBadge.text}
                          </span>
                        </div>
                        <div className="fundacion-solicitudes-cell fundacion-solicitudes-actions">
                          <button
                            type="button"
                            className="fundacion-solicitudes-detail-btn"
                            onClick={() => toggleDetalle(solicitud.id)}
                          >
                            {isOpen ? t("cerrar_detalle") : t("ver_detalle")}
                          </button>
                        </div>
                      </div>

                      <div className={`fundacion-solicitudes-detail ${isOpen ? "open" : ""}`}>
                        <div className="fundacion-solicitudes-detail-grid">
                          <div>
                            <strong>{t("email_label")}:</strong>
                            <p>{solicitud.email_solicitante || solicitud.email || t("no_especificado")}</p>
                          </div>
                          <div>
                            <strong>{t("telefono_label")}:</strong>
                            <p>{solicitud.telefono_solicitante || solicitud.telefono || t("no_especificado")}</p>
                          </div>
                          <div>
                            <strong>{t("motivo_adopcion_label")}:</strong>
                            <p>{solicitud.contenido || t("no_especificado")}</p>
                          </div>
                          <div>
                            <strong>{t("razon_rechazo_label")}:</strong>
                            <p>{solicitud.razon_rechazo || t("no_especificado")}</p>
                          </div>
                          <div className="fundacion-solicitudes-detail-full">
                            <strong>{t("notas_internas_label")}:</strong>
                            <p>{solicitud.notas_internas || t("no_especificado")}</p>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default FundacionSolicitudesRecibidas;
