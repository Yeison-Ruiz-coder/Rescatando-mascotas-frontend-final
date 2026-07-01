// src/pages/fundacion/eventos/EventosIndex.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, List, Heart, Loader, X, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import { getImageUrl as buildImageUrl } from "../../../utils/imageUtils";
import ProfileBanner from "../../../components/common/ProfileBanner/ProfileBanner";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import EventoCardFundacion from "../../../components/common/EventoCardFundacion/EventoCardFundacion";
import CustomSelect from "../../../components/common/CustomSelect/CustomSelect";
import FiltrosEventos from "../../../components/common/FiltrosEventos/FiltrosEventos";
import "./EventosIndex.css";

const EventosIndex = () => {
  const { t, i18n } = useTranslation("eventos");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orden, setOrden] = useState("reciente");
  const [currentFilters, setCurrentFilters] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const fundacionName = user?.nombre || user?.name || t("fundacion");
  const fundacionAvatar = user?.avatar || user?.foto_perfil || null;

  const opcionesOrden = useMemo(() => [
    { value: "reciente", label: t("mas_recientes") },
    { value: "antiguos", label: t("mas_antiguos") },
    { value: "nombre", label: t("nombre_az") },
    { value: "capacidad", label: t("mayor_capacidad") },
  ], [t, i18n.language]);

  const getImageUrl = useCallback((url) => buildImageUrl(url), []);

  // Detectar móvil
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Aplicar filtros locales
  const applyFilters = useCallback((filters, data, sortOrder) => {
    if (!data.length) {
      setEventosFiltrados([]);
      return;
    }
    
    let resultado = [...data];

    if (filters.buscar && filters.buscar.trim()) {
      const busquedaLower = filters.buscar.toLowerCase().trim();
      resultado = resultado.filter(
        (e) =>
          e.nombre_evento?.toLowerCase().includes(busquedaLower) ||
          e.lugar_evento?.toLowerCase().includes(busquedaLower) ||
          e.categoria?.toLowerCase().includes(busquedaLower)
      );
    }

    if (filters.categoria && filters.categoria.trim()) {
      resultado = resultado.filter(
        (e) => e.categoria?.toLowerCase() === filters.categoria.toLowerCase()
      );
    }

    // Ordenar
    switch (sortOrder) {
      case "nombre":
        resultado.sort((a, b) => a.nombre_evento?.localeCompare(b.nombre_evento));
        break;
      case "antiguos":
        resultado.sort((a, b) => new Date(a.fecha_evento) - new Date(b.fecha_evento));
        break;
      case "capacidad":
        resultado.sort((a, b) => (b.capacidad_maxima || 0) - (a.capacidad_maxima || 0));
        break;
      default:
        resultado.sort((a, b) => new Date(b.fecha_evento) - new Date(a.fecha_evento));
        break;
    }

    setEventosFiltrados(resultado);
  }, []);

  // Cargar eventos
  const loadEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/entity/eventos`, {
        params: {
          fields: 'id,nombre_evento,lugar_evento,descripcion,fecha_evento,fecha_fin,capacidad_maxima,costo,organizador,telefono_contacto,email_contacto,categoria,tags,imagen_url,likes,total_asistentes,created_at',
          sort: 'created_at',
          order: 'desc',
        }
      });

      let eventosData = [];
      if (response.data && response.data.success !== undefined) {
        eventosData = response.data.data?.data || response.data.data || [];
      } else if (response.data && response.data.data) {
        eventosData = response.data.data.data || response.data.data;
      } else if (Array.isArray(response.data)) {
        eventosData = response.data;
      }

      setEventos(eventosData);
      applyFilters(currentFilters, eventosData, orden);
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || t("error_carga"));
      setEventos([]);
      setEventosFiltrados([]);
    } finally {
      setLoading(false);
    }
  }, [t, currentFilters, orden, applyFilters]);

  useEffect(() => {
    loadEventos();
  }, [loadEventos]);

  // Cuando cambian filtros u orden, reaplicar
  useEffect(() => {
    applyFilters(currentFilters, eventos, orden);
  }, [currentFilters, orden, eventos, applyFilters]);

  const handleFilterChange = useCallback((filters) => {
    setCurrentFilters(filters);
  }, []);

  const handleClearFilters = () => {
    setCurrentFilters({});
  };

  const handleOrdenChange = (newOrden) => {
    setOrden(newOrden);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirm_delete"))) return;
    try {
      await api.delete(`/entity/eventos/${id}`);
      toast.success(t("evento_eliminado"));
      loadEventos();
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || t("error_delete"));
    }
  };

  if (loading) {
    return (
      <div className="fundacion-eventos-page">
        <LoadingSpinner text={t("cargando_eventos")} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fundacion-eventos-page">
        <div className="container">
          <div className="fundacion-eventos-error">
            <Calendar size={48} />
            <h4>{t("error_titulo")}</h4>
            <p>{error}</p>
            <button onClick={loadEventos} className="fundacion-btn-retry">
              <Loader size={16} />
              {t("reintentar")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const totalEventos = eventos.length;
  const totalFiltrados = eventosFiltrados.length;

  return (
    <div className="fundacion-eventos-page">
      <ProfileBanner
        user={{
          nombre: fundacionName,
          avatar: fundacionAvatar,
          titulo: t("banner.titulo", {
            defaultValue: "{{count}} eventos gestionados",
            count: totalEventos,
          }),
          solicitudes: 0,
          adopciones: 0,
          eventos: totalEventos,
        }}
        showEventStats={true}
      />

      <div className="fundacion-eventos-wrapper">
        <div className="fundacion-eventos-header">
          <div className="fundacion-eventos-header-left">
            <h1>
              <Calendar size={28} />
              {t("mis_eventos")}
            </h1>
            <p className="subtitle">{t("mis_eventos_desc")}</p>
          </div>
          <div className="fundacion-eventos-header-right">
            <Link to="/veterinaria/eventos/crear" className="fundacion-btn-crear">
              <Plus size={18} />
              {t("crear_evento")}
            </Link>
          </div>
        </div>

        <div className="fundacion-eventos-filtros-section">
          <FiltrosEventos 
            onFilterChange={handleFilterChange}
            eventos={eventos}
            isLoading={loading}
          />
        </div>

        <div className="fundacion-eventos-resultados-section">
          <div className="fundacion-eventos-resultados-header">
            <div className="fundacion-eventos-resultados-count">
              <List size={16} />
              {t("mostrando")} <strong>{totalFiltrados}</strong>{" "}
              {t("de")} <strong>{totalEventos}</strong> {t("eventos")}
            </div>
            <div className="fundacion-eventos-resultados-orden">
              <label>{t("ordenar_por")}:</label>
              <CustomSelect
                options={opcionesOrden}
                value={orden}
                onChange={(e) => handleOrdenChange(e.target.value)}
                name="orden"
              />
            </div>
          </div>

          {totalFiltrados === 0 ? (
            <div className="fundacion-eventos-empty">
              <Calendar size={64} />
              <h3>{t("sin_resultados")}</h3>
              <p>{t("sin_resultados_desc")}</p>
              {(currentFilters.buscar || currentFilters.categoria) && (
                <button onClick={handleClearFilters} className="fundacion-btn-limpiar-empty">
                  <X size={16} />
                  {t("limpiar_filtros")}
                </button>
              )}
            </div>
          ) : (
            <div className="fundacion-eventos-grid bento-grid">
              {eventosFiltrados.map((evento) => (
                <EventoCardFundacion
                  key={evento.id}
                  evento={evento}
                  getImageUrl={getImageUrl}
                  onDelete={handleDelete}
                  onEdit={(id) => navigate(`/veterinaria/eventos/${id}/editar`)}
                  basePath="/veterinaria/eventos"
                  showActions={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventosIndex;