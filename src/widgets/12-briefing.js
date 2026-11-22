App.widget('briefing', function (root, ctx) {
  var el = App.el;
  var STEPS = [
    { t: 'Gespräch mit dem Team', build: function (p) {
      el('span', { class: 'k', text: '1 · Das imaginäre Team im Raum' }, p);
      var pp = el('div', { class: 'people' }, p);
      ['Juristin', 'Kommunikation', 'IT', 'Sachbearbeitung', 'Datenschutzberater'].forEach(function (n) { el('span', { text: n }, pp); });
      el('p', { class: 'spoken', text: '«Also, stellt euch vor, wir machen ein neues Online-Formular für Parkkarten, ähm, die Leute sollen das am Handy ausfüllen können, und die Juristin, du sagst mir dann, was wir wegen Unterschrift brauchen … und IT, das muss ins Bürgerportal, nicht schon wieder eine Insel …»' }, p);
    } },
    { t: 'Aufnahme & Transkript', build: function (p) {
      el('span', { class: 'k', text: '2 · Diktierfunktion oder Transkriptionstool' }, p);
      el('div', { class: 'raw', html: 'also <span class="um">ähm</span> stellt euch vor wir machen ein neues online formular für parkkarten <span class="um">ähm</span> die leute sollen das am handy ausfüllen können am handy und die juristin du sagst mir dann was wir wegen unterschrift brauchen ob das <span class="um">äh</span> ohne geht und IT das muss ins bürgerportal nicht schon wieder eine insel und kommunikation <span class="um">ähm</span> wir brauchen einen text für die website und die frau meier hat letztes jahr das gleiche probiert und das ist am reglement gescheitert artikel 7 glaub ich' }, p);
      el('p', { class: 'hint', text: 'Unordentlich, aber vollständig. Genau so soll es sein.' }, p);
    } },
    { t: 'Modell strukturiert', build: function (p) {
      el('span', { class: 'k', text: '3 · Ein Prompt über dem Transkript' }, p);
      el('div', { class: 'prompt', text: '«Hier ist das Transkript eines Gesprächs. Erstelle daraus ein Briefing mit Ziel, Zielgruppe, Anforderungen je Fachbereich und offenen Fragen.» + Transkript' }, p);
      el('p', { class: 'hint', text: 'Ordnen, gliedern, Lücken benennen – das können Sprachmodelle gut.' }, p);
    } },
    { t: 'Briefing', build: function (p) {
      el('span', { class: 'k', text: '4 · Das Briefing' }, p);
      var d = el('div', { class: 'doc' }, p);
      el('h4', { text: 'Ziel' }, d); el('p', { text: 'Online-Formular für Anwohnerparkkarten, am Smartphone ausfüllbar, integriert ins Bürgerportal.' }, d);
      el('h4', { text: 'Zielgruppe' }, d); el('p', { text: 'Einwohnerinnen und Einwohner mit Anspruch auf Parkkarte.' }, d);
      el('h4', { text: 'Anforderungen je Fachbereich' }, d);
      var ul = el('ul', {}, d);
      ['Recht: Klären, ob eine Unterschrift nötig ist (Reglement Art. 7).', 'IT: Anbindung ans Bürgerportal, keine Insellösung.', 'Kommunikation: Text für die Website.', 'Datenschutz: noch nicht besprochen.'].forEach(function (x) { el('li', { text: x }, ul); });
      el('h4', { text: 'Offene Fragen' }, d);
      el('p', { class: 'open', text: 'Was genau scheiterte letztes Jahr? Frist? Budget? Wer entscheidet?' }, d);
    } },
    { t: 'Auftrag', build: function (p) {
      el('span', { class: 'k', text: '5 · Briefing + Unterlagen = der Prompt' }, p);
      var o = el('div', { class: 'out' }, p);
      el('span', { class: 'chip', text: 'Briefing' }, o); el('span', { text: '+' }, o);
      el('span', { class: 'chip', text: 'Altes Formular' }, o); el('span', { text: '+' }, o);
      el('span', { class: 'chip', text: 'Reglement' }, o); el('span', { class: 'arrow', text: '→' }, o);
      el('span', { class: 'chip', text: 'Chat-Assistent · Projekttool · Agentur' }, o);
      el('p', { text: 'Dasselbe Briefing funktioniert in jedem Werkzeug – und für Menschen.' }, p);
      el('p', { class: 'warn', text: 'Nur mit einem Werkzeug, das deine Organisation freigegeben hat.' }, p);
    } }
  ];
  var i = 0, timer = null;
  root.classList.add('w');
  var steps = el('div', { class: 'br-steps', role: 'group', 'aria-label': 'Schritte' }, root);
  var btns = STEPS.map(function (s, k) {
    var b = el('button', { type: 'button', 'aria-pressed': 'false' }, steps);
    el('b', { text: String(k + 1) }, b); b.appendChild(document.createTextNode(s.t));
    b.addEventListener('click', function () { stop(); show(k); });
    return b;
  });
  var track = el('div', { class: 'br-track', 'aria-hidden': 'true' }, root);
  var bars = STEPS.slice(1).map(function () { return el('i', {}, track); });
  var panel = el('div', { class: 'br-panel', 'aria-live': 'polite' }, root);
  var ctl = el('div', { class: 'br-ctl' }, root);
  var play = el('button', { class: 'btn', type: 'button', text: 'Abspielen' }, ctl);
  var next = el('button', { class: 'btn secondary', type: 'button', text: 'Nächster Schritt' }, ctl);
  function show(k) {
    i = k;
    btns.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j === k)); });
    bars.forEach(function (b, j) { b.classList.toggle('done', j < k); });
    panel.innerHTML = ''; STEPS[k].build(panel);
  }
  var playing = false;
  function stop() { playing = false; clearTimeout(timer); play.textContent = 'Abspielen'; }
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (!playing) return;
      if (!ctx.active()) { schedule(); return; }
      if (i + 1 >= STEPS.length) { stop(); return; }
      show(i + 1); schedule();
    }, 3200);
  }
  play.addEventListener('click', function () {
    if (playing) { stop(); return; }
    playing = true; play.textContent = 'Pause';
    if (i + 1 >= STEPS.length) show(0);
    schedule();
  });
  next.addEventListener('click', function () { stop(); show((i + 1) % STEPS.length); });
  show(0);
  if (!ctx.reduced) { playing = true; play.textContent = 'Pause'; schedule(); }
});
