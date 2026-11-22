App.widget('pipeline', function (root, ctx) {
  var el = App.el, svg = App.svg;
  var PROMPT = 'Fasse das Protokoll der Bauamts-Sitzung vom 3. September in zwei Sätzen zusammen: Traktandum 1 Sanierung Schulhausstrasse (Kredit CHF 480’000 genehmigt), Traktandum 2 neue Öffnungszeiten Schalter (ab Januar Mo–Fr 8–12, Do zusätzlich 14–18 Uhr).';
  var ANSWER = 'Das Bauamt hat am 3. September den Kredit von CHF 480’000 für die Sanierung der Schulhausstrasse genehmigt. Ab Januar gelten am Schalter neue Öffnungszeiten: Montag bis Freitag 8 bis 12 Uhr, donnerstags zusätzlich 14 bis 18 Uhr.';
  var TOKS = App.tokenize(ANSWER);
  var STEPS = [
    { at: 'p', edge: -1, t: 'Dein Prompt kommt an: eine Anweisung plus das Material – als Text.' },
    { at: 't', edge: 0, t: 'Der Tokenizer zerlegt den Text in Tokens und macht daraus Zahlen.' },
    { at: 'm', edge: 1, t: 'Das Modell rechnet: Welches Token folgt am wahrscheinlichsten auf alles, was bisher dasteht?' },
    { at: 'o', edge: 2, t: 'Das gewählte Token erscheint als Teil der Antwort …' },
    { at: 'm', edge: 3, t: '… und wird an die Eingabe angehängt. Das Modell läuft von vorn – für jedes weitere Token.' }
  ];
  var state = { step: 0, produced: 0, playing: !ctx.reduced, timer: null };
  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  var play = el('button', { class: 'btn', type: 'button' }, ctl), next = el('button', { class: 'btn secondary', type: 'button', text: 'Nächster Schritt' }, ctl), reset = el('button', { class: 'btn secondary', type: 'button', text: 'Von vorn' }, ctl);
  var s = svg('svg', { class: 'pl-svg', role: 'img', 'aria-label': 'Ablauf: Prompt, Tokenizer, Modell, Antwort' }, root);
  var gE = svg('g', {}, s), gB = svg('g', {}, s), ball = svg('circle', { class: 'pl-ball', r: 6 }, s);
  var cap = el('div', { class: 'pl-cap', 'aria-live': 'polite' }, root);
  var io = el('div', { class: 'pl-io' }, root);
  var inBox = el('div', { class: 'pl-in' }, io); el('span', { class: 'k', text: 'Eingabe (Prompt + bisherige Antwort)' }, inBox); var inTxt = el('span', { text: PROMPT }, inBox);
  var outBox = el('div', { class: 'pl-out' }, io); el('span', { class: 'k', text: 'Ausgabe, Token für Token' }, outBox); var outToks = el('div', { class: 'tk-out', 'aria-live': 'polite' }, outBox); var count = el('div', { class: 'pl-count' }, outBox);
  var BOX = { p: ['Dein Prompt', 'Text'], t: ['Tokenizer', 'Text → Zahlen'], m: ['Modell', 'sagt nächstes Token voraus'], o: ['Antwort', 'Token für Token'] };
  var boxes = {}, edges = [];
  function build() {
    var narrow = root.clientWidth < 640, W, H, L;
    if (narrow) { W = 360; H = 380; L = { p: [90, 10, 180, 56], t: [90, 100, 180, 56], m: [90, 190, 180, 56], o: [90, 300, 180, 56] }; }
    else { W = 900; H = 200; L = { p: [20, 70, 170, 60], t: [250, 70, 170, 60], m: [480, 70, 190, 60], o: [730, 70, 150, 60] }; }
    s.setAttribute('viewBox', '0 0 ' + W + ' ' + H); gE.innerHTML = ''; gB.innerHTML = ''; boxes = {}; edges = [];
    if (!s.querySelector('#pl-head')) { var defs = svg('defs', {}, s); var mk = svg('marker', { id: 'pl-head', markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' }, defs); svg('path', { d: 'M0 0 L8 4 L0 8 Z', fill: 'var(--ink-3)' }, mk); }
    ['p', 't', 'm', 'o'].forEach(function (id) {
      var g = L[id], b = { x: g[0], y: g[1], w: g[2], h: g[3] };
      var r = svg('rect', { class: 'pl-box' + (id === 'm' ? ' model' : ''), x: b.x, y: b.y, width: b.w, height: b.h }, gB);
      svg('text', { class: 'pl-t', x: b.x + b.w / 2, y: b.y + 24 }, gB).textContent = BOX[id][0];
      svg('text', { class: 'pl-t sub', x: b.x + b.w / 2, y: b.y + 42 }, gB).textContent = BOX[id][1];
      boxes[id] = { b: b, r: r };
    });
    function line(a, b) { a = boxes[a].b; b = boxes[b].b; return narrow ? 'M' + (a.x + a.w / 2) + ' ' + (a.y + a.h) + ' L' + (b.x + b.w / 2) + ' ' + b.y : 'M' + (a.x + a.w) + ' ' + (a.y + a.h / 2) + ' L' + b.x + ' ' + (b.y + b.h / 2); }
    [['p', 't'], ['t', 'm'], ['m', 'o']].forEach(function (e) { edges.push(svg('path', { class: 'pl-edge', d: line(e[0], e[1]), 'marker-end': 'url(#pl-head)' }, gE)); });
    var o = boxes.o.b, m = boxes.m.b, d;
    if (narrow) d = 'M' + (o.x + o.w) + ' ' + (o.y + o.h / 2) + ' C ' + (o.x + o.w + 60) + ' ' + (o.y + o.h / 2) + ', ' + (m.x + m.w + 60) + ' ' + (m.y + m.h / 2) + ', ' + (m.x + m.w) + ' ' + (m.y + m.h / 2);
    else d = 'M' + (o.x + o.w / 2) + ' ' + (o.y + o.h) + ' C ' + (o.x + o.w / 2) + ' ' + (o.y + o.h + 70) + ', ' + (m.x + m.w / 2) + ' ' + (m.y + m.h + 70) + ', ' + (m.x + m.w / 2) + ' ' + (m.y + m.h);
    edges.push(svg('path', { class: 'pl-edge back', d: d, 'marker-end': 'url(#pl-head)' }, gE));
    show();
  }
  var anim = null;
  function show() {
    var st = STEPS[state.step];
    for (var k in boxes) boxes[k].r.classList.toggle('on', k === st.at);
    edges.forEach(function (p, i) { p.classList.toggle('on', i === st.edge); });
    cap.innerHTML = ''; el('b', { text: (state.step + 1) + '/' + STEPS.length }, cap); cap.appendChild(document.createTextNode(st.t));
    if (anim) anim.stop();
    if (st.edge < 0) { var c = boxes[st.at].b; ball.setAttribute('cx', c.x + c.w / 2); ball.setAttribute('cy', c.y + c.h / 2); return; }
    var path = edges[st.edge], len = path.getTotalLength(), t0 = null;
    anim = ctx.raf(function (dt, t) { if (t0 === null) t0 = t; var p = ctx.reduced ? 1 : Math.min(1, (t - t0) / 700); var pt = path.getPointAtLength(App.ease(p) * len); ball.setAttribute('cx', pt.x); ball.setAttribute('cy', pt.y); if (p >= 1) anim.stop(); });
  }
  function renderOut() {
    outToks.innerHTML = '';
    for (var i = 0; i < state.produced; i++) el('span', { class: 'tk c' + (i % 5) + (TOKS[i].sp ? ' sp' : '') + (i === state.produced - 1 ? ' next' : ''), text: TOKS[i].t }, outToks);
    count.textContent = state.produced + ' von ' + TOKS.length + ' Tokens erzeugt';
    var soFar = TOKS.slice(0, state.produced).map(function (t) { return (t.sp ? ' ' : '') + t.t; }).join('');
    inTxt.textContent = PROMPT + (soFar ? ' ' + soFar : '');
  }
  function advance() {
    if (state.step === 3 && state.produced < TOKS.length) state.produced++;
    if (state.step === 4) { state.step = 2; } else { state.step++; }
    if (state.step >= STEPS.length) state.step = 2;
    if (state.produced >= TOKS.length) { state.playing = false; labels(); cap.innerHTML = ''; el('b', { text: '✓' }, cap); cap.appendChild(document.createTextNode('Das Modell hat das «Ende»-Token gewählt. Die Antwort ist fertig – ' + TOKS.length + ' Durchläufe für ' + TOKS.length + ' Tokens.')); renderOut(); return; }
    show(); renderOut();
  }
  function schedule() { clearTimeout(state.timer); if (!state.playing) return; state.timer = setTimeout(function () { if (ctx.active()) advance(); schedule(); }, state.produced > 2 ? 500 : 1800); }
  function labels() { play.textContent = state.playing ? 'Pause' : 'Abspielen'; }
  play.addEventListener('click', function () { state.playing = !state.playing; labels(); schedule(); });
  next.addEventListener('click', function () { state.playing = false; labels(); clearTimeout(state.timer); advance(); });
  reset.addEventListener('click', function () { state.step = 0; state.produced = 0; state.playing = !ctx.reduced; labels(); renderOut(); show(); schedule(); });
  labels(); build(); renderOut(); schedule();
  var rt = null; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (ctx.active()) build(); }, 150); });
});
