import rateLimit from 'express-rate-limit';
import { logEvents } from './logger.js';

const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 5, // Limita a 5 solicitudes de inicio de sesión por IP por ventana
  message: {
    message: "Demasiados intentos de inicio de sesión desde esta IP, inténtelo nuevamente después de una pausa de 60 segundos",
  },
  handler: (req, res, next, options) => {
    logEvents(
      `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      'errLog.log'
    );
    res.status(429).json(options.message); // Cambiado para enviar una respuesta JSON con código 429
  },
  standardHeaders: true, // Devuelve información de límite de tasa en los encabezados `RateLimit-*`
  legacyHeaders: false, // Desactiva los encabezados `X-RateLimit-*`
});

export default loginLimiter;
