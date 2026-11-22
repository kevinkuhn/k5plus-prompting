App.widget('prompt-anatomy', function (root, ctx) {
  var el = App.el;
  var BLOCKS = [
    { k: 'Anweisung', text: 'Schreibe eine Antwort auf die folgende Anfrage einer Einwohnerin.' },
    { k: 'Kontext', text: 'Anfrage: «Guten Tag, ich habe gehört, dass die Parkkarten für Anwohner ab nächstem Jahr teurer werden. Stimmt das, und wo kann ich meine verlängern? Freundliche Grüsse, M. Keller» – Fakten: Die Anwohnerparkkarte kostet ab 1. Januar 2027 CHF 360 statt 300 pro Jahr (Beschluss Gemeinderat vom 12. Mai 2026). Verlängerung online im Bürgerportal oder am Schalter der Einwohnerdienste, Mo–Fr 8–12 und 14–17 Uhr.' },
    { k: 'Form', text: 'Höflich, Sie-Form, mit Anrede und Grussformel, maximal 120 Wörter, keine Aufzählung.' }
  ];
  // canned answers, keyed by which blocks are on (A = Anweisung, M = Kontext, F = Form)
  var ANSWERS = {
    '': ['Womit kann ich helfen?', 'Leer', 'Kein Prompt, keine Aufgabe. Das Modell kann nur zurückfragen.'],
    'A': ['Gerne beantworte ich die Anfrage. Allerdings sehe ich keine Anfrage in Ihrer Nachricht – könnten Sie den Text einfügen? Sobald ich weiss, worum es geht, formuliere ich eine passende Antwort.', 'Rät oder fragt zurück', 'Die Anweisung ist klar, aber das Modell kennt weder die Anfrage noch die Fakten. Es kann nur nachfragen – oder etwas erfinden.'],
    'M': ['Das ist eine Anfrage zur Anwohnerparkkarte: Frau Keller möchte wissen, ob die Karte teurer wird und wo sie sie verlängern kann. Laut Beschluss steigt der Preis ab 2027 auf CHF 360. Soll ich eine Antwort formulieren, die Anfrage zusammenfassen oder etwas anderes damit tun?', 'Fasst zusammen, weiss nicht, was tun', 'Kontext ohne Anweisung: Das Modell beschreibt, was es sieht, und fragt nach der Aufgabe.'],
    'F': ['Sehr geehrte Damen und Herren\n\nVielen Dank für Ihre Nachricht. Gerne helfe ich Ihnen weiter – teilen Sie mir bitte mit, worum es geht.\n\nFreundliche Grüsse', 'Form ohne Inhalt', 'Ton und Länge stimmen, aber es gibt nichts zu sagen.'],
    'AM': ['Sehr geehrte Frau Keller\n\nVielen Dank für Ihre Anfrage. Ja, das stimmt:\n\n• Ab 1. Januar 2027 kostet die Anwohnerparkkarte CHF 360 pro Jahr (bisher CHF 300).\n• Grundlage ist der Beschluss des Gemeinderats vom 12. Mai 2026.\n• Verlängern können Sie die Karte online im Bürgerportal oder am Schalter der Einwohnerdienste (Mo–Fr 8–12 und 14–17 Uhr).\n\nBei weiteren Fragen stehe ich Ihnen gerne zur Verfügung.\n\nFreundliche Grüsse', 'Inhaltlich richtig, Form ist Standard', 'Alle Fakten stimmen. Aber Aufzählungspunkte und Länge sind die Voreinstellung des Modells, nicht deine Wahl.'],
    'AF': ['Sehr geehrte Frau Keller\n\nVielen Dank für Ihre Anfrage zur Anwohnerparkkarte. Die aktuellen Gebühren und die Möglichkeiten zur Verlängerung finden Sie auf unserer Website; gerne gebe ich Ihnen auch telefonisch Auskunft.\n\nFreundliche Grüsse', 'Höflich, aber leer', 'Ohne Kontext kann das Modell die eigentliche Frage nicht beantworten. Es schreibt elegant um sie herum – so entstehen nichtssagende Antworten.'],
    'MF': ['Sehr geehrte Frau Keller\n\nIhre Nachricht betrifft die Anwohnerparkkarte, die ab 2027 CHF 360 kostet. Falls Sie möchten, formuliere ich daraus eine Antwort an Sie – sagen Sie mir kurz, was ich tun soll.\n\nFreundliche Grüsse', 'Unklar, was verlangt ist', 'Form und Kontext, aber keine Aufgabe. Das Modell bleibt vorsichtig.'],
    'AMF': ['Sehr geehrte Frau Keller\n\nVielen Dank für Ihre Anfrage. Ja, die Anwohnerparkkarte wird teurer: Ab 1. Januar 2027 kostet sie CHF 360 statt bisher CHF 300 pro Jahr. Der Gemeinderat hat dies am 12. Mai 2026 beschlossen.\n\nVerlängern können Sie Ihre Karte bequem online im Bürgerportal oder persönlich am Schalter der Einwohnerdienste, jeweils Montag bis Freitag von 8 bis 12 und 14 bis 17 Uhr.\n\nFreundliche Grüsse', 'Vollständig und in deiner Form', 'Anweisung, Kontext und Form: Das Modell hat alles, was auch eine neue Kollegin bräuchte.']
  };
  var on = [true, true, true];
  root.classList.add('w');
  var blocks = el('div', { class: 'pa-blocks', role: 'group', 'aria-label': 'Bausteine' }, root);
  var btns = BLOCKS.map(function (b, i) {
    var bt = el('button', { type: 'button', class: 'b' + i, 'aria-pressed': 'true' }, blocks);
    el('i', {}, bt); bt.appendChild(document.createTextNode(b.k));
    bt.addEventListener('click', function () { on[i] = !on[i]; bt.setAttribute('aria-pressed', String(on[i])); renderPrompt(); answer.innerHTML = ''; el('span', { class: 'k', text: 'Antwort' }, answer); el('span', { class: 'empty', text: 'Noch nicht gesendet.' }, answer); });
    return bt;
  });
  // dasselbe Eingabefeld, dreimal eingekleidet: vereinfachte Nachbildungen, keine Screenshots
  var UIS = [['chatgpt', 'ChatGPT'], ['copilot', 'Copilot'], ['claude', 'Claude']];
  var uiSeg = el('div', { class: 'seg pa-uis', role: 'group', 'aria-label': 'Programm' }, blocks);
  var wrap = el('div', { class: 'pa-wrap' }, root);
  var left = el('div', {}, wrap);
  var ui = el('div', { class: 'pa-ui' }, left);
  var uiName = el('div', { class: 'pa-ui-name' }, ui);
  var prompt = el('div', { class: 'pa-prompt', 'aria-live': 'polite' }, ui);
  var tools = el('div', { class: 'pa-ui-tools' }, ui);
  el('span', { class: 'pa-ui-plus', text: '+', 'aria-hidden': 'true' }, tools);
  var sendBtn = el('button', { class: 'pa-ui-send', type: 'button', 'aria-label': 'Senden', title: 'Senden' }, tools);
  sendBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var uiBtns = UIS.map(function (u, i) {
    var b = el('button', { type: 'button', text: u[1] }, uiSeg);
    b.addEventListener('click', function () { setUi(i); });
    return b;
  });
  function setUi(i) {
    ui.className = 'pa-ui ui-' + UIS[i][0];
    uiName.textContent = UIS[i][1];
    uiBtns.forEach(function (b, k) { b.setAttribute('aria-pressed', String(k === i)); });
  }
  // #copilot oder #claude in der Adresse öffnet direkt diese Ansicht
  setUi(Math.max(0, UIS.map(function (u) { return u[0]; }).indexOf(location.hash.slice(1))));
  var stats = el('div', { class: 'pa-stats' }, left);
  var send = el('div', { class: 'pa-send' }, left);
  el('span', { class: 'pa-hint', text: 'Pfeil drücken zum Senden' }, send);
  var flow = el('div', { class: 'pa-flow' }, send);
  var dots = el('span', { class: 'dots' }, flow); for (var d = 0; d < 4; d++) el('i', {}, dots);
  el('span', { class: 'pa-model', text: 'Modell' }, flow);
  var answer = el('div', { class: 'pa-answer', 'aria-live': 'polite' }, wrap);
  el('span', { class: 'k', text: 'Antwort' }, answer); el('span', { class: 'empty', text: 'Noch nicht gesendet.' }, answer);

  function promptText() { return BLOCKS.filter(function (b, i) { return on[i]; }).map(function (b) { return b.text; }).join(' '); }
  function renderPrompt() {
    prompt.innerHTML = '';
    var any = false;
    BLOCKS.forEach(function (b, i) { if (!on[i]) return; any = true; el('span', { class: 'pseg b' + i, text: b.text }, prompt); prompt.appendChild(document.createTextNode(' ')); });
    if (!any) el('span', { class: 'empty', text: '(leer)' }, prompt);
    var t = promptText();
    var words = (t.match(/\S+/g) || []).length;
    stats.innerHTML = '';
    [[t.length, 'Zeichen'], [words, 'Wörter'], [App.countTokens(t), 'Tokens ≈']].forEach(function (s) { var sp = el('span', {}, stats); el('b', { text: App.fmt(s[0]) }, sp); sp.appendChild(document.createTextNode(s[1])); });
  }
  var busy = false;
  sendBtn.addEventListener('click', function () {
    if (busy) return; busy = true; flow.classList.add('busy');
    answer.innerHTML = ''; el('span', { class: 'k', text: 'Antwort' }, answer);
    var key = (on[0] ? 'A' : '') + (on[1] ? 'M' : '') + (on[2] ? 'F' : '');
    var a = ANSWERS[key];
    setTimeout(function () {
      flow.classList.remove('busy'); busy = false;
      var body = el('span', {}, answer);
      var verdict = el('span', { class: 'verdict' }, answer); el('b', { text: a[1] + '. ' }, verdict); verdict.appendChild(document.createTextNode(a[2]));
      if (ctx.reduced) { body.textContent = a[0]; return; }
      var i = 0, txt = a[0];
      var loop = ctx.raf(function (dt) { i = Math.min(txt.length, i + dt * 0.06); body.textContent = txt.slice(0, Math.floor(i)); if (i >= txt.length) loop.stop(); });
    }, ctx.reduced ? 50 : 700);
  });
  renderPrompt();
});
