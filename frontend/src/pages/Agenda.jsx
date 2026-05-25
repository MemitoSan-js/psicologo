import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import { obtenerPsicologos, obtenerPsicologosCache } from "../services/psicologosApi";

const STORAGE_KEY = "psicologos_app_v1";

const DEFAULT_PSICOLOGOS = [
  {
    id: 1,
    nombre: "SAN LORENZO CACAOTEPEC",
    especialidad: "MUNICIPIO DEL ESTADO DE OAXACA",
    descripcionEspecialidad: "Municipio del Estado de Oaxaca",
    consultorio: "SAN LORENZO",
    fecha: "21/05/2026",
    horaInicio: "19:01",
    horaFin: "20:01",
    horario: "21/05/2026 · 07:01 p.m. - 08:01 p.m.",
    estado: "Disponible",
    estadoConsultorio: "Disponible",
    colorEtiqueta: "#F4C21B",
    imagen: "",
  },
];

// eslint-disable-next-line no-unused-vars
const obtenerPsicologosGuardados = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PSICOLOGOS));
      return DEFAULT_PSICOLOGOS;
    }

    const psicologos = JSON.parse(data);

    if (!Array.isArray(psicologos)) {
      return DEFAULT_PSICOLOGOS;
    }

    return psicologos;
  } catch (error) {
    console.error("Error al leer psicólogos:", error);
    return DEFAULT_PSICOLOGOS;
  }
};

const normalizarTexto = (texto) => {
  return String(texto || "").trim();
};

const formatearHora12 = (hora) => {
  if (!hora) return "";

  const [hh, mm] = hora.split(":");
  const horas = Number(hh);
  const minutos = mm || "00";

  if (Number.isNaN(horas)) return hora;

  const periodo = horas >= 12 ? "p.m." : "a.m.";
  const hora12 = horas % 12 || 12;

  return `${String(hora12).padStart(2, "0")}:${minutos} ${periodo}`;
};

const obtenerHorario = (psicologo) => {
  if (psicologo.horario) return psicologo.horario;

  const fecha = psicologo.fecha ? `${psicologo.fecha} · ` : "";
  const inicio = formatearHora12(psicologo.horaInicio);
  const fin = formatearHora12(psicologo.horaFin);

  if (inicio && fin) return `${fecha}${inicio} - ${fin}`;
  if (inicio) return `${fecha}${inicio}`;

  return "Sin horario asignado";
};

const obtenerImagenPsicologo = (psicologo) => {
  return (
    psicologo.imagen ||
    psicologo.foto ||
    psicologo.imagenUrl ||
    psicologo.fotoUrl ||
    psicologo.avatar ||
    ""
  );
};

const getEstadoPsicologoStyle = (estado) => {
  const estadoNormalizado = normalizarTexto(estado).toLowerCase();

  if (
    estadoNormalizado === "disponible" ||
    estadoNormalizado === "en turno"
  ) {
    return {
      badge: "bg-[#E9F8EF] text-[#16803A] border border-[#16803A]/20",
      dot: "bg-[#16803A]",
    };
  }

  if (
    estadoNormalizado === "ocupado" ||
    estadoNormalizado === "en consulta" ||
    estadoNormalizado === "en atención" ||
    estadoNormalizado === "en atencion"
  ) {
    return {
      badge: "bg-[#FCE7E7] text-[#C62828] border border-[#C62828]/20",
      dot: "bg-[#C62828]",
    };
  }

  if (
    estadoNormalizado === "fuera de turno" ||
    estadoNormalizado === "no disponible"
  ) {
    return {
      badge: "bg-[#F2E4C4] text-[#8A6610] border border-[#8A6610]/20",
      dot: "bg-[#C99B13]",
    };
  }

  return {
    badge: "bg-[#E7ECEF] text-[#34586A] border border-[#34586A]/20",
    dot: "bg-[#34586A]",
  };
};

const getEstadoConsultorioStyle = (estado) => {
  const estadoNormalizado = normalizarTexto(estado).toLowerCase();

  if (estadoNormalizado === "disponible") {
    return {
      badge: "bg-[#E9F8EF] text-[#16803A] border border-[#16803A]/20",
      dot: "bg-[#16803A]",
    };
  }

  if (
    estadoNormalizado === "ocupado" ||
    estadoNormalizado === "en uso" ||
    estadoNormalizado === "en consulta"
  ) {
    return {
      badge: "bg-[#FCE7E7] text-[#C62828] border border-[#C62828]/20",
      dot: "bg-[#C62828]",
    };
  }

  if (
    estadoNormalizado === "reservado" ||
    estadoNormalizado === "fuera de servicio"
  ) {
    return {
      badge: "bg-[#F2E4C4] text-[#8A6610] border border-[#8A6610]/20",
      dot: "bg-[#C99B13]",
    };
  }

  return {
    badge: "bg-[#E7ECEF] text-[#34586A] border border-[#34586A]/20",
    dot: "bg-[#34586A]",
  };
};

function IconoUsuario() {
  return (
    <svg
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function AvatarPsicologo({ psicologo }) {
  const [errorImagen, setErrorImagen] = useState(false);
  const imagen = obtenerImagenPsicologo(psicologo);

  if (!imagen || errorImagen) {
    return (
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[#F4C21B]/50 bg-[#173B4C] text-[#F4C21B] shadow-[0_8px_18px_rgba(23,59,76,0.22)]">
        <IconoUsuario />
      </div>
    );
  }

  return (
    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border-2 border-[#F4C21B] bg-[#173B4C] shadow-[0_8px_18px_rgba(23,59,76,0.22)]">
      <img
        src={imagen}
        alt={psicologo.nombre || "Psicólogo"}
        className="h-full w-full object-cover"
        onError={() => setErrorImagen(true)}
      />
    </div>
  );
}

export default function Agenda() {
  const [psicologos, setPsicologos] = useState([]);

  useEffect(() => {
    const actualizarPsicologos = async () => {
      try {
        const data = await obtenerPsicologos();
        setPsicologos(Array.isArray(data) ? data : []);
      } catch (error) {
        const cache = obtenerPsicologosCache();
        setPsicologos(cache);
        console.error("Error al cargar psicólogos desde el backend:", error);
      }
    };

    actualizarPsicologos();

    const intervalo = setInterval(actualizarPsicologos, 5000);

    return () => {
      clearInterval(intervalo);
    };
  }, []);

  const psicologosDisponibles = useMemo(() => {
    return psicologos.filter((psicologo) => {
      const estado = normalizarTexto(psicologo.estado).toLowerCase();
      return estado === "disponible" || estado === "en turno";
    }).length;
  }, [psicologos]);

  const consultoriosOcupados = useMemo(() => {
    return psicologos.filter((psicologo) => {
      const estado = normalizarTexto(psicologo.estadoConsultorio).toLowerCase();
      return (
        estado === "ocupado" ||
        estado === "en uso" ||
        estado === "en consulta"
      );
    }).length;
  }, [psicologos]);

  return (
    <main className="min-h-dvh bg-[#173B4C] text-[#173B4C]">
      <section className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#F7F5ED]">
        <div className="absolute left-0 top-0 h-3 w-full bg-[#F4C21B]" />
        <div className="absolute -right-20 top-10 h-40 w-40 rounded-full border-[18px] border-[#F4C21B]/55" />
        <div className="absolute -left-24 top-[340px] h-44 w-44 rounded-full border-[20px] border-[#173B4C]/10" />
        <div className="absolute -right-24 bottom-44 h-52 w-52 rounded-full bg-[#F4C21B]/10" />

        <section className="relative z-10 flex-1 overflow-y-auto px-6 pb-28 pt-8">
          <div className="mt-4 overflow-hidden rounded-[26px] border border-[#F4C21B]/30 bg-[#173B4C] p-5 text-white shadow-[0_14px_30px_rgba(23,59,76,0.32)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center rounded-full bg-[#F4C21B] px-3 py-1 text-xs font-black text-[#173B4C]">
                  Agenda de psicólogos
                </div>

                <h2 className="mt-4 text-[42px] font-black leading-none text-white">
                  {psicologos.length}
                </h2>
              </div>

              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-[#F4C21B]">
                <svg
                  className="h-9 w-9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M7 3v4" />
                  <path d="M17 3v4" />
                  <rect x="4" y="5" width="16" height="16" rx="2" />
                  <path d="M4 11h16" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#16803A]/20 bg-white p-4 shadow-[0_8px_22px_rgba(23,59,76,0.10)]">
              <p className="text-xs font-black uppercase leading-4 tracking-wide text-[#45687A]">
                Psicólogos disponibles
              </p>

              <p className="mt-3 text-3xl font-black text-[#16803A]">
                {psicologosDisponibles}
              </p>
            </div>

            <div className="rounded-2xl border border-[#C62828]/20 bg-white p-4 shadow-[0_8px_22px_rgba(23,59,76,0.10)]">
              <p className="text-xs font-black uppercase leading-4 tracking-wide text-[#45687A]">
                Consultorios ocupados
              </p>

              <p className="mt-3 text-3xl font-black text-[#C62828]">
                {consultoriosOcupados}
              </p>
            </div>
          </div>

          <div className="mt-7">
            <div className="mt-4 space-y-4">
              {psicologos.map((psicologo) => {
                const estadoPsicologoStyle = getEstadoPsicologoStyle(
                  psicologo.estado
                );

                const estadoConsultorioStyle = getEstadoConsultorioStyle(
                  psicologo.estadoConsultorio
                );

                const colorEtiqueta = psicologo.colorEtiqueta || "#F4C21B";

                return (
                  <article
                    key={psicologo.id}
                    className="overflow-hidden rounded-2xl border border-[#E0D2A1] bg-white shadow-[0_10px_24px_rgba(23,59,76,0.12)]"
                  >
                    <div
                      className="h-2 w-full"
                      style={{ backgroundColor: colorEtiqueta }}
                    />

                    <div className="p-4">
                      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
                        <AvatarPsicologo psicologo={psicologo} />

                        <div className="min-w-0">
                          <h3 className="line-clamp-2 break-words text-[18px] font-black leading-tight text-[#173B4C]">
                            {psicologo.nombre || "Sin nombre"}
                          </h3>

                          <p className="mt-1 truncate text-sm font-semibold text-[#45687A]">
                            Consultorio{" "}
                            {psicologo.consultorio || "Sin consultorio"}
                          </p>

                          {(psicologo.especialidad ||
                            psicologo.descripcionEspecialidad) && (
                            <p className="mt-1 line-clamp-2 break-words text-xs font-black uppercase leading-4 tracking-wide text-[#C99B13]">
                              {psicologo.especialidad ||
                                psicologo.descripcionEspecialidad}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-[#E0D2A1]/80 bg-[#F7F5ED] p-3">
                          <p className="text-xs font-bold text-[#45687A]">
                            Estado psicólogo
                          </p>

                          <span
                            className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${estadoPsicologoStyle.badge}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${estadoPsicologoStyle.dot}`}
                            />
                            {psicologo.estado || "No disponible"}
                          </span>
                        </div>

                        <div className="rounded-xl border border-[#E0D2A1]/80 bg-[#F7F5ED] p-3">
                          <p className="text-xs font-bold text-[#45687A]">
                            Estado consultorio
                          </p>

                          <span
                            className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${estadoConsultorioStyle.badge}`}
                          >
                            <span
                              className={`h-2 w-2 rounded-full ${estadoConsultorioStyle.dot}`}
                            />
                            {psicologo.estadoConsultorio || "Disponible"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-[#E0D2A1] bg-white px-3 py-3">
                        <div className="flex items-center gap-2">
                          <svg
                            className="h-5 w-5 text-[#F4C21B]"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                          </svg>

                          <p className="text-xs font-bold text-[#45687A]">
                            Horario asignado
                          </p>
                        </div>

                        <p className="mt-2 break-words text-sm font-black leading-5 text-[#173B4C]">
                          {obtenerHorario(psicologo)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {psicologos.length === 0 && (
            <div className="mt-8 rounded-2xl border border-[#E0D2A1] bg-white px-5 py-8 text-center shadow-[0_8px_22px_rgba(23,59,76,0.10)]">
              <p className="text-[15px] font-black text-[#173B4C]">
                No hay psicólogos registrados
              </p>

              <p className="mt-1 text-sm text-[#45687A]">
                Agrega registros desde la pantalla de Psicólogos.
              </p>
            </div>
          )}
        </section>

        <Footer />
      </section>
    </main>
  );
}