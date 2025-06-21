const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function (event) {
  const { nombre, email, mensaje } = JSON.parse(event.body);

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY,
      template_params: {
        from_name: nombre,
        from_email: email,
        message: mensaje,
        to_email: process.env.EMAIL_TO
      }
    })
  });

  if (!response.ok) {
    return { statusCode: 500, body: 'Error al enviar email' };
  }

  return { statusCode: 200, body: 'OK' };
}
