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
