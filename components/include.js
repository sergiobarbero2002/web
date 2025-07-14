// Script simple para cargar header y footer
async function loadComponent(elementId, componentPath) {
  try {
    const response = await fetch(componentPath);
    const html = await response.text();
    document.getElementById(elementId).innerHTML = html;
    
    // Ajustar rutas después de cargar el componente
    adjustPaths(elementId);
    
    // Inicializar chat si se cargó el header
    if (elementId === 'header-placeholder') {
      setTimeout(() => {
        if (typeof initChatElements === 'function') {
          initChatElements();
        }
      }, 100);
    }
    
    // Notificar cuando el footer se haya cargado
    if (elementId === 'footer-placeholder') {
      console.log('🦶 Footer cargado, modal de privacidad disponible');
      // Disparar un evento personalizado para notificar que el footer está listo
      document.dispatchEvent(new CustomEvent('footerLoaded'));
    }
  } catch (error) {
    console.error('Error cargando componente:', error);
  }
}

// Función para ajustar rutas según la ubicación de la página
function adjustPaths(elementId) {
  const isDemoPage = window.location.pathname.includes('/demo/');
  const element = document.getElementById(elementId);
  
  if (!element) return;
  
  // Ajustar rutas de imágenes
  const images = element.querySelectorAll('img[src^="assets/"]');
  images.forEach(img => {
    if (isDemoPage) {
      img.src = img.src.replace('assets/', '../assets/');
    }
  });
  
  // Ajustar enlaces del header
  if (elementId === 'header-placeholder') {
    const links = element.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      if (isDemoPage) {
        // Corregir la construcción de la URL
        const section = link.href.substring(link.href.indexOf('#'));
        link.href = '../index.html' + section;
      }
    });
    
    // Ajustar enlace Demo
    const demoLink = element.querySelector('a[href="demo/index.html"]');
    if (demoLink) {
      demoLink.href = isDemoPage ? 'index.html' : 'demo/index.html';
    }
    
    // Ajustar enlace de chat del header
    const headerChatLink = element.querySelector('#headerChatLink');
    if (headerChatLink) {
      headerChatLink.href = '#';
    }
  }
  
  // Ajustar enlaces del footer
  if (elementId === 'footer-placeholder') {
    const links = element.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
      if (isDemoPage) {
        // Corregir la construcción de la URL
        const section = link.href.substring(link.href.indexOf('#'));
        link.href = '../index.html' + section;
      }
    });
    
    // Ajustar enlace Demo
    const demoLink = element.querySelector('a[href="demo/index.html"]');
    if (demoLink) {
      demoLink.href = isDemoPage ? 'index.html' : 'demo/index.html';
    }
    
    // Ajustar enlaces de chat y privacidad del footer
    const footerChatLink = element.querySelector('#footerChatLink');
    if (footerChatLink) {
      footerChatLink.href = '#';
    }
    
    const footerPrivacyLink = element.querySelector('#footerPrivacyLink');
    if (footerPrivacyLink) {
      footerPrivacyLink.href = '#';
    }
  }
}

// Inicializar partículas independientemente
function initParticles() {
  if (typeof particlesJS !== 'undefined') {
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
  }
}

// Cargar header y footer cuando la página esté lista
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar partículas inmediatamente
  initParticles();
  
  // Determinar la ruta base según la ubicación de la página
  const isDemoPage = window.location.pathname.includes('/demo/');
  const basePath = isDemoPage ? '../components/' : 'components/';
  
  // Cargar componentes
  loadComponent('header-placeholder', basePath + 'header.html');
  loadComponent('footer-placeholder', basePath + 'footer.html');
}); 