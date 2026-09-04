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

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !navigation?.classList.contains('is-open')) return;
    navigation.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.focus();
  });

  // En mobile, la propuesta se presenta por capítulos. El contenido
  // completo sigue disponible desde cada resumen nativo de details.
  if (window.matchMedia('(max-width: 767px)').matches) {
    document.querySelectorAll('.learning-chapters details').forEach((details) => {
      details.open = false;
    });
  }

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
          fbclid: localStorage.getItem('fbclid'),
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

  // ── Evita que los CTA flotantes tapen controles interactivos ─────
  const floatingCtas = document.querySelectorAll('.whatsapp-float, .whatsapp-mobile-bar');
  const collisionTargets = document.querySelectorAll(
    'main a, main button, main summary, main input, main select, main textarea, main [role="button"]'
  );

  if (floatingCtas.length && collisionTargets.length) {
    const rectsIntersect = (a, b) => (
      a.left < b.right &&
      a.right > b.left &&
      a.top < b.bottom &&
      a.bottom > b.top
    );

    const updateFloatingCtas = () => {
      floatingCtas.forEach((floatingCta) => {
        if (window.getComputedStyle(floatingCta).display === 'none') return;

        const floatingRect = floatingCta.getBoundingClientRect();
        const collides = Array.from(collisionTargets).some((target) => {
          const targetStyle = window.getComputedStyle(target);
          if (targetStyle.display === 'none' || targetStyle.visibility === 'hidden') return false;

          const targetRect = target.getBoundingClientRect();
          const isVisible = (
            targetRect.width > 0 &&
            targetRect.height > 0 &&
            targetRect.bottom > 0 &&
            targetRect.top < window.innerHeight
          );

          return isVisible && rectsIntersect(floatingRect, targetRect);
        });

        floatingCta.classList.toggle('is-collision-hidden', collides);
      });
    };

    let collisionFrame = 0;
    const scheduleCollisionCheck = () => {
      if (collisionFrame) return;
      collisionFrame = window.requestAnimationFrame(() => {
        collisionFrame = 0;
        updateFloatingCtas();
      });
    };

    window.addEventListener('scroll', scheduleCollisionCheck, { passive: true });
    window.addEventListener('resize', scheduleCollisionCheck);
    window.addEventListener('load', scheduleCollisionCheck);
    document.querySelectorAll('details').forEach((details) => {
      details.addEventListener('toggle', scheduleCollisionCheck);
    });
    document.fonts?.ready.then(scheduleCollisionCheck);

    if (typeof ResizeObserver === 'function') {
      const collisionResizeObserver = new ResizeObserver(scheduleCollisionCheck);
      collisionResizeObserver.observe(document.body);
    }

    scheduleCollisionCheck();
  }

  // ── Popup de 20 segundos (Beneficio Exclusivo "Hasta el próximo jueves") ──
  const offerDialog = document.getElementById('offer-dialog');
  if (offerDialog) {
    const closeButton = offerDialog.querySelector('.offer-dialog-close');

    const openOffer = () => {
      if (offerDialog.open) return;
      if (sessionStorage.getItem('offer_dialog_dismissed')) return;
      try {
        if (typeof offerDialog.showModal === 'function') {
          offerDialog.showModal();
        } else {
          offerDialog.setAttribute('open', '');
        }
        document.body.classList.add('is-offer-open');
      } catch (err) {
        console.warn('No se pudo abrir el popup de oferta:', err);
      }
    };

    const closeOffer = () => {
      sessionStorage.setItem('offer_dialog_dismissed', 'true');
      document.body.classList.remove('is-offer-open');
      if (offerDialog.open) {
        offerDialog.close();
      }
    };

    closeButton?.addEventListener('click', closeOffer);

    offerDialog.addEventListener('click', (e) => {
      const rect = offerDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeOffer();
      }
    });

    offerDialog.addEventListener('cancel', () => {
      closeOffer();
    });

    // Disparar a los 35 segundos de sesión para permitir explorar primero la web
    if (!sessionStorage.getItem('offer_dialog_dismissed')) {
      window.setTimeout(openOffer, 35000);
    }
  }

})();
