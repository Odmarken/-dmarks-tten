/* Fade in only when arriving through one of the two home buttons. */
(() => {
  let entry;
  try {
    entry = JSON.parse(sessionStorage.getItem('home-entry') || 'null');
    sessionStorage.removeItem('home-entry');
  } catch { return; }
  if (!entry || entry.path !== location.pathname || Date.now() - entry.at > 10000 || matchMedia('(prefers-reduced-motion: reduce)').matches || !document.body.animate) return;
  document.body.animate(
    [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' }
  );
})();
