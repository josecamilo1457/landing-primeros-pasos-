(() => {
  window.dataLayer = window.dataLayer || [];
const MAKE_WEBHOOK = "https://hook.us2.make.com/742dgrpbco5isrihxjaunocmkq6hlig8";
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav');

  menuButton?.addEventListener('click', () => {
    const open = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  document.querySelectorAll('[data-year]').forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  document.querySelectorAll('[data-track]').forEach((element) => {
  element.addEventListener('click', async () => {

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'whatsapp_interview_request',
      placement: element.dataset.track
    });

    const payload = {
      whatsapp: element.href || "",
      gclid: localStorage.getItem("gclid"),
      utm_source: localStorage.getItem("utm_source"),
      utm_medium: localStorage.getItem("utm_medium"),
      utm_campaign: localStorage.getItem("utm_campaign"),
      utm_term: localStorage.getItem("utm_term"),
      utm_content: localStorage.getItem("utm_content"),
      boton: element.dataset.track,
      fecha: new Date().toISOString()
    };

    try {
      await fetch(MAKE_WEBHOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        keepalive: true
      });
    } catch (e) {
      console.error(e);
    }

  });
});

  // Spotlight que sigue al cursor en tarjetas de reseñas e historias reales.
  // Solo se activa con mouse/trackpad real (matchMedia hover:hover): en touch
  // no tiene sentido perseguir un dedo que ya está tapando la pantalla.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.review-card, .story-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mx', x + '%');
        card.style.setProperty('--my', y + '%');
      });
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
})();
