import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Inicio from "./pages/Inicio";
import Agenda from "./pages/Agenda";
import Psicologo from "./pages/Psicologo";
import Ajustes from "./pages/Ajustes";
import Pantalla from "./pages/Pantalla";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />

      <Route
        path="/inicio"
        element={
          <ProtectedRoute>
            <Inicio />
          </ProtectedRoute>
        }
      />

      <Route
        path="/agenda"
        element={
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        }
      />

      <Route
        path="/psicologo"
        element={
          <ProtectedRoute>
            <Psicologo />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ajustes"
        element={
          <ProtectedRoute>
            <Ajustes />
          </ProtectedRoute>
        }
      />

      <Route path="/pantalla" element={<Pantalla />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}