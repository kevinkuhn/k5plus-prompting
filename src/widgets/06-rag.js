App.widget('rag', function (root, ctx) {
  var el = App.el, svg = App.svg;
  var FLOWS = {
    plain: {
      boxes: [
        { id: 'q', t: 'Deine Frage', sub: '«Wie lange ist die Einsprachefrist?»' },
        { id: 'm', t: 'Modell', sub: 'nur Trainingsdaten', cls: 'model' },
        { id: 'a', t: 'Antwort', sub: 'aus dem Gedächtnis' }
      ],
      edges: [['q', 'm'], ['m', 'a']],
      steps: [
        { at: 'q', txt: 'Die Frage geht direkt ans Modell. Dein Baureglement ist nirgends im Prompt.' },
        { at: 'm', edge: 0, txt: 'Das Modell greift auf das zurück, was in seinen Trainingsdaten über Baurecht stand – irgendwo, irgendwann.' },
        { at: 'a', edge: 1, txt: 'Die Antwort klingt sicher, ist aber ungesichert. Ob 20 oder 30 Tage, weiss das Modell nicht.' }
      ],
      answer: { weak: true, tag: 'unsicher', txt: 'In der Regel beträgt die Einsprachefrist gegen eine Baubewilligung 30 Tage. Die genaue Frist hängt vom Kanton und der Gemeinde ab; bitte prüfen Sie das zuständige Baureglement.' }
    },
    rag: {
      boxes: [
        { id: 'q', t: 'Deine Frage', sub: '«Wie lange ist die Einsprachefrist?»' },
        { id: 's', t: 'Suche', sub: 'in deinen Dokumenten', cls: 'tool' },
        { id: 'p', t: '3 Textstellen', sub: 'Baureglement, Merkblatt, …' },
        { id: 'm', t: 'Modell', sub: 'Frage + Textstellen', cls: 'model' },
        { id: 'a', t: 'Antwort', sub: 'mit Quelle' }
      ],
      edges: [['q', 's'], ['s', 'p'], ['p', 'm'], ['m', 'a']],
      steps: [
        { at: 'q', txt: 'Die Frage kommt an. Deine Dokumente liegen in einer Sammlung: Baureglement, Merkblatt Baugesuch, Verfahrensordnung.' },
        { at: 's', edge: 0, txt: 'Die Software vergleicht die Frage mit jedem Absatz der Sammlung und sucht die inhaltlich nächsten.' },
        { at: 'p', edge: 1, txt: 'Die drei passendsten Textstellen werden geholt – unter anderem Art. 14 des Baureglements.' },
        { at: 'm', edge: 2, txt: 'Das Modell liest Frage und Textstellen zusammen und schreibt daraus die Antwort.' },
        { at: 'a', edge: 3, txt: 'Die Antwort nennt die Quelle, damit du sie prüfen kannst. Das Modell hat nichts gelernt; es hat gelesen.' }
      ],
      answer: { weak: false, tag: 'mit Quelle', txt: 'Die Einsprachefrist beträgt 20 Tage ab Publikation des Baugesuchs im amtlichen Anzeiger (Art. 14 Abs. 2 Baureglement). Die Einsprache ist schriftlich an die Baubehörde zu richten (Merkblatt Baugesuch, Ziff. 5).' }
    }
  };
  var LAYOUT = {
    plain: {
      h: { W: 900, H: 250, boxes: { q: [60, 95, 220, 60], m: [340, 95, 220, 60], a: [620, 95, 220, 60] } },
      v: { W: 520, H: 250, boxes: { q: [130, 10, 260, 60], m: [130, 95, 260, 60], a: [130, 180, 260, 60] } }
    },
    rag: {
      h: { W: 900, H: 250, boxes: { q: [20, 95, 150, 60], s: [205, 95, 150, 60], p: [390, 95, 150, 60], m: [575, 95, 150, 60], a: [760, 95, 120, 60] } },
      v: { W: 520, H: 430, boxes: { q: [130, 10, 260, 60], s: [130, 100, 260, 60], p: [130, 190, 260, 60], m: [130, 280, 260, 60], a: [130, 370, 260, 60] } }
    }
  };
  var state = { mode: 'plain', step: 0, playing: !ctx.reduced, timer: null };
  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  var seg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Modus' }, ctl);
  var bP = el('button', { type: 'button', 'aria-pressed': 'true', text: 'Ohne Dokumente' }, seg);
  var bR = el('button', { type: 'button', 'aria-pressed': 'false', text: 'Mit Dokumenten (RAG)' }, seg);
  var play = el('button', { class: 'btn', type: 'button' }, ctl), next = el('button', { class: 'btn secondary', type: 'button', text: 'Nächster Schritt' }, ctl);
  var s = svg('svg', { class: 'rg-svg', viewBox: '0 0 900 250', role: 'img', 'aria-label': 'Ablauf' }, root);
  var defs = svg('defs', {}, s); var mk = svg('marker', { id: 'rg-head', markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' }, defs); svg('path', { d: 'M0 0 L8 4 L0 8 Z', fill: 'var(--ink-3)' }, mk);
  var gE = svg('g', {}, s), gB = svg('g', {}, s), ball = svg('circle', { class: 'rg-ball', r: 6 }, s);
  var cap = el('div', { class: 'rg-cap', 'aria-live': 'polite' }, root);
  var ans = el('div', { class: 'rg-ans', 'aria-live': 'polite' }, root);
  var boxes = {}, edges = [], anim = null;
  function center(b) { return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; }
  function build() {
    var f = FLOWS[state.mode], narrow = root.clientWidth < 700, L = LAYOUT[state.mode][narrow ? 'v' : 'h'];
    s.setAttribute('viewBox', '0 0 ' + L.W + ' ' + L.H);
    gE.innerHTML = ''; gB.innerHTML = ''; boxes = {}; edges = [];
    f.boxes.forEach(function (bd) {
      var g0 = L.boxes[bd.id], b = { x: g0[0], y: g0[1], w: g0[2], h: g0[3] };
      var g = svg('g', {}, gB);
      var r = svg('rect', { class: 'rg-box' + (bd.cls ? ' ' + bd.cls : ''), x: b.x, y: b.y, width: b.w, height: b.h }, g);
      svg('text', { class: 'rg-t', x: b.x + b.w / 2, y: b.y + 26 }, g).textContent = bd.t;
      svg('text', { class: 'rg-t sub', x: b.x + b.w / 2, y: b.y + 44 }, g).textContent = bd.sub;
      boxes[bd.id] = { b: b, r: r };
    });
    f.edges.forEach(function (e) {
      var a = boxes[e[0]].b, b = boxes[e[1]].b, d;
      if (b.y >= a.y + a.h) d = 'M' + (a.x + a.w / 2) + ' ' + (a.y + a.h) + ' L' + (b.x + b.w / 2) + ' ' + b.y;
      else d = 'M' + (a.x + a.w) + ' ' + (a.y + a.h / 2) + ' L' + b.x + ' ' + (b.y + b.h / 2);
      edges.push(svg('path', { class: 'rg-edge', d: d, 'marker-end': 'url(#rg-head)' }, gE));
    });
    show();
  }
  function show() {
    var f = FLOWS[state.mode], st = f.steps[state.step];
    for (var k in boxes) boxes[k].r.classList.toggle('on', k === st.at);
    edges.forEach(function (p, i) { p.classList.toggle('on', st.edge === i); });
    cap.innerHTML = ''; el('b', { text: (state.step + 1) + '/' + f.steps.length }, cap); cap.appendChild(document.createTextNode(st.txt));
    var last = state.step === f.steps.length - 1;
    ans.innerHTML = ''; ans.classList.toggle('weak', f.answer.weak);
    var k2 = el('span', { class: 'k', text: 'Antwort' }, ans);
    if (last) { el('span', { class: 'tag' + (f.answer.weak ? '' : ' ok'), text: f.answer.tag }, k2); ans.appendChild(document.createTextNode(f.answer.txt)); }
    else el('span', { class: 'muted', text: '…' }, ans);
    if (anim) anim.stop();
    if (st.edge == null) { var c = center(boxes[st.at].b); ball.setAttribute('cx', c.x); ball.setAttribute('cy', c.y); return; }
    var path = edges[st.edge], len = path.getTotalLength(), t0 = null;
    anim = ctx.raf(function (dt, t) { if (t0 === null) t0 = t; var p = ctx.reduced ? 1 : Math.min(1, (t - t0) / 800); var pt = path.getPointAtLength(App.ease(p) * len); ball.setAttribute('cx', pt.x); ball.setAttribute('cy', pt.y); if (p >= 1) anim.stop(); });
  }
  function advance() { state.step = (state.step + 1) % FLOWS[state.mode].steps.length; show(); }
  function schedule() { clearTimeout(state.timer); if (!state.playing) return; state.timer = setTimeout(function () { if (ctx.active()) advance(); schedule(); }, 2800); }
  function labels() { play.textContent = state.playing ? 'Pause' : 'Abspielen'; }
  function setMode(m) { state.mode = m; state.step = 0; bP.setAttribute('aria-pressed', String(m === 'plain')); bR.setAttribute('aria-pressed', String(m === 'rag')); build(); }
  bP.addEventListener('click', function () { setMode('plain'); }); bR.addEventListener('click', function () { setMode('rag'); });
  play.addEventListener('click', function () { state.playing = !state.playing; labels(); schedule(); });
  next.addEventListener('click', function () { state.playing = false; labels(); clearTimeout(state.timer); advance(); });
  labels(); build(); schedule();
  var rt = null; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (ctx.active()) build(); }, 150); });
});
