/* Tree navigation: zoom, mouse drag, touch scrolling, and search targets. */
(() => {
  "use strict";
  const viewport = document.querySelector("#viewport");
  const space = document.querySelector("#space");
  const tree = document.querySelector("#tree");
  const width = tree.offsetWidth, height = tree.offsetHeight;
  let scale = 1, overview = false;
  function setScale(value) {
    const x = (viewport.scrollLeft + viewport.clientWidth / 2) / scale;
    const y = (viewport.scrollTop + viewport.clientHeight / 2) / scale;
    scale = Math.max(Math.min(0.08, viewport.clientWidth / width), Math.min(1.5, value));
    tree.style.transform = `scale(${scale})`;
    space.style.width = `${width * scale}px`;
    space.style.height = `${height * scale}px`;
    document.querySelector("#zoom").textContent = `${Math.round(scale * 100)}%`;
    viewport.scrollLeft = x * scale - viewport.clientWidth / 2;
    viewport.scrollTop = y * scale - viewport.clientHeight / 2;
  }
  function reveal(id) {
    const person = document.getElementById(id);
    if (!person || !tree.contains(person)) return;
    overview = false;
    setScale(1);
    viewport.scrollIntoView({ block: "center", behavior: "instant" });
    viewport.scrollLeft = person.offsetLeft - (viewport.clientWidth - person.offsetWidth) / 2;
    viewport.scrollTop = person.offsetTop - (viewport.clientHeight - person.offsetHeight) / 2;
  }
  document.querySelector("#minus").onclick = () => { overview = false; setScale(scale - 0.15); };
  document.querySelector("#plus").onclick = () => { overview = false; setScale(scale + 0.15); };
  document.querySelector("#fit").onclick = () => { overview = true; setScale(viewport.clientWidth / width); viewport.scrollLeft = 0; };
  document.querySelector("#read").onclick = () => { overview = false; setScale(1); };
  document.querySelector("#places-jump").onclick = (event) => { event.preventDefault(); reveal("peter1645"); };
  document.querySelector("#last").onclick = (event) => { event.preventDefault(); reveal("viktorodmark"); };
  document.addEventListener("tree:reveal", (event) => reveal(event.detail));
  window.addEventListener("resize", () => { if (overview) setScale(viewport.clientWidth / width); });
  setScale(innerWidth < 650 ? 0.85 : Math.min(1, viewport.clientWidth / 1900));
  viewport.scrollTop = 0; viewport.scrollLeft = Number(tree.dataset?.startX || 0) * scale;
  let pan = null, suppressClickUntil = 0;
  viewport.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.button !== 0 || !event.isPrimary) return;
    const bounds = viewport.getBoundingClientRect();
    if (event.clientX >= bounds.left + viewport.clientWidth || event.clientY >= bounds.top + viewport.clientHeight) return;
    pan = { id: event.pointerId, x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop, dragging: false };
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!pan || event.pointerId !== pan.id) return;
    const dx = event.clientX - pan.x, dy = event.clientY - pan.y;
    if (!pan.dragging && Math.hypot(dx, dy) > 5) { pan.dragging = true; viewport.setPointerCapture(event.pointerId); viewport.classList.add("is-dragging"); }
    if (pan.dragging) { event.preventDefault(); viewport.scrollLeft = pan.left - dx; viewport.scrollTop = pan.top - dy; }
  });
  function finishPan(event) {
    if (!pan || event.pointerId !== pan.id) return;
    const finished = pan; pan = null;
    if (finished.dragging) suppressClickUntil = performance.now() + 350;
    if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
    viewport.classList.remove("is-dragging");
  }
  window.addEventListener("pointerup", finishPan);
  window.addEventListener("pointercancel", finishPan);
  viewport.addEventListener("lostpointercapture", finishPan);
  viewport.addEventListener("dragstart", (event) => event.preventDefault());
  viewport.addEventListener("click", (event) => { if (performance.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
  function followHash() { try { if (location.hash) reveal(decodeURIComponent(location.hash.slice(1))); } catch { /* Ignore malformed hashes. */ } }
  window.addEventListener("hashchange", followHash);
  followHash();
})();
