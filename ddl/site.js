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
  const numberQuery = query.match(/^(?:#\s*|topic\s*#?\s*)(\d+)$/)
    || query.match(/^(\d{1,2})$/);
  const selectedNumber = numberQuery ? Number(numberQuery[1]) : null;
  let matches = 0;
  document.querySelectorAll('.reading-card').forEach(card => {
    card.hidden = selectedNumber === null
      ? !card.textContent.toLocaleLowerCase().includes(query)
      : Number(card.dataset.topicNumber) !== selectedNumber;
    if (!card.hidden) matches++;
  });
  document.querySelectorAll('.schedule-part').forEach(part => {
    part.hidden = ![...part.querySelectorAll('.reading-card')].some(card => !card.hidden);
  });
  document.querySelectorAll('.topic-index-row').forEach(row => {
    row.hidden = document.getElementById(row.dataset.topic).hidden;
  });
  document.querySelector('#topic-index').hidden = matches === 0;
  document.querySelector('#result-count').textContent = matches
    ? `${matches} candidate topic${matches === 1 ? '' : 's'} · Final selection TBD`
    : 'No matching topics. Try another topic, author or paper.';
});
