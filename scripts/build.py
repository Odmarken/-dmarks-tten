"""Build the static site using Python 3.11+ without third-party packages."""
import shutil
from pathlib import Path
from check import check

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "build"


def build():
    check(ROOT)
    # Only this fixed output directory may be replaced; never follow a symlink.
    if OUTPUT.is_symlink() or OUTPUT.resolve().parent != ROOT.resolve():
        raise ValueError("Unsafe build output path")
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    for name in ("index.html", "silfverlaas.html", ".nojekyll"):
        shutil.copy2(ROOT / name, OUTPUT / name)
    shutil.copytree(ROOT / "assets", OUTPUT / "assets")
    # Preserve historical URLs in the build without keeping the large old page.
    redirect = '''<!doctype html><html lang="sv"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="0;url=./index.html">
<title>Gunnars livsspår har flyttat</title>
<p><a href="./index.html">Öppna Gunnars livsspår</a></p>
<script>location.replace('./index.html'+location.search+location.hash)</script></html>'''
    for name in ("gunnar-andersson-hemsida.html", "gunnar-andersson-hemsida-komplett.html"):
        (OUTPUT / name).write_text(redirect, encoding="utf-8")
    check(OUTPUT)
    total = sum(path.stat().st_size for path in OUTPUT.rglob("*") if path.is_file())
    print(f"Built {OUTPUT} ({total / 1_000_000:.2f} MB).")


if __name__ == "__main__":
    build()
