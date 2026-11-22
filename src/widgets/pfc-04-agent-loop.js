App.widget('agent-loop', function (root, ctx) {
  var el = App.el;
  // Illustrative run of the variance agent: per round a thought, a tool call and an observation.
  // ctxAdd = tokens the round adds to the context (tool results etc.), illustrative.
  var ROUNDS = [
    { think: 'Ich brauche die Budget-vs.-Ist-Datei für September.', act: 'Werkzeug «Datei lesen»: BvI_2026-09.xlsx', obs: '6 Positionen geladen, Werte in TCHF.', ctxAdd: 6000 },
    { think: 'Abweichungen nicht selbst rechnen – das Werkzeug aufrufen.', act: 'Werkzeug «Abweichungen_berechnen» (5 % / 50 TCHF)', obs: 'Über beiden Schwellen: Marketing +190 (+30.6 %). EBIT −720 (−38.9 %).', ctxAdd: 4000 },
    { think: 'Ursache für Marketing in den Kommentaren suchen.', act: 'Werkzeug «Kommentare durchsuchen»: Kostenstelle Marketing', obs: '«Messe vom Q4 ins Q3 vorgezogen.»', ctxAdd: 9000 },
    { think: 'Der Umsatz treibt das EBIT – gibt es dazu einen Kommentar?', act: 'Werkzeug «Kommentare durchsuchen»: Vertrieb', obs: 'Kein Kommentar gefunden → «Ursache offen – Rückfrage Kostenstelle».', ctxAdd: 8000 },
    { think: 'Entwurf schreiben, dann jede Zahl prüfen.', act: 'Selbstprüfung: Zahlen mit dem Werkzeug-Resultat abgleichen', obs: 'Alle Zahlen stimmen mit dem Werkzeug-Resultat überein.', ctxAdd: 5000 }
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
    if (step === -1) { el('b', { text: 'Start' }, now); now.appendChild(document.createTextNode('Neue Datei «BvI_2026-09.xlsx» in SharePoint. Der Agent erhält Instruktion und Auftrag.')); }
    else if (step === last) { el('b', { text: 'Ergebnis' }, now); now.appendChild(document.createTextNode('Entwurf mit Tabelle und Kommentaren an die Controllerin zur Freigabe – nie direkt an die GL.')); }
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
