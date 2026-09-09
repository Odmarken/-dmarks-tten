(() => {
        "use strict";

        const body = document.body;
        const residencePanel = document.querySelector("#residence-panel"),
          residenceTrigger = document.querySelector("#residence-open");
        let residenceClosing = false;
        residenceTrigger.addEventListener("click", () => {
          residenceClosing = false;
          residencePanel.showModal();
          requestAnimationFrame(() =>
            requestAnimationFrame(() =>
              residencePanel.classList.add("visible"),
            ),
          );
        });
        function closeResidence() {
          if (residenceClosing || !residencePanel.open) return;
          residenceClosing = true;
          residencePanel.classList.remove("visible");
          setTimeout(
            () => {
              residencePanel.close();
              residenceClosing = false;
              residenceTrigger.focus({ preventScroll: true });
            },
            matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 550,
          );
        }
        document
          .querySelector("#residence-close")
          .addEventListener("click", closeResidence);
        residencePanel.addEventListener("cancel", (e) => {
          e.preventDefault();
          closeResidence();
        });
        residencePanel.addEventListener("click", (e) => {
          if (e.target !== residencePanel) return;
          const r = residencePanel.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            closeResidence();
        });
        const familyPanel = document.querySelector("#family-panel"),
          familyTrigger = document.querySelector("#family-open");
        let familyClosing = false;
        familyTrigger.addEventListener("click", () => {
          familyClosing = false;
          familyPanel.showModal();
          body.classList.add("family-open");
          requestAnimationFrame(() =>
            requestAnimationFrame(() => familyPanel.classList.add("visible")),
          );
        });
        function closeFamily() {
          if (familyClosing || !familyPanel.open) return;
          familyClosing = true;
          familyPanel.classList.remove("visible");
          setTimeout(
            () => {
              familyPanel.close();
              body.classList.remove("family-open");
              familyClosing = false;
              familyTrigger.focus({ preventScroll: true });
            },
            matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 650,
          );
        }
        document
          .querySelector("#family-close")
          .addEventListener("click", closeFamily);
        familyPanel.addEventListener("cancel", (e) => {
          e.preventDefault();
          closeFamily();
        });
        familyPanel.addEventListener("click", (e) => {
          if (e.target !== familyPanel) return;
          const r = familyPanel.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            closeFamily();
        });

        // Utan IntersectionObserver visas innehållet utan inrullningsanimationer.
        const observer =
          "IntersectionObserver" in window
            ? new IntersectionObserver(
                (entries) => {
                  entries.forEach((e) => {
                    if (e.isIntersecting) e.target.classList.add("seen");
                  });
                },
                { threshold: 0.12 },
              )
            : null;
        if (observer) {
          body.classList.add("animated");
          document
            .querySelectorAll(".event")
            .forEach((e) => observer.observe(e));
        }
        const events = [...document.querySelectorAll(".event")],
          gaps = [...document.querySelectorAll(".gap")],
          rail = document.querySelector(".chapter-rail");
        events.forEach((e, i) => {
          e.id = e.id || "chapter-" + i;
          const a = document.createElement("a");
          a.href = "#" + e.id;
          a.title = e.querySelector(".year").textContent;
          a.setAttribute("aria-label", "Gå till " + a.title);
          rail.append(a);
        });
        const reduced = matchMedia("(prefers-reduced-motion: reduce)"),
          clamp = (v, a, b) => Math.min(b, Math.max(a, v));
        let queued = false;

        // Kartplatser följer kapitel-ID även när kapitel flyttas.
        const mapPlaces = {
          birth: {
            center: [58.8398, 16.5138],
            zoom: 11,
            title: "Björkvik med omnejd",
            detail: "Födelseförsamling · exakt födelseplats inte markerad",
          },
          "chapter-1": {
            center: [58.80276, 16.78535],
            zoom: 11,
            title: "Stigtomta med omnejd",
            detail: "Kjulstaspåret · ungefärligt område",
          },
          "chapter-2": {
            center: [58.80276, 16.78535],
            zoom: 11,
            title: "Stigtomta med omnejd",
            detail: "Skåra · vidare till Hyltinge 1909",
          },
          "hyltinge-1909": {
            center: [59.08, 16.82],
            zoom: 10,
            title: "Hyltinge med omnejd",
            detail: "Långdunker och Dalstugan · ungefärligt område",
          },
          "chapter-4": {
            center: [58.8398, 16.5138],
            zoom: 11,
            title: "Björkvik med omnejd",
            detail: "Amalia och de yngre pojkarnas område",
          },
          "hyltinge-1910": {
            center: [59.08, 16.82],
            zoom: 10,
            title: "Hyltinge med omnejd",
            detail: "Kyrkobokförd här · bostadsadress inte fastställd",
          },
          "gavle-1914": {
            center: [60.675, 17.142],
            zoom: 11,
            title: "Gävle · angivet flyttmål",
            detail: "Utflyttning 1 maj 1914 · adress och mottagande återstår",
          },
          "sjomanshus-1914": {
            center: [58.753, 17.009],
            zoom: 11,
            title: "Nyköping · sjömanshusspåret",
            detail: "Institutionens ort · ingen bostadsadress belagd",
          },
          "monstring-1915": {
            center: [59.329, 18.069],
            zoom: 10,
            title: "Stockholm · mönstringsmeddelandet 1915",
            detail: "Avsändande sjömanshus · hans vistelseort inte fastställd",
          },
          "avford-1919": {
            center: [58.753, 17.009],
            zoom: 11,
            title: "Nyköping · avföringen 1919",
            detail: "Sjömanshusets register · hans vistelseort är okänd",
          },
          "odeshog-1924": {
            center: [58.229, 14.653],
            zoom: 11,
            title: "Ödeshög · vigseln 1924",
            detail: "Församlingen · Björklundas exakta bostad inte markerad",
          },
          "odeshog-1929": {
            center: [58.229, 14.653],
            zoom: 11,
            title: "Ödeshög · kyrkobokföringen",
            detail: "1929–1930 · faktisk vistelseort okänd",
          },
          "odeshog-1932": {
            center: [58.229, 14.653],
            zoom: 11,
            title: "Ödeshög · återföringen 1932",
            detail: "Skriven i församlingen · utan bestämt hemvist",
          },
          "anders-1932": {
            center: [63.568, 19.5],
            zoom: 11,
            title: "Nordmaling · Anna och Anders, 1932",
            detail: "Födelseförsamling · exakt byggnad inte markerad",
          },
          "bjorklunda-1941": {
            center: [58.229, 14.653],
            zoom: 11,
            title: "Björklunda · Ödeshög",
            detail: "1941 · exakt byggnad inte markerad",
          },
          "skilsmassa-1942": {
            center: [58.229, 14.653],
            zoom: 11,
            title: "Ödeshög · skilsmässan 1942",
            detail: "Kyrkobokföringens ort · ingen vistelseadress fastställd",
          },
          "undersaker-1942": {
            center: [63.35, 13.46],
            zoom: 11,
            title: "Nyland · Järpen",
            detail: "Inflyttningen återfunnen · exakt bostad inte markerad",
          },
          "signe-1942": {
            center: [63.35, 13.46],
            zoom: 11,
            title: "Nyland · äktenskapet 1942",
            detail: "Gustaf Valfrid och Signe · ungefärligt område",
          },
          "hansa-1944": {
            center: [58.15, 18.15],
            zoom: 7,
            title: "S/S Hansa · Nynäshamn–Visby, 1944",
            detail:
              "Översikt över farvattnen · inget belägg för att Gustaf Valfrid var ombord",
          },
          "ny-bok-1950": {
            center: [63.35, 13.46],
            zoom: 11,
            title: "Nyland · bokhänvisningen 1950",
            detail: "Nästa sida återstår att läsa · ingen ny bostad fastställd",
          },
          "mantal-1950": {
            center: [63.35, 13.46],
            zoom: 11,
            title: "Nyland · Slagsån 79, 1950",
            detail: "Undersåker med omnejd · exakt byggnad inte markerad",
          },
          "foto-1956": {
            center: [63.36, 13.04],
            zoom: 9,
            title: "Gevsjön — Järpen",
            detail:
              "Gevsjön 1956 · Gunnar Andersson, Järpen, nämns i museets uppgifter",
          },
          "bef-1960": {
            center: [63.35, 13.46],
            zoom: 11,
            title: "Nyland · Slagsån 79, 1960",
            detail: "Undersåker med omnejd · exakt byggnad inte markerad",
          },
          "bef-1970": {
            center: [63.35, 13.46],
            zoom: 11,
            title: "Hålland · postadress 1970",
            detail: "Undersåker med omnejd · exakt byggnad inte markerad",
          },
          "bef-1975": {
            center: [63.35, 13.46],
            zoom: 11,
            title: "Järpen · Rönnvägen 3, 1975",
            detail: "Undersåker med omnejd · exakt byggnad inte markerad",
          },
          "signe-1976": {
            center: [63.35, 13.46],
            zoom: 11,
            title: "Undersåker · Signe avlider 1976",
            detail: "Undersåker med omnejd · exakt byggnad inte markerad",
          },
          "bef-1980": {
            center: [63.35, 13.46],
            zoom: 11,
            title: "Järpen · Rönnvägen 3, 1980–1988",
            detail: "Undersåker med omnejd · exakt byggnad inte markerad",
          },
          "museiuppgift-1988": {
            center: [63.35, 13.46],
            zoom: 11,
            title: "Nyland · museiuppgiften 1988",
            detail: "Signe anges som gift med Gunnar · ungefärligt område",
          },
          "bef-1990": {
            center: [63.35, 13.46],
            zoom: 11,
            title: "Järpen · Rönnvägen 3, 1990",
            detail: "Undersåker med omnejd · exakt byggnad inte markerad",
          },
          "chapter-29": {
            center: [63.31415, 13.2529],
            zoom: 11,
            title: "Undersåker med omnejd",
            detail: "Gravspåret · Signe och födelsedatumet stärker kopplingen",
          },
        };
        let backdropMap = null,
          mapMarker = null,
          mapIndex = -1,
          mapTimer = null,
          mapRevision = 0;
        let mapError = window.L ? "" : "Kartan kräver internetanslutning";
        function changeMap(i, inGap) {
          body.classList.toggle(
            "hansa-scene",
            !inGap && events[i]?.id === "hansa-1944",
          );
          body.classList.toggle(
            "ship-scene",
            !inGap &&
              ["sjomanshus-1914", "monstring-1915"].includes(events[i]?.id),
          );
          const place = mapPlaces[events[i]?.id] || {
            title: "Plats saknas",
            detail: "Ingen kartplats har angetts för kapitlet",
            hidden: true,
          };
          body.classList.toggle("map-off", inGap || !!place.hidden);
          document.querySelector("#map-place").textContent = inGap
            ? "En lucka i spåret"
            : place.title;
          document.querySelector("#map-detail").textContent =
            mapError ||
            (inGap
              ? "Vistelseort okänd · kartan visar närmast följda område"
              : place.hidden
                ? place.detail
                : "Nutida karta · " + place.detail);
          if (!backdropMap || place.hidden || mapIndex === i) return;
          mapIndex = i;
          const revision = ++mapRevision;
          clearTimeout(mapTimer);
          const node = document.querySelector("#map-backdrop");
          node.style.opacity = ".08";
          mapTimer = setTimeout(
            () => {
              if (revision !== mapRevision) return;
              backdropMap.stop();
              backdropMap.setView(place.center, place.zoom, { animate: false });
              mapMarker.setLatLng(place.center);
              node.style.opacity = "";
            },
            reduced.matches ? 0 : 450,
          );
        }
        if (window.L) {
          backdropMap = L.map("map-backdrop", {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            touchZoom: false,
            zoomAnimation: false,
          }).setView(mapPlaces.birth.center, 11);
          const tiles = L.tileLayer(
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            { maxZoom: 14, updateWhenIdle: true, keepBuffer: 1 },
          ).addTo(backdropMap);
          tiles.on("tileerror", () => {
            mapError =
              "Kartan kunde inte laddas · tidslinjen går fortfarande att läsa";
            document.querySelector("#map-detail").textContent = mapError;
          });
          tiles.on("tileload", () => {
            mapError = "";
            scheduleProgress();
          });
          mapMarker = L.marker(mapPlaces.birth.center, {
            interactive: false,
            keyboard: false,
            icon: L.divIcon({
              className: "map-point",
              iconSize: [10, 10],
              iconAnchor: [5, 5],
            }),
          }).addTo(backdropMap);
        } else {
          document.querySelector("#map-detail").textContent =
            "Kartan kräver internetanslutning";
        }
        function progress() {
          queued = false;
          const vh = innerHeight,
            max = document.documentElement.scrollHeight - vh;
          document.querySelector(".top-progress").style.transform =
            "scaleX(" + clamp(scrollY / Math.max(1, max), 0, 1) + ")";
          const tl = document.querySelector(".timeline"),
            r = tl.getBoundingClientRect();
          document.querySelector(".spine-fill").style.height =
            clamp(vh * 0.58 - r.top, 0, r.height) + "px";
          let nearest = 0,
            best = Infinity;
          events.forEach((e, i) => {
            const box = e.getBoundingClientRect(),
              d = Math.abs(
                box.top + Math.min(box.height * 0.4, 250) - vh * 0.48,
              );
            if (d < best) {
              best = d;
              nearest = i;
            }
            if (!reduced.matches) {
              const t = clamp((vh - box.top) / (vh + box.height), 0, 1);
              e.style.setProperty("--photo-y", (0.5 - t) * 38 + "px");
              e.style.setProperty("--photo-rotate", (0.5 - t) * 5 + "deg");
              e.style.setProperty("--photo-scale", String(1.075 - t * 0.065));
            }
          });
          const inGap = gaps.some((g) => {
            const b = g.getBoundingClientRect();
            return b.top < vh * 0.55 && b.bottom > vh * 0.55;
          });
          changeMap(nearest, inGap);
          events.forEach((e, i) => {
            e.classList.toggle("active", i === nearest);
            rail.children[i].classList.toggle("current", i === nearest);
            if (i === nearest)
              rail.children[i].setAttribute("aria-current", "step");
            else rail.children[i].removeAttribute("aria-current");
          });
          if (!reduced.matches)
            gaps.forEach((e) => {
              const b = e.getBoundingClientRect(),
                t = clamp((vh - b.top) / (vh + b.height), 0, 1);
              e.style.setProperty("--gap-y", (0.5 - t) * 60 + "px");
              e.style.setProperty(
                "--gap-opacity",
                String(clamp(1 - Math.abs(0.5 - t) * 1.2, 0.5, 1)),
              );
            });
        }
        // Samla scrollning och layoutändringar till en uppdatering per bildruta.
        function scheduleProgress() {
          if (!queued) {
            queued = true;
            requestAnimationFrame(progress);
          }
        }
        addEventListener("scroll", scheduleProgress, { passive: true });
        addEventListener("resize", scheduleProgress);
        reduced.addEventListener("change", scheduleProgress);
        document
          .querySelectorAll("img")
          .forEach((img) => img.addEventListener("load", scheduleProgress));
        progress();

        // Källbildsvisning och zoom

        (() => {
          const modal = document.querySelector("#archive-dialog"),
            zoom = document.querySelector("#archive-zoom");
          let opener;
          function resetZoom() {
            modal.classList.remove("zoomed");
            zoom.setAttribute("aria-pressed", "false");
            zoom.textContent = "Förstora";
          }
          function toggleZoom() {
            const expanded = modal.classList.toggle("zoomed");
            zoom.setAttribute("aria-pressed", String(expanded));
            zoom.textContent = expanded ? "Anpassa" : "Förstora";
          }
          document.querySelectorAll(".archive-open").forEach((button) =>
            button.addEventListener("click", () => {
              opener = button;
              resetZoom();
              modal
                .querySelectorAll(".archive-sheet")
                .forEach((sheet) =>
                  sheet.classList.toggle(
                    "active",
                    sheet.id === button.dataset.archive,
                  ),
                );
              document.querySelector("#archive-title").textContent =
                button.textContent.split(" · visa")[0];
              modal.showModal();
              modal.scrollTop = 0;
              const area = modal.querySelector(
                ".archive-sheet.active .archive-image-scroll",
              );
              if (area) {
                area.scrollTop = 0;
                area.scrollLeft = 0;
              }
            }),
          );
          zoom.addEventListener("click", toggleZoom);
          modal
            .querySelectorAll(".archive-image-scroll img")
            .forEach((img) => img.addEventListener("click", toggleZoom));
          document
            .querySelector("#archive-close")
            .addEventListener("click", () => modal.close());
          modal.addEventListener("click", (e) => {
            if (e.target === modal) {
              const r = modal.getBoundingClientRect();
              if (
                e.clientX < r.left ||
                e.clientX > r.right ||
                e.clientY < r.top ||
                e.clientY > r.bottom
              )
                modal.close();
            }
          });
          modal.addEventListener("close", () => {
            resetZoom();
            opener?.focus({ preventScroll: true });
          });
        })();
      })();
