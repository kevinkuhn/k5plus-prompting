App.widget('agent-folder', function (root) {
  var el = App.el;
  var FILES = [
    { path: 'CLAUDE.md', depth: 0, what: 'Die Instruktion (Stufe 4). Wird bei jedem Start automatisch geladen.',
      body: '# ZWECK\nMonatlicher Kommentar Budget vs. Ist für die GL.\n\n# REGELN\n- Zahlen nur aus scripts/abweichungen_berechnen.py.\n- Keine Ursache erfinden; Lücken als offen markieren.\n- Schweizer Rechtschreibung (ss statt ß), sachlich.\n\n# ABLAUF\n1. Datei daten/BvI_<Monat>.csv lesen.\n2. scripts/abweichungen_berechnen.py ausführen.\n3. Ursachen in den Kostenstellen-Kommentaren suchen.\n4. Entwurf als Datei ablegen – zur Freigabe, nie direkt an die GL.\n\n# SELBSTPRÜFUNG\nZum Schluss den Subagenten «pruefer» aufrufen.' },
    { path: 'daten/BvI_2026-09.csv', depth: 0, what: 'Die Eingabe: fiktive Budget- und Ist-Werte in TCHF.',
      body: 'Position;Budget;Ist\nUmsatz;12400;11860\nMaterial;4960;5020\nPersonal;3720;3690\nMarketing;620;810\nÜbriger Aufwand;1250;1210\nEBIT;1850;1130' },
    { path: 'scripts/abweichungen_berechnen.py', depth: 0, what: 'Das Rechenwerkzeug. Das Modell ruft es auf, statt selbst zu rechnen.',
      body: 'import csv, sys\n\nPCT, TCHF = 5.0, 50  # Schwellen: beide müssen überschritten sein\n\nwith open(sys.argv[1], encoding="utf-8") as f:\n    for row in csv.DictReader(f, delimiter=";"):\n        budget, ist = float(row["Budget"]), float(row["Ist"])\n        abw = ist - budget\n        pct = abw / budget * 100\n        flag = "*" if abs(pct) > PCT and abs(abw) > TCHF else ""\n        print(f"{row[\'Position\']};{abw:.0f};{pct:.1f};{flag}")' },
    { path: '.claude/', depth: 0, dir: true },
    { path: 'skills/kommentar/SKILL.md', depth: 1, what: 'Ein wiederverwendbarer Ablauf, den Claude bei Bedarf heranzieht.',
      body: '---\nname: kommentar\ndescription: Erstellt den BvI-Kommentar.\n---\nAbweichungen nur mit scripts/abweichungen_berechnen.py rechnen.\nJe Position mit * höchstens drei Sätze.\nBeispiel: «Marketing +190 TCHF (+30.6 %): Messe vom Q4 ins Q3\nvorgezogen; Verschiebung, kein Mehraufwand im Jahr.»' },
    { path: 'agents/pruefer.md', depth: 1, what: 'Ein Subagent mit kleinem Modell und eingeschränkten Werkzeugen, der jede Zahl prüft.',
      body: '---\nname: pruefer\ndescription: Prüft jede Zahl im Kommentar gegen die Quelldatei.\ntools: Read, Bash\nmodel: haiku\n---\nGleiche jede Zahl mit der Quelldatei ab.\nMelde jede Abweichung mit Position, Wert im Kommentar und Wert in der Quelle.' },
    { path: 'settings.json', depth: 1, what: 'Was der Agent darf und was nicht – zum Beispiel nie die Datei mit Zugangsdaten lesen.',
      body: '{\n  "permissions": {\n    "allow": ["Bash(python3 scripts/abweichungen_berechnen.py:*)"],\n    "deny": ["Read(./.env)"]\n  }\n}' }
  ];
  root.classList.add('w', 'af');
  var grid = el('div', { class: 'af-grid' }, root);
  var tree = el('div', { class: 'af-tree', role: 'tablist', 'aria-label': 'Dateien' }, grid);
  el('div', { class: 'af-row af-dir', text: 'abweichungsanalyse/' }, tree);
  var view = el('div', { class: 'af-view' }, grid);
  var what = el('p', { class: 'af-what' }, view);
  var pre = el('pre', { class: 'code af-code' }, view);
  var btns = [];
  FILES.forEach(function (f, i) {
    if (f.dir) { var d = el('div', { class: 'af-row af-dir', text: f.path }, tree); d.style.paddingLeft = (0.9 + f.depth * 1) + 'rem'; return; }
    var b = el('button', { type: 'button', class: 'af-row', role: 'tab', text: f.path }, tree);
    b.style.paddingLeft = (0.9 + (f.depth + 0) * 1) + 'rem';
    b.addEventListener('click', function () { show(i); });
    btns.push({ b: b, i: i });
  });
  function show(i) {
    btns.forEach(function (x) { x.b.setAttribute('aria-selected', String(x.i === i)); });
    what.innerHTML = '<b>' + FILES[i].path.split('/').pop() + '</b> ' + FILES[i].what;
    pre.textContent = FILES[i].body;
  }
  show(0);
});
