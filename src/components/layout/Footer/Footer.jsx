import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../contexts/AuthContext";
import "./Footer.css";

const Footer = () => {
  const { t } = useTranslation("layout");
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

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
          { label: "Adopción", path: "/adopciones" },
          { label: "Rescates", path: "/rescates/reportar" },
          { label: "Donaciones", path: "/donaciones" },
        ],
        comunidad: [
          { label: "Fundaciones", path: "/fundaciones" },
          { label: "Veterinarias", path: "/veterinarias" },
          { label: "Eventos", path: "/eventos" },
        ],
      };
    }

    switch (user?.tipo) {
      case "admin":
        return {
          servicios: [
            { label: "Dashboard", path: "/dashboard" },
            { label: "Usuarios", path: "/usuarios" },
            { label: "Mascotas", path: "/mascotas" },
            { label: "Adopciones", path: "/adopciones" },
          ],
          comunidad: [
            { label: "Fundaciones", path: "/fundaciones" },
            { label: "Veterinarias", path: "/veterinarias" },
            { label: "Reportes", path: "/reportes" },
          ],
        };

      case "veterinaria":
        return {
          servicios: [
            { label: "Dashboard", path: "/dashboard" },
            { label: "Atenciones", path: "/atenciones" },
            { label: "Mascotas", path: "/mascotas" },
            { label: "Vacunas", path: "/vacunas" },
          ],
          comunidad: [
            { label: "Rescates", path: "/rescates" },
            { label: "Fundaciones", path: "/fundaciones" },
            { label: "Contacto", path: "/contacto" },
          ],
        };

      case "fundacion":
        return {
          servicios: [
            { label: "Dashboard", path: "/dashboard" },
            { label: "Mis Mascotas", path: "/mascotas" },
            { label: "Solicitudes", path: "/solicitudes" },
            { label: "Rescates", path: "/rescates" },
          ],
          comunidad: [
            { label: "Eventos", path: "/eventos" },
            { label: "Donaciones", path: "/donaciones" },
            { label: "Voluntarios", path: "/voluntarios" },
          ],
        };

      default:
        return {
          servicios: [
            { label: "Mi Panel", path: "/dashboard" },
            { label: "Mis Solicitudes", path: "/mis-solicitudes" },
            { label: "Mis Donaciones", path: "/donaciones" },
            { label: "Mi Perfil", path: "/perfil" },
          ],
          comunidad: [
            { label: "Fundaciones", path: "/fundaciones" },
            { label: "Veterinarias", path: "/veterinarias" },
            { label: "Eventos", path: "/eventos" },
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
            <img src="/img/logo-claro.png" alt="Logo" className="footer-logo" />
            <img src="/img/texto-logo-claro.png" alt="Logo" className="footer-logo" />
          </div>

          {/* Columna 2: Contacto */}
          <div className="footer-col">
            <h4 className="footer-heading">Contacto</h4>
            <ul className="footer-links">
              <li>
                <i className="fas fa-phone-alt"></i> +57 304 884 234
              </li>
              <li>
                <i className="fas fa-envelope"></i> rmforever@org
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i> Calle 6 # 234 - CC y S
              </li>
              <li>
                <i className="fas fa-city"></i> Popayán, Colombia
              </li>
            </ul>
          </div>

          {/* Columna 3: Servicios */}
          <div className="footer-col">
            <h4 className="footer-heading">
              {isAuthenticated ? "Mis Acciones" : "Servicios"}
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
            <h4 className="footer-heading">Comunidad</h4>
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

          {/* Columna 5: Síguenos - Más grande */}
          <div className="footer-col footer-social">
            <h4 className="footer-heading">Síguenos</h4>
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
                &copy; {currentYear} Rescatando Mascotas Forever. Todos los
                derechos reservados.
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <ul className="legal-links">
                <li>
                  <a href="#" onClick={handleLinkClick("/privacidad")}>
                    Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleLinkClick("/terminos")}>
                    Términos
                  </a>
                </li>
                <li>
                  <a href="#" onClick={handleLinkClick("/cookies")}>
                    Cookies
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
