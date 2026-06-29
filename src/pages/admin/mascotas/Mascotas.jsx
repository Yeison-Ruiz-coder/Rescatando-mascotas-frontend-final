// src/pages/admin/mascotas/Mascotas.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import ProfileBanner from "../../../components/common/ProfileBanner/ProfileBanner";
import MascotaCardAdmin from "../../../components/common/MascotaCardAdmin/MascotaCardAdmin";
import FiltrosMascotasFundacion from "../../../components/common/FiltrosMascotasFundacion/FiltrosMascotasFundacion";
import "./Mascotas.css";

const AdminMascotas = () => {
  const { t } = useTranslation(["admin", "mascotas"]);
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

  // ===== DATOS PARA EL BANNER =====
  const adminName = user?.name || user?.nombre || t("admin", "Administrador");
  const adminAvatar = user?.avatar || null;
  const totalMascotas = pagination.total || 0;
  const enAdopcion = mascotas.filter(
    (m) => m.estado === "En adopcion" || m.estado === "En adopción",
  ).length;
  const tasaExito =
    totalMascotas > 0 ? Math.round((enAdopcion / totalMascotas) * 100) : 0;

  // ===== ESPECIES Y ESTADOS =====
  const especies = ["Perro", "Gato", "Conejo", "Ave", "Otro"];

  // ============================================
  // 🎯 CARGAR MASCOTAS - ADMIN
  // ============================================
  const cargarMascotas = useCallback(
    async (filters = {}, page = 1) => {
      setLoading(true);

      try {
        const params = {
          page: page,
          per_page: 15,
          fields:
            "id,nombre_mascota,especie,genero,edad_aprox,estado,foto_principal,created_at,descripcion,lugar_rescate,fundacion_id",
          include: "fundacion:nombre,razas:nombre_raza",
          sort: "-created_at",
        };

        // Filtros
        if (filters.buscar) params.buscar = filters.buscar;
        if (filters.especie) params.especie = filters.especie;
        if (filters.genero) params.genero = filters.genero;
        if (filters.estado) params.estado = filters.estado;
        if (filters.tamano) params.tamano = filters.tamano;

        // 🔥 RUTA ADMIN
        const response = await api.get("/admin/mascotas", { params });

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
          toast.error(t("admin:error_permisos"));
        } else if (error.response?.status === 401) {
          toast.error(t("admin:error_sesion"));
        } else {
          toast.error(t("admin:error_carga_mascotas"));
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
  // 🎯 ELIMINAR - ADMIN
  // ============================================
  const handleEliminar = useCallback(
    async (id, nombre) => {
      if (!window.confirm(t("admin:confirmar_eliminar", { nombre }))) return;

      try {
        const response = await api.delete(`/admin/mascotas/${id}`);

        if (response.data.success) {
          toast.success(t("admin:mascota_eliminada_exito", { nombre }));
          cargarMascotas(currentFilters, currentPage);
        } else {
          toast.error(response.data.message || t("admin:error_eliminar"));
        }
      } catch (error) {
        console.error("Error eliminando mascota:", error);
        toast.error(t("admin:error_eliminar_mascota"));
      }
    },
    [cargarMascotas, currentFilters, currentPage, t],
  );

  // ============================================
  // 🎯 CAMBIAR ESTADO - ADMIN
  // ============================================
  const handleCambiarEstado = useCallback(
    async (id, nuevoEstado) => {
      try {
        // 🔥 RUTA ADMIN PATCH
        const response = await api.patch(`/admin/mascotas/${id}/estado`, {
          estado: nuevoEstado,
        });

        if (response.data.success) {
          const estadoTexto =
            nuevoEstado === "En adopcion"
              ? t("mascotas:en_adopcion")
              : nuevoEstado === "Adoptado"
                ? t("mascotas:adoptado")
                : nuevoEstado === "Rescatada"
                  ? t("mascotas:rescatada")
                  : t("mascotas:en_acogida");

          toast.success(
            t("admin:estado_actualizado_exito", { estado: estadoTexto }),
          );
          cargarMascotas(currentFilters, currentPage);
        } else {
          toast.error(
            response.data.message || t("admin:error_actualizar_estado"),
          );
        }
      } catch (error) {
        console.error("Error actualizando estado:", error);
        toast.error(t("admin:error_actualizar_estado"));
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

  // ===== LOADING =====
  if (loading && mascotas.length === 0) {
    return (
      <div className="admin-mascotas-page">
        <div className="loading-container">
          <LoadingSpinner text={t("admin:cargando_mascotas")} />
        </div>
      </div>
    );
  }

  return (
    <div className="admin-mascotas-page">
      {/* ===== PROFILE BANNER ===== */}
      <div className="admin-mascotas-banner-wrapper">
        <ProfileBanner
          user={{
            nombre: adminName,
            avatar: adminAvatar,
            titulo: t("admin:banner_mascotas_titulo", {
              defaultValue: "{{count}} mascotas · {{percent}}% en adopción",
              count: totalMascotas,
              percent: tasaExito,
            }),
            solicitudes: totalMascotas,
            adopciones: enAdopcion,
            eventos: 0,
          }}
        />
      </div>

      {/* ===== FILTROS ===== */}
      <div className="admin-mascotas-filtros">
        <div className="bento-container">
          {/* 🔥 REUTILIZAMOS EL FILTRO DE FUNDACIÓN */}
          <FiltrosMascotasFundacion
            onFilterChange={handleFilterChange}
            especies={especies}
            mascotas={mascotas}
            isLoading={loading}
          />
        </div>
      </div>

      {/* ===== RESULTADOS ===== */}
      <div className="admin-mascotas-resultados">
        <div className="bento-container">
          <div className="resultados-header">
            <div className="resultados-count">
              <i className="fas fa-list"></i>
              {t("mascotas:mostrando")}{" "}
              <strong>{mascotasFiltradas.length} </strong>
              {t("mascotas:de")} <strong> {pagination.total}</strong>{" "}
              {t("mascotas:mascotas")}
            </div>
          </div>

          {mascotasFiltradas.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-search"></i>
              <h3>{t("admin:sin_mascotas")}</h3>
              <p>
                {currentFilters.buscar ||
                currentFilters.especie ||
                currentFilters.genero ||
                currentFilters.estado
                  ? t("admin:sin_resultados_filtros")
                  : t("admin:sin_mascotas_desc")}
              </p>
            </div>
          ) : (
            <>
              <div className="admin-mascotas-grid">
                {mascotasFiltradas.map((mascota) => (
                  <MascotaCardAdmin
                    key={mascota.id}
                    mascota={mascota}
                    onDelete={handleEliminar}
                    onVerDetalle={(id) => navigate(`/admin/mascotas/${id}`)}
                    showActions={true}
                    showFundacion={true}
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
                    <i className="fas fa-chevron-left"></i>{" "}
                    {t("mascotas:anterior")}
                  </button>
                  <span className="pagination-info">
                    {t("mascotas:pagina")} {currentPage} {t("mascotas:de")}{" "}
                    {pagination.last_page}
                  </span>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.last_page}
                    className="pagination-btn"
                  >
                    {t("mascotas:siguiente")}{" "}
                    <i className="fas fa-chevron-right"></i>
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

export default AdminMascotas;
