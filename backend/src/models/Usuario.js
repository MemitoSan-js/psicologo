import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      maxlength: [60, "El nombre no puede superar 60 caracteres"],
    },

    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener mínimo 6 caracteres"],
    },

    rol: {
      type: String,
      enum: ["admin", "usuario"],
      default: "admin",
    },

    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;