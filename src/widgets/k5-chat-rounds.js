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
