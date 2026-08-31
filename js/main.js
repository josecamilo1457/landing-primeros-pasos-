(() => {
  window.dataLayer = window.dataLayer || [];
  const MAKE_WEBHOOK = 'https://hook.us2.make.com/742dgrpbco5isrihxjaunocmkq6hlig8';

  // ── Genera ID corto de atribución con prefijo de canal (ej. "M-A7K3") ─
  function generateRefId() {
    const params = new URLSearchParams(window.location.search);
    const src    = (params.get('utm_source') || '').toLowerCase();
    let prefix;
    if (src === 'meta' || src === 'fb' || src === 'ig' || params.has('fbclid')) {
      prefix = 'M-';
    } else if (src === 'google' || params.has('gclid')) {
      prefix = 'G-';
    } else {
      prefix = 'D-';
    }
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // sin O,0,1,I
    let id = '';
    for (let i = 0; i < 4; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix + id;
  }

  // ── Añade "| Ref: XXXX" al final del parámetro `text` de una URL wa.me ─
  function buildWaUrlWithRef(href, refId) {
    try {
      const url = new URL(href);
      const originalText = url.searchParams.get('text') || '';
      url.searchParams.set('text', originalText + ' | Ref: ' + refId);
      return url.toString();
    } catch {
      return href; // fallback sin modificar si la URL fuera inválida
    }
  }

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
    element.addEventListener('click', (e) => {
      e.preventDefault();
      const placement = element.dataset.track;
      const refId = generateRefId();

      // 1. Abrir WhatsApp de inmediato (antes de cualquier async)
      const waUrlWithRef = buildWaUrlWithRef(element.href, refId);
      window.open(waUrlWithRef, '_blank', 'noopener,noreferrer');

      // 2. GTM dataLayer
      window.dataLayer.push({
        event: 'whatsapp_interview_request',
        placement
      });

      // 3. Meta Pixel — Lead (único disparo)
      if (typeof window.fbq === 'function') {
        window.fbq('track', 'Lead', { placement });
      }

      // 4. Webhook Make.com — fire-and-forget con keepalive
      fetch(MAKE_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: element.href || '',
          gclid: localStorage.getItem('gclid'),
          utm_source: localStorage.getItem('utm_source'),
          utm_medium: localStorage.getItem('utm_medium'),
          utm_campaign: localStorage.getItem('utm_campaign'),
          utm_term: localStorage.getItem('utm_term'),
          utm_content: localStorage.getItem('utm_content'),
          boton: placement,
          ref_id: refId,
          fecha: new Date().toISOString()
        }),
        keepalive: true
      }).catch(() => { /* fail silently en producción */ });
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

})();
