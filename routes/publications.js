const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publications");
const check = require("../middlewares/auth");

// Definir rutas
router.get("/prueba-publication", PublicationController.pruebaPublication);

// Ruta util
router.post("/save", check.auth, PublicationController.save);


// Exportar router
module.exports = router