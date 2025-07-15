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
    
    // Añadir efecto de pulso al botón
    if (chatButton) {
      chatButton.classList.add('pulse');
      setTimeout(() => {
        chatButton.classList.remove('pulse');
      }, 1000);
    }
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
  
  // Mostrar indicador de escritura
  showTypingIndicator();
  
  const reply = await sendToChatGPT(message);
  
  // Ocultar indicador de escritura
  hideTypingIndicator();
  
  // Agregar tanto el mensaje del usuario como la respuesta al historial
  chatHistory.push({ role: 'user', content: message });
  chatHistory.push({ role: 'assistant', content: reply });
  addMessage(reply);
  
  chatInput.disabled = false;
  sendButton.disabled = false;
  sendButton.textContent = 'Enviar';
  chatInput.focus();
}

function showTypingIndicator() {
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'typing-indicator';
  typingIndicator.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
  `;
  chatMessages.appendChild(typingIndicator);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
  const typingIndicator = chatMessages.querySelector('.typing-indicator');
  if (typingIndicator) {
    typingIndicator.remove();
  }
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

// Modal privacidad - inicialización diferida
function initPrivacyModal() {
  const privacyModal = document.getElementById('privacyModal');
  const privacyLink = document.getElementById('privacyLink');
  const footerPrivacyLink = document.getElementById('footerPrivacyLink');
  const closeModal = document.querySelector('.close-modal');

  if (!privacyModal || !privacyLink || !footerPrivacyLink || !closeModal) {
    // Si no están disponibles, reintentar en 100ms
    setTimeout(initPrivacyModal, 100);
    return;
  }

  function openPrivacyModal() {
    privacyModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
  
  function closePrivacyModal() {
    privacyModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  privacyLink.addEventListener('click', (e) => { 
    e.preventDefault(); 
    openPrivacyModal(); 
  });
  
  footerPrivacyLink.addEventListener('click', (e) => { 
    e.preventDefault(); 
    openPrivacyModal(); 
  });
  
  closeModal.addEventListener('click', closePrivacyModal);
  window.addEventListener('click', (e) => { 
    if (e.target === privacyModal) {
      closePrivacyModal(); 
    }
  });
}

// Inicializar modal de privacidad cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initPrivacyModal, 500);
});

// IntersectionObserver para animaciones de scroll
function initIntersectionObserver() {
  // Opciones del observer
  const observerOptions = {
    root: null, // viewport
    rootMargin: '0px 0px -50px 0px', // trigger cuando el elemento esté 50px antes del viewport
    threshold: 0.1 // trigger cuando al menos 10% del elemento sea visible
  };

  // Callback del observer
  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Añadir clase de animación cuando el elemento entre en el viewport
        entry.target.classList.add('animate-in');
        
        // Opcional: dejar de observar después de la primera animación
        observer.unobserve(entry.target);
      }
    });
  };

  // Crear el observer
  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Elementos a observar
  const sectionsToAnimate = [
    '.hero',
    '.seccion',
    '.section-header',
    '.about-content',
    '.about-features',
    '.feature-item',
    '.proyectos-carousel',
    '.proyecto-card',
    '.contact-container',
    '.contact-form-section',
    '.calendly-section',
    '.demo-section'
  ];

  // Observar cada tipo de elemento
  sectionsToAnimate.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      // Añadir clase inicial para el estado oculto
      element.classList.add('scroll-animate');
      observer.observe(element);
    });
  });

  // Animación especial para feature items con delay escalonado
  const featureItems = document.querySelectorAll('.feature-item');
  featureItems.forEach((item, index) => {
    item.style.animationDelay = `${index * 0.1}s`;
  });

  // Animación especial para proyecto cards con delay escalonado
  const proyectoCards = document.querySelectorAll('.proyecto-card');
  proyectoCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.15}s`;
  });
}

// Inicializar IntersectionObserver cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initIntersectionObserver();
});

// También inicializar cuando se carguen componentes dinámicos
window.addEventListener('load', () => {
  setTimeout(initIntersectionObserver, 100);
});

// También intentar inicializar después de un tiempo adicional por si acaso
setTimeout(() => {
  initPrivacyModal();
}, 2000);

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

// ===== SLIDESHOW ULTRA SIMPLE =====

// Función para inicializar el slideshow
function initSlideshow() {
  console.log('🎠 Iniciando slideshow...');
  
  // Buscar elementos
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.querySelector('.slideshow-prev');
  const nextBtn = document.querySelector('.slideshow-next');
  
  console.log('🎠 Elementos encontrados:', {
    slides: slides.length,
    prevBtn: !!prevBtn,
    nextBtn: !!nextBtn
  });
  
  // Verificar que todos los elementos existan
  if (slides.length === 0) {
    console.log('🎠 No hay slides');
    return false;
  }
  
  if (!prevBtn || !nextBtn) {
    console.log('🎠 No se encontraron los botones de navegación');
    return false;
  }
  
  let currentSlide = 0;
  const totalSlides = slides.length;
  
  // Función para cambiar slide
  function changeSlide(index) {
    console.log('🎠 Cambiando a slide:', index);
    
    // Ocultar todos
    for (let i = 0; i < slides.length; i++) {
      slides[i].classList.remove('active');
    }
    
    // Mostrar el actual
    slides[index].classList.add('active');
    
    currentSlide = index;
  }
  
  // Evento para flecha izquierda
  prevBtn.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('🎠 Click en flecha izquierda');
    const prevIndex = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
    changeSlide(prevIndex);
  });
  
  // Evento para flecha derecha
  nextBtn.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('🎠 Click en flecha derecha');
    const nextIndex = (currentSlide + 1) % totalSlides;
    changeSlide(nextIndex);
  });
  
  // Mostrar primer slide
  changeSlide(0);
  
  console.log('🎠 Slideshow listo');
  return true;
}

// Intentar inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  console.log('🎠 DOM cargado, intentando inicializar slideshow...');
  if (!initSlideshow()) {
    // Si falla, intentar de nuevo después de un tiempo
    setTimeout(function() {
      console.log('🎠 Reintentando inicialización...');
      initSlideshow();
    }, 500);
  }
});

// También intentar cuando la página esté completamente cargada
window.addEventListener('load', function() {
  console.log('🎠 Página cargada, intentando inicializar slideshow...');
  if (!initSlideshow()) {
    // Si falla, intentar de nuevo después de un tiempo
    setTimeout(function() {
      console.log('🎠 Reintentando inicialización...');
      initSlideshow();
    }, 1000);
  }
});

// Inicialización de emergencia después de 2 segundos
setTimeout(function() {
  console.log('🎠 Inicialización de emergencia...');
  initSlideshow();
}, 2000);
