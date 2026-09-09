/* Search the existing content without hiding chapters or changing tree links. */
(() => {
  "use strict";
  const items = [...document.querySelectorAll(".event, .person")];
  if (!items.length) return;
  const isTree = Boolean(document.querySelector("#tree"));
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("sv");
  const index = items.map((element) => ({ element, text: normalize(element.textContent), label: [element.querySelector(".year, .years")?.textContent, element.querySelector("h2")?.textContent].filter(Boolean).join(" · ") }));
  const panel = document.createElement("section");
  panel.className = "page-search";
  panel.setAttribute("aria-label", isTree ? "Sök i släktträdet" : "Sök i tidslinjen");
  panel.innerHTML = `<label for="page-query">${isTree ? "Hitta en person" : "Hitta i livsberättelsen"}</label>
    <div class="search-controls"><input id="page-query" type="search" autocomplete="off" placeholder="Namn, plats eller årtal" aria-controls="search-results"><button type="button" id="search-clear">Rensa</button></div>
    <p class="search-status" role="status"></p><ul id="search-results" hidden></ul>`;
  document.querySelector(isTree ? ".toolbar" : ".timeline").before(panel);
  const input = panel.querySelector("input"), results = panel.querySelector("ul"), status = panel.querySelector(".search-status");
  function update() {
    const terms = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    results.replaceChildren();
    results.hidden = !terms.length;
    if (!terms.length) { status.textContent = `${items.length} ${isTree ? "personer i trädet" : "kapitel i tidslinjen"}.`; return; }
    const matches = index.filter((item) => terms.every((term) => item.text.includes(term)));
    status.textContent = matches.length ? `${matches.length} träffar. Välj en träff för att gå dit.` : "Inga träffar. Prova ett annat namn, en plats eller ett årtal.";
    for (const item of matches) {
      const row = document.createElement("li"), link = document.createElement("a");
      link.href = `#${item.element.id}`;
      link.textContent = item.label;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        if (isTree) document.dispatchEvent(new CustomEvent("tree:reveal", { detail: item.element.id }));
        else item.element.scrollIntoView({ block: "start", behavior: "instant" });
        item.element.setAttribute("tabindex", "-1");
        item.element.focus({ preventScroll: true });
        try { history.replaceState(null, "", link.hash); } catch { /* File previews may restrict history. */ }
      });
      row.append(link); results.append(row);
    }
  }
  input.addEventListener("input", update);
  panel.querySelector("button").addEventListener("click", () => { input.value = ""; update(); input.focus(); });
  update();
})();
