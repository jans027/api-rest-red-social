// importar dependencias
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");
// Importando rutas 
const UserRoutes = require("./routes/user");
const PublicationsRoutes = require("./routes/publications");
const FollowRoutes = require("./routes/follow");

//  Mensaje de bienvenida
console.log("API NODE para RED SOCIAL arrancada !!")

// Conexion a base de datos
connection();

// Crear servidor node
const app = express();
const puerto = 3900;

// Configurar cors
app.use(cors());

// Convertir los datos del body a objetos js
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Configurando carga de rutas 
app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationsRoutes);
app.use("/api/follow", FollowRoutes);

// poner servidor a escuchar peticiones http
app.listen(puerto, () => {
    console.log(`Servidor de node corriendo en el puerto ${puerto}`)
})