const Questionnaire = require("../models/Questionnaire");
const nodemailer = require("nodemailer");

exports.submitQuestionnaire = async (req, res) => {
  const { name, email, phone, message, questions } = req.body; // Se agregó phone
  const ipAddress = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  try {
    // Contar cuántas veces ha enviado el mismo email
    const emailCount = await Questionnaire.countDocuments({ email });
    if (emailCount >= 3) {
      return res.status(429).json({ error: "Has alcanzado el límite de 3 envíos con este email." });
    }

    // Contar cuántas veces ha enviado desde esta IP
    const ipCount = await Questionnaire.countDocuments({ ipAddress });
    if (ipCount >= 10) {
      return res.status(429).json({ error: "Has alcanzado el límite de 5 envíos desde esta IP." });
    }

    // Guardar datos en la base de datos
    const newQuestionnaire = new Questionnaire({ name, email, phone, message, questions, ipAddress });
    await newQuestionnaire.save();

    // Configurar nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Correo para el cliente
    const mailOptionsClient = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "📢 ¡Hemos recibido tu consulta en DISERAB!",
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; text-align: center;">
            <div style="max-width: 600px; background: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1); margin: auto;">
              <h2 style="color: #2D89EF;">¡Gracias por tu consulta, ${name}!</h2>
              <p style="color: #333;">Hemos recibido tu mensaje y uno de nuestros asesores se pondrá en contacto contigo muy pronto.</p>
              <p style="font-size: 18px;"><strong>📩 Tu mensaje:</strong></p>
              <blockquote style="background: #f9f9f9; padding: 10px; border-left: 4px solid #2D89EF; font-style: italic;">
                ${message}
              </blockquote>
              <p><strong>📞 Teléfono:</strong> ${phone}</p>
              <p style="color: #555;">Mientras tanto, te invitamos a visitar nuestra página web para conocer más sobre nuestros servicios.</p>
              <a href="https://www.diserab.com" target="_blank" style="display: inline-block; background-color: #2D89EF; color: white; text-decoration: none; padding: 12px 24px; font-size: 16px; border-radius: 5px;">Visitar Página Web</a>
              <hr style="border: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; color: #777;">Si no enviaste esta solicitud, ignora este mensaje.</p>
              <p style="font-size: 12px; color: #777;">© 2024 DISERAB. Todos los derechos reservados.</p>
            </div>
          </div>
        `,
      };

    // Correo para tu equipo (DISERAB) con los detalles del lead
    const mailOptionsAdmin = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Enviártelo a ti mismo
      subject: `Nuevo Lead - ${name}`,
      text: `📌 **Nuevo Lead Recibido**\n\n
      - **Nombre:** ${name}
      - **Email:** ${email}
      - **Teléfono:** ${phone} 📞
      - **Mensaje:** ${message}
      - **Preguntas:** ${questions.join(", ")}
      - **IP:** ${ipAddress}
      - **Fecha:** ${new Date().toLocaleString()}

      ✅ **Llama al cliente lo antes posible.**`,
    };

    // Enviar los correos
    await transporter.sendMail(mailOptionsClient);
    await transporter.sendMail(mailOptionsAdmin);

    res.status(200).json({ message: "Cuestionario enviado y emails de confirmación enviados." });
  } catch (error) {
    console.error("Error al enviar cuestionario:", error);
    res.status(500).json({ error: "Ocurrió un error al procesar tu solicitud." });
  }
};
