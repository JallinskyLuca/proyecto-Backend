import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import verificarToken from '../middlewares/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const filePath = path.join(__dirname, '../data/productos.json');

const leerProductos = () => {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
};

const guardarProductos = (productos) => {
    fs.writeFileSync(filePath, JSON.stringify(productos, null, 2), 'utf-8');
};

// 1. GET para obtener todos los productos
router.get('/', (req, res) => {
    const productos = leerProductos();
    res.status(200).json({ status: 'success', data: productos });
});

// 1.1. GET para obtener producto por id 
router.get('/:id', (req, res) => {
    const productos = leerProductos();
    const id = parseInt(req.params.id);

    if(isNaN(id)) {
        return res.status(400).json({
            status: 'error', 
            message: 'El ID debe ser un numero valido'
        });
    }

    const producto = productos.find(p => p.id === id);

    if(!producto) {
        return res.status(404).json({ 
            status: 'error',
            message: 'Producto no encontrado'
        });
    }

    res.status(200).json({
        status: 'success',
        data: producto
    });
});

// 2. POST para crear un nuevo producto (Protegido)
router.post('/', verificarToken, (req, res) => {
    const { nombre, categoria, precio } = req.body;

    if(!nombre || !categoria || !precio) {
        return res.status(400).json({
            status: 'error',
            message: 'Nombre, categoria y precio son obligatorios para crear un nuevo producto en la base de datos'
        });
    }

    const productos = leerProductos();
    let nuevoId;
    if (productos.length > 0) {
        const ultimoProducto = productos[productos.length - 1];
        nuevoId = ultimoProducto.id + 1;
    } else {
        nuevoId = 1;
    }

    const nuevoProducto = {
        id: nuevoId,
        nombre: nombre.trim(),
        categoria: categoria.trim(),
        precio: Number(precio)
    };

    productos.push(nuevoProducto);
    guardarProductos(productos);

    res.status(201).json({ status: 'success', data: nuevoProducto });
});

// 3. PUT para actualizar un producto (Protegido)
router.put('/:id', verificarToken, (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, categoria, precio } = req.body;

    if(isNaN(id)) {
        return res.status(400).json({
            status: 'error',
            message: 'El id debe ser un numero valido'
        });
    }

    if(!nombre || !categoria || !precio) {
        return res.status(400).json({
            status: 'error',
            message: 'Para usar el PUT, todos los campos son obligatorios (nombre, categoria, precio).'
        });
    }

    const productos = leerProductos();
    const index = productos.findIndex(p => p.id === id);

    if(index === -1) {
        return res.status(404).json({
            status: 'error', 
            message: 'Producto no encontrado'
        });
    }

    productos[index] = {
        id: id,
        nombre: nombre.trim(),
        categoria: categoria.trim(),
        precio: Number(precio)
    };

    // ¡Guardamos los cambios en el archivo JSON!
    guardarProductos(productos);

    res.status(200).json({
        status: 'success',
        data: productos[index]
    });
});

// 4. PATCH para actualizar parcialmente (Protegido)
router.patch('/:id', verificarToken, (req, res) => {
    const id = parseInt(req.params.id);
    const { nombre, categoria, precio } = req.body;

    if(isNaN(id)) {
        return res.status(400).json({
            status: 'error',
            message: 'El ID debe ser un numero valido'
        });
    }

    const productos = leerProductos();
    const index = productos.findIndex(p => p.id === id);
    
    if(index === -1) {
        return res.status(404).json({
            status: 'error',
            message: 'Producto no encontrado'
        });
    }

    const productoActual = productos[index];

    let nuevoNombre = productoActual.nombre;
    if (nombre) {
        nuevoNombre = nombre.trim();
    }

    let nuevaCategoria = productoActual.categoria;
    if (categoria) {
        nuevaCategoria = categoria.trim();
    }

    let nuevoPrecio = productoActual.precio;
    if (precio !== undefined) {
        nuevoPrecio = Number(precio);
    }

    productos[index] = {
        id: id,
        nombre: nuevoNombre,
        categoria: nuevaCategoria,
        precio: nuevoPrecio
    };

    guardarProductos(productos);

    res.status(200).json({
        status: 'success',
        data: productos[index]
    });
});

// 5. DELETE para eliminar un producto (Protegido)
router.delete('/:id', verificarToken, (req, res) => {
    const id = parseInt(req.params.id);

    if(isNaN(id)) {
        return res.status(400).json({
            status: 'error',
            message: 'El ID debe ser un numero valido'
        });
    }
    
    const productos = leerProductos();
    const index = productos.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({
            status: 'error',
            message: 'Producto no encontrado'
        });
    }

    const productoEliminado = productos.splice(index, 1);
    guardarProductos(productos);

    res.status(200).json({
        status: 'success',
        message: '¡El producto se ha eliminado con éxito!',
        data: productoEliminado[0]
    });
});

export default router;