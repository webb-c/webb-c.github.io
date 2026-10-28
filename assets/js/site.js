/* Small things every page uses: the theme switch, the publication filter
   and the blog search. */
(function () {
  'use strict';
  var root = document.documentElement;
  function save(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  // --- light / dark ------------------------------------------------------------
  function label() {
    var dark = root.getAttribute('data-theme') === 'dark';
    Array.prototype.forEach.call(document.querySelectorAll('[data-theme-label]'), function (el) { el.textContent = dark ? 'Light mode' : 'Dark mode'; });
  }
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-theme-toggle]')) return;
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    save('webb.theme', next);
    label();
  });
  label();

  // --- block names (the "Captions" button in the top menu, or ?blocks in the
  //     address): show the name of every part of the page — H-a, A-c, Q-b … —
  //     to use when asking for a change. The choice is remembered per browser.
  var layer = document.createElement('div');
  layer.className = 'block-labels';
  layer.setAttribute('aria-hidden', 'true');
  var blocksOn = false;
  try { blocksOn = localStorage.getItem('webb.blocks') === '1'; } catch (e) {}
  if (/[?&]blocks\b/.test(location.search)) blocksOn = true;
  var draw = function () {
    if (!blocksOn) { if (layer.parentNode) layer.parentNode.removeChild(layer); return; }
    if (!layer.parentNode) document.body.appendChild(layer);
    layer.innerHTML = '';
    var placed = [];
    Array.prototype.forEach.call(document.querySelectorAll('[data-block]'), function (el) {
      var r = el.getBoundingClientRect();
      if (!r.width && !r.height) return;
      var tag = document.createElement('span');
      tag.className = 'block-label';
      tag.textContent = el.getAttribute('data-block');
      var x = Math.max(10, r.left + window.scrollX), y = Math.max(10, r.top + window.scrollY);
      // labels that would sit on top of each other move along to the right
      while (placed.some(function (p) { return Math.abs(p[0] - x) < 44 && Math.abs(p[1] - y) < 18; })) x += 46;
      placed.push([x, y]);
      tag.style.left = x + 'px';
      tag.style.top = y + 'px';
      layer.appendChild(tag);
    });
  };
  var later = function () { if (blocksOn) setTimeout(draw, 60); };
  var setBlocks = function (on) {
    blocksOn = on;
    root.classList.toggle('show-blocks', on);
    Array.prototype.forEach.call(document.querySelectorAll('[data-blocks-toggle]'), function (b) {
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      var t = b.querySelector('[data-blocks-label]');
      if (t) t.textContent = on ? 'Captions OFF' : 'Captions ON';
    });
    draw();
  };
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-blocks-toggle]')) {
      var on = !blocksOn;
      try { if (on) localStorage.setItem('webb.blocks', '1'); else localStorage.removeItem('webb.blocks'); } catch (err) {}
      setBlocks(on);
      return;
    }
    later();
  });
  window.addEventListener('load', later);
  window.addEventListener('resize', later);
  document.addEventListener('keyup', later);
  setBlocks(blocksOn);
  later();

  // --- publications: filter chips ---------------------------------------------
  var filters = document.querySelector('[data-pub-filters]');
  if (filters) {
    filters.hidden = false;
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b) return;
      var f = b.getAttribute('data-filter');
      Array.prototype.forEach.call(filters.querySelectorAll('[data-filter]'), function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      Array.prototype.forEach.call(document.querySelectorAll('[data-pub]'), function (li) {
        var show = f === 'all' || (f === 'selected' ? li.getAttribute('data-selected') === 'true' : li.getAttribute('data-type') === f);
        li.hidden = !show;
      });
      Array.prototype.forEach.call(document.querySelectorAll('[data-pub-year]'), function (y) {
        y.hidden = !y.querySelector('[data-pub]:not([hidden])');
      });
    });
  }

  // --- blog: search box ----------------------------------------------------------
  var input = document.querySelector('[data-search]');
  if (input) {
    var results = document.querySelector('[data-search-results]'), feed = document.querySelector('[data-feed]'), index = null;
    var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var run = function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { results.hidden = true; if (feed) feed.hidden = false; return; }
      var go = function () {
        var hits = index.filter(function (p) { return (p.title + ' ' + p.text + ' ' + p.tags).toLowerCase().indexOf(q) >= 0; });
        results.innerHTML = '<p class="meta">' + hits.length + ' result' + (hits.length === 1 ? '' : 's') + ' for “' + esc(input.value.trim()) + '”</p>' +
          (hits.length ? '<ol class="post-list">' + hits.map(function (p) {
            return '<li><span class="meta">' + esc(p.date) + '</span><a href="' + esc(p.url) + '">' + esc(p.title) + '</a></li>';
          }).join('') + '</ol>' : '');
        results.hidden = false;
        if (feed) feed.hidden = true;
      };
      if (index) go();
      else fetch(input.getAttribute('data-search')).then(function (r) { return r.json(); }).then(function (j) { index = j; go(); }).catch(function () {});
    };
    input.addEventListener('input', run);
  }
})();
