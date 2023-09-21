// Importacion de modelos
const Follow = require("../models/follows");



// Array de usuarios que sigo y me siguen
const followUserIds = async (identityUserId) => {

    try {

        // Sacar info seguimiento
        let following = await Follow.find({ "user": identityUserId })
            .select({ "followed": 1, "_id": 0 })
            .exec();

        let followers = await Follow.find({ "followed": identityUserId })
            .select({ "user": 1, "_id": 0 })
            .exec();

        // Procesar array de identificadores

        // convirtiendo listado following en un array
        let following_clean = [];

        following.forEach(element => {
            following_clean.push(element.followed);
        });

        // convirtiendo listado followers en un array
        let followers_clean = [];

        followers.forEach(element => {
            followers_clean.push(element.user);
        });

        return {
            following: following_clean,
            followers: followers_clean
        }

    } catch (error) {
        return {}
    }

};

const followThisUser = async (identityUserId, profileUserId) => {

    // Sacar info seguimiento
    let following = await Follow.findOne({ "user": identityUserId, "followed": profileUserId })
        .select({ "followed": 1, "_id": 0 })
        .exec();

    let follower = await Follow.findOne({ "user": profileUserId, "followed": identityUserId })
        .select({ "user": 1, "_id": 0 })
        .exec();

        return {
            following,
            follower
        }

};

module.exports = {
    followUserIds,
    followThisUser
}