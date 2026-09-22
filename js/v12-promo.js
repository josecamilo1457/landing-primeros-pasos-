(() => {
  const banner = document.getElementById('promo-banner');
  const backdrop = document.getElementById('promo-backdrop');
  const closeButton = banner?.querySelector('.promo-banner__close');
  const storageKey = 'pp_v12_promo_uniforme_seen';
  let countdownTimer;
  const minimumDelayMs = 45000;
  const hesitationDelayMs = 75000;
  const engagementScrollRatio = 0.55;
  let minimumDelayReached = false;
  let hesitationTimer;

  if (!banner || !backdrop || !closeButton) return;

  function nextThursdayDeadline(now = new Date()) {
    const deadline = new Date(now);
    const daysUntilThursday = (4 - now.getDay() + 7) % 7;
    deadline.setDate(now.getDate() + daysUntilThursday);
    deadline.setHours(23, 59, 59, 999);

    if (deadline <= now) {
      deadline.setDate(deadline.getDate() + 7);
    }

    return deadline;
  }

  function updateCountdown() {
    const remaining = Math.max(0, nextThursdayDeadline().getTime() - Date.now());
    const values = {
      days: Math.floor(remaining / 86400000),
      hours: Math.floor((remaining % 86400000) / 3600000),
      minutes: Math.floor((remaining % 3600000) / 60000),
      seconds: Math.floor((remaining % 60000) / 1000)
    };

    Object.entries(values).forEach(([unit, value]) => {
      const element = banner.querySelector(`[data-countdown="${unit}"]`);
      if (element) element.textContent = String(value).padStart(2, '0');
    });
  }

  function stopTriggerListeners() {
    window.clearTimeout(hesitationTimer);
    window.removeEventListener('scroll', maybeShowAfterEngagement);
  }

  function showPromo() {
    if (sessionStorage.getItem(storageKey)) return;
    stopTriggerListeners();
    sessionStorage.setItem(storageKey, '1');
    banner.hidden = false;
    backdrop.hidden = false;
    updateCountdown();
    countdownTimer = window.setInterval(updateCountdown, 1000);
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
    window.clearInterval(countdownTimer);
    window.setTimeout(() => {
      banner.hidden = true;
      backdrop.hidden = true;
    }, 280);
  }

  closeButton.addEventListener('click', closePromo);
  backdrop.addEventListener('click', closePromo);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !banner.hidden) closePromo();
  });

  window.addEventListener('scroll', maybeShowAfterEngagement, { passive: true });
  window.setTimeout(() => {
    minimumDelayReached = true;
    maybeShowAfterEngagement();
  }, minimumDelayMs);
  hesitationTimer = window.setTimeout(showPromo, hesitationDelayMs);

  window.__PP_PROMO = {
    showPromo,
    closePromo,
    nextThursdayDeadline,
    triggerConfig: {
      minimumDelayMs,
      hesitationDelayMs,
      engagementScrollRatio
    }
  };
})();
