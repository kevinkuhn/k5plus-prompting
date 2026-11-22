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
