const { NOTIMP } = require('dns');
const { Router } = require('express')
const fs = require('fs') //fileSystem
const path = require('path');
const { measureMemory } = require('vm');

const router = Router();
const filePath = path.join(__dirname, '../data/productos.json')

const leerProductos = () => {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

const guardarProductos = (productos) => {
    fs.writeFileSync(filePath, JSON.stringify(productos, null, 2), 'utf-8');
}


// 1 GET para obtener todos los usuarios
router.get('/', (req, res) => {
    const productos = leerProductos();
    res.status(200).json({ status : 'succes', data : productos});
});


// 1.1 GET para obtener producto por id 
router.get('/:id', (req, res) => {
    const productos = leerProductos();
    const id = parseInt(req.params.id);

    if(isNaN(id)) {
        return res.status(400).json({
            status : 'error', 
            message : 'El ID debe ser un numero valido'
        });
    }

    const producto = productos.find(p => p.id === id);

    if(!producto) {
        return res.status(400).json({ 
            status : 'Error',
            message : 'Producto no encontrado'
        });
    }

    res.status(200).json({
        status : 'succes',
        data : producto
    })
})


// 2 POST para crear un nuevo producto

router.post('/', (req, res) => {
    const {nombre, categoria, precio} = req.body;

    if(!nombre || !categoria || !precio) {
        return res.status(400).json({
            status : 'Error',
            message : 'Nombre, categoria y precio son obligatorios para crear un nuevo productos en la base de datos'
        })
    }

    const productos = leerProductos();
    // Calculo del ID
    let nuevoId;
    if (productos.length > 0) {
        const ultimoProducto = productos[productos.length - 1];
        nuevoId = ultimoProducto.id + 1;
    } else {
        nuevoId = 1;
    }

    const nuevoProducto = {
        id : nuevoId,
        nombre : nombre.trim(),
        categoria : categoria.trim(),
        precio : Number(precio)
    }

    productos.push(nuevoProducto);
    guardarProductos(productos);

    res.status(201).json({ status : 'succes', data : nuevoProducto})
});

// 3 PUT para actualizar un producto.

router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id)
    const {nombre, categoria, precio} = req.body;

    if(isNaN(id)) {
        return res.status(400).json({
            status : 'error',
            message : 'El id debe ser un numero valido'
        });
    }

    if(!nombre || !categoria || !precio) {
        return res.status(400).json({
            status : 'Error',
            mesage : 'Para usar el PUT, todos los campos son obligatorios (nombre, categoria, precio). '
        });
    }

    const productos = leerProductos();
    const index = productos.findIndex(p => p.id === id);

    if(index === -1) {
        return res.status(404).json({
            status : 'error', 
            message : 'Producto no encontrado'
        });
    }

    productos[index] = {
        id: id,
        nombre: nombre.trim(),
        categoria: categoria.trim(),
        precio: Number(precio)
    };

    res.status(200).json({
        status: 'success',
        data: productos[index]
    });
});


// 4 PATCH
router.patch('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const {nombre, categoria, precio} = req.body;

    if(isNaN(id)) {
        return res.status(400).json({
            status: 'error',
            mesage: 'El ID debe ser un numero valido'
        });
    }

    const productos = leerProductos();

    const index = productos.findIndex(p => p.id === id);
    
    //Si index es -1, significa que el .findIndex() no encontró ningún producto con ese ID
    if(index === -1) {
        return res.status(404).json({
            status: 'Error',
            message: 'Producto no encontrado'
        });
    }

    //Si el campo viene en el body lo actualizamos, sino dejamos el que ya tenia

    // 1. Guardamos en una variable el producto tal como está ahora
    const productoActual = productos[index];

    // 2. Evaluamos el nombre con un if tradicional
    let nuevoNombre = productoActual.nombre; // Por defecto dejamos el viejo
    if (nombre) {
        nuevoNombre = nombre.trim(); // Si mandaron uno nuevo, lo usamos
    }

    // 3. Evaluamos la categoría con un if tradicional
    let nuevaCategoria = productoActual.categoria; // Por defecto dejamos la vieja
    if (categoria) {
        nuevaCategoria = categoria.trim(); // Si mandaron una nueva, la usamos
    }

    // 4. Evaluamos el precio con un if tradicional
    let nuevoPrecio = productoActual.precio; // Por defecto dejamos el viejo
    if (precio !== undefined) {
        nuevoPrecio = Number(precio); // Si mandaron uno nuevo, lo usamos y convertimos a número
    }

    // 5. Actualizamos el producto con los valores ya decididos
    productos[index] = {
        id: id,
        nombre: nuevoNombre,
        categoria: nuevaCategoria,
        precio: nuevoPrecio
    };

    guardarProductos(productos);

    res.status(200).json({
        status: 'error',
        data: productos[index]
    });
});
// 5 DELETE
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if(isNaN(id)) {
        return res.status(400).json({
            status: 'Error',
            message: 'El ID debe ser un numero valido'
        });
    }
    
    const productos = leerProductos();
    const index = productos.findIndex(p => p.id === id);

    if (index === - 1) {
        return res.status(404).json({
            status: 'Error',
            message: 'producto no encontrado'
        });
    }

    const productoEliminado = productos.splice(index, 1);
    guardarProductos(productos)

    //status, message, data
    res.status(200).json({
        staus: 'Sucess',
        message: 'El producto se a eliminado con exito!',
        data: productoEliminado[0]
    });
});


module.exports = router;