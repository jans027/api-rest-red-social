// Importar dependencias y modulos
const User = require("../models/user");

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controller/user.js"
    })
}

// Registro de usuario
const register =  async (req, res) => {
    // Recoger datos de la peticion
    let params = req.body;

    // Ccomprobar que me llegan bien (+validacion)
    if (!params.name || !params.surname || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    // Crear objeto de usuario
    let user_to_save = new User(params);

    try {
        // Control usuarios duplicados
        const userExists =  await User.find({
            $or: [
                { email: user_to_save.email.toLowerCase() },
                { nick: user_to_save.nick.toLowerCase() },
            ]
        }).exec();

        if (userExists && userExists.length >= 1) {
            return res.status(200).send({
                status: "success",
                messague: "El usuario ya existe"
            });
        }

        // Guardar usuario en la base de datos
        //const savedUser = await user_to_save.save();

        return res.status(200).json({
            messaje: "Acción de registro de usuarios",
            status: "success",
            //savedUser,
            user_to_save
        });
    } catch (error) {
        return res.status(500).json({
            status: "Error",
            messague: "Error en la consulta de usuarios"
        });
    }

    // Cifrar la contrasena 

    // Guardar usuarios en la bd

    // Devolver resultado
    return res.status(200).json({
        status: "success",
        message: "Accion de registro de usuarios",
        user_to_save
    });
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register
}