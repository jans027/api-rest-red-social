const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follows");
const check = require("../middlewares/auth");


// Definir rutas
router.get("/prueba-follow", FollowController.pruebaFollow);

// Ruta util
router.post("/save", check.auth, FollowController.save);
router.delete("/unFollow/:id", check.auth, FollowController.unFollow);
router.get("/following/:id?/:page?", check.auth, FollowController.following);
router.get("/followers/:id?/:page?", check.auth, FollowController.followers);



// Exportar router
module.exports = router