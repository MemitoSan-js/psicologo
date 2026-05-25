import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import logoCasaDomenica from "../img/casa_domenica.svg";
import { cerrarSesion } from "../services/authApi";

export default function Ajustes() {
  const navigate = useNavigate();

  const salir = () => {
    cerrarSesion();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-dvh bg-[#183B4A] text-[#183B4A]">
      <section className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-[#F8F7F2]">
        <div className="absolute left-0 top-0 h-3 w-full bg-[#F2C230]" />
        <div className="absolute -right-16 top-8 h-36 w-36 rounded-full border-[18px] border-[#F2C230]/50" />
        <div className="absolute -left-20 top-[300px] h-44 w-44 rounded-full border-[20px] border-[#183B4A]/10" />

        <header className="relative z-10 px-6 pt-12 pb-4">
          <div className="flex items-start gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[2.5px] text-[#C59A12]">
                Casa Domenica
              </p>

              <h1 className="mt-2 text-[28px] font-extrabold leading-tight text-[#183B4A]">
                Ajustes
              </h1>

              <p className="mt-1 text-[15px] leading-5 text-[#183B4A]/60">
                Información básica del sistema.
              </p>
            </div>
          </div>
        </header>

        <section className="relative z-10 flex-1 overflow-y-auto px-6 pb-28">
          <div className="mt-4 overflow-hidden rounded-[26px] border border-[#F2C230]/30 bg-[#183B4A] p-6 text-[#F8F7F2] shadow-[0_14px_30px_rgba(24,59,74,0.28)]">
            <div className="flex flex-col items-center justify-center">
              <div className="flex w-full items-center justify-center rounded-[22px] border border-[#D9D1B5] bg-[#F8F7F2] px-6 py-7 shadow-inner">
                <img
                  src={logoCasaDomenica}
                  alt="Casa Domenica"
                  className="h-auto w-52 object-contain"
                />
              </div>

              <div className="mt-5 w-full">
                <h2 className="mt-4 text-[22px] font-extrabold leading-tight">
                  Gestión de Consultorios
                </h2>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={salir}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#F2C230] text-[16px] font-extrabold text-[#183B4A] shadow-[0_10px_25px_rgba(242,194,48,0.35)] transition hover:bg-[#C59A12] active:scale-[0.98]"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.3"
                viewBox="0 0 24 24"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </section>

        <Footer />
      </section>
    </main>
  );
}
