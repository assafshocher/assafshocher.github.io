document.querySelectorAll('.placeholder').forEach(link => link.addEventListener('click', event => event.preventDefault()));
const bib = document.getElementById('bibtex'), copy = document.getElementById('copy-bib');
copy.addEventListener('click', async () => {
  try { if (!navigator.clipboard?.writeText) throw Error('Clipboard API unavailable'); await navigator.clipboard.writeText(bib.textContent); }
  catch { const text = document.createElement('textarea'); text.value = bib.textContent; text.style.cssText = 'position:fixed;left:-9999px'; document.body.append(text); text.select(); const ok = document.execCommand('copy'); text.remove(); if (!ok) { document.getElementById('copy-status').textContent = 'Please select and copy the citation below.'; return; } }
  copy.querySelector('span').textContent = 'Copied'; document.getElementById('copy-status').textContent = 'BibTeX copied to clipboard.'; setTimeout(() => copy.querySelector('span').textContent = 'Copy', 2000);
});
