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
