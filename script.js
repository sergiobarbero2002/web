// Chat variables
const chatButton = document.getElementById('chatButton');
const chatBubble = document.getElementById('chatBubble');
const chatModal = document.getElementById('chatModal');
const closeChat = document.getElementById('closeChat');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendButton = document.getElementById('sendMessage');
const headerChatLink = document.getElementById('headerChatLink');
const footerChatLink = document.getElementById('footerChatLink');

// Sounds
const notificationSound = new Audio('assets/FX.mp3');
const clickSound = new Audio('assets/click.mp3');
const chatSound = new Audio('assets/chat.mp3');
notificationSound.volume = 0.5;
clickSound.volume = 0.3;

function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {});
}

document.querySelectorAll('a, button, .nav-button, .social-link, .proyecto-card')
  .forEach(el => el.addEventListener('click', playClickSound));

setTimeout(() => {
  chatBubble.classList.add('visible');
  notificationSound.play().catch(() => {});
}, 3000);

document.addEventListener('click', (e) => {
  if (!chatButton.contains(e.target) && !chatBubble.contains(e.target)) {
    chatBubble.classList.remove('visible');
  }
});

function openChatModal() {
  chatModal.classList.add('active');
  chatBubble.classList.remove('visible');
  chatInput.focus();
}

chatButton.addEventListener('click', openChatModal);
headerChatLink.addEventListener('click', (e) => { e.preventDefault(); openChatModal(); });
footerChatLink.addEventListener('click', (e) => { e.preventDefault(); openChatModal(); });
chatModal.addEventListener('click', (e) => {
  if (e.target === chatModal) chatModal.classList.remove('active');
});

// Smooth scroll
function scrollToSectionSmooth(id) {
  const section = document.querySelector(id);
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// particles.js
particlesJS("particles-js", {
  particles: {
    number: { value: 100, density: { enable: true, value_area: 700 } },
    color: { value: "#C8A04F" },
    shape: { type: "circle" },
    opacity: { value: 1 },
    size: { value: 4, random: true },
    line_linked: { enable: true, distance: 120, color: "#C8A04F", opacity: 1, width: 1.75 },
    move: { enable: true, speed: 1.5 }
  },
  interactivity: {
    detect_on: "window",
    events: { onhover: { enable: true, mode: "grab" }, onclick: { enable: true, mode: "push" }, resize: true },
    modes: { grab: { distance: 140, line_linked: { opacity: 1 } }, push: { particles_nb: 4 } }
  },
  retina_detect: true
});

// Scroll animation
function handleScrollAnimation() {
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight - 150) {
      el.classList.add('visible');
    }
  });
}

// Chat logic
let chatHistory = [];

function addMessage(message, isUser = false) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
  if (!isUser) msgDiv.innerHTML = `<div class="ai-icon"></div>`;
  const content = document.createElement('div');
  content.className = 'message-content';
  content.textContent = message;
  msgDiv.appendChild(content);
  chatMessages.appendChild(msgDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
} 

async function sendToChatGPT(message) {
  try {
    // Agregar el mensaje actual al historial antes de enviar
    const currentHistory = [...chatHistory, { role: 'user', content: message }];
    
    const res = await fetch('/.netlify/functions/chatGPT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message,
        chatHistory: currentHistory 
      })
    });
    const data = await res.json();
    if (data && data.reply) {
      chatSound.play().catch(() => {});
      return data.reply;
    }
    return "Lo siento, no se pudo obtener respuesta.";
  } catch (e) {
    return "Error al conectar con el asistente.";
  }
}

async function handleChatSubmit() {
  const message = chatInput.value.trim();
  if (!message) return;
  chatInput.disabled = true;
  sendButton.disabled = true;
  sendButton.textContent = 'Enviando...';
  addMessage(message, true);
  chatInput.value = '';
  
  // Agregar el mensaje del usuario al historial
  chatHistory.push({ role: 'user', content: message });
  
  const reply = await sendToChatGPT(message);
  
  // Agregar la respuesta del asistente al historial
  chatHistory.push({ role: 'assistant', content: reply });
  addMessage(reply);
  
  chatInput.disabled = false;
  sendButton.disabled = false;
  sendButton.textContent = 'Send';
  chatInput.focus();
}

sendButton.addEventListener('click', handleChatSubmit);
chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleChatSubmit(); });

// Contact form submission → via Netlify function
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending...';

  const payload = {
    nombre: document.getElementById('nombre').value,
    email: document.getElementById('email').value,
    mensaje: document.getElementById('mensaje').value
  };

  fetch('/.netlify/functions/enviarMensaje', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(res => res.ok ? res.text() : Promise.reject('Error'))
  .then(() => {
    status.textContent = '¡Mensaje enviado correctamente!';
    status.className = 'form-status success';
    document.getElementById('contactForm').reset();
  })
  .catch(() => {
    status.textContent = 'Error al enviar el mensaje.';
    status.className = 'form-status error';
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Enviar Mensaje';
  });
});

// Resto de funcionalidades
window.addEventListener('scroll', handleScrollAnimation);
document.addEventListener('DOMContentLoaded', handleScrollAnimation);
document.querySelectorAll('.nav-button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    scrollToSectionSmooth(btn.getAttribute('href'));
  });
});

// Modal privacidad
const privacyModal = document.getElementById('privacyModal');
const privacyLink = document.getElementById('privacyLink');
const footerPrivacyLink = document.getElementById('footerPrivacyLink');
const closeModal = document.querySelector('.close-modal');

function openPrivacyModal() {
  privacyModal.style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function closePrivacyModal() {
  privacyModal.style.display = 'none';
  document.body.style.overflow = 'auto';
}
privacyLink.addEventListener('click', (e) => { e.preventDefault(); openPrivacyModal(); });
footerPrivacyLink.addEventListener('click', (e) => { e.preventDefault(); openPrivacyModal(); });
closeModal.addEventListener('click', closePrivacyModal);
window.addEventListener('click', (e) => { if (e.target === privacyModal) closePrivacyModal(); });

// Limpiar historial al cerrar
closeChat.addEventListener('click', () => {
  chatModal.classList.remove('active');
  chatMessages.innerHTML = '';
  chatHistory = [];
});
chatModal.addEventListener('click', (e) => {
  if (e.target === chatModal) {
    chatModal.classList.remove('active');
    chatMessages.innerHTML = '';
    chatHistory = [];
  }
});
