const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

exports.handler = async function (event) {
  console.log("––––– chatGPT.js ––– Iniciando handler –––––");
  console.log("process.env.OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "[OK]" : "[MISSING]");

  try {
    const { message } = JSON.parse(event.body);
    console.log("Mensaje recibido del frontend:", message);

    // Comprueba que la API key exista
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY no está definida");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "OPENAI_API_KEY no definida en entorno" })
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 500,
        messages: [
          {
            role: "system",
            content:
              process.env.system_message ||
              "Sistema no configurado correctamente."
          },
          { role: "user", content: message }
        ]
      })
    });

    console.log("OpenAI API responded with status:", response.status);
    const data = await response.json();
    console.log("OpenAI payload:", JSON.stringify(data).slice(0, 500));

    if (!response.ok) {
      console.error("❌ OpenAI API error:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Error desde OpenAI", details: data })
      };
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      console.warn("⚠️ No llegó `choices[0].message.content`");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Sin contenido de respuesta" })
      };
    }

    console.log("✅ Respuesta generada:", reply);
    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error("💥 Excepción en handler:", err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error interno en función",
        details: err.message
      })
    };
  }
};
