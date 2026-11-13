const express = require('express');
const productosRouter = require('./routes/routesProductos');

const app = express();
const PORT = 3000;

// Middlewares globales (Indispensables para que Express procese JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar el router de productos bajo el prefijo /api/productos
app.use('/api/productos', productosRouter);

// Ruta raíz de verificación
app.get('/', (req, res) => {
    res.json({ status: 'success', message: '¡API de productos funcionando correctamente!' });
});

// Middleware para rutas no encontradas (Error 404)
app.use((req, res) => {
    res.status(404).json({ status: 'error', message: 'Ruta no encontrada' });
});

// Levantar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});