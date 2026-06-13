import { useEffect, useMemo, useState } from "react";
import logoCasaDomenica from "../img/casa_domenica.svg";
import { obtenerPsicologos, obtenerPsicologosCache } from "../services/psicologosApi";

const STORAGE_KEY = "psicologos_app_v1";

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
    id: "crema",
    nombre: "Crema",
    valor: "#F8F7F2",
    suave: "#FFFFFF",
    texto: "#183B4A",
  },
  {
    id: "crema-suave",
    nombre: "Crema suave",
    valor: "#D9D1B5",
    suave: "#F8F7F2",
    texto: "#183B4A",
  },
];

const COLOR_DEFAULT = "#F2C230";

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
  },
  {
    id: 3,
    nombre: "Psic. Laura Gómez",
    consultorio: "103",
    fecha: "",
    horaInicio: "",
    horaFin: "",
    horario: "Sin horario asignado",
    estado: "Fuera de turno",
    estadoConsultorio: "Disponible",
    especialidad:
      "Terapia humanista, regulación emocional, autoestima y crecimiento personal.",
    colorEtiqueta: "#C59A12",
    imagen: "",
    imagenNombre: "",
  },
];

const getColorEtiqueta = (valor) => {
  return (
    COLORES_ETIQUETA.find((color) => color.valor === valor) ||
    COLORES_ETIQUETA[2]
  );
};

const normalizarPsicologo = (psicologo) => ({
  ...psicologo,
  especialidad: psicologo.especialidad || "Especialidad por definir.",
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

    return psicologos.map(normalizarPsicologo);
  } catch {
    return DEFAULT_PSICOLOGOS.map(normalizarPsicologo);
  }
};

const getFechaHoy = () => {
  const partes = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valores = {};

  partes.forEach(({ type, value }) => {
    valores[type] = value;
  });

  return `${valores.year}-${valores.month}-${valores.day}`;
};

const formatearHoraActual = (fecha) => {
  return fecha.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatearFechaActual = (fecha) => {
  return fecha.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
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

const obtenerIniciales = (nombre) => {
  const limpio = String(nombre || "")
    .replace("Psic.", "")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (limpio.length === 0) return "PS";

  const primera = limpio[0]?.charAt(0) || "";
  const segunda = limpio[1]?.charAt(0) || "";

  return `${primera}${segunda}`.toUpperCase();
};

const obtenerHoraAtencion = (psicologo) => {
  if (psicologo.horaInicio) return formatearHora(psicologo.horaInicio);

  if (psicologo.horario && psicologo.horario !== "Sin horario asignado") {
    return psicologo.horario;
  }

  return "Por asignar";
};

const getEstadoPantalla = (psicologo) => {
  const texto = psicologo.estado || "No disponible";
  const disponible = texto === "Disponible";

  return {
    texto,
    badge: disponible
      ? "bg-[#E9F8EF] text-[#16803A] border-[#16803A]"
      : "bg-[#FCE7E7] text-[#C62828] border-[#C62828]",
    punto: disponible ? "bg-[#16803A]" : "bg-[#C62828]",
    borde: disponible ? "border-[#16803A]/45" : "border-[#C62828]/45",
    bordeStatus: disponible ? "#16803A" : "#C62828",
  };
};

const IconoPuerta = () => (
  <svg
    className="h-8 w-8"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M5 21V4a1 1 0 0 1 1-1h10v18" />
    <path d="M16 21h3" />
    <path d="M9 12h.01" />
  </svg>
);

const IconoReloj = () => (
  <svg
    className="h-8 w-8"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const IconoEspecialidad = () => (
  <svg
    className="h-8 w-8"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    viewBox="0 0 24 24"
  >
    <path d="M12 3a4 4 0 0 0-4 4v1a4 4 0 0 0-3 7 4 4 0 0 0 7 2" />
    <path d="M12 3a4 4 0 0 1 4 4v1a4 4 0 0 1 3 7 4 4 0 0 1-7 2" />
    <path d="M12 3v18" />
  </svg>
);

const TarjetaPsicologo = ({ psicologo, index }) => {
  const estado = getEstadoPantalla(psicologo);
  const color = getColorEtiqueta(psicologo.colorEtiqueta);

  return (
    <article
      className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-[32px] border ${estado.borde} bg-[#F8F7F2] p-6 shadow-[0_18px_45px_rgba(16,44,56,0.22)]`}
      style={{ borderTop: `10px solid ${color.valor}` }}
    >
      <div
        className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full text-[34px] font-black ring-8 ring-white"
        style={{
          backgroundColor: color.suave,
          color: color.valor,
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

      <div className="mt-4 text-center">
        <h2 className="text-[26px] font-black leading-tight text-[#183B4A]">
          {psicologo.nombre || "Psicólogo asignado"}
        </h2>

        <div className="mx-auto mt-3 flex max-w-[250px] items-center">
          <div
            className="h-px flex-1"
            style={{ backgroundColor: color.valor }}
          />
          <div
            className="mx-3 h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color.valor }}
          />
          <div
            className="h-px flex-1"
            style={{ backgroundColor: color.valor }}
          />
        </div>
      </div>

      {/* ESTATUS GRANDE PARA PACIENTES */}
      <div
        className={`mx-auto mt-4 flex w-full max-w-[360px] items-center justify-center gap-4 rounded-[24px] border-4 px-5 py-4 shadow-[0_12px_28px_rgba(16,44,56,0.16)] ${estado.badge}`}
        style={{ borderColor: estado.bordeStatus }}
      >
        <span className={`h-6 w-6 shrink-0 rounded-full ${estado.punto}`} />

        <div className="text-center">
          <p className="text-[13px] font-black uppercase tracking-[3px] opacity-80">
            Estado actual
          </p>

          <p className="mt-1 text-[34px] font-black leading-none">
            {estado.texto}
          </p>
        </div>
      </div>

      <div className="mt-5 flex-1 space-y-4 overflow-hidden">
        <div className="flex items-center gap-4 border-b border-[#D9D1B5] pb-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: color.suave,
              color: color.valor,
            }}
          >
            <IconoPuerta />
          </div>

          <div>
            <p className="text-[16px] font-semibold text-[#183B4A]/60">
              Consultorio
            </p>

            <p
              className="text-[30px] font-black leading-none"
              style={{ color: color.valor }}
            >
              {psicologo.consultorio || "N/A"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 border-b border-[#D9D1B5] pb-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: color.suave,
              color: color.valor,
            }}
          >
            <IconoReloj />
          </div>

          <div>
            <p className="text-[16px] font-semibold text-[#183B4A]/60">
              Hora de atención
            </p>

            <p
              className="text-[26px] font-black leading-none"
              style={{ color: color.valor }}
            >
              {obtenerHoraAtencion(psicologo)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: color.suave,
              color: color.valor,
            }}
          >
            <IconoEspecialidad />
          </div>

          <div>
            <p className="text-[18px] font-bold text-[#183B4A]/65">
              Especialidad
            </p>

            <p className="mt-2 line-clamp-3 text-[clamp(19px,1.3vw,25px)] font-bold leading-[1.35] text-[#183B4A]">
              {psicologo.especialidad || "Especialidad por definir."}
            </p>
          </div>
        </div>
      </div>

      <div className="absolute right-5 top-7 flex h-10 w-10 items-center justify-center rounded-full bg-[#183B4A] text-sm font-black text-[#F2C230]">
        {String(index + 1).padStart(2, "0")}
      </div>
    </article>
  );
};

export default function Pantalla() {
  const [psicologos, setPsicologos] = useState([]);
  const [fechaActual, setFechaActual] = useState(new Date());

  useEffect(() => {
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const actualizarDatos = async () => {
      try {
        const data = await obtenerPsicologos();
        setPsicologos(
          Array.isArray(data) ? data.map(normalizarPsicologo) : []
        );
      } catch (error) {
        const cache = obtenerPsicologosCache();
        setPsicologos(
          Array.isArray(cache) ? cache.map(normalizarPsicologo) : []
        );
        console.error("Error al cargar psicólogos desde el backend:", error);
      }
    };

    actualizarDatos();

    const intervaloDatos = setInterval(actualizarDatos, 3000);
    const intervaloReloj = setInterval(() => setFechaActual(new Date()), 1000);

    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;

      clearInterval(intervaloDatos);
      clearInterval(intervaloReloj);
    };
  }, []);

  const psicologosVisibles = useMemo(() => {
    const hoy = getFechaHoy();

    return psicologos.filter((psicologo) => {
      const programadoHoy =
        psicologo.mostrarEnPantalla !== false &&
        psicologo.fecha === hoy;

      const estadoValido =
        psicologo.estado !== "No disponible" &&
        psicologo.estado !== "Fuera de turno";

      const consultorioValido =
        psicologo.estadoConsultorio !== "Fuera de servicio";

      return programadoHoy && estadoValido && consultorioValido;
    });
  }, [psicologos]);

  const clasesGrid =
    psicologosVisibles.length === 1
      ? "mx-auto w-full max-w-[660px] grid-cols-1"
      : psicologosVisibles.length === 2
      ? "mx-auto w-full max-w-[1280px] grid-cols-2"
      : "grid-cols-3";

  return (
    <main className="fixed inset-0 h-[100dvh] w-screen overflow-hidden bg-[#183B4A] text-[#183B4A]">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute left-0 top-0 h-4 w-full bg-[#F2C230]" />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-120px] h-[360px] w-[360px] rounded-full border-[42px] border-[#F2C230]/35" />
      <div className="pointer-events-none absolute right-[-80px] top-[120px] h-[420px] w-[220px] rounded-full border-[38px] border-[#F2C230]/30" />
      <div className="pointer-events-none absolute bottom-[-80px] right-10 h-[260px] w-[260px] rounded-full bg-[#102C38]/45" />

      <section className="relative z-10 flex h-full min-h-0 flex-col px-8 py-5">
        <header className="grid shrink-0 grid-cols-[1fr_1.5fr_1fr] items-start gap-6">
          {/* Logo Casa Domenica */}
          <div className="flex justify-start">
            <div className="flex min-h-[92px] min-w-[230px] items-center justify-center rounded-[24px] border border-[#D9D1B5] bg-[#F8F7F2] px-7 py-4 shadow-[0_12px_30px_rgba(16,44,56,0.22)]">
              <img
                src={logoCasaDomenica}
                alt="Casa Domenica"
                className="h-20 w-auto object-contain"
              />
            </div>
          </div>

          <div className="text-center">
            <h2 className="mt-4 text-[50px] font-black leading-none tracking-tight text-[#F8F7F2]">
              Bienvenido/a
            </h2>

            <p className="mt-3 text-[23px] font-semibold text-[#D9D1B5]">
              Por favor dirígete al consultorio asignado
            </p>
          </div>

          <div className="flex justify-end">
            <div className="flex items-center gap-4 rounded-[24px] border border-[#F2C230]/30 bg-[#102C38]/70 px-5 py-4 shadow-[0_12px_30px_rgba(16,44,56,0.26)]">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border-[4px] border-[#F2C230] text-[#F2C230]">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>

              <div className="text-right">
                <p className="text-[34px] font-black leading-none text-[#F8F7F2]">
                  {formatearHoraActual(fechaActual)}
                </p>

                <p className="mt-2 text-[16px] font-semibold capitalize text-[#D9D1B5]">
                  {formatearFechaActual(fechaActual)}
                </p>
              </div>
            </div>
          </div>
        </header>

        <section
          className={`mt-6 grid min-h-0 flex-1 gap-6 ${clasesGrid}`}
        >
          {psicologosVisibles.length > 0 ? (
            psicologosVisibles.slice(0, 3).map((psicologo, index) => (
              <TarjetaPsicologo
                key={psicologo._id || psicologo.id}
                psicologo={psicologo}
                index={index}
              />
            ))
          ) : (
            <div className="col-span-full flex min-h-0 items-center justify-center">
              <div className="max-w-[680px] rounded-[32px] border border-[#F2C230]/35 bg-[#102C38]/75 px-10 py-12 text-center shadow-[0_18px_45px_rgba(16,44,56,0.28)]">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#F2C230] text-[#183B4A]">
                  <svg
                    className="h-11 w-11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M16 3v4" />
                    <path d="M8 3v4" />
                    <path d="M3 11h18" />
                  </svg>
                </div>

                <h2 className="mt-6 text-[34px] font-black text-[#F8F7F2]">
                  No hay psicólogos programados para hoy
                </h2>

                <p className="mt-3 text-[20px] font-semibold leading-7 text-[#D9D1B5]">
                  Los registros permanecen guardados. Desde la sección
                  Psicólogos puedes seleccionar “Mostrar hoy”.
                </p>
              </div>
            </div>
          )}
        </section>

        <footer className="mx-auto mt-5 flex shrink-0 max-w-[760px] items-center justify-center gap-4 rounded-full border border-[#F2C230]/35 bg-[#102C38]/75 px-8 py-3 text-center shadow-[0_12px_30px_rgba(16,44,56,0.25)]">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F2C230] text-[#183B4A]">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
            >
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
            </svg>
          </div>

          <p className="text-[20px] font-bold text-[#F8F7F2]">
            Cada familia tiene una historia. Bienvenidos a la nuestra.
          </p>
        </footer>
      </section>
    </main>
  );
}
