import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Falta definir MONGO_URI en el archivo .env del backend.");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`MongoDB Atlas conectado correctamente: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("Error al conectar MongoDB Atlas:", error.message);
    throw error;
  }
};
