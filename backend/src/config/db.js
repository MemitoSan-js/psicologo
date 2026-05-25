import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI no está definida en Render.");
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("MongoDB Atlas conectado correctamente");
    console.log(`Base de datos: ${conn.connection.name}`);
    console.log(`Host: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error al conectar MongoDB Atlas:");
    console.error(error.message);
    throw error;
  }
};