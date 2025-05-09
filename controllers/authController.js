import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

// @desc Inicio de sesión
// @ruta POST /auth
// @acceso Público
const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validación de campos vacíos
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Todos los campos son obligatorios' });
  }

  // Validación de formato de usuario y contraseña
  const usernameRegex = /^[a-zA-Z0-9_]+$/; // Permite solo letras, números y guiones bajos
  const passwordRegex = /^.{4,}$/; // Contraseña de al menos 6 caracteres

  if (!usernameRegex.test(username)) {
    return res
      .status(400)
      .json({ message: 'El usuario contiene caracteres no válidos' });
  }

  if (!passwordRegex.test(password)) {
    return res
      .status(400)
      .json({ message: 'La contraseña debe tener al menos 4 caracteres' });
  }

  // Buscar usuario en la base de datos
  const foundUser = await User.findOne({ username }).exec();

  if (!foundUser || !foundUser.active) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  // Comparar contraseñas
  const match = await bcrypt.compare(password, foundUser.password);

  if (!match) return res.status(401).json({ message: 'No autorizado' });

  // Crear token de acceso
  const accessToken = jwt.sign(
    {
      UserInfo: {
        username: foundUser.username,
        roles: foundUser.roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  // Crear token de actualización
  const refreshToken = jwt.sign(
    { username: foundUser.username },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  );

  // Crear cookie segura con el token de actualización
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('jwt', refreshToken, {
    httpOnly: true, // accesible solo por el servidor web
    secure: isProduction, // HTTPS
    sameSite: isProduction ? 'None' : 'Lax', // cookie de sitio cruzado
    maxAge: 7 * 24 * 60 * 60 * 1000, // duración de la cookie: 7 días
  });

  // Enviar token de acceso que contiene el nombre de usuario y los roles
  res.json({ accessToken });
});

// @desc Refrescar token
// @ruta GET /auth/refresh
// @acceso Público - porque el token de acceso ha expirado
const refresh = (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    console.log("No se encontró el token de actualización en las cookies");
    return res.status(401).json({ message: 'No autorizado' });
  }

  const refreshToken = cookies.jwt;

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    asyncHandler(async (err, decoded) => {
      if (err) {
        console.log("Error al verificar el token de actualización:", err);
        return res.status(403).json({ message: 'Prohibido' });
      }

      const foundUser = await User.findOne({
        username: decoded.username,
      }).exec();

      if (!foundUser) {
        console.log("No se encontró un usuario para el token de actualización");
        return res.status(401).json({ message: 'No autorizado' });
      }

      const accessToken = jwt.sign(
        {
          UserInfo: {
            username: foundUser.username,
            roles: foundUser.roles,
          },
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
      );

      console.log("Nuevo token de acceso generado:", accessToken);
      res.json({ accessToken });
    })
  );
};

// @desc Cerrar sesión
// @ruta POST /auth/logout
// @acceso Público - solo para borrar la cookie si existe
const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // Sin contenido
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.json({ message: 'Cookie eliminada' });
};

export { login, refresh, logout };
