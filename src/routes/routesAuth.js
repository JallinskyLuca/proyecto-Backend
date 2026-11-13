import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const filePath = path.join(__dirname, '../data/usuarios.json');
const JWT_SECRET = 'secreto_super_seguro123';

const leerUsuarios = () => {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
};

const guardarUsuarios = (usuarios) => {
    fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2), 'utf-8');
};

// #1 POST (Registrar un usuario nuevo) -> Endpoint: /api/auth/register
router.post('/register', (req, res) => {
    const { email, password } = req.body;

    // Validamos que manden tanto el mail como el password
    if(!email || !password) {
        return res.status(400).json({
            status: 'Error',
            message: 'El email y la contraseña son OBLIGATORIOS'
        });
    }

    const usuarios = leerUsuarios();

    // Verificamos si el email ya está registrado 
    const usuarioExistente = usuarios.find(u => u.email === email);
    if(usuarioExistente) {
        return res.status(400).json({
            status: 'Error',
            message: 'El email ya se encuentra registrado'
        });
    }

    // Con la librería Bcrypt encriptamos la contraseña (password, 10) -> salt rounds estándar
    const passwordHashed = bcrypt.hashSync(password, 10);

    // Creamos el ID automático
    let nuevoId;
    if(usuarios.length > 0) {
        const ultimoUsuario = usuarios[usuarios.length - 1];
        nuevoId = ultimoUsuario.id + 1;
    } else {
        nuevoId = 1;
    }

    const nuevoUsuario = {
        id: nuevoId,
        email: email.trim(),
        password: passwordHashed // Guardamos el HASH, nunca la contraseña en texto plano
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);

    // Devolvemos respuesta con status 201 (Created) y ocultamos la contraseña por seguridad
    res.status(201).json({
        status: 'success',
        message: '¡Usuario registrado con éxito!',
        data: {
            id: nuevoUsuario.id,
            email: nuevoUsuario.email
        }
    });
});

// #2 POST (Iniciar sesión) -> Endpoint: /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validamos que ingresen ambos datos
    if(!email || !password) {
        return res.status(400).json({
            status: 'Error',
            message: 'El email y la contraseña son necesarios para el inicio de sesión'
        });
    }  

    const usuarios = leerUsuarios();

    // Buscamos si el usuario existe por medio de su email
    const usuarioEncontrado = usuarios.find(u => u.email === email);
    if(!usuarioEncontrado) {
        return res.status(401).json({
            status: 'Error',
            message: 'Credenciales inválidas (email o contraseña incorrectos)'
        });
    }

    // Comparamos la contraseña escrita con la encriptada usando bcrypt
    const passwordValida = bcrypt.compareSync(password, usuarioEncontrado.password);
    if(!passwordValida) {
        return res.status(401).json({
            status: 'error',
            message: 'Credenciales inválidas (email o contraseña incorrectos)'
        });
    }

    // Si los datos son correctos, generamos el token con JWT (sin incluir la contraseña en el payload)
    const payload = {
        id: usuarioEncontrado.id,
        email: usuarioEncontrado.email
    };

    // Firmamos el token con la secretKey y definimos expiración
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
        status: 'success',
        message: '¡Inicio de sesión exitoso!',
        token: token
    });
});

export default router;