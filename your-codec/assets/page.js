// Hero (recompression in motion) and the generator choice view. Both play by themselves and can be paused.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

// wait until the images are decoded, but never longer than 1.5 s
const decoded = imgs => Promise.race([Promise.all([...imgs].map(im => im.decode().catch(() => {}))),
                                      new Promise(r => setTimeout(r, 1500))]);

function autoplay(el, stepMs, step, button) {
  const s = { playing: !reducedMotion.matches, visible: true, timer: null };
  const sync = () => {
    button.textContent = s.playing ? 'Pause' : 'Play';
    button.setAttribute('aria-pressed', s.playing);
    clearTimeout(s.timer); s.timer = null;
    const tick = () => { const wait = step(); s.timer = setTimeout(tick, wait || stepMs); };
    if (s.playing && s.visible && !document.hidden) s.timer = setTimeout(tick, stepMs);
  };
  button.addEventListener('click', () => { s.playing = !s.playing; sync(); });
  new IntersectionObserver(([e]) => { s.visible = e.isIntersecting; sync(); }).observe(el);
  document.addEventListener('visibilitychange', sync);
  reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { s.playing = false; sync(); } });
  sync();
  return { pause: () => { s.playing = false; sync(); } };
}

(() => {
  const root = document.getElementById('hero');
  if (!root) return;
  const R = [
    { round: '1', psnr: '25.68', bpp: '0.036' }, { round: '10', psnr: '21.42', bpp: '0.042' },
    { round: '20', psnr: '17.70', bpp: '0.049' }, { round: '50', psnr: '11.36', bpp: '0.061' }];
  const OURS = { psnr: '25.68', bpp: '0.036' };
  let i = 0;
  const imgs = root.querySelectorAll('#hero-plain img'), steps = root.querySelectorAll('[data-hero-round]');
  const show = () => {
    imgs.forEach((im, k) => im.classList.toggle('on', k === i));
    steps.forEach((b, k) => b.setAttribute('aria-pressed', k === i));
    root.querySelector('#hero-badge-plain').textContent = 'Round ' + R[i].round + ' · ' + R[i].psnr + ' dB · ' + R[i].bpp + ' bpp';
    root.querySelector('#hero-badge-ours').textContent = 'Round ' + R[i].round + ' · ' + OURS.psnr + ' dB · ' + OURS.bpp + ' bpp';
  };
  show();
  decoded(imgs).then(() => {
    const player = autoplay(root, 1100, () => { i = (i + 1) % R.length; show(); return i === R.length - 1 ? 2200 : 1100; },
                            root.querySelector('#hero-play'));
    steps.forEach((b, k) => b.addEventListener('click', () => { i = k; show(); player.pause(); }));
  });
})();

(() => {
  const root = document.getElementById('gen');
  if (!root) return;
  const data = JSON.parse(document.getElementById('gen-data').textContent);
  const { width: W, height: H, crop } = data;
  const full = root.querySelector('.gen-full'), zoom = root.querySelector('.gen-crop'), buttons = root.querySelector('#gen-buttons');
  const box = root.querySelector('.gen-box');
  Object.assign(box.style, { left: crop.x / W * 100 + '%', top: crop.y / H * 100 + '%', width: crop.size / W * 100 + '%', height: crop.size / H * 100 + '%' });
  const k = 100 / crop.size;
  data.decoders.forEach(d => {
    const a = document.createElement('img'); a.src = d.src; a.alt = d.name + ', full image';
    full.insertBefore(a, box);
    const z = document.createElement('img'); z.src = d.src; z.alt = d.name + ', 128×128 detail';
    Object.assign(z.style, { width: W * k + '%', height: H * k + '%', left: -crop.x * k + '%', top: -crop.y * k + '%' });
    zoom.append(z);
    const b = document.createElement('button'); b.type = 'button'; b.textContent = d.name;
    buttons.append(b);
  });
  let i = 1;
  const show = () => {
    full.querySelectorAll('img').forEach((im, n) => im.classList.toggle('on', n === i));
    zoom.querySelectorAll('img').forEach((im, n) => im.classList.toggle('on', n === i));
    buttons.querySelectorAll('button').forEach((b, n) => b.setAttribute('aria-pressed', n === i));
    const d = data.decoders[i];
    root.querySelector('#gen-label').innerHTML = d.psnr == null
      ? '<b>' + d.name + '</b> · the uncompressed reference'
      : '<b>' + d.name + '</b> · PSNR ' + d.psnr.toFixed(2) + ' dB · DISTS ' + d.dists.toFixed(3) +
        ' · <span class="same-bits">same bitstream, ' + d.bpp.toFixed(4) + ' bpp</span>';
  };
  show();
  // decode every image first so switching never shows an empty frame
  decoded(root.querySelectorAll('img')).then(() => {
    const player = autoplay(root, 1600, () => { i = (i + 1) % data.decoders.length; show(); }, root.querySelector('#gen-play'));
    buttons.querySelectorAll('button').forEach((b, n) => b.addEventListener('click', () => { i = n; show(); player.pause(); }));
  });
})();
