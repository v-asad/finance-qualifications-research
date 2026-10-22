// Applies the saved theme before first paint to avoid a light/dark flash.
(function () {
  try {
    var t = localStorage.getItem('ledger.theme') || 'system';
    var dark = t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    var size = localStorage.getItem('ledger.textSize') || 'm';
    document.documentElement.dataset.text = size;
    if (localStorage.getItem('ledger.reduceMotion') === '1') document.documentElement.dataset.reduceMotion = '1';
  } catch (e) {}
})();
