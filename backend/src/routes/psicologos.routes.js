import express from "express";
import mongoose from "mongoose";
import Psicologo from "../models/Psicologo.js";

const router = express.Router();

const limpiarDatosEntrada = (datos = {}) => {
  const { id, _id, __v, createdAt, updatedAt, ...datosLimpios } = datos;
  return datosLimpios;
};

const normalizarEstadosDependientes = (datos = {}) => {
  const siguiente = { ...datos };

  if (siguiente.estado === "Disponible") {
    siguiente.estadoConsultorio = "Disponible";
  }

  if (siguiente.estado === "En atención") {
    siguiente.estadoConsultorio = "Ocupado";
  }

  if (
    (siguiente.estado === "Fuera de turno" ||
      siguiente.estado === "No disponible") &&
    siguiente.estadoConsultorio === "Ocupado"
  ) {
    siguiente.estadoConsultorio = "Disponible";
  }

  if (siguiente.estadoConsultorio === "Ocupado") {
    siguiente.estado = "En atención";
  }

  return siguiente;
};

const idEsValido = (id) => mongoose.Types.ObjectId.isValid(id);

const fechaEsValida = (fecha) =>
  typeof fecha === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fecha);

/*
 * Devuelve únicamente los psicólogos programados para una fecha.
 * Ejemplo:
 * GET /api/psicologos/pantalla/hoy?fecha=2026-06-13
 */
router.get("/pantalla/hoy", async (req, res) => {
  try {
    const { fecha } = req.query;

    if (!fechaEsValida(fecha)) {
      return res.status(400).json({
        message: "Debes enviar una fecha válida con formato YYYY-MM-DD",
      });
    }

    const psicologos = await Psicologo.find({
      fecha,
      mostrarEnPantalla: true,
      estado: { $nin: ["No disponible", "Fuera de turno"] },
      estadoConsultorio: { $ne: "Fuera de servicio" },
    }).sort({ horaInicio: 1, nombre: 1 });

    return res.json(psicologos);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener los psicólogos programados",
      error: error.message,
    });
  }
});

router.get("/", async (_req, res) => {
  try {
    const psicologos = await Psicologo.find().sort({ createdAt: -1 });
    return res.json(psicologos);
  } catch (error) {
    return res.status(500).json({
      message: "Error al obtener psicólogos",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const datos = normalizarEstadosDependientes(
      limpiarDatosEntrada(req.body)
    );

    const nuevoPsicologo = new Psicologo(datos);
    const psicologoGuardado = await nuevoPsicologo.save();

    return res.status(201).json(psicologoGuardado);
  } catch (error) {
    return res.status(400).json({
      message: "Error al crear psicólogo",
      error: error.message,
    });
  }
});

/*
 * Permite mostrar u ocultar un psicólogo sin eliminarlo.
 * Body para mostrar hoy:
 * {
 *   "fecha": "2026-06-13",
 *   "mostrarEnPantalla": true
 * }
 *
 * Body para ocultar:
 * {
 *   "mostrarEnPantalla": false
 * }
 */
router.patch("/:id/pantalla", async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, mostrarEnPantalla } = req.body;

    if (!idEsValido(id)) {
      return res.status(400).json({
        message: "ID de psicólogo no válido",
      });
    }

    if (typeof mostrarEnPantalla !== "boolean") {
      return res.status(400).json({
        message: "mostrarEnPantalla debe ser verdadero o falso",
      });
    }

    if (mostrarEnPantalla && !fechaEsValida(fecha)) {
      return res.status(400).json({
        message:
          "Para mostrar al psicólogo debes enviar una fecha con formato YYYY-MM-DD",
      });
    }

    const cambios = {
      mostrarEnPantalla,
      ...(fecha !== undefined ? { fecha } : {}),
    };

    const psicologoActualizado = await Psicologo.findByIdAndUpdate(
      id,
      cambios,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!psicologoActualizado) {
      return res.status(404).json({
        message: "Psicólogo no encontrado",
      });
    }

    return res.json(psicologoActualizado);
  } catch (error) {
    return res.status(400).json({
      message: "Error al actualizar la visibilidad del psicólogo",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!idEsValido(id)) {
      return res.status(400).json({
        message: "ID de psicólogo no válido",
      });
    }

    const datos = normalizarEstadosDependientes(
      limpiarDatosEntrada(req.body)
    );

    const psicologoActualizado = await Psicologo.findByIdAndUpdate(
      id,
      datos,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!psicologoActualizado) {
      return res.status(404).json({
        message: "Psicólogo no encontrado",
      });
    }

    return res.json(psicologoActualizado);
  } catch (error) {
    return res.status(400).json({
      message: "Error al actualizar psicólogo",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!idEsValido(id)) {
      return res.status(400).json({
        message: "ID de psicólogo no válido",
      });
    }

    const psicologoEliminado = await Psicologo.findByIdAndDelete(id);

    if (!psicologoEliminado) {
      return res.status(404).json({
        message: "Psicólogo no encontrado",
      });
    }

    return res.json({
      message: "Psicólogo eliminado correctamente",
      id,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error al eliminar psicólogo",
      error: error.message,
    });
  }
});

export default router;
