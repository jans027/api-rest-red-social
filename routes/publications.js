const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publications");
const check = require("../middlewares/auth");
const multer = require("multer");

// Configuracion de subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications");
    },
    filename: (req, file, cb) => {
        cb(null, "publications-"+Date.now()+"-"+file.originalname);
    }
});

const uploads = multer({storage});

// Definir rutas
router.get("/prueba-publication", PublicationController.pruebaPublication);

// Ruta util
router.post("/save", check.auth, PublicationController.save);
router.get("/detail/:id", check.auth, PublicationController.detail);
router.delete("/remove/:id", check.auth, PublicationController.remove);
router.get("/user/:id/:page?", check.auth, PublicationController.userPublicactions);
router.post("/upload/:id", [check.auth, uploads.single("file0")], PublicationController.upload);
router.get("/media/:file", check.auth, PublicationController.media);

// Exportar router
module.exports = router