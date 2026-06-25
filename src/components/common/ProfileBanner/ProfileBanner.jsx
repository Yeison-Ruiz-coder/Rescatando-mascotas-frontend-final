import React from "react";
import { useTranslation } from "react-i18next";
import "./ProfileBanner.css";

const ProfileBanner = ({ user = {} }) => {
  const { t } = useTranslation('dashboard');
  const avatarUrl = user?.avatar || null;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return t("banner.greeting.morning", "Buenos días");
    if (hour >= 12 && hour < 18) return t("banner.greeting.afternoon", "Buenas tardes");
    if (hour >= 18 && hour < 22) return t("banner.greeting.evening", "Buenas noches");
    return t("banner.greeting.night", "Descansa");
  };

  const greeting = getGreeting();
  const userName = user?.nombre || t("banner.defaultUser", "Usuario");

  return (
    <div className="profile-banner">
      <div
        className="banner-image"
        style={{
          backgroundImage: avatarUrl ? `url(${avatarUrl})` : "none",
          backgroundColor: avatarUrl ? "#f3f4f6" : "#667eea",
        }}
      />
      <div className="banner-overlay" />
      <div className="banner-content">
        <div className="banner-info">
          <span className="banner-badge">
            <span className="icon-paw"></span>
            {t("banner.badge", "Miembro de la comunidad")}
          </span>
          <h1>
            {greeting}, <span className="banner-name">{userName}</span>
          </h1>
          <p>
            {user?.titulo || t("banner.defaultTitle", "Amante de los animales y defensor del bienestar animal")}
          </p>
          <div className="banner-stats">
            <div className="stat">
              <strong>{user?.solicitudes || 0}</strong>
              <span>{t("banner.stats.solicitudes", "Solicitudes")}</span>
            </div>
            <div className="stat">
              <strong>{user?.adopciones || 0}</strong>
              <span>{t("banner.stats.adopciones", "Adopciones")}</span>
            </div>
            <div className="stat">
              <strong>{user?.eventos || 0}</strong>
              <span>{t("banner.stats.eventos", "Eventos")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBanner;