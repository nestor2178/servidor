import jwt from 'jsonwebtoken';

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  console.log('Auth Header:', authHeader);

  if (!authHeader?.startsWith('Bearer ')) {
    console.log('Token no proporcionado o incorrecto');
    return res.status(401).json({ message: 'No autorizado' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log('Error al verificar token:', err);
      return res.status(403).json({ message: 'Prohibido' });
    }
    console.log("Decoded JWT payload:", decoded);
    req.user = decoded.UserInfo.username;
    req.roles = decoded.UserInfo.roles;
    console.log('Token verificado correctamente:', decoded);
    next();
  });
};

export default verifyJWT;
