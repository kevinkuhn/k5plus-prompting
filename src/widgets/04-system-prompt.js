App.widget('system-prompt', function (root, ctx) {
  var el = App.el;
  var RULES = [
    { id: 'de', t: 'Antworte auf Deutsch' },
    { id: 'polite', t: 'Sei höflich und sachlich' },
    { id: 'law', t: 'Keine Rechtsauskünfte – auf die zuständige Stelle verweisen' },
    { id: 'pii', t: 'Gib keine Personendaten weiter' },
    { id: 'short', t: 'Antworte kurz' }
  ];
  var QUESTION = 'Kann ich gegen meine Steuerveranlagung Einsprache erheben, und wie?';
  var on = { de: true, polite: true, law: true, pii: true, short: false };
  function answer() {
    if (!on.de) return ['You can generally file an objection against a tax assessment within 30 days of receiving it. Submit it in writing to the tax office that issued the assessment, stating what you object to and why.', 'Ohne die Regel «Antworte auf Deutsch» folgt das Modell seiner häufigsten Trainingssprache – oder rät die Sprache aus der Frage.'];
    if (on.law && on.short) return ['Ja, gegen eine Steuerveranlagung können Sie in der Regel Einsprache erheben. Für Fristen und das genaue Vorgehen wenden Sie sich bitte an das Steueramt Ihrer Gemeinde.', 'Zwei Regeln greifen: keine Rechtsauskunft (Verweis statt Frist) und kurz (zwei Sätze).'];
    if (on.law && on.polite) return ['Vielen Dank für Ihre Frage. Gegen eine Steuerveranlagung kann grundsätzlich Einsprache erhoben werden. Weil dabei Fristen und Formvorschriften gelten, die ich nicht verbindlich beurteilen kann, empfehle ich Ihnen, sich direkt an das Steueramt Ihrer Gemeinde zu wenden – dort erhalten Sie eine verbindliche Auskunft zu Frist, Form und Adresse. Gerne helfe ich Ihnen beim Formulieren Ihres Schreibens.', 'Die Regel «keine Rechtsauskünfte» macht die Antwort vorsichtig: Sie nennt keine Frist, verweist auf das Steueramt und bietet Hilfe an, die erlaubt ist.'];
    if (on.law) return ['Gegen eine Steuerveranlagung kann Einsprache erhoben werden. Verbindliche Angaben zu Frist und Vorgehen macht das Steueramt Ihrer Gemeinde.', 'Ohne «höflich und sachlich» fällt die Anrede weg; die Verweisregel gilt weiter.'];
    if (on.short) return ['Ja. In der Regel innert 30 Tagen nach Erhalt, schriftlich und mit Begründung an das Steueramt, das die Veranlagung erlassen hat.', 'Ohne die Verweisregel nennt das Modell eine Frist aus seinem Training – plausibel, aber nicht geprüft. Kurz, weil «Antworte kurz» gilt.'];
    if (on.polite) return ['Vielen Dank für Ihre Frage. Ja, gegen eine Steuerveranlagung können Sie Einsprache erheben. In der Regel gilt eine Frist von 30 Tagen ab Zustellung. Die Einsprache ist schriftlich beim Steueramt einzureichen, das die Veranlagung erlassen hat, und sollte begründen, welche Punkte Sie bestreiten. Legen Sie Belege bei. Bitte prüfen Sie die genaue Frist auf Ihrer Veranlagung – sie kann je nach Kanton abweichen.', 'Ohne die Verweisregel antwortet das Modell inhaltlich – mit einer Frist, die stimmen kann, aber vom Modell nicht überprüft wurde. Genau das will eine Verwaltung meist vermeiden.'];
    return ['Ja. Frist meist 30 Tage ab Zustellung, schriftlich, mit Begründung, an das zuständige Steueramt. Details stehen auf der Veranlagung.', 'Ohne Hausordnung: Ton und Inhalt sind reine Voreinstellung des Modells.'];
  }
  root.classList.add('w');
  var sys = el('div', { class: 'sy-layer sys' }, root);
  var k1 = el('div', { class: 'k' }, sys); el('span', { text: 'System-Prompt' }, k1); el('span', { class: 'eye', text: 'unsichtbar · vom Betreiber' }, k1);
  var rules = el('div', { class: 'sy-rules', role: 'group', 'aria-label': 'Regeln' }, sys);
  RULES.forEach(function (r) {
    var b = el('button', { type: 'button', text: r.t, 'aria-pressed': String(on[r.id]) }, rules);
    b.addEventListener('click', function () { on[r.id] = !on[r.id]; b.setAttribute('aria-pressed', String(on[r.id])); pending(); });
  });
  var usr = el('div', { class: 'sy-layer user' }, root);
  var k2 = el('div', { class: 'k' }, usr); el('span', { text: 'Dein Prompt' }, k2); el('span', { class: 'eye', text: 'sichtbar · von dir' }, k2);
  el('div', { class: 'sy-q', text: '«' + QUESTION + '»' }, usr);
  var row = el('div', { class: 'sy-row' }, root);
  var send = el('button', { class: 'btn', type: 'button', text: 'Senden →' }, row);
  el('span', { class: 'hint', text: 'Dieselbe Frage, andere Hausordnung – andere Antwort.' }, row);
  var ans = el('div', { class: 'sy-ans', 'aria-live': 'polite' }, root);
  function pending() { ans.innerHTML = ''; el('span', { class: 'k', text: 'Antwort' }, ans); el('span', { class: 'muted', text: 'Regeln geändert – erneut senden.' }, ans); }
  function run() {
    var a = answer();
    ans.innerHTML = ''; el('span', { class: 'k', text: 'Antwort' }, ans);
    var body = el('span', {}, ans);
    var why = el('span', { class: 'why' }, ans); el('b', { text: 'Warum: ' }, why); why.appendChild(document.createTextNode(a[1]));
    if (ctx.reduced) { body.textContent = a[0]; return; }
    var i = 0, loop = ctx.raf(function (dt) { i = Math.min(a[0].length, i + dt * 0.07); body.textContent = a[0].slice(0, Math.floor(i)); if (i >= a[0].length) loop.stop(); });
  }
  send.addEventListener('click', run);
  pending();
  if (!ctx.reduced) setTimeout(function () { if (ctx.active()) run(); }, 600); else run();
});
