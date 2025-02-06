const mongoose = require("mongoose");

const QuestionnaireSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true }, // 📞 NUEVO CAMPO
  message: { type: String, required: true },
  questions: { type: [String], required: true },
  ipAddress: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Questionnaire", QuestionnaireSchema);
