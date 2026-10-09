const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
links.addEventListener('click', e => {
  if (e.target.closest('a')) {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && links.classList.contains('open')) {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    toggle.focus();
  }
});
const search = document.querySelector('#reading-search');
if (search) search.addEventListener('input', () => {
  const query = search.value.trim().toLocaleLowerCase();
  let scheduled = 0;
  let optional = 0;
  document.querySelectorAll('.reading-card').forEach(card => {
    card.hidden = !card.textContent.toLocaleLowerCase().includes(query);
    if (!card.hidden) {
      if (card.classList.contains('week-card')) scheduled++;
      else optional++;
    }
  });
  document.querySelectorAll('.schedule-part').forEach(part => {
    part.hidden = ![...part.querySelectorAll('.reading-card')].some(card => !card.hidden);
  });
  document.querySelector('#result-count').textContent = scheduled + optional
    ? `${scheduled} scheduled seminar${scheduled === 1 ? '' : 's'} · ${optional} optional topic${optional === 1 ? '' : 's'}`
    : 'No matching topics. Try another topic, author or paper.';
});
