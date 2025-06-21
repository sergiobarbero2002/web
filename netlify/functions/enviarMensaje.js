exports.handler = async function (event) {
  console.log("––––– enviarMensaje.js ––– Iniciando handler –––––");

  // Extraemos payload
  let nombre, email, mensaje;
  try {
    ({ nombre, email, mensaje } = JSON.parse(event.body));
  } catch (err) {
    console.error("❌ Error parseando event.body:", err);
    return { statusCode: 400, body: "Payload JSON inválido" };
  }

  // Log de variables de entorno
  console.log("SERVICE_ID:",   process.env.EMAILJS_SERVICE_ID);
  console.log("TEMPLATE_ID:",  process.env.EMAILJS_TEMPLATE_ID);
  console.log("PUBLIC_KEY:",   process.env.EMAILJS_PUBLIC_KEY);
  console.log("TO:",           process.env.EMAIL_TO);

  // Validación de env vars
  if (
    !process.env.EMAILJS_SERVICE_ID ||
    !process.env.EMAILJS_TEMPLATE_ID ||
    !process.env.EMAILJS_PUBLIC_KEY ||
    !process.env.EMAIL_TO
  ) {
    console.error("❌ Alguna variable de EmailJS no está definida");
    return {
      statusCode: 500,
      body: "Variables de entorno EmailJS incompletas"
    };
  }

  try {
    // Llamada a EmailJS con fetch global
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id:      process.env.EMAILJS_SERVICE_ID,
        template_id:     process.env.EMAILJS_TEMPLATE_ID,
        user_id:         process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          from_name:  nombre,
          from_email: email,
          message:    mensaje,
          to_email:   process.env.EMAIL_TO
        }
      })
    });

    console.log("EmailJS responded with status:", response.status);
    const text = await response.text();
    console.log("EmailJS response body:", text);

    if (!response.ok) {
      console.error("❌ Error al enviar email:", text);
      return {
        statusCode: response.status,
        body: `Error al enviar email: ${text}`
      };
    }

    console.log("✅ Email enviado correctamente");
    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error("💥 Excepción en enviarMensaje:", err.stack);
    return {
      statusCode: 500,
      body: `Error interno: ${err.message}`
    };
  }
};
