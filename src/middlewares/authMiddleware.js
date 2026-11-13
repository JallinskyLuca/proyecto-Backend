import jwt from 'jsonwebtoken';

// Clave secreta (debe ser idéntica a la que uses en routesAuth.js)
const JWT_SECRET = 'secreto_super_seguro123';

const verificarToken = (req, res, next) => {
    // 1. Buscamos el token en los headers de la petición (en la cabecera 'Authorization')
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'Acceso denegado. No se proporcionó un token de autenticación' 
        });
    }

    // El header suele venir con el formato "Bearer [token]". Usamos split para extraer solo la cadena del token.
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'Formato de token inválido' 
        });
    }

    try {
        // 2. Verificamos el token usando nuestra clave secreta
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Adjuntamos los datos del usuario decodificados al objeto req
        req.usuario = decoded;

        // 3. ¡Todo bien! Dejamos que la petición continúe hacia la ruta final
        next();
    } catch (error) {
        return res.status(403).json({ 
            status: 'error', 
            message: 'Token inválido o expirado' 
        });
    }
};

// Exportamos la función del middleware correctamente
export default verificarToken;