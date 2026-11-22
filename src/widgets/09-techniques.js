App.widget('techniques', function (root, ctx) {
  var el = App.el;
  var MAT = 'Anfrage: «Guten Tag, seit Wochen steht bei uns ein Bauzaun auf dem Trottoir, ohne Hinweis. Wer ist dafür zuständig? R. Huber»';
  var TASK = 'Ordne die folgende Anfrage einem Amt zu: Steuern, Bau, Einwohner, Soziales oder Sonstiges.';
  var T = [
    { n: 'Zero-Shot', lines: [[TASK], [MAT, 'mat']], out: 'Bau', when: 'Für Standardaufgaben, die das Modell gut kennt. Schnell – aber deine Kategorien und Grenzfälle kennt es nicht.' },
    { n: 'One-Shot', lines: [[TASK], ['Beispiel: «Mein Nachbar baut ohne Bewilligung.» → Bau', 'add'], [MAT, 'mat']], out: 'Bau', when: 'Ein Beispiel zeigt das gewünschte Format – hier: nur der Amtsname, keine Erklärung.' },
    { n: 'Few-Shot', lines: [[TASK], ['Beispiel: «Mein Nachbar baut ohne Bewilligung.» → Bau', 'add'], ['Beispiel: «Ich ziehe nach Bern, was muss ich melden?» → Einwohner', 'add'], ['Beispiel: «Die Strassenlampe vor dem Haus ist defekt.» → Sonstiges (Werkhof)', 'add'], ['Beispiel: «Kann ich die Steuern in Raten zahlen?» → Steuern', 'add'], [MAT, 'mat']], out: 'Sonstiges (Werkhof) – Bauzaun auf öffentlichem Grund betrifft den Unterhalt der Strasse, nicht das Baugesuch.', when: 'Mehrere, bewusst unterschiedliche Beispiele zeigen auch Grenzfälle. Das Modell lernt deine Einteilung, nicht irgendeine.' },
    { n: 'Schritt für Schritt', lines: [[TASK], ['Überlege zuerst Schritt für Schritt, welche Ämter in Frage kommen und warum. Gib erst am Schluss die Zuordnung an.', 'add'], [MAT, 'mat']], out: '1. Es geht um einen Bauzaun – das deutet auf Bau.\n2. Der Zaun steht aber auf dem Trottoir, also auf öffentlichem Grund; die Frage ist, wer den Unterhalt und die Nutzung des Trottoirs regelt.\n3. Das ist in den meisten Gemeinden der Werkhof oder die Abteilung Tiefbau, nicht das Bauamt (Baugesuche).\nZuordnung: Sonstiges (Werkhof/Tiefbau).', when: 'Bei Aufgaben mit mehreren Schritten oder Abwägungen. Langsamer, aber deutlich weniger Fehler.' },
    { n: 'Kontext & Rolle', lines: [['Du bist Mitarbeiterin der Kanzlei einer Gemeinde mit 8’000 Einwohnern. Die Ämter sind: Steueramt, Bauverwaltung (Baugesuche), Einwohnerdienste, Sozialdienst und Werkhof (Strassen, Unterhalt, öffentlicher Grund).', 'add'], [TASK], [MAT, 'mat']], out: 'Werkhof – der Zaun steht auf öffentlichem Grund, das fällt in den Unterhalt, nicht in die Bauverwaltung.', when: 'Beschreib die Situation, nicht nur die Rolle. Der Satz «die Ämter sind …» leistet die eigentliche Arbeit.' }
  ];
  var state = { i: 0 };
  root.classList.add('w');
  var tabs = el('div', { class: 'te-tabs', role: 'group', 'aria-label': 'Technik' }, root);
  var wrap = el('div', { class: 'te-wrap' }, root);
  var prompt = el('div', { class: 'te-prompt', 'aria-live': 'polite' }, wrap);
  var right = el('div', {}, wrap);
  var out = el('div', { class: 'te-out', 'aria-live': 'polite' }, right);
  var when = el('div', { class: 'te-when' }, right);
  var btns = T.map(function (t, i) {
    var b = el('button', { type: 'button', text: t.n, 'aria-pressed': String(i === 0) }, tabs);
    b.addEventListener('click', function () { set(i); });
    return b;
  });
  function set(i) {
    state.i = i; btns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
    var t = T[i];
    prompt.innerHTML = ''; el('span', { class: 'k', text: 'Prompt' }, prompt);
    t.lines.forEach(function (l) { el('span', { class: 'ln' + (l[1] ? ' ' + l[1] : ''), text: l[0] }, prompt); });
    out.innerHTML = ''; el('span', { class: 'k', text: 'Ausgabe' }, out); out.appendChild(document.createTextNode(t.out));
    when.innerHTML = ''; el('b', { text: 'Wann sinnvoll' }, when); when.appendChild(document.createTextNode(t.when));
  }
  set(0);
  if (!ctx.reduced) {
    var k = 0, iv = setInterval(function () { if (!ctx.active()) return; k++; if (k >= T.length) { clearInterval(iv); return; } set(k); }, 3200);
    root.addEventListener('click', function () { clearInterval(iv); }, { once: true });
  }
});
