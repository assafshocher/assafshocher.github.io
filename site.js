const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menu?.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  menu.textContent = open ? 'Close' : 'Menu';
  nav.classList.toggle('open', open);
});
nav?.addEventListener('click', event => {
  if (event.target.closest('a') && nav.classList.contains('open')) menu.click();
});
document.querySelector('.photo-button')?.addEventListener('click', event => {
  const button = event.currentTarget;
  button.setAttribute('aria-pressed', String(button.classList.toggle('surprise-on')));
});

const memberList = document.querySelector('.people-grid');
if (memberList) {
  const members = [...memberList.children];
  // Fisher–Yates gives each member an equal chance at every position.
  for (let index = members.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [members[index], members[swapIndex]] = [members[swapIndex], members[index]];
  }
  memberList.append(...members);
}

document.querySelectorAll('[data-copy-bio]').forEach(bioButton => {
const label = bioButton.querySelector('span');
const originalLabel = label.textContent;
let bioFeedbackTimer;
bioButton.addEventListener('click', async () => {
  const bio = document.querySelector('#speaker-bio');
  const status = document.getElementById(bioButton.dataset.copyStatus || 'bio-copy-status');
  clearTimeout(bioFeedbackTimer);
  try {
    await navigator.clipboard.writeText(bio.textContent.trim());
    label.textContent = 'Copied';
    status.textContent = 'Bio copied to clipboard.';
    bioFeedbackTimer = setTimeout(() => {
      label.textContent = originalLabel;
      status.textContent = '';
    }, 2500);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(bio);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    label.textContent = originalLabel;
    status.textContent = 'Bio selected. Press Ctrl+C or ⌘C to copy.';
  }
});
});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const hoverSetting = document.querySelector('#hover-previews');
const publications = [...document.querySelectorAll('.publication')];
let hoverEnabled = !reducedMotion.matches;
try {
  const stored = localStorage.getItem('shocher-hover-previews');
  if (stored !== null) hoverEnabled = stored === 'on';
} catch {}
if (hoverSetting) hoverSetting.checked = hoverEnabled;
let current = null;
let hoverTimer;
let candidate = null;
let lastPointer = null;
const suppressed = new Set();
const expansionAnimations = new WeakMap();

function stopMedia(article) {
  article.querySelectorAll('.preview-animation').forEach(media => {
    if (media.tagName === 'VIDEO') {
      media.pause();
      if (media.readyState) media.currentTime = 0;
    } else media.removeAttribute('src');
    media.hidden = true;
  });
}
function startMedia(article) {
  if (reducedMotion.matches || document.hidden) return;
  const media = article.querySelector('.preview-animation');
  if (!media) return;
  if (!media.getAttribute('src')) media.src = media.dataset.src;
  media.hidden = false;
  if (media.tagName === 'VIDEO') media.play().catch(() => { media.hidden = true; });
}
function setExpanded(article, expanded) {
  const previousHeight = article.getBoundingClientRect().height;
  expansionAnimations.get(article)?.cancel();
  article.classList.remove('is-expanding');
  article.classList.toggle('is-open', expanded);
  article.querySelector('.pub-abstract').hidden = !expanded;
  article.querySelectorAll('[data-toggle-publication]').forEach(button => {
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', `${expanded ? 'Collapse' : 'Expand'} ${button.dataset.title}`);
    const label = button.querySelector('span');
    if (label) label.textContent = expanded ? 'less' : 'abstract';
  });
  if (expanded) startMedia(article); else stopMedia(article);
  // Animate the card's actual height so later cards move with its lower edge.
  if (expanded && !reducedMotion.matches) {
    const height = article.getBoundingClientRect().height;
    article.classList.add('is-expanding');
    const animation = article.animate(
      [{height: `${previousHeight}px`}, {height: `${height}px`}],
      {duration: 240, easing: 'cubic-bezier(.2,.7,.3,1)'}
    );
    expansionAnimations.set(article, animation);
    animation.onfinish = animation.oncancel = () => {
      if (expansionAnimations.get(article) !== animation) return;
      expansionAnimations.delete(article);
      article.classList.remove('is-expanding');
    };
  }
}
function closeRow(suppress = false) {
  clearTimeout(hoverTimer);
  candidate = null;
  if (!current) return;
  const article = current.article;
  if (suppress) suppressed.add(article);
  const focusHidden = article.querySelector('.pub-abstract').contains(document.activeElement);
  setExpanded(article, false);
  current = null;
  if (focusHidden) article.querySelector('[data-abstract-button]').focus({preventScroll:true});
}
function openRow(article, mode) {
  clearTimeout(hoverTimer);
  candidate = null;
  if (current?.article === article) return;
  // Keep the incoming row at the same screen position if a row above it collapses.
  const anchor = current ? article.getBoundingClientRect().top : null;
  closeRow();
  current = {article, mode};
  setExpanded(article, true);
  if (anchor !== null) {
    const shift = article.getBoundingClientRect().top - anchor;
    if (Math.abs(shift) > 1) window.scrollBy({top:shift,behavior:'instant'});
  }
}

// Actual pointer movement, rather than layout-generated enter/leave events,
// determines intent. Expanding a row cannot trigger a neighboring row by itself.
document.addEventListener('pointermove', event => {
  if (event.pointerType !== 'mouse') return;
  if (lastPointer && Math.hypot(event.clientX-lastPointer.x,event.clientY-lastPointer.y) < 2) return;
  lastPointer = {x:event.clientX,y:event.clientY};
  const article = event.target.closest('.publication');
  suppressed.forEach(item => { if (item !== article) suppressed.delete(item); });
  if (!hoverEnabled || !finePointer.matches) return;
  if (current?.article === article) { clearTimeout(hoverTimer); candidate=null; return; }
  if (current?.mode === 'manual') return;
  if (article && suppressed.has(article)) return;
  if (candidate === article && article) return;
  clearTimeout(hoverTimer);
  candidate = article;
  if (article) hoverTimer=setTimeout(() => openRow(article,'hover'),220);
  else if (current?.mode === 'hover') {
    hoverTimer=setTimeout(() => {
      if (current?.mode === 'hover' && !current.article.contains(document.activeElement)) closeRow();
    },200);
  }
});
document.addEventListener('pointerleave', event => {
  if (event.relatedTarget === null && current?.mode === 'hover') closeRow();
});
publications.forEach(article => {
  article.addEventListener('click', event => {
    const toggle = event.target.closest('[data-toggle-publication]');
    if (!toggle && event.target.closest('a,button,input,select,.abstract-text,.citation-fallback')) return;
    if (current?.article === article) closeRow(true);
    else { suppressed.delete(article); openRow(article,'manual'); }
  });
});
document.addEventListener('pointerdown', event => {
  if (current?.mode === 'manual' && !event.target.closest('.publication')) closeRow();
});
hoverSetting?.addEventListener('change', () => {
  hoverEnabled = hoverSetting.checked;
  closeRow();
  try { localStorage.setItem('shocher-hover-previews',hoverEnabled?'on':'off'); } catch {}
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (current) { closeRow(true); event.preventDefault(); }
  if (nav?.classList.contains('open')) { menu.click(); menu.focus(); }
});
document.addEventListener('visibilitychange', () => {
  if (!current) return;
  if (document.hidden) stopMedia(current.article); else startMedia(current.article);
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) publications.forEach(article => expansionAnimations.get(article)?.cancel());
  if (current) { stopMedia(current.article); startMedia(current.article); }
});

const year = document.querySelector('#publication-year');
year?.addEventListener('change', () => {
  closeRow();
  let count=0;
  publications.forEach(article => {
    const show=!year.value || article.dataset.year===year.value;
    article.hidden=!show;
    if(show) count++;
  });
  document.querySelector('#result-count').textContent=`${count} ${count===1?'publication':'publications'}`;
});
document.querySelectorAll('[data-bibtex]').forEach(button => {
  button.addEventListener('click', async () => {
    const label=button.querySelector('span');
    try {
      await navigator.clipboard.writeText(button.dataset.bibtex);
      label.textContent='copied';
      document.querySelector('#copy-status').textContent='BibTeX citation copied.';
      setTimeout(() => {label.textContent='bibtex';},2000);
    } catch {
      const fallback=button.closest('.pub-content').querySelector('.citation-fallback');
      fallback.textContent=button.dataset.bibtex;
      fallback.hidden=false;
      label.textContent='citation below';
    }
  });
});
document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderMathInElement !== 'function') return;
  document.querySelectorAll('.abstract-text').forEach(element => renderMathInElement(element, {
    delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false},{left:'\\(',right:'\\)',display:false},{left:'\\[',right:'\\]',display:true}],
    throwOnError:false
  }));
});
