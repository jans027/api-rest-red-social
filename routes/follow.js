const express = require("express");
const router = express.Router();
const FollowController = require("../controllers/follows");

// Definir rutas
router.get("/prueba-follow", FollowController.pruebaFollow);

// Exportar router
module.exports = router