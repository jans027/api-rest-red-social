// Importar modelo
const Follow = require("../models/follows");
const User = require("../models/user");
// Importar dependencias
const mongoosePaginate = require("mongoose-pagination");
// Importar servicio
const followService = require("../services/followService");

// Acciones de prueba
const pruebaFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controller/follow.js"
    });
};

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
        return res.status(500).json({
            status: "error",
            message: "Ha ocurrido un error en el guardado",
        });
    }

};

// Accion de borrar un follow (accion dejar de seguir)
const unFollow = async (req, res) => {
    // Recoger id del usuario identificado
    const userId = req.user.id;

    // Recoger el id del usuario que sigo y quiero dejar de seguir
    const followedId = req.params.id;


    // Find de las coincidencias y hacer un remove
    Follow.deleteOne({ "user": userId, "followed": followedId })
        .then((result) => {
            if (result.deletedCount === 0) {
                return res.status(500).json({
                    status: "error",
                    message: "No has dejado de seguir a nadie",
                });
            }

            return res.status(200).send({
                status: "success",
                message: "Follow eliminado correctamente"
            });
        })
        .catch((err) => {
            return res.status(500).json({
                status: "error",
                message: "Ha ocurrido un error al ejecutar unFollow",
            });
        });

};

// Accion listado de usuarios que cualquier usuario esta siguiendo (siguiendo)
const following = async (req, res) => {
    try {
        let userId = req.user.id;

        if (req.params.id) userId = req.params.id;

        let page = 1;
        if (req.params.page) page = req.params.page;

        // Saber el total de elementos y calcular el número de páginas 
        let itemsPerPage = 3;
        // Obtén el total de elementos que coinciden con tu consulta sin paginación
        const totalFollows = await Follow.countDocuments({ user: userId });
        // Calcula el número total de páginas utilizando la cantidad total 
        // de elementos y el número de elementos por página
        const totalPages = Math.ceil(totalFollows / itemsPerPage);


        const follows = await Follow.find({ user: userId })
        // .populate("user", "-role -email -password -__v");

        // extrae todas las propiedades de los usuarios seguidos
        const populatedFollows = await Promise.all(follows.map(async (follow) => {
            const populatedFollowed = await User.findById(follow.followed)
                .select("-role -email -password -__v -name -surname");
            return {
                ...follow.toObject(),
                followed: populatedFollowed
            };
        }));

        // sacar un array de ids de los usuarios que me siguen y los que yo sigo
        let followUserIds = await followService.followUserIds(req.user.id);

        return res.status(200).send({
            status: "success",
            message: "Listado de usuarios que estoy siguiendo",
            follows: populatedFollows,
            totalFollows: totalFollows,
            totalPages: totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });

    } catch (error) {

        return res.status(500).send({
            status: "error",
            message: "Ha ocurrido un error al ejecutar following",
        });
    }
};


// Accion listado de usuarios que siguen a cualquier otro usuario (soy seguido o mis seguidores)
const followers = (req, res) => {

    return res.status(200).send({
        status: "success",
        message: "Listado de usuarios que me siguen"
    });
};

// Exportar acciones
module.exports = {
    pruebaFollow,
    save,
    unFollow,
    following,
    followers
}