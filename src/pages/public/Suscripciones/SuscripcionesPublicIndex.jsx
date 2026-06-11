// src/pages/public/suscripciones/SuscripcionesPublicIndex.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { suscripcionService } from "../../../services/suscripcionService";
import api from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import MascotaApadrinarCard from "../../../components/common/MascotaApadrinarCard/MascotaApadrinarCard";
import FiltrosMascotas from "../../../components/common/FiltrosMascotas/FiltrosMascotas";
import CustomSelect from "../../../components/common/CustomSelect/CustomSelect";
import "./SuscripcionesPublicIndex.css";

const SuscripcionesPublicIndex = () => {
  const { t } = useTranslation("suscripciones");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [membresias, setMembresias] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apadrinando, setApadrinando] = useState(false);
  const [selectedMembresia, setSelectedMembresia] = useState(null);
  const [selectedMascota, setSelectedMascota] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orden, setOrden] = useState("reciente");
  const [currentFilters, setCurrentFilters] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const especies = ["Perro", "Gato", "Conejo", "Ave", "Otro"];

  const opcionesOrden = [
    { value: "reciente", label: t("mas_recientes") },
    { value: "nombre", label: t("nombre_az") },
    { value: "edad_asc", label: t("edad_asc") },
    { value: "edad_desc", label: t("edad_desc") },
  ];

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Aplicar filtros a mascotas
  const applyFilters = useCallback((filters, data, sortOrder) => {
    if (!data.length) {
      return [];
    }

    let resultado = [...data];

    if (filters.buscar && filters.buscar.trim()) {
      const busquedaLower = filters.buscar.toLowerCase().trim();
      resultado = resultado.filter((m) =>
        m.nombre_mascota?.toLowerCase().includes(busquedaLower),
      );
    }

    if (filters.especie && filters.especie.trim()) {
      resultado = resultado.filter(
        (m) => m.especie?.toLowerCase() === filters.especie.toLowerCase(),
      );
    }

    if (filters.genero && filters.genero.trim()) {
      resultado = resultado.filter(
        (m) => m.genero?.toLowerCase() === filters.genero.toLowerCase(),
      );
    }

    switch (sortOrder) {
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

    return resultado;
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const planesResponse = await suscripcionService.getPlanesMembresia();
      if (planesResponse && Array.isArray(planesResponse)) {
        setMembresias(planesResponse);
      }

      const mascotasResponse = await api.get(
        "/mascotas?estado=activo&limit=100",
      );
      let mascotasData = [];
      if (mascotasResponse.data?.success) {
        mascotasData = mascotasResponse.data.data.data || [];
      } else if (Array.isArray(mascotasResponse.data)) {
        mascotasData = mascotasResponse.data;
      } else if (mascotasResponse.data?.data) {
        mascotasData = mascotasResponse.data.data;
      }

      const mascotasDisponibles = mascotasData.filter(
        (m) => m.estado !== "Adoptado",
      );
      setMascotas(mascotasDisponibles);
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("error_carga_datos"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleFilterChange = useCallback((filters) => {
    setCurrentFilters(filters);
  }, []);

  const mascotasFiltradas = applyFilters(currentFilters, mascotas, orden);

  const handleApadrinar = (mascota) => {
    if (!isAuthenticated) {
      localStorage.setItem(
        "intencion_apadrinar",
        JSON.stringify({
          mascota_id: mascota.id,
          timestamp: new Date().getTime(),
        }),
      );
      toast.info(t("login_requerido"));
      navigate("/login", { state: { from: "/suscripciones" } });
      return;
    }
    setSelectedMascota(mascota);
    setSelectedMembresia(null);
    setShowModal(true);
  };

  const handleMembresiaClick = (membresia) => {
    if (!isAuthenticated) {
      localStorage.setItem(
        "intencion_membresia",
        JSON.stringify({
          plan_id: membresia.id,
          timestamp: new Date().getTime(),
        }),
      );
      toast.info(t("login_requerido"));
      navigate("/login", { state: { from: "/suscripciones" } });
      return;
    }
    setSelectedMembresia(membresia);
    setSelectedMascota(null);
    setShowModal(true);
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const baseUrl =
      import.meta.env.VITE_STORAGE_URL ||
      "https://rescatando-mascotas-backend-final-production.up.railway.app";
    return path.startsWith("/storage")
      ? `${baseUrl}${path}`
      : `${baseUrl}/storage/${path}`;
  };

  if (loading) {
    return (
      <div className="suscripciones-public-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{t("cargando")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="suscripciones-public-page">
      {/* Hero Section */}
      <div className="suscripciones-hero">
        <h1>🐾 {t("titulo")}</h1>
        <p>{t("subtitulo")}</p>
        <div className="hero-stats">
          <div className="stat">
            <strong>500+</strong>
            <span>{t("animales_rescatados")}</span>
          </div>
          <div className="stat">
            <strong>200+</strong>
            <span>{t("adopciones_exitosas")}</span>
          </div>
          <div className="stat">
            <strong>1000+</strong>
            <span>{t("patrocinadores")}</span>
          </div>
        </div>
      </div>

      {/* Banner simple */}
      <div className="planes-banner-simple">
        <div className="simple-banner-content">
          <span className="puppy-emoji">🐶🐱🐾</span>
          <div className="banner-text">
            <h3>{t("banner_titulo")}</h3>
            <p>{t("banner_subtitulo")}</p>
          </div>
        </div>
      </div>

      {/* Planes de Membresía */}
      <div className="suscripciones-container">
        <div className="section-header">
          <h2>{t("planes_titulo")}</h2>
          <p>{t("planes_subtitulo")}</p>
        </div>

        <div className="planes-grid">
          {membresias.map((plan, index) => (
            <div
              key={plan.id}
              className={`plan-card ${plan.destacado ? "featured" : ""}`}
            >
              {plan.destacado && (
                <div className="plan-badge">⭐ {t("mas_popular")}</div>
              )}
              <div className="plan-icon">
                {index === 0 && "🐾"}
                {index === 1 && "💝"}
                {index === 2 && "🌟"}
              </div>
              <h3>{plan.nombre}</h3>
              <div className="plan-price">
                <span className="amount">${plan.monto?.toLocaleString()}</span>
                <span className="period">
                  /{plan.frecuencia || t("mensual")}
                </span>
              </div>
              <p className="plan-description">{plan.descripcion}</p>
              <ul className="plan-features">
                {plan.beneficios?.map((beneficio, i) => (
                  <li key={i}>
                    <span className="check">✓</span> {beneficio}
                  </li>
                ))}
              </ul>
              <button
                className={`btn-plan ${plan.destacado ? "btn-primary" : "btn-outline"}`}
                onClick={() => handleMembresiaClick(plan)}
              >
                {t("seleccionar_plan")}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mascotas para Apadrinar - ANCHO COMPLETO */}
      <div className="mascotas-section-full">
        <div className="section-header">
          <h2>{t("mascotas_titulo")}</h2>
          <p>{t("mascotas_subtitulo")}</p>
          <div className="badge-count">
            🐾 {t("mascotas_disponibles", { count: mascotasFiltradas.length })}
          </div>
        </div>

        {/* Filtros */}
        <div className="filtros-section sticky-glass glass-auto shadow-sticky">
          <div className="container">
            <FiltrosMascotas
              onFilterChange={handleFilterChange}
              especies={especies}
              mascotas={mascotas}
              isLoading={loading}
            />
          </div>
        </div>

        {/* Resultados header */}
        <div className="results-header">
          <div className="results-count">
            <i className="fas fa-list"></i> {t("mostrando")}{" "}
            <strong>{mascotasFiltradas.length}</strong> {t("de")}{" "}
            <strong>{mascotas.length}</strong> {t("mascotas")}
          </div>
          <div className="results-orden">
            <label>
              <i className="fas fa-sort"></i> {t("ordenar_por")}:
            </label>
            <CustomSelect
              options={opcionesOrden}
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              name="orden"
              placeholder={t("seleccionar_orden")}
            />
          </div>
        </div>

        {/* Grid de mascotas */}
        <div className="mascotas-grid-full">
          {mascotasFiltradas.map((mascota) => (
            <MascotaApadrinarCard
              key={mascota.id}
              mascota={mascota}
              getImageUrl={getImageUrl}
              onApadrinar={handleApadrinar}
              loading={apadrinando && selectedMascota?.id === mascota.id}
            />
          ))}
        </div>

        {mascotasFiltradas.length === 0 && (
          <div className="empty-container">
            <i className="fas fa-search"></i>
            <h3>{t("sin_resultados")}</h3>
            <p>{t("sin_resultados_desc")}</p>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="faq-section">
        <div className="section-header">
          <h2>{t("faq_titulo")}</h2>
          <p>{t("faq_subtitulo")}</p>
        </div>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>🐶 {t("faq1_pregunta")}</h4>
            <p>{t("faq1_respuesta")}</p>
          </div>
          <div className="faq-item">
            <h4>📅 {t("faq2_pregunta")}</h4>
            <p>{t("faq2_respuesta")}</p>
          </div>
          <div className="faq-item">
            <h4>🎁 {t("faq3_pregunta")}</h4>
            <p>{t("faq3_respuesta")}</p>
          </div>
          <div className="faq-item">
            <h4>❌ {t("faq4_pregunta")}</h4>
            <p>{t("faq4_respuesta")}</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <SuscripcionModal
          membresia={selectedMembresia}
          mascota={selectedMascota}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            toast.success(t("suscripcion_exitosa"));
            navigate("/user/mis-suscripciones");
          }}
        />
      )}
    </div>
  );
};

// Componente Modal
const SuscripcionModal = ({ membresia, mascota, onClose, onSuccess }) => {
  const { t } = useTranslation("suscripciones");
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    monto: membresia?.monto || mascota?.monto_sugerido || 10000,
    frecuencia: "mensual",
    mensaje_apoyo: "",
    metodo_pago: "tarjeta",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const suscripcionData = {
        user_id: user?.id,
        mascota_id: mascota?.id || null,
        monto_mensual: formData.monto,
        frecuencia: formData.frecuencia,
        fecha_inicio: new Date().toISOString().split("T")[0],
        mensaje_apoyo: formData.mensaje_apoyo,
        estado: "activo",
        plan_id: membresia?.id || null,
      };

      await suscripcionService.createPublicSuscripcion(suscripcionData);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || t("error_suscripcion"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {mascota
              ? t("apadrinar_titulo", { nombre: mascota.nombre_mascota })
              : t("plan_titulo", { nombre: membresia?.nombre })}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t("monto")}</label>
              <div className="monto-input">
                <span className="currency">$</span>
                <input
                  type="number"
                  name="monto"
                  value={formData.monto}
                  onChange={handleChange}
                  min="1000"
                  step="1000"
                  required
                />
              </div>
              <small>{t("monto_minimo")}</small>
            </div>

            <div className="form-group">
              <label>{t("frecuencia")}</label>
              <div className="frecuencia-opciones">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="frecuencia"
                    value="mensual"
                    checked={formData.frecuencia === "mensual"}
                    onChange={handleChange}
                  />
                  <span>{t("mensual")}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="frecuencia"
                    value="trimestral"
                    checked={formData.frecuencia === "trimestral"}
                    onChange={handleChange}
                  />
                  <span>{t("trimestral")}</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="frecuencia"
                    value="anual"
                    checked={formData.frecuencia === "anual"}
                    onChange={handleChange}
                  />
                  <span>{t("anual")}</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>{t("mensaje_apoyo")}</label>
              <textarea
                name="mensaje_apoyo"
                rows="3"
                placeholder={t("mensaje_placeholder")}
                value={formData.mensaje_apoyo}
                onChange={handleChange}
              />
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn-cancel">
                {t("cancelar")}
              </button>
              <button type="submit" className="btn-confirm" disabled={loading}>
                {loading ? t("procesando") : t("confirmar")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SuscripcionesPublicIndex;
