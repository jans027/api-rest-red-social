// Importar modulos
const fs = require("fs").promises;
const path = require("path");

// Importar modelos
const Publication = require("../models/publications")

// Acciones de prueba
const pruebaPublication = (req, res) => {
    return res.status(200).send({
        status: "success",
        message: "Mensaje enviado desde: controller/publication.js"
    });
}

// Guardar publicacion
const save = (req, res) => {

    // Recoger datos del body
    const params = req.body;

    // Si no llegan dar respuesta negativa
    if (!params) {

        return res.status(400).send({
            status: "error",
            message: "Debes enviar el texto de la publicacion."
        })
    }

    // Crear y rellenar el objeto del modelo
    let newPublication = new Publication(params);
    newPublication.user = req.user.id;

    // Guardar objeto en bd
    newPublication.save()
        .then((publicationStored) => {

            if (!publicationStored) {
                return res.status(400).send({
                    status: "error",
                    message: "No se ha guardado la publicacion."
                });
            };

            return res.status(200).send({
                status: "success",
                message: "Publicacion guardada",
                publicationStored
            });

        }).catch((err) => {

            return res.status(500).send({
                status: "error",
                message: "Error guardando la publicacion."
            });
        });

};
// Mostrar una publicacion en concreto
const detail = (req, res) => {
    // Sacar id de publicacion de la url
    const publicationId = req.params.id;

    // Find con la condicion del id
    Publication.findById(publicationId)
        .then((publicationStored) => {

            if (!publicationStored) {
                return res.status(400).send({
                    status: "success",
                    message: "No existe la publicacion"
                });
            };

            // Devolver respuesta
            return res.status(200).send({
                status: "success",
                message: "Mostrar publicacion",
                publication: publicationStored
            });

        }).catch((err) => {

            return res.status(500).send({
                status: "success",
                message: "Error al mostrar publicacion"
            });
        });

};

// Eliminar publicaciones
const remove = (req, res) => {
    // Obtener id de publicacion a eliminar
    const publicationId = req.params.id;

    // Find y luego remove
    Publication.findOneAndDelete({ "user": req.user.id, "_id": publicationId })
        .then((deletePost) => {

            if (!deletePost) {
                return res.status(400).send({
                    status: "error",
                    message: "No se ha heliminado la publication"
                });
            }
            // Devolver respuesta
            return res.status(200).send({
                status: "success",
                message: "Publicacion borrada con exito!",
                publication: deletePost
            });

        }).catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "Error al tratar de elimimar una publicacion"
            });
        });

};

// Listar publicaciones de un usuario
const userPublicactions = async (req, res) => {
    // Sacar el id de usuario
    const userId = req.params.id;
    console.log(userId)

    // Find, populate, ordenar
    try {
        const publications = await Publication.find({ "user": userId })
            .sort("-created_at")
            .exec();

        // Obtener el usuario actual (req.user) y eliminar campos sensibles
        const currentUser = req.user;
        delete currentUser.password;
        delete currentUser.__v;
        delete currentUser.iat;
        delete currentUser.exp;
        delete currentUser.email;

        if (!publications || publications.length <= 0) {
            return res.status(404).send({
                status: "error",
                message: "No hay publicaciones para mostrar"
            });
        }

        // Devolver respuesta
        return res.status(200).send({
            status: "success",
            message: "Publicaciones del perfil de un usuario",
            user: currentUser,
            publications
        });
    } catch (error) {
        // Manejar el error aquí
        console.error(error);
        return res.status(500).send({
            status: "error",
            message: "Ha ocurrido un error al buscar las publicaciones del usuario",
        });
    }



};

// Subir ficheros // subir imagenes
const upload = async (req, res) => {
    // Sacar publication id
    const publicationId = req.params.id;

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
    Publication.findByIdAndUpdate(
        { "user": req.user.id, "_id": publicationId },
        { file: req.file.filename },
        { new: true })
        .then((publicationUpdated) => {

            if (!publicationUpdated) {
                return res.status(500).send({
                    status: "error",
                    message: "Error en la subida del avatar"
                });
            }

            // devolver respuesta
            return res.status(200).send({
                status: "success",
                publication: publicationUpdated,
                file: req.file,
            });
        }).catch((error) => {
            return res.status(500).send({
                status: "error",
                message: "Error de ejecucion"
            });
        });

};

// Devolver archivos multimedia (imagenes)
const media = async (req, res) => {
    // Sacar el parametro de la url
    const file = req.params.file;

    // Mostrar el path real de la imagen
    const filePath = `./uploads/publications/${file}`;


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

// listar todas las publicaciones (de usuarios que sigo)


// Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    userPublicactions,
    upload,
    media
}