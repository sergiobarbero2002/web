exports.handler = async function (event) {
  console.log("––––– chatGPT.js ––– Iniciando handler –––––");
  console.log("process.env.OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "[OK]" : "[MISSING]");

  // Validamos la API key antes de todo
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY no está definida");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "OPENAI_API_KEY no definida en entorno" })
    };
  }

  try {
    const { message, chatHistory } = JSON.parse(event.body);
    console.log("Mensaje recibido del frontend:", message);
    console.log("Historial de conversación recibido:", chatHistory ? `${chatHistory.length} mensajes` : "Sin historial");

    // Construir el array de mensajes para OpenAI
    const messages = [
      { role: "system", content: process.env.system_message || "Sistema no configurado correctamente." }
    ];
    
    // Agregar el historial de conversación si existe
    if (chatHistory && Array.isArray(chatHistory)) {
      console.log("📝 Agregando historial de conversación:");
      chatHistory.forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.role}]: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`);
        messages.push(msg);
      });
    }
    
    // Agregar el mensaje actual del usuario
    messages.push({ role: "user", content: message });
    console.log(`📝 Agregando mensaje actual: [user]: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`);

    console.log("📊 Total de mensajes enviados a OpenAI:", messages.length);
    console.log("🔍 Mensaje del sistema:", messages[0].content.substring(0, 100) + (messages[0].content.length > 100 ? '...' : ''));

    // Llamada a OpenAI usando fetch global
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
        messages: messages
      })
    });

    console.log("OpenAI API responded with status:", response.status);
    const data = await response.json();
    console.log("OpenAI payload (recortado):", JSON.stringify(data).slice(0, 500));

    if (!response.ok) {
      console.error("❌ Error desde OpenAI:", data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "Error desde OpenAI", details: data })
      };
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      console.warn("⚠️ Sin contenido en choices[0].message.content");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Sin contenido de respuesta" })
      };
    }

    console.log("✅ Respuesta completa de OpenAI:", reply);
    console.log("📊 Tokens usados:", data.usage ? `Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens}, Total: ${data.usage.total_tokens}` : "No disponible");
    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    console.error("💥 Excepción en handler:", err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error interno en función", details: err.message })
    };
  }
};
