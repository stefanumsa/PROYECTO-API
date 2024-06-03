const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

function verificarToken(req, res, next) {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ mensaje: 'Token no proporcionado' });
        }

        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.RSA_PRIVATE_KEY, { algorithm: 'RS256' }, (err, usuario) => {
            if (err) {
                return res.status(403).json({ mensaje: 'Token inválido' });
            }
            req.usuario = usuario;
            next();
        });
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return res.status(403).json({ mensaje: 'Token inválido' });
    }
}

function verificarDatos(dataSegura) {
    try {
        const partes = dataSegura.split(',');
        const resultado = {};

        partes.forEach((parte, index) => {
            resultado[index === 0 ? 'nombre' : index === 1 && partes.length > 2 ? 'email' : 'password'] = decryptData(parte);
        });

        return resultado;
    } catch (error) {
        console.error('Error al verificar los datos:', error);
        throw new Error('Datos inválidos');
    }
}

// Función para descifrar datos encriptados
function decryptData(encryptedText) {
    try {
        // Obtener la clave privada AES del entorno y convertirla en un buffer
        const key = Buffer.from(process.env.AES_PRIVATE_KEY, 'hex');

        // Dividir el texto encriptado en partes: IV (vector de inicialización), AuthTag (etiqueta de autenticación) y texto encriptado
        const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');

        // Convertir IV y AuthTag en buffers
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        // Crear un descifrador usando el algoritmo AES-256-GCM, la clave y el IV
        const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);

        // Establecer la AuthTag para verificar la autenticidad del mensaje
        decipher.setAuthTag(authTag);

        // Descifrar el texto encriptado y convertirlo a formato UTF-8
        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Error al descifrar los datos:', error);
        throw new Error('Datos de descifrado inválidos');
    }
}

async function comparePassword(passwordString, bdHash) {
    try {
        return await bcrypt.compare(passwordString, bdHash);
    } catch (error) {
        console.error('Error al comparar contraseñas:', error);
        throw new Error('Error al comparar contraseñas');
    }
}

module.exports = { verificarToken, verificarDatos, comparePassword };
