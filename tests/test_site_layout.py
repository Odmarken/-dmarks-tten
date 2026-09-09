"""Regression checks for disconnected tree lines and stale layout assets."""
import re
import sys
import tempfile
import unittest
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
from build import version_assets


class Cards(HTMLParser):
    def __init__(self, text, dimensions):
        super().__init__()
        self.cards = []
        self.dimensions = dimensions
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        classes = attrs.get('class', '').split()
        kind = next((k for k in self.dimensions if k in classes), None)
        if tag != 'a' or not kind:
            return
        x = float(re.search(r'left:([\d.]+)px', attrs['style'])[1])
        y = float(re.search(r'top:([\d.]+)px', attrs['style'])[1])
        self.cards.append((x, y, *self.dimensions[kind]))


def path_points(path):
    tokens = re.findall(r'[A-Za-z]|-?\d+(?:\.\d+)?', path)
    points = []
    x = y = 0
    i = 0
    while i < len(tokens):
        command = tokens[i]
        count = {'M': 2, 'H': 1, 'V': 1, 'C': 6}[command]
        args = list(map(float, tokens[i + 1:i + count + 1]))
        i += count + 1
        if command in ('M', 'C'):
            x, y = args[-2:]
        elif command == 'H':
            x = args[0]
        else:
            y = args[0]
        points.append((x, y))
    return points


class TreeLayoutTests(unittest.TestCase):
    def test_every_connector_reaches_a_card_or_branch(self):
        page = (ROOT / 'silfverlaas.html').read_text(encoding='utf-8')
        css = (ROOT / 'assets/css/tree.css').read_text(encoding='utf-8')

        def dimensions(selector):
            rules = re.search(r'\.' + selector + r'\s*\{([^}]+)\}', css)[1]
            return tuple(float(re.search(prop + r':([\d.]+)px', rules)[1]) for prop in ('width', 'height'))

        svg = ET.fromstring(re.search(r'<svg\b.*?</svg>', page, re.S)[0])
        # A mismatched viewBox scales and centers all lines away from their cards.
        self.assertEqual(tuple(map(float, svg.attrib['viewBox'].split()[2:])), dimensions('tree'))
        cards = Cards(page, {kind: dimensions(kind) for kind in ('person', 'journey-stop')}).cards
        paths = [path_points(p.attrib['d']) for p in svg.iter('path')]
        self.assertGreater(len(paths), 80)

        def on_card(x, y):
            return any(
                ((abs(x-l) <= 1 or abs(x-l-w) <= 1) and t-1 <= y <= t+h+1)
                or ((abs(y-t) <= 1 or abs(y-t-h) <= 1) and l-1 <= x <= l+w+1)
                for l, t, w, h in cards)

        def on_branch(x, y, current):
            return any(
                (abs(ax-bx) < .01 and abs(x-ax) <= 1 and min(ay, by)-1 <= y <= max(ay, by)+1)
                or (abs(ay-by) < .01 and abs(y-ay) <= 1 and min(ax, bx)-1 <= x <= max(ax, bx)+1)
                for index, points in enumerate(paths) if index != current
                for (ax, ay), (bx, by) in zip(points, points[1:]))

        for index, points in enumerate(paths):
            for x, y in (points[0], points[-1]):
                with self.subTest(path=index, endpoint=(x, y)):
                    self.assertTrue(on_card(x, y) or on_branch(x, y, index), 'Disconnected line')

    def test_changed_layout_never_reuses_a_cached_asset_url(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory)
            asset = output / 'assets/css/tree.css'
            asset.parent.mkdir(parents=True)
            page = output / 'silfverlaas.html'
            html = '<link rel="stylesheet" href="./assets/css/tree.css">'
            urls = []
            for content in ('.tree {height:6320px}', '.tree {height:9480px}'):
                asset.write_text(content, encoding='utf-8')
                page.write_text(html, encoding='utf-8')
                version_assets(output)
                url = re.search(r'href="([^"]+)"', page.read_text(encoding='utf-8'))[1]
                urls.append(url)
                self.assertEqual((output / url).read_text(encoding='utf-8'), content)
            self.assertNotEqual(*urls)
            # The old page still resolves to its matching old layout.
            self.assertIn('6320px', (output / urls[0]).read_text(encoding='utf-8'))


if __name__ == '__main__':
    unittest.main()
