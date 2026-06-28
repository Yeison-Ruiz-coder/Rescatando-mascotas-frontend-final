// src/pages/fundacion/adopciones/Seguimientos.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import ProfileBanner from "../../../components/common/ProfileBanner/ProfileBanner";
import "./Seguimientos.css";

const Seguimientos = () => {
  const { t } = useTranslation("fundacion");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filaAbierta, setFilaAbierta] = useState(null);
  const [mostrarPendientes, setMostrarPendientes] = useState(false);

  const fundacionName = user?.nombre || user?.name || t("fundacion");
  const fundacionAvatar = user?.avatar || user?.foto_perfil || null;

  const fetchItems = useCallback(
    async (page = 1, soloPendientes = false) => {
      try {
        setLoading(true);
        setError(null);

        let response;
        const fields = 'id,adopcion_id,tipo_seguimiento,fecha_seguimiento,estado_mascota,resultado,observaciones,proximo_seguimiento,requiere_nuevo_seguimiento';
        const include = 'adopcion.mascota';

        if (soloPendientes) {
          response = await api.get("/entity/adopciones/seguimientos/pendientes", {
            params: {
              page,
              per_page: 10,
              fields,
              include,
            }
          });
        } else {
          response = await api.get("/entity/adopciones/seguimientos/mis-seguimientos", {
            params: {
              page,
              per_page: 10,
              fields,
              include,
            }
          });
        }

        const data = response.data?.data || response.data;
        const list = data?.data || data || [];

        setItems(Array.isArray(list) ? list : []);
        setPagination({
          current_page: data?.current_page || page,
          last_page: data?.last_page || 1,
          total: data?.total || list.length,
        });
        setCurrentPage(page);
      } catch (err) {
        console.error("Error:", err);
        setError(t("error_cargar_seguimientos"));
        toast.error(t("error_cargar_seguimientos"));
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchItems(1, mostrarPendientes);
  }, [fetchItems, mostrarPendientes]);

  const handlePageChange = (page) => {
    if (page === currentPage || page < 1 || page > pagination.last_page) return;
    fetchItems(page, mostrarPendientes);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleDetalle = (id) => {
    setFilaAbierta(filaAbierta === id ? null : id);
  };

  const togglePendientes = () => {
    setMostrarPendientes(!mostrarPendientes);
    setFilaAbierta(null);
  };

  const formatDate = (date) => {
    if (!date) return "-";
    try {
      return new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      excelente: { label: t("estado_excelente"), class: "estado-excelente" },
      bueno: { label: t("estado_bueno"), class: "estado-bueno" },
      regular: { label: t("estado_regular"), class: "estado-regular" },
      preocupante: {
        label: t("estado_preocupante"),
        class: "estado-preocupante",
      },
    };
    return estados[estado] || estados.bueno;
  };

  const getResultadoBadge = (resultado) => {
    const resultados = {
      satisfactorio: {
        label: t("resultado_satisfactorio"),
        class: "resultado-satisfactorio",
      },
      observaciones: {
        label: t("resultado_observaciones"),
        class: "resultado-observaciones",
      },
      incumplimiento: {
        label: t("resultado_incumplimiento"),
        class: "resultado-incumplimiento",
      },
      reingreso: {
        label: t("resultado_reingreso"),
        class: "resultado-reingreso",
      },
    };
    return resultados[resultado] || resultados.satisfactorio;
  };

  const getTipoLabel = (tipo) => {
    const tipos = {
      virtual: t("tipo_virtual"),
      domiciliario: t("tipo_domiciliario"),
      telefonico: t("tipo_telefonico"),
    };
    return tipos[tipo] || tipo;
  };

  if (loading) {
    return (
      <div className="seg-container">
        <LoadingSpinner text={t("cargando_seguimientos")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="seg-container">
        <div className="seg-error">
          <i className="fas fa-exclamation-triangle"></i>
          <h3>{t("error_titulo")}</h3>
          <p>{error}</p>
          <button
            onClick={() => fetchItems(currentPage, mostrarPendientes)}
            className="seg-btn-retry"
          >
            <i className="fas fa-sync-alt"></i> {t("reintentar")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seg-container">
      <ProfileBanner
        user={{
          nombre: fundacionName,
          avatar: fundacionAvatar,
          titulo: t("banner.titulo_seguimientos", {
            defaultValue: "{{count}} seguimientos realizados",
            count: pagination.total || items.length,
          }),
          solicitudes: pagination.total || items.length,
          adopciones: 0,
          eventos: 0,
        }}
      />

      <div className="seg-wrapper">
        <div className="seg-header">
          <div className="seg-header-left">
            <h1>
              <i className="fas fa-clipboard-check"></i>
              {t("seguimientos")}
            </h1>
            <p>{t("seguimientos_desc")}</p>
          </div>
          <div className="seg-header-actions">
            <button
              className={`seg-btn-toggle ${mostrarPendientes ? "active" : ""}`}
              onClick={togglePendientes}
            >
              <i className="fas fa-clock"></i>
              {mostrarPendientes ? t("ver_todos") : t("ver_pendientes")}
            </button>
            <button
              className="seg-btn-crear"
              onClick={() =>
                navigate("/fundacion/adopciones/seguimientos/nuevo")
              }
            >
              <i className="fas fa-plus"></i>
              {t("nuevo_seguimiento")}
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="seg-empty">
            <i className="fas fa-clipboard-check"></i>
            <h3>
              {mostrarPendientes ? t("sin_pendientes") : t("sin_seguimientos")}
            </h3>
            <p>
              {mostrarPendientes
                ? t("sin_pendientes_desc")
                : t("sin_seguimientos_desc")}
            </p>
          </div>
        ) : (
          <>
            <div className="seg-table-wrap">
              <table className="seg-table">
                <thead>
                  <tr>
                    <th>{t("id")}</th>
                    <th>{t("mascota")}</th>
                    <th>{t("tipo")}</th>
                    <th>{t("fecha")}</th>
                    <th>{t("estado_mascota")}</th>
                    <th>{t("resultado")}</th>
                    <th>{t("acciones")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const mascotaNombre = item.adopcion?.mascota?.nombre_mascota || t("no_disponible");
                    
                    const estado = getEstadoBadge(item.estado_mascota);
                    const resultado = getResultadoBadge(item.resultado);
                    const isOpen = filaAbierta === item.id;

                    return (
                      <React.Fragment key={item.id}>
                        <tr className="seg-row">
                          <td className="seg-id">#{item.id}</td>
                          <td>
                            <i className="fas fa-paw"></i> {mascotaNombre}
                          </td>
                          <td>
                            <span className="seg-tipo">
                              {getTipoLabel(item.tipo_seguimiento)}
                            </span>
                          </td>
                          <td>{formatDate(item.fecha_seguimiento)}</td>
                          <td>
                            <span className={`seg-estado ${estado.class}`}>
                              {estado.label}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`seg-resultado ${resultado.class}`}
                            >
                              {resultado.label}
                            </span>
                          </td>
                          <td>
                            <div className="acciones-container">
                              <button
                                className="btn-accion btn-ver-detalle"
                                onClick={() => toggleDetalle(item.id)}
                                title={isOpen ? t('ocultar') : t('ver_detalle')}
                              >
                                <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`}></i>
                                <span>{isOpen ? t('ocultar') : t('detalle')}</span>
                              </button>

                              <Link
                                to={`/fundacion/adopciones/seguimientos/${item.id}`}
                                className="btn-accion btn-ver"
                                title={t("ver_detalle_completo")}
                              >
                                <i className="fas fa-eye"></i>
                                <span>{t("ver")}</span>
                              </Link>

                              <Link
                                to={`/fundacion/adopciones/seguimientos/${item.id}/editar`}
                                className="btn-accion btn-editar"
                                title={t("editar")}
                              >
                                <i className="fas fa-edit"></i>
                                <span>{t("editar")}</span>
                              </Link>

                              {item.requiere_nuevo_seguimiento && (
                                <span className="badge-pendiente">
                                  <i className="fas fa-clock"></i>
                                  <span>{t("pendiente")}</span>
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr>
                            <td colSpan="7" className="seg-detalle">
                              <div className="seg-detalle-grid">
                                <div>
                                  <strong>{t("observaciones")}</strong>
                                  <p className="seg-detalle-text">
                                    {item.observaciones || t("sin_observaciones")}
                                  </p>
                                </div>
                                <div>
                                  <strong>{t("proximo_seguimiento")}</strong>
                                  <p className="seg-detalle-text">
                                    {item.proximo_seguimiento
                                      ? formatDate(item.proximo_seguimiento)
                                      : t("no_definido")}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pagination.last_page > 1 && (
              <div className="seg-paginacion">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="seg-paginacion-btn"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <span>
                  {t("pagina")} {currentPage} {t("de")} {pagination.last_page}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.last_page}
                  className="seg-paginacion-btn"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Seguimientos;