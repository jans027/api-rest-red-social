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

        if (!user_to_save) {
            return res.status(500).json({
                status: "error",
                messaje: "Error al guardar el usuario",
            });
        } else {
            //Guardar usuario en la bbdd
            user_to_save.save();

            return res.status(200).json({
                status: "success",
                messaje: "Usuario guardado correctamente !!",
                user_to_save
            });
        }

    } catch (error) {
        return res.status(500).json({
            status: "Error",
            messague: "Error en la consulta de usuarios"
        });
    }

}

// Login de usuarios
const login = (req, res) => {

    // Recoger parametros
    let params = req.body;

    if (!params.email || !params.password) {
        return res.status(400).send({
            status: "error",
            messague: "Faltan datos por enviar"
        });
    }

    // Buscar en la bd si existe
    User.findOne({ email: params.email }, {"role": 0, "create_at": 0})

        .then((user) => {
            if (!user) {
                return res.status(400).send({
                    status: "error",
                    messague: "No existe el usuario"
                });
            }

            // Comprobar la password
            let pwd = bcrypt.compareSync(params.password, user.password);

            if (!pwd) {
                return res.status(400).send({
                    status: "error",
                    messague: "No existe el usuario"
                });
            }


            return res.status(200).send({
                status: "success",
                messague: "Usuario encontrado",
                user
            });
        }).catch((error) => {
            return res.status(500).json({
                status: "Error",
                messague: "Error en la consulta de usuarios"
            });
        });

    // Comprobar password

    // Devolver token

    // Datos del usuario


}
// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login
}