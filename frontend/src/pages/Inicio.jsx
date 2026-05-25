import { useEffect, useMemo, useState } from "react";
import Footer from "../components/Footer";
import { obtenerPsicologos } from "../services/psicologosApi";

const normalizarTexto = (texto) =>
  String(texto || "").trim().toLowerCase();

const formatearHora12 = (hora) => {
  if (!hora) return "Sin horario";

  const [hh, mm] = hora.split(":");
  const horas = Number(hh);
  const minutos = mm || "00";

  if (Number.isNaN(horas)) return hora;

  const periodo = horas >= 12 ? "PM" : "AM";
  const hora12 = horas % 12 || 12;

  return `${String(hora12).padStart(2, "0")}:${minutos} ${periodo}`;
};

export default function Inicio() {
  const [psicologos, setPsicologos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarPsicologos = async () => {
    try {
      setError("");
      setCargando(true);

      const data = await obtenerPsicologos();
      setPsicologos(Array.isArray(data) ? data : []);
    } catch (error) {
      setError(error.message || "No se pudo conectar con el backend.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarPsicologos();

    const intervalo = setInterval(() => {
      cargarPsicologos();
    }, 5000);

    return () => clearInterval(intervalo);
  }, []);

  const psicologosActivos = useMemo(() => {
    return psicologos.filter((psicologo) => {
      const estado = normalizarTexto(psicologo.estado);

      return estado === "disponible" || estado === "en atención";
    }).length;
  }, [psicologos]);

  const consultoriosOcupados = useMemo(() => {
    return psicologos.filter((psicologo) => {
      const estado = normalizarTexto(psicologo.estadoConsultorio);

      return estado === "ocupado";
    }).length;
  }, [psicologos]);

  const psicologosDisponibles = useMemo(() => {
    return psicologos.filter((psicologo) => {
      const estado = normalizarTexto(psicologo.estado);

      return estado === "disponible";
    }).length;
  }, [psicologos]);

  const proximoPsicologo = useMemo(() => {
    const disponibles = psicologos
      .filter((psicologo) => normalizarTexto(psicologo.estado) === "disponible")
      .sort((a, b) => String(a.horaInicio || "").localeCompare(String(b.horaInicio || "")));

    return disponibles[0] || psicologos[0] || null;
  }, [psicologos]);

  const abrirPaginaNueva = () => {
    window.open("/pantalla", "_blank", "noopener,noreferrer");
  };

  const resumen = [
    {
      titulo: "Psicólogos registrados",
      valor: psicologos.length,
      icono: "users",
    },
    {
      titulo: "Psicólogos activos",
      valor: psicologosActivos,
      icono: "active",
    },
    {
      titulo: "Disponibles",
      valor: psicologosDisponibles,
      icono: "check",
    },
    {
      titulo: "Consultorios ocupados",
      valor: consultoriosOcupados,
      icono: "room",
    },
  ];

  return (
    <main className="min-h-dvh bg-[#183B4A] text-[#183B4A]">
      <section className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#F8F7F2]">
        <div className="absolute left-0 top-0 h-3 w-full bg-[#F2C230]" />
        <div className="absolute -right-16 top-8 h-36 w-36 rounded-full border-[18px] border-[#F2C230]/50" />
        <div className="absolute -left-20 top-[250px] h-44 w-44 rounded-full border-[20px] border-[#183B4A]/10" />

        <header className="relative z-10 px-6 pb-4 pt-12">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2.5px] text-[#C59A12]">
                Casa Domenica
              </p>

              <h1 className="mt-2 text-[28px] font-extrabold leading-tight text-[#183B4A]">
                Bienvenida
              </h1>
            </div>
          </div>
        </header>

        <section className="relative z-10 flex-1 overflow-y-auto px-6 pb-28">
          {error && (
            <div className="mt-4 rounded-2xl border border-[#C62828]/30 bg-[#FCE7E7] p-4 text-sm font-bold text-[#C62828]">
              {error}
            </div>
          )}

          <div className="mt-4 overflow-hidden rounded-[26px] border border-[#F2C230]/30 bg-[#183B4A] p-5 text-[#F8F7F2] shadow-[0_14px_30px_rgba(24,59,74,0.28)]">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">

                {cargando ? (
                  <>
                    <h2 className="mt-4 text-[28px] font-extrabold leading-none">
                      Cargando...
                    </h2>

                    <p className="mt-4 text-sm text-[#E8E2C8]">
                      Consultando MongoDB Atlas.
                    </p>
                  </>
                ) : proximoPsicologo ? (
                  <>
                    <h2 className="mt-4 text-[36px] font-extrabold leading-none">
                      {formatearHora12(proximoPsicologo.horaInicio)}
                    </h2>

                    <p className="mt-4 break-words text-sm text-[#E8E2C8]">
                      {proximoPsicologo.nombre}
                    </p>

                    <p className="mt-1 text-sm text-[#E8E2C8]">
                      Consultorio {proximoPsicologo.consultorio || "sin asignar"}
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#F2C230]">
                      Estado: {proximoPsicologo.estado || "No disponible"}
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-4 text-[28px] font-extrabold leading-none">
                      Sin registros
                    </h2>

                    <p className="mt-4 text-sm text-[#E8E2C8]">
                      Agrega psicólogos desde la sección Psicólogos.
                    </p>
                  </>
                )}
              </div>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                <svg
                  className="h-8 w-8 text-[#F2C230]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirPaginaNueva}
            className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-[#F2C230]/40 bg-[#F2C230] px-4 text-[15px] font-extrabold text-[#183B4A] shadow-[0_10px_25px_rgba(242,194,48,0.35)] transition hover:bg-[#C59A12] active:scale-[0.98]"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.3"
              viewBox="0 0 24 24"
            >
              <path d="M14 3h7v7" />
              <path d="M10 14 21 3" />
              <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
            </svg>

            Abrir pantalla de pacientes
          </button>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-extrabold text-[#183B4A]">
                Resumen actual
              </h2>

              <button
                type="button"
                onClick={cargarPsicologos}
                className="rounded-full bg-[#F2C230] px-3 py-1 text-xs font-bold text-[#183B4A] shadow-sm"
              >
                Actualizar
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              {resumen.map((item, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-[#D9D1B5] bg-white p-4 shadow-[0_8px_22px_rgba(24,59,74,0.08)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#183B4A] text-[#F2C230] shadow-md shadow-[#183B4A]/15">
                      {item.icono === "users" && (
                        <svg
                          className="h-7 w-7"
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
                      )}

                      {item.icono === "active" && (
                        <svg
                          className="h-7 w-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="m5 13 4 4L19 7" />
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      )}

                      {item.icono === "check" && (
                        <svg
                          className="h-7 w-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path d="M20 6 9 17l-5-5" />
                        </svg>
                      )}

                      {item.icono === "room" && (
                        <svg
                          className="h-7 w-7"
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
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#183B4A]/65">
                        {item.titulo}
                      </p>

                      <p className="mt-1 text-[31px] font-extrabold leading-none text-[#183B4A]">
                        {item.valor}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </section>
    </main>
  );
}