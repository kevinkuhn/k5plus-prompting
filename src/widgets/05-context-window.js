App.widget('context-window', function (root, ctx) {
  var el = App.el;
  var CAPS = [32000, 200000, 1000000];
  var ITEMS = [
    { k: 'System-Prompt', n: 1500, s: 0 },
    { k: 'Deine Frage', n: 80, s: 1 },
    { k: 'Antwort', n: 400, s: 2 },
    { k: 'Sitzungsprotokoll', n: 4000, s: 3 },
    { k: 'PDF-Reglement, 30 Seiten', n: 15000, s: 4 },
    { k: 'Ganzes Gesetz', n: 120000, s: 5 }
  ];
  var state = { cap: 200000, items: [] };
  root.classList.add('w');
  var capRow = el('div', { class: 'cw-cap' }, root);
  el('span', { text: 'Kontextfenster:' }, capRow);
  var seg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Fenstergrösse' }, capRow);
  var capBtns = CAPS.map(function (c) {
    var b = el('button', { type: 'button', text: App.fmt(c) + ' Tokens', 'aria-pressed': String(c === state.cap) }, seg);
    b.addEventListener('click', function () { state.cap = c; capBtns.forEach(function (x, i) { x.setAttribute('aria-pressed', String(CAPS[i] === c)); }); render(); });
    return b;
  });
  var win = el('div', { class: 'cw-win', role: 'img', 'aria-label': 'Belegung des Kontextfensters' }, root);
  var read = el('div', { class: 'cw-read', 'aria-live': 'polite' }, root);
  var add = el('div', { class: 'cw-add' }, root);
  ITEMS.forEach(function (it) {
    var b = el('button', { type: 'button' }, add);
    var i = el('i', {}, b); i.style.background = 'var(--s' + (it.s + 1) + ')';
    b.appendChild(document.createTextNode('+ ' + it.k + ' ')); el('small', { text: '≈' + App.fmt(it.n) }, b);
    b.addEventListener('click', function () { push(it); });
  });
  var reset = el('button', { class: 'btn secondary', type: 'button', text: 'Zurücksetzen' }, add);
  reset.addEventListener('click', function () { state.items = []; render(); });
  var list = el('div', { class: 'cw-list' }, root);
  var note = el('div', { class: 'cw-note', 'aria-live': 'polite' }, root);
  function push(it) { state.items.push({ k: it.k, n: it.n, s: it.s }); render(); }
  function render() {
    var total = state.items.reduce(function (a, b) { return a + b.n; }, 0);
    // if overfull, the oldest items fall out of the window
    var over = Math.max(0, total - state.cap), dropped = 0, outIdx = [];
    for (var i = 0; i < state.items.length && dropped < over; i++) { dropped += state.items[i].n; outIdx.push(i); }
    win.innerHTML = '';
    var visible = 0;
    state.items.forEach(function (it, i) {
      var isOut = outIdx.indexOf(i) >= 0;
      var d = el('div', { class: 'it s' + it.s + (isOut ? ' out' : ''), title: it.k + ' ≈ ' + App.fmt(it.n) + ' Tokens' }, win);
      var pct = Math.min(100, it.n / state.cap * 100);
      if (!isOut) visible += it.n;
      d.style.flex = '0 0 ' + (isOut ? 0 : pct) + '%';
      if (pct > 6) d.textContent = it.k;
      if (isOut) d.style.display = 'none';
    });
    var free = Math.max(0, state.cap - visible);
    read.innerHTML = '';
    var a = el('span', {}, read); el('b', { text: App.fmt(visible) }, a); a.appendChild(document.createTextNode('Tokens belegt (' + Math.round(visible / state.cap * 100) + ' %)'));
    var b = el('span', {}, read); el('b', { text: App.fmt(free) }, b); b.appendChild(document.createTextNode('frei'));
    list.innerHTML = state.items.length ? 'Im Gespräch: ' + state.items.map(function (it, i) { return outIdx.indexOf(i) >= 0 ? '<span class="out">' + it.k + '</span>' : it.k; }).join(' · ') : 'Noch leer – leg etwas ins Fenster.';
    if (outIdx.length) note.textContent = 'Voll. Die ältesten Teile (' + outIdx.map(function (i) { return state.items[i].k; }).join(', ') + ') sind aus dem Fenster gefallen – das Modell sieht sie nicht mehr. Andere Werkzeuge lehnen die Eingabe stattdessen ab.';
    else if (visible / state.cap > 0.7) note.textContent = 'Über 70 % belegt: Jetzt sinkt die Qualität oft schon, bevor das Fenster voll ist (siehe Context Rot).';
    else note.textContent = '';
  }
  render();
  if (!ctx.reduced) {
    var demo = [0, 1, 2, 3, 1, 2, 4, 1, 2], k = 0;
    var iv = setInterval(function () { if (!ctx.active()) return; if (k >= demo.length) { clearInterval(iv); return; } push(ITEMS[demo[k++]]); }, 700);
    root.addEventListener('click', function () { clearInterval(iv); }, { once: true });
  } else { [0, 1, 2, 4].forEach(function (i) { push(ITEMS[i]); }); }
});
