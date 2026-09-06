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

  // ── Sincronización de carruseles táctiles mobile ─────────────────
  function initMobileCarousel(containerSelector, chipSelector, dotSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    const chips = chipSelector ? document.querySelectorAll(chipSelector) : [];
    const dots = dotSelector ? document.querySelectorAll(dotSelector) : [];
    const cards = container.children;

    function updateActiveIndex(index) {
      chips.forEach((chip, i) => {
        const active = i === index;
        chip.classList.toggle('is-active', active);
        chip.setAttribute('aria-selected', String(active));
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
      });
    }

    const initialIndex = Number(container.dataset.initialIndex || 0);
    if (initialIndex && window.matchMedia('(max-width: 767px)').matches) {
      const selectInitialCard = () => {
        const card = cards[initialIndex];
        if (!card) return;
        const offset = card.getBoundingClientRect().left - container.getBoundingClientRect().left;
        container.scrollTo({ left: container.scrollLeft + offset - (container.clientWidth - card.offsetWidth) / 2, behavior: 'instant' });
        updateActiveIndex(initialIndex);
      };
      selectInitialCard();
    }

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const targetIdx = parseInt(chip.dataset.promoTarget || chip.dataset.storyTarget || '0', 10);
        if (cards[targetIdx]) {
          cards[targetIdx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          updateActiveIndex(targetIdx);
        }
      });
    });

    let scrollTimeout = null;
    container.addEventListener('scroll', () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollCenter = container.scrollLeft + container.clientWidth / 2;
        let closestIdx = 0;
        let minDiff = Infinity;
        Array.from(cards).forEach((card, i) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const diff = Math.abs(scrollCenter - cardCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = i;
          }
        });
        updateActiveIndex(closestIdx);
      }, 50);
    }, { passive: true });
  }

  initMobileCarousel('.promo-cards-grid', '.promo-chip', '.promo-dot');
  initMobileCarousel('.stories-grid', '.story-chip', '.story-dot');
  initMobileCarousel('.mosaic-grid', null, '.mosaic-dot');

  // ── Controlador Inteligente del Sticky CTA Mobile ────────────────
  const mobileStickyBar = document.querySelector('.whatsapp-mobile-bar');
  const heroSection = document.getElementById('inicio');
  const finalCtaSection = document.querySelector('.final-cta');
  const siteFooter = document.querySelector('.site-footer');
  const offerModal = document.getElementById('offer-dialog');

  // Elementos CTA principales que al ser visibles ocultan el sticky bar para no duplicar ni tapar
  const primaryCtas = document.querySelectorAll(
    '.hero-actions a, .director-cta a, .timeline-section a.button, .activities-section a.button, .promo-card a.button, .stories-section a.button, .faq-cta, .final-btn, .reviews-inline-strip'
  );

  function checkStickyBarVisibility() {
    if (!mobileStickyBar || window.innerWidth >= 768) return;

    // 1. Mostrar sólo tras haber superado el Hero
    const heroRect = heroSection ? heroSection.getBoundingClientRect() : null;
    const pastHero = heroRect ? heroRect.bottom < 120 : window.scrollY > 400;

    if (!pastHero) {
      mobileStickyBar.classList.remove('vivo-ready');
      mobileStickyBar.classList.add('is-collision-hidden');
      return;
    }

    // 2. Ocultar si el popup modal está abierto
    const isPopupOpen = offerModal?.open || document.body.classList.contains('is-offer-open');
    if (isPopupOpen) {
      mobileStickyBar.classList.add('is-collision-hidden');
      return;
    }

    // 3. Ocultar si el cierre final o el footer están visibles
    const viewportH = window.innerHeight;
    const finalRect = finalCtaSection ? finalCtaSection.getBoundingClientRect() : null;
    const footerRect = siteFooter ? siteFooter.getBoundingClientRect() : null;

    const inFinal = finalRect && finalRect.top < viewportH && finalRect.bottom > 0;
    const inFooter = footerRect && footerRect.top < viewportH && footerRect.bottom > 0;

    if (inFinal || inFooter) {
      mobileStickyBar.classList.add('is-collision-hidden');
      return;
    }

    // 4. Ocultar si algún CTA principal o strip de reseñas está en pantalla
    const isAnyPrimaryCtaVisible = Array.from(primaryCtas).some((btn) => {
      const rect = btn.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && rect.top < viewportH + 80 && rect.bottom > -20;
    });

    if (isAnyPrimaryCtaVisible) {
      mobileStickyBar.classList.add('is-collision-hidden');
      return;
    }

    // Si todo está libre, mostrar con elegancia
    mobileStickyBar.classList.add('vivo-ready');
    mobileStickyBar.classList.remove('is-collision-hidden');
  }

  let stickyTick = 0;
  function scheduleStickyCheck() {
    if (stickyTick) return;
    stickyTick = window.requestAnimationFrame(() => {
      stickyTick = 0;
      checkStickyBarVisibility();
    });
  }

  window.addEventListener('scroll', scheduleStickyCheck, { passive: true });
  window.addEventListener('resize', scheduleStickyCheck);
  window.addEventListener('load', scheduleStickyCheck);
  document.querySelectorAll('details').forEach((details) => {
    details.addEventListener('toggle', scheduleStickyCheck);
  });
  scheduleStickyCheck();

  // ── Popup Beneficio Exclusivo ("Hasta el próximo jueves") ──
  // Espera mínima de 44 s y señal de salida; una vez por sesión.
  const offerDialog = document.getElementById('offer-dialog');
  if (offerDialog) {
    const closeButton = offerDialog.querySelector('.offer-dialog-close');
    let triggerTimer = null;
    let eligible = false;
    let lastScrollY = window.scrollY;
    let upwardDistance = 0;
    let maxProgress = 0;
    const hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const cleanupTriggers = () => {
      if (triggerTimer) {
        clearTimeout(triggerTimer);
        triggerTimer = null;
      }
      window.removeEventListener('scroll', checkScrollTrigger);
      document.removeEventListener('mouseleave', checkExitIntent);
    };

    const openOffer = () => {
      cleanupTriggers();
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
      cleanupTriggers();
      sessionStorage.setItem('offer_dialog_dismissed', 'true');
      document.body.classList.remove('is-offer-open');
      if (offerDialog.open) {
        offerDialog.close();
      }
    };

    const checkScrollTrigger = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const maxScroll = (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight;
      const progress = maxScroll > 100 ? scrollY / maxScroll : 0;
      maxProgress = Math.max(maxProgress, progress);
      upwardDistance = scrollY < lastScrollY ? upwardDistance + lastScrollY - scrollY : 0;
      lastScrollY = scrollY;
      // En touch no hay salida detectable: regreso hacia arriba tras leer,
      // o final del recorrido, siempre después de la espera mínima.
      if (eligible && !hasMouse && (progress >= 0.9 || (maxProgress >= 0.5 && upwardDistance >= 140))) {
        openOffer();
      }
    };

    const checkExitIntent = (event) => {
      if (eligible && hasMouse && event.clientY <= 0 && !event.relatedTarget) openOffer();
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

    // El tiempo habilita los disparadores, no interrumpe por sí solo.
    if (!sessionStorage.getItem('offer_dialog_dismissed')) {
      triggerTimer = window.setTimeout(() => {
        eligible = true;
        upwardDistance = 0;
        checkScrollTrigger();
      }, 44000);
      window.addEventListener('scroll', checkScrollTrigger, { passive: true });
      document.addEventListener('mouseleave', checkExitIntent);
    }
  }

})();
