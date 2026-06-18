// src/pages/public/Fundaciones/FundacionDetalle.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  Mail,
  Heart,
  FileText,
  PawPrint,
  ExternalLink,
  CheckCircle,
  Users,
  Award,
  Clock,
} from "lucide-react";
import api from "../../../services/api";
import { getImageUrl } from "../../../utils/imageUtils";
import { SimpleLoadingBar } from "../../../components/common/ProgressBar/ProgressBar";
import "./FundacionesDetalle.css";

const MapaSimple = ({ direccion, nombre, lat, lng }) => {
  const { t } = useTranslation("fundaciones");
  
  let mapUrl;
  if (lat && lng && parseFloat(lat) !== 0 && parseFloat(lng) !== 0) {
    mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  } else if (direccion) {
    const encodedAddress = encodeURIComponent(direccion);
    mapUrl = `https://maps.google.com/maps?q=${encodedAddress}&z=15&output=embed`;
  } else {
    mapUrl = `https://maps.google.com/maps?q=6.2442,-75.5812&z=13&output=embed`;
  }
  
  let googleMapsUrl;
  if (lat && lng && parseFloat(lat) !== 0 && parseFloat(lng) !== 0) {
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  } else {
    googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccion || '')}`;
  }

  return (
    <div className="detalle-mapa-container">
      <iframe
        title={`Mapa de ${nombre}`}
        src={mapUrl}
        width="100%"
        height="280"
        style={{ border: 0, borderRadius: "8px" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="detalle-mapa-footer">
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="detalle-mapa-link-externo"
        >
          <MapPin size={14} />
          {t("abrir_maps")}
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );
};

const FundacionDetalle = ({ fundacionId, embed = false }) => {
  const { id: urlId } = useParams();
  const id = fundacionId || urlId;
  const { t } = useTranslation("fundaciones");
  const [fundacion, setFundacion] = useState(null);
  const [necesidades, setNecesidades] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);

  const resolveImageUrl = useCallback((url) => {
    if (!url) return null;
    return getImageUrl(url);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    const loadData = async () => {
      if (!id) return;
      
      setLoading(true);
      setLoadProgress(0);
      setError(null);
      
      const progressInterval = setInterval(() => {
        setLoadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 15;
        });
      }, 100);
      
      try {
        const response = await api.get(`/fundaciones/${id}`, {
          params: {
            fields: 'id,Nombre_1,Descripcion,ciudad,Direccion,Telefono,Email,horario_atencion,registro_sanitario,recibe_voluntarios,fecha_fundacion,imagen_portada,updated_at,lat,lng,total_rescatadas,total_adoptadas,anios_experiencia',
            include: 'mascotas,necesidades'
          }
        });

        let fundacionData = null;
        let necesidadesData = [];
        let mascotasData = [];
        let estadisticasData = null;

        if (response.data && response.data.fundacion) {
          fundacionData = response.data.fundacion;
          necesidadesData = response.data.necesidades || [];
          mascotasData = response.data.mascotas || [];
          estadisticasData = response.data.estadisticas || null;
        } else if (response.data && response.data.id && response.data.Nombre_1) {
          fundacionData = response.data;
          necesidadesData = response.data.necesidades_actuales || [];
        } else if (response.data && response.data.success === true && response.data.data) {
          if (response.data.data.fundacion) {
            fundacionData = response.data.data.fundacion;
            necesidadesData = response.data.data.necesidades || [];
            mascotasData = response.data.data.mascotas || [];
          } else {
            fundacionData = response.data.data;
            necesidadesData = fundacionData.necesidades_actuales || [];
          }
        }

        if (!fundacionData) {
          throw new Error(`No se encontró la fundación con ID ${id}`);
        }

        setLoadProgress(100);
        setTimeout(() => {
          setFundacion(fundacionData);
          setNecesidades(necesidadesData);
          setMascotas(mascotasData);
          setEstadisticas(estadisticasData);
          setLoading(false);
        }, 300);
        
      } catch (error) {
        if (error.name === "CanceledError" || error.name === "AbortError") {
          return;
        }
        console.error("Error:", error);
        setLoadProgress(100);
        setTimeout(() => {
          setError(error.message || t("error_carga"));
          setLoading(false);
        }, 300);
      } finally {
        clearInterval(progressInterval);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [id, t]);

  if (loading) {
    return (
      <SimpleLoadingBar 
        progress={loadProgress}
        height="12px"
        variant="gradient"
      />
    );
  }

  if (error || !fundacion) {
    return (
      <div className="fundacion-detalle-page">
        <div className="detalle-container">
          <div className="detalle-error-card">
            <Building size={48} />
            <h4>{t("error_titulo")}</h4>
            <p>{error || t("no_encontrada")}</p>
            {!embed && <Link to="/fundaciones" className="detalle-btn-back">{t("volver")}</Link>}
          </div>
        </div>
      </div>
    );
  }

  const totalMascotas = mascotas.length;
  const totalRescatadas = estadisticas?.total_rescatadas || fundacion.total_rescatadas || totalMascotas;
  const totalAdoptadas = estadisticas?.total_adoptadas || fundacion.total_adoptadas || 0;
  const aniosExperiencia = estadisticas?.anios_experiencia || fundacion.anios_experiencia || 0;

  return (
    <div className="fundacion-detalle-page">
      {!embed && (
        <div className="detalle-back-outer reveal-up delay-100">
          <Link to="/fundaciones" className="detalle-back-link">
            <ArrowLeft size={16} />
            <span>{t("volver")}</span>
          </Link>
        </div>
      )}

      <div className="detalle-bento-grid">
        {/* Header - Título y información básica */}
        <div className="detalle-header reveal-up delay-150">
          <h1>{fundacion.Nombre_1}</h1>
          <div className="detalle-header-info">
            {fundacion.ciudad && (
              <div className="detalle-ciudad">
                <MapPin size={14} />
                <span>{fundacion.ciudad}</span>
              </div>
            )}
            {fundacion.verificado && (
              <div className="detalle-verified">
                <CheckCircle size={14} />
                <span>{t("verificado")}</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar izquierda */}
        <div className="detalle-sidebar">
          {/* Contacto */}
          <div className="detalle-info-card reveal-left delay-200">
            <div className="detalle-card-header">
              <Phone size={16} />
              <h3>{t("contacto")}</h3>
            </div>
            {fundacion.Direccion && (
              <div className="detalle-field">
                <label>{t("direccion")}</label>
                <p>{fundacion.Direccion}</p>
              </div>
            )}
            {fundacion.Telefono && (
              <div className="detalle-field">
                <label>{t("telefono")}</label>
                <p>{fundacion.Telefono}</p>
              </div>
            )}
            {fundacion.Email && (
              <div className="detalle-field">
                <label>{t("email")}</label>
                <p>{fundacion.Email}</p>
              </div>
            )}
            {fundacion.horario_atencion && (
              <div className="detalle-field">
                <label>{t("horario")}</label>
                <p>{fundacion.horario_atencion}</p>
              </div>
            )}
          </div>

          {/* Datos de la fundación */}
          <div className="detalle-info-card reveal-left delay-250">
            <div className="detalle-card-header">
              <Heart size={16} />
              <h3>{t("datos")}</h3>
            </div>
            {fundacion.registro_sanitario && (
              <div className="detalle-field">
                <label>{t("registro_sanitario")}</label>
                <p>{fundacion.registro_sanitario}</p>
              </div>
            )}
            {fundacion.recibe_voluntarios !== undefined && (
              <div className="detalle-field">
                <label>{t("voluntarios")}</label>
                <p>{fundacion.recibe_voluntarios ? t("si_recibe") : t("no_recibe")}</p>
              </div>
            )}
            {fundacion.fecha_fundacion && (
              <div className="detalle-field">
                <label>{t("fundada")}</label>
                <p>{new Date(fundacion.fecha_fundacion).getFullYear()}</p>
              </div>
            )}
          </div>

          {/* Estadísticas de impacto */}
          <div className="detalle-info-card reveal-left delay-300">
            <div className="detalle-card-header">
              <Award size={16} />
              <h3>{t("impacto")}</h3>
            </div>
            <div className="detalle-stats-grid">
              <div className="detalle-stat-card">
                <div className="detalle-stat-number">{totalMascotas}</div>
                <div className="detalle-stat-label">{t("mascotas_actuales")}</div>
              </div>
              <div className="detalle-stat-card">
                <div className="detalle-stat-number">{totalRescatadas}</div>
                <div className="detalle-stat-label">{t("rescatadas")}</div>
              </div>
              <div className="detalle-stat-card">
                <div className="detalle-stat-number">{totalAdoptadas}</div>
                <div className="detalle-stat-label">{t("adoptadas")}</div>
              </div>
              <div className="detalle-stat-card">
                <div className="detalle-stat-number">{aniosExperiencia || "—"}</div>
                <div className="detalle-stat-label">{t("años")}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Imagen */}
        <div className="detalle-imagen-wrapper reveal-scale delay-200">
          <img 
            src={fundacion.imagen_portada ? resolveImageUrl(fundacion.imagen_portada) : "https://placehold.co/800x450/667eea/FFFFFF?text=Fundación"} 
            alt={fundacion.Nombre_1} 
            className="detalle-imagen"
          />
        </div>

        {/* Contenido principal */}
        <div className="detalle-main">
          {/* Descripción */}
          {fundacion.Descripcion && (
            <div className="detalle-section reveal-up delay-200">
              <div className="detalle-section-header">
                <FileText size={16} />
                <h3>{t("descripcion")}</h3>
              </div>
              <p className="detalle-descripcion-text">{fundacion.Descripcion}</p>
            </div>
          )}

          {/* Necesidades */}
          {necesidades.length > 0 && (
            <div className="detalle-section reveal-up delay-250">
              <div className="detalle-section-header">
                <Heart size={16} />
                <h3>{t("necesidades")}</h3>
              </div>
              <div className="detalle-tags">
                {necesidades.map((item, index) => (
                  <span key={index} className="detalle-tag">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mascotas en adopción */}
          {mascotas.length > 0 && (
            <div className="detalle-section reveal-up delay-300">
              <div className="detalle-section-header">
                <PawPrint size={16} />
                <h3>{t("mascotas_en_adopcion")}</h3>
              </div>
              <div className="detalle-mascotas-grid stagger-children">
                {mascotas.slice(0, 4).map((mascota) => (
                  <Link
                    key={mascota.id}
                    to={`/mascota/${mascota.id}`}
                    className="detalle-mascota-card"
                  >
                    <div className="detalle-mascota-img">
                      {mascota.foto_principal ? (
                        <img
                          src={resolveImageUrl(mascota.foto_principal)}
                          alt={mascota.nombre_mascota}
                          loading="lazy"
                        />
                      ) : (
                        <div className="detalle-mascota-placeholder">
                          <PawPrint size={20} />
                        </div>
                      )}
                    </div>
                    <div className="detalle-mascota-info">
                      <strong>{mascota.nombre_mascota}</strong>
                      <span>{mascota.especie}</span>
                    </div>
                  </Link>
                ))}
              </div>
              {mascotas.length > 4 && (
                <Link to={`/mascotas?fundacion=${id}`} className="detalle-ver-mas">
                  {t("ver_todas")} ({mascotas.length})
                </Link>
              )}
            </div>
          )}

          {/* Mapa */}
          {fundacion.Direccion && (
            <div className="detalle-section reveal-up delay-350">
              <div className="detalle-section-header">
                <MapPin size={16} />
                <h3>{t("ubicacion")}</h3>
              </div>
              <div className="detalle-mapa-wrapper">
                <MapaSimple
                  direccion={fundacion.Direccion}
                  nombre={fundacion.Nombre_1}
                  lat={fundacion.lat}
                  lng={fundacion.lng}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="detalle-footer reveal-fade delay-400">
        <Clock size={14} />
        <small>{t("actualizado")}: {new Date(fundacion.updated_at || Date.now()).toLocaleDateString()}</small>
      </div>
    </div>
  );
};

export default FundacionDetalle;