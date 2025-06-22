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
  console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "[OK]" : "[MISSING]");
  console.log("TO_EMAIL:", process.env.TO_EMAIL);

  // Validación de env vars
  if (!process.env.RESEND_API_KEY || !process.env.TO_EMAIL) {
    console.error("❌ Variables de entorno Resend incompletas");
    return {
      statusCode: 500,
      body: "Variables de entorno Resend incompletas"
    };
  }

  try {
    // Llamada a Resend API
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "SmartHotels <onboarding@resend.dev>",
        to: [process.env.TO_EMAIL],
        subject: `Nuevo mensaje de contacto de ${nombre}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #C8A04F;">Nuevo mensaje de contacto</h2>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Nombre:</strong> ${nombre}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Mensaje:</strong></p>
              <div style="background-color: white; padding: 15px; border-left: 4px solid #C8A04F; margin-top: 10px;">
                ${mensaje.replace(/\n/g, '<br>')}
              </div>
            </div>
            <p style="color: #666; font-size: 12px;">
              Este mensaje fue enviado desde el formulario de contacto de SmartHotels.
            </p>
          </div>
        `
      })
    });

    console.log("Resend responded with status:", response.status);
    const data = await response.json();
    console.log("Resend response:", data);

    if (!response.ok) {
      console.error("❌ Error al enviar email:", data);
      return {
        statusCode: response.status,
        body: `Error al enviar email: ${data.message || 'Error desconocido'}`
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
