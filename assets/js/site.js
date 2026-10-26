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
