const usuariosModel = require('../models/usuariosModel');

async function registrar(nombre, email, password) {
    try {
        // Validación básica de los parámetros de entrada
        if (!nombre || !email || !password) {
            throw new Error('Todos los campos son obligatorios');
        }
        
        // Registro del usuario
        await usuariosModel.registrar(nombre, email, password);
    } catch (error) {
        console.error('Error al registrar usuario en el servicio:', error);
        throw error;
    }
}

async function obtenerPorNombre(nombre) {
    try {
        // Validación básica del parámetro de entrada
        if (!nombre) {
            throw new Error('El nombre es obligatorio');
        }

        // Obtener usuario por nombre
        const usuario = await usuariosModel.obtenerPorNombre(nombre);

        // Verificación de si el usuario fue encontrado
        if (!usuario) {
            throw new Error(`No se encontró ningún usuario con el nombre ${nombre}`);
        }

        return usuario;
    } catch (error) {
        console.error('Error al obtener usuario por nombre en el servicio:', error);
        throw error;
    }
}

module.exports = {
    registrar,
    obtenerPorNombre
};
