# Gunnar Valfrid – livsspår

Tidslinje med 30 kapitel, källbilder och ett släktträd med 62 personer.

Webbplats: https://odmarken.github.io/-dmarks-tten/

## Publicering på GitHub

Webbplatsen publiceras med GitHub Pages. När ändringar skickas till `main` kör `.github/workflows/pages.yml` JavaScript-kontrollerna, bygger sidan med Python och publicerar innehållet i `build/`. Under repositoryts **Settings → Pages → Build and deployment** ska källan vara **GitHub Actions**.

Projektet använder inte längre Sites för publicering. Länkarna är relativa och fungerar under GitHub-projektets adress.

## Starta och kontrollera

Kräver Python 3.11 eller senare. Inga Python-paket behöver installeras.

```powershell
python scripts/serve.py
```

Öppna http://127.0.0.1:8000/ och avsluta med Ctrl+C. Servern bygger sidan vid start. Efter ändringar: kör byggkommandot i en annan terminal och ladda om sidan.

```powershell
python scripts/check.py
python -m unittest discover -s tests -p "test_*.py"
python scripts/build.py
node --check assets/js/timeline.js
node --check assets/js/tree.js
node --check assets/js/search.js
node --test tests/interactions.test.cjs
```

Node behövs bara för JavaScript-kontrollerna. Sidorna kan även öppnas direkt från `index.html`. Bygget ger CSS- och JavaScript-filer innehållsbaserade filnamn så att webbläsaren alltid laddar den layout som hör till sidan. Linjekontrollen verifierar att SVG-ytan matchar trädets storlek och att alla linjer ansluter till rutor eller grenar.

## Struktur och redigering

| Fil eller mapp | Innehåll |
| --- | --- |
| `index.html` | Berättelsen, kapiteltexter, familj och källbildsdialoger. |
| `silfverlaas.html` | Släktträdets personkort, linjer, platser och källnotiser. |
| `assets/css/` | Tidslinjens, trädets och sökningens stilar. |
| `assets/js/` | Karta, dialoger, zoom, panorering och sökning. |
| `assets/images/` | Extraherade originalbilder; filnamn bygger på bildinnehållet. |
| `assets/arms/` | Släktvapen med bildkällor på trädsidan. |
| `sources/` | Lokala källanteckningar, originalunderlag och dataexporter. Ignoreras av Git och publiceras inte. |
| `sources/legacy-scripts/` | Tidigare generatorer sparade som referenstext. |
| `scripts/` | Python för kontroll, bygge och lokal server. |
| `tests/` | Funktionstester för sökning och trädnavigering. |
| `build/` | Genererad publiceringsmapp; ändra inte filer här. |

Redigera innehållet i de två HTML-filerna och beteendet i `assets/js/`. Behåll befintliga kapitel- och person-ID:n så att bokmärken och kartplatser fortsätter fungera. Livsberättelsen läses genom att scrolla, utan sökruta. Sökningen i släktträdet läser personkorten automatiskt. `sources/tree-lineage.json` är den importerade dataexporten, inte en aktiv generator; ändringar där ändrar inte sidan.

Lägg nya bilder i `assets/images/` och använd relativa länkar. Kör `python scripts/build.py` efter ändringar. Bygget innehåller endast webbsidor och webbassets, samt små omdirigeringar för de två gamla Gunnar-adresserna. Forskningsanteckningarna i `sources/` stannar lokalt och skickas inte till GitHub. Utvecklingsskripten finns i repositoryt men publiceras inte på webbplatsen.

Den stora gamla HTML-filen är ersatt av `index.html`. Tidigare version finns i Git-historiken; originalen på skrivbordet är bevarade. GitHub Pages publicerar den genererade `build/`-mappen. Omdirigeringarna från de gamla sidnamnen ingår där.

Karta och externa källsidor behöver internet. Historiska uppgifter och tidigare osäkerhetsmarkeringar är bevarade; omstruktureringen är ingen ny faktagranskning.
