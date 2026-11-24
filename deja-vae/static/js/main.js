/* Déjà-VAE project page: PasteBench viewer, math rendering, BibTeX copy. */
(function () {
  'use strict';
  var D = window.DEJA_DATA || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var NS = 'http://www.w3.org/2000/svg';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function svgEl(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

  /* ---------------- Math ---------------- */
  function renderMath() {
    if (!window.katex) return;
    document.querySelectorAll('.eq[data-tex], .m-block[data-tex]').forEach(function (el) {
      try { katex.render(el.getAttribute('data-tex'), el, { displayMode: el.classList.contains('eq'), throwOnError: false }); } catch (e) {}
    });
    document.querySelectorAll('.m').forEach(function (el) {
      try { katex.render(el.textContent, el, { throwOnError: false }); } catch (e) {}
    });
  }

  /* ---------------- PasteBench viewer: original, all pasted, all removed ---------------- */
  function initViewer() {
    var pb = D.pb; if (!pb) return;
    var S = { scene: pb.scenes[0].id, base: pb.methods[0].id, turn: 20 };
    var imgBase = $('#imgBase'), imgOurs = $('#imgOurs'), stages = document.querySelectorAll('#stages [data-turn]');
    var labelOf = {}; pb.methods.forEach(function (m) { labelOf[m.id] = m.label; });
    var baselines = pb.methods.filter(function (m) { return m.id !== 'deja_bp'; });
    function src(method, t) {
      return t === 0 ? 'static/img/pb/' + S.scene + '/input.jpg' : 'static/img/pb/' + S.scene + '/' + method + '/' + t + '.jpg';
    }
    function preload() { [10, 20].forEach(function (t) { new Image().src = src(S.base, t); new Image().src = src('deja_bp', t); }); }
    function render() {
      imgBase.src = src(S.base, S.turn); imgOurs.src = src('deja_bp', S.turn);
      $('#tagBase').textContent = labelOf[S.base];
      stages.forEach(function (b) { b.setAttribute('aria-selected', +b.getAttribute('data-turn') === S.turn ? 'true' : 'false'); });
    }
    stages.forEach(function (b) { b.addEventListener('click', function () { S.turn = +b.getAttribute('data-turn'); render(); }); });
    $('#stages').addEventListener('keydown', function (e) {
      var order = [0, 10, 20], i = order.indexOf(S.turn);
      if (e.key === 'ArrowRight' && i < 2) { S.turn = order[i + 1]; render(); stages[i + 1].focus(); e.preventDefault(); }
      if (e.key === 'ArrowLeft' && i > 0) { S.turn = order[i - 1]; render(); stages[i - 1].focus(); e.preventDefault(); }
    });
    var seg = $('#sceneSeg');
    pb.scenes.forEach(function (s, i) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Scene ' + (i + 1);
      b.setAttribute('aria-pressed', s.id === S.scene ? 'true' : 'false');
      b.addEventListener('click', function () {
        S.scene = s.id; seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true'); preload(); render();
      });
      seg.appendChild(b);
    });
    var chips = $('#methodChips');
    baselines.forEach(function (m) {
      var c = document.createElement('button'); c.type = 'button'; c.className = 'chip'; c.textContent = m.label;
      c.setAttribute('aria-pressed', m.id === S.base ? 'true' : 'false');
      c.addEventListener('click', function () {
        S.base = m.id; chips.querySelectorAll('.chip').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        c.setAttribute('aria-pressed', 'true'); preload(); render();
      });
      chips.appendChild(c);
    });
    preload(); render();
  }

  /* ---------------- Theme switch: day (default) / night ---------------- */
  function initTheme() {
    var btn = $('#themeToggle'), root = document.documentElement; if (!btn) return;
    function sync() {
      var night = root.getAttribute('data-theme') === 'night';
      btn.setAttribute('aria-pressed', night ? 'true' : 'false');
      btn.setAttribute('aria-label', night ? 'Switch to the day theme' : 'Switch to the night theme');
      var m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute('content', night ? '#170b26' : '#fbf6f1');
    }
    btn.addEventListener('click', function () {
      var night = root.getAttribute('data-theme') !== 'night';
      if (night) root.setAttribute('data-theme', 'night'); else root.removeAttribute('data-theme');
      try { localStorage.setItem('deja-theme', night ? 'night' : 'day'); } catch (e) {}
      sync(); document.dispatchEvent(new Event('themechange'));
    });
    sync();
  }

  /* ---------------- BibTeX copy ---------------- */
  function initBib() {
    var b = $('#copyBib'); if (!b) return;
    b.addEventListener('click', function () {
      var txt = $('#bibText').textContent;
      var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {}); else done();
    });
  }

  function init() { renderMath(); initTheme(); initViewer(); initBib(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
