App.widget('prompt-builder', function (root, ctx) {
  var el = App.el;
  var VAGUE = 'Schreib mir ein Konzept für ein Reporting.';
  var SEGS = [
    ['Wir sind das Controlling-Team der Gemeinde, fünf Personen; wir erstellen quartalsweise das Finanzreporting für den Gemeinderat.', 'Situation', 'Wer schreibt, für wen, wozu. Daraus ergibt sich die Rolle von selbst.'],
    ['Angehängt: das bisherige Reporting und die Rückmeldungen der Finanzkommission.', 'Material', 'Das Modell sieht deine Unterlagen nur, wenn du sie mitgibst.'],
    ['Entwirf eine Gliederung für ein neues Reporting mit maximal 8 Seiten, das die drei Hauptkritikpunkte behebt.', 'Aufgabe', 'Eine klare Aufgabe mit Umfang. «Ein Konzept» ist keine Aufgabe.'],
    ['Als nummerierte Gliederung mit je einem Satz Begründung.', 'Form', 'Sag, wie die Antwort aussehen soll – sonst kommt der Standard.'],
    ['Schweizer Rechtschreibung, keine englischen Fachbegriffe.', 'Regeln', 'Kleine Regeln ersparen eine Korrekturrunde.'],
    ['Wenn dir etwas fehlt, frag zuerst.', 'Einladung', 'Erlaubt dem Modell, Lücken zu klären, statt zu raten.']
  ];
  var state = { on: -1 };
  root.classList.add('w');
  var wrap = el('div', { class: 'pr-wrap' }, root);
  var v = el('div', { class: 'pr-box vague' }, wrap), b = el('div', { class: 'pr-box' }, wrap);
  var exp = el('div', { class: 'pr-exp' }, root);
  var segEls = [], expEls = [];
  function set(i) { state.on = i; segEls.forEach(function (s, k) { s.classList.toggle('on', k === i); }); expEls.forEach(function (s, k) { s.classList.toggle('on', k === i); }); }
  el('span', { class: 'k', text: 'Vage' }, v); v.appendChild(document.createTextNode('«' + VAGUE + '»'));
  el('span', { class: 'k', text: 'Konkret' }, b);
  SEGS.forEach(function (s, i) {
    var sp = el('span', { class: 'pr-seg p' + i, text: s[0], tabindex: 0 }, b); b.appendChild(document.createTextNode(' '));
    var e = el('div', { class: 'p' + i }, exp); el('b', { text: s[1] }, e); e.appendChild(document.createTextNode(s[2]));
    [sp, e].forEach(function (x) { x.addEventListener('mouseenter', function () { set(i); }); x.addEventListener('focus', function () { set(i); }); x.addEventListener('click', function () { set(i); }); });
    segEls.push(sp); expEls.push(e);
  });
  set(-1);

  // second part: role vs. context
  var role = el('div', { class: 'pb-role' }, root);
  var ctl = el('div', { class: 'ctl' }, role);
  el('span', { text: 'Was weiss das Modell nach diesem Satz?' }, ctl);
  var seg = el('div', { class: 'seg', role: 'group', 'aria-label': 'Rolle oder Kontext' }, ctl);
  var bRole = el('button', { type: 'button', 'aria-pressed': 'true', text: 'Rolle' }, seg);
  var bCtx = el('button', { type: 'button', 'aria-pressed': 'false', text: 'Kontext' }, seg);
  var cmp = el('div', { class: 'pb-cmp', 'aria-live': 'polite' }, role);
  var verdict = el('div', { class: 'pb-verdict' }, role);
  var FACTS = ['Wer liest (Gemeinderat)', 'Wozu (Quartalsreporting)', 'Wer schreibt (Team, 5 Personen)', 'Tonlage (Zahlen, Abweichungen, wenig Zeit)', 'Was schiefging (Kritik der Finanzkommission)'];
  var MODES = {
    role: { k: 'Rolle', q: 'Stell dir vor, du bist ein Controller.', yes: [3], cls: 'role', v: '<b>1 von 5.</b> Die Rolle verschiebt den Ton – mehr nicht. Alles andere muss das Modell raten.' },
    ctx: { k: 'Kontext', q: SEGS[0][0] + ' ' + SEGS[1][0], yes: [0, 1, 2, 3, 4], cls: 'ctx', v: '<b>5 von 5.</b> Der Kontext enthält die Rolle – und dazu alles, was die Rolle offenlässt.' }
  };
  function show(m) {
    var d = MODES[m];
    bRole.setAttribute('aria-pressed', String(m === 'role')); bCtx.setAttribute('aria-pressed', String(m === 'ctx'));
    cmp.innerHTML = '';
    var c = el('div', { class: 'pb-card ' + d.cls }, cmp);
    el('span', { class: 'k', text: d.k }, c); el('q', { text: '«' + d.q + '»' }, c);
    var c2 = el('div', { class: 'pb-card' }, cmp);
    el('span', { class: 'k', text: 'Das Modell weiss jetzt' }, c2);
    var ul = el('ul', {}, c2);
    FACTS.forEach(function (f, i) { el('li', { class: d.yes.indexOf(i) >= 0 ? 'yes' : 'no', text: f }, ul); });
    verdict.innerHTML = d.v;
  }
  bRole.addEventListener('click', function () { show('role'); });
  bCtx.addEventListener('click', function () { show('ctx'); });
  show('role');

  // walk through the parts once
  if (!ctx.reduced) {
    var k = 0, iv = setInterval(function () {
      if (!ctx.active()) return;
      if (k >= SEGS.length) { clearInterval(iv); show('ctx'); return; }
      set(k++);
    }, 1500);
    root.addEventListener('mouseenter', function () { clearInterval(iv); }, { once: true });
  }
});
