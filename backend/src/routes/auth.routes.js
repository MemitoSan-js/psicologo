import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const router = express.Router();

const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario._id,
      correo: usuario.correo,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "8h",
    }
  );
};

// Crear usuario inicial.
// Úsalo una sola vez para crear tu usuario administrador.
router.post("/crear-admin", async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;

    if (!nombre || !correo || !password) {
      return res.status(400).json({
        message: "Nombre, correo y contraseña son obligatorios.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "La contraseña debe tener mínimo 6 caracteres.",
      });
    }

    const usuarioExistente = await Usuario.findOne({
      correo: correo.toLowerCase().trim(),
    });

    if (usuarioExistente) {
      return res.status(409).json({
        message: "Ya existe un usuario con ese correo.",
      });
    }

    const passwordEncriptado = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      nombre: nombre.trim(),
      correo: correo.toLowerCase().trim(),
      password: passwordEncriptado,
      rol: "admin",
    });

    res.status(201).json({
      message: "Usuario administrador creado correctamente.",
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear usuario administrador.",
      error: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        message: "Correo y contraseña son obligatorios.",
      });
    }

    const usuario = await Usuario.findOne({
      correo: correo.toLowerCase().trim(),
    });

    if (!usuario) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos.",
      });
    }

    if (!usuario.activo) {
      return res.status(403).json({
        message: "El usuario está inactivo.",
      });
    }

    const passwordCorrecto = await bcrypt.compare(password, usuario.password);

    if (!passwordCorrecto) {
      return res.status(401).json({
        message: "Correo o contraseña incorrectos.",
      });
    }

    const token = generarToken(usuario);

    res.json({
      message: "Inicio de sesión correcto.",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al iniciar sesión.",
      error: error.message,
    });
  }
});

// Verificar sesión
router.get("/perfil", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Token no enviado.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(decoded.id).select("-password");

    if (!usuario) {
      return res.status(401).json({
        message: "Usuario no encontrado.",
      });
    }

    res.json({
      usuario,
    });
  } catch {
    res.status(401).json({
      message: "Sesión inválida o expirada.",
    });
  }
});

export default router;