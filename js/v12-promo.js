(() => {
  const banner = document.getElementById('promo-banner');
  const backdrop = document.getElementById('promo-backdrop');
  const closeButton = banner?.querySelector('.promo-banner__close');
  const storageKey = 'pp_october_promo_seen_2026';
  const minimumDelayMs = 20000;
  const engagementScrollRatio = 0.40;
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
    triggerConfig: { minimumDelayMs, engagementScrollRatio }
  };
})();
