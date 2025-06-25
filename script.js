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
const notificationSound = new Audio('assets/sounds/FX.mp3');
const clickSound = new Audio('assets/sounds/click.mp3');
const chatSound = new Audio('assets/sounds/chat.mp3');
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

// Project Gallery functionality
const projectGallery = document.getElementById('projectGallery');
const closeGallery = document.querySelector('.close-gallery');
const projectImage = document.getElementById('projectImage');
const projectTitle = document.getElementById('projectTitle');
const projectDescription = document.getElementById('projectDescription');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

// Datos de los servicios
const serviciosData = {
  'Recepcionista Digital: Mails Automatizados': {
    images: [
      { src: 'assets/images/ai-icon.png', text: 'Sistema de precios dinámicos que aumenta el RevPAR en un 9 % mediante análisis de demanda en tiempo real.' },
      { src: 'assets/images/ai-icon.png', text: 'Optimización automática de tarifas basada en ocupación, temporada y competencia.' },
      { src: 'assets/images/ai-icon.png', text: 'Predicción de demanda y ajuste proactivo de precios para maximizar ingresos.' }
    ]
  },
  'Recepcionista Digital: Whatsapp Automatizado': {
    images: [
      { src: 'assets/images/ai-icon.png', text: 'Recomendaciones personalizadas que aumentan las ventas adicionales en un 50 %.' },
      { src: 'assets/images/ai-icon.png', text: 'Análisis de preferencias de clientes para ofertas personalizadas de servicios premium.' },
      { src: 'assets/images/ai-icon.png', text: 'Sistema de fidelización automático con recompensas personalizadas.' }
    ]
  },
  'Recepcionista Digital: Ventas Complementarias Inteligentes': {
    images: [
      { src: 'assets/images/ai-icon.png', text: 'Personalización de la experiencia que aumenta la conversión en el canal directo en un 30 %.' },
      { src: 'assets/images/ai-icon.png', text: 'Optimización de la página web y proceso de reserva para maximizar conversiones.' },
      { src: 'assets/images/ai-icon.png', text: 'Sistema de retargeting inteligente para recuperar abandonos.' }
    ]
  },
  'Reportes Inteligentes': {
    images: [
      { src: 'assets/images/ai-icon.png', text: 'Reducción del 65 % en tareas manuales mediante automatización inteligente.' },
      { src: 'assets/images/ai-icon.png', text: 'Gestión automática de inventario, limpieza y mantenimiento.' },
      { src: 'assets/images/ai-icon.png', text: 'Optimización de recursos y personal basada en IA.' }
    ]
  }
};

let currentService = null;
let currentImageIndex = 0;

// Función para abrir la galería
function openGallery(serviceTitle) {
  currentService = serviceTitle;
  currentImageIndex = 0;
  updateGallery();
  projectGallery.classList.add('active');
  playClickSound();
}

// Función para actualizar la galería
function updateGallery() {
  const service = serviciosData[currentService];
  const imageData = service.images[currentImageIndex];
  
  projectTitle.textContent = currentService;
  projectImage.src = imageData.src;
  projectDescription.textContent = imageData.text;
  
  // Actualizar estado de los botones
  prevBtn.disabled = currentImageIndex === 0;
  nextBtn.disabled = currentImageIndex === service.images.length - 1;
}

// Función para mostrar imagen anterior
function showPrevImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    updateGallery();
    playClickSound();
  }
}

// Función para mostrar siguiente imagen
function showNextImage() {
  const service = serviciosData[currentService];
  if (currentImageIndex < service.images.length - 1) {
    currentImageIndex++;
    updateGallery();
    playClickSound();
  }
}

// Función para cerrar la galería
function closeProjectGallery() {
  projectGallery.classList.remove('active');
  playClickSound();
}

// Event listeners para los botones de navegación
prevBtn.addEventListener('click', showPrevImage);
nextBtn.addEventListener('click', showNextImage);

// Event listeners para las tarjetas de proyecto
document.querySelectorAll('.proyecto-card').forEach(card => {
  card.addEventListener('click', () => {
    const title = card.querySelector('h3').textContent;
    openGallery(title);
  });
});

// Event listener para cerrar la galería
closeGallery.addEventListener('click', closeProjectGallery);

// Cerrar galería al hacer clic fuera
projectGallery.addEventListener('click', (e) => {
  if (e.target === projectGallery) {
    closeProjectGallery();
  }
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (projectGallery.classList.contains('active')) {
    if (e.key === 'ArrowLeft') {
      showPrevImage();
    } else if (e.key === 'ArrowRight') {
      showNextImage();
    } else if (e.key === 'Escape') {
      closeProjectGallery();
    }
  }
});
