(() => {
  const track = document.getElementById('reviews-track');
  const container = track?.closest('.reviews__carousel');
  const cards = track ? [...track.querySelectorAll('.review-card')] : [];
  const count = container?.querySelector('[data-review-count]');
  const prev = container?.querySelector('[data-review-prev]');
  const next = container?.querySelector('[data-review-next]');
  if (!track || cards.length < 2 || !prev || !next) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = 0;
  let visible = false;
  let paused = false;
  let settledIndex = 0;
  let settleTimer;

  function updateCount() {
    if (count) count.textContent = `${index + 1} / ${cards.length}`;
  }

  function show(nextIndex) {
    index = (nextIndex + cards.length) % cards.length;
    const card = cards[index];
    const left = card.offsetLeft - track.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
    updateCount();
  }

  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));

  track.addEventListener('scroll', () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    index = cards.reduce((nearest, card, candidate) => {
      const distance = Math.abs(card.offsetLeft - track.offsetLeft + card.clientWidth / 2 - center);
      const best = cards[nearest];
      const bestDistance = Math.abs(best.offsetLeft - track.offsetLeft + best.clientWidth / 2 - center);
      return distance < bestDistance ? candidate : nearest;
    }, 0);
    updateCount();
    if (reducedMotion) return;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      if (index === settledIndex) return;
      cards[settledIndex].classList.remove('review-card--spring');
      cards[index].classList.add('review-card--spring');
      settledIndex = index;
    }, 160);
  }, { passive: true });

  container.addEventListener('mouseenter', () => { paused = true; });
  container.addEventListener('mouseleave', () => { paused = false; });
  container.addEventListener('focusin', () => { paused = true; });
  container.addEventListener('focusout', () => { paused = false; });
  container.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  container.addEventListener('touchend', () => { paused = false; }, { passive: true });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: .5 }).observe(track);
  }
  if (!reducedMotion) {
    setInterval(() => {
      if (visible && !paused && !document.hidden) show(index + 1);
    }, 7000);
  }
  updateCount();
})();
