// Importar dependencias
const jwt = require("jwt-simple");
const moment = require("moment");

// Clave secreta
const secret = "CLAVE_SECRETA_del_proyecto_DE_LA_RED_soCIAL_987987";

// Crear una funcion para generar tokens
const cretaeToken = (user) =>{
    const payload = {
        id:  user.id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        imagen: user.image,
        iat: moment().unix(), // fecha en la cual se genera el token
        exp: moment().add(30, "days").unix() // se genera el token de AUTH con una expiracion de 30 dias
    }

    // Devolver jwt token codificado
    return jwt.encode(payload, secret);
}

module.exports = {
    secret,
    cretaeToken
}