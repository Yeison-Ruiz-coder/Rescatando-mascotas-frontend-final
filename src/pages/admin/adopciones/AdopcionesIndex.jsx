import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import { getImageUrl } from "../../../utils/imageUtils";
import LoadingSpinner from "../../../components/common/LoadingSpinner/LoadingSpinner";
import "./Adopciones.css";

const sampleMascotas = [
  {
    id: 201,
    nombre_mascota: "Luna",
    especie: "Perro",
    genero: "Hembra",
    edad_aprox: "2",
    estado: "En adopción",
    foto_principal: "/img/Fundacion/perro1.jpg",
    lugar_rescate: "Bogotá",
    fundacion: { nombre: "Refugio Patitas" },
  },
  {
    id: 202,
    nombre_mascota: "Milo",
    especie: "Gato",
    genero: "Macho",
    edad_aprox: "1",
    estado: "En adopción",
    foto_principal: "/img/Fundacion/gato1.jpg",
    lugar_rescate: "Medellín",
    fundacion: { nombre: "Casa Felina" },
  },
  {
    id: 203,
    nombre_mascota: "Nala",
    especie: "Perro",
    genero: "Hembra",
    edad_aprox: "3",
    estado: "En adopción",
    foto_principal: "/img/Fundacion/perro2.jpg",
    lugar_rescate: "Cali",
    fundacion: { nombre: "Amigos Peludos" },
  },
];

const AdopcionesIndex = () => {
  const { t } = useTranslation("admin");
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMascotas = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/mascotas", {
          params: {
            fields: "id,nombre_mascota,especie,genero,edad_aprox,foto_principal,estado,lugar_rescate",
            per_page: 12,
            estado: "En adopcion",
          },
        });

        const data = response.data?.data?.data || response.data?.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setMascotas(data);
        } else {
          setMascotas(sampleMascotas);
        }
      } catch (err) {
        console.error("Error cargando adopciones:", err);
        setError(t("error_carga_adopciones", "No se pudo cargar las adopciones."));
        setMascotas(sampleMascotas);
      } finally {
        setLoading(false);
      }
    };

    fetchMascotas();
  }, [t]);

  const adoptablesCount = mascotas.length;
  const solicitudesPendientes = 7;
  const seguimientosActivos = 4;

  const getImage = (path) => getImageUrl(path) || "/img/pata.png";

  return (
    <div className="admin-adopciones-page">
      <div className="admin-adopciones-hero">
        <div>
          <span>{t("adopciones_hero_badge", "Adopciones")}</span>
          <h1>{t("adopciones_hero_title", "Adopción y seguimiento")}</h1>
          <p>{t("adopciones_hero_desc", "Visualiza mascotas disponibles para adopción y gestiona solicitudes desde el panel admin.")}</p>
        </div>
      </div>

      <section className="admin-adopciones-summary">
        <div className="admin-adopciones-card">
          <h2>{t("adopciones_disponibles", "Mascotas disponibles")}</h2>
          <strong>{adoptablesCount}</strong>
          <p>{t("adopciones_disponibles_desc", "Mascotas listas para adopción en la plataforma pública.")}</p>
        </div>
        <div className="admin-adopciones-card">
          <h2>{t("solicitudes_pendientes", "Solicitudes pendientes")}</h2>
          <strong>{solicitudesPendientes}</strong>
          <p>{t("solicitudes_pendientes_desc", "Solicitudes de adopción que necesitan revisión administrativa.")}</p>
        </div>
        <div className="admin-adopciones-card">
          <h2>{t("seguimientos_activos", "Seguimientos activos")}</h2>
          <strong>{seguimientosActivos}</strong>
          <p>{t("seguimientos_activos_desc", "Casos de adopción en seguimiento después de la entrega.")}</p>
        </div>
      </section>

      <section className="admin-adopciones-list">
        <div className="admin-adopciones-section-header">
          <h2>{t("mascotas_adopcion", "Mascotas en adopción")}</h2>
          <p>{t("mascotas_adopcion_desc", "Lista obtenida desde la zona pública; usa los datos existentes o datos de prueba.")}</p>
        </div>

        {loading ? (
          <div className="admin-adopciones-loading">
            <LoadingSpinner text={t("cargando_mascotas", "Cargando mascotas...")} />
          </div>
        ) : error ? (
          <div className="admin-adopciones-error">
            <p>{error}</p>
          </div>
        ) : (
          <div className="admin-adopciones-grid">
            {mascotas.map((mascota) => (
              <article key={mascota.id} className="admin-adopcion-card">
                <div className="admin-adopcion-image">
                  <img src={getImage(mascota.foto_principal)} alt={mascota.nombre_mascota || "Mascota"} />
                </div>
                <div className="admin-adopcion-content">
                  <h3>{mascota.nombre_mascota || t("sin_nombre", "Sin nombre")}</h3>
                  <p className="admin-adopcion-meta">
                    <span>{mascota.especie || "--"}</span>
                    <span>{mascota.genero || "--"}</span>
                    <span>{mascota.edad_aprox ? `${mascota.edad_aprox} ${t("anos", "años")}` : "--"}</span>
                  </p>
                  <p className="admin-adopcion-status">
                    {t("estado", "Estado")}: <strong>{mascota.estado || t("en_adopcion", "En adopción")}</strong>
                  </p>
                  <p className="admin-adopcion-location">
                    {t("lugar_rescate", "Lugar")}: {mascota.lugar_rescate || t("no_especificado", "No especificado")}
                  </p>
                  <div className="admin-adopcion-actions">
                    <Link to={`/mascotas/${mascota.id}`} className="admin-adopcion-button secondary">
                      {t("ver_publico", "Ver en público")}
                    </Link>
                    <Link to="/admin/adopciones/solicitudes" className="admin-adopcion-button primary">
                      {t("ver_solicitudes", "Ver solicitudes")}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdopcionesIndex;
