(() => {
  const main = document.querySelector('main');
  if (!main) return;
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.classList.add('vivo-crayon-route');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.innerHTML = '<defs><pattern id="vivo-wax" patternUnits="userSpaceOnUse" width="92" height="9"><image href="images/editorial/crayon-journey-overlay-transparent.png" x="-8" y="-28" width="1054" height="1492"/></pattern><mask id="vivo-wax-mask"><rect width="100%" height="100%" fill="url(#vivo-wax)"/></mask><linearGradient id="vivo-route-color" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ef725e"/><stop offset=".4" stop-color="#249cb1"/><stop offset=".7" stop-color="#efbd45"/><stop offset="1" stop-color="#ed6e61"/></linearGradient></defs><path class="base"/><path class="ink" pathLength="1000" mask="url(#vivo-wax-mask)"/>';
  main.prepend(svg);
  const ink = svg.querySelector('.ink');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobileBar = document.querySelector('.whatsapp-mobile-bar');
  const draw = () => {
    const width = main.clientWidth, height = main.scrollHeight, mobile = width < 768;
    const sections = [...main.querySelectorAll(':scope > section')].map(el => ({ top: el.offsetTop, height: el.offsetHeight }));
    if (!sections.length) return;
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    const left = mobile ? 9 : Math.max(28, (width - 1180) / 2 - 25);
    const right = mobile ? width - 9 : width - left;
    let path = `M ${mobile ? left : width * .16} 0 C ${left} 90, ${left} 160, ${left} ${Math.min(240, sections[0].height - 120)}`;
    sections.slice(1).forEach((section, index) => {
      const target = index % 2 ? right : left;
      const before = target;
      path += ` C ${before} ${section.top - 35}, ${target} ${section.top - 20}, ${target} ${section.top + 100}`;
      path += ` C ${target} ${section.top + 180}, ${target + (target === right ? -50 : 50)} ${section.top + 180}, ${target} ${section.top + 235}`;
      path += ` C ${target} ${section.top + section.height * .7}, ${target} ${section.top + section.height - 35}, ${target} ${section.top + section.height - 10}`;
    });
    svg.querySelectorAll('path').forEach(el => el.setAttribute('d', path));
    update();
  };
  let pending = false;
  const update = () => {
    pending = false;
    const amount = Math.max(0, Math.min(1, (scrollY + innerHeight * .82 - main.offsetTop) / main.scrollHeight));
    ink.style.strokeDashoffset = reduced.matches ? '0' : String(1000 * (1 - amount));
    if (mobileBar) mobileBar.classList.toggle('vivo-ready', scrollY > Math.min(420, innerHeight * .7));
  };
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener('resize', draw);
  new ResizeObserver(draw).observe(main);
  document.fonts?.ready.then(draw);
  reduced.addEventListener('change', update);
})();
