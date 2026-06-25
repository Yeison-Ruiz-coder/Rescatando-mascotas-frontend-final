import React from "react";
import { useTranslation } from "react-i18next";
import "./Contacto.css";

const Contacto = () => {
  const { t } = useTranslation("layout");

  return (
    <div className="contacto-page">
      <div className="contacto-hero">
        <div className="contacto-hero-content">
          <h1>{t("contacto.titulo", "Contacto")}</h1>
          <p>{t("contacto.descripcion", "¿Tienes preguntas o necesitas ayuda? Escríbenos y te responderemos pronto.")}</p>
        </div>
      </div>

      <div className="contacto-grid">
        <div className="contacto-card contacto-info-card">
          <h2>{t("contacto.informacion_titulo", "Información de contacto")}</h2>
          <p>{t("contacto.informacion_texto", "Estamos aquí para ayudarte con adopciones, rescates, eventos y soporte general.")}</p>

          <div className="contacto-item">
            <span>{t("contacto.telefono_label", "Teléfono")}</span>
            <strong>{t("footer.contacto.telefono")}</strong>
          </div>

          <div className="contacto-item">
            <span>{t("contacto.email_label", "Correo")}</span>
            <strong>{t("footer.contacto.email")}</strong>
          </div>

          <div className="contacto-item">
            <span>{t("contacto.direccion_label", "Dirección")}</span>
            <strong>{t("footer.contacto.direccion")}</strong>
          </div>

          <div className="contacto-item">
            <span>{t("contacto.ciudad_label", "Ciudad")}</span>
            <strong>{t("footer.contacto.ciudad")}</strong>
          </div>
        </div>

        <div className="contacto-card contacto-form-card">
          <h2>{t("contacto.form_titulo", "Envíanos un mensaje")}</h2>
          <form className="contacto-form">
            <label>
              {t("contacto.nombre_label", "Nombre")}
              <input type="text" placeholder={t("contacto.nombre_placeholder", "Tu nombre")} />
            </label>
            <label>
              {t("contacto.email_label", "Correo")}
              <input type="email" placeholder={t("contacto.email_placeholder", "Correo electrónico")} />
            </label>
            <label>
              {t("contacto.mensaje_label", "Mensaje")}
              <textarea placeholder={t("contacto.mensaje_placeholder", "Escribe tu mensaje aquí...")} rows="6" />
            </label>
            <button type="submit">{t("contacto.enviar", "Enviar mensaje")}</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
