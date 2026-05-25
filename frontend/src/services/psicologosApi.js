const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/$/, "");
const API_PSICOLOGOS = `${API_BASE_URL}/psicologos`;
const CACHE_KEY = "psicologos_app_v1";
const REQUEST_TIMEOUT_MS = 15000;

const convertirIdMongoAFrontend = (psicologo) => {
  if (!psicologo) return psicologo;

  return {
    ...psicologo,
    id: psicologo._id || psicologo.id,
  };
};

const limpiarParaBackend = (psicologo) => {
  // eslint-disable-next-line no-unused-vars
  const { id, _id, __v, createdAt, updatedAt, ...datos } = psicologo || {};
  return datos;
};

const guardarPsicologosCache = (psicologos) => {
  try {
    if (Array.isArray(psicologos)) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(psicologos));
    }
  } catch {
    // El cache es auxiliar; no debe bloquear el guardado real.
  }
};

export const obtenerPsicologosCache = () => {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    const psicologos = data ? JSON.parse(data) : [];

    return Array.isArray(psicologos)
      ? psicologos.map(convertirIdMongoAFrontend)
      : [];
  } catch {
    return [];
  }
};

const manejarRespuesta = async (respuesta) => {
  const data = await respuesta.json().catch(() => null);

  if (!respuesta.ok) {
    throw new Error(
      data?.message || data?.error || "Error en la petición al servidor"
    );
  }

  if (Array.isArray(data)) {
    const psicologos = data.map(convertirIdMongoAFrontend);
    guardarPsicologosCache(psicologos);
    return psicologos;
  }

  return convertirIdMongoAFrontend(data);
};

const fetchConTimeout = async (url, opciones = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      ...opciones,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("El backend tardó demasiado en responder. Revisa que esté encendido y conectado a MongoDB Atlas.", { cause: error });
    }

    throw new Error("No hay conexión con el backend. Revisa que el servidor esté corriendo en el puerto 4000.", { cause: error });
  } finally {
    clearTimeout(timeout);
  }
};

export const obtenerPsicologos = async () => {
  const respuesta = await fetchConTimeout(API_PSICOLOGOS);
  return manejarRespuesta(respuesta);
};

export const crearPsicologo = async (psicologo) => {
  const respuesta = await fetchConTimeout(API_PSICOLOGOS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(limpiarParaBackend(psicologo)),
  });

  return manejarRespuesta(respuesta);
};

export const actualizarPsicologo = async (id, psicologo) => {
  if (!id) {
    throw new Error("No se recibió un ID válido para actualizar.");
  }

  const respuesta = await fetchConTimeout(`${API_PSICOLOGOS}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(limpiarParaBackend(psicologo)),
  });

  return manejarRespuesta(respuesta);
};

export const eliminarPsicologo = async (id) => {
  if (!id) {
    throw new Error("No se recibió un ID válido para eliminar.");
  }

  const respuesta = await fetchConTimeout(`${API_PSICOLOGOS}/${id}`, {
    method: "DELETE",
  });

  return manejarRespuesta(respuesta);
};
