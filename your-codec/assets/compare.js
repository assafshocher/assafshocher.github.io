// Eight-codec comparison: both panels flicker between round 1 and round 50 (original codec drifts, ours does not move).
(() => {
  const root = document.getElementById('codec-compare');
  if (!root) return;
  let data;
  try {
    data = JSON.parse(document.getElementById('codecs-data').textContent);
  } catch {
    root.querySelector('#cmp-pair').textContent = 'The comparison could not be loaded. Please reload the page.';
    return;
  }
  const FLICK_MS = 800;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const state = { codec: 0, zoom: false, round: '1', playing: !reduced.matches, visible: true, timer: null };
  const $ = s => root.querySelector(s);
  const pair = $('#cmp-pair'), play = $('#cmp-play'), pills = $('#cmp-codecs');

  data.codecs.forEach((c, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = c.name; b.setAttribute('role', 'tab');
    b.addEventListener('click', () => { state.codec = i; load(); });
    pills.append(b);
  });
  root.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => { state.zoom = b.dataset.zoom === '1'; layout(); }));
  play.addEventListener('click', () => { state.playing = !state.playing; sync(); });
  pair.addEventListener('click', () => { state.playing = !state.playing; sync(); });

  function place(img) {
    const { width: W, height: H, crop } = data;
    if (state.zoom) {
      const k = 100 / crop.size;
      Object.assign(img.style, { width: W * k + '%', height: H * k + '%', left: -crop.x * k + '%', top: -crop.y * k + '%' });
    } else {
      Object.assign(img.style, { width: '100%', height: '100%', left: '0', top: '0' });
    }
  }
  function layout() {
    pair.classList.toggle('zoomed', state.zoom);
    root.querySelectorAll('[data-zoom]').forEach(b => b.setAttribute('aria-pressed', (b.dataset.zoom === '1') === state.zoom));
    pair.querySelectorAll('img').forEach(place);
    caption();
  }
  function load() {
    const c = data.codecs[state.codec];
    pills.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-selected', i === state.codec));
    pair.querySelectorAll('.flick-panel').forEach(panel => {
      const arm = panel.dataset.arm;
      panel.querySelectorAll('img').forEach(img => {
        const r = c.rounds[img.dataset.round][arm];
        img.src = r.src;
        img.alt = c.name + (arm === 'ours' ? ' with our adapter' : ', original codec') + ', round ' + img.dataset.round;
      });
    });
    layout();
    // show the new codec only after its four images are decoded, so the flicker never blinks
    Promise.race([Promise.all([...pair.querySelectorAll('img')].map(im => im.decode().catch(() => {}))),
                  new Promise(r => setTimeout(r, 1500))]).then(show);
  }
  function show() {
    const c = data.codecs[state.codec];
    pair.querySelectorAll('.flick-panel').forEach(panel => {
      const r = c.rounds[state.round][panel.dataset.arm];
      panel.querySelectorAll('img').forEach(img => img.classList.toggle('on', img.dataset.round === state.round));
      panel.querySelector('.flick-badge').textContent = 'Round ' + state.round + ' · ' + r.psnr.toFixed(2) + ' dB' +
        (r.bpp == null ? '' : ' · ' + r.bpp.toFixed(3) + ' bpp');
      panel.querySelector('.flick-eq').hidden = !(panel.dataset.arm === 'ours' && state.round !== '1' && r.equalsRound1);
    });
  }
  function caption() {
    const c = data.codecs[state.codec];
    $('#cmp-caption').textContent = c.name + ' ' + c.rate + ' · Kodak kodim03 · ' +
      (c.chain === 'float chain' ? 'float chain' : '8-bit storage') +
      (state.zoom ? ' · 192×192 crop, shown enlarged' : ' · full image') +
      '. PSNR on the full image. Click the images or the button to pause.';
  }
  function sync() {
    play.textContent = state.playing ? 'Pause' : 'Play';
    play.setAttribute('aria-pressed', state.playing);
    clearInterval(state.timer); state.timer = null;
    if (state.playing && state.visible && !document.hidden) {
      state.timer = setInterval(() => { state.round = state.round === '1' ? '50' : '1'; show(); }, FLICK_MS);
    }
  }
  new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; sync(); }).observe(pair);
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', () => { if (reduced.matches) { state.playing = false; sync(); } });
  load(); sync();
})();
