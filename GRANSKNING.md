# Granskning av den kompletta sidan

Den aktuella sidan är `gunnar-andersson-hemsida-komplett.html`. `index.html` leder besökare från webbplatsens huvudadress till den. Den äldre berättelsefilen är borttagen; tidigare versioner finns kvar i Git-historiken.

## Utförda ändringar

- Formaterat HTML, CSS och JavaScript med tydliga avsnitt.
- Samlat stilarna och placerat sidans JavaScript efter samtliga dialoger.
- Tagit bort oanvända rester av redigeringsläget.
- Kopplat kartplatser till beständiga kapitel-ID:n och lagt till reservtext för kapitel utan kartuppgift.
- Rättat kartans felmeddelanden vid scrollning och återhämtning när kartbilder åter laddas.
- Bevarat synligt innehåll när IntersectionObserver saknas.
- Anpassat kapitelnavigeringens höjd och långa årtal för mindre skärmar samt lagt till tangentbordsgenväg till tidslinjen och explicita knapptyper.

Alla 30 kapitel, texter och 57 inbakade bildförekomster är bevarade, inklusive uppgifterna om Anna och Anders och avsnittet om Hansa. Filen är cirka 20,4 MB eftersom bilderna är inbakade. Kartan kräver internetanslutning.

## Kontroller

HTML-parser och simulerade webbläsaranrop verifierade bevarad text och bilddata, unika ID:n, interna länkmål, samtliga källbildsknappar, dialoger, zoom, Nordmalings- och Hansa-kapitlens kartplatser, växling av Hansa-bakgrund samt kartans felläge och återhämtning. Formateraren kunde tolka HTML, CSS och JavaScript.

Ingen visuell kontroll i en riktig webbläsare har genomförts. Historiska uppgifter och externa källor har inte faktagranskats. Formuleringen om en koppling till den adliga ätten Silfverlåås i sammanfattningen är fortfarande säkrare än familjepanelens uppgift att kopplingen inte är styrkt; texten har lämnats oförändrad.
