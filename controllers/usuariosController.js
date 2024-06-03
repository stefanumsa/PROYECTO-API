const usuariosService = require('../services/usuariosService');
const autenticador = require('../middlewares/autenticador');

async function registrarUsuario(req, res) {
    const { dataSegura } = req.body;
    try {
        // Verificar y decodificar los datos seguros
        const datos = autenticador.verificarDatos(dataSegura);

        // Registrar el usuario utilizando el servicio
        await usuariosService.registrar(datos.nombre, datos.email, datos.password);
        res.status(201).send('Usuario registrado correctamente');
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
}

async function loginUsuario(req, res) {
    const { dataSegura } = req.body;
    try {
        // Verificar y decodificar los datos seguros
        const datos = autenticador.verificarDatos(dataSegura);
        
        // Obtener el usuario por nombre
        const usuario = await _obtenerUsuarioPorNombre(datos.nombre);

        // Verificar si el usuario existe
        if (!usuario) {
            return res.status(404).send('Usuario o contraseña incorrectos');
        }

        // Comparar la contraseña proporcionada con la almacenada
        const validPassword = await autenticador.comparePassword(datos.password, usuario.password_hash);

        // Verificar si la contraseña es válida
        if (!validPassword) {
            return res.status(404).send('Usuario o contraseña incorrectos');
        } else {
            res.status(200).json(usuario);
        }
    } catch (error) {
        console.error('Error al logear usuario:', error);
        res.status(500).send('Error interno del servidor');
    }
}

async function _obtenerUsuarioPorNombre(nombre) {
    try {
        // Obtener el usuario utilizando el servicio
        const usuario = await usuariosService.obtenerPorNombre(nombre);
        return usuario;
    } catch (error) {
        console.error('Error al obtener usuario por nombre:', error);
        throw error; // Lanzar el error para que sea capturado en el controlador principal
    }
}

module.exports = {
    registrarUsuario,
    loginUsuario
};
