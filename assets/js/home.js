/* Preserve bookmarks from when the life story lived on the home page. */
(() => {
  if (location.hash) location.replace('./gunnars-spar.html' + location.search + location.hash);
})();
