import { NavLink } from "react-router-dom";

export default function Footer() {
  const baseClass =
    "flex flex-col items-center justify-center gap-1 transition-colors duration-200";

  const activeClass = "text-[#344663]";
  const inactiveClass = "text-[#6F7685]";

  return (
    <nav className="fixed bottom-0 left-1/2 z-30 grid h-[74px] w-full max-w-[430px] -translate-x-1/2 grid-cols-4 border-t border-[#E3E4E7] bg-white px-2">
      <NavLink
        to="/inicio"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        <svg className="h-7 w-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 11 12 3l9 8v10h-6v-6H9v6H3z" />
        </svg>
        <span className="text-[11px] font-semibold">Inicio</span>
      </NavLink>

      <NavLink
        to="/agenda"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        <svg
          className="h-7 w-7"
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
        <span className="text-[11px] font-medium">Agenda</span>
      </NavLink>

      <NavLink
        to="/psicologo"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
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
        <span className="text-[11px] font-medium">Psicólogos</span>
      </NavLink>

      <NavLink
        to="/ajustes"
        className={({ isActive }) =>
          `${baseClass} ${isActive ? activeClass : inactiveClass}`
        }
      >
        <svg
          className="h-7 w-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1A2 2 0 1 1 7.1 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
        </svg>
        <span className="text-[11px] font-medium">Ajustes</span>
      </NavLink>
    </nav>
  );
}