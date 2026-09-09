/* Home interactions, with ordinary link behavior retained for new tabs. */
(() => {
  if (location.hash) {
    location.replace('./gunnars-spar.html' + location.search + location.hash);
    return;
  }
  function setup() {
    const links = [...document.querySelectorAll('.home-choice')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let leaving = false, navigationTimer;

    function reset() {
      clearTimeout(navigationTimer);
      leaving = false;
      document.body.classList.remove('is-leaving');
      for (const link of links) {
        link.classList.remove('is-selected');
        link.classList.remove('is-hovered');
        link.querySelectorAll('.choice-ripple').forEach(node => node.remove());
        link.style.removeProperty('--tilt-x');
        link.style.removeProperty('--tilt-y');
      }
    }
    window.addEventListener('pageshow', event => { if (event.persisted) reset(); });

    for (const link of links) {
      link.addEventListener('pointerenter', event => {
        if (!leaving && event.pointerType !== 'touch') link.classList.add('is-hovered');
      });
      link.addEventListener('pointermove', event => {
        if (leaving || event.pointerType === 'touch') return;
        link.classList.add('is-hovered');
        if (reduced.matches) return;
        const rect = link.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
        link.style.setProperty('--pointer-x', `${x * 100}%`);
        link.style.setProperty('--pointer-y', `${y * 100}%`);
        link.style.setProperty('--tilt-x', `${(0.5 - y) * 4}deg`);
        link.style.setProperty('--tilt-y', `${(x - 0.5) * 4}deg`);
      });
      link.addEventListener('pointerleave', () => {
        link.classList.remove('is-hovered');
        link.style.removeProperty('--tilt-x');
        link.style.removeProperty('--tilt-y');
      });
      link.addEventListener('click', event => {
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank' || link.hasAttribute('download')) return;
        if (leaving) { event.preventDefault(); return; }
        if (reduced.matches) return;
        event.preventDefault();
        leaving = true;
        const rect = link.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'choice-ripple';
        ripple.setAttribute('aria-hidden', 'true');
        ripple.style.left = `${event.detail === 0 ? rect.width / 2 : event.clientX - rect.left}px`;
        ripple.style.top = `${event.detail === 0 ? rect.height / 2 : event.clientY - rect.top}px`;
        link.append(ripple);
        link.classList.add('is-selected');
        document.body.classList.add('is-leaving');
        navigationTimer = setTimeout(() => {
          try {
            sessionStorage.setItem('home-entry', JSON.stringify({ path: new URL(link.href).pathname, at: Date.now() }));
          } catch { /* Storage restrictions never block navigation. */ }
          location.assign(link.href);
        }, 480);
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
