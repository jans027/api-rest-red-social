const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publications");
const check = require("../middlewares/auth");

// Definir rutas
router.get("/prueba-publication", PublicationController.pruebaPublication);

// Ruta util
router.post("/save", check.auth, PublicationController.save);
router.get("/detail/:id", check.auth, PublicationController.detail);
router.delete("/remove/:id", check.auth, PublicationController.remove);
router.get("/user/:id/:page?", check.auth, PublicationController.userPublicactions);



// Exportar router
module.exports = router