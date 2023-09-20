const Follow = require("../models/follows");
const User = require("../models/user");

// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controller/follow.js"
    })
}

// Accion de guardar un follow (accion de seguir)
const save = async (req, res) => {
    // Obtener usuario a seguir
    const followed = req.body.followed;

    // obtener datos de usuario que sigue
    const user = req.user.id;

    try {
        // Verificando si ya se sigue al usuario
        const validarFollow = await Follow.find({ user, followed });

        if (validarFollow.length > 0)
            return res.status(400).json({
                status: "error",
                message: `Bad Request | Ya se sigue al usuario ${followed}`,
            });

        // crear el objeto que se va a guardar con el modelo
        const seguimiento = {
            followed,
            user,
        };

        // Preparando instancia del modelo
        const follows = new Follow(seguimiento);

        // guardando en DDBB
        await follows.save();

        res.json({
            status: "success",
            message: "Accion de salvar follow",
            identity: req.user,
            follows,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            status: "error",
            message: "Ha ocurrido un error en el guardado",
        });
    }

}

// Accion de borrar un follow (accion dejar de seguir)

// Accion listado de usuarios que estoy siguiendo

// Accion listado de usuarios que me siguen


// Exportar acciones
module.exports = {
    pruebaFollow,
    save
}