/* KI-Prompting K5Plus — Navigation, Widget-Laufzeit (nur Deutsch, nur helles Design) */
(function () {
  'use strict';
  var doc = document;
  var mode = doc.body.getAttribute('data-mode') || 'multi';
  var reduced = false;
  try { reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  if (mode === 'print') reduced = true; // PDF: no autoplay, no animation

  var App = window.App = { widgets: {}, mode: mode, reduced: reduced };

  function updateTitle() {
    var art = activeArticle();
    if (!art) return;
    var t = art.getAttribute('data-title');
    var site = doc.body.getAttribute('data-site') || '';
    if (t) doc.title = (art.getAttribute('data-num') ? art.getAttribute('data-num') + ' · ' : '') + t + (site ? ' — ' + site : '');
    else if (site) doc.title = site;
  }

  /* ---------- contents dialog ---------- */
  var toc = doc.querySelector('dialog.toc');
  doc.addEventListener('click', function (e) {
    if (!toc) return;
    if (e.target.closest && e.target.closest('.toc-btn')) { toc.showModal(); }
    else if (e.target.closest && e.target.closest('.toc-close')) { toc.close(); }
    else if (e.target === toc) { toc.close(); }
    else if (e.target.closest && e.target.closest('dialog.toc a')) { toc.close(); }
  });

  App.lang = function () { return 'de'; };
  App.t = function (dict) { return dict.de != null ? dict.de : dict.en; };

  /* ---------- widget runtime ---------- */
  App.widget = function (name, fn) { App.widgets[name] = fn; };

  function makeCtx(article) {
    var loops = [];
    var ctx = {
      reduced: reduced,
      // Figuren aus «Sprachmodelle verstehen» sind zweisprachig angelegt; hier immer Deutsch
      lang: App.lang, t: App.t, onLang: function () {},
      active: function () { return !article.hidden; },
      // run fn(dt, t) every frame while the article is visible; returns a loop with start/stop
      raf: function (fn) {
        var id = null, last = null, start = null;
        function step(ts) {
          if (article.hidden) { id = null; return; }
          if (start === null) { start = ts; last = ts; }
          var dt = Math.min(64, ts - last); last = ts;
          fn(dt, ts - start);
          id = requestAnimationFrame(step);
        }
        var loop = { start: function () { if (id === null) { last = null; id = requestAnimationFrame(step); } }, stop: function () { if (id !== null) { cancelAnimationFrame(id); id = null; } } };
        loops.push(loop);
        loop.start();
        return loop;
      },
      resume: function () { for (var i = 0; i < loops.length; i++) loops[i].start(); }
    };
    return ctx;
  }

  App.mount = function (article) {
    if (!article || article._mounted) { if (article && article._ctx) article._ctx.resume(); return; }
    article._mounted = true;
    var ctx = article._ctx = makeCtx(article);
    var nodes = article.querySelectorAll('[data-widget]');
    for (var i = 0; i < nodes.length; i++) {
      var name = nodes[i].getAttribute('data-widget');
      var fn = App.widgets[name];
      if (!fn) continue;
      try { fn(nodes[i].querySelector('.fig-body') || nodes[i], ctx, nodes[i]); }
      catch (err) { if (window.console) console.error('widget ' + name, err); }
    }
  };

  function activeArticle() {
    var arts = doc.querySelectorAll('main > article');
    for (var i = 0; i < arts.length; i++) if (!arts[i].hidden) return arts[i];
    return null;
  }

  /* ---------- navigation ---------- */
  function go(dir) {
    var art = activeArticle(); if (!art) return;
    var href = dir > 0 ? art.getAttribute('data-next') : art.getAttribute('data-prev');
    if (!href) return;
    if (mode === 'single') { location.hash = href; }
    else { location.href = href; }
  }
  App.next = function () { go(1); };
  App.prev = function () { go(-1); };

  doc.addEventListener('keydown', function (e) {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable)) return;
    if (toc && toc.open) return;
    if (e.key === 'ArrowRight' || e.key === 'PageDown') { go(1); e.preventDefault(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { go(-1); e.preventDefault(); }
  });

  /* ---------- single-file router ---------- */
  function route() {
    var arts = doc.querySelectorAll('main > article');
    var id = decodeURIComponent((location.hash || '#').slice(1));
    var target = null, anchor = null;
    if (id) {
      target = doc.getElementById(id);
      if (target && !(target.tagName === 'ARTICLE' && target.parentNode.tagName === 'MAIN')) {
        anchor = target; target = anchor.closest('main > article');
      }
    }
    if (!target) target = arts[0];
    for (var i = 0; i < arts.length; i++) arts[i].hidden = arts[i] !== target;
    var crumb = doc.querySelector('.crumb'); if (crumb) crumb.innerHTML = target.getAttribute('data-crumb') || '';
    var bar = doc.querySelector('.progress span'); if (bar) bar.style.width = (target.getAttribute('data-progress') || '0') + '%';
    var prev = doc.querySelector('.nav .prev'), next = doc.querySelector('.nav .next'), count = doc.querySelector('.nav .count');
    function setNav(a, href, label) {
      if (!a) return;
      if (href) { a.classList.remove('ph'); a.setAttribute('href', '#' + href); a.querySelector('.t').textContent = label || ''; }
      else { a.classList.add('ph'); a.removeAttribute('href'); }
    }
    setNav(prev, target.getAttribute('data-prev'), target.getAttribute('data-prev-label'));
    setNav(next, target.getAttribute('data-next'), target.getAttribute('data-next-label'));
    if (count) count.textContent = target.getAttribute('data-count') || '';
    var cur = doc.querySelectorAll('dialog.toc a[aria-current]');
    for (var c = 0; c < cur.length; c++) cur[c].removeAttribute('aria-current');
    var link = doc.querySelector('dialog.toc a[href="#' + target.id + '"]'); if (link) link.setAttribute('aria-current', 'page');
    updateTitle();
    App.mount(target);
    if (anchor) { anchor.scrollIntoView({ block: 'start' }); }
    else { window.scrollTo(0, 0); }
  }

  /* ---------- init ---------- */
  function init() {
    if (mode === 'print') {
      var all = doc.querySelectorAll('main > article');
      for (var i = 0; i < all.length; i++) App.mount(all[i]);
      return;
    }
    if (mode === 'single') {
      window.addEventListener('hashchange', route);
      route();
    } else {
      var art = activeArticle();
      updateTitle();
      App.mount(art);
    }
    doc.addEventListener('visibilitychange', function () { var a = activeArticle(); if (a && a._ctx && !doc.hidden) a._ctx.resume(); });
  }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();

  /* ---------- helpers for widgets ---------- */
  App.svg = function (tag, attrs, parent) {
    var el = doc.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) for (var k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  App.el = function (tag, attrs, parent) {
    var el = doc.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'html') el.innerHTML = attrs[k];
      else if (k === 'class') el.className = attrs[k];
      else if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    }
    if (parent) parent.appendChild(el);
    return el;
  };
  App.fmt = function (n, digits) {
    try { return new Intl.NumberFormat('de-CH', { maximumFractionDigits: digits == null ? 0 : digits }).format(n); }
    catch (e) { return String(Math.round(n)); }
  };
  App.ease = function (t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; };
  App.cssVar = function (name) { return getComputedStyle(doc.documentElement).getPropertyValue(name).trim(); };
  /* shared: a simplified German-aware tokenizer used by several figures (illustrative, not a real BPE) */
  App.tokenize = (function () {
    var COMMON = ('der die das und ist in zu den nicht von mit sich des auf für ich es ein im dem nach wird sind auch als an er hat aus noch bei wie wenn nur ihr war bis mehr über so was kann man sie oder aber wir dass sein zum zur bin am durch schon unter beim einer eine einem eines um vor ihn ihm zwei drei hier dort dann alle ohne seit ihre ihren wurde werden haben hatte ja nein sehr gut viel gross muss soll will bitte danke Sie Ihre Ihnen the of and to in a is that for it as was with be by on not this are or from at which but have an they you').split(' ');
    var CM = {}; COMMON.forEach(function (w) { CM[w.toLowerCase()] = 1; });
    var SUF = ['ungen', 'lichkeit', 'keiten', 'heiten', 'ierung', 'schaft', 'ation', 'ness', 'ment', 'able', 'ing', 'ers', 'ung', 'ist', 'ive', 'lich', 'isch', 'ent', 'ant', 'ly', 'ed', 'er', 'es', 'en', 'st', 's'];
    var PRE = ['unter', 'zwischen', 'gegen', 'wieder', 'zusammen', 'inter', 'trans', 'über', 'auto', 'multi', 'anti', 'pre', 'dis', 'un', 're', 'ge', 'be', 'ver', 'ent', 'zer', 'er', 'ab', 'an', 'auf', 'aus', 'ein', 'vor', 'nach', 'mit'];
    function splitWord(w) {
      var lw = w.toLowerCase();
      if (CM[lw] || w.length <= 4) return [w];
      var parts = [], rest = w;
      for (var i = 0; i < PRE.length; i++) { var p = PRE[i]; if (lw.length > p.length + 3 && lw.indexOf(p) === 0) { parts.push(rest.slice(0, p.length)); rest = rest.slice(p.length); break; } }
      var suf = '';
      for (var j = 0; j < SUF.length; j++) { var sf = SUF[j]; if (rest.length > sf.length + 3 && rest.toLowerCase().slice(-sf.length) === sf) { suf = rest.slice(-sf.length); rest = rest.slice(0, -sf.length); break; } }
      while (rest.length > 6) { var cut = rest.length > 9 ? 5 : Math.ceil(rest.length / 2); parts.push(rest.slice(0, cut)); rest = rest.slice(cut); }
      if (rest) parts.push(rest);
      if (suf) parts.push(suf);
      return parts;
    }
    return function (text) {
      var out = [], re = /(\s+)|(\d+)|([^\s\d\wÀ-ÿ])|([\wÀ-ÿ]+)/g, m, pendingSpace = false;
      while ((m = re.exec(text)) !== null) {
        if (m[1]) { pendingSpace = true; continue; }
        var pieces;
        if (m[2]) { pieces = m[2].match(/\d{1,3}/g); }
        else if (m[3]) { pieces = [m[3]]; }
        else { pieces = splitWord(m[4]); }
        pieces.forEach(function (p, i) { out.push({ t: p, sp: i === 0 && pendingSpace }); });
        pendingSpace = false;
      }
      return out;
    };
  })();
  App.countTokens = function (text) { return App.tokenize(text).length; };
})();
