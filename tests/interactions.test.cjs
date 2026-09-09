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

test('Home preserves chapter bookmarks and stays home without a fragment', () => {
  let destination = null;
  run('home.js', { document: { readyState: 'loading', addEventListener() {} }, location: { hash: '', search: '', replace: value => { destination = value; } } });
  assert.equal(destination, null);
  run('home.js', { location: { hash: '#anders-1932', search: '?from=family', replace: value => { destination = value; } } });
  assert.equal(destination, './gunnars-spar.html?from=family#anders-1932');
});

test('Home animates both links once, preserves new-tab clicks and resets after Back', () => {
  const state = { reduced: false, destination: null, timer: null, stored: null };
  function interactiveElement() {
    const element = new Element(), classes = new Set();
    element.classList = { add: key => classes.add(key), remove: key => classes.delete(key), contains: key => classes.has(key) };
    element.style = { setProperty(key, value) { this[key] = value; }, removeProperty(key) { delete this[key]; } };
    element.getBoundingClientRect = () => ({ left: 100, top: 100, width: 450, height: 190 });
    element.hasAttribute = () => false;
    element.querySelectorAll = () => element.children;
    element.remove = () => { element.removed = true; };
    return element;
  }
  const links = [interactiveElement(), interactiveElement()];
  links[0].href = 'https://example.test/family/gunnars-spar.html';
  links[1].href = 'https://example.test/family/silfverlaas.html';
  const body = interactiveElement(), window = new Element();
  const document = { readyState: 'complete', body, querySelectorAll: () => links, createElement: interactiveElement };
  run('home.js', {
    document, window, URL,
    location: { hash: '', assign: href => { state.destination = href; } },
    matchMedia: query => ({ get matches() { return query.includes('reduced') ? state.reduced : true; } }),
    setTimeout: (callback, delay) => { state.timer = { callback, delay }; return 1; },
    clearTimeout: () => { state.timer = null; },
    sessionStorage: { setItem: (_key, value) => { state.stored = JSON.parse(value); } }
  });
  function click(link, extra = {}) {
    const event = { type: 'click', button: 0, detail: 1, clientX: 140, clientY: 145, preventDefault() { this.defaultPrevented = true; }, ...extra };
    link.dispatchEvent(event);
    return event;
  }
  for (const extra of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { button: 1 }]) {
    assert.equal(click(links[0], extra).defaultPrevented, undefined);
    assert.equal(state.timer, null);
  }
  links[0].dispatchEvent({ type: 'pointermove', pointerType: 'mouse', clientX: 500, clientY: 130 });
  assert.match(links[0].style['--tilt-y'], /deg$/);
  links[0].dispatchEvent({ type: 'pointerleave' });
  assert.equal(links[0].style['--tilt-y'], undefined);
  assert.equal(click(links[0]).defaultPrevented, true);
  assert.equal(body.classList.contains('is-leaving'), true);
  assert.equal(links[0].classList.contains('is-selected'), true);
  assert.equal(state.timer.delay, 480);
  assert.equal(state.destination, null);
  assert.equal(click(links[1]).defaultPrevented, true);
  state.timer.callback();
  assert.equal(state.destination, links[0].href);
  assert.equal(state.stored.path, '/family/gunnars-spar.html');
  window.dispatchEvent({ type: 'pageshow', persisted: true });
  assert.equal(body.classList.contains('is-leaving'), false);
  assert.equal(state.timer, null);
  click(links[1], { detail: 0 });
  assert.equal(links[1].children[0].style.left, '225px');
  state.timer.callback();
  assert.equal(state.destination, links[1].href);
  window.dispatchEvent({ type: 'pageshow', persisted: true });
  state.reduced = true;
  assert.equal(click(links[0]).defaultPrevented, undefined);
  assert.equal(state.timer, null);
});

test('Destination entry animation is brief, scoped to the chosen page and optional', () => {
  for (const [path, at, reduced, expected] of [
    ['/family/silfverlaas.html', 9000, false, true],
    ['/family/other.html', 9000, false, false],
    ['/family/silfverlaas.html', 0, false, false],
    ['/family/silfverlaas.html', 9000, true, false]
  ]) {
    let animated = false, removed = false;
    run('page-entry.js', {
      location: { pathname: '/family/silfverlaas.html' }, Date: { now: () => 15000 },
      sessionStorage: { getItem: () => JSON.stringify({ path, at }), removeItem: () => { removed = true; } },
      matchMedia: () => ({ matches: reduced }),
      document: { body: { animate: (_frames, options) => { animated = true; assert.equal(options.duration, 420); } } }
    });
    assert.equal(animated, expected);
    assert.equal(removed, true);
  }
});

test('Tree overview fits a mobile width; search and place links reveal the correct person', () => {
  const nodes = Object.fromEntries(['viewport', 'space', 'tree', 'zoom', 'minus', 'plus', 'fit', 'read', 'places-jump', 'last', 'peter1645', 'andersj', 'viktorodmark'].map(id => [id, new Element(id)]));
  Object.assign(nodes.viewport, { clientWidth: 360, clientHeight: 600 });
  Object.assign(nodes.tree, { offsetWidth: 4250, offsetHeight: 9840, dataset: { startX: '810' }, contains: (node) => ['peter1645', 'andersj', 'viktorodmark'].includes(node.id) });
  Object.assign(nodes.peter1645, { offsetLeft: 2895, offsetTop: 5625, offsetWidth: 230, offsetHeight: 353 });
  Object.assign(nodes.andersj, { offsetLeft: 1365, offsetTop: 8145, offsetWidth: 230, offsetHeight: 353 });
  Object.assign(nodes.viktorodmark, { offsetLeft: 285, offsetTop: 9405, offsetWidth: 230, offsetHeight: 353 });
  const document = new Element();
  document.querySelector = selector => nodes[selector.slice(1)];
  document.getElementById = id => nodes[id];
  const window = new Element();
  run('tree.js', { document, window, innerWidth: 360, location: { hash: '' }, performance: { now: () => 1000 } });
  assert.equal(nodes.viewport.scrollLeft, 810 * .85);
  nodes.fit.onclick();
  assert.equal(parseFloat(nodes.space.style.width), 360);
  nodes['places-jump'].onclick({ preventDefault() {} });
  assert.equal(nodes.zoom.textContent, '100%');
  assert.equal(nodes.viewport.scrollLeft, 2830);
  document.dispatchEvent({ type: 'tree:reveal', detail: 'andersj' });
  assert.equal(nodes.viewport.scrollTop, 8021.5);
  nodes.last.onclick({ preventDefault() {} });
  assert.equal(nodes.viewport.scrollTop, 9281.5);
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
