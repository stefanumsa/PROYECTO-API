const { obtenerConexion } = require('../database/conexion');

async function registrar(nombre, email, password) {
    const conexion = await obtenerConexion();
    try {
        // Validar los parámetros de entrada
        if (!nombre || !email || !password) {
            throw new Error('Todos los campos son obligatorios');
        }

        // Insertar el usuario en la base de datos
        await conexion.query('INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)', [nombre, email, password]);
        console.log('Usuario insertado correctamente');
    } catch (error) {
        console.error('Error al insertar usuario en el modelo:', error);
        throw error;
    } finally {
        // Liberar la conexión al finalizar
        conexion.release();
    }
}

async function obtenerPorNombre(nombre) {
    const conexion = await obtenerConexion();
    try {
        // Validar el parámetro de entrada
        if (!nombre) {
            throw new Error('El nombre es obligatorio');
        }

        // Obtener el usuario por nombre
        const [results] = await conexion.query('SELECT * FROM usuarios WHERE nombre = ?', [nombre]);
        return results[0];
    } catch (error) {
        console.error('Error al obtener usuario por nombre en el modelo:', error);
        throw error;
    } finally {
        // Liberar la conexión al finalizar
        conexion.release();
    }
}

module.exports = {
    registrar,
    obtenerPorNombre
};
