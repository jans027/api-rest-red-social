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

// listar todas las publicaciones (de usuarios que sigo)

// Listar publicaciones de un usuario

// Subir ficheros

// Devolver archivos multimedia (imagenes)

// Exportar acciones
module.exports = {
    pruebaPublication,
    save,
    detail
}