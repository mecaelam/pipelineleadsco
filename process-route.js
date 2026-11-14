(() => {
  const section = document.querySelector('#how-it-works');
  const map = section?.querySelector('.process-route');
  if (!map || !window.gsap || !window.DrawSVGPlugin || !window.MotionPathPlugin) return;
  gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);
  const trail = section.querySelector('#route-trail');
  const ahead = section.querySelector('#route-reveal');
  const car = section.querySelector('#route-car');
  const replay = section.querySelector('.route-replay');
  const svg = section.querySelector('.route-map');
  const mask = section.querySelector('#route-ahead-mask');
  const badges = [...section.querySelectorAll('.step-number')];
  const paths = [trail, ahead, section.querySelector('.route-road'), section.querySelector('.route-dashes')];
  let middle = 0.5;
  let layoutKey = ''; 
  const steps = [...section.querySelectorAll('.steps article')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timeline;
  let visible = false;

  function mark(index) {
    steps.forEach((step, i) => step.classList.toggle('is-reached', i <= index));
  }
  function measure() {
    const bounds = map.getBoundingClientRect();
    const points = badges.map(badge => {
      const box = badge.getBoundingClientRect();
      return { x: box.left - bounds.left + box.width / 2, y: box.top - bounds.top + box.height / 2 };
    });
    const data = points.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' ');
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    mask.setAttribute('width', bounds.width);
    mask.setAttribute('height', bounds.height);
    paths.forEach(path => path.setAttribute('d', data));
    const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
    middle = distance(points[0], points[1]) / (distance(points[0], points[1]) + distance(points[1], points[2]));
    layoutKey = `${bounds.width},${bounds.height}`;
  }
  function setup() {
    timeline?.kill();
    measure();
    mark(-1);
    if (motion.matches) {
      gsap.set(trail, { drawSVG: '100%' });
      gsap.set(ahead, { drawSVG: '100%' });
      car.setAttribute('visibility', 'hidden');
      replay.hidden = true;
      mark(2);
      return;
    }
    gsap.set(trail, { drawSVG: '0%' });
    gsap.set(ahead, { drawSVG: '0%' });
    gsap.set(car, { x: 0, y: 0, rotation: 0 });
    gsap.set(car, { motionPath: { path: trail, align: trail, alignOrigin: [0.5, 0.5], autoRotate: true, start: 0, end: 0 } });
    car.setAttribute('visibility', 'visible');
    replay.hidden = true;
    timeline = gsap.timeline({ paused: true, onComplete: () => { replay.hidden = false; } });
    timeline.call(() => mark(0), [], 0)
      .to(ahead, { drawSVG: '100%', duration: 3.4, ease: 'none' }, 0)
      .to(trail, { drawSVG: '100%', duration: 4.2, ease: 'none' }, 0.35)
      .to(car, { duration: 4.2, ease: 'none', motionPath: { path: trail, align: trail, alignOrigin: [0.5, 0.5], autoRotate: true } }, 0.35)
      .call(() => mark(1), [], 0.35 + 4.2 * middle)
      .call(() => mark(2), [], 4.55);
  }
  function syncPlayback() {
    if (!timeline || motion.matches) return;
    if (visible && !document.hidden) {
      timeline.play();
    } else timeline.pause();
  }
  setup();
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => {
      const bounds = map.getBoundingClientRect();
      if (`${bounds.width},${bounds.height}` === layoutKey) return;
      const progress = timeline?.progress() || 0;
      setup();
      if (!motion.matches) {
        timeline.progress(progress);
        const travel = Math.max(0, (progress * 4.55 - 0.35) / 4.2);
        mark(travel >= 1 ? 2 : travel >= middle ? 1 : progress > 0 ? 0 : -1);
      }
      syncPlayback();
    }).observe(map);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: 0.55 }).observe(map);
  } else { visible = true; syncPlayback(); }
  replay.addEventListener('click', () => { setup(); syncPlayback(); });
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', () => { setup(); syncPlayback(); });
})();
