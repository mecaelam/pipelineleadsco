(() => {
  const section = document.querySelector('#how-it-works');
  const map = section?.querySelector('.process-route');
  if (!map || !window.gsap || !window.DrawSVGPlugin || !window.MotionPathPlugin) return;
  gsap.registerPlugin(DrawSVGPlugin, MotionPathPlugin);
  const trail = section.querySelector('#route-trail');
  const ahead = section.querySelector('#route-reveal');
  const car = section.querySelector('#route-car');
  const replay = section.querySelector('.route-replay');
  const stops = [...section.querySelectorAll('.route-stop')];
  const steps = [...section.querySelectorAll('.steps article')];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timeline;
  let visible = false;

  function mark(index) {
    stops.forEach((stop, i) => stop.classList.toggle('is-reached', i <= index));
    steps.forEach((step, i) => step.classList.toggle('is-reached', i <= index));
  }
  function setup() {
    timeline?.kill();
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
    gsap.set(car, { motionPath: { path: trail, align: trail, alignOrigin: [0.5, 0.5], autoRotate: true, start: 0, end: 0 } });
    car.setAttribute('visibility', 'visible');
    replay.hidden = true;
    timeline = gsap.timeline({ paused: true, onComplete: () => { replay.hidden = false; } });
    timeline.call(() => mark(0), [], 0)
      .to(ahead, { drawSVG: '100%', duration: 3.4, ease: 'none' }, 0)
      .to(trail, { drawSVG: '100%', duration: 4.2, ease: 'none' }, 0.35)
      .to(car, { duration: 4.2, ease: 'none', motionPath: { path: trail, align: trail, alignOrigin: [0.5, 0.5], autoRotate: true } }, 0.35)
      .call(() => mark(1), [], 2.45)
      .call(() => mark(2), [], 4.55);
  }
  function syncPlayback() {
    if (!timeline || motion.matches) return;
    if (visible && !document.hidden) {
      timeline.play();
    } else timeline.pause();
  }
  setup();
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
