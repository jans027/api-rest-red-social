const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user");
const check = require("../middlewares/auth");
const multer = require("multer");

// Configuracion de subida
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "../uploads/avatars")
    },
    filename: () => {

    }
})


// Definir rutas
router.get("/prueba-usuario", check.auth, UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:id", check.auth, UserController.profile);
router.get("/list/:page?", check.auth, UserController.list); // con el "?" se define que un parametro es opcional
router.put("/update", check.auth, UserController.update);
router.post("/upload", check.auth, UserController.upload);



// Exportar router
module.exports = router