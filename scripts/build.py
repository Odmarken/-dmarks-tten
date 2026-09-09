"""Build the static site using Python 3.11+ without third-party packages."""
import hashlib
import re
import shutil
from pathlib import Path
from check import check

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "build"


def version_assets(output):
    """Bind each page to its exact CSS/JS, including after a cached deployment."""
    versions = {}

    def replace(match):
        attribute, reference = match.groups()
        if reference not in versions:
            asset = output / reference.removeprefix('./')
            digest = hashlib.sha256(asset.read_bytes()).hexdigest()[:12]
            versioned = asset.with_name(f'{asset.stem}.{digest}{asset.suffix}')
            shutil.copy2(asset, versioned)
            versions[reference] = './' + versioned.relative_to(output).as_posix()
        return f'{attribute}="{versions[reference]}"'

    for page in output.glob('*.html'):
        text = page.read_text(encoding='utf-8')
        text = re.sub(r'(href|src)="(\./assets/(?:css|js)/[^"?]+\.(?:css|js))"', replace, text)
        page.write_text(text, encoding='utf-8')


def build():
    check(ROOT)
    # Only this fixed output directory may be replaced; never follow a symlink.
    if OUTPUT.is_symlink() or OUTPUT.resolve().parent != ROOT.resolve():
        raise ValueError("Unsafe build output path")
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir()
    for name in ("index.html", "gunnars-spar.html", "silfverlaas.html", ".nojekyll"):
        shutil.copy2(ROOT / name, OUTPUT / name)
    shutil.copytree(ROOT / "assets", OUTPUT / "assets")
    version_assets(OUTPUT)
    # Preserve historical URLs in the build without keeping the large old page.
    redirect = '''<!doctype html><html lang="sv"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="refresh" content="0;url=./gunnars-spar.html">
<title>Gunnars livsspår har flyttat</title>
<p><a href="./gunnars-spar.html">Öppna Gunnars livsspår</a></p>
<script>location.replace('./gunnars-spar.html'+location.search+location.hash)</script></html>'''
    for name in ("gunnar-andersson-hemsida.html", "gunnar-andersson-hemsida-komplett.html"):
        (OUTPUT / name).write_text(redirect, encoding="utf-8")
    check(OUTPUT)
    total = sum(path.stat().st_size for path in OUTPUT.rglob("*") if path.is_file())
    print(f"Built {OUTPUT} ({total / 1_000_000:.2f} MB).")


if __name__ == "__main__":
    build()
