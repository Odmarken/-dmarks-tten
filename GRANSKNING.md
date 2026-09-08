# Granskning av HTML-sidan

## Kodändringar

- Formaterat HTML, CSS och JavaScript med indrag och tydliga avsnitt.
- Samlat stilarna och flyttat sidans JavaScript till slutet, efter alla dialoger.
- Tagit bort rester av ett oanvänt redigeringsläge.
- Kopplat kartplatser till beständiga kapitel-ID:n. Om kapitel flyttas följer rätt plats med; nya kapitel utan kartuppgift får en neutral reservtext.
- Bevarat kartans felmeddelande vid scrollning och lagt till återhämtning när kartbilder börjar laddas igen.
- Låtit innehållet förbli synligt om IntersectionObserver saknas.
- Begränsat kapitelnavigeringens höjd och anpassat långa årtal för mindre skärmar.
- Lagt till en tangentbordslänk till tidslinjen och explicita knapptyper.
- Rensat tillfälliga visningslägen vid HTML-export, inklusive zoom och aktiva källbilder.

Sidans 29 kapitel, släktuppgifter och samtliga inbakade bilder är bevarade. Filen är fortfarande ungefär 15,5 MB eftersom bilderna ligger i HTML-filen. Det gör den lätt att dela som en enda fil, men tyngre att redigera och ladda. Kartan kräver fortfarande internetanslutning.

## Innehåll att gå igenom

- I kapitlet 1932 beskrivs kopplingen till Anders Gunnar Ödmark som okänd. I sammanfattningen står att han var Gunnars son. Förtydliga om det senare är en familjeuppgift eller en styrkt uppgift.
- Sammanfattningen nämner en koppling till den adliga familjen Silfverlåås, medan familjepanelen uttryckligen säger att kopplingen till ätten inte är styrkt. Samma osäkerhet bör framgå i båda avsnitten.

Dessa formuleringar har lämnats oförändrade. Historiska uppgifter, arkivbilder och externa källors riktighet har inte faktagranskats.

## Kontroll

Formateraren kunde tolka HTML, CSS och JavaScript. Automatiska kontroller med en HTML-parser och simulerade webbläsaranrop verifierade bevarad text och bilddata, unika ID:n, interna länkmål, kartans reservläge och återhämtning, dialoger, zoom samt export och återöppning av den exporterade koden.

Visuell kontroll i en riktig webbläsare kunde inte genomföras eftersom ingen ansluten webbläsare fanns tillgänglig. Mobilutseende, kartladdning och tangentbordsfokus behöver därför också provas i webbläsaren.
