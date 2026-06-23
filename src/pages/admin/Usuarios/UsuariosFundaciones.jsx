import React from "react";
import { useTranslation } from "react-i18next";
import UsuariosTipoList from "./UsuariosTipoList";

const UsuariosFundaciones = () => {
  const { t } = useTranslation("admin");

  return (
    <UsuariosTipoList
      tipo="fundacion"
      titulo={t("fundaciones_titulo", "Fundaciones")}
      descripcion={t(
        "fundaciones_descripcion",
        "Gestión y revisión de fundaciones registradas."
      )}
    />
  );
};

export default UsuariosFundaciones;
