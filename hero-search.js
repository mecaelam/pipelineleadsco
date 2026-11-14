(() => {
  const demo = document.querySelector('[data-search-demo]');
  if (!demo) return;
  const phrase = demo.querySelector('#search-phrase');
  const rows = [...demo.querySelectorAll('.search-result-row')];
  const pauseButton = demo.querySelector('#demo-pause');
  const pauseLabel = demo.querySelector('[data-pause-label]');
  const pauseIcon = pauseButton.querySelector('[aria-hidden]');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const examples = [
    { query: 'house cleaning near me', results: [
      ['House Cleaning in Your Area | Request a Quote', 'Regular and one-off cleaning for your home. Contact our local team for a quote.'],
      ['House cleaning services near you', 'Explore local cleaners and the services they offer.'],
      ['Compare cleaning services in your area', 'Find a service for your home and request an estimate.']
    ] },
    { query: 'deep cleaning services', results: [
      ['Local Deep Cleaning Services | Get a Quote', 'Detailed cleaning for kitchens, bathrooms, and the rest of your home.'],
      ['Deep cleaning services near you', 'Find local cleaning teams and ask about availability.'],
      ['Deep cleaning for homes and apartments', 'Compare services for a thorough home clean.']
    ] },
    { query: 'move-out cleaning near me', results: [
      ['Move-Out Cleaning | Request a Quote', 'Moving home? Ask our local team about move-out cleaning.'],
      ['Local move-out cleaning services', 'Find cleaning options for the end of your tenancy.'],
      ['End-of-tenancy cleaning near you', 'Explore local cleaners and request a quote.']
    ] },
    { query: 'office cleaning services', results: [
      ['Office Cleaning Services | Get in Touch', 'Regular cleaning for offices and workplaces. Ask about a schedule for your business.'],
      ['Office cleaning teams nearby', 'Explore local cleaning services for your workplace.'],
      ['Commercial cleaning services in your area', 'Find cleaning options for your workplace.']
    ] }
  ];
  let exampleIndex = 0;
  let character = 0;
  let timer = null;
  let nextStep = null;
  let dueAt = 0;
  let remaining = 0;
  let userPaused = false;
  let inView = true;
  const blocked = () => userPaused || document.hidden || !inView || motion.matches;

  function cancelTimer() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }
  function schedule(step, delay) {
    cancelTimer();
    nextStep = step;
    remaining = delay;
    if (!blocked()) armTimer();
  }
  function armTimer() {
    dueAt = performance.now() + remaining;
    timer = setTimeout(() => {
      timer = null;
      const step = nextStep;
      nextStep = null;
      step();
    }, remaining);
  }
  function syncPlayback() {
    if (blocked()) {
      if (timer !== null) remaining = Math.max(0, dueAt - performance.now());
      cancelTimer();
    } else if (nextStep && timer === null) {
      armTimer();
    }
    demo.classList.toggle('demo-paused', blocked());
  }
  function setExample() {
    const example = examples[exampleIndex];
    character = 0;
    phrase.textContent = '';
    rows.forEach((row, index) => {
      row.classList.remove('is-visible');
      row.querySelector('[data-result-title]').textContent = example.results[index][0];
      row.querySelector('[data-result-description]').textContent = example.results[index][1];
    });
  }
  function typeCharacter() {
    const query = examples[exampleIndex].query;
    phrase.textContent = query.slice(0, ++character);
    if (character < query.length) schedule(typeCharacter, query[character - 1] === ' ' ? 90 : 58);
    else schedule(() => revealRow(0), 320);
  }
  function revealRow(index) {
    rows[index].classList.add('is-visible');
    if (index < rows.length - 1) schedule(() => revealRow(index + 1), 110);
    else schedule(nextExample, 2300);
  }
  function nextExample() {
    rows.forEach(row => row.classList.remove('is-visible'));
    schedule(() => {
      exampleIndex = (exampleIndex + 1) % examples.length;
      setExample();
      schedule(typeCharacter, 280);
    }, 220);
  }
  function resetPlayback() {
    cancelTimer();
    nextStep = null;
    exampleIndex = 0;
    setExample();
    demo.classList.toggle('demo-running', !motion.matches);
    pauseButton.hidden = motion.matches;
    if (motion.matches) {
      phrase.textContent = examples[0].query;
      rows.forEach(row => row.classList.add('is-visible'));
    } else {
      schedule(typeCharacter, 500);
    }
    syncPlayback();
  }
  pauseButton.addEventListener('click', () => {
    userPaused = !userPaused;
    pauseButton.setAttribute('aria-pressed', String(userPaused));
    pauseButton.setAttribute('aria-label', userPaused ? 'Resume search animation' : 'Pause search animation');
    pauseLabel.textContent = userPaused ? 'Play' : 'Pause';
    pauseIcon.textContent = userPaused ? '▷' : 'Ⅱ';
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  motion.addEventListener('change', resetPlayback);
  if ('IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver(entries => {
      inView = entries[0].isIntersecting;
      syncPlayback();
    }, { threshold: 0.1 });
    observer.observe(demo);
  }
  resetPlayback();
})();
