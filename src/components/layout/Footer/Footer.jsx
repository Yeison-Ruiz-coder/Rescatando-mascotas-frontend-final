import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../../../contexts/AuthContext";
import "./Footer.css";

const Footer = () => {
  const { t } = useTranslation("layout");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentYear = new Date().getFullYear();

  // 🔥 RUTAS DONDE NO DEBE APARECER EL FOOTER 🔥
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthPage = authRoutes.includes(location.pathname);
  
  // Si es página de autenticación, NO renderizar el footer
  if (isAuthPage) {
    return null;
  }

  const navigateTo = (path) => {
    if (!isAuthenticated) {
      navigate(path);
      return;
    }

    const rolePaths = {
      admin: "/admin",
      veterinaria: "/veterinaria",
      fundacion: "/fundacion",
      user: "/user",
    };

    const basePath = rolePaths[user?.tipo] || "/user";
    navigate(`${basePath}${path}`);
  };

  const getFooterLinks = () => {
    if (!isAuthenticated) {
      return {
        servicios: [
          { label: t("footer.links.adopcion"), path: "/adopciones" },
          { label: t("footer.links.rescates"), path: "/rescates/reportar" },
          { label: t("footer.links.donaciones"), path: "/donaciones" },
        ],
        comunidad: [
          { label: t("footer.links.fundaciones"), path: "/fundaciones" },
          { label: t("footer.links.veterinarias"), path: "/veterinarias" },
          { label: t("footer.links.eventos"), path: "/eventos" },
        ],
      };
    }

    switch (user?.tipo) {
      case "admin":
        return {
          servicios: [
            { label: t("footer.links.dashboard"), path: "/dashboard" },
            { label: t("footer.links.usuarios"), path: "/usuarios" },
            { label: t("footer.links.mascotas"), path: "/mascotas" },
            { label: t("footer.links.adopciones"), path: "/adopciones" },
          ],
          comunidad: [
            { label: t("footer.links.fundaciones"), path: "/fundaciones" },
            { label: t("footer.links.veterinarias"), path: "/veterinarias" },
            { label: t("footer.links.reportes"), path: "/reportes" },
          ],
        };

      case "veterinaria":
        return {
          servicios: [
            { label: t("footer.links.dashboard"), path: "/dashboard" },
            { label: t("footer.links.atenciones"), path: "/atenciones" },
            { label: t("footer.links.mascotas"), path: "/mascotas" },
            { label: t("footer.links.vacunas"), path: "/vacunas" },
          ],
          comunidad: [
            { label: t("footer.links.rescates"), path: "/rescates" },
            { label: t("footer.links.fundaciones"), path: "/fundaciones" },
            { label: t("footer.links.contacto"), path: "/contacto" },
          ],
        };

      case "fundacion":
        return {
          servicios: [
            { label: t("footer.links.dashboard"), path: "/dashboard" },
            { label: t("footer.links.mis_mascotas"), path: "/mascotas" },
            { label: t("footer.links.solicitudes"), path: "/solicitudes" },
            { label: t("footer.links.rescates"), path: "/rescates" },
          ],
          comunidad: [
            { label: t("footer.links.eventos"), path: "/eventos" },
            { label: t("footer.links.donaciones"), path: "/donaciones" },
            { label: t("footer.links.voluntarios"), path: "/voluntarios" },
          ],
        };

      default:
        return {
          servicios: [
            { label: t("footer.links.mi_panel"), path: "/dashboard" },
            { label: t("footer.links.mis_solicitudes"), path: "/user/mis-solicitudes" },
            { label: t("footer.links.mis_donaciones"), path: "/donaciones" },
            { label: t("footer.links.mi_perfil"), path: "/perfil" },
          ],
          comunidad: [
            { label: t("footer.links.fundaciones"), path: "/fundaciones" },
            { label: t("footer.links.veterinarias"), path: "/veterinarias" },
            { label: t("footer.links.eventos"), path: "/eventos" },
          ],
        };
    }
  };

  const links = getFooterLinks();

  const socialLinks = [
    {
      href: "https://facebook.com",
      icon: "fab fa-facebook-f",
      label: "Facebook",
      color: "#1877f2",
    },
    {
      href: "https://wa.me/57304884234",
      icon: "fab fa-whatsapp",
      label: "WhatsApp",
      color: "#25D366",
    },
    {
      href: "https://instagram.com",
      icon: "fab fa-instagram",
      label: "Instagram",
      color: "#e4405f",
    },
    {
      href: "https://youtube.com",
      icon: "fab fa-youtube",
      label: "YouTube",
      color: "#ff0000",
    },
  ];

  const handleLinkClick = (path) => (e) => {
    e.preventDefault();
    navigateTo(path);
  };

  return (
    <footer className="custom-footer">
      <div className="container footer-content-wrapper">
        {/* Primera fila: 5 columnas */}
        <div className="row">
          {/* Columna 1: Logo */}
          <div className="footer-col">
            <img src="/img/logo-claro.png" alt={t("footer.logo_alt")} className="footer-logo" />
            <img src="/img/texto-logo-claro.png" alt={t("footer.logo_text_alt")} className="footer-logo" />
          </div>

          {/* Columna 2: Contacto */}
          <div className="footer-col">
            <h4 className="footer-heading">{t("footer.contacto.titulo")}</h4>
            <ul className="footer-links">
              <li>
                <i className="fas fa-phone-alt"></i> {t("footer.contacto.telefono")}
              </li>
              <li>
                <i className="fas fa-envelope"></i> {t("footer.contacto.email")}
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i> {t("footer.contacto.direccion")}
              </li>
              <li>
                <i className="fas fa-city"></i> {t("footer.contacto.ciudad")}
              </li>
            </ul>
          </div>

          {/* Columna 3: Servicios / Mis Acciones */}
          <div className="footer-col">
            <h4 className="footer-heading">
              {isAuthenticated ? t("footer.mis_acciones") : t("footer.servicios")}
            </h4>
            <ul className="footer-links">
              {links.servicios.map((link, index) => (
                <li key={index}>
                  <a href="#" onClick={handleLinkClick(link.path)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 4: Comunidad */}
          <div className="footer-col">
            <h4 className="footer-heading">{t("footer.comunidad.titulo")}</h4>
            <ul className="footer-links">
              {links.comunidad.map((link, index) => (
                <li key={index}>
                  <a href="#" onClick={handleLinkClick(link.path)}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Columna 5: Síguenos */}
          <div className="footer-col footer-social">
            <h4 className="footer-heading">{t("footer.siguenos.titulo")}</h4>
            <div className="social-icons-wrapper">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-link"
                  aria-label={social.label}
                >
                  <i className={social.icon}></i>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Segunda fila: Copyright */}
        <div className="footer-bottom">
          <div className="row">
            <div className="col-md-6 text-center text-md-start">
              <p className="copyright">
                {t("footer.copyright", { year: currentYear })}
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <ul className="legal-links">
                <li>
                  <a href="#" onClick={handleLinkClick("/privacidad")}>
                    {t("footer.legal.privacidad")}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleLinkClick("/terminos")}>
                    {t("footer.legal.terminos")}
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleLinkClick("/cookies")}>
                    {t("footer.legal.cookies")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;