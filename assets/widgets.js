/* ---- 01-prompt-anatomy.js ---- */
App.widget('prompt-anatomy', function (root, ctx) {
  var el = App.el;
  var BLOCKS = [
    { k: 'Anweisung', text: 'Schreibe eine Antwort auf die folgende Anfrage einer Einwohnerin.' },
    { k: 'Kontext', text: 'Anfrage: «Guten Tag, ich habe gehört, dass die Parkkarten für Anwohner ab nächstem Jahr teurer werden. Stimmt das, und wo kann ich meine verlängern? Freundliche Grüsse, M. Keller» – Fakten: Die Anwohnerparkkarte kostet ab 1. Januar 2027 CHF 360 statt 300 pro Jahr (Beschluss Gemeinderat vom 12. Mai 2026). Verlängerung online im Bürgerportal oder am Schalter der Einwohnerdienste, Mo–Fr 8–12 und 14–17 Uhr.' },
    { k: 'Form', text: 'Höflich, Sie-Form, mit Anrede und Grussformel, maximal 120 Wörter, keine Aufzählung.' }
  ];
  // canned answers, keyed by which blocks are on (A = Anweisung, M = Kontext, F = Form)
  var ANSWERS = {
    '': ['Womit kann ich helfen?', 'Leer', 'Kein Prompt, keine Aufgabe. Das Modell kann nur zurückfragen.'],
    'A': ['Gerne beantworte ich die Anfrage. Allerdings sehe ich keine Anfrage in Ihrer Nachricht – könnten Sie den Text einfügen? Sobald ich weiss, worum es geht, formuliere ich eine passende Antwort.', 'Rät oder fragt zurück', 'Die Anweisung ist klar, aber das Modell kennt weder die Anfrage noch die Fakten. Es kann nur nachfragen – oder etwas erfinden.'],
    'M': ['Das ist eine Anfrage zur Anwohnerparkkarte: Frau Keller möchte wissen, ob die Karte teurer wird und wo sie sie verlängern kann. Laut Beschluss steigt der Preis ab 2027 auf CHF 360. Soll ich eine Antwort formulieren, die Anfrage zusammenfassen oder etwas anderes damit tun?', 'Fasst zusammen, weiss nicht, was tun', 'Kontext ohne Anweisung: Das Modell beschreibt, was es sieht, und fragt nach der Aufgabe.'],
    'F': ['Sehr geehrte Damen und Herren\n\nVielen Dank für Ihre Nachricht. Gerne helfe ich Ihnen weiter – teilen Sie mir bitte mit, worum es geht.\n\nFreundliche Grüsse', 'Form ohne Inhalt', 'Ton und Länge stimmen, aber es gibt nichts zu sagen.'],
    'AM': ['Sehr geehrte Frau Keller\n\nVielen Dank für Ihre Anfrage. Ja, das stimmt:\n\n• Ab 1. Januar 2027 kostet die Anwohnerparkkarte CHF 360 pro Jahr (bisher CHF 300).\n• Grundlage ist der Beschluss des Gemeinderats vom 12. Mai 2026.\n• Verlängern können Sie die Karte online im Bürgerportal oder am Schalter der Einwohnerdienste (Mo–Fr 8–12 und 14–17 Uhr).\n\nBei weiteren Fragen stehe ich Ihnen gerne zur Verfügung.\n\nFreundliche Grüsse', 'Inhaltlich richtig, Form ist Standard', 'Alle Fakten stimmen. Aber Aufzählungspunkte und Länge sind die Voreinstellung des Modells, nicht deine Wahl.'],
    'AF': ['Sehr geehrte Frau Keller\n\nVielen Dank für Ihre Anfrage zur Anwohnerparkkarte. Die aktuellen Gebühren und die Möglichkeiten zur Verlängerung finden Sie auf unserer Website; gerne gebe ich Ihnen auch telefonisch Auskunft.\n\nFreundliche Grüsse', 'Höflich, aber leer', 'Ohne Kontext kann das Modell die eigentliche Frage nicht beantworten. Es schreibt elegant um sie herum – so entstehen nichtssagende Antworten.'],
    'MF': ['Sehr geehrte Frau Keller\n\nIhre Nachricht betrifft die Anwohnerparkkarte, die ab 2027 CHF 360 kostet. Falls Sie möchten, formuliere ich daraus eine Antwort an Sie – sagen Sie mir kurz, was ich tun soll.\n\nFreundliche Grüsse', 'Unklar, was verlangt ist', 'Form und Kontext, aber keine Aufgabe. Das Modell bleibt vorsichtig.'],
    'AMF': ['Sehr geehrte Frau Keller\n\nVielen Dank für Ihre Anfrage. Ja, die Anwohnerparkkarte wird teurer: Ab 1. Januar 2027 kostet sie CHF 360 statt bisher CHF 300 pro Jahr. Der Gemeinderat hat dies am 12. Mai 2026 beschlossen.\n\nVerlängern können Sie Ihre Karte bequem online im Bürgerportal oder persönlich am Schalter der Einwohnerdienste, jeweils Montag bis Freitag von 8 bis 12 und 14 bis 17 Uhr.\n\nFreundliche Grüsse', 'Vollständig und in deiner Form', 'Anweisung, Kontext und Form: Das Modell hat alles, was auch eine neue Kollegin bräuchte.']
  };
  var on = [true, true, true];
  root.classList.add('w');
  var blocks = el('div', { class: 'pa-blocks', role: 'group', 'aria-label': 'Bausteine' }, root);
  var btns = BLOCKS.map(function (b, i) {
    var bt = el('button', { type: 'button', class: 'b' + i, 'aria-pressed': 'true' }, blocks);
    el('i', {}, bt); bt.appendChild(document.createTextNode(b.k));
    bt.addEventListener('click', function () { on[i] = !on[i]; bt.setAttribute('aria-pressed', String(on[i])); renderPrompt(); answer.innerHTML = ''; el('span', { class: 'k', text: 'Antwort' }, answer); el('span', { class: 'empty', text: 'Noch nicht gesendet.' }, answer); });
    return bt;
  });
  // dasselbe Eingabefeld, dreimal eingekleidet: vereinfachte Nachbildungen, keine Screenshots
  var UIS = [['chatgpt', 'ChatGPT'], ['copilot', 'Copilot'], ['claude', 'Claude']];
  var uiSeg = el('div', { class: 'seg pa-uis', role: 'group', 'aria-label': 'Programm' }, blocks);
  var wrap = el('div', { class: 'pa-wrap' }, root);
  var left = el('div', {}, wrap);
  var ui = el('div', { class: 'pa-ui' }, left);
  var uiName = el('div', { class: 'pa-ui-name' }, ui);
  var prompt = el('div', { class: 'pa-prompt', 'aria-live': 'polite' }, ui);
  var tools = el('div', { class: 'pa-ui-tools' }, ui);
  el('span', { class: 'pa-ui-plus', text: '+', 'aria-hidden': 'true' }, tools);
  var sendBtn = el('button', { class: 'pa-ui-send', type: 'button', 'aria-label': 'Senden', title: 'Senden' }, tools);
  sendBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var uiBtns = UIS.map(function (u, i) {
    var b = el('button', { type: 'button', text: u[1] }, uiSeg);
    b.addEventListener('click', function () { setUi(i); });
    return b;
  });
  function setUi(i) {
    ui.className = 'pa-ui ui-' + UIS[i][0];
    uiName.textContent = UIS[i][1];
    uiBtns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
  }
  // #copilot oder #claude in der Adresse öffnet direkt diese Ansicht
  setUi(Math.max(0, UIS.map(function (u) { return u[0]; }).indexOf(location.hash.slice(1))));
  var stats = el('div', { class: 'pa-stats' }, left);
  var send = el('div', { class: 'pa-send' }, left);
  el('span', { class: 'pa-hint', text: 'Pfeil drücken zum Senden' }, send);
  var flow = el('div', { class: 'pa-flow' }, send);
  var dots = el('span', { class: 'dots' }, flow); for (var d = 0; d < 4; d++) el('i', {}, dots);
  el('span', { class: 'pa-model', text: 'Modell' }, flow);
  var answer = el('div', { class: 'pa-answer', 'aria-live': 'polite' }, wrap);
  el('span', { class: 'k', text: 'Antwort' }, answer); el('span', { class: 'empty', text: 'Noch nicht gesendet.' }, answer);

  function promptText() { return BLOCKS.filter(function (b, i) { return on[i]; }).map(function (b) { return b.text; }).join(' '); }
  function renderPrompt() {
    prompt.innerHTML = '';
    var any = false;
    BLOCKS.forEach(function (b, i) { if (!on[i]) return; any = true; el('span', { class: 'pseg b' + i, text: b.text }, prompt); prompt.appendChild(document.createTextNode(' ')); });
    if (!any) el('span', { class: 'empty', text: '(leer)' }, prompt);
    var t = promptText();
    var words = (t.match(/\S+/g) || []).length;
    stats.innerHTML = '';
    [[t.length, 'Zeichen'], [words, 'Wörter'], [App.countTokens(t), 'Tokens ≈']].forEach(function (s) { var sp = el('span', {}, stats); el('b', { text: App.fmt(s[0]) }, sp); sp.appendChild(document.createTextNode(s[1])); });
  }
  var busy = false;
  sendBtn.addEventListener('click', function () {
    if (busy) return; busy = true; flow.classList.add('busy');
    answer.innerHTML = ''; el('span', { class: 'k', text: 'Antwort' }, answer);
    var key = (on[0] ? 'A' : '') + (on[1] ? 'M' : '') + (on[2] ? 'F' : '');
    var a = ANSWERS[key];
    setTimeout(function () {
      flow.classList.remove('busy'); busy = false;
      var body = el('span', {}, answer);
      var verdict = el('span', { class: 'verdict' }, answer); el('b', { text: a[1] + '. ' }, verdict); verdict.appendChild(document.createTextNode(a[2]));
      if (ctx.reduced) { body.textContent = a[0]; return; }
      var i = 0, txt = a[0];
      var loop = ctx.raf(function (dt) { i = Math.min(txt.length, i + dt * 0.06); body.textContent = txt.slice(0, Math.floor(i)); if (i >= txt.length) loop.stop(); });
    }, ctx.reduced ? 50 : 700);
  });
  renderPrompt();
});

/* ---- 02-tokenizer.js ---- */
App.widget('tokenizer', function (root, ctx) {
  var el = App.el;
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) % 199000 + 1000; }
  var SAMPLES = [
    { k: 'Bürgeranfrage', de: 'Guten Tag, stimmt es, dass die Parkkarten teurer werden, und wo kann ich meine verlängern?', en: 'Good morning, is it true that parking permits are getting more expensive, and where can I renew mine?' },
    { k: 'Amtsdeutsch', de: 'Das Baubewilligungsverfahren wird nach Eingang der Stellungnahme der Einwohnerkontrolle fortgesetzt.', en: 'The building permit procedure continues once the residents’ registration office has submitted its statement.' },
    { k: 'Zahlen', de: 'Rechnung 2026-004718 über CHF 1’245.60 ist bis am 31.10.2026 zu bezahlen.', en: 'Invoice 2026-004718 for CHF 1,245.60 is payable by 31 October 2026.' }
  ];
  var current = SAMPLES[0];
  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  var input = el('input', { type: 'text', 'aria-label': 'Text', spellcheck: 'false', placeholder: 'Beliebigen Text eingeben…' }, ctl);
  SAMPLES.forEach(function (s) {
    var b = el('button', { class: 'btn secondary', type: 'button', text: s.k }, ctl);
    b.addEventListener('click', function () { current = s; input.value = s.de; render(); });
  });
  var out = el('div', { class: 'tk-out', 'aria-live': 'polite' }, root);
  var ids = el('div', { class: 'tk-ids' }, root);
  var stats = el('div', { class: 'tk-stats' }, root);
  var hint = el('div', { class: 'hint', text: 'Ein Punkt markiert ein Token, das mit einem Leerzeichen beginnt – das Leerzeichen gehört zum Token. Darunter: die Token-IDs, die das Modell tatsächlich erhält (illustrativ).' }, root);
  var cmp = el('div', { class: 'tz-cmp' }, root);
  function stat(parent, n, label) { var s = el('span', {}, parent); el('b', { text: n }, s); s.appendChild(document.createTextNode(label)); }
  function render() {
    var toks = App.tokenize(input.value);
    out.innerHTML = ''; ids.innerHTML = '';
    toks.forEach(function (tk, i) {
      var s = el('span', { class: 'tk c' + (i % 5) + (tk.sp ? ' sp' : ''), text: tk.t }, out);
      s.style.animationDelay = (Math.min(i, 30) * 25) + 'ms';
      el('span', { text: hash((tk.sp ? ' ' : '') + tk.t) }, ids);
    });
    var words = (input.value.trim().match(/\S+/g) || []).length;
    stats.innerHTML = '';
    stat(stats, toks.length, 'Tokens'); stat(stats, words, 'Wörter');
    stat(stats, words ? (toks.length / words).toFixed(2).replace('.', ',') : '–', 'Tokens pro Wort');
    // comparison with the English version of the current sample (only while the sample is unchanged)
    cmp.innerHTML = '';
    var same = input.value.trim() === current.de;
    if (!same) { el('div', { class: 'row', text: 'Wählen Sie ein Beispiel, um den Vergleich mit dem englischen Satz zu sehen.' }, cmp); return; }
    var nDe = toks.length, nEn = App.countTokens(current.en), max = Math.max(nDe, nEn);
    var r1 = el('div', { class: 'row' }, cmp); el('span', { class: 'lang', text: 'Deutsch' }, r1); el('span', { class: 'txt', text: current.de }, r1); el('b', { text: nDe + ' Tokens' }, r1);
    var b1 = el('div', { class: 'tz-bar' }, r1); el('span', { style: 'width:' + (nDe / max * 100) + '%' }, b1);
    var r2 = el('div', { class: 'row' }, cmp); el('span', { class: 'lang', text: 'Englisch' }, r2); el('span', { class: 'txt', text: current.en }, r2); el('b', { text: nEn + ' Tokens' }, r2);
    var b2 = el('div', { class: 'tz-bar en' }, r2); el('span', { style: 'width:' + (nEn / max * 100) + '%' }, b2);
    var r3 = el('div', { class: 'row' }, cmp);
    var factor = nEn ? (nDe / nEn) : 1;
    var m = el('span', { class: 'more' }, r3);
    m.textContent = factor > 1.05 ? 'Derselbe Inhalt braucht auf Deutsch rund ' + factor.toFixed(1).replace('.', ',') + '-mal so viele Tokens.' : 'Hier ist der Unterschied klein – bei längeren Texten wächst er.';
  }
  input.addEventListener('input', render);
  input.value = current.de; render();
});

/* ---- 03-pipeline.js ---- */
App.widget('pipeline', function (root, ctx) {
  var el = App.el, svg = App.svg;
  var PROMPT = 'Fasse das Protokoll der Bauamts-Sitzung vom 3. September in zwei Sätzen zusammen: Traktandum 1 Sanierung Schulhausstrasse (Kredit CHF 480’000 genehmigt), Traktandum 2 neue Öffnungszeiten Schalter (ab Januar Mo–Fr 8–12, Do zusätzlich 14–18 Uhr).';
  var ANSWER = 'Das Bauamt hat am 3. September den Kredit von CHF 480’000 für die Sanierung der Schulhausstrasse genehmigt. Ab Januar gelten am Schalter neue Öffnungszeiten: Montag bis Freitag 8 bis 12 Uhr, donnerstags zusätzlich 14 bis 18 Uhr.';
  var TOKS = App.tokenize(ANSWER);
  var STEPS = [
    { at: 'p', edge: -1, t: 'Dein Prompt kommt an: eine Anweisung plus der Kontext – als Text.' },
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

/* ---- 04-system-prompt.js ---- */
App.widget('system-prompt', function (root, ctx) {
  var el = App.el;
  var RULES = [
    { id: 'de', t: 'Antworte auf Deutsch' },
    { id: 'polite', t: 'Sei höflich und sachlich' },
    { id: 'law', t: 'Keine Rechtsauskünfte – auf die zuständige Stelle verweisen' },
    { id: 'pii', t: 'Gib keine Personendaten weiter' },
    { id: 'short', t: 'Antworte kurz' }
  ];
  var QUESTION = 'Kann ich gegen meine Steuerveranlagung Einsprache erheben, und wie?';
  var on = { de: true, polite: true, law: true, pii: true, short: false };
  function answer() {
    if (!on.de) return ['You can generally file an objection against a tax assessment within 30 days of receiving it. Submit it in writing to the tax office that issued the assessment, stating what you object to and why.', 'Ohne die Regel «Antworte auf Deutsch» folgt das Modell seiner häufigsten Trainingssprache – oder rät die Sprache aus der Frage.'];
    if (on.law && on.short) return ['Ja, gegen eine Steuerveranlagung können Sie in der Regel Einsprache erheben. Für Fristen und das genaue Vorgehen wenden Sie sich bitte an das Steueramt Ihrer Gemeinde.', 'Zwei Regeln greifen: keine Rechtsauskunft (Verweis statt Frist) und kurz (zwei Sätze).'];
    if (on.law && on.polite) return ['Vielen Dank für Ihre Frage. Gegen eine Steuerveranlagung kann grundsätzlich Einsprache erhoben werden. Weil dabei Fristen und Formvorschriften gelten, die ich nicht verbindlich beurteilen kann, empfehle ich Ihnen, sich direkt an das Steueramt Ihrer Gemeinde zu wenden – dort erhalten Sie eine verbindliche Auskunft zu Frist, Form und Adresse. Gerne helfe ich Ihnen beim Formulieren Ihres Schreibens.', 'Die Regel «keine Rechtsauskünfte» macht die Antwort vorsichtig: Sie nennt keine Frist, verweist auf das Steueramt und bietet Hilfe an, die erlaubt ist.'];
    if (on.law) return ['Gegen eine Steuerveranlagung kann Einsprache erhoben werden. Verbindliche Angaben zu Frist und Vorgehen macht das Steueramt Ihrer Gemeinde.', 'Ohne «höflich und sachlich» fällt die Anrede weg; die Verweisregel gilt weiter.'];
    if (on.short) return ['Ja. In der Regel innert 30 Tagen nach Erhalt, schriftlich und mit Begründung an das Steueramt, das die Veranlagung erlassen hat.', 'Ohne die Verweisregel nennt das Modell eine Frist aus seinem Training – plausibel, aber nicht geprüft. Kurz, weil «Antworte kurz» gilt.'];
    if (on.polite) return ['Vielen Dank für Ihre Frage. Ja, gegen eine Steuerveranlagung können Sie Einsprache erheben. In der Regel gilt eine Frist von 30 Tagen ab Zustellung. Die Einsprache ist schriftlich beim Steueramt einzureichen, das die Veranlagung erlassen hat, und sollte begründen, welche Punkte Sie bestreiten. Legen Sie Belege bei. Bitte prüfen Sie die genaue Frist auf Ihrer Veranlagung – sie kann je nach Kanton abweichen.', 'Ohne die Verweisregel antwortet das Modell inhaltlich – mit einer Frist, die stimmen kann, aber vom Modell nicht überprüft wurde. Genau das will eine Verwaltung meist vermeiden.'];
    return ['Ja. Frist meist 30 Tage ab Zustellung, schriftlich, mit Begründung, an das zuständige Steueramt. Details stehen auf der Veranlagung.', 'Ohne Hausordnung: Ton und Inhalt sind reine Voreinstellung des Modells.'];
  }
  root.classList.add('w');
  var sys = el('div', { class: 'sy-layer sys' }, root);
  var k1 = el('div', { class: 'k' }, sys); el('span', { text: 'System-Prompt' }, k1); el('span', { class: 'eye', text: 'unsichtbar · vom Betreiber' }, k1);
  var rules = el('div', { class: 'sy-rules', role: 'group', 'aria-label': 'Regeln' }, sys);
  RULES.forEach(function (r) {
    var b = el('button', { type: 'button', text: r.t, 'aria-pressed': String(on[r.id]) }, rules);
    b.addEventListener('click', function () { on[r.id] = !on[r.id]; b.setAttribute('aria-pressed', String(on[r.id])); pending(); });
  });
  var usr = el('div', { class: 'sy-layer user' }, root);
  var k2 = el('div', { class: 'k' }, usr); el('span', { text: 'Dein Prompt' }, k2); el('span', { class: 'eye', text: 'sichtbar · von dir' }, k2);
  el('div', { class: 'sy-q', text: '«' + QUESTION + '»' }, usr);
  var row = el('div', { class: 'sy-row' }, root);
  var send = el('button', { class: 'btn', type: 'button', text: 'Senden →' }, row);
  el('span', { class: 'hint', text: 'Dieselbe Frage, andere Hausordnung – andere Antwort.' }, row);
  var ans = el('div', { class: 'sy-ans', 'aria-live': 'polite' }, root);
  function pending() { ans.innerHTML = ''; el('span', { class: 'k', text: 'Antwort' }, ans); el('span', { class: 'muted', text: 'Regeln geändert – erneut senden.' }, ans); }
  function run() {
    var a = answer();
    ans.innerHTML = ''; el('span', { class: 'k', text: 'Antwort' }, ans);
    var body = el('span', {}, ans);
    var why = el('span', { class: 'why' }, ans); el('b', { text: 'Warum: ' }, why); why.appendChild(document.createTextNode(a[1]));
    if (ctx.reduced) { body.textContent = a[0]; return; }
    var i = 0, loop = ctx.raf(function (dt) { i = Math.min(a[0].length, i + dt * 0.07); body.textContent = a[0].slice(0, Math.floor(i)); if (i >= a[0].length) loop.stop(); });
  }
  send.addEventListener('click', run);
  pending();
  if (!ctx.reduced) setTimeout(function () { if (ctx.active()) run(); }, 600); else run();
});

/* ---- 05-context-window.js ---- */
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

/* ---- 06-rag.js ---- */
App.widget('rag', function (root, ctx) {
  var el = App.el, svg = App.svg;
  var FLOWS = {
    plain: {
      boxes: [
        { id: 'q', t: 'Deine Frage', sub: '«Kurzzeitvermietung: ab wann Bewilligung?»' },
        { id: 'm', t: 'Modell', sub: 'nur Trainingsdaten', cls: 'model' },
        { id: 'a', t: 'Antwort', sub: 'aus dem Gedächtnis' }
      ],
      edges: [['q', 'm'], ['m', 'a']],
      steps: [
        { at: 'q', txt: 'Die Frage geht direkt ans Modell. Das Wohnbaureglement ist nirgends im Prompt.' },
        { at: 'm', edge: 0, txt: 'Das Modell greift auf das zurück, was in seinen Trainingsdaten über Kurzzeitvermietung stand – irgendwo, irgendwann.' },
        { at: 'a', edge: 1, txt: 'Die Antwort klingt sicher, ist aber ungesichert. Was in Kriens gilt, weiss das Modell nicht.' }
      ],
      answer: { weak: true, tag: 'unsicher', txt: 'Das ist je nach Gemeinde unterschiedlich geregelt. Viele Gemeinden kennen keine besondere Bewilligung, andere setzen eine Obergrenze. Bitte prüfen Sie das Reglement Ihrer Gemeinde.' }
    },
    rag: {
      boxes: [
        { id: 'q', t: 'Deine Frage', sub: '«Kurzzeitvermietung: ab wann Bewilligung?»' },
        { id: 's', t: 'Suche', sub: 'in deinen Dokumenten', cls: 'tool' },
        { id: 'p', t: '3 Textstellen', sub: 'Wohnbaureglement, …' },
        { id: 'm', t: 'Modell', sub: 'Frage + Textstellen', cls: 'model' },
        { id: 'a', t: 'Antwort', sub: 'mit Quelle' }
      ],
      edges: [['q', 's'], ['s', 'p'], ['p', 'm'], ['m', 'a']],
      steps: [
        { at: 'q', txt: 'Die Frage kommt an. Deine Dokumente liegen in einer Sammlung, darunter das Wohnbaureglement der Stadt Kriens.' },
        { at: 's', edge: 0, txt: 'Die Software vergleicht die Frage mit jedem Absatz der Sammlung und sucht die inhaltlich nächsten.' },
        { at: 'p', edge: 1, txt: 'Die drei passendsten Textstellen werden geholt – unter anderem Art. 10 des Wohnbaureglements.' },
        { at: 'm', edge: 2, txt: 'Das Modell liest Frage und Textstellen zusammen und schreibt daraus die Antwort.' },
        { at: 'a', edge: 3, txt: 'Die Antwort nennt die Quelle, damit du sie prüfen kannst. Das Modell hat nichts gelernt; es hat gelesen.' }
      ],
      answer: { weak: false, tag: 'mit Quelle', txt: 'Wer Räumlichkeiten für mehr als 90 Nächte pro Kalenderjahr kurzzeitig vermietet oder dafür anbietet, braucht eine Bewilligung (Art. 10 Abs. 1 Wohnbaureglement der Stadt Kriens).' }
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

/* ---- 07-context-rot.js ---- */
App.widget('context-rot', function (root, ctx) {
  var el = App.el;
  var RULE = 'Regel für dieses Gespräch: Immer Sie-Form, keine Aufzählungen, Schweizer Rechtschreibung.';
  var ANS = {
    good: ['Sehr geehrte Frau Meier\n\nVielen Dank für Ihre Nachricht. Die Gebühr für den Heimatausweis beträgt CHF 20. Sie können ihn am Schalter der Einwohnerdienste beziehen oder online bestellen; die Zustellung dauert rund drei Arbeitstage.\n\nFreundliche Grüsse', 'Regel eingehalten', 'Sie-Form, Fliesstext, Schweizer Rechtschreibung.'],
    mid: ['Sehr geehrte Frau Meier\n\nDanke für die Nachricht. Kurz zusammengefasst:\n<mark>•</mark> Heimatausweis: CHF 20\n<mark>•</mark> Bezug am Schalter oder online\n<mark>•</mark> Zustellung in rund drei Arbeitstagen\n\nFreundliche Grüsse', 'Erste Verletzung', 'Die Aufzählung ist zurück – die Voreinstellung des Modells gewinnt gegen die verblasste Regel.'],
    bad: ['Hallo Frau Meier\n\nDanke für <mark>deine</mark> Nachricht! Hier die Infos:\n<mark>•</mark> Heimatausweis: CHF 20\n<mark>•</mark> Am Schalter oder online\n<mark>•</mark> Dauert ca. 3 Tage\n\nLiebe Gr<mark>ü</mark>sse – melde dich, wenn du noch Fragen hast!', 'Regel vergessen', 'Du-Form, Aufzählung, lockerer Ton. Das Modell liest die Regel noch, aber sie geht unter.']
  };
  var state = { n: 0, repeated: false };
  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  var add = el('button', { class: 'btn', type: 'button', text: '+ 10 Nachrichten' }, ctl);
  var rep = el('button', { class: 'btn secondary', type: 'button', text: 'Regel wiederholen' }, ctl);
  var reset = el('button', { class: 'btn secondary', type: 'button', text: 'Neues Gespräch' }, ctl);
  var wrap = el('div', { class: 'cr-wrap' }, root);
  var left = el('div', {}, wrap);
  var conv = el('div', { class: 'cr-conv', 'aria-label': 'Gesprächsverlauf' }, left);
  var rule = el('div', { class: 'cr-rule' }, conv); el('span', { class: 'who', text: 'Du · Nachricht 1' }, rule); rule.appendChild(document.createTextNode(RULE));
  var stack = el('div', { class: 'cr-stack' }, conv);
  var rule2 = el('div', { class: 'cr-rule repeat', hidden: '' }, conv); el('span', { class: 'who', text: 'Du · zuletzt' }, rule2); rule2.appendChild(document.createTextNode(RULE));
  var count = el('div', { class: 'cr-count' }, left);
  var att = el('div', { class: 'cr-att' }, left);
  var attK = el('div', { class: 'k' }, att); attK.appendChild(document.createTextNode('Gewicht der Regel')); var attV = el('b', {}, attK);
  var bar = el('div', { class: 'bar' }, att); var barS = el('span', {}, bar);
  var ans = el('div', { class: 'cr-ans', 'aria-live': 'polite' }, wrap);
  function weight() { if (state.repeated) return 0.95; return Math.max(0.08, 1 - state.n / 70); }
  function render() {
    stack.innerHTML = '';
    var shown = Math.min(state.n, 40);
    for (var i = 0; i < shown; i++) el('i', {}, stack);
    rule2.hidden = !state.repeated;
    var w = weight();
    rule.style.opacity = String(0.35 + 0.65 * w);
    barS.style.width = Math.round(w * 100) + '%'; barS.classList.toggle('low', w < 0.4);
    attV.textContent = Math.round(w * 100) + ' %';
    var tokens = 60 + state.n * 180 + (state.repeated ? 30 : 0);
    count.innerHTML = '';
    var c1 = el('span', {}, count); el('b', { text: App.fmt(state.n + 1 + (state.repeated ? 1 : 0)) }, c1); c1.appendChild(document.createTextNode(' Nachrichten'));
    var c2 = el('span', {}, count); el('b', { text: '≈ ' + App.fmt(tokens) }, c2); c2.appendChild(document.createTextNode(' Tokens im Kontext'));
    var a = w > 0.6 ? ANS.good : (w > 0.3 ? ANS.mid : ANS.bad);
    ans.innerHTML = ''; el('span', { class: 'k', text: 'Antwort des Modells auf die nächste Anfrage' }, ans);
    el('span', { html: a[0] }, ans);
    var v = el('div', { class: 'cr-verdict' }, ans); el('b', { class: a === ANS.good ? '' : 'bad', text: a[1] + '. ' }, v); v.appendChild(document.createTextNode(a[2]));
  }
  add.addEventListener('click', function () { state.n = Math.min(90, state.n + 10); state.repeated = false; render(); });
  rep.addEventListener('click', function () { state.repeated = true; render(); });
  reset.addEventListener('click', function () { state.n = 0; state.repeated = false; render(); });
  render();
  if (!ctx.reduced) {
    var k = 0, iv = setInterval(function () { if (!ctx.active()) return; if (k >= 5) { clearInterval(iv); return; } k++; state.n = k * 10; state.repeated = false; render(); }, 1400);
    root.addEventListener('click', function () { clearInterval(iv); }, { once: true });
  }
});

/* ---- 08-static-model.js ---- */
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

/* ---- 09-techniques.js ---- */
App.widget('techniques', function (root, ctx) {
  var el = App.el;
  var MAT = 'Anfrage: «Guten Tag, seit Wochen steht bei uns ein Bauzaun auf dem Trottoir, ohne Hinweis. Wer ist dafür zuständig? R. Huber»';
  var TASK = 'Ordne die folgende Anfrage einem Amt zu: Steuern, Bau, Einwohner, Soziales oder Sonstiges.';
  var T = [
    { n: 'Zero-Shot', lines: [[TASK], [MAT, 'mat']], out: 'Bau', when: 'Für Standardaufgaben, die das Modell gut kennt. Schnell – aber deine Kategorien und Grenzfälle kennt es nicht.' },
    { n: 'One-Shot', lines: [[TASK], ['Beispiel: «Mein Nachbar baut ohne Bewilligung.» → Bau', 'add'], [MAT, 'mat']], out: 'Bau', when: 'Ein Beispiel zeigt das gewünschte Format – hier: nur der Amtsname, keine Erklärung.' },
    { n: 'Few-Shot', lines: [[TASK], ['Beispiel: «Mein Nachbar baut ohne Bewilligung.» → Bau', 'add'], ['Beispiel: «Ich ziehe nach Bern, was muss ich melden?» → Einwohner', 'add'], ['Beispiel: «Die Strassenlampe vor dem Haus ist defekt.» → Sonstiges (Werkhof)', 'add'], ['Beispiel: «Kann ich die Steuern in Raten zahlen?» → Steuern', 'add'], [MAT, 'mat']], out: 'Sonstiges (Werkhof) – Bauzaun auf öffentlichem Grund betrifft den Unterhalt der Strasse, nicht das Baugesuch.', when: 'Mehrere, bewusst unterschiedliche Beispiele zeigen auch Grenzfälle. Das Modell lernt deine Einteilung, nicht irgendeine.' },
    { n: 'Schritt für Schritt', lines: [[TASK], ['Überlege zuerst Schritt für Schritt, welche Ämter in Frage kommen und warum. Gib erst am Schluss die Zuordnung an.', 'add'], [MAT, 'mat']], out: '1. Es geht um einen Bauzaun – das deutet auf Bau.\n2. Der Zaun steht aber auf dem Trottoir, also auf öffentlichem Grund; die Frage ist, wer den Unterhalt und die Nutzung des Trottoirs regelt.\n3. Das ist in den meisten Gemeinden der Werkhof oder die Abteilung Tiefbau, nicht das Bauamt (Baugesuche).\nZuordnung: Sonstiges (Werkhof/Tiefbau).', when: 'Bei Aufgaben mit mehreren Schritten oder Abwägungen. Langsamer, aber deutlich weniger Fehler.' },
    { n: 'Kontext & Rolle', lines: [['Du bist Mitarbeiterin der Kanzlei einer Gemeinde mit 8’000 Einwohnern. Die Ämter sind: Steueramt, Bauverwaltung (Baugesuche), Einwohnerdienste, Sozialdienst und Werkhof (Strassen, Unterhalt, öffentlicher Grund).', 'add'], [TASK], [MAT, 'mat']], out: 'Werkhof – der Zaun steht auf öffentlichem Grund, das fällt in den Unterhalt, nicht in die Bauverwaltung.', when: 'Beschreib die Situation, nicht nur die Rolle. Der Satz «die Ämter sind …» leistet die eigentliche Arbeit.' }
  ];
  var state = { i: 0 };
  root.classList.add('w');
  var tabs = el('div', { class: 'te-tabs', role: 'group', 'aria-label': 'Technik' }, root);
  var wrap = el('div', { class: 'te-wrap' }, root);
  var prompt = el('div', { class: 'te-prompt', 'aria-live': 'polite' }, wrap);
  var right = el('div', {}, wrap);
  var out = el('div', { class: 'te-out', 'aria-live': 'polite' }, right);
  var when = el('div', { class: 'te-when' }, right);
  var btns = T.map(function (t, i) {
    var b = el('button', { type: 'button', text: t.n, 'aria-pressed': String(i === 0) }, tabs);
    b.addEventListener('click', function () { set(i); });
    return b;
  });
  function set(i) {
    state.i = i; btns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
    var t = T[i];
    prompt.innerHTML = ''; el('span', { class: 'k', text: 'Prompt' }, prompt);
    t.lines.forEach(function (l) { el('span', { class: 'ln' + (l[1] ? ' ' + l[1] : ''), text: l[0] }, prompt); });
    out.innerHTML = ''; el('span', { class: 'k', text: 'Ausgabe' }, out); out.appendChild(document.createTextNode(t.out));
    when.innerHTML = ''; el('b', { text: 'Wann sinnvoll' }, when); when.appendChild(document.createTextNode(t.when));
  }
  set(0);
  if (!ctx.reduced) {
    var k = 0, iv = setInterval(function () { if (!ctx.active()) return; k++; if (k >= T.length) { clearInterval(iv); return; } set(k); }, 3200);
    root.addEventListener('click', function () { clearInterval(iv); }, { once: true });
  }
});

/* ---- 10-prompt-builder.js ---- */
App.widget('prompt-builder', function (root, ctx) {
  var el = App.el;
  var VAGUE = 'Schreib mir ein Konzept für ein Infoblatt.';
  var SEGS = [
    ['Wir sind die Kommunikationsstelle der Gemeinde, drei Personen; wir geben viermal im Jahr das Infoblatt für alle Haushalte heraus.', 'Situation', 'Wer schreibt, für wen, wozu. Daraus ergibt sich die Rolle von selbst.'],
    ['Angehängt: die letzte Ausgabe und die Rückmeldungen aus der Bevölkerungsumfrage.', 'Unterlagen', 'Das Modell sieht deine Unterlagen nur, wenn du sie mitgibst.'],
    ['Entwirf eine Gliederung für ein neues Infoblatt mit maximal 8 Seiten, das die drei Hauptkritikpunkte behebt.', 'Aufgabe', 'Eine klare Aufgabe mit Umfang. «Ein Konzept» ist keine Aufgabe.'],
    ['Als nummerierte Gliederung mit je einem Satz Begründung.', 'Form', 'Sag, wie die Antwort aussehen soll – sonst kommt der Standard.'],
    ['Schweizer Rechtschreibung, keine englischen Fachbegriffe.', 'Regeln', 'Kleine Regeln ersparen eine Korrekturrunde.'],
    ['Wenn dir etwas fehlt, frag zuerst.', 'Einladung', 'Erlaubt dem Modell, Lücken zu klären, statt zu raten.']
  ];
  var state = { on: -1 };
  root.classList.add('w');
  var wrap = el('div', { class: 'pr-wrap' }, root);
  var v = el('div', { class: 'pr-box vague' }, wrap), b = el('div', { class: 'pr-box' }, wrap);
  var exp = el('div', { class: 'pr-exp' }, root);
  var segEls = [], expEls = [];
  function set(i) { state.on = i; segEls.forEach(function (s, k) { s.classList.toggle('on', k === i); }); expEls.forEach(function (s, k) { s.classList.toggle('on', k === i); }); }
  el('span', { class: 'k', text: 'Vage' }, v); v.appendChild(document.createTextNode('«' + VAGUE + '»'));
  el('span', { class: 'k', text: 'Konkret' }, b);
  SEGS.forEach(function (s, i) {
    var sp = el('span', { class: 'pr-seg p' + i, text: s[0], tabindex: 0 }, b); b.appendChild(document.createTextNode(' '));
    var e = el('div', { class: 'p' + i }, exp); el('b', { text: s[1] }, e); e.appendChild(document.createTextNode(s[2]));
    [sp, e].forEach(function (x) { x.addEventListener('mouseenter', function () { set(i); }); x.addEventListener('focus', function () { set(i); }); x.addEventListener('click', function () { set(i); }); });
    segEls.push(sp); expEls.push(e);
  });
  set(-1);

  // second part: role vs. context
  var role = el('div', { class: 'pb-role' }, root);
  var ctl = el('div', { class: 'ctl' }, role);
  el('span', { text: 'Was weiss das Modell nach diesem Satz?' }, ctl);
  var seg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Rolle oder Kontext' }, ctl);
  var bRole = el('button', { type: 'button', 'aria-pressed': 'true', text: 'Rolle' }, seg);
  var bCtx = el('button', { type: 'button', 'aria-pressed': 'false', text: 'Kontext' }, seg);
  var cmp = el('div', { class: 'pb-cmp', 'aria-live': 'polite' }, role);
  var verdict = el('div', { class: 'pb-verdict' }, role);
  var FACTS = ['Wer liest (alle Haushalte)', 'Wozu (Infoblatt, viermal im Jahr)', 'Wer schreibt (Team, 3 Personen)', 'Tonlage (verständlich, ohne Fachbegriffe)', 'Was schiefging (Kritik aus der Umfrage)'];
  var MODES = {
    role: { k: 'Rolle', q: 'Stell dir vor, du bist eine Kommunikationsverantwortliche.', yes: [3], cls: 'role', v: '<b>1 von 5.</b> Die Rolle verschiebt den Ton – mehr nicht. Alles andere muss das Modell raten.' },
    ctx: { k: 'Kontext', q: SEGS[0][0] + ' ' + SEGS[1][0], yes: [0, 1, 2, 3, 4], cls: 'ctx', v: '<b>5 von 5.</b> Der Kontext enthält die Rolle – und dazu alles, was die Rolle offenlässt.' }
  };
  function show(m) {
    var d = MODES[m];
    bRole.setAttribute('aria-pressed', String(m === 'role')); bCtx.setAttribute('aria-pressed', String(m === 'ctx'));
    cmp.innerHTML = '';
    var c = el('div', { class: 'pb-card ' + d.cls }, cmp);
    el('span', { class: 'k', text: d.k }, c); el('q', { text: '«' + d.q + '»' }, c);
    var c2 = el('div', { class: 'pb-card' }, cmp);
    el('span', { class: 'k', text: 'Das Modell weiss jetzt' }, c2);
    var ul = el('ul', {}, c2);
    FACTS.forEach(function (f, i) { el('li', { class: d.yes.indexOf(i) >= 0 ? 'yes' : 'no', text: f }, ul); });
    verdict.innerHTML = d.v;
  }
  bRole.addEventListener('click', function () { show('role'); });
  bCtx.addEventListener('click', function () { show('ctx'); });
  show('role');

  // walk through the parts once
  if (!ctx.reduced) {
    var k = 0, iv = setInterval(function () {
      if (!ctx.active()) return;
      if (k >= SEGS.length) { clearInterval(iv); show('ctx'); return; }
      set(k++);
    }, 1500);
    root.addEventListener('mouseenter', function () { clearInterval(iv); }, { once: true });
  }
});

/* ---- 11-ask-back.js ---- */
App.widget('ask-back', function (root, ctx) {
  var el = App.el;
  var GUESSES = ['Zielgruppe und Sprachen', 'Umfang und Format', 'Pflichtthemen', 'Vorlage und Erscheinungsbild'];
  var STEPS = [
    { who: 'Du', cls: 'user', text: 'Ich brauche ein Merkblatt für Neuzuzüger. Bevor du schreibst: Stell mir die Fragen, die dir helfen, das richtig gut zu machen.' },
    { who: 'Modell', cls: 'bot', text: 'Gerne. Vier Fragen, damit der Entwurf passt:', list: [
      'Für wen ist das Merkblatt – Familien, Einzelpersonen, auch Zuziehende aus dem Ausland? In welchen Sprachen?',
      'Wie umfangreich soll es sein, und ist es für Print, Web oder beides?',
      'Welche Themen sind zwingend: Anmeldung bei den Einwohnerdiensten, Abfallentsorgung, Schule, Steuern – oder weitere?',
      'Gibt es eine Vorlage oder ein Erscheinungsbild der Gemeinde, an das ich mich halten soll?'
    ] },
    { who: 'Du', cls: 'user', text: '1: Alle Neuzuzüger, Deutsch und Englisch. 2: Eine A4-Seite, Print und PDF. 3: Anmeldung innert 14 Tagen, Abfall, Schule, Steuern, plus ÖV-Anschluss. 4: Ja, Vorlage hänge ich an. Jetzt schreib.', done: 4 },
    { who: 'Modell', cls: 'bot draft', text: 'Danke – hier der Entwurf:\n\nWillkommen in unserer Gemeinde\nAnmeldung: innert 14 Tagen bei den Einwohnerdiensten, mit Ausweis und Mietvertrag.\nAbfall: Gebührensack, Sammelstelle Werkhof, Abfuhrkalender online.\nSchule: Anmeldung über das Schulsekretariat; Kindergarten ab 4 Jahren.\nSteuern: Sie werden ab Zuzugsdatum in der Gemeinde besteuert.\nÖV: Bus 12 und 14 zum Bahnhof, Halbstundentakt.' }
  ];
  var i = 0, timer = null;
  root.classList.add('w');
  var wrap = el('div', { class: 'ab-wrap' }, root);
  var chat = el('div', { class: 'chat ab-chat', 'aria-live': 'polite' }, wrap);
  var side = el('div', { class: 'ab-side' }, wrap);
  el('span', { class: 'k', text: 'Vermutungen, die das Modell nicht raten musste' }, side);
  var count = el('b', { text: '0' }, side);
  var ul = el('ul', {}, side);
  var items = GUESSES.map(function (g) { return el('li', { text: g }, ul); });
  var ctl = el('div', { class: 'ab-ctl' }, root);
  var next = el('button', { class: 'btn', type: 'button', text: 'Weiter' }, ctl);
  var reset = el('button', { class: 'btn secondary', type: 'button', text: 'Von vorn' }, ctl);
  var step = el('span', { class: 'ab-step' }, ctl);
  function render() {
    step.textContent = i + ' / ' + STEPS.length;
    next.disabled = i >= STEPS.length;
  }
  function add() {
    if (i >= STEPS.length) return;
    var s = STEPS[i];
    var m = el('div', { class: 'msg ' + s.cls }, chat);
    el('span', { class: 'who', text: s.who }, m);
    m.appendChild(document.createTextNode(s.text));
    if (s.list) { var ol = el('ol', {}, m); s.list.forEach(function (q) { el('li', { text: q }, ol); }); }
    if (s.done) { items.forEach(function (li, k) { if (k < s.done) li.classList.add('ok'); }); count.textContent = String(s.done); }
    i++; render();
  }
  function restart() { clearTimeout(timer); chat.innerHTML = ''; items.forEach(function (li) { li.classList.remove('ok'); }); count.textContent = '0'; i = 0; render(); add(); }
  next.addEventListener('click', function () { clearTimeout(timer); add(); });
  reset.addEventListener('click', function () { restart(); if (!ctx.reduced) play(); });
  function play() {
    clearTimeout(timer);
    timer = setTimeout(function () { if (!ctx.active()) { play(); return; } add(); if (i < STEPS.length) play(); }, 2600);
  }
  restart();
  if (!ctx.reduced) { play(); root.addEventListener('mouseenter', function () { clearTimeout(timer); }, { once: true }); }
});

/* ---- 12-briefing.js ---- */
App.widget('briefing', function (root, ctx) {
  var el = App.el;
  var STEPS = [
    { t: 'Gespräch mit dem Team', build: function (p) {
      el('span', { class: 'k', text: '1 · Das imaginäre Team im Raum' }, p);
      var pp = el('div', { class: 'people' }, p);
      ['Juristin', 'Kommunikation', 'IT', 'Sachbearbeitung', 'Datenschutzberater'].forEach(function (n) { el('span', { text: n }, pp); });
      el('p', { class: 'spoken', text: '«Also, stellt euch vor, wir machen ein neues Online-Formular für Parkkarten, ähm, die Leute sollen das am Handy ausfüllen können, und die Juristin, du sagst mir dann, was wir wegen Unterschrift brauchen … und IT, das muss ins Bürgerportal, nicht schon wieder eine Insel …»' }, p);
    } },
    { t: 'Aufnahme & Transkript', build: function (p) {
      el('span', { class: 'k', text: '2 · Diktierfunktion oder Transkriptionstool' }, p);
      el('div', { class: 'raw', html: 'also <span class="um">ähm</span> stellt euch vor wir machen ein neues online formular für parkkarten <span class="um">ähm</span> die leute sollen das am handy ausfüllen können am handy und die juristin du sagst mir dann was wir wegen unterschrift brauchen ob das <span class="um">äh</span> ohne geht und IT das muss ins bürgerportal nicht schon wieder eine insel und kommunikation <span class="um">ähm</span> wir brauchen einen text für die website und die frau meier hat letztes jahr das gleiche probiert und das ist am reglement gescheitert artikel 7 glaub ich' }, p);
      el('p', { class: 'hint', text: 'Unordentlich, aber vollständig. Genau so soll es sein.' }, p);
    } },
    { t: 'Modell strukturiert', build: function (p) {
      el('span', { class: 'k', text: '3 · Ein Prompt über dem Transkript' }, p);
      el('div', { class: 'prompt', text: '«Hier ist das Transkript eines Gesprächs. Erstelle daraus ein Briefing mit Ziel, Zielgruppe, Anforderungen je Fachbereich und offenen Fragen.» + Transkript' }, p);
      el('p', { class: 'hint', text: 'Ordnen, gliedern, Lücken benennen – das können Sprachmodelle gut.' }, p);
    } },
    { t: 'Briefing', build: function (p) {
      el('span', { class: 'k', text: '4 · Das Briefing' }, p);
      var d = el('div', { class: 'doc' }, p);
      el('h4', { text: 'Ziel' }, d); el('p', { text: 'Online-Formular für Anwohnerparkkarten, am Smartphone ausfüllbar, integriert ins Bürgerportal.' }, d);
      el('h4', { text: 'Zielgruppe' }, d); el('p', { text: 'Einwohnerinnen und Einwohner mit Anspruch auf Parkkarte.' }, d);
      el('h4', { text: 'Anforderungen je Fachbereich' }, d);
      var ul = el('ul', {}, d);
      ['Recht: Klären, ob eine Unterschrift nötig ist (Reglement Art. 7).', 'IT: Anbindung ans Bürgerportal, keine Insellösung.', 'Kommunikation: Text für die Website.', 'Datenschutz: noch nicht besprochen.'].forEach(function (x) { el('li', { text: x }, ul); });
      el('h4', { text: 'Offene Fragen' }, d);
      el('p', { class: 'open', text: 'Was genau scheiterte letztes Jahr? Frist? Budget? Wer entscheidet?' }, d);
    } },
    { t: 'Auftrag', build: function (p) {
      el('span', { class: 'k', text: '5 · Briefing + Unterlagen = der Prompt' }, p);
      var o = el('div', { class: 'out' }, p);
      el('span', { class: 'chip', text: 'Briefing' }, o); el('span', { text: '+' }, o);
      el('span', { class: 'chip', text: 'Altes Formular' }, o); el('span', { text: '+' }, o);
      el('span', { class: 'chip', text: 'Reglement' }, o); el('span', { class: 'arrow', text: '→' }, o);
      el('span', { class: 'chip', text: 'Chat-Assistent · Projekttool · Agentur' }, o);
      el('p', { text: 'Dasselbe Briefing funktioniert in jedem Werkzeug – und für Menschen.' }, p);
      el('p', { class: 'warn', text: 'Nur mit einem Werkzeug, das deine Organisation freigegeben hat.' }, p);
    } }
  ];
  var i = 0, timer = null;
  root.classList.add('w');
  var steps = el('div', { class: 'br-steps', role: 'group', 'aria-label': 'Schritte' }, root);
  var btns = STEPS.map(function (s, k) {
    var b = el('button', { type: 'button', 'aria-pressed': 'false' }, steps);
    el('b', { text: String(k + 1) }, b); b.appendChild(document.createTextNode(s.t));
    b.addEventListener('click', function () { stop(); show(k); });
    return b;
  });
  var track = el('div', { class: 'br-track', 'aria-hidden': 'true' }, root);
  var bars = STEPS.slice(1).map(function () { return el('i', {}, track); });
  var panel = el('div', { class: 'br-panel', 'aria-live': 'polite' }, root);
  var ctl = el('div', { class: 'br-ctl' }, root);
  var play = el('button', { class: 'btn', type: 'button', text: 'Abspielen' }, ctl);
  var next = el('button', { class: 'btn secondary', type: 'button', text: 'Nächster Schritt' }, ctl);
  function show(k) {
    i = k;
    btns.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === k)); });
    bars.forEach(function (b, j) { b.classList.toggle('done', j < k); });
    panel.innerHTML = ''; STEPS[k].build(panel);
  }
  var playing = false;
  function stop() { playing = false; clearTimeout(timer); play.textContent = 'Abspielen'; }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (!playing) return;
      if (!ctx.active()) { schedule(); return; }
      if (i + 1 >= STEPS.length) { stop(); return; }
      show(i + 1); schedule();
    }, 3200);
  }
  play.addEventListener('click', function () {
    if (playing) { stop(); return; }
    playing = true; play.textContent = 'Pause';
    if (i + 1 >= STEPS.length) show(0);
    schedule();
  });
  next.addEventListener('click', function () { stop(); show((i + 1) % STEPS.length); });
  show(0);
  if (!ctx.reduced) { playing = true; play.textContent = 'Pause'; schedule(); }
});

/* ---- 13-dos-donts.js ---- */
App.widget('dos-donts', function (root, ctx) {
  var el = App.el;
  var CARDS = [
    ['do', 'Kontext geben', 'Wer du bist, für wen der Text ist, was vorher geschah. Das Modell weiss nur, was im Gespräch steht.', '«Wir sind der Sozialdienst der Gemeinde. Die Antwort geht an eine Klientin, die zum ersten Mal Unterstützung beantragt.»'],
    ['do', 'Form festlegen', 'Länge, Ton, Aufbau, Sprache. Ohne Vorgabe bekommst du den Standard des Modells.', '«Maximal 150 Wörter, Sie-Form, einfache Sprache, keine Aufzählung, Schweizer Rechtschreibung.»'],
    ['do', 'Beispiel zeigen', 'Ein Muster des gewünschten Stils sagt mehr als ein Absatz Beschreibung.', '«Hier ein Brief, wie wir ihn üblicherweise schreiben. Verfasse den neuen im gleichen Ton.»'],
    ['do', 'Rückfragen verlangen', 'Bei allem, was grösser ist als eine E-Mail: erst fragen lassen, dann schreiben lassen.', '«Bevor du die Stellenausschreibung schreibst: Stell mir die Fragen, die dir fehlen.»'],
    ['do', 'In Runden arbeiten', 'Die erste Antwort ist ein Entwurf. Die zweite Nachricht – «kürzer, sachlicher» – bringt oft den guten Text.', '«Gut. Jetzt den zweiten Absatz streichen und den Schluss verbindlicher formulieren.»'],
    ['do', 'Ein Thema pro Gespräch', 'Lange Gespräche mit vielen Themen verwässern den Kontext. Neues Thema, neues Fenster.', 'Das Protokoll in einem Chat, die Medienmitteilung in einem zweiten – nicht beides in einem.'],
    ['do', 'Prüfen: Zahlen, Namen, Paragrafen', 'Jede Angabe gegen die Quelle prüfen. Das Modell schreibt flüssig, auch wenn es falsch liegt.', 'Das Modell nennt «Art. 12 Abs. 3». Du öffnest das Reglement und liest nach – vor dem Versand.'],
    ['dont', 'Nicht: Zauberformeln suchen', 'Es gibt keine geheimen Wörter, die bessere Antworten erzwingen. Es gibt nur klar oder unklar gesagt, was du willst.', '«Du bist der beste Experte der Welt» bringt nichts. «Für den Gemeinderat, 1 Seite, drei Optionen mit Kosten» bringt alles.'],
    ['dont', 'Nicht: Vertrauliches in öffentliche Tools', 'Öffentliche Gratis-Werkzeuge sind wie eine E-Mail an Unbekannte. Personendaten und Internes nur in freigegebene Werkzeuge.', 'Ein Steuerdossier gehört in kein öffentliches Chat-Fenster – auch nicht «anonymisiert».'],
    ['dont', 'Nicht: Ungeprüft weiterleiten', 'Was das Modell schreibt, trägt am Ende deinen Namen. Nichts verlässt das Haus, was du nicht gelesen hast.', 'Die Antwort an die Bürgerin wird gelesen, geprüft, angepasst – dann erst gesendet.']
  ];
  root.classList.add('w');
  var grid = el('div', { class: 'dd-grid' }, root);
  var cards = CARDS.map(function (c, i) {
    var b = el('button', { type: 'button', class: 'dd ' + c[0], 'aria-expanded': 'false' }, grid);
    el('span', { class: 'tag', text: c[0] === 'do' ? 'Do' : 'Don’t' }, b);
    el('span', { class: 'h', text: c[1] }, b);
    el('span', { class: 'b', text: c[2] }, b);
    var ex = el('span', { class: 'ex' }, b); el('b', { text: 'Beispiel' }, ex); ex.appendChild(document.createTextNode(c[3]));
    b.addEventListener('click', function () { toggle(i); });
    return b;
  });
  var open = -1;
  function toggle(i) {
    open = open === i ? -1 : i;
    cards.forEach(function (c, k) { c.setAttribute('aria-expanded', String(k === open)); });
  }
  if (!ctx.reduced) {
    var k = 0, iv = setInterval(function () {
      if (!ctx.active()) return;
      if (k >= 3) { clearInterval(iv); return; }
      open = -1; toggle(k++);
    }, 2200);
    root.addEventListener('mouseenter', function () { clearInterval(iv); }, { once: true });
    root.addEventListener('focusin', function () { clearInterval(iv); }, { once: true });
  }
});

/* ---- 14-sensitivity.js ---- */
App.widget('sensitivity', function (root, ctx) {
  var el = App.el;
  var LEVELS = [
    { n: 'Unbedenklich', c: 'var(--ok)' }, { n: 'Harmlos', c: 'var(--ok)' }, { n: 'Persönlich', c: 'var(--s4)' },
    { n: 'Heikel', c: 'var(--warm)' }, { n: 'Sehr heikel', c: '#c0242a' }, { n: 'Tabu', c: '#c0242a' }
  ];
  var SETS = {
    privat: [
      { p: '«Welches E-Bike eignet sich für 15 km Arbeitsweg?»', l: 0, know: 'Du pendelst rund 15 km und überlegst eine Anschaffung. Mehr nicht.', where: ['Gespeichert beim Anbieter', 'Kann für Personalisierung und Werbung genutzt werden'] },
      { p: '«Formuliere eine Bewerbung für eine Stelle als Sachbearbeiterin.»', l: 1, know: 'Deinen Beruf, deine Qualifikationen – und dass du dich beruflich verändern willst.', where: ['Gespeichert beim Anbieter', 'Mitlesen zur Qualitätsprüfung möglich', 'Training künftiger Modelle, falls nicht abgeschaltet'] },
      { p: '«Wie kündige ich meinen Job höflich?»', l: 2, know: 'Dass du mit deiner aktuellen Stelle unzufrieden bist – bevor dein Arbeitgeber es weiss.', where: ['Gespeichert beim Anbieter', 'Teil deines Nutzerprofils', 'Training, falls nicht abgeschaltet'] },
      { p: '«Mein Mietvertrag: Darf der Vermieter …» (Vertrag eingefügt)', l: 3, know: 'Name, Adresse, Miete, Vermieter, Vertragsdetails – deine und die einer weiteren Person.', where: ['Gespeichert beim Anbieter', 'Mitlesen möglich', 'Training möglich', 'Längere Aufbewahrung, z. B. wegen Gerichtsverfahren'] },
      { p: '«Ich habe die Diagnose Multiple Sklerose erhalten – was bedeutet das?»', l: 4, know: 'Eine Gesundheitsinformation, die nach Datenschutzrecht besonders geschützt ist. Sie bleibt mit deinem Konto verknüpft.', where: ['Gespeichert beim Anbieter', 'Mitlesen möglich', 'Training möglich', 'Längere Aufbewahrung möglich'] },
      { p: '«Hier ist der Arztbericht meiner Tochter …» (Bericht eingefügt)', l: 5, know: 'Gesundheitsdaten einer dritten Person, die nicht zugestimmt hat.', where: ['Alles wie oben – nur betrifft es jemand anderen'] }
    ],
    arbeit: [
      { p: '«Formuliere einen Text zu den neuen Öffnungszeiten der Einwohnerdienste.»', l: 0, know: 'Dass du in einer Verwaltung arbeitest. Die Information ist ohnehin öffentlich.', where: ['Gespeichert beim Anbieter'] },
      { p: '«Entwurf einer Stellenausschreibung für die Sachbearbeitung Steuern.»', l: 1, know: 'Abteilung, Aufgaben, Lohnband – meist wird es ohnehin publiziert.', where: ['Gespeichert beim Anbieter', 'Mitlesen zur Qualitätsprüfung möglich'] },
      { p: '«Fasse dieses interne Sitzungsprotokoll zusammen.» (Protokoll eingefügt)', l: 2, know: 'Interne Entscheide, Namen von Mitarbeitenden, laufende Projekte – nicht für die Öffentlichkeit bestimmt.', where: ['Gespeichert beim Anbieter', 'Mitlesen möglich', 'Training möglich'] },
      { p: '«Schreibe eine Mahnung an Frau X, Rechnung 4711, CHF 2’340.»', l: 3, know: 'Name, Schuldnerin, Betrag: Personendaten einer Bürgerin, die dem Amtsgeheimnis unterstehen.', where: ['Gespeichert beim Anbieter', 'Mitlesen möglich', 'Training möglich', 'Längere Aufbewahrung möglich'] },
      { p: '«Beurteile diesen Sozialhilfe-Fall: …» (Dossier eingefügt)', l: 4, know: 'Besonders schützenswerte Daten: finanzielle Lage, Familie, oft Gesundheit. Einer Person, die sich nicht wehren kann.', where: ['Alles wie oben', 'Verletzung des Amtsgeheimnisses möglich'] },
      { p: '«Fasse das Personaldossier von Herrn Y zusammen.»', l: 5, know: 'Beurteilungen, Lohn, Absenzen, allenfalls Krankheit eines Mitarbeitenden.', where: ['Alles wie oben', 'Verletzung des Amtsgeheimnisses möglich'] }
    ]
  };
  var state = { set: 'privat', i: 0 };
  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  var seg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Beispielsatz' }, ctl);
  var bP = el('button', { type: 'button', 'aria-pressed': 'true', text: 'Privat' }, seg);
  var bA = el('button', { type: 'button', 'aria-pressed': 'false', text: 'Am Arbeitsplatz' }, seg);
  var wrap = el('div', { class: 'se-wrap' }, root);
  var ladder = el('div', { class: 'se-ladder', role: 'group', 'aria-label': 'Eingaben' }, wrap);
  var panel = el('div', { class: 'se-panel', 'aria-live': 'polite' }, wrap);
  var btns = [];
  function buildLadder() {
    ladder.innerHTML = ''; btns = [];
    SETS[state.set].forEach(function (it, i) {
      var b = el('button', { type: 'button', class: 'se-l' + it.l, 'aria-pressed': 'false' }, ladder);
      el('i', {}, b); el('span', { text: it.p }, b);
      b.addEventListener('click', function () { stopDemo(); show(i); });
      btns.push(b);
    });
  }
  function show(i) {
    state.i = i;
    var it = SETS[state.set][i], L = LEVELS[it.l];
    btns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
    panel.innerHTML = '';
    var lv = el('span', { class: 'lvl', text: L.n }, panel); lv.style.background = L.c;
    el('h4', { text: 'Was ein Fremder daraus erfährt' }, panel);
    el('p', { text: it.know }, panel);
    el('h4', { text: 'Wo es landen kann' }, panel);
    var ul = el('ul', {}, panel); it.where.forEach(function (w) { el('li', { text: w }, ul); });
    el('div', { class: 'se-meta', text: 'So, als würdest du es einer unbekannten Person erzählen – oder per E-Mail an eine fremde Firma schicken.' }, panel);
  }
  function setSet(s) { state.set = s; bP.setAttribute('aria-pressed', String(s === 'privat')); bA.setAttribute('aria-pressed', String(s === 'arbeit')); buildLadder(); show(0); }
  bP.addEventListener('click', function () { stopDemo(); setSet('privat'); });
  bA.addEventListener('click', function () { stopDemo(); setSet('arbeit'); });
  var timer = null;
  function stopDemo() { clearTimeout(timer); timer = null; }
  function demo() {
    if (ctx.reduced) return;
    var k = 1;
    function step() { if (!ctx.active()) { timer = setTimeout(step, 1500); return; } if (k >= 6) { timer = null; return; } show(k++); timer = setTimeout(step, 1800); }
    timer = setTimeout(step, 1800);
  }
  setSet('privat'); demo();
});

/* ---- 15-tool-tiers.js ---- */
App.widget('tool-tiers', function (root, ctx) {
  var el = App.el;
  var COLS = ['Gratis-Webversion', 'Privates Abo (rund CHF 20/Monat)', 'Von der Organisation bereitgestellt'];
  // v: good / mid / bad ; t: label ; e: explanation
  var ROWS = [
    { r: 'Eingaben werden für Training genutzt', c: [
      { v: 'bad', t: 'ja, standardmässig', e: 'Bei vielen Anbietern ist die Nutzung zum Training voreingestellt. Du musst sie aktiv abschalten – falls der Dienst das anbietet.' },
      { v: 'mid', t: 'je nach Einstellung', e: 'Auch im Abo gilt meist die gleiche Voreinstellung wie gratis. Der Schalter liegt in deinen Datenschutz-Einstellungen, nicht im Preis.' },
      { v: 'good', t: 'nein', e: 'Bei Geschäfts- und Verwaltungsverträgen sichern die Anbieter vertraglich zu, Eingaben nicht für das Training zu verwenden.' }] },
    { r: 'Menschen können mitlesen', c: [
      { v: 'bad', t: 'möglich', e: 'Zur Qualitätsprüfung und bei Missbrauchsverdacht können Mitarbeitende oder Beauftragte des Anbieters Gespräche einsehen.' },
      { v: 'bad', t: 'möglich', e: 'Das Abo ändert daran nichts. Die Regeln stehen in derselben Datenschutzerklärung.' },
      { v: 'good', t: 'nur vertraglich geregelt', e: 'Zugriff nur in klar definierten Fällen, protokolliert, oft mit Datenstandort und Auftragsverarbeitungsvertrag.' }] },
    { r: 'Profil / Personalisierung', c: [
      { v: 'bad', t: 'ja', e: 'Gedächtnisfunktionen und Nutzungsdaten bauen ein Profil auf, das Antworten persönlicher macht – und dich an den Dienst bindet.' },
      { v: 'bad', t: 'ja', e: 'Im Abo meist noch ausgeprägter, weil mehr Funktionen freigeschaltet sind.' },
      { v: 'mid', t: 'gemäss Organisation', e: 'Deine Organisation entscheidet, welche Funktionen aktiv sind und wer Daten sehen darf.' }] },
    { r: 'Werbung möglich', c: [
      { v: 'bad', t: 'ja', e: 'Einzelne Anbieter haben Werbung in Gratisversionen angekündigt oder testen sie. Grundlage: das, was du eingibst.' },
      { v: 'mid', t: 'meist nein', e: 'Abos werben in der Regel damit, werbefrei zu sein. Die Bedingungen können sich aber ändern.' },
      { v: 'good', t: 'nein', e: 'Geschäftsverträge sehen keine Werbung vor.' }] },
    { r: 'Datenstandort wählbar', c: [
      { v: 'bad', t: 'nein', e: 'Die Daten liegen dort, wo der Anbieter sie hinlegt – meist in den USA.' },
      { v: 'bad', t: 'nein', e: 'Auch im Abo hast du keine Wahl.' },
      { v: 'good', t: 'oft ja', e: 'Grosse Anbieter bieten Datenhaltung in der EU oder der Schweiz an – ein Grund, weshalb Organisationen Zeit für die Einführung brauchen.' }] },
    { r: 'Vertrag mit deiner Organisation (AVV)', c: [
      { v: 'bad', t: 'nein', e: 'Du akzeptierst als Privatperson die AGB. Deine Organisation ist nicht Vertragspartei und kann nichts durchsetzen.' },
      { v: 'bad', t: 'nein', e: 'Ein privates Abo bleibt ein Privatvertrag – auch wenn du es beruflich nutzt.' },
      { v: 'good', t: 'ja', e: 'Ein Auftragsverarbeitungsvertrag legt fest, was mit den Daten geschehen darf, wie lange sie gespeichert werden und wer haftet.' }] },
    { r: 'AGB ändern sich ohne dein Zutun', c: [
      { v: 'bad', t: 'laufend', e: 'Nutzungsbedingungen und Datenschutzerklärungen werden mehrmals pro Jahr angepasst. Weiterbenutzen gilt als Zustimmung.' },
      { v: 'bad', t: 'laufend', e: 'Gleiche Dokumente, gleiche Praxis.' },
      { v: 'good', t: 'vertraglich fixiert', e: 'Änderungen müssen mit der Organisation vereinbart werden.' }] },
    { r: 'Geeignet für Amtsgeheimnis', c: [
      { v: 'bad', t: 'nein', e: 'Personendaten und Amtsgeheimnisse dürfen nicht an Dritte ohne Rechtsgrundlage gehen. Ein öffentliches Tool ist ein Dritter.' },
      { v: 'bad', t: 'nein', e: 'Der Preis ändert die rechtliche Lage nicht.' },
      { v: 'mid', t: 'gemäss Freigabe', e: 'Nur wenn deine Organisation das Tool für diese Datenklasse ausdrücklich freigegeben hat.' }] }
  ];
  root.classList.add('w');
  var scroll = el('div', { class: 'tt-scroll' }, root);
  var table = el('table', { class: 'tt-table' }, scroll);
  var thead = el('thead', {}, table), hr = el('tr', {}, thead);
  el('th', { text: '' }, hr); COLS.forEach(function (c) { el('th', { text: c, scope: 'col' }, hr); });
  var tbody = el('tbody', {}, table);
  var exp = el('div', { class: 'tt-exp', 'aria-live': 'polite' }, root);
  var cells = [];
  ROWS.forEach(function (row, ri) {
    var tr = el('tr', {}, tbody);
    el('td', { class: 'r', text: row.r }, tr);
    row.c.forEach(function (c, ci) {
      var td = el('td', {}, tr);
      var b = el('button', { type: 'button', class: 'tt-cell ' + c.v, text: (c.v === 'good' ? '✓ ' : c.v === 'bad' ? '✗ ' : '~ ') + c.t, 'aria-label': row.r + ' – ' + COLS[ci] + ': ' + c.t }, td);
      b.addEventListener('click', function () { stopDemo(); show(ri, ci); });
      cells.push({ b: b, ri: ri, ci: ci });
    });
  });
  function show(ri, ci) {
    cells.forEach(function (c) { c.b.classList.toggle('on', c.ri === ri && c.ci === ci); });
    var c = ROWS[ri].c[ci];
    exp.innerHTML = ''; el('b', { text: ROWS[ri].r + ' · ' + COLS[ci] }, exp); exp.appendChild(document.createTextNode(c.e));
  }
  exp.textContent = 'Klick auf eine Zelle für die Begründung.';
  var timer = null;
  function stopDemo() { clearTimeout(timer); timer = null; }
  if (!ctx.reduced) {
    var seq = [[0, 0], [0, 2], [3, 0], [6, 0], [7, 1]], k = 0;
    function step() { if (!ctx.active()) { timer = setTimeout(step, 1500); return; } if (k >= seq.length) { timer = null; return; } show(seq[k][0], seq[k][1]); k++; timer = setTimeout(step, 2200); }
    timer = setTimeout(step, 1200);
  }
});

/* ---- 16-anonymize.js ---- */
App.widget('anonymize', function (root, ctx) {
  var el = App.el;
  var DAYS = [
    { d: 'Mo', p: '«Formuliere eine freundliche Mahnung für einen ausstehenden Betrag.»' },
    { d: 'Di', p: '«Erkläre in einfacher Sprache, was ein Verzugszins ist.»' },
    { d: 'Mi', p: '«Welche Fristen gelten für Einsprachen gegen eine Veranlagung?»' },
    { d: 'Do', p: '«Übersetze ‹Quellensteuer› ins Portugiesische.»' },
    { d: 'Fr', p: '«Formuliere eine Antwort an einen Bürger, der seine Steuererklärung zu spät eingereicht hat.»' },
    { d: 'Sa', p: '«Wie erkläre ich meinen Kindern, was ich im Büro mache?»' }
  ];
  // profile rows: which day they appear, and confidence per day (0..1)
  var PROF = [
    { k: 'Branche', v: 'Verwaltung oder Inkasso', why: 'Mahnungen, Fristen, Amtsdeutsch', conf: [0.35, 0.5, 0.8, 0.85, 0.95, 0.95] },
    { k: 'Bereich', v: 'Steuern', why: '‹Veranlagung›, ‹Quellensteuer›, ‹Steuererklärung›', conf: [0, 0.3, 0.7, 0.85, 0.95, 0.95] },
    { k: 'Ort', v: 'Schweiz', why: '‹Einsprache›, ‹Veranlagung›, Schreibweise mit ss', conf: [0.2, 0.3, 0.75, 0.85, 0.9, 0.9] },
    { k: 'Rolle', v: 'Sachbearbeitung mit Kundenkontakt', why: 'Antworten an Bürgerinnen und Bürger, Übersetzungen', conf: [0.3, 0.4, 0.5, 0.75, 0.9, 0.9] },
    { k: 'Privat', v: 'Kinder', why: 'Samstagsfrage', conf: [0, 0, 0, 0, 0, 0.9] }
  ];
  var state = { i: -1 };
  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  var next = el('button', { class: 'btn', type: 'button', text: 'Nächster Prompt' }, ctl);
  var reset = el('button', { class: 'btn secondary', type: 'button', text: 'Von vorn' }, ctl);
  var wrap = el('div', { class: 'an-wrap' }, root);
  var week = el('div', { class: 'an-week' }, wrap);
  var dayEls = DAYS.map(function (d) { var x = el('div', { class: 'an-day' }, week); el('span', { class: 'd', text: d.d }, x); el('span', { text: d.p }, x); return x; });
  var prof = el('div', { class: 'an-prof', 'aria-live': 'polite' }, wrap);
  el('h4', { text: 'Was der Anbieter jetzt vermuten kann' }, prof);
  var rows = PROF.map(function (p) {
    var r = el('div', { class: 'an-row' }, prof);
    el('span', { class: 'k', text: p.k }, r); var v = el('span', { class: 'v', text: p.v }, r);
    var m = el('div', { class: 'meter' }, r); var bar = el('span', {}, m);
    el('span', { class: 'why', text: p.why }, r);
    return { r: r, bar: bar, v: v };
  });
  var fin = el('div', { class: 'an-final', text: 'Sie haben nie gesagt, wo Sie arbeiten.' }, prof);
  function render() {
    dayEls.forEach(function (d, k) { d.classList.toggle('on', k <= state.i); d.classList.toggle('cur', k === state.i); });
    rows.forEach(function (r, k) {
      var c = state.i < 0 ? 0 : PROF[k].conf[state.i];
      r.r.classList.toggle('on', c > 0);
      r.bar.style.width = Math.round(c * 100) + '%';
      r.bar.style.background = c >= 0.85 ? 'var(--warm)' : 'var(--accent)';
    });
    fin.classList.toggle('on', state.i >= DAYS.length - 1);
    next.disabled = state.i >= DAYS.length - 1;
  }
  function advance() { if (state.i < DAYS.length - 1) { state.i++; render(); } }
  var timer = null;
  function stopDemo() { clearTimeout(timer); timer = null; }
  next.addEventListener('click', function () { stopDemo(); advance(); });
  reset.addEventListener('click', function () { stopDemo(); state.i = -1; render(); });
  render();
  if (!ctx.reduced) {
    function step() { if (!ctx.active()) { timer = setTimeout(step, 1500); return; } if (state.i >= DAYS.length - 1) { timer = null; return; } advance(); timer = setTimeout(step, 1900); }
    timer = setTimeout(step, 900);
  } else { state.i = DAYS.length - 1; render(); }
});

/* ---- 17-traffic-light.js ---- */
App.widget('traffic-light', function (root, ctx) {
  var el = App.el;
  var COLS = ['Öffentliches Gratis-Tool', 'Privates Abo', 'Von der Organisation freigegebenes Tool'];
  var LBL = { g: 'Ja', y: 'Mit Bedingungen', r: 'Nein' };
  var ROWS = [
    { r: 'Öffentlich', s: 'bereits publiziert', c: [
      ['g', 'Was schon auf der Website steht, ist nicht geheim. Prüf nur, ob dein Konto nicht mehr verrät, als du willst.'],
      ['g', 'Wie gratis: Öffentliche Information bleibt öffentlich.'],
      ['g', 'Unproblematisch.']] },
    { r: 'Intern', s: 'nicht publiziert, unkritisch', c: [
      ['y', 'Kein Personenbezug, kein Geheimnis – aber es gehört deiner Organisation, nicht dir. Viele Weisungen erlauben es, manche nicht. Frag nach.'],
      ['y', 'Gleiche Lage wie gratis: Ein Privatvertrag ist kein Vertrag mit deiner Organisation.'],
      ['g', 'Dafür ist das Tool gemacht.']] },
    { r: 'Vertraulich / Personendaten', s: 'Namen, Adressen, Fallnummern, Verträge', c: [
      ['r', 'Personendaten an einen Dritten ohne Rechtsgrundlage: Datenschutzgesetz und Amtsgeheimnis. Auch nicht «nur kurz».'],
      ['r', 'Der Preis ändert die Rechtslage nicht. Dein Abo ist ein Dritter.'],
      ['y', 'Gemäss Freigabe: Wenn die Organisation das Tool für Personendaten freigegeben hat (Vertrag, Datenstandort, kein Training), ja – und nur dann.']] },
    { r: 'Besonders schützenswert / geheim', s: 'Gesundheit, Sozialhilfe, Steuern, Strafverfahren', c: [
      ['r', 'Unter keinen Umständen. Das ist die höchste Schutzstufe – für die Betroffenen und für dich persönlich.'],
      ['r', 'Unter keinen Umständen.'],
      ['y', 'Nur wenn ausdrücklich freigegeben – viele Organisationen schliessen diese Klasse auch im internen Tool aus oder verlangen zusätzliche Massnahmen.']] }
  ];
  root.classList.add('w');
  var grid = el('div', { class: 'tl-grid', role: 'table', 'aria-label': 'Ampel' }, root);
  el('div', { class: 'tl-h', text: 'Informationsklasse' }, grid);
  COLS.forEach(function (c) { el('div', { class: 'tl-h', text: c, role: 'columnheader' }, grid); });
  var exp = el('div', { class: 'tl-exp', 'aria-live': 'polite' }, root);
  el('div', { class: 'tl-note', text: 'Massgebend sind die Weisungen deiner Organisation und deines Datenschutzberaters – diese Ampel ist eine Faustregel.' }, root);
  var cells = [];
  ROWS.forEach(function (row, ri) {
    var r = el('div', { class: 'tl-r', role: 'rowheader' }, grid);
    r.innerHTML = '<span><b>' + row.r + '</b><br>' + row.s + '</span>';
    row.c.forEach(function (c, ci) {
      var b = el('button', { type: 'button', class: 'tl-c ' + c[0], text: LBL[c[0]], 'aria-label': row.r + ' – ' + COLS[ci] + ': ' + LBL[c[0]] }, grid);
      b.addEventListener('click', function () { stopDemo(); show(ri, ci); });
      cells.push({ b: b, ri: ri, ci: ci });
    });
  });
  function show(ri, ci) {
    cells.forEach(function (c) { c.b.classList.toggle('on', c.ri === ri && c.ci === ci); });
    exp.innerHTML = ''; el('b', { text: ROWS[ri].r + ' · ' + COLS[ci] }, exp); exp.appendChild(document.createTextNode(ROWS[ri].c[ci][1]));
  }
  exp.textContent = 'Klick auf ein Feld für die Begründung.';
  var timer = null;
  function stopDemo() { clearTimeout(timer); timer = null; }
  if (!ctx.reduced) {
    var seq = [[0, 0], [2, 0], [2, 2], [3, 2]], k = 0;
    function step() { if (!ctx.active()) { timer = setTimeout(step, 1500); return; } if (k >= seq.length) { timer = null; return; } show(seq[k][0], seq[k][1]); k++; timer = setTimeout(step, 2200); }
    timer = setTimeout(step, 1200);
  }
});

/* ---- 90-glossary.js ---- */
App.widget('glossary', function (root) {
  var input = root.querySelector('.gl-input'), terms = root.querySelectorAll('.term'), empty = root.querySelector('.gl-empty');
  if (!input) return;
  function filter() {
    var q = input.value.trim().toLowerCase(), n = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      var hit = !q || t.textContent.toLowerCase().indexOf(q) >= 0;
      t.hidden = !hit; if (hit) n++;
    }
    if (empty) empty.hidden = n > 0;
  }
  input.addEventListener('input', filter);
  filter();
});

/* ---- 91-copy.js ---- */
App.widget('copy', function (root) {
  var el = App.el;
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
    } else { fallback(text, done); }
  }
  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta); done();
  }
  var pres = root.querySelectorAll('pre.cs-tpl');
  for (var i = 0; i < pres.length; i++) (function (pre) {
    var btn = el('button', { type: 'button', class: 'btn secondary cs-copy', text: 'Kopieren', 'data-copy': '', 'aria-label': 'Vorlage kopieren' });
    pre.appendChild(btn);
    btn.addEventListener('click', function () {
      var clone = pre.cloneNode(true); var b = clone.querySelector('.cs-copy'); if (b) clone.removeChild(b);
      copyText(clone.textContent.trim(), function () {
        btn.textContent = 'Kopiert ✓'; btn.classList.add('done');
        setTimeout(function () { btn.textContent = 'Kopieren'; btn.classList.remove('done'); }, 1500);
      });
    });
  })(pres[i]);
});

/* ---- k5-az-steps.js ---- */
/* Grosse Aufgabe von A nach Z – oder in Schritten B, C, D … mit Kontrollpunkten.
   Nach der Folie «KI soll mir/uns dabei helfen ____» von Kevin Kuhn. */
App.widget('az-steps', function (root, ctx) {
  var el = App.el;
  var TASKS = [
    ['die Bevölkerung über die Neugestaltung des Stadtkerns zu informieren', 'die Medienmitteilung in einfacher Sprache für die Website umschreiben'],
    ['das Budget 2027 verständlich zu erklären', 'die drei grössten Veränderungen zum Vorjahr als Tabelle darstellen'],
    ['das neue Wohnbaureglement einzuführen', 'zehn Fragen und Antworten daraus formulieren, je mit Artikelangabe'],
    ['Anfragen zur Kehrichtgebühr zu beantworten', 'eine Antwortvorlage mit den neuen Ansätzen entwerfen']
  ];
  var LETTERS = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', '…'];
  var EYE = { C: 1, D: 1, G: 1, J: 1 };   // hier schaut ein Mensch hin
  var EYE_SVG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>';
  var state = ctx.reduced || App.mode === 'print' ? 1 : 0;

  var wrap = el('div', { class: 'w az' }, root);
  var ctl = el('div', { class: 'ctl' }, wrap);
  var seg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Ansicht' }, ctl);
  var b0 = el('button', { type: 'button', text: 'Der Wunsch' }, seg);
  var b1 = el('button', { type: 'button', text: 'So klappt es' }, seg);
  el('p', { class: 'az-head', html: 'KI soll mir dabei helfen, <span class="az-blank"></span>' }, wrap);
  var list = el('ol', { class: 'az-tasks' }, wrap);
  TASKS.forEach(function (t) {
    var li = el('li', null, list);
    el('span', { class: 'az-big', text: t[0] }, li);
    el('span', { class: 'az-arrow', text: '→', 'aria-hidden': 'true' }, li);
    el('span', { class: 'az-small', text: t[1] }, li);
  });
  var track = el('div', { class: 'az-track' }, wrap);
  el('b', { class: 'az-end', text: 'A' }, track);
  var mid = el('div', { class: 'az-mid' }, track);
  el('span', { class: 'az-one', text: 'ein Prompt' }, mid);
  var steps = el('div', { class: 'az-letters' }, mid);
  LETTERS.forEach(function (l) {
    var s = el('span', { class: 'az-l' }, steps);
    el('b', { text: l }, s);
    el('i', { class: 'az-eye' + (EYE[l] ? ' on' : ''), html: EYE[l] ? EYE_SVG : '' }, s);
  });
  el('b', { class: 'az-end', text: 'Z' }, track);
  var legend = el('p', { class: 'az-legend' }, wrap);
  legend.innerHTML = '<span><i class="az-eye on">' + EYE_SVG + '</i> hier prüft ein Mensch</span>';
  var note = el('p', { class: 'callout' }, wrap);

  function render() {
    wrap.classList.toggle('split', state === 1);
    b0.setAttribute('aria-pressed', state === 0 ? 'true' : 'false');
    b1.setAttribute('aria-pressed', state === 1 ? 'true' : 'false');
    note.hidden = state === 0;
    note.innerHTML = state === 0
      ? ''
      : '<b>Aus jeder grossen Aufgabe wird ein kleiner, prüfbarer Schritt.</b> Viele kleine Schritte führen ans Ziel, und zwischen den Schritten schaust du hin.';
  }
  b0.addEventListener('click', function () { state = 0; render(); });
  b1.addEventListener('click', function () { state = 1; render(); });
  render();
});

/* ---- k5-chat-rounds.js ---- */
/* Mit jeder Runde liest das Modell das ganze bisherige Gespräch. */
App.widget('chat-rounds', function (root, ctx) {
  var el = App.el;
  var MSGS = [
    { who: 'Du', round: 1, k: 'Dein Auftrag', text: 'Schreibe eine Antwort auf diese Anfrage. Stütze dich auf die Mitteilung unten. Höflich, Sie-Form, höchstens 100 Wörter.' },
    { who: 'KI', round: 1, k: 'Entwurf 1', text: 'Sehr geehrte Frau Huber … (erster Entwurf)' },
    { who: 'Du', round: 2, k: 'Deine Korrektur', text: 'Gut. Jetzt den zweiten Absatz streichen und den Schluss verbindlicher formulieren.' },
    { who: 'KI', round: 2, k: 'Entwurf 2', text: 'Sehr geehrte Frau Huber … (ohne zweiten Absatz)' },
    { who: 'Du', round: 3, k: 'Dein Feinschliff', text: 'Kürzer, und nenne die neue Gebühr im ersten Satz.' }
  ];
  var all = App.mode === 'print';
  var round = all ? 3 : 1;
  var wrap = el('div', { class: 'w cr' }, root);
  var ctl = el('div', { class: 'ctl' }, wrap);
  var title = el('b', { class: 'cr-title' }, ctl);
  var next = el('button', { type: 'button', class: 'btn', text: 'Nächste Runde' }, ctl);
  var reset = el('button', { type: 'button', class: 'btn secondary', text: 'Von vorn' }, ctl);
  var grid = el('div', { class: 'cr-grid' }, wrap);
  var left = el('div', { class: 'cr-col' }, grid);
  el('p', { class: 'k', text: 'Du tippst' }, left);
  var typed = el('div', { class: 'cr-typed' }, left);
  var right = el('div', { class: 'cr-col' }, grid);
  el('p', { class: 'k', text: 'Das Modell liest' }, right);
  var stack = el('div', { class: 'cr-stack', 'aria-live': 'polite' }, right);
  var sum = el('p', { class: 'cr-sum' }, wrap);

  function render() {
    title.textContent = 'Runde ' + round + ' von 3';
    var mine = MSGS.filter(function (m) { return m.who === 'Du' && m.round === round; })[0];
    typed.textContent = mine.text;
    stack.innerHTML = '';
    var read = MSGS.filter(function (m) { return m.round < round || (m.round === round && m.who === 'Du'); });
    read.forEach(function (m) {
      var b = el('div', { class: 'cr-msg' + (m.who === 'KI' ? ' ai' : '') + (m.round === round ? ' new' : '') }, stack);
      el('span', { class: 'k', text: m.k }, b);
      el('span', { text: m.text }, b);
    });
    sum.innerHTML = round === 1
      ? 'Das Modell liest <b>1 Nachricht</b>: deinen Auftrag.'
      : 'Du tippst einen Satz. Das Modell liest <b>' + read.length + ' Nachrichten</b>: alles Bisherige und deinen neuen Satz.';
    next.disabled = round === 3;
  }
  next.addEventListener('click', function () { if (round < 3) { round++; render(); } });
  reset.addEventListener('click', function () { round = 1; render(); });
  render();
});

/* ---- pfc-04-agent-loop.js ---- */
App.widget('agent-loop', function (root, ctx) {
  var el = App.el;
  // Illustrative run of the enquiry agent (municipal contact form): per round a thought, a tool call and an observation.
  // ctxAdd = tokens the round adds to the context (tool results etc.), illustrative.
  var ROUNDS = [
    { think: 'Ich brauche die neue Anfrage aus dem Kontaktformular.', act: 'Werkzeug «Anfrage lesen»: neuester Eintrag im Kontaktformular', obs: 'Anfrage geladen: Sperrgut abholen lassen – wie anmelden, was kostet es?', ctxAdd: 6000 },
    { think: 'Das Amt nicht raten – das Werkzeug aufrufen.', act: 'Werkzeug «Zuständigkeit_nachschlagen» (Stichwort Sperrgut)', obs: 'Zuständig: Werkhof. Nicht zuständig: Bauverwaltung.', ctxAdd: 4000 },
    { think: 'Wie die Anmeldung läuft, im Merkblatt suchen.', act: 'Werkzeug «Merkblätter durchsuchen»: Werkhof, Sperrgut', obs: '«Sperrgut wird nur auf Anmeldung abgeholt.»', ctxAdd: 9000 },
    { think: 'Die Einwohnerin fragt auch nach dem Preis – steht dazu etwas im Merkblatt?', act: 'Werkzeug «Merkblätter durchsuchen»: Gebühren Sperrgut', obs: 'Kein Eintrag gefunden → «Angabe offen – Rückfrage Werkhof».', ctxAdd: 8000 },
    { think: 'Entwurf schreiben, dann jede Aussage prüfen.', act: 'Selbstprüfung: Aussagen mit den Werkzeug-Resultaten abgleichen', obs: 'Alle Aussagen stimmen mit den Werkzeug-Resultaten überein.', ctxAdd: 5000 }
  ];
  var BASE = 6000, OUT = 1500, PIN = 2 / 1e6, POUT = 10 / 1e6; // Sonnet 5.5 list prices (USD per token)
  var PH = [{ k: 'think', t: 'Denken', s: 'Was ist der nächste Schritt?' }, { k: 'act', t: 'Handeln', s: 'Werkzeug aufrufen' }, { k: 'obs', t: 'Beobachten', s: 'Resultat in Kontext übernehmen' }];

  root.classList.add('w', 'al');
  var ctl = el('div', { class: 'ctl' }, root);
  var bNext = el('button', { class: 'btn', type: 'button', text: 'Nächster Schritt →' }, ctl);
  var bPlay = el('button', { class: 'btn secondary', type: 'button', text: 'Abspielen' }, ctl);
  var bReset = el('button', { class: 'btn secondary', type: 'button', text: 'Neu starten' }, ctl);

  var lane = el('div', { class: 'al-lane' }, root);
  var nStart = el('div', { class: 'al-node al-end' }, lane); nStart.innerHTML = '<b>Auslöser</b><span>Chat, Zeitplan, Ereignis</span>';
  var loop = el('div', { class: 'al-loop' }, lane);
  var nodes = PH.map(function (p, i) { var n = el('div', { class: 'al-node' }, loop); n.innerHTML = '<b>' + (i + 1) + ' ' + p.t + '</b><span>' + p.s + '</span>'; return n; });
  el('div', { class: 'al-back', text: '↺ wiederholen, bis Ziel erreicht' }, loop);
  var nEnd = el('div', { class: 'al-node al-end' }, lane); nEnd.innerHTML = '<b>Ergebnis</b><span>Entwurf an Mensch</span>';

  var now = el('div', { class: 'al-now', 'aria-live': 'polite' }, root);
  var stats = el('div', { class: 'al-stats' }, root);
  var sRound = el('div', {}, stats), sCtx = el('div', {}, stats), sCost = el('div', {}, stats);
  var bar = el('div', { class: 'al-bar' }, root); var barFill = el('span', {}, bar);
  var MAXCTX = BASE + ROUNDS.reduce(function (a, r) { return a + r.ctxAdd; }, 0);

  // step: -1 = trigger, 0..3*R-1 = phases, 3*R = result
  var step = -1, timer = null;
  function state() {
    var r = Math.max(0, Math.min(ROUNDS.length - 1, Math.floor(step / 3)));
    var done = step < 0 ? 0 : Math.min(ROUNDS.length, Math.floor(step / 3) + 1); // rounds started (each = one model call)
    var ctxTok = BASE, cost = 0;
    for (var i = 0; i < done; i++) { cost += ctxTok * PIN + OUT * POUT; ctxTok += ROUNDS[i].ctxAdd; }
    if (step >= 0 && step < ROUNDS.length * 3 && step % 3 !== 2) ctxTok -= ROUNDS[r].ctxAdd; // observation not yet in context
    return { r: r, calls: done, ctx: ctxTok, cost: cost };
  }
  function render() {
    var st = state(), last = ROUNDS.length * 3;
    nStart.classList.toggle('on', step === -1);
    nEnd.classList.toggle('on', step === last);
    nodes.forEach(function (n, i) { n.classList.toggle('on', step >= 0 && step < last && step % 3 === i); });
    now.innerHTML = '';
    if (step === -1) { el('b', { text: 'Start' }, now); now.appendChild(document.createTextNode('Neue Anfrage im Kontaktformular der Gemeinde. Der Agent erhält Instruktion und Auftrag.')); }
    else if (step === last) { el('b', { text: 'Ergebnis' }, now); now.appendChild(document.createTextNode('Zuweisung an den Werkhof und Antwortentwurf an die Sachbearbeiterin zur Freigabe – nie direkt an die Einwohnerin.')); }
    else { var p = PH[step % 3]; el('b', { text: 'Runde ' + (st.r + 1) + ' · ' + p.t }, now); now.appendChild(document.createTextNode(ROUNDS[st.r][p.k])); }
    sRound.innerHTML = '<span>Modellaufrufe</span><b>' + st.calls + '</b>';
    sCtx.innerHTML = '<span>Kontext</span><b>' + App.fmt(st.ctx) + ' Tokens</b>';
    sCost.innerHTML = '<span>Kosten bisher</span><b>USD ' + st.cost.toFixed(3) + '</b>';
    barFill.style.width = (st.ctx / MAXCTX * 100) + '%';
    bNext.disabled = step === last;
  }
  function next() { if (step < ROUNDS.length * 3) { step++; render(); } else stop(); }
  function stop() { clearInterval(timer); timer = null; bPlay.textContent = 'Abspielen'; }
  function play() {
    if (timer) { stop(); return; }
    if (step >= ROUNDS.length * 3) { step = -1; render(); }
    bPlay.textContent = 'Pause';
    timer = setInterval(function () { if (!ctx.active()) return; next(); if (step >= ROUNDS.length * 3) stop(); }, 1600);
  }
  bNext.addEventListener('click', function () { stop(); next(); });
  bPlay.addEventListener('click', play);
  bReset.addEventListener('click', function () { stop(); step = -1; render(); });
  if (App.mode === 'print') step = 7; // mid-run snapshot: round 3, act
  render();
  if (!ctx.reduced) play();
});

/* ---- pfc-09-error-chain.js ---- */
App.widget('error-chain', function (root) {
  var el = App.el, svg = App.svg;
  root.classList.add('w', 'ec');
  var ctl = el('div', { class: 'ctl' }, root);
  var l1 = el('label', {}, ctl); l1.appendChild(document.createTextNode('Je Schritt korrekt'));
  var rp = el('input', { type: 'range', min: '80', max: '99.9', step: '0.1', value: '95' }, l1); var vp = el('b', { class: 'tnum' }, l1);
  var l2 = el('label', {}, ctl); l2.appendChild(document.createTextNode('Schritte'));
  var rn = el('input', { type: 'range', min: '1', max: '30', step: '1', value: '10' }, l2); var vn = el('b', { class: 'tnum' }, l2);

  var top = el('div', { class: 'ec-top' }, root);
  var big = el('div', { class: 'kpi' }, top); var bigB = el('b', {}, big); el('span', { text: 'Wahrscheinlichkeit, dass alle Schritte korrekt sind' }, big);
  var chain = el('div', { class: 'ec-chain', 'aria-hidden': 'true' }, top);

  var W = 520, H = 210, P = { l: 36, r: 12, t: 10, b: 26 }, N = 30;
  var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'ec-svg', role: 'img', 'aria-label': 'Kurve: Wahrscheinlichkeit nach Anzahl Schritte' }, root);
  function x(n) { return P.l + (n - 1) / (N - 1) * (W - P.l - P.r); }
  function y(v) { return P.t + (1 - v) * (H - P.t - P.b); }
  [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
    svg('line', { x1: P.l, x2: W - P.r, y1: y(v), y2: y(v), class: 'grid' }, s);
    svg('text', { x: P.l - 6, y: y(v) + 4, 'text-anchor': 'end', class: 'axis-label' }, s).textContent = (v * 100) + ' %';
  });
  [1, 5, 10, 15, 20, 25, 30].forEach(function (n) { svg('text', { x: x(n), y: H - 8, 'text-anchor': 'middle', class: 'axis-label' }, s).textContent = n; });
  function path(p) { var d = ''; for (var n = 1; n <= N; n++) d += (n === 1 ? 'M' : 'L') + x(n).toFixed(1) + ',' + y(Math.pow(p, n)).toFixed(1); return d; }
  [0.99, 0.9].forEach(function (p) {
    svg('path', { d: path(p), class: 'ec-ref' }, s);
    svg('text', { x: x(N) - 2, y: y(Math.pow(p, N)) - 5, 'text-anchor': 'end', class: 'axis-label' }, s).textContent = (p * 100) + ' % je Schritt';
  });
  var cur = svg('path', { class: 'ec-cur' }, s);
  var vline = svg('line', { class: 'ec-v' }, s);
  var dot = svg('circle', { r: 5, class: 'ec-dot' }, s);

  function fmtPct(v) { return (v * 100).toFixed(v >= 0.995 || v < 0.1 ? 1 : 0).replace('.', ',') + ' %'; }
  function render() {
    var p = rp.value / 100, n = +rn.value, v = Math.pow(p, n);
    vp.textContent = (+rp.value).toFixed(1).replace('.', ',').replace(',0', '') + ' %'; vn.textContent = n;
    bigB.textContent = fmtPct(v);
    big.classList.toggle('warm', v < 0.7);
    cur.setAttribute('d', path(p));
    vline.setAttribute('x1', x(n)); vline.setAttribute('x2', x(n)); vline.setAttribute('y1', P.t); vline.setAttribute('y2', H - P.b);
    dot.setAttribute('cx', x(n)); dot.setAttribute('cy', y(v));
    chain.innerHTML = '';
    for (var i = 1; i <= n; i++) { var c = el('span', {}, chain); c.style.opacity = (0.25 + 0.75 * Math.pow(p, i)).toFixed(2); }
  }
  rp.addEventListener('input', render); rn.addEventListener('input', render);
  render();
});

/* ---- pfc-14-prompt-levels.js ---- */
App.widget('prompt-levels', function (root) {
  var el = App.el;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  // [text, css class] segments; class c = highlighted addition of this level, m = muted
  var LEVELS = [
    { name: 'Einfach', title: 'Stufe 1 · Der einfache Prompt',
      prompt: [['Beantworte die angehängte Anfrage aus dem Kontaktformular.', '']],
      head: 'Typisches Resultat', good: false,
      items: ['allgemeiner, langer Text', 'rät das Amt und rechnet Fristen selbst – evtl. falsch', 'erfindet plausible Gebühren und Abläufe', 'Form und Ton jedes Mal anders'],
      note: 'So beginnen die meisten. Für eine schnelle erste Einschätzung reicht das – für eine Antwort an eine Einwohnerin nicht.' },
    { name: 'Strukturiert', title: 'Stufe 2 · Der strukturierte Prompt',
      prompt: [['Anweisung:', 'c'], [' Ordne die Anfrage dem zuständigen Amt zu und entwirf eine Antwort.\n', ''], ['Kontext:', 'c'], [' Wir sind die Kanzlei einer Schweizer Gemeinde. Angehängt ist eine Anfrage aus dem Kontaktformular. Ämter: Steueramt, Bauverwaltung, Einwohnerdienste, Sozialdienst, Werkhof.\n', ''], ['Form:', 'c'], [' Zuerst das Amt in einer Zeile, dann max. 5 Sätze in Sie-Form, sachlich, keine Spekulation.', '']],
      head: 'Was sich ändert', good: true,
      items: ['Ton und Perspektive passen', 'Länge und Form sind steuerbar', 'Fokus auf das Wesentliche'],
      bad: ['Noch offen: Zuständigkeit und Fakten'],
      note: 'Merkhilfe: Anweisung · Kontext · Form.' },
    { name: 'Fortgeschritten', title: 'Stufe 3 · Der fortgeschrittene Prompt',
      prompt: [['[Anweisung, Kontext, Form wie Stufe 2]\n', 'm'], ['Gehe Schritt für Schritt vor:\n', 'c'], ['1. Bestimme das Amt nur anhand von <zuständigkeiten>.\n', ''], ['2. Übernimm Fristen und Gebühren nur aus <merkblatt> – rechne nicht selbst.\n', 'c'], ['3. Gib eine Auskunft nur, wenn sie in <merkblatt> steht,\n   sonst: «Angabe offen – Rückfrage beim Amt».\n', 'c'], ['Beispiel:', 'c'], [' «Zuständig: Werkhof. Sperrgut holen wir nur auf Anmeldung\n   ab. Zu den Kosten meldet sich der Werkhof bei Ihnen.»\n', ''], ['Prüfe zum Schluss: Steht jede Aussage in <merkblatt>?\n', 'c'], ['<anfrage> … </anfrage> <zuständigkeiten> … </zuständigkeiten>\n<merkblatt> … </merkblatt>', 'c']],
      head: 'Neu auf dieser Stufe', good: true,
      items: ['Schritte vorgeben', 'Regeln gegen Rechnen und Erfinden', 'Beispiel der gewünschten Antwort', 'Daten abgrenzen mit Markierungen', 'Selbstprüfung am Ende'],
      note: 'Diese Techniken sind gut erforscht.' },
    { name: 'Instruktion', title: 'Stufe 4 · Die Agenten-Instruktion',
      prompt: [['# ZWECK\n', 'c'], ['Anfragen aus dem Kontaktformular zuweisen, Antwort entwerfen.\n', ''], ['# REGELN\n', 'c'], ['- Amt nur aus Tool «Zuständigkeit_nachschlagen».\n- Keine Auskunft erfinden; Lücken als offen markieren.\n- Schweizer Rechtschreibung (ss, kein Eszett), Sie-Form, sachlich.\n', ''], ['# ABLAUF\n', 'c'], ['1. Neue Anfrage aus dem Kontaktformular lesen.\n2. «Zuständigkeit_nachschlagen» aufrufen (fünf Ämter).\n3. Auskunft in den Merkblättern des Amts suchen.\n4. Entwurf an Sachbearbeitung zur Freigabe, nie direkt versenden.\n', ''], ['# AUSGABE\n', 'c'], ['Amt + Antwort mit max. 5 Sätzen (siehe Beispiel).\n', ''], ['# SELBSTPRÜFUNG\n', 'c'], ['Jede Aussage mit Merkblatt und Tool-Resultat abgleichen.', '']],
      head: 'Neu auf dieser Stufe', good: true,
      items: ['Dauerhaft hinterlegt statt jedes Mal getippt – gilt für jeden Lauf', 'Benennt Werkzeuge, Wissensquellen und Grenzen ausdrücklich', 'Gegliedert in Markdown'],
      note: '«Zuständigkeit_nachschlagen» ist ein Werkzeug, das separat gebaut wird – je Plattform anders.' }
  ];
  var cur = 0;
  root.classList.add('w', 'pl');
  function block(parent) {
    var b = { title: el('p', { class: 'k accent' }, parent) };
    var grid = el('div', { class: 'pl-grid' }, parent);
    b.pre = el('div', { class: 'code pl-code', 'aria-live': 'polite' }, grid);
    b.side = el('div', { class: 'pl-side' }, grid);
    return b;
  }
  function fill(b, L) {
    b.title.textContent = L.title;
    b.pre.innerHTML = L.prompt.map(function (p) { return p[1] ? '<span class="' + p[1] + '">' + esc(p[0]) + '</span>' : esc(p[0]); }).join('');
    b.side.innerHTML = '';
    el('p', { class: 'k', text: L.head }, b.side);
    var ul = el('ul', { class: 'ticks' + (L.good ? '' : ' bad') }, b.side);
    L.items.forEach(function (t) { el('li', { text: t }, ul); });
    if (L.bad) { var ub = el('ul', { class: 'ticks bad' }, b.side); L.bad.forEach(function (t) { el('li', { text: t }, ub); }); }
    el('p', { class: 'pl-note', text: L.note }, b.side);
  }
  if (App.mode === 'print') { // PDF: all four levels one below the other
    LEVELS.forEach(function (L) { fill(block(el('div', { class: 'pl-print' }, root)), L); });
    return;
  }
  var seg = el('div', { class: 'seg pl-seg', role: 'group', 'aria-label': 'Stufe' }, root);
  var btns = LEVELS.map(function (L, i) {
    var b = el('button', { type: 'button', 'aria-pressed': String(i === cur) }, seg);
    b.innerHTML = '<span class="pl-n">' + (i + 1) + '</span><span class="pl-name">' + L.name + '</span>';
    b.addEventListener('click', function () { cur = i; render(); });
    return b;
  });
  var meter = el('div', { class: 'pl-meter', 'aria-hidden': 'true' }, root);
  var segs = LEVELS.map(function () { return el('span', {}, meter); });
  var main = block(root);
  function render() {
    btns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === cur)); });
    segs.forEach(function (s, i) { s.classList.toggle('on', i <= cur); });
    fill(main, LEVELS[cur]);
  }
  render();
});

/* ---- pfc-19-shots.js ---- */
App.widget('shots', function (root) {
  var el = App.el;
  var items = root.querySelectorAll('.shot-item');
  if (!items.length || App.mode === 'print') return; // PDF: all screenshots one below the other
  var seg = el('div', { class: 'seg shots-seg', role: 'group', 'aria-label': 'Schritt' });
  root.insertBefore(seg, root.firstChild);
  var btns = [];
  function show(i) {
    for (var k = 0; k < items.length; k++) { items[k].hidden = k !== i; btns[k].setAttribute('aria-pressed', String(k === i)); }
  }
  for (var i = 0; i < items.length; i++) (function (i) {
    var b = el('button', { type: 'button', text: items[i].getAttribute('data-label') }, seg);
    b.addEventListener('click', function () { show(i); });
    btns.push(b);
  })(i);
  show(0);
});

/* ---- pfc-23-agent-folder.js ---- */
App.widget('agent-folder', function (root) {
  var el = App.el;
  var FILES = [
    { path: 'CLAUDE.md', depth: 0, what: 'Die Instruktion (Stufe 4). Wird bei jedem Start automatisch geladen.',
      body: '# ZWECK\nMonatlicher Kommentar Budget vs. Ist für die GL.\n\n# REGELN\n- Zahlen nur aus scripts/abweichungen_berechnen.py.\n- Keine Ursache erfinden; Lücken als offen markieren.\n- Schweizer Rechtschreibung (ss statt ß), sachlich.\n\n# ABLAUF\n1. Datei daten/BvI_<Monat>.csv lesen.\n2. scripts/abweichungen_berechnen.py ausführen.\n3. Ursachen in den Kostenstellen-Kommentaren suchen.\n4. Entwurf als Datei ablegen – zur Freigabe, nie direkt an die GL.\n\n# SELBSTPRÜFUNG\nZum Schluss den Subagenten «pruefer» aufrufen.' },
    { path: 'daten/BvI_2026-09.csv', depth: 0, what: 'Die Eingabe: fiktive Budget- und Ist-Werte in TCHF.',
      body: 'Position;Budget;Ist\nUmsatz;12400;11860\nMaterial;4960;5020\nPersonal;3720;3690\nMarketing;620;810\nÜbriger Aufwand;1250;1210\nEBIT;1850;1130' },
    { path: 'scripts/abweichungen_berechnen.py', depth: 0, what: 'Das Rechenwerkzeug. Das Modell ruft es auf, statt selbst zu rechnen.',
      body: 'import csv, sys\n\nPCT, TCHF = 5.0, 50  # Schwellen: beide müssen überschritten sein\n\nwith open(sys.argv[1], encoding="utf-8") as f:\n    for row in csv.DictReader(f, delimiter=";"):\n        budget, ist = float(row["Budget"]), float(row["Ist"])\n        abw = ist - budget\n        pct = abw / budget * 100\n        flag = "*" if abs(pct) > PCT and abs(abw) > TCHF else ""\n        print(f"{row[\'Position\']};{abw:.0f};{pct:.1f};{flag}")' },
    { path: '.claude/', depth: 0, dir: true },
    { path: 'skills/kommentar/SKILL.md', depth: 1, what: 'Ein wiederverwendbarer Ablauf, den Claude bei Bedarf heranzieht.',
      body: '---\nname: kommentar\ndescription: Erstellt den BvI-Kommentar.\n---\nAbweichungen nur mit scripts/abweichungen_berechnen.py rechnen.\nJe Position mit * höchstens drei Sätze.\nBeispiel: «Marketing +190 TCHF (+30.6 %): Messe vom Q4 ins Q3\nvorgezogen; Verschiebung, kein Mehraufwand im Jahr.»' },
    { path: 'agents/pruefer.md', depth: 1, what: 'Ein Subagent mit kleinem Modell und eingeschränkten Werkzeugen, der jede Zahl prüft.',
      body: '---\nname: pruefer\ndescription: Prüft jede Zahl im Kommentar gegen die Quelldatei.\ntools: Read, Bash\nmodel: haiku\n---\nGleiche jede Zahl mit der Quelldatei ab.\nMelde jede Abweichung mit Position, Wert im Kommentar und Wert in der Quelle.' },
    { path: 'settings.json', depth: 1, what: 'Was der Agent darf und was nicht – zum Beispiel nie die Datei mit Zugangsdaten lesen.',
      body: '{\n  "permissions": {\n    "allow": ["Bash(python3 scripts/abweichungen_berechnen.py:*)"],\n    "deny": ["Read(./.env)"]\n  }\n}' }
  ];
  root.classList.add('w', 'af');
  var grid = el('div', { class: 'af-grid' }, root);
  var tree = el('div', { class: 'af-tree', role: 'tablist', 'aria-label': 'Dateien' }, grid);
  el('div', { class: 'af-row af-dir', text: 'abweichungsanalyse/' }, tree);
  var view = el('div', { class: 'af-view' }, grid);
  var what = el('p', { class: 'af-what' }, view);
  var pre = el('pre', { class: 'code af-code' }, view);
  var btns = [];
  FILES.forEach(function (f, i) {
    if (f.dir) { var d = el('div', { class: 'af-row af-dir', text: f.path }, tree); d.style.paddingLeft = (0.9 + f.depth * 1) + 'rem'; return; }
    var b = el('button', { type: 'button', class: 'af-row', role: 'tab', text: f.path }, tree);
    b.style.paddingLeft = (0.9 + (f.depth + 0) * 1) + 'rem';
    b.addEventListener('click', function () { show(i); });
    btns.push({ b: b, i: i });
  });
  function show(i) {
    btns.forEach(function (x) { x.b.setAttribute('aria-selected', String(x.i === i)); });
    what.innerHTML = '<b>' + FILES[i].path.split('/').pop() + '</b> ' + FILES[i].what;
    pre.textContent = FILES[i].body;
  }
  show(0);
});

/* ---- pfc-28-checklist.js ---- */
App.widget('checklist', function (root) {
  var el = App.el;
  var items = root.querySelectorAll('.check-list li');
  if (!items.length) return;
  root.classList.add('w');
  var foot = el('div', { class: 'ck-foot' }, root);
  var bar = el('div', { class: 'ck-bar' }, foot), fill = el('span', {}, bar);
  var count = el('span', { class: 'ck-count' }, foot);
  function render() {
    var n = root.querySelectorAll('.check-list li.done').length;
    fill.style.width = (n / items.length * 100) + '%';
    count.textContent = n === items.length ? 'Alle ' + n + ' Punkte erfüllt' : n + ' / ' + items.length + ' erfüllt';
  }
  for (var i = 0; i < items.length; i++) (function (li) {
    li.setAttribute('role', 'checkbox'); li.setAttribute('aria-checked', 'false'); li.tabIndex = 0;
    function toggle() { var on = li.classList.toggle('done'); li.setAttribute('aria-checked', String(on)); render(); }
    li.addEventListener('click', function (e) { if (e.target.closest('a')) return; toggle(); });
    li.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
  })(items[i]);
  render();
});

/* ---- ull-01-next-word.js ---- */
App.widget('next-word', function (root, ctx) {
  var el = App.el, T = function (en, de) { return ctx.t({ en: en, de: de }); };
  var SEQ = {
    en: [
      { prompt: 'The capital of Switzerland is', steps: [
        [[' Bern', .71], [' not', .09], [' Zurich', .08], [' a', .05], [' located', .03]], 0,
        [[',', .44], ['.', .31], [' —', .08], [' (', .07], [' and', .05]], 0,
        [[' not', .52], [' which', .16], [' although', .11], [' a', .08], [' but', .06]], 0,
        [[' Zurich', .83], [' Geneva', .09], [' Basel', .03], [' the', .02], [' Bern', .01]], 0,
        [['.', .62], [',', .21], [' —', .07], [' as', .05], [' (', .03]], 0,
        [[' Many', .28], [' Bern', .22], [' The', .18], [' Although', .12], [' It', .09]], 0,
        [[' people', .77], [' visitors', .09], [' tourists', .06], [' Swiss', .04], [' assume', .02]], 0,
        [[' assume', .34], [' think', .31], [' believe', .19], [' are', .07], [' mistakenly', .05]], 1
      ] },
      { prompt: 'Once upon a time', steps: [
        [[',', .58], [' there', .31], [' in', .06], [' a', .03], [' the', .01]], 0,
        [[' there', .66], [' in', .19], [' a', .08], [' long', .03], [' far', .02]], 0,
        [[' was', .71], [' lived', .24], [' were', .03], [' existed', .01], [' stood', .01]], 1,
        [[' a', .87], [' an', .09], [' two', .02], [' the', .01], [' three', .01]], 0,
        [[' young', .14], [' king', .13], [' little', .12], [' poor', .11], [' girl', .09]], 3,
        [[' farmer', .32], [' fisherman', .21], [' woodcutter', .15], [' miller', .11], [' widow', .08]], 3,
        [[' who', .58], [' with', .17], [' named', .09], [' and', .06], ['.', .04]], 0,
        [[' had', .63], [' lived', .19], [' owned', .07], [' was', .05], [' could', .03]], 0
      ] },
      { prompt: 'To bake bread, you need', steps: [
        [[' flour', .61], [' four', .11], [' only', .07], [' three', .06], [' a', .05]], 0,
        [[',', .79], [' and', .11], ['.', .05], [' (', .02], [' –', .02]], 0,
        [[' water', .66], [' yeast', .21], [' salt', .09], [' sugar', .02], [' eggs', .01]], 0,
        [[',', .81], [' and', .13], ['.', .03], [' salt', .02], [' yeast', .01]], 0,
        [[' yeast', .47], [' salt', .44], [' sugar', .04], [' time', .03], [' butter', .01]], 1,
        [[' and', .71], [',', .24], ['.', .03], [' plus', .01], [' –', .01]], 0,
        [[' yeast', .88], [' time', .05], [' patience', .03], [' heat', .02], [' sugar', .01]], 0,
        [['.', .55], [',', .18], [' —', .12], [' (', .08], [' or', .04]], 0
      ] }
    ],
    de: [
      { prompt: 'Die Hauptstadt der Schweiz ist', steps: [
        [[' Bern', .74], [' nicht', .08], [' Zürich', .07], [' eine', .04], [' seit', .03]], 0,
        [[',', .41], ['.', .35], [' –', .09], [' (', .06], [' und', .05]], 0,
        [[' nicht', .55], [' obwohl', .13], [' auch', .10], [' die', .08], [' aber', .05]], 0,
        [[' Zürich', .85], [' Genf', .08], [' Basel', .03], [' Bern', .02], [' die', .01]], 0,
        [['.', .60], [',', .22], [' –', .08], [' wie', .05], [' (', .03]], 0,
        [[' Viele', .30], [' Bern', .20], [' Das', .17], [' Obwohl', .12], [' Die', .10]], 0,
        [[' Menschen', .50], [' Leute', .25], [' Touristen', .10], [' glauben', .08], [' Schweizer', .04]], 0,
        [[' glauben', .36], [' denken', .31], [' nehmen', .14], [' wissen', .08], [' vermuten', .05]], 0
      ] },
      { prompt: 'Es war einmal', steps: [
        [[' ein', .56], [' eine', .32], [' vor', .06], [',', .03], [' in', .02]], 1,
        [[' alte', .17], [' arme', .15], [' kleine', .13], [' Königin', .11], [' schöne', .09]], 1,
        [[' Müllerin', .27], [' Witwe', .22], [' Bäuerin', .18], [' Frau', .15], [' Fischerin', .07]], 0,
        [[',', .72], [' die', .15], [' mit', .06], ['.', .03], [' und', .02]], 0,
        [[' die', .83], [' deren', .07], [' und', .05], [' welche', .03], [' mit', .01]], 0,
        [[' drei', .24], [' eine', .19], [' einen', .17], [' zwei', .13], [' am', .08]], 0,
        [[' Söhne', .44], [' Töchter', .38], [' Kinder', .12], [' Ziegen', .03], [' Kühe', .02]], 1,
        [[' hatte', .79], [' besass', .09], [' liebte', .05], [' grossz', .04], [' aufzog', .02]], 0
      ] },
      { prompt: 'Für ein Brot braucht man', steps: [
        [[' Mehl', .63], [' nur', .12], [' vier', .07], [' drei', .05], [' eigentlich', .04]], 0,
        [[',', .77], [' und', .13], ['.', .05], [' Wasser', .03], [' (', .01]], 0,
        [[' Wasser', .68], [' Hefe', .19], [' Salz', .09], [' Zucker', .02], [' Eier', .01]], 0,
        [[',', .80], [' und', .14], ['.', .03], [' Salz', .02], [' Hefe', .01]], 0,
        [[' Salz', .46], [' Hefe', .45], [' Zucker', .04], [' Zeit', .03], [' Butter', .01]], 0,
        [[' und', .73], [',', .22], ['.', .03], [' sowie', .01], [' plus', .01]], 0,
        [[' Hefe', .86], [' Zeit', .06], [' Geduld', .04], [' Wärme', .02], [' Zucker', .01]], 0,
        [['.', .53], [',', .20], [' –', .13], [' (', .08], [' oder', .05]], 0
      ] }
    ]
  };
  var state = { seq: 0, step: 0, phase: 0, playing: !ctx.reduced, timer: null, tokens: [] };
  var ui = {};

  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  ui.select = el('select', { class: 'nw-select', 'aria-label': 'Prompt' }, ctl);
  ui.select.style.cssText = 'font:inherit;padding:0.4rem 0.6rem;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink)';
  ui.play = el('button', { class: 'btn', type: 'button' }, ctl);
  ui.stepBtn = el('button', { class: 'btn secondary', type: 'button' }, ctl);
  ui.reset = el('button', { class: 'btn secondary', type: 'button' }, ctl);
  ui.text = el('div', { class: 'nw-text', 'aria-live': 'polite' }, root);
  ui.bars = el('div', { class: 'bars' }, root);
  ui.hint = el('div', { class: 'hint' }, root);

  function seqs() { return SEQ[ctx.lang()]; }
  function cur() { return seqs()[state.seq]; }

  function labels() {
    ui.play.textContent = state.playing ? T('Pause', 'Pause') : T('Play', 'Abspielen');
    ui.stepBtn.textContent = T('Step', 'Schritt');
    ui.reset.textContent = T('Restart', 'Neu starten');
    ui.hint.textContent = T('Each bar is one candidate for the next token; the highlighted one is chosen. Note that the choice is not always the most likely token (chapter 12).',
      'Jeder Balken ist ein Kandidat für das nächste Token; der hervorgehobene wird gewählt. Die Wahl fällt nicht immer auf das wahrscheinlichste Token.');
    ui.select.innerHTML = '';
    seqs().forEach(function (s, i) { var o = el('option', { value: i, text: s.prompt + ' …' }, ui.select); if (i === state.seq) o.selected = true; });
  }

  function renderText() {
    ui.text.innerHTML = '';
    el('span', { class: 'nw-prompt', text: cur().prompt }, ui.text);
    state.tokens.forEach(function (t, i) { el('span', { class: 'nw-tok' + (i === state.tokens.length - 1 && state.phase === 2 ? ' new' : ''), text: t }, ui.text); });
    el('span', { class: 'caret', 'aria-hidden': 'true' }, ui.text);
  }

  function renderBars(cands, hit) {
    ui.bars.innerHTML = '';
    cands.forEach(function (c, i) {
      var h = (i === hit) ? ' hit' : '';
      el('div', { class: 'bt' + h, text: c[0] === ',' || c[0] === '.' ? c[0] : c[0] }, ui.bars);
      var bb = el('div', { class: 'bb' }, ui.bars);
      var sp = el('span', { class: h.trim() }, bb);
      el('div', { class: 'bp' + h, text: Math.round(c[1] * 100) + ' %' }, ui.bars);
      requestAnimationFrame(function () { sp.style.width = (c[1] * 100) + '%'; });
    });
  }

  function reset(seqIndex) {
    clearTimeout(state.timer);
    state.seq = seqIndex == null ? state.seq : seqIndex;
    state.step = 0; state.phase = 0; state.tokens = [];
    renderText(); ui.bars.innerHTML = '';
    schedule(300);
  }

  // phases: 0 = show candidates, 1 = highlight pick, 2 = append
  function tick() {
    var s = cur(); var steps = s.steps;
    if (state.step * 2 >= steps.length) { // finished: restart after pause
      state.phase = 3;
      if (state.playing) schedule(2600, function () { reset(); });
      return;
    }
    var cands = steps[state.step * 2], pick = steps[state.step * 2 + 1];
    if (state.phase === 0) { renderBars(cands, -1); state.phase = 1; schedule(ctx.reduced ? 500 : 900); }
    else if (state.phase === 1) { renderBars(cands, pick); state.phase = 2; schedule(600); }
    else { state.tokens.push(cands[pick][0]); renderText(); state.step++; state.phase = 0; schedule(700); }
  }
  function schedule(ms, fn) {
    clearTimeout(state.timer);
    if (!state.playing && !fn) return;
    state.timer = setTimeout(function () { if (!ctx.active()) { schedule(ms, fn); return; } (fn || tick)(); }, ms);
  }

  ui.play.addEventListener('click', function () { state.playing = !state.playing; labels(); if (state.playing) schedule(200); else clearTimeout(state.timer); });
  ui.stepBtn.addEventListener('click', function () { state.playing = false; labels(); clearTimeout(state.timer); if (state.phase === 3) reset(); else tick(); });
  ui.reset.addEventListener('click', function () { reset(); });
  ui.select.addEventListener('change', function () { reset(parseInt(ui.select.value, 10)); });
  ctx.onLang(function () { labels(); reset(0); });

  labels();
  reset(0);
  if (!state.playing) { tick(); }
});

/* ---- ull-12-sampling.js ---- */
App.widget('sampling', function (root, ctx) {
  var el = App.el, T = function (en, de) { return ctx.t({ en: en, de: de }); };
  var C = {
    en: { prompt: 'The best thing about Zurich is the', cands: [[' lake', 2.3], [' view', 1.6], [' food', 1.2], [' public', 0.9], [' old', 0.6], [' chocolate', 0.2], [' nightlife', -0.1], [' weather', -0.9]] },
    de: { prompt: 'Das Schönste an Zürich ist der', cands: [[' See', 2.3], [' Blick', 1.6], [' Fluss', 1.0], [' Zoo', 0.8], [' Herbst', 0.5], [' Käse', 0.1], [' Verkehr', -0.4], [' Regen', -0.9]] }
  };
  var state = { temp: 0.8, draws: [] };
  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  var lab = el('label', {}, ctl); var tl = el('span', {}, lab); var rng = el('input', { type: 'range', min: 0, max: 200, value: 80, 'aria-label': 'temperature' }, lab); var tv = el('span', { class: 'sp-temp' }, lab);
  var bS = el('button', { class: 'btn', type: 'button' }, ctl);
  var bC = el('button', { class: 'btn secondary', type: 'button' }, ctl);
  var wrap = el('div', { class: 'sp-wrap' }, root);
  var left = el('div', {}, wrap), right = el('div', { class: 'sp-out' }, wrap);
  var prompt = el('div', { class: 'sp-prompt' }, left);
  var bars = el('div', { class: 'bars' }, left);
  var k = el('div', { class: 'k' }, right); var draws = el('div', { class: 'draws' }, right); var summary = el('div', { class: 'small muted' }, right); summary.style.marginTop = '0.75rem';
  var barEls = [];
  function probs() {
    var c = C[ctx.lang()].cands, t = Math.max(state.temp, 0.02);
    var ex = c.map(function (x) { return Math.exp(x[1] / t); }), s = ex.reduce(function (a, b) { return a + b; }, 0);
    return ex.map(function (v) { return v / s; });
  }
  function build() {
    var c = C[ctx.lang()];
    prompt.innerHTML = ''; el('b', { text: c.prompt }, prompt); prompt.appendChild(document.createTextNode(' …'));
    bars.innerHTML = ''; barEls = [];
    c.cands.forEach(function (x) { el('div', { class: 'bt', text: x[0] }, bars); var bb = el('div', { class: 'bb' }, bars); var sp = el('span', {}, bb); var bp = el('div', { class: 'bp' }, bars); barEls.push({ sp: sp, bp: bp }); });
    update();
  }
  function update() {
    var p = probs();
    barEls.forEach(function (b, i) { b.sp.style.width = (p[i] * 100) + '%'; b.bp.textContent = (p[i] < 0.005 ? '< 1' : Math.round(p[i] * 100)) + ' %'; });
    tv.textContent = (state.temp).toFixed(1).replace('.', ctx.lang() === 'de' ? ',' : '.');
    tl.textContent = T('Temperature', 'Temperatur');
    bS.textContent = T('Draw 10 times', '10-mal ziehen'); bC.textContent = T('Clear', 'Leeren');
    k.textContent = T('Draws', 'Züge');
    renderDraws();
  }
  function renderDraws() {
    draws.innerHTML = '';
    var c = C[ctx.lang()].cands;
    state.draws.forEach(function (i, n) { var d = el('span', { class: 'draw' + (i >= 4 ? ' rare' : ''), text: c[i][0].trim() }, draws); d.style.animationDelay = (n * 40) + 'ms'; });
    if (!state.draws.length) { summary.textContent = T('Each draw picks one token at random, weighted by the bars.', 'Jeder Zug wählt zufällig ein Token, gewichtet nach den Balken.'); return; }
    var counts = {}; state.draws.forEach(function (i) { counts[i] = (counts[i] || 0) + 1; });
    var parts = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).map(function (i) { return c[i][0].trim() + ' ×' + counts[i]; });
    summary.textContent = parts.join(' · ') + (state.temp <= 0.05 ? ' — ' + T('always the same at temperature 0', 'bei Temperatur 0 immer dasselbe') : '');
  }
  function draw() {
    var p = probs();
    for (var n = 0; n < 10; n++) { var r = Math.random(), acc = 0, pick = 0; for (var i = 0; i < p.length; i++) { acc += p[i]; if (r <= acc) { pick = i; break; } } state.draws.push(pick); }
    if (state.draws.length > 40) state.draws = state.draws.slice(-40);
    renderDraws();
  }
  rng.addEventListener('input', function () { state.temp = rng.value / 100; update(); });
  bS.addEventListener('click', draw); bC.addEventListener('click', function () { state.draws = []; renderDraws(); });
  ctx.onLang(function () { state.draws = []; build(); });
  build();
  if (!ctx.reduced) setTimeout(function () { if (ctx.active() && !state.draws.length) draw(); }, 1200);
});

/* ---- ull-13-hallucination.js ---- */
App.widget('hallucination', function (root, ctx) {
  var el = App.el, T = function (en, de) { return ctx.t({ en: en, de: de }); };
  var C = {
    en: { pre: 'The 2019 study by ', fake: 'Dr. Müller on glacier retreat in Valais', post: ' was published in …', note: 'This study does not exist. The model has to continue anyway.',
      guess: [[' Nature', .31], [' the Journal of Glaciology', .24], [' Science', .14], [' Geophysical Research Letters', .11], [' I don’t know', .03]],
      honest: [[' I don’t know', .58], [' Nature', .14], [' the Journal of Glaciology', .11], [' Science', .07], [' Geophysical Research Letters', .05]],
      rules: ['Right = 1, wrong = 0, “I don’t know” = 0', 'Right = 1, wrong = −1, “I don’t know” = 0'],
      rows: ['Guess (right 20 % of the time)', 'Say “I don’t know”'], why: ['Guessing scores higher on average, so training pushes the model to guess.', 'Now honesty scores higher — the model learns to admit uncertainty.'], hdr: 'Expected score per question', rule: 'Scoring rule used in training and tests' },
    de: { pre: 'Die Studie von ', fake: 'Dr. Müller (2019) zum Gletscherschwund im Wallis', post: ' erschien in …', note: 'Diese Studie gibt es nicht. Das Modell muss trotzdem weiterschreiben.',
      guess: [[' Nature', .31], [' dem Journal of Glaciology', .24], [' Science', .14], [' den Geophysical Research Letters', .11], [' Ich weiss es nicht', .03]],
      honest: [[' Ich weiss es nicht', .58], [' Nature', .14], [' dem Journal of Glaciology', .11], [' Science', .07], [' den Geophysical Research Letters', .05]],
      rules: ['Richtig = 1, falsch = 0, «Ich weiss es nicht» = 0', 'Richtig = 1, falsch = −1, «Ich weiss es nicht» = 0'],
      rows: ['Raten (in 20 % der Fälle richtig)', '«Ich weiss es nicht» sagen'], why: ['Raten bringt im Schnitt mehr Punkte – das Training treibt das Modell zum Raten.', 'Jetzt bringt Ehrlichkeit mehr Punkte – das Modell lernt, Unsicherheit zuzugeben.'], hdr: 'Erwartete Punkte pro Frage', rule: 'Bewertungsregel in Training und Tests' }
  };
  var state = { rule: 0 };
  root.classList.add('w');
  var prompt = el('div', { class: 'ha-prompt' }, root); var note = el('div', { class: 'ha-note' }, root);
  var ctl = el('div', { class: 'ctl' }, root); var rl = el('span', {}, ctl); var seg = el('div', { class: 'seg', role: 'group' }, ctl);
  var b0 = el('button', { type: 'button', 'aria-pressed': 'true' }, seg), b1 = el('button', { type: 'button', 'aria-pressed': 'false' }, seg);
  var wrap = el('div', { class: 'ha-wrap' }, root);
  var bars = el('div', { class: 'bars' }, wrap);
  var rule = el('div', { class: 'ha-rule' }, wrap);
  function render(animate) {
    var c = C[ctx.lang()];
    prompt.innerHTML = ''; prompt.appendChild(document.createTextNode(c.pre)); el('span', { class: 'fake', text: c.fake }, prompt); prompt.appendChild(document.createTextNode(c.post));
    note.textContent = c.note; rl.textContent = c.rule + ':'; b0.textContent = c.rules[0]; b1.textContent = c.rules[1];
    b0.setAttribute('aria-pressed', String(state.rule === 0)); b1.setAttribute('aria-pressed', String(state.rule === 1));
    var list = state.rule === 0 ? c.guess : c.honest;
    var byName = {}; list.forEach(function (x) { byName[x[0]] = x[1]; });
    // keep a stable order: order of the guess list, so bars move rather than jump
    var order = c.guess.map(function (x) { return x[0]; });
    bars.innerHTML = '';
    order.forEach(function (name) {
      var p = byName[name] || 0.01, idk = name === c.guess[4][0];
      el('div', { class: 'bt' + (idk ? ' hit' : ''), text: name }, bars);
      var bb = el('div', { class: 'bb' }, bars); var sp = el('span', { class: idk ? 'hit' : '' }, bb);
      el('div', { class: 'bp' + (idk ? ' hit' : ''), text: Math.round(p * 100) + ' %' }, bars);
      requestAnimationFrame(function () { sp.style.width = (p * 100) + '%'; });
    });
    var g = state.rule === 0 ? 0.2 : (0.2 - 0.8), a = 0;
    rule.innerHTML = '';
    el('h4', { text: c.hdr }, rule);
    var tb = el('table', {}, rule);
    var r1 = el('tr', { class: g > a ? 'win' : '' }, tb); el('td', { text: c.rows[0] }, r1); el('td', { text: (g > 0 ? '+' : '') + g.toFixed(2).replace('.', ctx.lang() === 'de' ? ',' : '.') }, r1);
    var r2 = el('tr', { class: a >= g ? 'win' : '' }, tb); el('td', { text: c.rows[1] }, r2); el('td', { text: '0' }, r2);
    el('p', { class: 'why', text: c.why[state.rule] }, rule);
  }
  b0.addEventListener('click', function () { state.rule = 0; render(true); }); b1.addEventListener('click', function () { state.rule = 1; render(true); });
  ctx.onLang(function () { render(false); });
  render(false);
});

/* ---- ull-16-agents.js ---- */
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
