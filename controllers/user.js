// Importar dependencias y modulos
const bcrypt = require("bcrypt");
const mongoosePagination = require("mongoose-pagination");
const fs = require("fs").promises;
const path = require("path");
// Importar modelos
const User = require("../models/user");
//  Importar servicios
const jwt = require("../services/jwt");
const followService = require("../services/followService");
const validate = require("../helpers/validate");



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

    // Validacion avanzada
    try {
        validate(params);
    } catch (error) {
        return res.status(400).json({
            status: "error",
            messaje: "Validacion no superada",
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
        .select({ "role": 0, "email": 0, "password": 0 })// informacion que no se va a mostrar
        .then(async (userProfile) => {
            if (!userProfile) {
                return res.status(404).send({
                    status: "error",
                    messague: "El usuario no existe o hay un error"
                });
            }

            // Info de seguimientos
            const followInfo = await followService.followThisUser(req.user.id, id);

            // Devolver resultado
            return res.status(200).send({
                status: "success",
                user: userProfile,
                following: followInfo.following,
                follower: followInfo.follower
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
    let page = 1;

    if (req.params.page) {
        page = req.params.page;
    }
    // Convirtiendo page a un numero entero
    page = parseInt(page);

    // Consulta con mongoose paginate
    let itemsPerPage = 5;

    User.find().sort('_id').paginate(page, itemsPerPage).select("-email -password -role -__v -name -surname")
        .then(async (users) => {


            // Get total users
            const totalUsers = await User.countDocuments({}).exec();

            if (!users) {
                return res.status(404).send({
                    status: "error",
                    message: "No hay usuarios disponibles",
                })
            }

            // sacar un array de ids de los usuarios que me siguen y los que yo sigo
            let followUserIds = await followService.followUserIds(req.user.id)

            // Devolver el resultado (posteriormente info de follows)
            return res.status(200).send({
                status: "success",
                users,
                page,
                itemsPerPage,
                totalUsers,
                pages: Math.ceil(totalUsers / itemsPerPage), //redondeo del total de paginas
                followUserIds
            })
        }).catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "Error en la consulta",
            })
        });


}

// actualizar la info de un usuario
const update = async (req, res) => {
    // Recoger info del usuario a actualizar
    const userIdentity = req.user;
    const userToUpdate = req.body;

    // Eliminar campos sobrantes
    delete userToUpdate.iat;
    delete userToUpdate.exp;

    // Comprobar si el usuario ya existe
    try {
        // Control usuarios duplicados
        const users = await User.find({
            $or: [
                { email: userToUpdate.email.toLowerCase() },
                { nick: userToUpdate.nick.toLowerCase() },
            ]
        }).exec();

        let userIsset = false;
        users.forEach(element => {
            if (element && element._id != element.id) userIsset = true;
        });


        if (userIsset) {
            return res.status(200).send({
                status: "success",
                messague: "El usuario ya existe"
            });
        }


        if (userToUpdate.password) {
            // Cifrar la contrasena 
            let pwd = await bcrypt.hash(userToUpdate.password, 10,);
            userToUpdate.password = pwd;
        }

        // Buscar y actualizar
        User.findByIdAndUpdate({ _id: req.user.id }, userToUpdate, { new: true })
            .then((userUpdated) => {

                if (!userUpdated) {
                    return res.status(500).send({
                        status: "error",
                        message: "Error al actualizar el usuario"
                    })
                }

                return res.status(200).send({
                    status: "success",
                    message: "Metodo de actualizar usuarios",
                    user: userUpdated
                })

            }).catch((error) => {
                return res.status(500).send({
                    status: "error",
                    message: "Error de actualizacion"
                })
            });


    } catch (error) {
        return res.status(500).json({
            status: "error",
            messague: "Error en la consulta de usuarios"
        });
    }



};

// subir imagenes
const upload = async (req, res) => {

    // Recoger fichero de imagen y comprobar que existe
    if (!req.file) {
        return res.status(404).send({
            status: "error",
            message: "Peticion no incluye mensaje",
        });
    }

    // Conseguir el nombre del archivo
    let image = req.file.originalname;

    // Sacar la extension del archivo
    const imageSplit = image.split("\.");
    const extension = imageSplit[imageSplit.length - 1];

    // Comprobar extension
    if (extension != "png" && extension != "jpg" && extension != "jpeg" && extension != "gif") {

        // Borrar archivo subido cuando no corresponde a la extension correcta
        const filePath = req.file.path;
        const fileDelete = fs.unlinkSync(filePath);
        // Devolver respuesta negativa
        return res.status(400).send({
            status: "error",
            message: "Extension del fichero invalida",
        });
    }

    // Si es correcta, guardar imagen en base de datos
    User.findByIdAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true })
        .then((userUpdated) => {

            if (!userUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "Error en la subida del avatar"
                });
            }

            // devolver respuesta
            return res.status(200).send({
                status: "success",
                user: userUpdated,
                file: req.file,
            });
        }).catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "Error de ejecucion"
            });
        });

};

// Mostrar avatar
const avatar = async (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Mostrar el path real de la imagen
    const filePath = `./uploads/avatars/${file}`;

    try {

        // Comprobar que existe
        const exists = await fs.stat(filePath);

        if (!exists) {
            return res.status(404).send({
                status: "error",
                message: "No existe la imagen"
            });
        };

        // Devolver un file
        return res.sendFile(path.resolve(filePath));

    } catch (error) {
        return res.status(500).send({
            status: "error",
            message: "Error en la consulta de avatar"
        });
    }

};


// Exportar acciones
module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}