App.widget('agents', function (root, ctx) {
  var el = App.el, svg = App.svg, T = function (en, de) { return ctx.t({ en: en, de: de }); };
  var W = 900, H = 250;
  var FLOWS = {
    rag: {
      boxes: [
        { id: 'q', t: { en: 'Your question', de: 'Deine Frage' }, sub: { en: '“What did we decide in May?”', de: '«Was haben wir im Mai beschlossen?»' } },
        { id: 's', t: { en: 'Search', de: 'Suche' }, sub: { en: 'in your documents', de: 'in deinen Dokumenten' }, cls: 'tool' },
        { id: 'p', t: { en: '3 passages', de: '3 Textstellen' }, sub: { en: 'most similar to the question', de: 'der Frage am ähnlichsten' } },
        { id: 'm', t: { en: 'Model', de: 'Modell' }, sub: { en: 'question + passages', de: 'Frage + Textstellen' }, cls: 'model' },
        { id: 'a', t: { en: 'Answer', de: 'Antwort' }, sub: { en: 'with sources', de: 'mit Quellen' } }
      ],
      edges: [['q', 's'], ['s', 'p'], ['p', 'm'], ['m', 'a']],
      steps: [
        { at: 'q', en: 'The question is turned into an embedding (chapter 5).', de: 'Die Frage wird in ein Embedding umgewandelt: eine Zahlenreihe, die ihre Bedeutung beschreibt.' },
        { at: 's', en: 'The software compares it with the embeddings of every passage in your documents.', de: 'Die Software vergleicht es mit den Embeddings aller Textstellen in deinen Dokumenten.' },
        { at: 'p', en: 'The closest passages are fetched — e.g. the minutes of the May meeting.', de: 'Die nächstliegenden Textstellen werden geholt – z. B. das Protokoll der Mai-Sitzung.' },
        { at: 'm', en: 'The model reads question and passages together and writes an answer from them.', de: 'Das Modell liest Frage und Textstellen zusammen und schreibt daraus eine Antwort.' },
        { at: 'a', en: 'The answer cites the passages, so you can check it. The model learned nothing; it read.', de: 'Die Antwort zitiert die Textstellen, damit du sie prüfen kannst. Das Modell hat nichts gelernt; es hat gelesen.' }
      ]
    },
    agent: {
      boxes: [
        { id: 'g', t: { en: 'Goal', de: 'Ziel' }, sub: { en: '“GPT-3 training in Swiss households?”', de: '«GPT-3-Training in Schweizer Haushalten?»' } },
        { id: 'm', t: { en: 'Model', de: 'Modell' }, sub: { en: 'plans the next step', de: 'plant den nächsten Schritt' }, cls: 'model' },
        { id: 't', t: { en: 'Tool', de: 'Werkzeug' }, sub: { en: 'search · calculator · code', de: 'Suche · Rechner · Code' }, cls: 'tool' },
        { id: 'd', t: { en: 'Done', de: 'Fertig' }, sub: { en: 'answer with steps', de: 'Antwort mit Schritten' } }
      ],
      edges: [['g', 'm'], ['m', 't', 'up'], ['t', 'm', 'down'], ['m', 'd', 'over']],
      steps: [
        { at: 'g', en: 'The goal arrives. No single lookup answers it.', de: 'Das Ziel kommt an. Keine einzelne Abfrage beantwortet es.' },
        { at: 'm', en: 'The model decides: first find GPT-3’s training energy.', de: 'Das Modell entscheidet: zuerst den Trainingsenergiebedarf von GPT-3 finden.' },
        { at: 't', edge: 1, en: 'Tool call: search → “1,287 MWh (Patterson et al. 2021)”.', de: 'Werkzeugaufruf: Suche → «1’287 MWh (Patterson et al. 2021)».' },
        { at: 'm', edge: 2, en: 'Result goes back into the conversation. Next: a Swiss household’s consumption.', de: 'Das Resultat fliesst zurück ins Gespräch. Weiter: Verbrauch eines Schweizer Haushalts.' },
        { at: 't', edge: 1, en: 'Tool call: search → “4,500 kWh per year (ElCom H4)”.', de: 'Werkzeugaufruf: Suche → «4’500 kWh pro Jahr (ElCom H4)».' },
        { at: 'm', edge: 2, en: 'Next: calculate. Tool call: calculator → 1,287,000 / 4,500 = 286.', de: 'Weiter: rechnen. Werkzeugaufruf: Rechner → 1’287’000 / 4’500 = 286.' },
        { at: 'd', edge: 3, en: 'Answer: “about 286 households for a year”, with the steps and sources. Each step could have gone wrong.', de: 'Antwort: «rund 286 Haushalte für ein Jahr», mit Schritten und Quellen. Jeder Schritt hätte schiefgehen können.' }
      ]
    }
  };
  // geometry for wide (horizontal) and narrow (vertical) containers
  var LAYOUT = {
    rag: {
      h: { W: 900, H: 250, boxes: { q: [20, 95, 150, 60], s: [205, 95, 150, 60], p: [390, 95, 150, 60], m: [575, 95, 150, 60], a: [760, 95, 120, 60] } },
      v: { W: 520, H: 430, boxes: { q: [130, 10, 260, 60], s: [130, 100, 260, 60], p: [130, 190, 260, 60], m: [130, 280, 260, 60], a: [130, 370, 260, 60] } }
    },
    agent: {
      h: { W: 900, H: 250, boxes: { g: [20, 95, 150, 60], m: [260, 95, 170, 60], t: [540, 95, 170, 60], d: [760, 95, 120, 60] } },
      v: { W: 520, H: 340, boxes: { g: [150, 10, 220, 60], m: [20, 140, 210, 60], t: [290, 140, 210, 60], d: [150, 270, 220, 60] } }
    }
  };
  var state = { mode: 'rag', step: 0, playing: !ctx.reduced, timer: null };
  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  var seg = el('div', { class: 'seg', role: 'group' }, ctl);
  var bR = el('button', { type: 'button', 'aria-pressed': 'true' }, seg), bA = el('button', { type: 'button', 'aria-pressed': 'false' }, seg);
  var play = el('button', { class: 'btn', type: 'button' }, ctl), next = el('button', { class: 'btn secondary', type: 'button' }, ctl);
  var s = svg('svg', { class: 'ag-svg', viewBox: '0 0 ' + W + ' ' + H, role: 'img' }, root);
  var gE = svg('g', {}, s), gB = svg('g', {}, s), ball = svg('circle', { class: 'ag-ball', r: 6 }, s);
  var cap = el('div', { class: 'ag-cap', 'aria-live': 'polite' }, root);
  var boxes = {}, edges = [];
  function center(b) { return { x: b.x + b.w / 2, y: b.y + b.h / 2 }; }
  function build() {
    var f = FLOWS[state.mode], l = ctx.lang(), narrow = root.clientWidth < 700;
    var L = LAYOUT[state.mode][narrow ? 'v' : 'h'];
    W = L.W; H = L.H; s.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    gE.innerHTML = ''; gB.innerHTML = ''; boxes = {}; edges = [];
    f.boxes.forEach(function (bd) {
      var g0 = L.boxes[bd.id], b = { x: g0[0], y: g0[1], w: g0[2], h: g0[3], cls: bd.cls };
      var g = svg('g', {}, gB);
      var r = svg('rect', { class: 'ag-box' + (b.cls ? ' ' + b.cls : ''), x: b.x, y: b.y, width: b.w, height: b.h }, g);
      var t = svg('text', { class: 'ag-t', x: b.x + b.w / 2, y: b.y + 26 }, g); t.textContent = bd.t[l];
      var t2 = svg('text', { class: 'ag-t sub', x: b.x + b.w / 2, y: b.y + 44 }, g); t2.textContent = bd.sub[l];
      boxes[bd.id] = { b: b, r: r };
    });
    f.edges.forEach(function (e) {
      var a = boxes[e[0]].b, b = boxes[e[1]].b, d;
      var below = b.y >= a.y + a.h;
      if (e[2] === 'up') d = 'M' + (a.x + a.w) + ' ' + (a.y + 18) + ' C ' + (a.x + a.w + 40) + ' ' + (a.y - 30) + ', ' + (b.x - 40) + ' ' + (b.y - 30) + ', ' + b.x + ' ' + (b.y + 18);
      else if (e[2] === 'down') d = 'M' + a.x + ' ' + (a.y + a.h - 18) + ' C ' + (a.x - 40) + ' ' + (a.y + a.h + 30) + ', ' + (b.x + b.w + 40) + ' ' + (b.y + b.h + 30) + ', ' + (b.x + b.w) + ' ' + (b.y + b.h - 18);
      else if (e[2] === 'over' && !below) d = 'M' + (a.x + a.w / 2) + ' ' + a.y + ' C ' + (a.x + a.w / 2) + ' ' + (a.y - 80) + ', ' + (b.x + b.w / 2) + ' ' + (b.y - 80) + ', ' + (b.x + b.w / 2) + ' ' + b.y;
      else if (below) d = 'M' + (a.x + a.w / 2) + ' ' + (a.y + a.h) + ' L' + (b.x + b.w / 2) + ' ' + b.y;
      else d = 'M' + (a.x + a.w) + ' ' + (a.y + a.h / 2) + ' L' + b.x + ' ' + (b.y + b.h / 2);
      var p = svg('path', { class: 'ag-edge', d: d, 'marker-end': 'url(#ag-head)' }, gE);
      edges.push(p);
    });
    if (!s.querySelector('#ag-head')) { var defs = svg('defs', {}, s); var mk = svg('marker', { id: 'ag-head', markerWidth: 8, markerHeight: 8, refX: 7, refY: 4, orient: 'auto' }, defs); svg('path', { d: 'M0 0 L8 4 L0 8 Z', fill: 'var(--ink-3)' }, mk); }
    show();
  }
  var anim = null;
  function show() {
    var f = FLOWS[state.mode], st = f.steps[state.step], l = ctx.lang();
    for (var k in boxes) boxes[k].r.classList.toggle('on', k === st.at);
    edges.forEach(function (p, i) { p.classList.toggle('on', st.edge === i || (st.edge == null && state.step > 0 && state.mode === 'rag' && i === state.step - 1)); });
    cap.innerHTML = '<b>' + (state.step + 1) + '/' + f.steps.length + '</b>' + st[l];
    // move the ball along the active edge
    var ei = st.edge != null ? st.edge : (state.mode === 'rag' && state.step > 0 ? state.step - 1 : -1);
    if (anim) anim.stop();
    if (ei < 0) { var c = center(boxes[st.at].b); ball.setAttribute('cx', c.x); ball.setAttribute('cy', c.y); return; }
    var path = edges[ei], len = path.getTotalLength(), t0 = null;
    anim = ctx.raf(function (dt, t) { if (t0 === null) t0 = t; var p = ctx.reduced ? 1 : Math.min(1, (t - t0) / 800); var pt = path.getPointAtLength(App.ease(p) * len); ball.setAttribute('cx', pt.x); ball.setAttribute('cy', pt.y); if (p >= 1) anim.stop(); });
  }
  function advance() { var f = FLOWS[state.mode]; state.step = (state.step + 1) % f.steps.length; show(); }
  function schedule() { clearTimeout(state.timer); if (!state.playing) return; state.timer = setTimeout(function () { if (ctx.active()) advance(); schedule(); }, 2800); }
  function labels() { bR.textContent = T('Documents (RAG)', 'Dokumente (RAG)'); bA.textContent = T('Tools (agent)', 'Werkzeuge (Agent)'); play.textContent = state.playing ? T('Pause', 'Pause') : T('Play', 'Abspielen'); next.textContent = T('Next step', 'Nächster Schritt'); }
  function setMode(m) { state.mode = m; state.step = 0; bR.setAttribute('aria-pressed', String(m === 'rag')); bA.setAttribute('aria-pressed', String(m === 'agent')); build(); }
  bR.addEventListener('click', function () { setMode('rag'); }); bA.addEventListener('click', function () { setMode('agent'); });
  play.addEventListener('click', function () { state.playing = !state.playing; labels(); schedule(); });
  next.addEventListener('click', function () { state.playing = false; labels(); clearTimeout(state.timer); advance(); });
  ctx.onLang(function () { labels(); build(); });
  labels(); build(); schedule();
  var rt = null; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (ctx.active()) build(); }, 150); });
});
