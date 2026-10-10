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
if (search) {
  const cards = [...document.querySelectorAll('.reading-card')];
  const familyLinks = [...document.querySelectorAll('.part-links [data-family-filter]')];
  let activeFamily = null;

  function applyFilters() {
    const query = search.value.trim().toLocaleLowerCase();
    const numberQuery = query.match(/^(?:#\s*|topic\s*#?\s*)(\d+)$/)
      || query.match(/^(\d{1,2})$/);
    const selectedNumber = numberQuery ? Number(numberQuery[1]) : null;
    let matches = 0;
    cards.forEach(card => {
      const familyMatch = activeFamily === null || card.dataset.topicFamily === activeFamily;
      const searchMatch = selectedNumber === null
        ? card.textContent.toLocaleLowerCase().includes(query)
        : Number(card.dataset.topicNumber) === selectedNumber;
      card.hidden = !familyMatch || !searchMatch;
      if (!card.hidden) matches++;
    });
    document.querySelectorAll('.topic-index-row').forEach(row => {
      row.hidden = document.getElementById(row.dataset.topic).hidden;
    });
    document.querySelector('#topic-index').hidden = matches === 0;
    document.querySelector('#ranked-topics').hidden = matches === 0;
    familyLinks.forEach(link => {
      if ((link.dataset.familyFilter || null) === activeFamily) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    const family = activeFamily === null
      ? 'All topics'
      : familyLinks.find(link => link.dataset.familyFilter === activeFamily).textContent;
    document.querySelector('#result-count').textContent = matches
      ? `${matches} of ${cards.length} candidate topic${matches === 1 ? '' : 's'} · ${family} · Recommended priority order · Final selection TBD`
      : `No matching topics · ${family}. Change the search or choose All topics.`;
  }

  function revealDestination(hash, scroll = false) {
    const destination = document.getElementById(hash);
    const card = destination?.closest('.reading-card');
    if (!card) return;
    if (card.hidden) {
      activeFamily = null;
      search.value = '';
      applyFilters();
    }
    if (scroll) requestAnimationFrame(() => destination.scrollIntoView({ block: 'start' }));
  }

  function followHash() {
    const hash = location.hash.slice(1);
    const family = hash.match(/^part-(\d+)$/)?.[1];
    if (family && familyLinks.some(link => link.dataset.familyFilter === family)) {
      activeFamily = family;
      applyFilters();
    } else if (hash === 'all-topics') {
      activeFamily = null;
      search.value = '';
      applyFilters();
    } else if (!hash) {
      activeFamily = null;
      applyFilters();
    } else {
      revealDestination(hash, true);
    }
  }

  search.addEventListener('input', applyFilters);
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    if (link.hasAttribute('data-family-filter')) {
      activeFamily = link.dataset.familyFilter || null;
      if (activeFamily === null) search.value = '';
      applyFilters();
    } else {
      revealDestination(link.getAttribute('href').slice(1), true);
    }
  });
  window.addEventListener('hashchange', followHash);
  applyFilters();
  followHash();
}
