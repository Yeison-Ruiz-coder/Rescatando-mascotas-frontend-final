// src/pages/fundacion/mascotas/Mascotas.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import MascotaCardFundacion from "../../../components/common/MascotaCardFundacion/MascotaCardFundacion";
import FiltrosMascotas from "../../../components/common/FiltrosMascotas/FiltrosMascotas";
import "./Mascotas.css";

const Mascotas = () => {
  const { t } = useTranslation("fundacion");
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mascotas, setMascotas] = useState([]);
  const [mascotasFiltradas, setMascotasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilters, setCurrentFilters] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const especies = ["Perro", "Gato", "Conejo", "Ave", "Otro"];

  // ============================================
  // 🎯 CARGAR MASCOTAS - OPTIMIZADO
  // ============================================
  const cargarMascotas = useCallback(
    async (filters = {}, page = 1) => {
      try {
        setLoading(true);

        const params = {
          page: page,
          per_page: 15,
          fields:
            "id,nombre_mascota,especie,genero,edad_aprox,estado,foto_principal,created_at,descripcion,lugar_rescate",
          include: "razas:nombre_raza",
          sort: "-created_at",
        };

        if (filters.buscar) params.buscar = filters.buscar;
        if (filters.especie) params.especie = filters.especie;
        if (filters.genero) params.genero = filters.genero;
        if (filters.estado) params.estado = filters.estado;

        const response = await api.get("/entity/mascotas", { params });

        let mascotasData = [];
        let paginationData = { current_page: 1, last_page: 1, total: 0 };

        if (response.data?.data?.data) {
          mascotasData = response.data.data.data;
          paginationData = {
            current_page: response.data.data.current_page,
            last_page: response.data.data.last_page,
            total: response.data.data.total,
          };
        } else if (response.data?.data) {
          mascotasData = response.data.data;
        } else if (Array.isArray(response.data)) {
          mascotasData = response.data;
        }

        setMascotas(mascotasData);
        setMascotasFiltradas(mascotasData);
        setPagination(paginationData);
        setCurrentPage(page);
      } catch (error) {
        console.error("Error cargando mascotas:", error);

        if (error.response?.status === 403) {
          toast.error(t("error_permisos"));
        } else if (error.response?.status === 401) {
          toast.error(t("error_sesion"));
        } else {
          toast.error(t("error_carga_mascotas"));
        }

        setMascotas([]);
        setMascotasFiltradas([]);
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  // ============================================
  // FILTROS
  // ============================================
  const handleFilterChange = useCallback(
    (filters) => {
      setCurrentFilters(filters);
      setCurrentPage(1);
      cargarMascotas(filters, 1);
    },
    [cargarMascotas],
  );

  // ============================================
  // PAGINACIÓN
  // ============================================
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage === currentPage) return;
      cargarMascotas(currentFilters, newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [currentPage, currentFilters, cargarMascotas],
  );

  // ============================================
  // 🎯 ELIMINAR
  // ============================================
  const handleEliminar = useCallback(
    async (id, nombre) => {
      try {
        const response = await api.delete(`/entity/mascotas/${id}`);

        if (response.data.success) {
          toast.success(t("mascota_eliminada_exito", { nombre }));
          cargarMascotas(currentFilters, currentPage);
        } else {
          toast.error(response.data.message || t("error_eliminar"));
        }
      } catch (error) {
        console.error("Error eliminando mascota:", error);
        toast.error(t("error_eliminar_mascota"));
      }
    },
    [cargarMascotas, currentFilters, currentPage, t],
  );

  // ============================================
  // 🎯 CAMBIAR ESTADO - PATCH OPTIMIZADO
  // ============================================
  const handleCambiarEstado = useCallback(
    async (id, nuevoEstado) => {
      try {
        const response = await api.patch(`/entity/mascotas/${id}/estado`, {
          estado: nuevoEstado,
        });

        if (response.data.success) {
          const estadoTexto =
            nuevoEstado === "En adopcion"
              ? t("estado_en_adopcion")
              : nuevoEstado === "Adoptado"
                ? t("estado_adoptado")
                : nuevoEstado === "Rescatada"
                  ? t("estado_rescatada")
                  : t("estado_en_acogida");

          toast.success(t("estado_actualizado_exito", { estado: estadoTexto }));
          cargarMascotas(currentFilters, currentPage);
        } else {
          toast.error(response.data.message || t("error_actualizar_estado"));
        }
      } catch (error) {
        console.error("Error actualizando estado:", error);
        toast.error(t("error_actualizar_estado"));
      }
    },
    [cargarMascotas, currentFilters, currentPage, t],
  );

  // ============================================
  // CARGA INICIAL
  // ============================================
  useEffect(() => {
    cargarMascotas({}, 1);
  }, [cargarMascotas]);

  if (loading) {
    return (
      <div className="fundacion-mascotas-page">
        <div className="loading-container">
          <LoadingSpinner text={t("cargando_mascotas")} />
        </div>
      </div>
    );
  }

  return (
    <div className="fundacion-mascotas-page">
      <div className="fundacion-mascotas-header">
        <div className="bento-container">
          <h1>
            <i className="fas fa-paw"></i>
            {t("mis_mascotas")}
          </h1>
          <p className="subtitle">{t("gestion_mascotas")}</p>
          {pagination.total > 0 && (
            <p className="info">
              <i
                className="fas fa-heart"
                style={{ color: "var(--color-heart)" }}
              ></i>
              {t("mensaje_bienvenida", { total: pagination.total })}
            </p>
          )}
        </div>
      </div>

      <div className="fundacion-mascotas-filtros glass-auto shadow-sticky">
        <div className="bento-container">
          <FiltrosMascotas
            onFilterChange={handleFilterChange}
            especies={especies}
            mascotas={mascotas}
            isLoading={loading}
          />
        </div>
      </div>

      <div className="fundacion-mascotas-resultados">
        <div className="bento-container">
          <div className="resultados-header">
            <div className="resultados-count">
              <i className="fas fa-list"></i>
              {t("mostrando")} <strong>{mascotasFiltradas.length}</strong>
              {t("de")} <strong>{pagination.total}</strong> {t("mascotas")}
            </div>
            <Link to="/fundacion/mascotas/nueva" className="btn-primary">
              <i className="fas fa-plus"></i>
              {t("agregar_mascota")}
            </Link>
          </div>

          {mascotasFiltradas.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-search"></i>
              <h3>{t("sin_mascotas")}</h3>
              <p>
                {currentFilters.buscar ||
                currentFilters.especie ||
                currentFilters.genero
                  ? t("sin_resultados_filtros")
                  : t("primer_mascota")}
              </p>
            </div>
          ) : (
            <>
              <div className="fundacion-mascotas-grid stagger-children">
                {mascotasFiltradas.map((mascota) => (
                  <MascotaCardFundacion
                    key={mascota.id}
                    mascota={mascota}
                    onEstadoChange={handleCambiarEstado}
                    onEliminar={handleEliminar}
                    onVerDetalle={(id) => navigate(`/fundacion/mascotas/${id}`)}
                    onEditar={(id) =>
                      navigate(`/fundacion/mascotas/editar/${id}`)
                    }
                  />
                ))}
              </div>
              {pagination.last_page > 1 && (
                <div className="pagination-container">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <i className="fas fa-chevron-left"></i> {t("anterior")}
                  </button>
                  <span className="pagination-info">
                    {t("pagina")} {currentPage} {t("de")} {pagination.last_page}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.last_page}
                    className="pagination-btn"
                  >
                    {t("siguiente")} <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mascotas;
