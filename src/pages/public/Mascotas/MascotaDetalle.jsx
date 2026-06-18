// src/pages/public/Mascotas/MascotaDetalle.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "lucide-react";
import api from "../../../services/api";
import { getImageUrl } from "../../../utils/imageUtils";
import { SimpleLoadingBar } from "../../../components/common/ProgressBar/ProgressBar";
import MascotaHero from "./components/MascotaHero";
import MascotaResumen from "./components/MascotaResumen";
import MascotaHistoria from "./components/MascotaHistoria";
import MascotaDetalles from "./components/MascotaDetalles";
import MascotaCompatibilidad from "./components/MascotaCompatibilidad";
import MascotaSalud from "./components/MascotaSalud";
import MascotaAcciones from "./components/MascotaAcciones";
import MascotaFundacion from "./components/MascotaFundacion";
import MascotasRelacionadas from "./components/MascotasRelacionadas";
import "./MascotaDetalle.css";

const MascotaDetalle = ({ mascotaId, embed = false }) => {
  const { id: urlId } = useParams();
  const id = mascotaId || urlId;
  const navigate = useNavigate();
  const { t } = useTranslation("mascotas");

  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [fundacion, setFundacion] = useState(null);
  const [vacunas, setVacunas] = useState([]);
  const [razas, setRazas] = useState([]);
  const [imagenActual, setImagenActual] = useState(0);

  useEffect(() => {
    fetchMascotaDetalle();
  }, [id]);

  const fetchMascotaDetalle = async () => {
    if (!id) return;

    setLoading(true);
    setLoadProgress(0);
    setError(null);

    const progressInterval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 100);

    try {
      const response = await api.get(`/mascotas/${id}`, {
        params: {
          fields:
            "id,nombre_mascota,descripcion,especie,genero,edad_aprox,tamano,estado,esterilizado,desparasitado,vacunado,apto_con_ninos,apto_con_otros_animales,lugar_rescate,necesita_hogar_temporal,foto_principal,galeria_fotos,updated_at,fundacion_id",
          include: "fundacion,vacunas,razas",
        },
      });

      if (response.data.success) {
        const data = response.data.data;

        setLoadProgress(100);
        setTimeout(() => {
          setMascota(data);
          setVacunas(data.vacunas || []);
          setFundacion(data.fundacion || null);
          setRazas(data.razas || []);
          setLoading(false);
        }, 300);
      } else {
        setLoadProgress(100);
        setTimeout(() => {
          setError(t("no_encontrada"));
          setLoading(false);
        }, 300);
      }
    } catch (err) {
      console.error("Error:", err);
      setLoadProgress(100);
      setTimeout(() => {
        if (err.response?.status === 404) {
          setError(t("no_encontrada"));
        } else {
          setError(err.response?.data?.message || t("error_carga"));
        }
        setLoading(false);
      }, 300);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const getImageUrlForPath = (path) => {
    if (!path) return null;
    return getImageUrl(path);
  };

  const getAllImages = () => {
    const images = [];
    if (mascota?.foto_principal) {
      images.push(getImageUrlForPath(mascota.foto_principal));
    }
    if (mascota?.galeria_fotos) {
      try {
        let galeria = mascota.galeria_fotos;
        if (typeof galeria === "string") {
          galeria = JSON.parse(galeria);
        }
        if (Array.isArray(galeria)) {
          galeria.forEach((foto) => {
            if (foto) images.push(getImageUrlForPath(foto));
          });
        }
      } catch (e) {
        console.error("Error parsing galeria:", e);
      }
    }
    return images;
  };

  const isDisponibleParaAdopcion = () => {
    if (!mascota) return false;
    const estado = mascota.estado?.toLowerCase() || "";
    return (
      estado === "en adopción" ||
      estado === "en adopcion" ||
      estado === "disponible" ||
      estado === "en acogida"
    );
  };

  const isAdoptado = () => {
    if (!mascota) return false;
    const estado = mascota.estado?.toLowerCase() || "";
    return estado === "adoptado";
  };

  const getEstadoClass = () => {
    if (!mascota) return "";
    const estado = mascota.estado?.toLowerCase() || "";
    if (estado === "en adopción" || estado === "en adopcion") return "adopcion";
    if (estado === "en acogida") return "acogida";
    if (estado === "adoptado") return "adoptado";
    return "";
  };

  const getEstadoIcon = () => {
    if (!mascota) return "fa-heart";
    const estado = mascota.estado?.toLowerCase() || "";
    if (estado === "en adopción" || estado === "en adopcion") return "fa-heart";
    if (estado === "en acogida") return "fa-home";
    if (estado === "adoptado") return "fa-check-circle";
    return "fa-heart";
  };

  const getEstadoText = () => {
    if (!mascota) return "";
    const estado = mascota.estado?.toLowerCase() || "";
    if (estado === "en adopción" || estado === "en adopcion")
      return t("en_adopcion");
    if (estado === "en acogida") return t("en_acogida");
    if (estado === "adoptado") return t("adoptado");
    return mascota.estado;
  };

  const handleAdoptar = () => {
    navigate(`/solicitar-adopcion/${id}`);
  };

  const handleSolicitarAcogida = () => {
    navigate(`/solicitar-acogida/${id}`);
  };

  const images = getAllImages();
  const disponible = isDisponibleParaAdopcion();
  const adoptado = isAdoptado();

  if (loading) {
    return (
      <SimpleLoadingBar
        progress={loadProgress}
        height="12px"
        variant="gradient"
      />
    );
  }

  if (error || !mascota) {
    return (
      <div className={`md-page ${embed ? 'md-embed' : ''}`}>
        <div className="md-bento-grid">
          <div className="md-error-card">
            <i className="fas fa-paw fa-3x"></i>
            <h2>{t("error_titulo")}</h2>
            <p>{error || t("no_encontrada")}</p>
            {!embed && (
              <button
                onClick={() => navigate("/mascotas")}
                className="md-btn-back-simple"
              >
                <ArrowLeft size={16} /> {t("volver_lista")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`md-page ${embed ? 'md-embed' : ''}`}>
      {/* Botón volver - oculto en embed */}
      {!embed && (
        <div className="md-back-outer reveal-up delay-100">
          <button
            onClick={() => navigate("/mascotas")}
            className="md-back-link"
          >
            <ArrowLeft size={16} />
            <span>{t("volver")}</span>
          </button>
        </div>
      )}

      <MascotaHero
        nombre={mascota.nombre_mascota}
        imagen={images[imagenActual] || null}
        estado={mascota.estado}
        estadoClass={getEstadoClass()}
        estadoIcon={getEstadoIcon()}
        estadoText={getEstadoText()}
        imagenActual={imagenActual}
        setImagenActual={setImagenActual}
        images={images}
      />

      <MascotaHistoria descripcion={mascota.descripcion} t={t} />

      <div className="md-info-grid">
        <div className="md-info-column">
          <MascotaResumen mascota={mascota} t={t} />
          <MascotaCompatibilidad mascota={mascota} t={t} />
          <MascotaFundacion fundacion={fundacion} t={t} />
        </div>

        <div className="md-info-column">
          <MascotaSalud mascota={mascota} t={t} />
          <MascotaDetalles
            mascota={mascota}
            razas={razas}
            vacunas={vacunas}
            t={t}
          />
        </div>
      </div>

      <MascotaAcciones
        disponible={disponible}
        adoptado={adoptado}
        mascota={mascota}
        handleAdoptar={handleAdoptar}
        handleSolicitarAcogida={handleSolicitarAcogida}
        t={t}
      />

      <MascotasRelacionadas
        mascotaId={id}
        especie={mascota?.especie}
        mascotaActual={mascota}
        t={t}
        isEmbed={embed}
      />

      {/* Footer - oculto en embed */}
      {!embed && (
        <div className="md-footer reveal-up delay-300">
          <i className="far fa-clock"></i>
          <small>
            {t("actualizado")}:{" "}
            {new Date(mascota.updated_at || Date.now()).toLocaleDateString()}
          </small>
        </div>
      )}
    </div>
  );
};

export default MascotaDetalle;