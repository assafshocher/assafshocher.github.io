document.addEventListener('DOMContentLoaded', () => {
  if (typeof renderMathInElement === 'function') {
    renderMathInElement(document.getElementById('abstract'), {
      delimiters: [{left: '$', right: '$', display: false}],
      throwOnError: false
    });
  }
  const button = document.getElementById('copy-bib');
  const status = document.getElementById('copy-status');
  button.addEventListener('click', async () => {
    const citation = document.getElementById('bibtex').textContent;
    try {
      await navigator.clipboard.writeText(citation);
      button.textContent = 'Copied';
      status.textContent = 'BibTeX copied to clipboard.';
      setTimeout(() => { button.textContent = 'Copy'; }, 2000);
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('bibtex'));
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Citation selected. Press Ctrl+C or Command+C to copy.';
    }
  });
});
