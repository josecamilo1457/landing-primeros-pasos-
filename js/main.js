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
  // 1ª Aparición: apertura AUTOMÁTICA a los 35 segundos (sin depender de exit-intent ni de scroll).
  // 2ª Aparición: únicamente si cerró la 1ª sin clic, al alcanzar 80% de scroll, y mínimo 60s después del primer cierre.
  // Reglas: máx 2 veces por sesión, no volver a mostrar si hizo clic en CTA o cualquier WhatsApp, persistir al recargar.
  const offerDialog = document.getElementById('offer-dialog');
  if (offerDialog) {
    const closeButton = offerDialog.querySelector('.offer-dialog-close');
    const offerCta = offerDialog.querySelector('.offer-dialog-cta');

    const STORAGE_KEY_PERMANENT = 'offer_dismissed_permanently';
    const STORAGE_KEY_COUNT     = 'offer_show_count';
    const STORAGE_KEY_CLOSED_AT = 'offer_first_closed_at';
    const STORAGE_KEY_START     = 'offer_session_start';
    const STORAGE_KEY_SCROLL    = 'offer_max_scroll';

    const getShowCount = () => parseInt(sessionStorage.getItem(STORAGE_KEY_COUNT) || '0', 10);
    const getSessionStart = () => {
      let start = parseInt(sessionStorage.getItem(STORAGE_KEY_START) || '0', 10);
      if (!start) {
        start = Date.now();
        sessionStorage.setItem(STORAGE_KEY_START, start.toString());
      }
      return start;
    };
    const getFirstClosedAt = () => parseInt(sessionStorage.getItem(STORAGE_KEY_CLOSED_AT) || '0', 10);

    const isPermanentlyDismissed = () => {
      const isPerm = sessionStorage.getItem(STORAGE_KEY_PERMANENT) === 'true';
      const isLegacyDismissed = sessionStorage.getItem('offer_dialog_dismissed') === 'true';
      return isPerm || isLegacyDismissed || getShowCount() >= 2;
    };

    const setPermanentlyDismissed = () => {
      sessionStorage.setItem(STORAGE_KEY_PERMANENT, 'true');
      sessionStorage.setItem('offer_dialog_dismissed', 'true');
      cleanupTriggers();
      if (offerDialog.open) {
        document.body.classList.remove('is-offer-open');
        offerDialog.close();
        scheduleStickyCheck?.();
      }
    };

    // No volver a mostrar si hace clic en el CTA del popup o en cualquier enlace de WhatsApp
    document.addEventListener('click', (e) => {
      const target = e.target.closest('a, button');
      if (!target) return;
      const href = target.getAttribute('href') || '';
      const track = target.getAttribute('data-track') || '';
      if (
        target === offerCta ||
        target.classList.contains('offer-dialog-cta') ||
        href.includes('wa.me') ||
        href.includes('whatsapp') ||
        track.startsWith('whatsapp_')
      ) {
        setPermanentlyDismissed();
      }
    }, true);

    // Inicializar inicio de sesión
    getSessionStart();

    let maxScrollReached = parseFloat(sessionStorage.getItem(STORAGE_KEY_SCROLL) || '0');
    let firstTimer = null;
    let secondTimer = null;

    const cleanupTriggers = () => {
      if (firstTimer) {
        clearTimeout(firstTimer);
        firstTimer = null;
      }
      if (secondTimer) {
        clearTimeout(secondTimer);
        secondTimer = null;
      }
      window.removeEventListener('scroll', handleScroll);
    };

    const getScrollRatio = () => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.offsetHeight,
        document.body.offsetHeight
      );
      const winHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const maxScroll = docHeight - winHeight;
      if (maxScroll <= 0) return 0;
      return Math.min(Math.max(scrollY / maxScroll, 0), 1);
    };

    const updateMaxScroll = () => {
      const current = getScrollRatio();
      if (current > maxScrollReached) {
        maxScrollReached = current;
        sessionStorage.setItem(STORAGE_KEY_SCROLL, maxScrollReached.toFixed(4));
      }
    };

    const openOffer = () => {
      if (isPermanentlyDismissed()) return;
      if (offerDialog.open) return;

      const newCount = getShowCount() + 1;
      sessionStorage.setItem(STORAGE_KEY_COUNT, newCount.toString());

      if (newCount >= 2) {
        sessionStorage.setItem(STORAGE_KEY_PERMANENT, 'true');
        sessionStorage.setItem('offer_dialog_dismissed', 'true');
      }

      cleanupTriggers();

      try {
        if (typeof offerDialog.showModal === 'function') {
          offerDialog.showModal();
        } else {
          offerDialog.setAttribute('open', '');
        }
        document.body.classList.add('is-offer-open');
        scheduleStickyCheck?.();
      } catch (err) {
        console.warn('No se pudo abrir el popup de oferta:', err);
      }
    };

    const closeOffer = (wasClicked = false) => {
      if (wasClicked) {
        setPermanentlyDismissed();
      } else {
        // Cerró la primera aparición sin hacer clic
        const count = getShowCount();
        if (count === 1 && !getFirstClosedAt()) {
          sessionStorage.setItem(STORAGE_KEY_CLOSED_AT, Date.now().toString());
          scheduleSecondAppearance();
        } else if (count >= 2) {
          setPermanentlyDismissed();
        }
      }

      document.body.classList.remove('is-offer-open');
      if (offerDialog.open) {
        offerDialog.close();
      }
      scheduleStickyCheck?.();
    };

    function checkSecondTrigger() {
      if (isPermanentlyDismissed() || getShowCount() !== 1) return;
      const closedAt = getFirstClosedAt();
      if (!closedAt) return;

      updateMaxScroll();

      const timeSinceFirstClose = Date.now() - closedAt;
      const timeReady = timeSinceFirstClose >= 60000;
      const scrollReady = maxScrollReached >= 0.80;

      if (timeReady && scrollReady) {
        openOffer();
      }
    }

    function handleScroll() {
      updateMaxScroll();
      if (getShowCount() === 1) {
        checkSecondTrigger();
      }
    }

    function scheduleFirstAppearance() {
      if (isPermanentlyDismissed() || getShowCount() > 0) return;
      const start = getSessionStart();
      const elapsed = Date.now() - start;
      const remainingTime = Math.max(0, 35000 - elapsed);

      if (firstTimer) clearTimeout(firstTimer);
      if (remainingTime === 0) {
        openOffer();
      } else {
        firstTimer = window.setTimeout(() => {
          firstTimer = null;
          openOffer();
        }, remainingTime);
      }
    }

    function scheduleSecondAppearance() {
      if (isPermanentlyDismissed() || getShowCount() !== 1 || !getFirstClosedAt()) return;
      const closedAt = getFirstClosedAt();
      const elapsed = Date.now() - closedAt;
      const remainingTime = Math.max(0, 60000 - elapsed);

      if (secondTimer) clearTimeout(secondTimer);
      secondTimer = window.setTimeout(() => {
        secondTimer = null;
        checkSecondTrigger();
      }, remainingTime);

      window.addEventListener('scroll', handleScroll, { passive: true });
      checkSecondTrigger();
    }

    closeButton?.addEventListener('click', () => closeOffer(false));

    offerDialog.addEventListener('click', (e) => {
      const rect = offerDialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX && e.clientX <= rect.width + rect.left
      );
      if (!isInDialog) {
        closeOffer(false);
      }
    });

    offerDialog.addEventListener('cancel', () => {
      closeOffer(false);
    });

    // Iniciar según el estado de la sesión
    window.addEventListener('scroll', updateMaxScroll, { passive: true });
    updateMaxScroll();

    if (!isPermanentlyDismissed()) {
      if (getShowCount() === 0) {
        scheduleFirstAppearance();
      } else if (getShowCount() === 1 && getFirstClosedAt()) {
        scheduleSecondAppearance();
      }
    }
  }

})();
