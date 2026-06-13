import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import {
  obtenerPsicologos,
  obtenerPsicologosCache,
  crearPsicologo,
  actualizarPsicologo,
  eliminarPsicologo,
} from "../services/psicologosApi";

const STORAGE_KEY = "psicologos_app_v1";

const LIMITE_NOMBRE = 50;
const LIMITE_CONSULTORIO = 15;
const LIMITE_ESPECIALIDAD = 200;

const ESTADOS_PSICOLOGO = [
  "Disponible",
  "En atención",
  "Fuera de turno",
  "No disponible",
];

const ESTADOS_CONSULTORIO = [
  "Disponible",
  "Ocupado",
  "Reservado",
  "Fuera de servicio",
];

const COLORES_ETIQUETA = [
  {
    id: "azul-petroleo",
    nombre: "Azul petróleo",
    valor: "#183B4A",
    suave: "#E9EEF0",
    texto: "#F8F7F2",
  },
  {
    id: "azul-oscuro",
    nombre: "Azul oscuro",
    valor: "#102C38",
    suave: "#E6ECEF",
    texto: "#F8F7F2",
  },
  {
    id: "dorado",
    nombre: "Dorado",
    valor: "#F2C230",
    suave: "#FFF6D1",
    texto: "#183B4A",
  },
  {
    id: "dorado-oscuro",
    nombre: "Dorado oscuro",
    valor: "#C59A12",
    suave: "#F8E9AD",
    texto: "#183B4A",
  },

  {
    id: "borde-crema",
    nombre: "Crema suave",
    valor: "#D9D1B5",
    suave: "#F8F7F2",
    texto: "#183B4A",
  },
];

const COLOR_DEFAULT = "#F2C230";
const MAX_IMAGEN_MB = 8;
const MAX_IMAGEN_BYTES = MAX_IMAGEN_MB * 1024 * 1024;
const MAX_IMAGEN_GUARDADA_MB = 1.8;
const MAX_IMAGEN_GUARDADA_BYTES = MAX_IMAGEN_GUARDADA_MB * 1024 * 1024;
const IMAGEN_MAX_PIXELES = 900;
const IMAGEN_CALIDAD = 0.82;
const EXTENSIONES_IMAGEN =
  /\.(apng|avif|bmp|gif|heic|heif|ico|jfif|jpe?g|pjpeg|pjp|png|svg|webp)$/i;

const DEFAULT_PSICOLOGOS = [
  {
    id: 1,
    nombre: "Psic. Ana Martínez",
    consultorio: "101",
    fecha: "",
    horaInicio: "19:00",
    horaFin: "21:00",
    horario: "07:00 PM - 09:00 PM",
    estado: "En atención",
    estadoConsultorio: "Ocupado",
    especialidad:
      "Terapia cognitivo conductual, ansiedad, depresión y manejo emocional.",
    colorEtiqueta: "#F2C230",
    imagen: "",
    imagenNombre: "",
    mostrarEnPantalla: true,
  },
  {
    id: 2,
    nombre: "Psic. Carlos Rodríguez",
    consultorio: "102",
    fecha: "",
    horaInicio: "20:00",
    horaFin: "22:00",
    horario: "08:00 PM - 10:00 PM",
    estado: "Disponible",
    estadoConsultorio: "Disponible",
    especialidad:
      "Terapia sistémica, terapia de pareja, estrés y desarrollo personal.",
    colorEtiqueta: "#183B4A",
    imagen: "",
    imagenNombre: "",
    mostrarEnPantalla: true,
  },
];

const getFechaHoy = () => {
  const hoy = new Date();
  const year = hoy.getFullYear();
  const month = String(hoy.getMonth() + 1).padStart(2, "0");
  const day = String(hoy.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getFechaLimite = (meses = 6) => {
  const fecha = new Date();

  fecha.setMonth(fecha.getMonth() + meses);

  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const FORM_INICIAL = {
  nombre: "",
  consultorio: "",
  fecha: getFechaHoy(),
  horaInicio: "",
  horaFin: "",
  estado: "Disponible",
  estadoConsultorio: "Disponible",
  especialidad: "",
  colorEtiqueta: COLOR_DEFAULT,
  imagen: "",
  imagenNombre: "",
  mostrarEnPantalla: true,
};

const limpiarEspacios = (texto) => String(texto || "").replace(/\s+/g, " ");

const limpiarNombre = (valor) => {
  return limpiarEspacios(valor)
    .replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñÜü.\-\s]/g, "")
    .slice(0, LIMITE_NOMBRE);
};

const limpiarConsultorio = (valor) => {
  return limpiarEspacios(valor)
    .replace(/[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s-]/g, "")
    .slice(0, LIMITE_CONSULTORIO);
};

const limpiarEspecialidad = (valor) => {
  return limpiarEspacios(valor).slice(0, LIMITE_ESPECIALIDAD);
};

const normalizarTexto = (texto) =>
  String(texto || "").trim().replace(/\s+/g, " ").toLowerCase();

const obtenerIdPsicologo = (psicologo) => {
  return psicologo?._id || psicologo?.id || "";
};

const idsIguales = (a, b) => {
  if (!a || !b) return false;
  return String(a) === String(b);
};

const normalizarEstadoPsicologo = (estado) => {
  const valor = normalizarTexto(estado);

  if (valor === "disponible" || valor === "en turno") return "Disponible";

  if (
    valor === "en atención" ||
    valor === "en atencion" ||
    valor === "en consulta" ||
    valor === "ocupado"
  ) {
    return "En atención";
  }

  if (valor === "fuera de turno") return "Fuera de turno";

  if (valor === "no disponible") return "No disponible";

  return "";
};

const normalizarEstadoConsultorio = (estado) => {
  const valor = normalizarTexto(estado);

  if (valor === "disponible") return "Disponible";

  if (valor === "ocupado" || valor === "en uso" || valor === "en consulta") {
    return "Ocupado";
  }

  if (valor === "reservado") return "Reservado";

  if (valor === "fuera de servicio") return "Fuera de servicio";

  return "";
};

const getColorEtiqueta = (valor) => {
  return (
    COLORES_ETIQUETA.find((color) => color.valor === valor) ||
    COLORES_ETIQUETA[2]
  );
};

const normalizarPsicologo = (psicologo, index = 0) => ({
  ...psicologo,
  id: obtenerIdPsicologo(psicologo) || `psicologo-${Date.now()}-${index}`,
  nombre: limpiarNombre(psicologo.nombre || "").trim(),
  consultorio: limpiarConsultorio(psicologo.consultorio || "").trim(),
  estado: normalizarEstadoPsicologo(psicologo.estado) || "Disponible",
  estadoConsultorio:
    normalizarEstadoConsultorio(psicologo.estadoConsultorio) || "Disponible",
  especialidad: limpiarEspecialidad(psicologo.especialidad || "").trim(),
  colorEtiqueta: COLORES_ETIQUETA.some(
    (color) => color.valor === psicologo.colorEtiqueta
  )
    ? psicologo.colorEtiqueta
    : COLOR_DEFAULT,
  imagen: psicologo.imagen || "",
  imagenNombre: psicologo.imagenNombre || "",
  mostrarEnPantalla: psicologo.mostrarEnPantalla !== false,
});

// eslint-disable-next-line no-unused-vars
const obtenerPsicologosGuardados = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) return DEFAULT_PSICOLOGOS.map(normalizarPsicologo);

    const psicologos = JSON.parse(data);

    if (!Array.isArray(psicologos)) {
      return DEFAULT_PSICOLOGOS.map(normalizarPsicologo);
    }

    return psicologos.map((psicologo, index) =>
      normalizarPsicologo(psicologo, index)
    );
  } catch {
    return DEFAULT_PSICOLOGOS.map(normalizarPsicologo);
  }
};

const formatearHora = (hora) => {
  if (!hora) return "";

  const [horas, minutos] = hora.split(":");
  const fecha = new Date();

  fecha.setHours(Number(horas));
  fecha.setMinutes(Number(minutos));

  return fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatearFecha = (fecha) => {
  if (!fecha) return "";

  const [year, month, day] = fecha.split("-");

  if (!year || !month || !day) return "";

  return `${day}/${month}/${year}`;
};

const generarHorario = ({ fecha, horaInicio, horaFin }) => {
  if (!horaInicio && !horaFin) return "Sin horario asignado";

  if (horaInicio && !horaFin) {
    return `${formatearFecha(fecha)} · ${formatearHora(horaInicio)}`;
  }

  if (!horaInicio && horaFin) {
    return `${formatearFecha(fecha)} · hasta ${formatearHora(horaFin)}`;
  }

  return `${formatearFecha(fecha)} · ${formatearHora(
    horaInicio
  )} - ${formatearHora(horaFin)}`;
};

const convertirMinutos = (hora) => {
  if (!hora) return null;

  const [horas, minutos] = hora.split(":").map(Number);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) return null;

  return horas * 60 + minutos;
};

const hayCruceDeHorario = (aInicio, aFin, bInicio, bFin) => {
  const inicioA = convertirMinutos(aInicio);
  const finA = convertirMinutos(aFin);
  const inicioB = convertirMinutos(bInicio);
  const finB = convertirMinutos(bFin);

  if (
    inicioA === null ||
    finA === null ||
    inicioB === null ||
    finB === null
  ) {
    return false;
  }

  return inicioA < finB && inicioB < finA;
};

const archivoEsImagen = (archivo) => {
  if (!archivo) return false;

  return (
    archivo.type.startsWith("image/") || EXTENSIONES_IMAGEN.test(archivo.name)
  );
};

const convertirImagenBase64 = (archivo) => {
  return new Promise((resolve, reject) => {
    const lector = new FileReader();

    lector.onload = () => resolve(lector.result);
    lector.onerror = () => reject(new Error("No se pudo leer la imagen."));
    lector.readAsDataURL(archivo);
  });
};

const calcularBytesDataUrl = (dataUrl = "") => {
  const base64 = String(dataUrl).split(",")[1] || "";
  return Math.ceil((base64.length * 3) / 4);
};

const cargarImagenDesdeDataUrl = (dataUrl) => {
  return new Promise((resolve, reject) => {
    const imagen = new Image();

    imagen.onload = () => resolve(imagen);
    imagen.onerror = () => reject(new Error("El navegador no pudo leer la imagen seleccionada."));
    imagen.src = dataUrl;
  });
};

const optimizarImagenBase64 = async (archivo) => {
  const dataUrlOriginal = await convertirImagenBase64(archivo);

  if (archivo.type === "image/svg+xml" || dataUrlOriginal.startsWith("data:image/svg")) {
    return dataUrlOriginal;
  }

  const imagen = await cargarImagenDesdeDataUrl(dataUrlOriginal);
  const anchoOriginal = imagen.naturalWidth || imagen.width;
  const altoOriginal = imagen.naturalHeight || imagen.height;
  const escala = Math.min(1, IMAGEN_MAX_PIXELES / Math.max(anchoOriginal, altoOriginal));
  const ancho = Math.max(1, Math.round(anchoOriginal * escala));
  const alto = Math.max(1, Math.round(altoOriginal * escala));

  const canvas = document.createElement("canvas");
  canvas.width = ancho;
  canvas.height = alto;

  const contexto = canvas.getContext("2d");

  if (!contexto) {
    return dataUrlOriginal;
  }

  contexto.drawImage(imagen, 0, 0, ancho, alto);

  return canvas.toDataURL("image/jpeg", IMAGEN_CALIDAD);
};

const obtenerIniciales = (nombre) => {
  const partes = String(nombre || "")
    .replace(/^psic\.\s*/i, "")
    .trim()
    .split(" ")
    .filter(Boolean);

  const primera = partes[0]?.charAt(0) || "P";
  const segunda = partes[1]?.charAt(0) || "S";

  return `${primera}${segunda}`.toUpperCase();
};

const validarFormulario = ({ form, psicologos, idActual = null }) => {
  const errores = {};

  const nombre = limpiarNombre(form.nombre).trim();
  const consultorio = limpiarConsultorio(form.consultorio).trim();
  const especialidad = limpiarEspecialidad(form.especialidad).trim();
  const inicio = convertirMinutos(form.horaInicio);
  const fin = convertirMinutos(form.horaFin);
  const fechaHoy = getFechaHoy();
  const fechaLimite = getFechaLimite(6);

  const nombreSinTitulo = nombre.replace(/^psic\.\s*/i, "").trim();
  const partesNombre = nombreSinTitulo
    .split(" ")
    .filter((parte) => parte.replace(".", "").length >= 2);

  if (!nombre) {
    errores.nombre = "El nombre del psicólogo es obligatorio.";
  } else if (nombre.length < 5) {
    errores.nombre = "El nombre debe tener al menos 5 caracteres.";
  } else if (nombre.length > LIMITE_NOMBRE) {
    errores.nombre = `El nombre no debe superar ${LIMITE_NOMBRE} caracteres.`;
  } else if (!/^[a-zA-ZÁÉÍÓÚáéíóúÑñÜü.\-\s]+$/.test(nombre)) {
    errores.nombre = "Solo se permiten letras, espacios, punto y guion.";
  } else if (partesNombre.length < 2) {
    errores.nombre = "Escribe nombre y apellido. Ejemplo: Psic. Ana Martínez.";
  } else if (/(.)\1{4,}/i.test(nombre.replace(/\s/g, ""))) {
    errores.nombre = "El nombre contiene demasiados caracteres repetidos.";
  }

  if (!consultorio) {
    errores.consultorio = "El consultorio es obligatorio.";
  } else if (consultorio.length > LIMITE_CONSULTORIO) {
    errores.consultorio = `El consultorio no debe superar ${LIMITE_CONSULTORIO} caracteres.`;
  } else if (!/^[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ\s-]+$/.test(consultorio)) {
    errores.consultorio =
      "El consultorio solo puede contener letras, números y guion.";
  }

  if (especialidad.length > LIMITE_ESPECIALIDAD) {
    errores.especialidad = `La descripción no debe superar ${LIMITE_ESPECIALIDAD} caracteres.`;
  }

  if (!form.colorEtiqueta) {
    errores.colorEtiqueta = "Selecciona un color de etiqueta.";
  } else if (
    !COLORES_ETIQUETA.some((color) => color.valor === form.colorEtiqueta)
  ) {
    errores.colorEtiqueta = "Selecciona un color válido.";
  }

  if (!form.estado) {
    errores.estado = "Selecciona el estado del psicólogo.";
  } else if (!ESTADOS_PSICOLOGO.includes(form.estado)) {
    errores.estado = "El estado del psicólogo no es válido.";
  }

  if (!form.estadoConsultorio) {
    errores.estadoConsultorio = "Selecciona el estado del consultorio.";
  } else if (!ESTADOS_CONSULTORIO.includes(form.estadoConsultorio)) {
    errores.estadoConsultorio = "El estado del consultorio no es válido.";
  }

  if (!form.fecha) {
    errores.fecha = "Selecciona una fecha.";
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.fecha)) {
    errores.fecha = "La fecha seleccionada no es válida.";
  } else if (form.fecha < fechaHoy) {
    errores.fecha = "No puedes asignar una fecha anterior a hoy.";
  } else if (form.fecha > fechaLimite) {
    errores.fecha = "La fecha no debe superar los próximos 6 meses.";
  }

  const requiereHorario =
    form.estado === "Disponible" ||
    form.estado === "En atención" ||
    form.estadoConsultorio === "Ocupado" ||
    form.estadoConsultorio === "Reservado";

  if (requiereHorario && (!form.horaInicio || !form.horaFin)) {
    errores.horario = "Debes capturar hora de entrada y hora de salida.";
  } else if (
    (form.horaInicio && !form.horaFin) ||
    (!form.horaInicio && form.horaFin)
  ) {
    errores.horario = "Debes capturar hora de entrada y hora de salida.";
  } else if (form.horaInicio && form.horaFin && inicio >= fin) {
    errores.horario = "La hora de salida debe ser mayor que la hora de entrada.";
  } else if (form.horaInicio && form.horaFin && fin - inicio < 30) {
    errores.horario = "El horario debe durar al menos 30 minutos.";
  } else if (form.horaInicio && form.horaFin && fin - inicio > 12 * 60) {
    errores.horario = "El horario no debe superar 12 horas continuas.";
  }

  if (form.estado === "En atención" && form.estadoConsultorio !== "Ocupado") {
    errores.estadoConsultorio =
      "Si el psicólogo está en atención, el consultorio debe estar ocupado.";
  }

  if (form.estado === "Disponible" && form.estadoConsultorio === "Ocupado") {
    errores.estadoConsultorio =
      "Un psicólogo disponible no puede tener el consultorio ocupado.";
  }

  if (form.estadoConsultorio === "Ocupado" && form.estado !== "En atención") {
    errores.estado =
      "Si el consultorio está ocupado, el psicólogo debe estar en atención.";
  }

  if (
    form.estadoConsultorio === "Fuera de servicio" &&
    (form.estado === "Disponible" || form.estado === "En atención")
  ) {
    errores.estadoConsultorio =
      "Un consultorio fuera de servicio no puede tener psicólogo disponible o en atención.";
  }

  if (
    (form.estado === "Fuera de turno" || form.estado === "No disponible") &&
    form.estadoConsultorio === "Ocupado"
  ) {
    errores.estadoConsultorio =
      "Un psicólogo fuera de turno o no disponible no puede tener consultorio ocupado.";
  }

  const nombreDuplicado = psicologos.some((psicologo) => {
    if (idsIguales(obtenerIdPsicologo(psicologo), idActual)) return false;

    return normalizarTexto(psicologo.nombre) === normalizarTexto(nombre);
  });

  if (nombreDuplicado) {
    errores.nombre = "Ya existe un psicólogo registrado con ese nombre.";
  }

  const consultorioCruzado = psicologos.some((psicologo) => {
    if (idsIguales(obtenerIdPsicologo(psicologo), idActual)) return false;

    const mismoConsultorio =
      normalizarTexto(psicologo.consultorio || "") ===
      normalizarTexto(consultorio);

    const mismaFecha = (psicologo.fecha || "") === form.fecha;

    const cruce = hayCruceDeHorario(
      form.horaInicio,
      form.horaFin,
      psicologo.horaInicio,
      psicologo.horaFin
    );

    return mismoConsultorio && mismaFecha && cruce;
  });

  if (consultorioCruzado) {
    errores.horario = "Ese consultorio ya está ocupado en ese mismo horario.";
  }

  return errores;
};

const Notificacion = ({ notificacion, cerrar }) => {
  if (!notificacion) return null;

  const estilos = {
    success: {
      contenedor: "border-[#16803A]/30 bg-[#E9F8EF] text-[#16803A]",
      icono: "bg-[#16803A] text-white",
    },
    error: {
      contenedor: "border-[#C62828]/30 bg-[#FCE7E7] text-[#C62828]",
      icono: "bg-[#C62828] text-white",
    },
    warning: {
      contenedor: "border-[#F2C230]/60 bg-[#FFF6D1] text-[#183B4A]",
      icono: "bg-[#F2C230] text-[#183B4A]",
    },
    info: {
      contenedor: "border-[#183B4A]/20 bg-[#E9EEF0] text-[#183B4A]",
      icono: "bg-[#183B4A] text-[#F8F7F2]",
    },
  };

  const estilo = estilos[notificacion.tipo] || estilos.info;

  return (
    <div className="fixed left-1/2 top-4 z-50 w-full max-w-[430px] -translate-x-1/2 px-5">
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 shadow-[0_14px_35px_rgba(24,59,74,0.20)] ${estilo.contenedor}`}
      >
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${estilo.icono}`}
        >
          {notificacion.tipo === "success" ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              viewBox="0 0 24 24"
            >
              <path d="m5 13 4 4L19 7" />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              viewBox="0 0 24 24"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{notificacion.titulo}</p>
          <p className="mt-0.5 text-xs font-medium opacity-80">
            {notificacion.mensaje}
          </p>
        </div>

        <button
          type="button"
          onClick={cerrar}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/60"
          aria-label="Cerrar notificación"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            viewBox="0 0 24 24"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const ModalConfirmacion = ({
  abierto,
  titulo,
  mensaje,
  textoConfirmar,
  textoCancelar,
  onConfirmar,
  onCancelar,
}) => {
  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#183B4A]/60 px-5 backdrop-blur-sm">
      <div className="w-full max-w-[360px] rounded-[24px] border border-[#D9D1B5] bg-[#F8F7F2] p-5 shadow-[0_18px_45px_rgba(16,44,56,0.35)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#FFF6D1] text-[#C59A12]">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              viewBox="0 0 24 24"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>

          <div>
            <h3 className="text-[18px] font-extrabold text-[#183B4A]">
              {titulo}
            </h3>

            <p className="mt-1 text-sm font-medium leading-5 text-[#183B4A]/65">
              {mensaje}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="h-11 rounded-xl border border-[#D9D1B5] bg-white text-sm font-bold text-[#183B4A]/70"
          >
            {textoCancelar}
          </button>

          <button
            type="button"
            onClick={onConfirmar}
            className="h-11 rounded-xl bg-[#C62828] text-sm font-bold text-white shadow-[0_10px_22px_rgba(198,40,40,0.25)]"
          >
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

const ErrorCampo = ({ mensaje }) => {
  if (!mensaje) return null;

  return (
    <p className="mt-1.5 text-xs font-bold leading-4 text-[#C62828]">
      {mensaje}
    </p>
  );
};

const CampoFechaHora = ({ form, cambiar, errores = {} }) => {
  const hayErrorFecha = Boolean(errores.fecha);
  const hayErrorHorario = Boolean(errores.horario);

  return (
    <div
      className={`rounded-2xl border p-3 ${
        hayErrorFecha || hayErrorHorario
          ? "border-[#C62828]/40 bg-[#FCE7E7]/50"
          : "border-[#D9D1B5] bg-[#F8F7F2]"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#183B4A] text-[#F2C230]">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        <div>
          <p className="text-sm font-extrabold text-[#183B4A]">
            Fecha y horario
          </p>

          <p className="text-xs font-medium text-[#183B4A]/60">
            Selecciona día, entrada y salida
          </p>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-[#183B4A]/65">Fecha</label>

        <input
          type="date"
          value={form.fecha}
          min={getFechaHoy()}
          max={getFechaLimite(6)}
          onChange={(e) => cambiar("fecha", e.target.value)}
          className={`mt-1 h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-[#183B4A] outline-none focus:border-[#F2C230] focus:ring-4 focus:ring-[#F2C230]/20 ${
            hayErrorFecha ? "border-[#C62828]" : "border-[#D9D1B5]"
          }`}
        />

        <ErrorCampo mensaje={errores.fecha} />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-[#183B4A]/65">
            Entrada
          </label>

          <input
            type="time"
            value={form.horaInicio}
            onChange={(e) => cambiar("horaInicio", e.target.value)}
            className={`mt-1 h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-[#183B4A] outline-none focus:border-[#F2C230] focus:ring-4 focus:ring-[#F2C230]/20 ${
              hayErrorHorario ? "border-[#C62828]" : "border-[#D9D1B5]"
            }`}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#183B4A]/65">Salida</label>

          <input
            type="time"
            value={form.horaFin}
            onChange={(e) => cambiar("horaFin", e.target.value)}
            className={`mt-1 h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-[#183B4A] outline-none focus:border-[#F2C230] focus:ring-4 focus:ring-[#F2C230]/20 ${
              hayErrorHorario ? "border-[#C62828]" : "border-[#D9D1B5]"
            }`}
          />
        </div>
      </div>

      <ErrorCampo mensaje={errores.horario} />
    </div>
  );
};

const CampoImagen = ({ form, cambiar, errores = {}, onSeleccionarImagen }) => {
  const color = getColorEtiqueta(form.colorEtiqueta);

  return (
    <div className="rounded-2xl border border-[#D9D1B5] bg-[#F8F7F2] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-extrabold text-[#183B4A]">
            Imagen del psicólogo
          </p>

          <p className="text-xs font-medium text-[#183B4A]/60">
            Acepta formatos de imagen del navegador
          </p>
        </div>

        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 text-sm font-black"
          style={{
            borderColor: color.valor,
            backgroundColor: color.suave,
            color: color.valor,
          }}
        >
          {form.imagen ? (
            <img
              src={form.imagen}
              alt="Vista previa"
              className="h-full w-full object-cover"
            />
          ) : (
            obtenerIniciales(form.nombre)
          )}
        </div>
      </div>

      <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D9D1B5] bg-white px-3 text-sm font-bold text-[#183B4A] transition active:scale-[0.98]">
        <svg
          className="h-5 w-5 text-[#C59A12]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          viewBox="0 0 24 24"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <path d="M17 8 12 3 7 8" />
          <path d="M12 3v12" />
        </svg>
        Seleccionar imagen
        <input
          type="file"
          accept="image/*,.apng,.avif,.bmp,.gif,.heic,.heif,.ico,.jfif,.jpg,.jpeg,.pjpeg,.pjp,.png,.svg,.webp"
          onChange={onSeleccionarImagen}
          className="hidden"
        />
      </label>

      {form.imagenNombre && (
        <p className="mt-2 truncate text-xs font-semibold text-[#183B4A]/60">
          Archivo: {form.imagenNombre}
        </p>
      )}

      {form.imagen && (
        <button
          type="button"
          onClick={() => {
            cambiar("imagen", "");
            cambiar("imagenNombre", "");
          }}
          className="mt-2 h-10 w-full rounded-xl bg-[#FFF6D1] text-xs font-bold text-[#183B4A]"
        >
          Quitar imagen
        </button>
      )}

      <ErrorCampo mensaje={errores.imagen} />
    </div>
  );
};

const CampoColorEtiqueta = ({ form, cambiar, errores = {} }) => (
  <div className="rounded-2xl border border-[#D9D1B5] bg-[#F8F7F2] p-3">
    <p className="text-sm font-extrabold text-[#183B4A]">Color de etiqueta</p>

    <p className="mt-0.5 text-xs font-medium text-[#183B4A]/60">
      Este color se verá en la pantalla del paciente.
    </p>

    <div className="mt-3 grid grid-cols-6 gap-2">
      {COLORES_ETIQUETA.map((color) => {
        const activo = form.colorEtiqueta === color.valor;

        return (
          <button
            key={color.id}
            type="button"
            onClick={() => cambiar("colorEtiqueta", color.valor)}
            className={`h-10 rounded-xl border transition active:scale-[0.96] ${
              activo
                ? "border-[#183B4A] ring-2 ring-[#F2C230]/50"
                : "border-[#D9D1B5]"
            }`}
            style={{ backgroundColor: color.valor }}
            title={color.nombre}
            aria-label={color.nombre}
          />
        );
      })}
    </div>

    <ErrorCampo mensaje={errores.colorEtiqueta} />
  </div>
);

const FormularioPsicologo = ({
  form,
  errores,
  cambiar,
  modo,
  onSubmit,
  onCancelar,
  onEliminar,
  onSeleccionarImagen,
  guardando = false,
}) => {
  const esEdicion = modo === "editar";

  return (
    <form
      onSubmit={onSubmit}
      className="mt-5 rounded-2xl border border-[#D9D1B5] bg-white p-4 shadow-[0_8px_22px_rgba(24,59,74,0.08)]"
      noValidate
    >
      <h2 className="text-[18px] font-extrabold text-[#183B4A]">
        {esEdicion ? "Editar psicólogo" : "Agregar psicólogo"}
      </h2>

      <div className="mt-4 space-y-3">
        <CampoImagen
          form={form}
          cambiar={cambiar}
          errores={errores}
          onSeleccionarImagen={onSeleccionarImagen}
        />

        <div>
          <label className="text-xs font-bold text-[#183B4A]/65">
            Nombre del psicólogo
          </label>

          <input
            type="text"
            value={form.nombre}
            maxLength={LIMITE_NOMBRE}
            onChange={(e) => cambiar("nombre", e.target.value)}
            placeholder="Ej. Psic. Ana Martínez"
            className={`mt-1 h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-[#183B4A] outline-none focus:border-[#F2C230] focus:ring-4 focus:ring-[#F2C230]/20 ${
              errores.nombre ? "border-[#C62828]" : "border-[#D9D1B5]"
            }`}
          />

          <div className="mt-1 flex items-start justify-between gap-3">
            <ErrorCampo mensaje={errores.nombre} />

            <span className="ml-auto shrink-0 text-[11px] font-semibold text-[#183B4A]/45">
              {form.nombre.length}/{LIMITE_NOMBRE}
            </span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#183B4A]/65">
            Especialidad / descripción breve
          </label>

          <textarea
            value={form.especialidad}
            onChange={(e) => cambiar("especialidad", e.target.value)}
            placeholder="Ej. Terapia cognitivo conductual, ansiedad y manejo emocional."
            maxLength={LIMITE_ESPECIALIDAD}
            rows={3}
            className={`mt-1 w-full resize-none rounded-xl border bg-white px-3 py-3 text-sm font-semibold text-[#183B4A] outline-none focus:border-[#F2C230] focus:ring-4 focus:ring-[#F2C230]/20 ${
              errores.especialidad ? "border-[#C62828]" : "border-[#D9D1B5]"
            }`}
          />

          <div className="mt-1 flex items-center justify-between gap-3">
            <ErrorCampo mensaje={errores.especialidad} />

            <span className="ml-auto text-[11px] font-semibold text-[#183B4A]/45">
              {form.especialidad.length}/{LIMITE_ESPECIALIDAD}
            </span>
          </div>
        </div>

        <CampoColorEtiqueta form={form} cambiar={cambiar} errores={errores} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#183B4A]/65">
              Consultorio
            </label>

            <input
              type="text"
              value={form.consultorio}
              maxLength={LIMITE_CONSULTORIO}
              onChange={(e) => cambiar("consultorio", e.target.value)}
              placeholder="101"
              className={`mt-1 h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-[#183B4A] outline-none focus:border-[#F2C230] focus:ring-4 focus:ring-[#F2C230]/20 ${
                errores.consultorio ? "border-[#C62828]" : "border-[#D9D1B5]"
              }`}
            />

            <ErrorCampo mensaje={errores.consultorio} />
          </div>

          <div>
            <label className="text-xs font-bold text-[#183B4A]/65">
              Estado Psicólogo
            </label>

            <select
              value={form.estado}
              onChange={(e) => cambiar("estado", e.target.value)}
              className={`mt-1 h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-[#183B4A] outline-none focus:border-[#F2C230] focus:ring-4 focus:ring-[#F2C230]/20 ${
                errores.estado ? "border-[#C62828]" : "border-[#D9D1B5]"
              }`}
            >
              <option value="">Seleccionar</option>
              {ESTADOS_PSICOLOGO.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>

            <ErrorCampo mensaje={errores.estado} />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#183B4A]/65">
            Estado Consultorio
          </label>

          <select
            value={form.estadoConsultorio}
            onChange={(e) => cambiar("estadoConsultorio", e.target.value)}
            className={`mt-1 h-11 w-full rounded-xl border bg-white px-3 text-sm font-semibold text-[#183B4A] outline-none focus:border-[#F2C230] focus:ring-4 focus:ring-[#F2C230]/20 ${
              errores.estadoConsultorio ? "border-[#C62828]" : "border-[#D9D1B5]"
            }`}
          >
            <option value="">Seleccionar</option>
            {ESTADOS_CONSULTORIO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>

          <ErrorCampo mensaje={errores.estadoConsultorio} />
        </div>

        <CampoFechaHora form={form} cambiar={cambiar} errores={errores} />

        <div className="rounded-2xl border border-[#D9D1B5] bg-[#F8F7F2] p-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-[#183B4A]">
                Pantalla de pacientes
              </p>
              <p className="mt-0.5 text-xs font-medium leading-4 text-[#183B4A]/60">
                Actívalo para mostrar al psicólogo únicamente en la fecha seleccionada.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={form.mostrarEnPantalla}
              onClick={() =>
                cambiar("mostrarEnPantalla", !form.mostrarEnPantalla)
              }
              className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                form.mostrarEnPantalla ? "bg-[#16803A]" : "bg-[#A7AFB3]"
              }`}
              title={
                form.mostrarEnPantalla
                  ? "Se mostrará en la pantalla"
                  : "No se mostrará en la pantalla"
              }
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${
                  form.mostrarEnPantalla ? "left-7" : "left-1"
                }`}
              />
            </button>
          </div>

          <div
            className={`mt-3 rounded-xl px-3 py-2 text-xs font-bold ${
              form.mostrarEnPantalla
                ? "bg-[#E9F8EF] text-[#16803A]"
                : "bg-[#E9EEF0] text-[#183B4A]/65"
            }`}
          >
            {form.mostrarEnPantalla
              ? "Visible en la pantalla durante la fecha asignada."
              : "Guardado en el sistema, pero oculto para los pacientes."}
          </div>
        </div>
      </div>

      <div
        className={`mt-4 grid gap-3 ${
          esEdicion ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        {esEdicion ? (
          <>
            <button
              type="button"
              onClick={onEliminar}
              className="h-11 rounded-xl border border-[#C62828]/30 bg-[#FCE7E7] text-xs font-bold text-[#C62828]"
            >
              Eliminar
            </button>

            <button
              type="button"
              onClick={onCancelar}
              className="h-11 rounded-xl border border-[#D9D1B5] bg-white text-xs font-bold text-[#183B4A]/65"
            >
              Cancelar
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onCancelar}
            className="h-11 rounded-xl border border-[#D9D1B5] bg-white text-sm font-bold text-[#183B4A]/65"
          >
            Cancelar
          </button>
        )}

        <button
          type="submit"
          disabled={guardando}
          className="h-11 rounded-xl bg-[#183B4A] text-sm font-bold text-[#F8F7F2] shadow-[0_8px_18px_rgba(24,59,74,0.25)] transition hover:bg-[#102C38] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {guardando ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};

export default function Psicologo() {
  const [psicologos, setPsicologos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formNuevo, setFormNuevo] = useState(FORM_INICIAL);
  const [idEditando, setIdEditando] = useState(null);
  const [formEditar, setFormEditar] = useState(FORM_INICIAL);
  const [erroresNuevo, setErroresNuevo] = useState({});
  const [erroresEditar, setErroresEditar] = useState({});
  const [notificacion, setNotificacion] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [actualizandoPantallaId, setActualizandoPantallaId] = useState(null);
  const [modalEliminar, setModalEliminar] = useState({
    abierto: false,
    id: null,
    nombre: "",
  });

  const mostrarNotificacion = (tipo, titulo, mensaje) =>
    setNotificacion({ tipo, titulo, mensaje });

  const cargarPsicologos = async () => {
    try {
      const data = await obtenerPsicologos();
      const psicologosNormalizados = Array.isArray(data)
        ? data.map((psicologo, index) => normalizarPsicologo(psicologo, index))
        : [];

      setPsicologos(psicologosNormalizados);
    } catch (error) {
      const cache = obtenerPsicologosCache();

      if (cache.length > 0) {
        setPsicologos(
          cache.map((psicologo, index) => normalizarPsicologo(psicologo, index))
        );

        mostrarNotificacion(
          "warning",
          "Sin conexión al backend",
          "Se muestran datos guardados temporalmente en este navegador."
        );
        return;
      }

      mostrarNotificacion(
        "error",
        "Error de conexión",
        error.message || "No se pudieron cargar los psicólogos desde el backend."
      );
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPsicologos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!notificacion) return;

    const timer = setTimeout(() => setNotificacion(null), 3500);

    return () => clearTimeout(timer);
  }, [notificacion]);

  const getEstadoStyle = (estado) => {
    const disponible = estado === "Disponible";

    return {
      badge: disponible
        ? "bg-[#E9F8EF] text-[#16803A] border border-[#16803A]/25"
        : "bg-[#FCE7E7] text-[#C62828] border border-[#C62828]/25",
      dot: disponible ? "bg-[#16803A]" : "bg-[#C62828]",
    };
  };

  const getEstadoConsultorioStyle = (estado) => {
    const disponible = estado === "Disponible";

    return {
      badge: disponible
        ? "bg-[#E9F8EF] text-[#16803A] border border-[#16803A]/25"
        : "bg-[#FCE7E7] text-[#C62828] border border-[#C62828]/25",
      dot: disponible ? "bg-[#16803A]" : "bg-[#C62828]",
    };
  };

  const prepararValorCampo = (campo, valor) => {
    if (campo === "nombre") return limpiarNombre(valor);
    if (campo === "consultorio") return limpiarConsultorio(valor);
    if (campo === "especialidad") return limpiarEspecialidad(valor);

    return valor;
  };

  const aplicarCambiosDependientes = (prev, campo, valor) => {
    const siguiente = { ...prev, [campo]: valor };

    if (campo === "estado") {
      if (valor === "Disponible") {
        siguiente.estadoConsultorio = "Disponible";
      }

      if (valor === "En atención") {
        siguiente.estadoConsultorio = "Ocupado";
      }

      if (
        (valor === "Fuera de turno" || valor === "No disponible") &&
        siguiente.estadoConsultorio === "Ocupado"
      ) {
        siguiente.estadoConsultorio = "Disponible";
      }
    }

    if (campo === "estadoConsultorio") {
      if (valor === "Ocupado") {
        siguiente.estado = "En atención";
      }

      if (valor === "Disponible" && prev.estado === "En atención") {
        siguiente.estado = "Disponible";
      }
    }

    return siguiente;
  };

  const cambiarNuevo = (campo, valor) => {
    const valorLimpio = prepararValorCampo(campo, valor);

    setFormNuevo((prev) =>
      aplicarCambiosDependientes(prev, campo, valorLimpio)
    );

    setErroresNuevo((prev) => ({
      ...prev,
      [campo]: "",
      ...(campo === "horaInicio" || campo === "horaFin"
        ? { horario: "" }
        : {}),
    }));
  };

  const cambiarEditar = (campo, valor) => {
    const valorLimpio = prepararValorCampo(campo, valor);

    setFormEditar((prev) =>
      aplicarCambiosDependientes(prev, campo, valorLimpio)
    );

    setErroresEditar((prev) => ({
      ...prev,
      [campo]: "",
      ...(campo === "horaInicio" || campo === "horaFin"
        ? { horario: "" }
        : {}),
    }));
  };

  const seleccionarImagen = async ({ archivo, cambiar, setErrores }) => {
    if (!archivo) return;

    if (!archivoEsImagen(archivo)) {
      setErrores((prev) => ({
        ...prev,
        imagen: "Selecciona un archivo de imagen válido.",
      }));

      mostrarNotificacion(
        "error",
        "Formato no válido",
        "El archivo seleccionado no fue reconocido como imagen."
      );

      return;
    }

    if (archivo.size > MAX_IMAGEN_BYTES) {
      setErrores((prev) => ({
        ...prev,
        imagen: `La imagen no debe superar ${MAX_IMAGEN_MB} MB.`,
      }));

      mostrarNotificacion(
        "warning",
        "Imagen muy pesada",
        `Selecciona una imagen menor a ${MAX_IMAGEN_MB} MB.`
      );

      return;
    }

    try {
      const imagenBase64 = await optimizarImagenBase64(archivo);
      const pesoFinal = calcularBytesDataUrl(imagenBase64);

      if (pesoFinal > MAX_IMAGEN_GUARDADA_BYTES) {
        setErrores((prev) => ({
          ...prev,
          imagen: `La imagen quedó demasiado pesada. Selecciona una más pequeña o usa JPG/PNG.`,
        }));

        mostrarNotificacion(
          "warning",
          "Imagen muy pesada",
          `Después de optimizarla sigue superando ${MAX_IMAGEN_GUARDADA_MB} MB.`
        );

        return;
      }

      cambiar("imagen", imagenBase64);
      cambiar("imagenNombre", archivo.name);

      setErrores((prev) => ({ ...prev, imagen: "" }));

      mostrarNotificacion(
        "success",
        "Imagen cargada",
        "La imagen se agregó correctamente al registro."
      );
    } catch {
      setErrores((prev) => ({
        ...prev,
        imagen: "No se pudo procesar la imagen seleccionada.",
      }));
    }
  };

  const limpiarFormularioNuevo = () => {
    setFormNuevo({ ...FORM_INICIAL, fecha: getFechaHoy() });
    setErroresNuevo({});
    setMostrarFormulario(false);
  };

  const construirPsicologoDesdeFormulario = (form) => ({
    nombre: limpiarNombre(form.nombre).trim().replace(/\s+/g, " "),
    consultorio: limpiarConsultorio(form.consultorio).trim().replace(/\s+/g, " "),
    fecha: form.fecha,
    horaInicio: form.horaInicio,
    horaFin: form.horaFin,
    horario: generarHorario(form),
    estado: form.estado,
    estadoConsultorio: form.estadoConsultorio,
    especialidad: limpiarEspecialidad(form.especialidad)
      .trim()
      .replace(/\s+/g, " "),
    colorEtiqueta: form.colorEtiqueta || COLOR_DEFAULT,
    imagen: form.imagen || "",
    imagenNombre: form.imagenNombre || "",
    mostrarEnPantalla: form.mostrarEnPantalla !== false,
  });

  const agregarPsicologo = async (e) => {
    e.preventDefault();

    const errores = validarFormulario({ form: formNuevo, psicologos });

    if (Object.keys(errores).length > 0) {
      setErroresNuevo(errores);

      mostrarNotificacion(
        "error",
        "Revisa el formulario",
        "Hay datos incompletos o inconsistentes antes de guardar."
      );

      return;
    }

    try {
      setGuardando(true);
      const nuevoPsicologo = construirPsicologoDesdeFormulario(formNuevo);

      await crearPsicologo(nuevoPsicologo);
      await cargarPsicologos();

      limpiarFormularioNuevo();

      mostrarNotificacion(
        "success",
        "Psicólogo registrado",
        "El registro se guardó correctamente en MongoDB Atlas."
      );
    } catch (error) {
      mostrarNotificacion(
        "error",
        "No se pudo guardar",
        error.message || "Revisa la conexión con el backend."
      );
    } finally {
      setGuardando(false);
    }
  };

  const iniciarEdicion = (psicologo) => {
    setIdEditando(obtenerIdPsicologo(psicologo));
    setMostrarFormulario(false);
    setErroresNuevo({});
    setErroresEditar({});

    setFormEditar({
      nombre: limpiarNombre(psicologo.nombre || ""),
      consultorio: limpiarConsultorio(psicologo.consultorio || ""),
      fecha: psicologo.fecha || getFechaHoy(),
      horaInicio: psicologo.horaInicio || "",
      horaFin: psicologo.horaFin || "",
      estado: normalizarEstadoPsicologo(psicologo.estado) || "",
      estadoConsultorio:
        normalizarEstadoConsultorio(psicologo.estadoConsultorio) || "",
      especialidad: limpiarEspecialidad(psicologo.especialidad || ""),
      colorEtiqueta: psicologo.colorEtiqueta || COLOR_DEFAULT,
      imagen: psicologo.imagen || "",
      imagenNombre: psicologo.imagenNombre || "",
      mostrarEnPantalla: psicologo.mostrarEnPantalla !== false,
    });
  };

  const cancelarEdicion = () => {
    setIdEditando(null);
    setErroresEditar({});
    setFormEditar({ ...FORM_INICIAL, fecha: getFechaHoy() });
  };

  const guardarEdicion = async (id) => {
    const errores = validarFormulario({
      form: formEditar,
      psicologos,
      idActual: id,
    });

    if (Object.keys(errores).length > 0) {
      setErroresEditar(errores);

      mostrarNotificacion(
        "error",
        "No se pudo guardar",
        "Corrige los campos marcados antes de actualizar el registro."
      );

      return;
    }

    try {
      setGuardando(true);
      const psicologoActualizado = construirPsicologoDesdeFormulario(formEditar);

      await actualizarPsicologo(id, psicologoActualizado);
      await cargarPsicologos();

      cancelarEdicion();

      mostrarNotificacion(
        "success",
        "Registro actualizado",
        "Los datos del psicólogo se actualizaron correctamente en MongoDB Atlas."
      );
    } catch (error) {
      mostrarNotificacion(
        "error",
        "No se pudo actualizar",
        error.message || "Revisa la conexión con el backend."
      );
    } finally {
      setGuardando(false);
    }
  };

  const solicitarEliminarPsicologo = (psicologo) => {
    const id = obtenerIdPsicologo(psicologo);

    setModalEliminar({
      abierto: true,
      id,
      nombre: psicologo.nombre,
    });
  };

  const cerrarModalEliminar = () =>
    setModalEliminar({ abierto: false, id: null, nombre: "" });

  const confirmarEliminarPsicologo = async () => {
    const id = modalEliminar.id;

    if (!id) {
      mostrarNotificacion(
        "error",
        "No se pudo eliminar",
        "El registro no tiene un identificador válido."
      );
      return;
    }

    try {
      await eliminarPsicologo(id);

      if (idsIguales(idEditando, id)) cancelarEdicion();

      cerrarModalEliminar();
      await cargarPsicologos();

      mostrarNotificacion(
        "success",
        "Registro eliminado",
        "El psicólogo fue eliminado correctamente de MongoDB Atlas."
      );
    } catch (error) {
      mostrarNotificacion(
        "error",
        "No se pudo eliminar",
        error.message || "Revisa la conexión con el backend."
      );
    }
  };

  const cambiarVisibilidadPantalla = async (psicologo, mostrar) => {
    const id = obtenerIdPsicologo(psicologo);

    if (!id) {
      mostrarNotificacion(
        "error",
        "No se pudo actualizar",
        "El psicólogo no tiene un identificador válido."
      );
      return;
    }

    const estadoNoVisible =
      psicologo.estado === "Fuera de turno" ||
      psicologo.estado === "No disponible";

    const cambios = mostrar
      ? {
          fecha: getFechaHoy(),
          mostrarEnPantalla: true,
          ...(estadoNoVisible
            ? {
                estado: "Disponible",
                estadoConsultorio: "Disponible",
              }
            : {}),
        }
      : {
          mostrarEnPantalla: false,
        };

    try {
      setActualizandoPantallaId(id);
      await actualizarPsicologo(id, cambios);
      await cargarPsicologos();

      mostrarNotificacion(
        "success",
        mostrar ? "Programado para hoy" : "Oculto de la pantalla",
        mostrar
          ? `${psicologo.nombre} aparecerá hoy en la pantalla de pacientes.`
          : `${psicologo.nombre} seguirá registrado, pero ya no aparecerá en la pantalla.`
      );
    } catch (error) {
      mostrarNotificacion(
        "error",
        "No se pudo actualizar",
        error.message || "Revisa la conexión con el backend."
      );
    } finally {
      setActualizandoPantallaId(null);
    }
  };

  const totalDisponibles = useMemo(
    () =>
      psicologos.filter((psicologo) => psicologo.estado === "Disponible")
        .length,
    [psicologos]
  );

  return (
    <main className="min-h-dvh bg-[#183B4A] text-[#183B4A]">
      <Notificacion
        notificacion={notificacion}
        cerrar={() => setNotificacion(null)}
      />

      <ModalConfirmacion
        abierto={modalEliminar.abierto}
        titulo="Eliminar psicólogo"
        mensaje={`¿Seguro que deseas eliminar a ${modalEliminar.nombre}? Esta acción no se puede deshacer.`}
        textoCancelar="Cancelar"
        textoConfirmar="Eliminar"
        onCancelar={cerrarModalEliminar}
        onConfirmar={confirmarEliminarPsicologo}
      />

      <section className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#F8F7F2]">
        <div className="absolute left-0 top-0 h-3 w-full bg-[#F2C230]" />
        <div className="absolute -right-16 top-8 h-36 w-36 rounded-full border-[18px] border-[#F2C230]/50" />
        <div className="absolute -left-20 top-[360px] h-44 w-44 rounded-full border-[20px] border-[#183B4A]/10" />

        <section className="relative z-10 flex-1 overflow-y-auto px-6 pb-40 pt-8">
          <div className="mt-4 overflow-hidden rounded-[26px] border border-[#F2C230]/30 bg-[#183B4A] p-5 text-[#F8F7F2] shadow-[0_14px_30px_rgba(24,59,74,0.28)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center rounded-full bg-[#F2C230] px-3 py-1 text-xs font-bold text-[#183B4A]">
                  Psicólogos registrados
                </div>

                <h2 className="mt-4 text-[40px] font-extrabold leading-none">
                  {psicologos.length}
                </h2>

                <p className="mt-2 text-sm font-medium text-[#F8F7F2]/70">
                  Disponibles: {totalDisponibles}
                </p>
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <svg
                  className="h-9 w-9 text-[#F2C230]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </div>
          </div>

          {mostrarFormulario && (
            <FormularioPsicologo
              form={formNuevo}
              errores={erroresNuevo}
              cambiar={cambiarNuevo}
              modo="agregar"
              onSubmit={agregarPsicologo}
              onCancelar={limpiarFormularioNuevo}
              guardando={guardando}
              onSeleccionarImagen={(e) => {
                seleccionarImagen({
                  archivo: e.target.files?.[0],
                  cambiar: cambiarNuevo,
                  setErrores: setErroresNuevo,
                });
                e.target.value = "";
              }}
            />
          )}

          <div className="mt-7 mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-extrabold text-[#183B4A]">
              Lista de psicólogos
            </h2>
          </div>

          <div className="space-y-4">
            {psicologos.map((psicologo) => {
              const estadoStyle = getEstadoStyle(psicologo.estado);
              const estadoConsultorioStyle = getEstadoConsultorioStyle(
                psicologo.estadoConsultorio
              );
              const estaEditando =
                idsIguales(idEditando, obtenerIdPsicologo(psicologo));
              const colorEtiqueta = getColorEtiqueta(psicologo.colorEtiqueta);

              return (
                <article
                  key={obtenerIdPsicologo(psicologo)}
                  className="overflow-hidden rounded-2xl border border-[#D9D1B5] bg-white shadow-[0_8px_22px_rgba(24,59,74,0.08)]"
                >
                  <div
                    className="h-2 w-full"
                    style={{ backgroundColor: colorEtiqueta.valor }}
                  />

                  <div className="p-4">
                    {estaEditando ? (
                      <FormularioPsicologo
                        form={formEditar}
                        errores={erroresEditar}
                        cambiar={cambiarEditar}
                        modo="editar"
                        onSubmit={(e) => {
                          e.preventDefault();
                          guardarEdicion(obtenerIdPsicologo(psicologo));
                        }}
                        onCancelar={cancelarEdicion}
                        onEliminar={() => solicitarEliminarPsicologo(psicologo)}
                        guardando={guardando}
                        onSeleccionarImagen={(e) => {
                          seleccionarImagen({
                            archivo: e.target.files?.[0],
                            cambiar: cambiarEditar,
                            setErrores: setErroresEditar,
                          });
                          e.target.value = "";
                        }}
                      />
                    ) : (
                      <>
                        <div className="grid grid-cols-[auto_minmax(0,1fr)_44px] items-start gap-3">
                          <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-sm font-black"
                            style={{
                              backgroundColor: colorEtiqueta.suave,
                              color: colorEtiqueta.valor,
                            }}
                          >
                            {psicologo.imagen ? (
                              <img
                                src={psicologo.imagen}
                                alt={psicologo.nombre}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              obtenerIniciales(psicologo.nombre)
                            )}
                          </div>

                          <div className="min-w-0">
                            <h3
                              title={psicologo.nombre}
                              className="max-h-[46px] overflow-hidden break-words text-[18px] font-extrabold leading-tight text-[#183B4A]"
                            >
                              {psicologo.nombre}
                            </h3>

                            <p className="mt-1 truncate text-sm font-semibold text-[#183B4A]/65">
                              Consultorio {psicologo.consultorio}
                            </p>

                            <p className="mt-2 max-h-[34px] overflow-hidden break-words text-xs font-bold leading-4 text-[#C59A12]">
                              {psicologo.especialidad ||
                                "Especialidad por definir"}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => iniciarEdicion(psicologo)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF6D1] text-[#183B4A] shadow-sm transition active:scale-[0.96]"
                            aria-label="Editar psicólogo"
                            title="Editar psicólogo"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                            </svg>
                          </button>
                        </div>

                        {(() => {
                          const visibleHoy =
                            psicologo.mostrarEnPantalla !== false &&
                            psicologo.fecha === getFechaHoy();
                          const actualizando = idsIguales(
                            actualizandoPantallaId,
                            obtenerIdPsicologo(psicologo)
                          );

                          return (
                            <div
                              className={`mt-4 flex items-center justify-between gap-3 rounded-xl border p-3 ${
                                visibleHoy
                                  ? "border-[#16803A]/25 bg-[#E9F8EF]"
                                  : "border-[#D9D1B5] bg-[#F8F7F2]"
                              }`}
                            >
                              <div className="min-w-0">
                                <p
                                  className={`text-xs font-extrabold ${
                                    visibleHoy
                                      ? "text-[#16803A]"
                                      : "text-[#183B4A]"
                                  }`}
                                >
                                  {visibleHoy
                                    ? "Programado para hoy"
                                    : "No aparece hoy en pantalla"}
                                </p>
                                <p className="mt-0.5 text-[11px] font-medium leading-4 text-[#183B4A]/60">
                                  {visibleHoy
                                    ? "Los pacientes pueden verlo en la pantalla."
                                    : "El registro permanece guardado en el sistema."}
                                </p>
                              </div>

                              <button
                                type="button"
                                disabled={actualizando}
                                onClick={() =>
                                  cambiarVisibilidadPantalla(
                                    psicologo,
                                    !visibleHoy
                                  )
                                }
                                className={`shrink-0 rounded-xl px-3 py-2 text-xs font-extrabold transition active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 ${
                                  visibleHoy
                                    ? "border border-[#C62828]/25 bg-[#FCE7E7] text-[#C62828]"
                                    : "bg-[#F2C230] text-[#183B4A]"
                                }`}
                              >
                                {actualizando
                                  ? "Actualizando..."
                                  : visibleHoy
                                  ? "Ocultar"
                                  : "Mostrar hoy"}
                              </button>
                            </div>
                          );
                        })()}

                        <div className="mt-4 rounded-xl border border-[#D9D1B5]/70 bg-[#F8F7F2] p-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-xs font-bold text-[#183B4A]/60">
                                Estado psicólogo
                              </p>

                              <span
                                className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${estadoStyle.badge}`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${estadoStyle.dot}`}
                                />
                                {psicologo.estado}
                              </span>
                            </div>

                            <div>
                              <p className="text-xs font-bold text-[#183B4A]/60">
                                Estado consultorio
                              </p>

                              <span
                                className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${estadoConsultorioStyle.badge}`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${estadoConsultorioStyle.dot}`}
                                />
                                {psicologo.estadoConsultorio}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-[#D9D1B5]/70 bg-[#F8F7F2] p-3">
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-5 w-5 text-[#C59A12]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path d="M4 3h12v18H4z" />
                                <path d="M8 7h4" />
                                <path d="M8 11h4" />
                                <path d="M8 15h4" />
                                <path d="M16 8h4v13h-4" />
                              </svg>

                              <p className="text-xs font-bold text-[#183B4A]/60">
                                Consultorio
                              </p>
                            </div>

                            <p className="mt-2 truncate text-lg font-extrabold text-[#183B4A]">
                              {psicologo.consultorio}
                            </p>
                          </div>

                          <div className="rounded-xl border border-[#D9D1B5]/70 bg-[#F8F7F2] p-3">
                            <div className="flex items-center gap-2">
                              <svg
                                className="h-5 w-5 text-[#C59A12]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 7v5l3 2" />
                              </svg>

                              <p className="text-xs font-bold text-[#183B4A]/60">
                                Horario
                              </p>
                            </div>

                            <p className="mt-2 break-words text-sm font-extrabold leading-5 text-[#183B4A]">
                              {psicologo.horario}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {psicologos.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[#D9D1B5] bg-white px-5 py-8 text-center">
              <p className="text-[15px] font-extrabold text-[#183B4A]">
                No hay psicólogos registrados
              </p>

              <p className="mt-1 text-sm text-[#183B4A]/60">
                Presiona el botón inferior para agregar el primer registro.
              </p>
            </div>
          )}
        </section>

        {!mostrarFormulario && idEditando === null && (
          <div className="fixed bottom-[78px] left-1/2 z-20 w-full max-w-[430px] -translate-x-1/2 px-6">
            <button
              type="button"
              onClick={() => {
                setMostrarFormulario(true);
                cancelarEdicion();
                setErroresNuevo({});
              }}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#F2C230] text-[16px] font-extrabold text-[#183B4A] shadow-[0_10px_25px_rgba(242,194,48,0.35)] transition hover:bg-[#C59A12] active:scale-[0.98]"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                viewBox="0 0 24 24"
              >
                <path d="M12 5v14" />
                <path d="M5 12h14" />
              </svg>
              Agregar psicólogo
            </button>
          </div>
        )}

        <Footer />
      </section>
    </main>
  );
}