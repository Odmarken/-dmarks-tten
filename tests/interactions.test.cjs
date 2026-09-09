const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

class Element {
  constructor(id = '') {
    this.id = id; this.listeners = {}; this.style = {}; this.children = [];
    this.scrollLeft = 0; this.scrollTop = 0; this.textContent = ''; this.value = '';
    this.classList = { add() {}, remove() {} };
  }
  addEventListener(name, callback) { (this.listeners[name] ??= []).push(callback); }
  dispatchEvent(event) { for (const callback of this.listeners[event.type] ?? []) callback(event); }
  setAttribute(name, value) { this[name] = value; }
  append(child) { this.children.push(child); }
  replaceChildren() { this.children = []; }
  scrollIntoView() { this.scrolled = true; }
  focus() { this.focused = true; }
  before(element) { this.beforeElement = element; }
  querySelector(selector) { return this.selectors?.[selector] ?? null; }
  get hash() { return this.href?.slice(this.href.indexOf('#')); }
}

function run(file, context) {
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../assets/js', file), 'utf8'), context);
}

test('Tree overview fits a mobile width; search and place links reveal the correct person', () => {
  const nodes = Object.fromEntries(['viewport', 'space', 'tree', 'zoom', 'minus', 'plus', 'fit', 'read', 'places-jump', 'last', 'peter1645', 'andersj', 'viktorodmark'].map(id => [id, new Element(id)]));
  Object.assign(nodes.viewport, { clientWidth: 360, clientHeight: 600 });
  Object.assign(nodes.tree, { offsetWidth: 3440, offsetHeight: 10680, contains: (node) => ['peter1645', 'andersj', 'viktorodmark'].includes(node.id) });
  Object.assign(nodes.peter1645, { offsetLeft: 2085, offsetTop: 5625, offsetWidth: 230, offsetHeight: 353 });
  Object.assign(nodes.andersj, { offsetLeft: 555, offsetTop: 8145, offsetWidth: 230, offsetHeight: 353 });
  Object.assign(nodes.viktorodmark, { offsetLeft: 285, offsetTop: 10245, offsetWidth: 230, offsetHeight: 353 });
  const document = new Element();
  document.querySelector = selector => nodes[selector.slice(1)];
  document.getElementById = id => nodes[id];
  const window = new Element();
  run('tree.js', { document, window, innerWidth: 360, location: { hash: '' }, performance: { now: () => 1000 } });
  nodes.fit.onclick();
  assert.equal(parseFloat(nodes.space.style.width), 360);
  nodes['places-jump'].onclick({ preventDefault() {} });
  assert.equal(nodes.zoom.textContent, '100%');
  assert.equal(nodes.viewport.scrollLeft, 2020);
  document.dispatchEvent({ type: 'tree:reveal', detail: 'andersj' });
  assert.equal(nodes.viewport.scrollTop, 8021.5);
  nodes.last.onclick({ preventDefault() {} });
  assert.equal(nodes.viewport.scrollTop, 10121.5);
  assert.equal(nodes.viewport.scrollLeft, 220);
  nodes.viewport.clientWidth = 900;
  nodes.fit.onclick();
  nodes.viewport.clientWidth = 600;
  window.dispatchEvent({ type: 'resize' });
  assert.equal(parseFloat(nodes.space.style.width), 600);
});

test('Search matches Swedish accents, multiple terms, empty results, navigation and reset', () => {
  const item = new Element('anders-1932');
  item.textContent = '1932 Anna Maria Ödmark och Anders Gunnar i Nordmaling';
  item.selectors = { '.year, .years': { textContent: '1932' }, h2: { textContent: 'Anna och sonen Anders Gunnar.' } };
  const anchor = new Element(), input = new Element(), results = new Element(), status = new Element(), clear = new Element();
  const document = new Element();
  document.querySelectorAll = () => [item];
  document.querySelector = selector => selector === '#tree' ? null : anchor;
  document.createElement = tag => {
    const element = new Element();
    if (tag === 'section') element.selectors = { input, ul: results, '.search-status': status, button: clear };
    return element;
  };
  let hash;
  run('search.js', { document, history: { replaceState: (_a, _b, value) => { hash = value; } } });
  assert.match(status.textContent, /1 kapitel/);
  input.value = 'odmark 1932'; input.dispatchEvent({ type: 'input' });
  assert.equal(results.children.length, 1);
  results.children[0].children[0].dispatchEvent({ type: 'click', preventDefault() {} });
  assert.equal(hash, '#anders-1932'); assert.ok(item.scrolled && item.focused);
  input.value = 'saknas'; input.dispatchEvent({ type: 'input' });
  assert.equal(results.children.length, 0); assert.match(status.textContent, /Inga/);
  clear.dispatchEvent({ type: 'click' });
  assert.equal(input.value, ''); assert.ok(results.hidden && input.focused);
});
