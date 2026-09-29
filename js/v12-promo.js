(() => {
  const banner = document.getElementById('promo-banner');
  const backdrop = document.getElementById('promo-backdrop');
  const closeButton = banner?.querySelector('.promo-banner__close');
  const storageKey = 'pp_october_promo_seen_2026';
  const minimumDelayMs = 30000;
  const engagementScrollRatio = 0.45;
  let minimumDelayReached = false;
  let previousFocus = null;
  const offerName = 'octubre_blois_95000';

  if (!banner || !backdrop || !closeButton) return;

  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Argentina/Buenos_Aires', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const date = Object.fromEntries(dateParts.map(({ type, value }) => [type, value]));
  const monthIsCurrent = Number(`${date.year}${date.month}${date.day}`) <= 20261031;
  const offerAvailable = monthIsCurrent && window.PRIMEROS_PASOS_CONFIG?.octoberOfferAvailable !== false;
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

  // La vigencia de cada semana cierra el jueves a las 23:59:59, hora argentina.
  // El viernes se inicia una nueva semana, siempre sujeta a la disponibilidad real.
  function remainingWeeklySeconds(now = new Date()) {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(now).map(({ type, value }) => [type, value]));
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    const daysToThursday = (4 - day + 7) % 7;
    return daysToThursday * 86400 + (23 - Number(parts.hour)) * 3600 +
      (59 - Number(parts.minute)) * 60 + 59 - Number(parts.second);
  }

  function updateCountdown() {
    if (!offerAvailable) return;
    let remaining = remainingWeeklySeconds();
    const values = [
      ['[data-count-days]', Math.floor(remaining / 86400)]
    ];
    remaining %= 86400;
    values.push(['[data-count-hours]', Math.floor(remaining / 3600)]);
    remaining %= 3600;
    values.push(['[data-count-minutes]', Math.floor(remaining / 60)]);
    values.push(['[data-count-seconds]', remaining % 60]);
    values.forEach(([selector, value]) => {
      const element = banner.querySelector(selector);
      if (element) element.textContent = String(value).padStart(2, '0');
    });
  }

  updateCountdown();
  if (offerAvailable) window.setInterval(updateCountdown, 1000);

  function stopTriggerListeners() {
    window.removeEventListener('scroll', maybeShowAfterEngagement);
  }

  function showPromo() {
    if (!offerAvailable || sessionStorage.getItem(storageKey) || sessionStorage.getItem('pp_october_whatsapp_clicked')) return;
    stopTriggerListeners();
    sessionStorage.setItem(storageKey, '1');
    previousFocus = document.activeElement;
    banner.hidden = false;
    backdrop.hidden = false;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'landing_offer_view', offer: offerName, placement: 'popup_octubre' });
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
    banner.classList.remove('is-visible');
    backdrop.classList.remove('is-visible');
    window.dataLayer.push({ event: 'landing_offer_close', offer: offerName, placement: 'popup_octubre' });
    window.setTimeout(() => {
      banner.hidden = true;
      backdrop.hidden = true;
      previousFocus?.focus?.({ preventScroll: true });
    }, 280);
  }

  closeButton.addEventListener('click', closePromo);
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
    remainingWeeklySeconds
  };
})();
