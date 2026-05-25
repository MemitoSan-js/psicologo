import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logoCasaDomenica from "../img/casa_domenica.svg";
import { loginUsuario } from "../services/authApi";

const validarCorreo = (correo) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
};

export default function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState("");

  const validarFormulario = () => {
    const nuevosErrores = {};

    const correoLimpio = correo.trim().toLowerCase();

    if (!correoLimpio) {
      nuevosErrores.correo = "El correo es obligatorio.";
    } else if (!validarCorreo(correoLimpio)) {
      nuevosErrores.correo = "Escribe un correo válido.";
    }

    if (!password) {
      nuevosErrores.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      nuevosErrores.password = "La contraseña debe tener mínimo 6 caracteres.";
    }

    return nuevosErrores;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const nuevosErrores = validarFormulario();

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      setErrorGeneral("");
      return;
    }

    try {
      setLoading(true);
      setErrores({});
      setErrorGeneral("");

      const data = await loginUsuario({
        correo: correo.trim().toLowerCase(),
        password,
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      navigate("/inicio");
    } catch (error) {
      setErrorGeneral(error.message || "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-[#183B4A] px-5 py-6">
      <section className="relative w-full max-w-[390px] overflow-hidden rounded-3xl border border-[#D9D1B5] bg-[#F8F7F2] px-6 py-8 shadow-2xl">
        <div className="absolute left-0 top-0 h-3 w-full bg-[#F2C230]" />
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full border-[18px] border-[#F2C230]/70" />
        <div className="absolute -left-16 -bottom-20 h-44 w-44 rounded-full border-[20px] border-[#183B4A]/10" />

        <div className="relative z-10 mb-7 flex flex-col items-center pt-3">
          <div className="mb-3 flex items-center justify-center">
            <img
              src={logoCasaDomenica}
              alt="Casa Domenica"
              className="h-auto w-44 object-contain"
            />
          </div>

          <p className="mt-1 text-xs font-semibold uppercase tracking-[2px] text-[#C59A12]">
            Gestión de Consultorios
          </p>
        </div>

        <div className="relative z-10 mb-7 h-px w-full bg-[#D9D1B5]" />

        {errorGeneral && (
          <div className="relative z-10 mb-4 rounded-xl border border-[#C62828]/30 bg-[#FCE7E7] px-4 py-3 text-sm font-bold text-[#C62828]">
            {errorGeneral}
          </div>
        )}

        <form onSubmit={handleLogin} className="relative z-10 space-y-4" noValidate>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#183B4A]">
              Correo electrónico
            </label>

            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C59A12]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M4 4h16v16H4z" />
                <path d="m4 6 8 7 8-7" />
              </svg>

              <input
                type="email"
                value={correo}
                onChange={(e) => {
                  setCorreo(e.target.value);
                  setErrores((prev) => ({ ...prev, correo: "" }));
                }}
                placeholder="admin@casa.mx"
                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-[#183B4A] outline-none transition placeholder:text-gray-400 focus:border-[#F2C230] focus:ring-4 focus:ring-[#F2C230]/25 ${
                  errores.correo ? "border-[#C62828]" : "border-[#D8D0B8]"
                }`}
              />
            </div>

            {errores.correo && (
              <p className="mt-1 text-xs font-bold text-[#C62828]">
                {errores.correo}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#183B4A]">
              Contraseña
            </label>

            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#C59A12]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrores((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="••••••••"
                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-[#183B4A] outline-none transition placeholder:text-gray-400 focus:border-[#F2C230] focus:ring-4 focus:ring-[#F2C230]/25 ${
                  errores.password ? "border-[#C62828]" : "border-[#D8D0B8]"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#183B4A]/60 transition hover:text-[#C59A12]"
                aria-label="Mostrar u ocultar contraseña"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.94 17.94A10.9 10.9 0 0 1 12 20C7 20 2.7 16.9 1 12c.8-2.2 2.2-4.1 4-5.5" />
                    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 9.3 3.1 11 8a11.7 11.7 0 0 1-2.1 3.5" />
                    <path d="M14.1 14.1A3 3 0 0 1 9.9 9.9" />
                    <path d="M3 3l18 18" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            {errores.password && (
              <p className="mt-1 text-xs font-bold text-[#C62828]">
                {errores.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-[#183B4A] text-sm font-bold tracking-wide text-[#F8F7F2] shadow-lg shadow-[#183B4A]/25 transition hover:bg-[#102C38] active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? "Verificando..." : "Iniciar sesión"}
          </button>
        </form>

        <div className="relative z-10 my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#D9D1B5]" />
          <span className="h-2 w-2 rounded-full bg-[#F2C230]" />
          <div className="h-px flex-1 bg-[#D9D1B5]" />
        </div>

        <div className="relative z-10 mt-6 flex items-center justify-center gap-2 text-xs text-[#183B4A]/60">
          <svg
            className="h-4 w-4 text-[#C59A12]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
          Acceso seguro y cifrado
        </div>
      </section>
    </main>
  );
}