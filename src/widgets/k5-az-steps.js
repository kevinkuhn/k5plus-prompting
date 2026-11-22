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
  var TOOL = { B: 1, E: 1, F: 1, K: 1 };  // hier passt ein anderes Werkzeug besser
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
    el('i', { class: 'az-tool' + (TOOL[l] ? ' on' : ''), text: TOOL[l] ? '✳' : '' }, s);
    el('b', { text: l }, s);
    el('i', { class: 'az-eye' + (EYE[l] ? ' on' : ''), html: EYE[l] ? EYE_SVG : '' }, s);
  });
  el('b', { class: 'az-end', text: 'Z' }, track);
  var legend = el('p', { class: 'az-legend' }, wrap);
  legend.innerHTML = '<span><i class="az-tool on">✳</i> anderes Werkzeug oder neues Gespräch</span><span><i class="az-eye on">' + EYE_SVG + '</i> hier prüft ein Mensch</span>';
  var note = el('p', { class: 'callout' }, wrap);

  function render() {
    wrap.classList.toggle('split', state === 1);
    b0.setAttribute('aria-pressed', state === 0 ? 'true' : 'false');
    b1.setAttribute('aria-pressed', state === 1 ? 'true' : 'false');
    note.innerHTML = state === 0
      ? '<b>Von A nach Z in einem Schritt.</b> So klingt der Wunsch. Die Aufgabe ist aber zu gross und zu vage: Das Modell muss raten, was gemeint ist, und niemand kann das Ergebnis prüfen.'
      : '<b>Aus jeder grossen Aufgabe wird ein kleiner, prüfbarer Schritt.</b> Viele kleine Schritte führen ans Ziel, und zwischen den Schritten schaust du hin.';
  }
  b0.addEventListener('click', function () { state = 0; render(); });
  b1.addEventListener('click', function () { state = 1; render(); });
  render();
});
