/**
 * NexaFlow Landing Page — script.js
 * Módulos: Navbar · Scroll Reveal · Formulario · Back to Top · Año
 */

'use strict';

/* ================================================================
   MÓDULO: Navbar
   - Clase "scrolled" al desplazar
   - Menú hamburguesa para móvil
   - Cierre automático al hacer clic en links
   ================================================================ */
const NavbarModule = (() => {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('[data-mobile-link]');

  // Aplica clase "scrolled" cuando el usuario baja más de 40px
  const handleScroll = () => {
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('scrolled', scrolled);
  };

  // Alterna el menú móvil
  const toggleMenu = () => {
    const isOpen = mobileMenu.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    // Bloquea scroll del body cuando el menú está abierto
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  // Cierra el menú móvil
  const closeMenu = () => {
    mobileMenu.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const init = () => {
    if (!navbar || !hamburger || !mobileMenu) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Estado inicial

    hamburger.addEventListener('click', toggleMenu);

    // Cierra al hacer clic en cualquier link del menú móvil
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

    // Cierra al pulsar Escape
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) closeMenu();
    });
  };

  return { init };
})();


/* ================================================================
   MÓDULO: Scroll Reveal
   - Usa IntersectionObserver para un rendimiento óptimo
   - Agrega clase "is-visible" cuando el elemento entra al viewport
   ================================================================ */
const RevealModule = (() => {
  const THRESHOLD = 0.15; // 15% del elemento visible para disparar

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Una vez revelado, dejamos de observarlo para mejor performance
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: THRESHOLD, rootMargin: '0px 0px -60px 0px' }
  );

  const init = () => {
    const elements = document.querySelectorAll('.reveal');
    elements.forEach(el => observer.observe(el));
  };

  return { init };
})();


/* ================================================================
   MÓDULO: Formulario de contacto
   - Validación en tiempo real
   - Estado de carga en el botón
   - Mensaje de éxito tras envío simulado
   ================================================================ */
const FormModule = (() => {

  // Reglas de validación para cada campo
  const RULES = {
    name: {
      validate: val => val.trim().length >= 2,
      message: 'El nombre debe tener al menos 2 caracteres.'
    },
    email: {
      validate: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()),
      message: 'Ingresa un email válido (ej: tu@empresa.com).'
    },
    message: {
      validate: val => val.trim().length >= 10,
      message: 'El mensaje debe tener al menos 10 caracteres.'
    }
  };

  /**
   * Valida un campo individual.
   * @param {HTMLElement} input
   * @returns {boolean}
   */
  const validateField = (input) => {
    const rule = RULES[input.name];
    if (!rule) return true; // Campo sin regla (ej: teléfono) siempre pasa

    const errorEl = document.getElementById(`${input.name}-error`);
    const isValid = rule.validate(input.value);

    input.classList.toggle('has-error', !isValid);

    if (errorEl) {
      errorEl.textContent = isValid ? '' : rule.message;
    }

    return isValid;
  };

  /**
   * Valida todos los campos requeridos del formulario.
   * @param {HTMLFormElement} form
   * @returns {boolean}
   */
  const validateAll = (form) => {
    const requiredInputs = form.querySelectorAll('[required]');
    let allValid = true;

    requiredInputs.forEach(input => {
      if (!validateField(input)) allValid = false;
    });

    return allValid;
  };

  /**
   * Simula una llamada a API (reemplazar con fetch real al backend).
   * @returns {Promise<void>}
   */
  const submitToAPI = () =>
    new Promise(resolve => setTimeout(resolve, 1800));

  const init = () => {
    const form      = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const successEl = document.getElementById('form-success');

    if (!form) return;

    // Validación en tiempo real al salir de cada campo
    form.querySelectorAll('[required]').forEach(input => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        // Limpia error mientras el usuario escribe (UX más amable)
        if (input.classList.contains('has-error')) validateField(input);
      });
    });

    // Envío del formulario
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Validar todo antes de enviar
      if (!validateAll(form)) return;

      // Estado de carga
      submitBtn.classList.add('btn--loading');
      submitBtn.querySelector('.btn-text').textContent = 'Enviando...';
      submitBtn.setAttribute('aria-busy', 'true');

      try {
        // 🔧 Aquí reemplaza con tu llamada real: fetch('/api/contact', { method: 'POST', body: new FormData(form) })
        await submitToAPI();

        // Éxito
        form.reset();
        form.style.display = 'none';
        successEl.hidden = false;

        // Scroll suave al mensaje de éxito
        successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

      } catch (err) {
        // Error: muestra mensaje genérico (en producción loggear el error)
        console.error('Error al enviar formulario:', err);
        alert('Hubo un error al enviar el mensaje. Por favor intenta de nuevo.');
      } finally {
        submitBtn.classList.remove('btn--loading');
        submitBtn.querySelector('.btn-text').textContent = 'Enviar mensaje';
        submitBtn.removeAttribute('aria-busy');
      }
    });
  };

  return { init };
})();


/* ================================================================
   MÓDULO: Back to Top
   - Aparece al bajar más de 400px
   - Scroll suave al tope de la página
   ================================================================ */
const BackToTopModule = (() => {
  const btn = document.getElementById('back-to-top');
  const THRESHOLD = 400;

  const handleScroll = () => {
    const shouldShow = window.scrollY > THRESHOLD;
    btn.hidden = !shouldShow;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const init = () => {
    if (!btn) return;
    window.addEventListener('scroll', handleScroll, { passive: true });
    btn.addEventListener('click', scrollToTop);
  };

  return { init };
})();


/* ================================================================
   MÓDULO: Año dinámico en footer
   ================================================================ */
const YearModule = (() => {
  const init = () => {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  };
  return { init };
})();


/* ================================================================
   MÓDULO: Scroll suave para anclas internas
   (fallback para navegadores sin soporte nativo de scroll-behavior CSS)
   ================================================================ */
const SmoothScrollModule = (() => {
  const handleClick = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#')) return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    const navbarH = document.getElementById('navbar')?.offsetHeight || 72;
    const targetY = target.getBoundingClientRect().top + window.scrollY - navbarH;

    window.scrollTo({ top: targetY, behavior: 'smooth' });
  };

  const init = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleClick);
    });
  };

  return { init };
})();


/* ================================================================
   MÓDULO: Animación de barras del mockup
   - Sutil animación de altura para dar vida al gráfico del hero
   ================================================================ */
const MockupModule = (() => {
  const randomize = () => {
    const bars = document.querySelectorAll('.mockup__chart span');
    bars.forEach(bar => {
      const h = Math.random() * 70 + 30; // Entre 30% y 100%
      bar.style.setProperty('--h', `${h.toFixed(0)}%`);
      bar.style.transition = 'height 0.6s ease';
    });
  };

  const init = () => {
    if (document.querySelector('.mockup__chart')) {
      setInterval(randomize, 3000);
    }
  };

  return { init };
})();


/* ================================================================
   INICIALIZACIÓN: Se ejecuta cuando el DOM está listo
   ================================================================ */
document.addEventListener('DOMContentLoaded', () => {
  NavbarModule.init();
  RevealModule.init();
  FormModule.init();
  BackToTopModule.init();
  YearModule.init();
  SmoothScrollModule.init();
  MockupModule.init();

  console.log('%c🚀 NexaFlow Landing Page cargada correctamente.', 'color: #00C6FF; font-weight: bold;');
});
