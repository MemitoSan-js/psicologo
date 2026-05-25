import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import psicologosRoutes from "./routes/psicologos.routes.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

const origenesPermitidos = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origenesPermitidos.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origen no permitido por CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

app.get("/", (_req, res) => {
  res.send("API del sistema de psicólogos funcionando correctamente");
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "psicologos-api" });
});

app.use("/api/psicologos", psicologosRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor backend corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

startServer();