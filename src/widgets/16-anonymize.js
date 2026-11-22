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
