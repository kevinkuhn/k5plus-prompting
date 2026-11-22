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
