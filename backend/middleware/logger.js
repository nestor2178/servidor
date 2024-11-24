import { fileURLToPath } from 'url';  // Para obtener la ruta de archivo
import path from 'path';  // Para manipular las rutas de archivos
import fs from 'fs';  // Para trabajar con el sistema de archivos
import { promises as fsPromises } from 'fs';  // Para usar las funciones de promesas de fs
import { format } from 'date-fns';  // Para formatear fechas
import { v4 as uuid } from 'uuid';  // Para generar UUIDs

// Obtener el directorio actual usando import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);  // Directorio donde se encuentra el archivo

const logEvents = async (message, logFileName) => {
  const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    const logDirectory = path.join(__dirname, '..', 'logs');
    // Verificar si el directorio de logs no existe y crearlo
    if (!fs.existsSync(logDirectory)) {
      await fsPromises.mkdir(logDirectory);
    }
    // Escribir el log en el archivo
    await fsPromises.appendFile(path.join(logDirectory, logFileName), logItem);
  } catch (err) {
    console.log(err);
  }
};

const logger = (req, res, next) => {
  // Registrar la solicitud HTTP en el archivo de log
  logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqlog.log');
  console.log(`${req.method} ${req.path}`);
  next();
};

export { logEvents, logger };
