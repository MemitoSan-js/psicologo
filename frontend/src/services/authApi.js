const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/$/, "");
const API_AUTH = `${API_BASE_URL}/auth`;
const REQUEST_TIMEOUT_MS = 90000;

const fetchConTimeout = async (url, opciones = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, { ...opciones, signal: controller.signal });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("El servidor está despertando. Intenta nuevamente en unos segundos.", {
        cause: error,
      });
    }

    throw new Error("No hay conexión con el backend.", { cause: error });
  } finally {
    clearTimeout(timeout);
  }
};

const manejarRespuesta = async (respuesta) => {
  const data = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(data?.message || "Error en la petición al servidor");
  }

  return data;
};

export const loginUsuario = async ({ correo, password }) => {
  const respuesta = await fetchConTimeout(`${API_AUTH}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ correo, password }),
  });

  return manejarRespuesta(respuesta);
};

export const obtenerPerfil = async () => {
  const token = localStorage.getItem("token");

  const respuesta = await fetchConTimeout(`${API_AUTH}/perfil`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return manejarRespuesta(respuesta);
};

export const cerrarSesion = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
};

export const estaAutenticado = () => {
  return Boolean(localStorage.getItem("token"));
};