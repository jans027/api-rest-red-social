

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controller/user.js"
    })
}

// Registro de usuario
const register = (req, res) => {
    return res.status(200).json({
        message: "Accion de registro de usuarios"
    });
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register
}