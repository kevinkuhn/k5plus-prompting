App.widget('sensitivity', function (root, ctx) {
  var el = App.el;
  var LEVELS = [
    { n: 'Unbedenklich', c: 'var(--ok)' }, { n: 'Harmlos', c: 'var(--ok)' }, { n: 'Persönlich', c: 'var(--s4)' },
    { n: 'Heikel', c: 'var(--warm)' }, { n: 'Sehr heikel', c: '#c0242a' }, { n: 'Tabu', c: '#c0242a' }
  ];
  var SETS = {
    privat: [
      { p: '«Welches E-Bike eignet sich für 15 km Arbeitsweg?»', l: 0, know: 'Du pendelst rund 15 km und überlegst eine Anschaffung. Mehr nicht.', where: ['Gespeichert beim Anbieter', 'Kann für Personalisierung und Werbung genutzt werden'] },
      { p: '«Formuliere eine Bewerbung für eine Stelle als Sachbearbeiterin.»', l: 1, know: 'Deinen Beruf, deine Qualifikationen – und dass du dich beruflich verändern willst.', where: ['Gespeichert beim Anbieter', 'Mitlesen zur Qualitätsprüfung möglich', 'Training künftiger Modelle, falls nicht abgeschaltet'] },
      { p: '«Wie kündige ich meinen Job höflich?»', l: 2, know: 'Dass du mit deiner aktuellen Stelle unzufrieden bist – bevor dein Arbeitgeber es weiss.', where: ['Gespeichert beim Anbieter', 'Teil deines Nutzerprofils', 'Training, falls nicht abgeschaltet'] },
      { p: '«Mein Mietvertrag: Darf der Vermieter …» (Vertrag eingefügt)', l: 3, know: 'Name, Adresse, Miete, Vermieter, Vertragsdetails – deine und die einer weiteren Person.', where: ['Gespeichert beim Anbieter', 'Mitlesen möglich', 'Training möglich', 'Längere Aufbewahrung, z. B. wegen Gerichtsverfahren'] },
      { p: '«Ich habe die Diagnose Multiple Sklerose erhalten – was bedeutet das?»', l: 4, know: 'Eine Gesundheitsinformation, die nach Datenschutzrecht besonders geschützt ist. Sie bleibt mit deinem Konto verknüpft.', where: ['Gespeichert beim Anbieter', 'Mitlesen möglich', 'Training möglich', 'Längere Aufbewahrung möglich'] },
      { p: '«Hier ist der Arztbericht meiner Tochter …» (Bericht eingefügt)', l: 5, know: 'Gesundheitsdaten einer dritten Person, die nicht zugestimmt hat.', where: ['Alles wie oben – nur betrifft es jemand anderen'] }
    ],
    arbeit: [
      { p: '«Formuliere einen Text zu den neuen Öffnungszeiten der Einwohnerdienste.»', l: 0, know: 'Dass du in einer Verwaltung arbeitest. Die Information ist ohnehin öffentlich.', where: ['Gespeichert beim Anbieter'] },
      { p: '«Entwurf einer Stellenausschreibung für die Sachbearbeitung Steuern.»', l: 1, know: 'Abteilung, Aufgaben, Lohnband – meist wird es ohnehin publiziert.', where: ['Gespeichert beim Anbieter', 'Mitlesen zur Qualitätsprüfung möglich'] },
      { p: '«Fasse dieses interne Sitzungsprotokoll zusammen.» (Protokoll eingefügt)', l: 2, know: 'Interne Entscheide, Namen von Mitarbeitenden, laufende Projekte – nicht für die Öffentlichkeit bestimmt.', where: ['Gespeichert beim Anbieter', 'Mitlesen möglich', 'Training möglich'] },
      { p: '«Schreibe eine Mahnung an Frau X, Rechnung 4711, CHF 2’340.»', l: 3, know: 'Name, Schuldnerin, Betrag: Personendaten einer Bürgerin, die dem Amtsgeheimnis unterstehen.', where: ['Gespeichert beim Anbieter', 'Mitlesen möglich', 'Training möglich', 'Längere Aufbewahrung möglich'] },
      { p: '«Beurteile diesen Sozialhilfe-Fall: …» (Dossier eingefügt)', l: 4, know: 'Besonders schützenswerte Daten: finanzielle Lage, Familie, oft Gesundheit. Einer Person, die sich nicht wehren kann.', where: ['Alles wie oben', 'Verletzung des Amtsgeheimnisses möglich'] },
      { p: '«Fasse das Personaldossier von Herrn Y zusammen.»', l: 5, know: 'Beurteilungen, Lohn, Absenzen, allenfalls Krankheit eines Mitarbeitenden.', where: ['Alles wie oben', 'Verletzung des Amtsgeheimnisses möglich'] }
    ]
  };
  var state = { set: 'privat', i: 0 };
  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  var seg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Beispielsatz' }, ctl);
  var bP = el('button', { type: 'button', 'aria-pressed': 'true', text: 'Privat' }, seg);
  var bA = el('button', { type: 'button', 'aria-pressed': 'false', text: 'Am Arbeitsplatz' }, seg);
  var wrap = el('div', { class: 'se-wrap' }, root);
  var ladder = el('div', { class: 'se-ladder', role: 'group', 'aria-label': 'Eingaben' }, wrap);
  var panel = el('div', { class: 'se-panel', 'aria-live': 'polite' }, wrap);
  var btns = [];
  function buildLadder() {
    ladder.innerHTML = ''; btns = [];
    SETS[state.set].forEach(function (it, i) {
      var b = el('button', { type: 'button', class: 'se-l' + it.l, 'aria-pressed': 'false' }, ladder);
      el('i', {}, b); el('span', { text: it.p }, b);
      b.addEventListener('click', function () { stopDemo(); show(i); });
      btns.push(b);
    });
  }
  function show(i) {
    state.i = i;
    var it = SETS[state.set][i], L = LEVELS[it.l];
    btns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
    panel.innerHTML = '';
    var lv = el('span', { class: 'lvl', text: L.n }, panel); lv.style.background = L.c;
    el('h4', { text: 'Was ein Fremder daraus erfährt' }, panel);
    el('p', { text: it.know }, panel);
    el('h4', { text: 'Wo es landen kann' }, panel);
    var ul = el('ul', {}, panel); it.where.forEach(function (w) { el('li', { text: w }, ul); });
    el('div', { class: 'se-meta', text: 'So, als würdest du es einer unbekannten Person erzählen – oder per E-Mail an eine fremde Firma schicken.' }, panel);
  }
  function setSet(s) { state.set = s; bP.setAttribute('aria-pressed', String(s === 'privat')); bA.setAttribute('aria-pressed', String(s === 'arbeit')); buildLadder(); show(0); }
  bP.addEventListener('click', function () { stopDemo(); setSet('privat'); });
  bA.addEventListener('click', function () { stopDemo(); setSet('arbeit'); });
  var timer = null;
  function stopDemo() { clearTimeout(timer); timer = null; }
  function demo() {
    if (ctx.reduced) return;
    var k = 1;
    function step() { if (!ctx.active()) { timer = setTimeout(step, 1500); return; } if (k >= 6) { timer = null; return; } show(k++); timer = setTimeout(step, 1800); }
    timer = setTimeout(step, 1800);
  }
  setSet('privat'); demo();
});
