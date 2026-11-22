App.widget('static-model', function (root, ctx) {
  var el = App.el, svg = App.svg;
  var WEEKS = 8, W = 560, H = 300, X0 = 16, X1 = 556;
  var TRAITS = ['schreibt Schweizer Deutsch', 'arbeitet vermutlich in einer Verwaltung', 'fragt oft nach Protokollen', 'bevorzugt kurze Antworten', 'Fachgebiet: Einwohnerdienste', 'nutzt das Tool meist vormittags'];
  var MEM = ['Anrede: «Sehr geehrte»', 'Gemeinde hat ~8’000 Einwohner', 'Keine Aufzählungen', 'Schreibt für die Website', 'Team: 5 Personen'];
  var state = { w: 1 };
  root.classList.add('w');
  var head = el('div', { class: 'st-head' }, root);
  var wk = el('div', { class: 'st-week', 'aria-live': 'polite' }, head);
  var ctl = el('div', { class: 'ctl' }, head);
  var next = el('button', { class: 'btn', type: 'button', text: 'Nächste Woche' }, ctl);
  var reset = el('button', { class: 'btn secondary', type: 'button', text: 'Von vorn' }, ctl);
  var s = svg('svg', { class: 'st-svg', viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Modell bleibt gleich, Konto wächst' }, root);
  var read = el('div', { class: 'st-read', 'aria-live': 'polite' }, root);
  var rm = el('div', { class: 'm' }, read), ra = el('div', { class: 'a' }, read);
  function xw(i) { return X0 + (i - 1) / (WEEKS - 1) * (X1 - X0 - 62); }
  function render() {
    s.innerHTML = '';
    var w = state.w;
    wk.innerHTML = ''; wk.appendChild(document.createTextNode('Woche ' + w)); el('small', { text: 'von ' + WEEKS }, wk);
    // axis
    svg('text', { class: 'st-lbl', x: X0, y: 22 }, s).textContent = 'Das Modell';
    svg('text', { class: 'st-lbl', x: X0, y: 172 }, s).textContent = 'Dein Konto';
    for (var i = 1; i <= WEEKS; i++) {
      var x = xw(i);
      svg('line', { class: 'st-line', x1: x, y1: 30, x2: x, y2: 285 }, s);
      svg('text', { class: 'st-tick' + (i === w ? ' on' : ''), x: x + 30, y: 297 }, s).textContent = 'W' + i;
    }
    svg('line', { class: 'st-flat', x1: X0, y1: 90, x2: X1, y2: 90 }, s);
    // model boxes: identical every week; version 2.0 from week 6
    for (var j = 1; j <= w; j++) {
      var mx = xw(j), v2 = j >= 6;
      svg('rect', { class: 'st-model' + (v2 ? ' v2' : ''), x: mx, y: 60, width: 60, height: 60 }, s);
      svg('text', { class: 'st-mt', x: mx + 30, y: 86 }, s).textContent = v2 ? 'v2.0' : 'v1.0';
      svg('text', { class: 'st-mt sub', x: mx + 30, y: 100 }, s).textContent = 'gleich';
      if (j === 6) svg('text', { class: 'st-rel', x: mx + 30, y: 52 }, s).textContent = 'neue Version';
    }
    svg('text', { class: 'st-cap', x: X0, y: 140 }, s).textContent = 'Wissensstand: Trainingsende. Deine Chats verändern das Modell nicht.';
    // account: growing stacks
    var chats = w * 3 + Math.floor(w / 2), mem = Math.min(MEM.length, Math.floor(w * 0.7)), traits = Math.min(TRAITS.length, Math.floor(w * 0.8));
    for (var k = 1; k <= w; k++) {
      var ax = xw(k), rows = k * 3 + Math.floor(k / 2), memk = Math.min(MEM.length, Math.floor(k * 0.7));
      for (var r = 0; r < rows; r++) svg('rect', { class: 'st-acc', x: ax, y: 270 - r * 5 - 4, width: 34, height: 3.5 }, s);
      for (var m = 0; m < memk; m++) svg('rect', { class: 'st-acc mem', x: ax + 40, y: 270 - m * 9 - 7, width: 20, height: 6 }, s);
    }
    svg('text', { class: 'st-cap', x: X0, y: 190 }, s).textContent = 'Chats (hell) · Memory-Einträge (dunkel) – wachsen mit jeder Nutzung.';
    rm.innerHTML = ''; el('b', { text: 'Modell' }, rm); rm.appendChild(document.createTextNode('Hat sich nicht verändert. Version ' + (w >= 6 ? '2.0 (seit Woche 6, vom Anbieter veröffentlicht)' : '1.0') + ', Wissensstand unverändert.'));
    ra.innerHTML = ''; el('b', { text: 'Dein Profil beim Anbieter' }, ra); ra.appendChild(document.createTextNode(chats + ' Chats gespeichert, ' + mem + ' Memory-Einträge, ' + traits + ' abgeleitete Merkmale:'));
    var box = el('div', {}, ra);
    for (var t = 0; t < traits; t++) el('span', { class: 't', text: TRAITS[t] }, box);
    for (var q = 0; q < mem; q++) el('span', { class: 't', text: '📝 ' + MEM[q] }, box);
  }
  next.addEventListener('click', function () { state.w = state.w >= WEEKS ? 1 : state.w + 1; render(); });
  reset.addEventListener('click', function () { state.w = 1; render(); });
  render();
  if (!ctx.reduced) {
    var iv = setInterval(function () { if (!ctx.active()) return; if (state.w >= WEEKS) { clearInterval(iv); return; } state.w++; render(); }, 1300);
    root.addEventListener('click', function () { clearInterval(iv); }, { once: true });
  }
});
