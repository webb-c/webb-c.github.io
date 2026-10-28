/*
 * Puzzle boards — the push-the-words game at the top of Home, About,
 * Publications and Talks.
 *
 * Rules follow Baba Is You:
 *  - A rule is NOUN IS PROPERTY or NOUN IS NOUN, read left → right or
 *    top → bottom. AND joins nouns or properties ("star and wall is push").
 *  - Text is always PUSH. Objects are walkable unless they are STOP or PUSH.
 *  - YOU: you move every object that is YOU, all at once.
 *  - WIN: the moment an object that is YOU shares a tile with an object that
 *    is WIN — including itself (webb is you + webb is win) — you win.
 *  - STOP blocks, PUSH gets pushed, DEFEAT destroys YOU objects on its tile,
 *    SINK destroys itself and whatever shares its tile.
 *  - NOUN IS NOUN turns every such object into the other kind
 *    (star is wall); NOUN IS ITSELF (star is star) stops that.
 *  - Nothing is YOU? You are stuck: Z undoes, R restarts.
 * Site-only extras: the gates on the bottom row (stand on one and press Enter),
 * and on Publications the words [1] [2] … (which paper) and ARXIV / PUB (where
 * it opens).
 *
 * Board contents live in _data/puzzles.yml; _includes/board.html turns them
 * into JSON for this file.
 */
(function () {
  'use strict';

  var COLS = 18, ROWS = 9;
  var KEY_INTRO = 'webb.introDone', KEY_OFF = 'webb.puzzlesOff';
  var NOUNS = { WEBB: 'webb', STAR: 'star', WALL: 'wall', PAPER: 'paper', BIO: 'bio', CV: 'cv', MAIL: 'mail', SLIDE: 'slide' };
  var PROPS = ['YOU', 'WIN', 'STOP', 'PUSH', 'DEFEAT', 'SINK'];
  var LINKS = { ARXIV: 'arXiv', PUB: 'the published version' };

  var store = {
    get: function (k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { if (v === null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, v); } catch (e) {} }
  };
  var boards = [];
  function puzzlesOff() { return store.get(KEY_OFF) === '1'; }
  function setPuzzlesOff(off) { store.set(KEY_OFF, off ? '1' : null); boards.forEach(function (b) { b.render(); }); }

  var base = (document.documentElement.getAttribute('data-baseurl') || '').replace(/\/$/, '');
  function href(u) { return u && u.charAt(0) === '/' && u.charAt(1) !== '/' ? base + u : u; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]; }); }
  function cap(s) { s = String(s || ''); return s.charAt(0).toUpperCase() + s.slice(1); }

  // --- words -----------------------------------------------------------------
  function isNum(w) { return /^[1-9]$/.test(w); }
  function role(w) {
    if (NOUNS[w]) return 's';
    if (w === 'IS' || w === 'AND') return 'v';
    if (LINKS[w] || isNum(w)) return 'd';
    return 'o';
  }
  function wordText(w) { return isNum(w) ? '[' + w + ']' : w.toLowerCase(); }
  // "text [webb is you] text" -> HTML with coloured rule blocks
  function chips(text) {
    return String(text || '').split(/\[([^\]]+)\]/).map(function (part, i) {
      if (i % 2 === 0) return esc(part);
      return '<span class="rule">' + part.trim().split(/\s+/).map(function (w) {
        var W = w.toUpperCase();
        return '<span class="rw rw--' + role(W) + '">' + esc(wordText(W)) + '</span>';
      }).join('') + '</span>';
    }).join('');
  }

  // --- sprites (stroke icons, 20 × 20) ------------------------------------------
  var SVG = {
    webb: '<circle cx="10" cy="11" r="7" class="fill"/><path d="M3 11a7 2.3 0 0 1 14 0" stroke-dasharray="1.1 1.3"/><path d="M3 11a7 2.3 0 0 0 14 0"/><path d="M10 11V2.6M8.5 4.3L10 2.6L11.5 4.3"/><circle cx="7.4" cy="8.4" r="0.85" class="dot"/><circle cx="12.6" cy="8.4" r="0.85" class="dot"/>',
    star: '<polygon points="10,2.5 12,7.75 17.61,8.03 13.23,11.55 14.7,16.97 10,13.9 5.3,16.97 6.77,11.55 2.39,8.03 8,7.75" class="fill"/>',
    wall: '<rect x="2" y="2" width="16" height="16" rx="1" class="fill"/><path d="M2 7L7 2M2 12.5L12.5 2M2 18L18 2M7.5 18L18 7.5M13 18L18 13"/>',
    paper: '<path d="M5 2.5h7.5l3 3V17.5H5z" class="fill"/><path d="M12.5 2.5v3h3"/><path d="M7.5 9h6M7.5 11.5h6M7.5 14h4"/>',
    bio: '<path d="M5 3h10v14H5z" class="fill"/><path d="M7.2 3v14"/><path d="M9.5 7h3.5"/>',
    cv: '<path d="M5 4h10v13.5H5z" class="fill"/><path d="M8 2.8h4v2.4H8z" class="fill"/><path d="M7.5 9h5M7.5 11.5h5M7.5 14h3"/>',
    mail: '<path d="M3 5.5h14v9.5H3z" class="fill"/><path d="M3 5.5l7 5.5 7-5.5"/>',
    slide: '<path d="M3 3h14v9H3z" class="fill"/><path d="M10 12v4M7 16.5h6"/><path d="M5.5 6h5M5.5 8.5h7"/>'
  };
  function sprite(kind) { return '<svg viewBox="0 0 20 20" aria-hidden="true">' + (SVG[kind] || '') + '</svg>'; }
  function pct(n, of) { return (n * 100 / of) + '%'; }

  // --- rules -------------------------------------------------------------------
  // Read every sentence on the board. Returns which word tiles are part of a
  // rule, each kind's properties, and noun → noun transformations.
  function readRules(ents) {
    var at = {}, active = {}, props = {}, turn = {}, keep = {}, list = [];
    ents.forEach(function (e) { if (e.t === 'w' && !e.dead) at[e.x + ',' + e.y] = e; });
    var get = function (x, y) { return at[x + ',' + y]; };
    ents.forEach(function (start) {
      if (start.t !== 'w' || start.dead || role(start.w) !== 's') return;
      [[1, 0], [0, 1]].forEach(function (d) {
        var prev = get(start.x - d[0], start.y - d[1]);
        if (prev && prev.w === 'AND') return;           // read from the first noun of the list
        var subj = [start], used = [start], cur = start, a, n;
        while ((a = get(cur.x + d[0], cur.y + d[1])) && a.w === 'AND' && (n = get(cur.x + 2 * d[0], cur.y + 2 * d[1])) && role(n.w) === 's') {
          subj.push(n); used.push(a, n); cur = n;
        }
        var is = get(cur.x + d[0], cur.y + d[1]);
        if (!is || is.w !== 'IS') return;
        var comp = [], c = get(is.x + d[0], is.y + d[1]), tail = [is];
        while (c && c.w !== 'IS' && c.w !== 'AND') {
          comp.push(c); tail.push(c);
          a = get(c.x + d[0], c.y + d[1]); n = a && get(c.x + 2 * d[0], c.y + 2 * d[1]);
          if (a && a.w === 'AND' && n && n.w !== 'IS' && n.w !== 'AND') { tail.push(a); c = n; } else break;
        }
        if (!comp.length) return;
        used.concat(tail).forEach(function (t) { active[t.id] = true; });
        subj.forEach(function (s) {
          var k = NOUNS[s.w];
          comp.forEach(function (w) {
            list.push(s.w + ' ' + w.w);
            if (NOUNS[w.w]) { if (NOUNS[w.w] === k) keep[k] = true; else (turn[k] = turn[k] || []).push(NOUNS[w.w]); }
            else { props[k] = props[k] || {}; props[k][w.w] = true; }
          });
        });
      });
    });
    return { active: active, props: props, turn: turn, keep: keep, list: list };
  }
  function has(R, kind, p) { return !!(R.props[kind] && R.props[kind][p]); }
  function numberOf(R, kind) {
    var p = R.props[kind] || {}, n = 0;
    for (var k in p) if (isNum(k) && (!n || +k < n)) n = +k;
    return n;
  }
  function linkOf(R, kind) { return Object.keys(LINKS).filter(function (k) { return has(R, kind, k); })[0] || ''; }

  // --- one board ---------------------------------------------------------------
  function Board(fig) {
    var dataEl = fig.querySelector('.board__data');
    var D = {};
    try { D = JSON.parse(dataEl ? dataEl.textContent : '{}'); } catch (e) { fig.hidden = true; return; }
    this.fig = fig;
    this.D = D;
    this.introMode = fig.getAttribute('data-intro') || 'off';
    this.def = this.buildLevel();
    if (!this.def) { fig.hidden = true; return; }
    this.caption = fig.querySelector('[data-caption]');
    if (this.caption) this.caption.innerHTML = this.caption.innerHTML.replace(/\[([^\]<>]+)\]/g, function (m) { return chips(m); });
    this.build();
    this.g = { stage: 'play', lesson: 0, sel: 0, card: null, winSig: '', msg: '', ents: [], undo: [], focused: false };
    if (this.introMode === 'always' || (this.introMode === 'auto' && store.get(KEY_INTRO) !== '1')) this.g.stage = 'intro';
    else this.load();
    boards.push(this);
    this.render();
  }

  // Turn the YAML level (plus selected papers / talks) into words + objects.
  Board.prototype.buildLevel = function () {
    var D = this.D, L = D.level;
    if (!L) return null;
    var def = { here: L.here || '', spawn: L.spawn || 2, hint: L.hint || '', words: (D.you || []).concat(L.words || []), objects: (L.objects || []).slice() };
    if (L.auto === 'papers') {
      var papers = (D.papers || []).slice(0, (L.number_slots || []).length);
      papers.forEach(function (p, i) { def.words.push([String(p.n || i + 1), L.number_slots[i][0], L.number_slots[i][1]]); });
      def.objects.push({ kind: 'paper', x: L.object[0], y: L.object[1], papers: papers, label: 'The paper' });
    } else if (L.auto === 'talks') {
      (D.talks || []).slice(0, (L.slots || []).length).forEach(function (t, i) {
        var ext = /^https?:/.test(t.url);
        def.objects.push({ kind: 'slide', x: L.slots[i][0], y: L.slots[i][1], caption: t.label + ' · ' + t.year, label: t.label, url: t.url, external: ext, action: 'Open the slides ' + (ext ? '↗' : '→') });
      });
    }
    return def;
  };

  Board.prototype.build = function () {
    var fig = this.fig, mount = fig.querySelector('.board__mount'), self = this;
    mount.innerHTML =
      '<div class="board__tut" data-block="Q-a" hidden></div>' +
      '<div class="board__scroll"><section class="board__grid" data-block="Q-b" tabindex="0">' +
        '<div class="board__wire" aria-hidden="true"></div><div class="board__psi" aria-hidden="true">|ψ〉</div>' +
        '<div class="board__gates" aria-hidden="true"></div><div class="board__layer" aria-hidden="true"></div>' +
        '<div class="board__intro" data-block="Q-c" hidden></div><div class="board__over" data-block="Q-d" hidden></div>' +
        '<div class="board__chip" aria-hidden="true">Click to play</div>' +
      '</section></div>' +
      '<div class="board__bar"><div class="board__say" data-block="Q-e"><p class="board__status" aria-live="polite"></p>' +
        '<a class="btn btn--primary board__act" hidden><kbd>Enter</kbd><span></span></a></div>' +
        '<div class="board__pad" data-block="Q-f">' +
          '<button type="button" class="key" data-k="w" aria-label="Move up">W</button>' +
          '<button type="button" class="key" data-k="a" aria-label="Move left">A</button>' +
          '<button type="button" class="key" data-k="s" aria-label="Move down">S</button>' +
          '<button type="button" class="key" data-k="d" aria-label="Move right">D</button>' +
          '<button type="button" class="key" data-k="z" aria-label="Undo">Z undo</button>' +
          '<button type="button" class="key" data-k="r" aria-label="Restart">R reset</button>' +
        '</div></div>' +
      '<p class="board__links" data-block="Q-g"><button type="button" class="linkbtn board__replay" hidden>Show the welcome screen again</button>' +
        '<button type="button" class="linkbtn linkbtn--quiet board__hide">Hide puzzles</button></p>' +
      '<div class="board__off" data-block="Q-h" hidden><span>Puzzles are hidden on every page. The menu at the top goes to the same places.</span>' +
        '<button type="button" class="btn btn--pill board__show">Show puzzles</button></div>';

    var q = function (s) { return mount.querySelector(s); };
    this.el = {
      tut: q('.board__tut'), scroll: q('.board__scroll'), grid: q('.board__grid'), gates: q('.board__gates'), layer: q('.board__layer'),
      wire: q('.board__wire'), psi: q('.board__psi'), intro: q('.board__intro'), over: q('.board__over'), chip: q('.board__chip'),
      bar: q('.board__bar'), status: q('.board__status'), act: q('.board__act'), pad: q('.board__pad'),
      links: q('.board__links'), replay: q('.board__replay'), hide: q('.board__hide'), off: q('.board__off'), show: q('.board__show')
    };
    var el = this.el;
    el.grid.addEventListener('keydown', function (e) { self.onKey(e); });
    el.grid.addEventListener('focus', function () { self.g.focused = true; self.render(); });
    el.grid.addEventListener('blur', function () { self.g.focused = false; self.render(); });
    el.pad.addEventListener('click', function (e) {
      var b = e.target.closest('[data-k]');
      if (!b) return;
      self.key(b.getAttribute('data-k'));
      self.focus();
    });
    el.replay.addEventListener('click', function () {
      store.set(KEY_INTRO, null);
      self.g.stage = 'intro'; self.g.sel = 0; self.g.card = null; self.g.msg = ''; self.introBuilt = false;
      self.render(); self.focus();
    });
    el.hide.addEventListener('click', function () { setPuzzlesOff(true); });
    el.show.addEventListener('click', function () { setPuzzlesOff(false); });
    el.tut.addEventListener('click', function (e) { if (e.target.closest('.board__skip')) { self.load(); self.render(); self.focus(); } });
    el.over.addEventListener('click', function (e) {
      var b = e.target.closest('[data-card]');
      if (!b) return;
      if (b.getAttribute('data-card') === 'next') self.proceed();
      else if (b.getAttribute('data-card') === 'close') { self.g.card = null; self.render(); }
      self.focus();
    });
    el.intro.addEventListener('click', function (e) {
      var b = e.target.closest('[data-choice]');
      if (b) { self.choose(+b.getAttribute('data-choice')); self.focus(); }
    });
    el.intro.addEventListener('mouseover', function (e) {
      var b = e.target.closest('[data-choice]');
      if (b && +b.getAttribute('data-choice') !== self.g.sel) { self.g.sel = +b.getAttribute('data-choice'); self.renderIntro(); }
    });
  };

  Board.prototype.focus = function () { try { this.el.grid.focus({ preventScroll: true }); } catch (e) {} };

  // --- state ---------------------------------------------------------------------
  // lesson 0 = this page's board; 1..n = tutorial lessons
  Board.prototype.load = function (lesson) {
    var g = this.g, src, at, D = this.D;
    lesson = lesson || 0;
    if (lesson) {
      var T = (D.tutorial || [])[lesson - 1];
      src = { words: (D.you || []).concat(T.words || []), objects: (T.objects || []).slice() };
      if (T.wall_column != null) for (var y = 0; y < ROWS; y++) src.objects.push({ kind: 'wall', x: T.wall_column, y: y });
      at = T.webb;
    } else {
      src = this.def;
      at = [this.def.spawn, ROWS - 1];
    }
    var ents = [];
    src.words.forEach(function (w) { ents.push({ t: 'w', w: String(w[0]).toUpperCase(), x: w[1], y: w[2] }); });
    src.objects.forEach(function (o) { ents.push(Object.assign({ t: 'o' }, o)); });
    ents.push({ t: 'o', kind: 'webb', x: at[0], y: at[1] });
    ents.forEach(function (e, i) { e.id = i; e.dead = false; });
    g.stage = lesson ? 'tut' : 'play';
    g.lesson = lesson; g.ents = ents; g.undo = []; g.msg = ''; g.card = null;
    this.layerFor = null;
    this.settle(true);
  };

  Board.prototype.alive = function () { return this.g.ents.filter(function (e) { return !e.dead; }); };
  Board.prototype.snapshot = function () { return this.g.ents.map(function (e) { return [e.x, e.y, e.kind, e.dead]; }); };
  Board.prototype.restore = function (s) { this.g.ents.forEach(function (e, i) { e.x = s[i][0]; e.y = s[i][1]; e.kind = s[i][2]; e.dead = s[i][3]; }); };

  // Can `e` move one step? Text and PUSH objects get pushed along; STOP blocks.
  Board.prototype.canMove = function (e, dx, dy, R) {
    var nx = e.x + dx, ny = e.y + dy, self = this;
    if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) return false;
    return this.alive().every(function (o) {
      if (o === e || o.x !== nx || o.y !== ny) return true;
      if (o.t === 'w' || has(R, o.kind, 'PUSH')) return self.canMove(o, dx, dy, R);
      return !has(R, o.kind, 'STOP');
    });
  };
  Board.prototype.doMove = function (e, dx, dy, R, done) {
    if (done[e.id]) return;
    var nx = e.x + dx, ny = e.y + dy, self = this;
    this.alive().forEach(function (o) {
      if (o !== e && o.x === nx && o.y === ny && (o.t === 'w' || has(R, o.kind, 'PUSH'))) self.doMove(o, dx, dy, R, done);
    });
    e.x = nx; e.y = ny; done[e.id] = true;
  };

  Board.prototype.step = function (dx, dy) {
    var g = this.g, self = this;
    if (g.stage === 'intro') { if (dy) { g.sel = (g.sel + dy + 3) % 3; this.render(); } return; }
    if (g.card && g.card.lesson) return;
    g.card = null;
    var R = readRules(g.ents);
    var yous = this.alive().filter(function (e) { return e.t === 'o' && has(R, e.kind, 'YOU'); });
    if (!yous.length) { g.msg = 'Nothing is [you] any more — press Z to undo or R to restart.'; this.render(); return; }
    var before = this.snapshot(), done = {}, moved = false;
    // the object furthest along the move goes first, so a line of YOU objects moves together
    yous.sort(function (a, b) { return (b.x * dx + b.y * dy) - (a.x * dx + a.y * dy); });
    yous.forEach(function (y) {
      if (done[y.id] || !self.canMove(y, dx, dy, R)) return;
      self.doMove(y, dx, dy, R, done);
      moved = true;
    });
    if (!moved) { this.render(); return; }
    g.undo.push(before);
    g.msg = '';
    this.settle(false);
    this.render();
  };

  // After a move: transform, destroy, then check for a win.
  Board.prototype.settle = function (quiet) {
    var g = this.g, R = readRules(g.ents), self = this;
    this.alive().forEach(function (e) {
      if (e.t === 'o' && R.turn[e.kind] && !R.keep[e.kind]) e.kind = R.turn[e.kind][0];
    });
    var live = this.alive().filter(function (e) { return e.t === 'o'; });
    live.forEach(function (o) {
      if (o.dead) return;
      var mates = live.filter(function (m) { return m !== o && !m.dead && m.x === o.x && m.y === o.y; });
      if (has(R, o.kind, 'DEFEAT')) mates.concat([o]).forEach(function (m) { if (has(R, m.kind, 'YOU')) m.dead = true; });
      if (has(R, o.kind, 'SINK') && mates.length) { o.dead = true; mates.forEach(function (m) { m.dead = true; }); }
    });
    var yous = this.alive().filter(function (e) { return e.t === 'o' && has(R, e.kind, 'YOU'); });
    if (!yous.length && !quiet) g.msg = 'Nothing is [you] any more — press Z to undo or R to restart.';

    var win = this.findWin(R, yous);
    var sig = win ? win.sig : '';
    if (sig && sig !== g.winSig && !quiet) {
      if (g.stage === 'tut') g.card = Object.assign({ lesson: true, rule: win.rule }, (this.D.tutorial[g.lesson - 1] || {}).done || { title: 'Done.' });
      else g.card = win;
    }
    g.winSig = sig;
    this.R = R;
  };

  // What does a YOU object stand on? Prefer a WIN (or paper-link) object other
  // than itself; an object that is both YOU and WIN wins on its own.
  Board.prototype.findWin = function (R, yous) {
    var all = this.alive().filter(function (e) { return e.t === 'o'; }), best = null;
    yous.forEach(function (y) {
      all.forEach(function (o) {
        if (o.x !== y.x || o.y !== y.y) return;
        var self = o === y, noun = o.kind.toUpperCase(), c = null;
        if (o.papers && !self) {
          var n = numberOf(R, o.kind), link = linkOf(R, o.kind);
          if (n && link) {
            var p = o.papers.filter(function (x) { return +x.n === n; })[0];
            if (p) {
              var url = link === 'ARXIV' ? p.arxiv : p.pub;
              c = { sig: o.id + ':' + n + link, rule: '[' + noun + ' is ' + n + '] [' + noun + ' is ' + link + ']',
                title: 'Paper [' + n + '] is ' + (link === 'ARXIV' ? 'arXiv' : 'pub') + '.', text: p.title,
                url: url, external: true, action: url ? 'Open ' + LINKS[link] + ' ↗' : '',
                note: url ? '' : 'This paper has no ' + (link === 'ARXIV' ? 'arXiv' : 'published') + ' version yet — try the other word.' };
            }
          }
        }
        if (!c && has(R, o.kind, 'WIN')) {
          var who = cap(o.kind);
          if (self) c = { sig: o.id + ':self', rule: '[' + noun + ' is you] [' + noun + ' is win]', title: who + ' is you, and ' + o.kind + ' is win.',
            text: 'Being the goal yourself counts — that is how the rules work. Nothing opens here, but you win.' };
          else if (o.url) c = { sig: o.id + ':win', rule: '[' + noun + ' is win]', title: (o.label || who) + ' is win.', text: '', url: o.url, external: !!o.external, action: o.action || 'Open →' };
          else if (o.message) c = { sig: o.id + ':win', rule: '[' + noun + ' is win]', title: (o.label || who) + ' is win.', text: o.message };
          else c = { sig: o.id + ':win', rule: '[' + noun + ' is win]', title: who + ' is win.', text: 'You reached it.' };
        }
        if (c && (!best || (best.sig.indexOf(':self') > 0 && c.sig.indexOf(':self') < 0))) best = c;
      });
    });
    return best;
  };

  Board.prototype.gateUnder = function () {
    var R = readRules(this.g.ents), gates = this.D.gates || [], hit = null;
    this.alive().forEach(function (e) {
      if (hit || e.t !== 'o' || !has(R, e.kind, 'YOU') || e.y !== ROWS - 1) return;
      hit = gates.filter(function (x) { return x.x === e.x; })[0] || null;
    });
    return hit;
  };

  Board.prototype.act = function () {
    var g = this.g;
    if (g.stage === 'intro') { this.choose(g.sel); return; }
    if (g.card) {
      if (g.card.lesson) { this.proceed(); return; }
      var a = this.el.over.querySelector('a[data-card="go"]');
      if (a) a.click(); else { g.card = null; this.render(); }
      return;
    }
    if (g.stage === 'play') {
      if (this.gateUnder() && !this.el.act.hidden) { this.el.act.click(); return; }
      var win = this.findWin(readRules(g.ents), this.alive().filter(function (e) { return e.t === 'o' && has(readRules(g.ents), e.kind, 'YOU'); }));
      if (win) { g.card = win; this.render(); }
    }
  };
  Board.prototype.choose = function (i) {
    store.set(KEY_INTRO, '1');
    this.g.sel = i;
    if (i === 1) this.load(1); else this.load();
    if (i === 2) { setPuzzlesOff(true); return; }
    this.render();
  };
  Board.prototype.proceed = function () {
    var g = this.g, n = (this.D.tutorial || []).length;
    if (!g.card) return;
    if (g.stage === 'tut' && g.lesson < n) this.load(g.lesson + 1); else this.load();
    this.render();
  };
  Board.prototype.undo = function () {
    var g = this.g, s = g.undo.pop();
    g.card = null;
    if (s) { this.restore(s); g.msg = ''; this.settle(true); }
    this.render();
  };

  Board.prototype.key = function (k) {
    var dirs = { w: [0, -1], arrowup: [0, -1], s: [0, 1], arrowdown: [0, 1], a: [-1, 0], arrowleft: [-1, 0], d: [1, 0], arrowright: [1, 0] };
    var g = this.g;
    if (k === 'escape') { if (g.card && !g.card.lesson) { g.card = null; this.render(); return true; } return false; }
    if (dirs[k]) { this.step(dirs[k][0], dirs[k][1]); return true; }
    if (k === 'enter' || k === ' ') { this.act(); return true; }
    if (g.stage === 'intro') return false;
    if (k === 'z') { if (g.card && g.card.lesson) g.card = null; this.undo(); return true; }
    if (k === 'r') { this.load(g.lesson); this.render(); return true; }
    return false;
  };
  Board.prototype.onKey = function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = (e.key || '').toLowerCase();
    // a focused button inside the board handles its own Enter / Space
    if ((k === 'enter' || k === ' ') && e.target !== this.el.grid) return;
    if (this.key(k)) e.preventDefault();
  };

  // --- drawing -------------------------------------------------------------------
  Board.prototype.render = function () {
    var g = this.g, el = this.el, off = puzzlesOff();
    this.fig.classList.toggle('is-off', off);
    this.fig.classList.toggle('is-tutorial', g.stage === 'tut');
    el.off.hidden = !off;
    [el.scroll, el.bar, el.links].forEach(function (x) { x.hidden = off; });
    if (this.caption) this.caption.hidden = off || g.stage === 'tut';
    if (off) { el.tut.hidden = true; return; }

    var intro = g.stage === 'intro', tut = g.stage === 'tut', play = g.stage === 'play';
    el.grid.classList.toggle('is-intro', intro);
    el.grid.setAttribute('aria-label', intro
      ? 'Welcome. ' + ((this.D.welcome || {}).question || '') + ' Choose with W and S or the arrow keys, confirm with Enter.'
      : 'Puzzle board. Move with W A S D or the arrow keys. Z undoes, R restarts. Stand on a gate along the bottom and press Enter to change page.');
    el.wire.hidden = el.psi.hidden = el.gates.hidden = !play;
    el.layer.hidden = intro;
    el.pad.hidden = intro;
    el.chip.hidden = g.focused || intro || !!g.card;
    el.replay.hidden = this.introMode === 'off' || intro;

    // tutorial header (rebuilt only when the lesson changes, so its button keeps working)
    el.tut.hidden = !tut;
    var done = !!(g.card && g.card.lesson);
    var tutSig = tut ? g.lesson + (done ? '+' : '') : '';
    if (tut && this.tutSig !== tutSig) {
      var T = this.D.tutorial || [];
      el.tut.innerHTML = '<div class="board__steps"><span class="eyebrow">Tutorial</span><ol>' + T.map(function (t, i) {
        var n = i + 1, cur = n === g.lesson && !done, ok = n < g.lesson || (n === g.lesson && done);
        return '<li class="' + (cur ? 'is-current' : ok ? 'is-done' : '') + '"' + (cur ? ' aria-current="step"' : '') + '><span class="num">' + n + '</span>' + esc(t.title) + '</li>';
      }).join('') + '</ol></div><button type="button" class="btn board__skip">Skip the tutorial →</button>';
    }
    this.tutSig = tutSig;

    if (intro) this.renderIntro(); else { el.intro.hidden = true; this.introBuilt = false; }
    if (!intro) this.renderTiles();
    if (play) this.renderGates();
    this.renderCard();

    // status line + gate button
    var status = '', big = false, gate = play ? this.gateUnder() : null;
    if (intro) status = 'Use W and S (or ↑ ↓) to pick an answer, then press Enter — or just click one.';
    else if (g.card) status = g.card.lesson ? 'Press Enter to continue.' : 'Enter opens it · Esc or any move keeps playing.';
    else if (tut) { status = ((this.D.tutorial || [])[g.lesson - 1] || {}).hint || ''; big = true; }
    else if (gate) status = gate.id === this.def.here ? 'You are here: ' + gate.label + '.' : 'Gate ' + gate.letter + ' — ' + gate.label + '.';
    else if (g.winSig) status = 'You are on a win — press Enter to see it again.';
    else status = g.focused || g.msg ? this.def.hint : 'Click the board, then use W A S D. Stand on a gate and press Enter to change page.';
    if (g.msg && !intro && !g.card) { status = g.msg; big = false; }
    el.status.innerHTML = chips(status);
    el.status.classList.toggle('is-big', big);
    el.status.classList.toggle('is-warn', g.msg.indexOf('Nothing') === 0);
    var showGate = !!(gate && gate.id !== this.def.here && !g.card);
    el.act.hidden = !showGate;
    if (showGate) { el.act.setAttribute('href', href(gate.url)); el.act.querySelector('span').textContent = 'Go to ' + gate.label + ' →'; }
  };

  // The win card over the board. Rebuilt only when it changes, so its buttons keep working.
  Board.prototype.renderCard = function () {
    var c = this.g.card, el = this.el;
    el.over.hidden = !c;
    if (!c) { this.cardFor = null; return; }
    if (this.cardFor === c) return;
    this.cardFor = c;
    var btns = '';
    if (c.lesson) btns = '<button type="button" class="btn btn--primary" data-card="next"><kbd>Enter</kbd>' + esc(c.action || 'Continue →') + '</button>';
    else {
      if (c.url) btns += '<a class="btn btn--primary" data-card="go" href="' + esc(href(c.url)) + '"' + (c.external ? ' target="_blank" rel="noopener noreferrer"' : '') + '><kbd>Enter</kbd>' + esc(c.action) + '</a>';
      btns += '<button type="button" class="btn" data-card="close"><kbd>Esc</kbd>Keep playing</button>';
    }
    el.over.innerHTML = '<div class="board__card" role="dialog" aria-label="' + esc(c.title) + '">' +
      '<span class="rule-line">' + chips(c.rule || '') + '</span>' +
      '<p class="board__card-title">' + esc(c.title) + '</p>' +
      (c.text ? '<p class="board__card-text">' + chips(c.text) + '</p>' : '') +
      (c.note ? '<p class="board__card-text">' + esc(c.note) + '</p>' : '') +
      '<div class="board__card-btns">' + btns + '</div></div>';
  };

  // Built once per visit to the welcome screen; later calls only move the cursor,
  // so a click that is half-way through is never interrupted.
  Board.prototype.renderIntro = function () {
    var W = this.D.welcome || {}, g = this.g, el = this.el;
    el.intro.hidden = false;
    if (!this.introBuilt) {
      el.intro.innerHTML = '<div class="board__welcome"><p class="eyebrow">' + esc(W.label || '') + '</p>' +
        '<p class="board__welcome-text">' + chips(W.text) + '</p>' +
        '<p class="board__welcome-q">' + esc(W.question || '') + '</p>' +
        '<div class="board__choices" role="group" aria-label="Choose how to start">' + (W.choices || []).map(function (c, i) {
          return '<button type="button" class="board__choice" data-choice="' + i + '">' +
            '<span class="board__cursor">' + sprite('webb') + '</span><span class="board__tag">(' + 'abc'.charAt(i) + ')</span><span>' + esc(c) + '</span></button>';
        }).join('') + '</div></div>';
      this.introBuilt = true;
    }
    Array.prototype.forEach.call(el.intro.querySelectorAll('[data-choice]'), function (b) {
      b.classList.toggle('is-on', +b.getAttribute('data-choice') === g.sel);
    });
  };

  Board.prototype.renderGates = function () {
    var here = this.def.here, gate = this.gateUnder(), on = gate ? gate.id : '';
    this.el.gates.innerHTML = (this.D.gates || []).map(function (gt) {
      var isHere = gt.id === here, standing = gt.id === on;
      return '<div class="gate' + (isHere ? ' is-here' : '') + (standing && !isHere ? ' is-standing' : '') + '" style="left:' + pct(gt.x, COLS) + ';top:' + pct(ROWS - 1, ROWS) + '">' +
        '<span class="gate__box">' + esc(gt.letter) + '</span><span class="gate__label">' +
        esc(standing && !isHere ? 'Enter ↵ ' + gt.label : isHere ? gt.label + ' · here' : gt.label) + '</span></div>';
    }).join('');
  };

  Board.prototype.renderTiles = function () {
    var g = this.g, layer = this.el.layer, R = readRules(g.ents), self = this;
    if (this.layerFor !== g.ents) {
      layer.innerHTML = '';
      this.nodes = {};
      g.ents.forEach(function (e) {
        var n = document.createElement('div');
        if (e.t === 'w') {
          n.className = 'tile tile--word tile--' + role(e.w);
          n.innerHTML = '<span>' + esc(wordText(e.w)) + '</span>';
        } else {
          n.innerHTML = '<span class="tile__ring"></span><span class="tile__tag"></span><span class="tile__sprite"></span><span class="tile__cap"></span>';
        }
        layer.appendChild(n);
        self.nodes[e.id] = n;
      });
      this.layerFor = g.ents;
    }
    g.ents.forEach(function (e) {
      var n = self.nodes[e.id];
      n.hidden = e.dead;
      n.style.left = pct(e.x, COLS);
      n.style.top = pct(e.y, ROWS);
      if (e.t === 'w') { n.classList.toggle('is-on', !!R.active[e.id]); return; }
      if (n.getAttribute('data-kind') !== e.kind) {
        n.setAttribute('data-kind', e.kind);
        n.className = 'tile tile--obj tile--' + e.kind;
        n.querySelector('.tile__sprite').innerHTML = sprite(e.kind);
      }
      var win = has(R, e.kind, 'WIN'), num = e.papers ? numberOf(R, e.kind) : 0, link = e.papers ? linkOf(R, e.kind) : '';
      var bits = [];
      if (win) bits.push('win');
      if (num) bits.push('[' + num + ']');
      if (link) bits.push('→ ' + link.toLowerCase());
      n.classList.toggle('is-win', win || !!(num && link));
      n.classList.toggle('is-solid', has(R, e.kind, 'STOP') || has(R, e.kind, 'PUSH'));
      n.querySelector('.tile__tag').textContent = bits.join(' ');
      n.querySelector('.tile__tag').classList.toggle('is-link', !win);
      var cap = e.caption || '';
      if (e.papers) {
        var p = num && e.papers.filter(function (x) { return +x.n === num; })[0];
        cap = p ? '[' + num + '] ' + p.label : 'which paper?';
      }
      n.querySelector('.tile__cap').textContent = cap;
    });
  };

  // --- start ---------------------------------------------------------------------
  function start() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-board]'), function (fig) { new Board(fig); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
