// netlify/functions/chatGPT.js
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function (event) {
  try {
    const { message } = JSON.parse(event.body);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: process.env.system_message || 'Sistema no configurado correctamente.'
          },
          { role: 'user', content: message }
        ]
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sin respuesta del asistente';

    return { statusCode: 200, body: JSON.stringify({ reply }) };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Error al contactar con OpenAI', details: err.message })
    };
  }
};
