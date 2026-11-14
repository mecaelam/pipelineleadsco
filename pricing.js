(() => {
  const list = document.querySelector('.plan-features');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!list || motion.matches || !('IntersectionObserver' in window)) return;

  const rows = [...list.children];
  let timer;
  const pending = new Set();
  let running = false;
  function revealNext() {
    const row = rows.find(item => pending.has(item));
    if (!row) { running = false; return; }
    running = true;
    pending.delete(row);
    row.classList.add('is-checked');
    timer = window.setTimeout(revealNext, 280);
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        pending.add(entry.target);
        observer.unobserve(entry.target);
      }
    });
    if (!running) revealNext();
  }, { threshold: 0.6 });

  list.classList.add('checks-ready');
  rows.forEach(row => observer.observe(row));
  motion.addEventListener('change', event => {
    if (!event.matches) return;
    window.clearTimeout(timer);
    observer.disconnect();
    pending.clear();
    list.classList.remove('checks-ready');
  });
})();
