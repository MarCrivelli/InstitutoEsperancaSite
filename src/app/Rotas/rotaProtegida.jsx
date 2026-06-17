import { Navigate } from "react-router-dom";

const decodificarToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

const tokenExpirado = (token) => {
  const decoded = decodificarToken(token);

  if (!decoded || !decoded.exp) {
    return true;
  }

  const agora = Math.floor(Date.now() / 1000);
  return decoded.exp < agora;
};

export default function RotaProtegida({ children, niveisPermitidos }) {
  const token = localStorage.getItem("token");
  const usuarioSalvo = localStorage.getItem("usuario");

  if (!token || !usuarioSalvo || tokenExpirado(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    return <Navigate to="/autenticar" replace />;
  }

  let usuario;

  try {
    usuario = JSON.parse(usuarioSalvo);
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    return <Navigate to="/autenticar" replace />;
  }

  if (!niveisPermitidos.includes(usuario.nivelDeAcesso)) {
    return <Navigate to="/" replace />;
  }

  return children;
}