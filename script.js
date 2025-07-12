// Chat variables - se inicializarán después de cargar los componentes
let chatButton, chatBubble, chatModal, closeChat, chatMessages, chatInput, sendButton;

// Función para inicializar elementos del chat
function initChatElements() {
  chatButton = document.getElementById('chatButton');
  chatBubble = document.getElementById('chatBubble');
  chatModal = document.getElementById('chatModal');
  closeChat = document.getElementById('closeChat');
  chatMessages = document.getElementById('chatMessages');
  chatInput = document.getElementById('chatInput');
  sendButton = document.getElementById('sendMessage');
  
  if (chatButton && chatBubble && chatModal && closeChat && chatMessages && chatInput && sendButton) {
    setupChatEvents();
  }
}

// Sounds
const notificationSound = new Audio('assets/sounds/FX.mp3');
const clickSound = new Audio('assets/sounds/click.mp3');
const chatSound = new Audio('assets/sounds/chat.mp3');
notificationSound.volume = 0.5;
clickSound.volume = 0.3;

function playClickSound() {
  clickSound.currentTime = 0;
  clickSound.play().catch(() => {});
}

// Función para configurar eventos del chat
function setupChatEvents() {
  // Eventos de click en elementos interactivos
  document.querySelectorAll('a, button, .nav-button, .social-link, .proyecto-card')
    .forEach(el => el.addEventListener('click', playClickSound));

  // Mostrar burbuja de chat después de 3 segundos
  setTimeout(() => {
    if (chatBubble) {
      chatBubble.classList.add('visible');
      notificationSound.play().catch(() => {});
    }
  }, 3000);

  // Ocultar burbuja al hacer click fuera
  document.addEventListener('click', (e) => {
    if (chatButton && chatBubble && !chatButton.contains(e.target) && !chatBubble.contains(e.target)) {
      chatBubble.classList.remove('visible');
    }
  });

  // Eventos del chat
  chatButton.addEventListener('click', openChatModal);
  chatModal.addEventListener('click', (e) => {
    if (e.target === chatModal) chatModal.classList.remove('active');
  });
  closeChat.addEventListener('click', () => chatModal.classList.remove('active'));
  
  // Eventos de envío de mensajes
  sendButton.addEventListener('click', handleChatSubmit);
  chatInput.addEventListener('keypress', (e) => { 
    if (e.key === 'Enter') handleChatSubmit(); 
  });
}

function openChatModal() {
  if (chatModal && chatBubble && chatInput) {
    chatModal.classList.add('active');
    chatBubble.classList.remove('visible');
    chatInput.focus();
  }
}

// Smooth scroll
function scrollToSectionSmooth(id) {
  const section = document.querySelector(id);
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Las partículas se inicializan desde components/include.js

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
    console.log("📤 Enviando a OpenAI - Mensaje actual:", message);
    console.log("📤 Enviando a OpenAI - Historial actual:", chatHistory.length, "mensajes");
    if (chatHistory.length > 0) {
      chatHistory.forEach((msg, index) => {
        console.log(`  ${index + 1}. [${msg.role}]: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`);
      });
    }
    
    const res = await fetch('/.netlify/functions/chatGPT', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message,
        chatHistory: chatHistory 
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
  if (!chatInput || !sendButton) return;
  
  const message = chatInput.value.trim();
  if (!message) return;
  chatInput.disabled = true;
  sendButton.disabled = true;
  sendButton.textContent = 'Enviando...';
  addMessage(message, true);
  chatInput.value = '';
  
  const reply = await sendToChatGPT(message);
  
  // Agregar tanto el mensaje del usuario como la respuesta al historial
  chatHistory.push({ role: 'user', content: message });
  chatHistory.push({ role: 'assistant', content: reply });
  addMessage(reply);
  
  chatInput.disabled = false;
  sendButton.disabled = false;
  sendButton.textContent = 'Enviar';
  chatInput.focus();
}

// Los eventos del chat se configuran en setupChatEvents()

// Contact form submission → via Netlify function
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submitBtn');
  const status = document.getElementById('formStatus');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

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

// Funcionalidad eliminada - ya no hay galería de proyectos
