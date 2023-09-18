// Importar dependencias y modulos
const bcrypt = require("bcrypt");
// Importar modelos
const User = require("../models/user");

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controller/user.js"
    })
}

// Registro de usuario
const register = async (req, res) => {
    // Recoger datos de la peticion
    let params = req.body;

    // Ccomprobar que me llegan bien (+validacion)
    if (!params.name || !params.surname || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    try {
        // Control usuarios duplicados
        const userExists = await User.find({
            $or: [
                { email: params.email.toLowerCase() },
                { nick: params.nick.toLowerCase() },
            ]
        }).exec();

        if (userExists && userExists.length >= 1) {
            return res.status(200).send({
                status: "success",
                messague: "El usuario ya existe"
            });
        }
        // Cifrar la contrasena 
        let pwd = await bcrypt.hash(params.password, 10,);
        params.password = pwd;


        // Crear objeto de usuario
        let user_to_save = new User(params);

        //Guardar usuario en la bbdd
        user_to_save.save();

        return res.status(200).json({
            messaje: "Acción de registro de usuarios",
            status: "success",
            // savedUser,
            user_to_save
        });


    } catch (error) {
        return res.status(500).json({
            status: "Error",
            messague: "Error en la consulta de usuarios"
        });
    }

}

// Exportar acciones
module.exports = {
    pruebaUser,
    register
}