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
