import dotenv from 'dotenv';
import 'express-async-errors';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger, logEvents } from './middleware/logger.js';
import errorHandler from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import corsOptions from './config/corsOptions.js';
import connectDB from './config/dbConn.js';
import mongoose from 'mongoose';

dotenv.config();
mongoose.set("strictQuery", false);

const app = express();

const PORT = process.env.PORT || 10000;

console.log(process.env.NODE_ENV);

// Conexión a la base de datos
connectDB();

// Middleware y configuraciones
app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Sirve archivos estáticos desde 'dist'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/", express.static(path.join(__dirname, "public")));

// Rutas principales de la aplicación
import rootRoutes from './routes/root.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import noteRoutes from './routes/noteRoutes.js';

app.use("/", rootRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/notes", noteRoutes);

// Sirve index.html para manejar rutas desconocidas
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'views', 'index.html'));
});

// Manejador de errores
app.use(errorHandler);

// Inicio del servidor cuando la conexión a la base de datos es exitosa
mongoose.connection.once("open", () => {
  console.log("Conectado a MongoDB en desarrollo");
  app.listen(PORT, () => console.log(`Servidor en ejecución en el puerto ${PORT}`));
});

// Registro de errores en la conexión a MongoDB
mongoose.connection.on("error", (err) => {
  console.log(err);
  logEvents(
    `${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`,
    "mongoErrLog.log"
  );
});
