require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const questionnaireRoutes = require("./routes/questionnaire");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", questionnaireRoutes);

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch((err) => console.error("Error conectando a MongoDB:", err));

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));
