import React from "react";
import { useTranslation } from "react-i18next";
import UsuariosTipoList from "./UsuariosTipoList";

const UsuariosVeterinarias = () => {
  const { t } = useTranslation("admin");

  return (
    <UsuariosTipoList
      tipo="veterinaria"
      titulo={t("veterinarias_titulo", "Veterinarias")}
      descripcion={t(
        "veterinarias_descripcion",
        "Gestión y revisión de clínicas y centros veterinarios."
      )}
    />
  );
};

export default UsuariosVeterinarias;
