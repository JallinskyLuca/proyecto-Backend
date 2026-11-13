librerias:
express
bcryptjs
jsonwebtoken

//modularizar (que el server sea solo server)
//agregar Funciones features
//constole de IP para peticiones (bots) input(invisible)
//se puede borrar usuario(solo el id)
//cambiar contraseña
//recurpera contraseña 
//Crear una base de datos

### CRUD TIENDA DE PRODUCTOS ELECTRONICOS ###

# 1) configurar el entorno de desarrollo y crear carpetas del proyecto.

CRUD-TIENDA
|-> (node_modules)
|-> (src)
|     |-> (data)
|           |-> productos.json
|     |-> (routes)
|           |-> routesProductos.js
|     |
|     |-> app.js
|
|-> .gitignore
|-> package.json
|-> packege-lock.json
|-> README.md

# 2) agregamos productos a nuestro productos.json
creamos un array [] y dentro de ese array vamos a tener productos que los creamos mediante objetos {}
nuestro producto.json va a tener ID, nombre, categoria y precio

# 3) creamos las funciones leerProductos y guardarProductos

# 4) GET para todos los productos y GET para cada ID
usamos router.get('/') para que nos devuelva todos los usuarioos 
usamos router.get('/:id') para que nos devuelva el ID
|-> manejo de errores 
            |-> si no se encuentra el ID
            |-> si no se encuentra el productos
            |-> y finalmente si se encuentra

