(() => {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('#navigation');
  const pill = nav?.querySelector('.nav-pill');
  if (!header || !nav || !pill) return;
  const links = [...nav.querySelectorAll('a')];
  const contact = header.querySelector('.nav-cta');
  const sections = [...document.querySelectorAll('main > section[id]')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const lenis = window.Lenis ? new Lenis({ autoRaf: true, smoothWheel: false, anchors: false }) : null;
  let frame = 0;

  function update() {
    frame = 0;
    const threshold = header.getBoundingClientRect().height + 65;
    let current = sections[0];
    sections.forEach(section => { if (section.getBoundingClientRect().top <= threshold) current = section; });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) current = sections.at(-1);
    const active = links.find(link => link.hash === `#${current.id}`);
    [...links, contact].forEach(link => {
      if (link.hash === `#${current.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (!active || !nav.getClientRects().length) { pill.style.opacity = '0'; return; }
    pill.style.width = `${active.offsetWidth}px`;
    pill.style.height = `${active.offsetHeight}px`;
    pill.style.transform = `translate(${active.offsetLeft}px, ${active.offsetTop}px)`;
    pill.style.opacity = '1';
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function scrollToSection(target, focus = false) {
    const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - header.getBoundingClientRect().height - 16);
    const complete = () => {
      if (focus) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
      schedule();
    };
    if (lenis) lenis.scrollTo(top, {
      duration: 1.15,
      easing: t => 1 - Math.pow(1 - t, 4),
      immediate: motion.matches,
      onComplete: complete
    });
    else {
      window.scrollTo({ top, behavior: motion.matches ? 'instant' : 'smooth' });
      if (focus) { target.setAttribute('tabindex', '-1'); target.focus({ preventScroll: true }); }
      schedule();
    }
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    if (window.location.hash !== link.hash) history.pushState(null, '', link.hash);
    scrollToSection(target, true);
  });
  window.addEventListener('popstate', () => {
    const target = document.getElementById(window.location.hash.slice(1) || 'home');
    if (target) scrollToSection(target);
  });
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  new MutationObserver(schedule).observe(nav, { attributes: true, attributeFilter: ['class'] });
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(nav);
  motion.addEventListener('change', () => {
    if (motion.matches && lenis) lenis.scrollTo(window.scrollY, { immediate: true });
    schedule();
  });
  document.fonts?.ready.then(schedule);
  schedule();
})();
