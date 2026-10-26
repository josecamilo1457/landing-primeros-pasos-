(() => {
  window.dataLayer = window.dataLayer || [];
  const ATTRIBUTION_WEBHOOK = 'https://primeros-pasos-notifier.primeros-pasos-notifier.workers.dev/landing-click';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Genera ID corto de atribución con prefijo de canal (ej. "M-A7K3") ─
  function generateRefId() {
    const params = new URLSearchParams(window.location.search);
    const currentSource = (params.get('utm_source') || '').toLowerCase();
    const storedSource = (localStorage.getItem('utm_source') || '').toLowerCase();
    const metaSources = new Set(['meta', 'fb', 'ig', 'an', 'th', 'facebook', 'instagram', 'threads', 'messenger']);
    const sourcePrefix = (source) => metaSources.has(source) ? 'M-' : source === 'google' ? 'G-' : 'D-';
    let prefix;
    // Los datos del clic actual tienen prioridad sobre una visita anterior.
    if (currentSource === 'google' || metaSources.has(currentSource)) {
      prefix = sourcePrefix(currentSource);
    } else if (params.has('gclid')) {
      prefix = 'G-';
    } else if (params.has('fbclid')) {
      prefix = 'M-';
    } else if (currentSource) {
      prefix = 'D-';
    } else if (storedSource) {
      prefix = sourcePrefix(storedSource);
    } else if (localStorage.getItem('gclid')) {
      prefix = 'G-';
    } else if (localStorage.getItem('fbclid')) {
      prefix = 'M-';
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

  function getCookie(name) {
    const prefix = `${name}=`;
    return String(document.cookie || '').split(';').map((part) => part.trim()).find((part) => part.startsWith(prefix))?.slice(prefix.length) || null;
  }

  // ── Indicador de progreso de lectura y header sticky ────────────────
  const progress = document.querySelector('.progress span');
  const header = document.querySelector('.header');
  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const ratio = max > 0 ? doc.scrollTop / max : 0;
    if (progress) progress.style.width = `${Math.min(1, Math.max(0, ratio)) * 100}%`;
    header?.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ── Reveal al hacer scroll ────────────────────────────────────────
  if (!reducedMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  }

  // ── Tracking de CTAs WhatsApp (clic + atribución first-party + GTM + Ref ID) ─
  document.querySelectorAll('[data-track]').forEach((element) => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      const placement = element.dataset.track;
      sessionStorage.setItem('pp_nov_dic_whatsapp_clicked', '1');
      const refId = generateRefId();

      // 1. Abrir WhatsApp de inmediato (antes de cualquier llamada asíncrona)
      const waUrlWithRef = buildWaUrlWithRef(element.href, refId);
      window.open(waUrlWithRef, '_blank', 'noopener,noreferrer');

      // 2. GTM dataLayer
      window.dataLayer.push({
        event: 'whatsapp_interview_request',
        signal_type: 'click',
        page_variant: 'v12-visita',
        placement,
        ref_id: refId
      });
      if (['promo_empezar_ahora', 'oferta_empezar_ahora', 'cierre'].includes(placement)) {
        window.dataLayer.push({ event: 'landing_offer_click', offer: 'nov_dic_95000', placement, ref_id: refId });
      }

      // 3. Meta Pixel — señal intermedia. Lead queda reservado para un
      // mensaje real confirmado server-side por Tita/Sniper/CAPI.
      if (typeof window.fbq === 'function') {
        window.fbq('trackCustom', 'WhatsAppClick', {
          placement,
          ref_id: refId,
          page_variant: 'v12-visita'
        });
      }

      // 4. Webhook first-party de atribución — fire-and-forget con keepalive
      fetch(ATTRIBUTION_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatsapp: element.href || '',
          whatsapp_with_ref: waUrlWithRef,
          event_type: 'whatsapp_click',
          fbc: getCookie('_fbc'),
          fbp: getCookie('_fbp'),
          click_epoch_ms: Number(localStorage.getItem('attribution_timestamp_ms')) || Date.now(),
          gclid: localStorage.getItem('gclid'),
          fbclid: localStorage.getItem('fbclid'),
          utm_source: localStorage.getItem('utm_source'),
          utm_medium: localStorage.getItem('utm_medium'),
          utm_campaign: localStorage.getItem('utm_campaign'),
          utm_term: localStorage.getItem('utm_term'),
          utm_content: localStorage.getItem('utm_content'),
          ad_placement: localStorage.getItem('ad_placement'),
          boton: placement,
          ref_id: refId,
          page_variant: 'v12-visita',
          fecha: new Date().toISOString()
        }),
        keepalive: true
      }).catch(() => { /* fail silently en producción */ });
    });
  });

  // ── Tracking de exposición de secciones clave en dataLayer ─────────
  ['como-funciona', 'familias', 'entrevista', 'cierre'].forEach((id) => {
    const section = document.getElementById(id);
    if (!section || !('IntersectionObserver' in window)) return;
    const seen = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.dataLayer.push({
            event: 'landing_section_view',
            page_variant: 'v12-visita',
            section: id
          });
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });
    seen.observe(section);
  });

  // Exponer utilidades para tests/QA si window.__PP_QA está activo
  window.__PP_TRACKING = {
    generateRefId,
    buildWaUrlWithRef,
    ATTRIBUTION_WEBHOOK
  };
})();
