import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { suscripcionService } from "../../../services/suscripcionService";
import api from "../../../services/api";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import MascotaApadrinarCard from "../../../components/common/MascotaApadrinarCard/MascotaApadrinarCard";
import FiltrosMascotas from "../../../components/common/FiltrosMascotas/FiltrosMascotas";
import CustomSelect from "../../../components/common/CustomSelect/CustomSelect";
import { getImageUrl as buildImageUrl } from "../../../utils/imageUtils";
import "./SuscripcionesPublicIndex.css";

// ✅ Lazy load del modal
const ModalApadrinar = lazy(() => import("../../../components/common/ModalApadrinar/ModalApadrinar"));

const SuscripcionesPublicIndex = () => {
  const { t } = useTranslation("suscripciones");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orden, setOrden] = useState("reciente");
  const [currentFilters, setCurrentFilters] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [apadrinando, setApadrinando] = useState(false);
  const [mensajeModal, setMensajeModal] = useState({ tipo: '', texto: '' });
  
  const [visibleCount, setVisibleCount] = useState(6);
  const ITEMS_PER_PAGE = 6;

  const especies = ["Perro", "Gato", "Conejo", "Ave", "Otro"];

  const opcionesOrden = [
    { value: "reciente", label: t("mas_recientes") },
    { value: "nombre", label: t("nombre_az") },
    { value: "edad_asc", label: t("edad_asc") },
    { value: "edad_desc", label: t("edad_desc") },
  ];

  const planesApadrinamiento = [
    {
      id: "basico",
      nombre: "Amigo Fiel",
      monto: 10000,
      frecuencia: "mensual",
      icon: "🐶",
      destacado: false,
      beneficios: [
        "Certificado digital de apadrinamiento",
        "Actualización mensual de tu ahijado",
        "Calcomanía virtual exclusiva",
      ],
      color: "var(--color-primary, #667eea)",
    },
    {
      id: "premium",
      nombre: "Guardian Especial",
      monto: 25000,
      frecuencia: "mensual",
      icon: "💝",
      destacado: true,
      beneficios: [
        "Certificado premium con foto",
        "Actualizaciones semanales",
        "Fotos exclusivas de tu mascota",
        "Descuento 15% en tienda",
      ],
      color: "var(--color-secondary, #764ba2)",
    },
    {
      id: "vitalicio",
      nombre: "Super Patrocinador",
      monto: 50000,
      frecuencia: "mensual",
      icon: "🌟",
      destacado: false,
      beneficios: [
        "Certificado especial con tu nombre",
        "Visitas mensuales a tu ahijado",
        "Nombre en placa de agradecimiento",
        "Descuento 20% en tienda",
      ],
      color: "var(--color-accent, #ff6b9d)",
    },
  ];

  const applyFilters = useCallback((filters, data, sortOrder) => {
    if (!data.length) return [];

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

      const mascotasResponse = await api.get(
        "/mascotas?estado=En adopcion&fields=id,nombre_mascota,especie,raza,edad_aprox,genero,descripcion,estado,foto_principal&limit=20"
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
        (m) => m.estado !== "Adoptado"
      );

      setMascotas(mascotasDisponibles);
    } catch (error) {
      console.error("Error cargando datos:", error);
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
  const mascotasVisibles = mascotasFiltradas.slice(0, visibleCount);

  const handleCargarMas = () => {
    setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
  };

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

    setMascotaSeleccionada(mascota);
    setSelectedPlan(null);
    setMensajeModal({ tipo: '', texto: '' });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setMascotaSeleccionada(null);
    setSelectedPlan(null);
    setApadrinando(false);
    setMensajeModal({ tipo: '', texto: '' });
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setMensajeModal({ tipo: '', texto: '' });
  };

  const handleConfirmarApadrinar = async () => {
    if (!selectedPlan) {
      setMensajeModal({
        tipo: 'error',
        texto: '⚠️ ' + t("seleccionar_plan_error")
      });
      return;
    }

    if (!isAuthenticated) {
      setMensajeModal({
        tipo: 'error',
        texto: '🔑 ' + t("login_requerido")
      });
      setTimeout(() => {
        closeModal();
        navigate('/login');
      }, 1500);
      return;
    }

    setApadrinando(true);
    setMensajeModal({ tipo: 'info', texto: '⏳ ' + t("procesando") });

    try {
      const suscripcionData = {
        mascota_id: mascotaSeleccionada?.id,
        monto_mensual: selectedPlan.monto,
        frecuencia: selectedPlan.frecuencia || "mensual",
        mensaje_apoyo: t("mensaje_apoyo_apadrinar", {
          nombre: mascotaSeleccionada?.nombre_mascota,
          plan: selectedPlan.nombre
        }),
      };

      await suscripcionService.crearSuscripcion(suscripcionData);

      setMensajeModal({
        tipo: 'success',
        texto: `🎉 ${t("apadrinamiento_exitoso", { nombre: mascotaSeleccionada?.nombre_mascota })}`
      });

      toast.success(t("apadrinamiento_exitoso_toast", { nombre: mascotaSeleccionada?.nombre_mascota }));

      setTimeout(() => {
        closeModal();
        cargarDatos();
      }, 2500);

    } catch (error) {
      let errorMsg = t("error_general");
      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = Object.values(error.response.data.errors);
        if (errors.length > 0 && Array.isArray(errors[0])) {
          errorMsg = errors[0][0];
        } else if (errors.length > 0) {
          errorMsg = errors[0];
        }
      }

      setMensajeModal({
        tipo: 'error',
        texto: `❌ ${errorMsg}`
      });

      toast.error(errorMsg);
    } finally {
      setApadrinando(false);
    }
  };

  const getImageUrl = useCallback((path) => buildImageUrl(path), []);

  if (loading) {
    return (
      <div className="sp-suscripciones-page">
        <div className="sp-loading-container">
          <div className="sp-spinner"></div>
          <p>{t("cargando")}</p>
        </div>
      </div>
    );
  }

  const hasMore = visibleCount < mascotasFiltradas.length;

  return (
    <div className="sp-suscripciones-page">
      {/* Hero Section */}
      <div className="sp-hero">
        <h1 className="sp-hero-title">🌟 {t("titulo")}</h1>
        <p className="sp-hero-subtitle">{t("subtitulo")}</p>
        <div className="sp-hero-stats">
          <div className="sp-hero-stat">
            <strong>500+</strong>
            <span>{t("animales_rescatados")}</span>
          </div>
          <div className="sp-hero-stat">
            <strong>200+</strong>
            <span>{t("adopciones_exitosas")}</span>
          </div>
          <div className="sp-hero-stat">
            <strong>1000+</strong>
            <span>{t("patrocinadores")}</span>
          </div>
        </div>
      </div>

      {/* Banner simple */}
      <div className="sp-banner">
        <div className="sp-banner-content">
          <span className="sp-banner-emoji">🐶🐱🐾</span>
          <div className="sp-banner-text">
            <h3>{t("banner_titulo")}</h3>
            <p>{t("banner_subtitulo")}</p>
          </div>
        </div>
      </div>

      {/* Mascotas para Apadrinar */}
      <div className="sp-mascotas-section">
        <div className="sp-section-header">
          <h2>🐾 {t("mascotas_titulo")}</h2>
          <p>{t("mascotas_subtitulo")}</p>
          <div className="sp-badge-count">
            🐾 {t("mascotas_disponibles", { count: mascotasFiltradas.length })}
          </div>
        </div>

        <div className="sp-filtros-wrapper">
          <FiltrosMascotas
            onFilterChange={handleFilterChange}
            especies={especies}
            mascotas={mascotas}
            isLoading={loading}
          />
        </div>

        <div className="sp-results-header">
          <div className="sp-results-count">
            <i className="fas fa-list"></i> {t("mostrando")}{" "}
            <strong>{mascotasVisibles.length}</strong> {t("de")}{" "}
            <strong>{mascotasFiltradas.length}</strong> {t("mascotas")}
          </div>
          <div className="sp-results-orden">
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

        <div className="sp-mascotas-grid">
          {mascotasVisibles.map((mascota) => (
            <MascotaApadrinarCard
              key={mascota.id}
              mascota={mascota}
              getImageUrl={getImageUrl}
              onApadrinar={handleApadrinar}
              loading={false}
            />
          ))}
        </div>

        {mascotasFiltradas.length === 0 && (
          <div className="sp-empty">
            <i className="fas fa-search"></i>
            <h3>{t("sin_resultados")}</h3>
            <p>{t("sin_resultados_desc")}</p>
          </div>
        )}

        {hasMore && (
          <div className="sp-load-more-wrapper">
            <button className="sp-btn-load-more" onClick={handleCargarMas}>
              {t("cargar_mas")} ({mascotasFiltradas.length - visibleCount} {t("restantes")})
            </button>
          </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="sp-faq-section">
        <div className="sp-section-header">
          <h2>{t("faq_titulo")}</h2>
          <p>{t("faq_subtitulo")}</p>
        </div>
        <div className="sp-faq-grid">
          <div className="sp-faq-item">
            <h4>🐶 {t("faq1_pregunta")}</h4>
            <p>{t("faq1_respuesta")}</p>
          </div>
          <div className="sp-faq-item">
            <h4>📅 {t("faq2_pregunta")}</h4>
            <p>{t("faq2_respuesta")}</p>
          </div>
          <div className="sp-faq-item">
            <h4>🎁 {t("faq3_pregunta")}</h4>
            <p>{t("faq3_respuesta")}</p>
          </div>
          <div className="sp-faq-item">
            <h4>❌ {t("faq4_pregunta")}</h4>
            <p>{t("faq4_respuesta")}</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Suspense fallback={<div className="sp-modal-loading"><div className="sp-spinner-small"></div></div>}>
        <ModalApadrinar
          isOpen={showModal}
          mascota={mascotaSeleccionada}
          planes={planesApadrinamiento}
          selectedPlan={selectedPlan}
          mensaje={mensajeModal}
          apadrinando={apadrinando}
          onClose={closeModal}
          onSelectPlan={handleSelectPlan}
          onConfirmar={handleConfirmarApadrinar}
          getImageUrl={getImageUrl}
        />
      </Suspense>
    </div>
  );
};

export default SuscripcionesPublicIndex;