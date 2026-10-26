(() => {
  const banner = document.getElementById('promo-banner');
  const backdrop = document.getElementById('promo-backdrop');
  const closeButton = banner?.querySelector('.promo-banner__close');
  const ribbon = document.getElementById('weekly-ribbon');
  const ribbonOpen = ribbon?.querySelector('[data-open-promo]');
  const storageKey = 'pp_nov_dic_promo_seen_2026';
  const minimumDelayMs = 30000;
  const engagementScrollRatio = 0.45;
  let minimumDelayReached = false;
  let previousFocus = null;
  let previousBodyOverflow = '';
  const offerName = 'nov_dic_95000';

  if (!banner || !backdrop || !closeButton) return;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires',
    weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
  });
  function localParts(now = new Date()) {
    return Object.fromEntries(formatter.formatToParts(now).map(({ type, value }) => [type, value]));
  }
  function currentArgentinaDate(now = new Date()) {
    const local = localParts(now);
    return Number(`${local.year}${local.month}${local.day}`);
  }
  // Ventana de ingreso noviembre/diciembre; desactivar si se agotan vacantes.
  function isOfferAvailable(now = new Date()) {
    const date = currentArgentinaDate(now);
    return date >= 20261025 && date <= 20261231 &&
      window.PRIMEROS_PASOS_CONFIG?.novDecOfferAvailable !== false;
  }
  const offerAvailable = isOfferAvailable();
  // Jueves 23:59:59 en Buenos Aires (UTC-03); reinicia los viernes.
  // El reinicio no implica más vacantes: disponibilidad real en entrevista.
  function remainingWeeklySeconds(now = new Date()) {
    const local = localParts(now);
    const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(local.weekday);
    const daysUntilThursday = (4 - day + 7) % 7;
    const endUtc = Date.UTC(
      Number(local.year), Number(local.month) - 1,
      Number(local.day) + daysUntilThursday, 26, 59, 59
    );
    return Math.max(0, Math.floor((endUtc - now.getTime()) / 1000));
  }
  function updateCountdown(now = new Date()) {
    if (!isOfferAvailable(now)) {
      if (ribbon) ribbon.hidden = true;
      if (!banner.hidden) closePromo();
      return;
    }
    let seconds = remainingWeeklySeconds(now);
    const values = [
      ['[data-count-days]', Math.floor(seconds / 86400)]
    ];
    seconds %= 86400;
    values.push(['[data-count-hours]', Math.floor(seconds / 3600)]);
    seconds %= 3600;
    values.push(['[data-count-minutes]', Math.floor(seconds / 60)]);
    values.push(['[data-count-seconds]', seconds % 60]);
    for (const [selector, value] of values) {
      const element = banner.querySelector(selector);
      if (element) element.textContent = String(value).padStart(2, '0');
    }
  }
  if (ribbon) ribbon.hidden = !offerAvailable;
  if (!offerAvailable) {
    document.querySelector('.hero-urgency')?.remove();
    document.querySelector('.entry-offer')?.remove();
    document.querySelector('.closing__offer')?.remove();
    const closingCta = document.querySelector('.closing [data-track="cierre"]');
    if (closingCta) {
      closingCta.textContent = 'Quiero conocer el jardín';
      closingCta.href = 'https://wa.me/5491130011050?text=Hola%2C%20quiero%20conocer%20Primeros%20Pasos%20con%20mi%20peque%20y%20coordinar%20una%20visita.';
    }
  }

  function stopTriggerListeners() {
    window.removeEventListener('scroll', maybeShowAfterEngagement);
  }

  function showPromo(manuallyRequested = false) {
    if (!isOfferAvailable() || (!manuallyRequested &&
      (sessionStorage.getItem(storageKey) || sessionStorage.getItem('pp_nov_dic_whatsapp_clicked')))) return;
    stopTriggerListeners();
    sessionStorage.setItem(storageKey, '1');
    previousFocus = document.activeElement;
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    banner.hidden = false;
    backdrop.hidden = false;
    updateCountdown();
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'landing_offer_view', offer: offerName, placement: 'popup_nov_dic' });
    requestAnimationFrame(() => {
      banner.classList.add('is-visible');
      backdrop.classList.add('is-visible');
      closeButton.focus({ preventScroll: true });
    });
  }

  function scrollProgress() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollableHeight <= 0) return 1;
    return Math.min(1, window.scrollY / scrollableHeight);
  }

  function maybeShowAfterEngagement() {
    if (minimumDelayReached && scrollProgress() >= engagementScrollRatio) showPromo();
  }

  function closePromo() {
    if (banner.hidden) return;
    banner.classList.remove('is-visible');
    backdrop.classList.remove('is-visible');
    document.body.style.overflow = previousBodyOverflow;
    window.dataLayer.push({ event: 'landing_offer_close', offer: offerName, placement: 'popup_nov_dic' });
    window.setTimeout(() => {
      banner.hidden = true;
      backdrop.hidden = true;
      previousFocus?.focus?.({ preventScroll: true });
    }, 280);
  }

  closeButton.addEventListener('click', closePromo);
  ribbonOpen?.addEventListener('click', () => showPromo(true));
  backdrop.addEventListener('click', closePromo);
  document.addEventListener('keydown', (event) => {
    if (banner.hidden) return;
    if (event.key === 'Escape') closePromo();
    if (event.key === 'Tab') {
      const first = closeButton;
      const last = banner.querySelector('.promo-banner__cta');
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  banner.querySelector('.promo-banner__cta')?.addEventListener('click', closePromo);

  if (offerAvailable) {
    updateCountdown();
    window.setInterval(updateCountdown, 1000);
    window.addEventListener('scroll', maybeShowAfterEngagement, { passive: true });
    window.setTimeout(() => {
      minimumDelayReached = true;
      maybeShowAfterEngagement();
    }, minimumDelayMs);
  }

  window.__PP_PROMO = {
    showPromo,
    closePromo,
    triggerConfig: { minimumDelayMs, engagementScrollRatio },
    offerAvailable,
    remainingWeeklySeconds,
    isOfferAvailable,
    updateCountdown
  };
})();
