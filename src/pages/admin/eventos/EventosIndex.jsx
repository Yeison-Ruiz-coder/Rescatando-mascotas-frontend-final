// src/pages/admin/eventos/EventosIndex.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Loader,
  Users,
  Heart,
  MapPin,
  CalendarDays,
  Globe,
  Home,
  Image,
} from "lucide-react";
import api from "../../../services/api";
import FiltrosEventos from "../../../components/common/FiltrosEventos/FiltrosEventos";
import "./EventosIndex.css";

const AdminEventosIndex = () => {
  const { t } = useTranslation("eventos");
  const [eventos, setEventos] = useState([]);
  const [eventosFiltrados, setEventosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  const getImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const baseUrl =
      import.meta.env.VITE_STORAGE_URL ||
      "https://rescatando-mascotas-backend-final-production.up.railway.app";
    return url.startsWith("/storage")
      ? `${baseUrl}${url}`
      : `${baseUrl}/storage/${url}`;
  }, []);

  // Aplicar filtros a los eventos
  const applyFilters = useCallback((filters, data) => {
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
          e.categoria?.toLowerCase().includes(busquedaLower) ||
          e.fundacion?.Nombre_1?.toLowerCase().includes(busquedaLower)
      );
    }

    if (filters.categoria && filters.categoria.trim()) {
      resultado = resultado.filter(
        (e) => e.categoria?.toLowerCase() === filters.categoria.toLowerCase()
      );
    }

    setEventosFiltrados(resultado);
  }, []);

  const loadEventos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/admin/eventos?per_page=100`);

      let eventosData = [];
      let statsData = null;

      if (response.data && response.data.success !== undefined) {
        eventosData = response.data.data?.data || response.data.data || [];
        statsData = response.data.estadisticas || null;
      } else if (response.data && response.data.data) {
        eventosData = response.data.data.data || response.data.data;
      } else if (Array.isArray(response.data)) {
        eventosData = response.data;
      } else {
        eventosData = [];
      }

      const eventosArray = Array.isArray(eventosData)
        ? eventosData
        : eventosData?.data
          ? eventosData.data
          : [];

      setEventos(eventosArray);
      setEstadisticas(statsData);
      applyFilters(currentFilters, eventosArray);
    } catch (error) {
      console.error("Error:", error);
      setError(error.response?.data?.message || t("error_load"));
      setEventos([]);
      setEventosFiltrados([]);
    } finally {
      setLoading(false);
    }
  }, [t, currentFilters, applyFilters]);

  useEffect(() => {
    loadEventos();
  }, [loadEventos]);

  // Cuando cambian los filtros, reaplicar
  useEffect(() => {
    applyFilters(currentFilters, eventos);
  }, [currentFilters, eventos, applyFilters]);

  const handleFilterChange = useCallback((filters) => {
    setCurrentFilters(filters);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirm_delete"))) return;

    setDeletingId(id);
    try {
      await api.delete(`/admin/eventos/${id}`);
      await loadEventos();
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || t("error_delete"));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="admin-eventos-page">
        <div className="admin-eventos-loading">
          <Loader size={40} className="spinner" />
          <p>{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-eventos-page">
        <div className="container">
          <div className="admin-eventos-error">
            <Calendar size={48} />
            <h4>{t("error_title")}</h4>
            <p>{error}</p>
            <button onClick={loadEventos} className="admin-btn-retry">
              <Loader size={16} />
              {t("retry")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-eventos-page">
      <div className="admin-eventos-header">
        <div className="container">
          <h1>
            <Calendar size={28} />
            {t("event_management")}
          </h1>
          <p className="subtitle">{t("event_management_desc")}</p>
          {eventos.length > 0 && (
            <p className="info">
              <Heart size={14} style={{ color: "var(--color-heart)" }} />{" "}
              {t("total_events", { total: eventos.length })}
            </p>
          )}
        </div>
      </div>

      {estadisticas && (
        <div className="admin-eventos-stats">
          <div className="container">
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-value">
                  {estadisticas.total || 0}
                </div>
                <div className="admin-stat-label">{t("total_events")}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-value">
                  {estadisticas.proximos || 0}
                </div>
                <div className="admin-stat-label">{t("upcoming")}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-value">
                  {estadisticas.pasados || 0}
                </div>
                <div className="admin-stat-label">{t("past")}</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-value">
                  {estadisticas.este_mes || 0}
                </div>
                <div className="admin-stat-label">{t("this_month")}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="admin-eventos-filtros-section">
        <div className="container">
          <FiltrosEventos 
            onFilterChange={handleFilterChange}
            variant={isMobile ? "modal" : "inline"} 
          />
        </div>
      </div>

      <div className="admin-eventos-resultados-section">
        <div className="container">
          <div className="admin-eventos-resultados-header">
            <div className="admin-eventos-resultados-count">
              {t("showing")} <strong>{eventosFiltrados.length}</strong> {t("of")}{" "}
              <strong>{eventos.length}</strong> {t("events")}
            </div>
            <Link to="/admin/eventos/crear" className="admin-btn-crear">
              <Plus size={18} />
              {t("create_event")}
            </Link>
          </div>

          {eventosFiltrados.length === 0 ? (
            <div className="admin-eventos-empty">
              <Calendar size={64} />
              <h3>{t("no_events")}</h3>
              <p>{t("no_events_desc")}</p>
            </div>
          ) : (
            <div className="admin-tabla-contenedor">
              <table className="admin-tabla">
                <thead>
                  <tr>
                    <th>{t("image")}</th>
                    <th>{t("event_name")}</th>
                    <th>{t("foundation")}</th>
                    <th>{t("type")}</th>
                    <th>{t("location")}</th>
                    <th>{t("date")}</th>
                    <th>{t("attendees")}</th>
                    <th>{t("likes")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosFiltrados.map((evento) => (
                    <tr key={evento.id}>
                      <td className="admin-col-imagen">
                        {evento.imagen_url ? (
                          <img
                            src={getImageUrl(evento.imagen_url)}
                            alt={evento.nombre_evento}
                            onError={(e) => {
                              e.target.src = "/placeholder-event.png";
                            }}
                          />
                        ) : (
                          <div className="admin-imagen-placeholder">
                            <Image size={20} />
                          </div>
                        )}
                      </td>
                      <td className="admin-titulo-evento">
                        <strong>{evento.nombre_evento}</strong>
                        <span className="admin-descripcion-corta">
                          {evento.descripcion?.substring(0, 50)}...
                        </span>
                      </td>
                      <td>
                        {evento.fundacion?.Nombre_1 ||
                          evento.fundacion?.nombre ||
                          "-"}
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${evento.tipo === "admin" ? "admin-badge-admin" : "admin-badge-fundacion"}`}
                        >
                          {evento.tipo === "admin" ? (
                            <Globe size={12} />
                          ) : (
                            <Home size={12} />
                          )}
                          <span>
                            {evento.tipo === "admin" ? t("global") : t("foundation")}
                          </span>
                        </span>
                      </td>
                      <td>
                        <div className="admin-cell-with-icon">
                          <MapPin size={14} />
                          <span>{evento.lugar_evento}</span>
                        </div>
                      </td>
                      <td>
                        <div className="admin-cell-with-icon">
                          <CalendarDays size={14} />
                          <span>
                            {new Date(evento.fecha_evento).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="admin-stat-asistentes">
                          <Users size={12} />
                          {evento.total_asistentes || 0}
                        </span>
                      </td>
                      <td>
                        <span className="admin-stat-likes">
                          <Heart size={12} />
                          {evento.likes || 0}
                        </span>
                      </td>
                      <td className="admin-acciones">
                        <Link
                          to={`/admin/eventos/${evento.id}`}
                          className="admin-btn-accion admin-btn-ver"
                          title={t("view_details")}
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/admin/eventos/${evento.id}/editar`}
                          className="admin-btn-accion admin-btn-editar"
                          title={t("edit")}
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(evento.id)}
                          className="admin-btn-accion admin-btn-eliminar"
                          disabled={deletingId === evento.id}
                          title={t("delete")}
                        >
                          {deletingId === evento.id ? (
                            <div className="admin-spinner-small"></div>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEventosIndex;