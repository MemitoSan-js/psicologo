import mongoose from "mongoose";

const ESTADOS_PSICOLOGO = [
  "Disponible",
  "En atención",
  "Fuera de turno",
  "No disponible",
];

const ESTADOS_CONSULTORIO = [
  "Disponible",
  "Ocupado",
  "Reservado",
  "Fuera de servicio",
];

const psicologoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del psicólogo es obligatorio"],
      trim: true,
      minlength: [5, "El nombre debe tener mínimo 5 caracteres"],
      maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
    },

    consultorio: {
      type: String,
      required: [true, "El consultorio es obligatorio"],
      trim: true,
      maxlength: [15, "El consultorio no puede tener más de 15 caracteres"],
    },

    // Fecha en la que debe aparecer en la pantalla de pacientes.
    // Formato esperado: YYYY-MM-DD.
    fecha: {
      type: String,
      default: "",
      trim: true,
      match: [
        /^$|^\d{4}-\d{2}-\d{2}$/,
        "La fecha debe tener el formato YYYY-MM-DD",
      ],
      index: true,
    },

    // Permite ocultarlo sin eliminar el registro de MongoDB.
    mostrarEnPantalla: {
      type: Boolean,
      default: true,
      index: true,
    },

    horaInicio: {
      type: String,
      default: "",
      trim: true,
    },

    horaFin: {
      type: String,
      default: "",
      trim: true,
    },

    horario: {
      type: String,
      default: "Sin horario asignado",
      trim: true,
    },

    estado: {
      type: String,
      enum: ESTADOS_PSICOLOGO,
      default: "Disponible",
    },

    estadoConsultorio: {
      type: String,
      enum: ESTADOS_CONSULTORIO,
      default: "Disponible",
    },

    especialidad: {
      type: String,
      trim: true,
      maxlength: [200, "La especialidad no puede tener más de 200 caracteres"],
      default: "",
    },

    colorEtiqueta: {
      type: String,
      default: "#F2C230",
      trim: true,
    },

    imagen: {
      type: String,
      default: "",
    },

    imagenNombre: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

psicologoSchema.index({ fecha: 1, mostrarEnPantalla: 1 });

const Psicologo = mongoose.model("Psicologo", psicologoSchema);

export default Psicologo;
