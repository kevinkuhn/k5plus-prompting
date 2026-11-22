App.widget('prompt-levels', function (root) {
  var el = App.el;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  // [text, css class] segments; class c = highlighted addition of this level, m = muted
  var LEVELS = [
    { name: 'Einfach', title: 'Stufe 1 · Der einfache Prompt',
      prompt: [['Erkläre mir die Abweichungen in der angehängten Tabelle.', '']],
      head: 'Typisches Resultat', good: false,
      items: ['allgemeiner, langer Text', 'rechnet Prozente selbst – evtl. falsch', 'erfindet plausible Ursachen', 'Form und Ton jedes Mal anders'],
      note: 'So beginnen die meisten. Für eine schnelle erste Einschätzung reicht das – für einen Bericht an die Geschäftsleitung nicht.' },
    { name: 'Strukturiert', title: 'Stufe 2 · Der strukturierte Prompt',
      prompt: [['Rolle:', 'c'], [' Du bist Controller eines Schweizer Industrie-KMU.\n', ''], ['Kontext:', 'c'], [' Angehängt ist Budget vs. Ist September 2026 in TCHF.\n', ''], ['Aufgabe:', 'c'], [' Kommentiere die drei grössten Abweichungen für die Geschäftsleitung.\n', ''], ['Format:', 'c'], [' Je Abweichung max. 3 Sätze, sachlich, keine Spekulation.', '']],
      head: 'Was sich ändert', good: true,
      items: ['Fachsprache und Perspektive passen', 'Länge und Form sind steuerbar', 'Fokus auf das Wesentliche'],
      bad: ['Noch offen: Zahlen und Ursachen'],
      note: 'Merkhilfe: Rolle · Kontext · Aufgabe · Format.' },
    { name: 'Fortgeschritten', title: 'Stufe 3 · Der fortgeschrittene Prompt',
      prompt: [['[Rolle, Kontext, Aufgabe wie Stufe 2]\n', 'm'], ['Gehe Schritt für Schritt vor:\n', 'c'], ['1. Wähle Positionen mit |Abw.| > 5 % UND > 50 TCHF.\n', ''], ['2. Übernimm Werte nur aus Spalte «Abw.» – rechne nicht selbst.\n', 'c'], ['3. Nenne eine Ursache nur, wenn sie in <kommentare> steht,\n   sonst: «Ursache offen – Rückfrage Kostenstelle».\n', 'c'], ['Beispiel:', 'c'], [' «Marketing +190 TCHF (+30.6 %): Messe vom Q4 ins Q3\n   vorgezogen; Verschiebung, kein Mehraufwand im Jahr.»\n', ''], ['Prüfe zum Schluss: Stimmt jede Zahl mit <daten> überein?\n', 'c'], ['<daten> … </daten> <kommentare> … </kommentare>', 'c']],
      head: 'Neu auf dieser Stufe', good: true,
      items: ['Schritte vorgeben', 'Regeln gegen Rechnen und Erfinden', 'Beispiel der gewünschten Antwort', 'Daten abgrenzen mit Markierungen', 'Selbstprüfung am Ende'],
      note: 'Diese Techniken sind gut erforscht – mehr in Kapitel 15.' },
    { name: 'Instruktion', title: 'Stufe 4 · Die Agenten-Instruktion',
      prompt: [['# ZWECK\n', 'c'], ['Monatlicher Kommentar Budget vs. Ist für die GL.\n', ''], ['# REGELN\n', 'c'], ['- Zahlen nur aus Tool «Abweichungen_berechnen».\n- Keine Ursache erfinden; Lücken als offen markieren.\n- Schweizer Rechtschreibung (ss statt ß), sachlich.\n', ''], ['# ABLAUF\n', 'c'], ['1. Datei «BvI_<Monat>.xlsx» aus SharePoint laden.\n2. «Abweichungen_berechnen» aufrufen (5 % / 50 TCHF).\n3. Ursachen in Kostenstellen-Kommentaren suchen.\n4. Entwurf an Controller zur Freigabe, nie direkt an GL.\n', ''], ['# AUSGABE\n', 'c'], ['Tabelle + max. 3 Sätze je Position (siehe Beispiel).\n', ''], ['# SELBSTPRÜFUNG\n', 'c'], ['Jede Zahl mit dem Tool-Resultat abgleichen.', '']],
      head: 'Neu auf dieser Stufe', good: true,
      items: ['Dauerhaft hinterlegt statt jedes Mal getippt – gilt für jeden Lauf', 'Benennt Werkzeuge, Wissensquellen und Grenzen ausdrücklich', 'Gegliedert in Markdown'],
      note: '«Abweichungen_berechnen» ist ein Werkzeug, das separat gebaut wird – je Plattform anders.' }
  ];
  var cur = 0;
  root.classList.add('w', 'pl');
  function block(parent) {
    var b = { title: el('p', { class: 'k accent' }, parent) };
    var grid = el('div', { class: 'pl-grid' }, parent);
    b.pre = el('div', { class: 'code pl-code', 'aria-live': 'polite' }, grid);
    b.side = el('div', { class: 'pl-side' }, grid);
    return b;
  }
  function fill(b, L) {
    b.title.textContent = L.title;
    b.pre.innerHTML = L.prompt.map(function (p) { return p[1] ? '<span class="' + p[1] + '">' + esc(p[0]) + '</span>' : esc(p[0]); }).join('');
    b.side.innerHTML = '';
    el('p', { class: 'k', text: L.head }, b.side);
    var ul = el('ul', { class: 'ticks' + (L.good ? '' : ' bad') }, b.side);
    L.items.forEach(function (t) { el('li', { text: t }, ul); });
    if (L.bad) { var ub = el('ul', { class: 'ticks bad' }, b.side); L.bad.forEach(function (t) { el('li', { text: t }, ub); }); }
    el('p', { class: 'pl-note', text: L.note }, b.side);
  }
  if (App.mode === 'print') { // PDF: all four levels one below the other
    LEVELS.forEach(function (L) { fill(block(el('div', { class: 'pl-print' }, root)), L); });
    return;
  }
  var seg = el('div', { class: 'seg pl-seg', role: 'group', 'aria-label': 'Stufe' }, root);
  var btns = LEVELS.map(function (L, i) {
    var b = el('button', { type: 'button', 'aria-pressed': String(i === cur) }, seg);
    b.innerHTML = '<span class="pl-n">' + (i + 1) + '</span><span class="pl-name">' + L.name + '</span>';
    b.addEventListener('click', function () { cur = i; render(); });
    return b;
  });
  var meter = el('div', { class: 'pl-meter', 'aria-hidden': 'true' }, root);
  var segs = LEVELS.map(function () { return el('span', {}, meter); });
  var main = block(root);
  function render() {
    btns.forEach(function (b, i) { b.setAttribute('aria-pressed', String(i === cur)); });
    segs.forEach(function (s, i) { s.classList.toggle('on', i <= cur); });
    fill(main, LEVELS[cur]);
  }
  render();
});
