# Teknisk granskning – 9 september 2026

Publiceringen är flyttad till GitHub Pages. Arbetsflödet i `.github/workflows/pages.yml` kontrollerar, bygger och publicerar `build/` när `main` uppdateras. Sites-konfigurationen är borttagen från projektet.

Källunderlaget i `sources/` behålls lokalt och är undantaget från det publika GitHub-repositoryt. Webbplatsens befintliga texter och bildmaterial ligger i HTML-filerna och `assets/`.

Senare justering: sökrutan i livsberättelsen är borttagen på användarens begäran. Tidslinjen läses genom att scrolla. Släktträdets sökning finns kvar.

Det nyare materialet från skrivbordets `dist`, `sources` och `scripts` har införts i projektet. Berättelsetexten på båda sidorna har jämförts med originalen, med undantag för blanksteg och den tillagda tillgänglighetslänken. Alla 30 kapitel, 56 personkort och 87 HTML-bildförekomster är bevarade. Inbakade bilders bytes har jämförts med de extraherade filerna.

HTML, CSS, JavaScript, bilder och källunderlag ligger i separata filer. Relativa sid- och bildlänkar fungerar även under en projektadress som GitHub Pages. Den tidigare reparerade tidslinjekoden är återanvänd: kartplatser kopplas till kapitel-ID, kartans felstatus bevaras och innehållet förblir läsbart utan IntersectionObserver.

Sökning hittar kapitel och personer via namn, plats eller årtal och hanterar svenska tecken. Trädets sökträffar visas i läsbar zoom. Överblick anpassas till hela trädets bredd även på små skärmar. Länken till platser går till den första platsgrenen. Musdrag och pekskärmssvep bevaras.

Python-kontrollerna och bygget är godkända: lokala länkar, bildsökvägar, unika ID:n, alternativtexter och dialogmål är kontrollerade. JavaScript-filerna klarar Nodes syntaxkontroll. Två funktionstester för sökning och trädnavigering är godkända, inklusive mobil överblick, zoom till person, sökning utan diakritiska tecken, flera sökord och tomma träfflistor.

Bygget håller forskningsunderlag utanför publiceringsmappen och skapar omdirigeringar från de gamla adresserna. Funktionstesterna använder en simulerad DOM; det ersätter inte visuell kontroll i en riktig webbläsare.

Historiska påståenden och externa källor har inte faktagranskats på nytt. Äldre källanteckningar kan beskriva tidigare forskningsbeslut; sidorna återger det senast importerade materialet. Ingen visuell webbläsargranskning har genomförts.
