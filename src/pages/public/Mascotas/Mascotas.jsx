// src/pages/public/Mascotas/Mascotas.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import MascotaCard from "../../../components/common/MascotaCard/MascotaCard";
import FiltrosMascotas from "../../../components/common/FiltrosMascotas/FiltrosMascotas";
import CustomSelect from "../../../components/common/CustomSelect/CustomSelect";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import { useFiltros } from "../../../contexts/FiltrosContext";
import "./Mascotas.css";

const Mascotas = () => {
  const { t } = useTranslation("mascotas");
  const { filtros } = useFiltros(); // <-- Usar el contexto
  const [mascotas, setMascotas] = useState([]);
  const [mascotasFiltradas, setMascotasFiltradas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [orden, setOrden] = useState("reciente");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  const especies = ["Perro", "Gato", "Conejo", "Ave", "Otro"];

  const opcionesOrden = [
    { value: "reciente", label: t("mas_recientes") || "Más recientes" },
    { value: "nombre", label: t("nombre_asc") || "Nombre (A-Z)" },
    { value: "edad_asc", label: t("edad_asc") || "Edad (menor a mayor)" },
    { value: "edad_desc", label: t("edad_desc") || "Edad (mayor a menor)" },
  ];

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    fetchMascotas();
  }, [currentPage]);

  // Aplicar filtros cuando cambian los filtros o el orden
  useEffect(() => {
    if (mascotas.length > 0) {
      let resultado = [...mascotas];

      if (filtros.busqueda && filtros.busqueda.trim()) {
        const busquedaLower = filtros.busqueda.toLowerCase().trim();
        resultado = resultado.filter((m) =>
          m.nombre_mascota?.toLowerCase().includes(busquedaLower),
        );
      }

      if (filtros.especie && filtros.especie.trim()) {
        resultado = resultado.filter(
          (m) => m.especie?.toLowerCase() === filtros.especie.toLowerCase(),
        );
      }

      if (filtros.genero && filtros.genero.trim()) {
        resultado = resultado.filter(
          (m) => m.genero?.toLowerCase() === filtros.genero.toLowerCase(),
        );
      }

      // Ordenar
      switch (orden) {
        case "nombre":
          resultado.sort((a, b) =>
            a.nombre_mascota?.localeCompare(b.nombre_mascota),
          );
          break;
        case "edad_asc":
          resultado.sort(
            (a, b) =>
              (parseInt(a.edad_aprox) || 0) - (parseInt(b.edad_aprox) || 0),
          );
          break;
        case "edad_desc":
          resultado.sort(
            (a, b) =>
              (parseInt(b.edad_aprox) || 0) - (parseInt(a.edad_aprox) || 0),
          );
          break;
        default:
          break;
      }

      setMascotasFiltradas(resultado);
    }
  }, [filtros, orden, mascotas]);

  const fetchMascotas = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/mascotas?page=${currentPage}`);

      if (response.data.success) {
        const mascotasData = response.data.data.data || [];
        setMascotas(mascotasData);
        setMascotasFiltradas(mascotasData);

        setPagination({
          currentPage: response.data.data.current_page,
          lastPage: response.data.data.last_page,
          total: response.data.data.total,
          perPage: response.data.data.per_page,
        });
        setTotalPages(response.data.data.last_page);
      }
      setError(null);
    } catch (err) {
      console.error("Error:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${import.meta.env.VITE_STORAGE_URL || "http://rescatando-mascotas-forever.test/storage"}/${path}`;
  };

  if (loading) {
    return (
      <div className="mascotas-page">
        <div className="loading-container">
          <LoadingSpinner text={t("cargando")} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mascotas-page">
        <div className="container">
          <div className="error-container">
            <i className="fas fa-paw"></i>
            <h2>{t("error_carga")}</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="reload-btn"
            >
              <i className="fas fa-sync-alt"></i> {t("reintentar")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mascotas-page ">
      <div className="mascotas-header">
        <div className="container">
          <h1>{t("titulo")}</h1>
          <p className="subtitle">{t("subtitulo")}</p>
          {pagination && pagination.total > 0 && (
            <p className="info">
              <i
                className="fas fa-heart"
                style={{ color: "var(--color-heart)" }}
              ></i>{" "}
              {t("mensaje_bienvenida", { total: pagination.total })}
            </p>
          )}
        </div>
      </div>

      <div className="filtros-section">
        <div className="container">
          <FiltrosMascotas
            especies={especies}
            variant={isMobile ? "modal" : "inline"}
          />
        </div>
      </div>

      <div className="resultados-section">
        <div className="container">
          <div className="resultados-header">
            <div className="resultados-count">
              <i className="fas fa-list"></i> {t("mostrando")}{" "}
              <strong>{mascotasFiltradas.length}</strong> {t("de")}{" "}
              <strong>{mascotas.length}</strong> {t("mascotas")}
            </div>
            <div className="resultados-orden">
              <label>
                <i className="fas fa-sort"></i> {t("ordenar_por")}:
              </label>
              <CustomSelect
                options={opcionesOrden}
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                name="orden"
              />
            </div>
          </div>

          {mascotasFiltradas.length === 0 ? (
            <div className="empty-container">
              <i className="fas fa-search"></i>
              <h3>{t("sin_resultados")}</h3>
              <p>{t("sin_resultados_desc")}</p>
            </div>
          ) : (
            <div className="mascotas-grid">
              {mascotasFiltradas.map((mascota) => (
                <MascotaCard
                  key={mascota.id}
                  mascota={mascota}
                  getImageUrl={getImageUrl}
                  showFundacion={true}
                  variant="default"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Mascotas;
