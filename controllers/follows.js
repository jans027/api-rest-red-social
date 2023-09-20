const Follow = require("../models/follows");
const User = require("../models/user");

// Acciones de prueba
const pruebaFollow = (req, res) =>{
    return res.status(200).send({
        message: "Mensaje enviado desde: controller/follow.js"
    })
}

// Accion de guardar un follow (accion de seguir)
const save = (req, res) => {

    return res.status(200).send({
        status:"success",
        message: "Metodo dar follow"
    })
}

// Accion de borrar un follow (accion dejar de seguir)

// Accion listado de usuarios que estoy siguiendo

// Accion listado de usuarios que me siguen


// Exportar acciones
module.exports = {
    pruebaFollow,
    save
}