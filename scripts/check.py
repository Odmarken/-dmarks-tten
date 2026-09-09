"""Validate local pages, images, styles, chapter IDs and archive controls (stdlib)."""
import argparse
import re
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids, self.references, self.controls, self.images = [], [], [], []
        self.chapters, self.people = [], []
        self.feed(text)

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if attrs.get("id"):
            self.ids.append(attrs["id"])
        for name in ("href", "src"):
            if attrs.get(name):
                self.references.append(attrs[name])
        for name in ("data-archive", "aria-controls", "aria-labelledby"):
            self.controls.extend(attrs.get(name, "").split())
        if tag == "img":
            self.images.append(attrs)
        classes = attrs.get("class", "").split()
        if "event" in classes:
            self.chapters.append(attrs.get("id"))
        if "person" in classes:
            self.people.append(attrs.get("id"))


def check(root=ROOT):
    pages = {path: Page(path.read_text(encoding="utf-8")) for path in root.glob("*.html")}
    errors = []

    def check_reference(origin, reference):
        parts = urlsplit(reference)
        if parts.scheme or parts.netloc or reference.startswith("data:"):
            return
        if parts.path.startswith("/"):
            errors.append(f"{origin.name}: root-relative link breaks project hosting: {reference}")
            return
        target = (origin.parent / unquote(parts.path)).resolve() if parts.path else origin
        if target.is_dir():
            target = target / "index.html"
        if not target.is_file():
            errors.append(f"{origin.name}: missing file {reference}")
        elif parts.fragment and target in pages and unquote(parts.fragment) not in pages[target].ids:
            errors.append(f"{origin.name}: missing anchor {reference}")

    for path, page in pages.items():
        for key, count in Counter(page.ids).items():
            if count > 1:
                errors.append(f"{path.name}: duplicate ID {key}")
        for reference in page.references:
            check_reference(path, reference)
        for control in page.controls:
            if control not in page.ids:
                errors.append(f"{path.name}: missing control target {control}")
        for img in page.images:
            if "alt" not in img:
                errors.append(f"{path.name}: image without alternative text")
        if None in page.chapters or None in page.people:
            errors.append(f"{path.name}: chapter/person without permanent ID")
        if "data:image/" in path.read_text(encoding="utf-8"):
            errors.append(f"{path.name}: embedded image remains")
    for path in (root / "assets/css").glob("*.css"):
        for reference in re.findall(r"url\(\s*['\"]?([^)'\"]+)['\"]?\s*\)", path.read_text(encoding="utf-8")):
            check_reference(path, reference)
    if errors:
        raise ValueError("\n".join(errors))
    chapters = sum(len(page.chapters) for page in pages.values())
    people = sum(len(page.people) for page in pages.values())
    print(f"OK: {len(pages)} pages, {chapters} chapters, {people} people; local links, image paths and dialog targets.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    check(args.root.resolve())
