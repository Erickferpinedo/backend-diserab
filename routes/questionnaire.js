const express = require("express");
const router = express.Router();
const questionnaireController = require("../controllers/questionnaireController");

// Ruta para enviar el cuestionario con validaciones
router.post("/submit-questionnaire", questionnaireController.submitQuestionnaire);

module.exports = router;
