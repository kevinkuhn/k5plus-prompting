App.widget('prompt-levels', function (root) {
  var el = App.el;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  // [text, css class] segments; class c = highlighted addition of this level, m = muted
  var LEVELS = [
    { name: 'Einfach', title: 'Stufe 1 · Der einfache Prompt',
      prompt: [['Beantworte die angehängte Anfrage aus dem Kontaktformular.', '']],
      head: 'Typisches Resultat', good: false,
      items: ['allgemeiner, langer Text', 'rät das Amt und rechnet Fristen selbst – evtl. falsch', 'erfindet plausible Gebühren und Abläufe', 'Form und Ton jedes Mal anders'],
      note: 'So beginnen die meisten. Für eine schnelle erste Einschätzung reicht das – für eine Antwort an eine Einwohnerin nicht.' },
    { name: 'Strukturiert', title: 'Stufe 2 · Der strukturierte Prompt',
      prompt: [['Anweisung:', 'c'], [' Ordne die Anfrage dem zuständigen Amt zu und entwirf eine Antwort.\n', ''], ['Kontext:', 'c'], [' Wir sind die Kanzlei einer Schweizer Gemeinde. Angehängt ist eine Anfrage aus dem Kontaktformular. Ämter: Steueramt, Bauverwaltung, Einwohnerdienste, Sozialdienst, Werkhof.\n', ''], ['Form:', 'c'], [' Zuerst das Amt in einer Zeile, dann max. 5 Sätze in Sie-Form, sachlich, keine Spekulation.', '']],
      head: 'Was sich ändert', good: true,
      items: ['Ton und Perspektive passen', 'Länge und Form sind steuerbar', 'Fokus auf das Wesentliche'],
      bad: ['Noch offen: Zuständigkeit und Fakten'],
      note: 'Merkhilfe: Anweisung · Kontext · Form.' },
    { name: 'Fortgeschritten', title: 'Stufe 3 · Der fortgeschrittene Prompt',
      prompt: [['[Anweisung, Kontext, Form wie Stufe 2]\n', 'm'], ['Gehe Schritt für Schritt vor:\n', 'c'], ['1. Bestimme das Amt nur anhand von <zuständigkeiten>.\n', ''], ['2. Übernimm Fristen und Gebühren nur aus <merkblatt> – rechne nicht selbst.\n', 'c'], ['3. Gib eine Auskunft nur, wenn sie in <merkblatt> steht,\n   sonst: «Angabe offen – Rückfrage beim Amt».\n', 'c'], ['Beispiel:', 'c'], [' «Zuständig: Werkhof. Sperrgut holen wir nur auf Anmeldung\n   ab. Zu den Kosten meldet sich der Werkhof bei Ihnen.»\n', ''], ['Prüfe zum Schluss: Steht jede Aussage in <merkblatt>?\n', 'c'], ['<anfrage> … </anfrage> <zuständigkeiten> … </zuständigkeiten>\n<merkblatt> … </merkblatt>', 'c']],
      head: 'Neu auf dieser Stufe', good: true,
      items: ['Schritte vorgeben', 'Regeln gegen Rechnen und Erfinden', 'Beispiel der gewünschten Antwort', 'Daten abgrenzen mit Markierungen', 'Selbstprüfung am Ende'],
      note: 'Diese Techniken sind gut erforscht.' },
    { name: 'Instruktion', title: 'Stufe 4 · Die Agenten-Instruktion',
      prompt: [['# ZWECK\n', 'c'], ['Anfragen aus dem Kontaktformular zuweisen, Antwort entwerfen.\n', ''], ['# REGELN\n', 'c'], ['- Amt nur aus Tool «Zuständigkeit_nachschlagen».\n- Keine Auskunft erfinden; Lücken als offen markieren.\n- Schweizer Rechtschreibung (ss, kein Eszett), Sie-Form, sachlich.\n', ''], ['# ABLAUF\n', 'c'], ['1. Neue Anfrage aus dem Kontaktformular lesen.\n2. «Zuständigkeit_nachschlagen» aufrufen (fünf Ämter).\n3. Auskunft in den Merkblättern des Amts suchen.\n4. Entwurf an Sachbearbeitung zur Freigabe, nie direkt versenden.\n', ''], ['# AUSGABE\n', 'c'], ['Amt + Antwort mit max. 5 Sätzen (siehe Beispiel).\n', ''], ['# SELBSTPRÜFUNG\n', 'c'], ['Jede Aussage mit Merkblatt und Tool-Resultat abgleichen.', '']],
      head: 'Neu auf dieser Stufe', good: true,
      items: ['Dauerhaft hinterlegt statt jedes Mal getippt – gilt für jeden Lauf', 'Benennt Werkzeuge, Wissensquellen und Grenzen ausdrücklich', 'Gegliedert in Markdown'],
      note: '«Zuständigkeit_nachschlagen» ist ein Werkzeug, das separat gebaut wird – je Plattform anders.' }
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
