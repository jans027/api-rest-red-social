// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
// Importar modelos
const User = require("../models/user");
//  Importar servicios
const jwt = require("../services/jwt");

// Acciones de prueba
const pruebaUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controller/user.js",
        usuario: req.user
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
    User.findOne({ email: params.email }, { "role": 0, "create_at": 0 })

        .then((user) => {
            if (!user) {
                return res.status(400).send({
                    status: "error",
                    messague: "No existe el usuario"
                });
            }

            // Comprobar la password
            const pwd = bcrypt.compareSync(params.password, user.password);

            if (!pwd) {
                return res.status(400).send({
                    status: "error",
                    messague: "No te has identificado correctamente"
                });
            }

            // Devolver token de identificacion
            const token = jwt.cretaeToken(user);

            return res.status(200).send({
                status: "success",
                messague: "Te has identificado correctamente !",
                user: {
                    id: user._id,
                    name: user.name,
                    nick: user.nick
                },
                token
            });

        }).catch((error) => {
            return res.status(500).json({
                status: "Error",
                messague: "Error en la consulta de usuarios"
            });
        });

    // Datos del usuario


};

// Perfil de usuario registrado
const profile = (req, res) => {
    // recibir el parametro del id de usuario por la url
    const id = req.params.id;

    // Consulta para sacar los datos del usuario
    User.findById(id)
        .select({ "role": 0, "email": 0, "password": 0})// informacion que no se va a mostrar
        .then((userProfile) => {
            if (!userProfile) {
                return res.status(404).send({
                    status: "error",
                    messague: "El usuario no existe o hay un error"
                });
            }
            // Devolver resultado
            return res.status(200).send({
                status: "success",
                user: userProfile
            });

        }).catch((error) => {
            return res.status(500).send({
                status: "error",
                messague: "Error en la consulta de usuarios"
            });
        });

};

// Listado de usarios
const list = (req, res) => {
    // Controlar en que pagina estamos 

    // Consulta con mongoose paginate
    
    // Devolver el resultado (posteriormente info de follows)
    return res.status(200).send({
        status: "success",
        message: "Ruta de listado de usuarios"
    })
}

// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list
}