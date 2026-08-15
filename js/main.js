(() => {
  window.dataLayer = window.dataLayer || [];
  const MAKE_WEBHOOK = 'https://hook.us2.make.com/742dgrpbco5isrihxjaunocmkq6hlig8';

  // ── Menú hamburguesa ──────────────────────────────────────────────
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.nav');

  menuButton?.addEventListener('click', () => {
    const open = navigation.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  navigation?.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => {
      navigation.classList.remove('is-open');
      menuButton?.setAttribute('aria-expanded', 'false');
    })
  );

  // ── Año dinámico en footer ─────────────────────────────────────────
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  // ── Tracking de CTAs WhatsApp ──────────────────────────────────────
  // Un único disparo de fbq Lead por interacción.
  // (El listener del <head> que generaba el doble disparo fue eliminado.)
  document.querySelectorAll('[data-track]').forEach((element) => {
    element.addEventListener('click', async () => {
      const placement = element.dataset.track;

      // GTM dataLayer
      window.dataLayer.push({
        event: 'whatsapp_interview_request',
        placement
      });

      // Meta Pixel — Lead (único disparo)
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', { placement });
      }

      // Webhook Make.com
      const payload = {
        whatsapp: element.href || '',
        gclid: localStorage.getItem('gclid'),
        utm_source: localStorage.getItem('utm_source'),
        utm_medium: localStorage.getItem('utm_medium'),
        utm_campaign: localStorage.getItem('utm_campaign'),
        utm_term: localStorage.getItem('utm_term'),
        utm_content: localStorage.getItem('utm_content'),
        boton: placement,
        fecha: new Date().toISOString()
      };

      try {
        await fetch(MAKE_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        });
      } catch {
        // fail silently en producción
      }
    });
  });

  // ── Spotlight que sigue al cursor en tarjetas de prueba social ─────
  // Solo en dispositivos con mouse real (no en touch).
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.review-card, .story-card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height * 100) + '%');
      });
    });
  }

  // ── Reveal al hacer scroll ────────────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ── Modal de oferta ───────────────────────────────────────────────
  function openModal() {
    const modal = document.getElementById('promo-modal');
    if (!modal) return;
    modal.classList.add('is-visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    window.dataLayer.push({ event: 'banner_opened' });
  }

  function dismissModal() {
    const modal = document.getElementById('promo-modal');
    if (!modal) return;
    modal.classList.remove('is-visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    window.dataLayer.push({ event: 'banner_closed' });
  }

  // Cerrar con el botón ✕ y el overlay — event delegation sobre document
  document.addEventListener('click', (e) => {
    if (e.target.id === 'close-promo-modal') { dismissModal(); return; }
    if (e.target.id === 'promo-modal') { dismissModal(); return; }
  });

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('promo-modal');
      if (modal?.classList.contains('is-visible')) dismissModal();
    }
  });

  // ── Modal: abrir a los 20 s ──────────────────────────────────────────
  setTimeout(openModal, 20000);

  // ── Fechas dinámicas de la oferta ─────────────────────────────────────
  (function(){
    var m = new Date().getMonth();
    var reserva = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][m];
    var inicio = ['febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre','marzo'][m];
    var cap = function(s){ return s.charAt(0).toUpperCase() + s.slice(1); };
    function set(sel, txt){ var el = document.querySelector(sel); if (el) el.textContent = txt; }
    set('.modal-tag',      'Para familias que comienzan en ' + inicio);
    set('.modal-title',    'Una nueva etapa puede empezar en ' + inicio);
    set('.modal-price-sub','Reservando en ' + reserva + ' \u00b7 Sujeto a vacante');
    set('.modal-legal',    'Oferta v\u00e1lida para familias que reserven durante ' + reserva + ' y comiencen en ' + inicio + ', siempre que exista vacante disponible.');
    set('.oferta-eyebrow', 'Para familias que comienzan en ' + inicio);
    set('.oferta-periodo', cap(reserva) + ' \u2192 ' + cap(inicio));
    set('.oferta-microcopy','Reservando en ' + reserva + ' \u00b7 Sujeto a vacante disponible');
    set('.oferta-sub',     'Oferta v\u00e1lida para familias que reserven durante ' + reserva + ' y comiencen en ' + inicio + ', siempre que exista vacante disponible.');
  })();

})();
