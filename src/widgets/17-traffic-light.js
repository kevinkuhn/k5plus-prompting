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
