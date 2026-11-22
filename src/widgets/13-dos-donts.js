App.widget('dos-donts', function (root, ctx) {
  var el = App.el;
  var CARDS = [
    ['do', 'Kontext geben', 'Wer du bist, für wen der Text ist, was vorher geschah. Das Modell weiss nur, was im Gespräch steht.', '«Wir sind der Sozialdienst der Gemeinde. Die Antwort geht an eine Klientin, die zum ersten Mal Unterstützung beantragt.»'],
    ['do', 'Form festlegen', 'Länge, Ton, Aufbau, Sprache. Ohne Vorgabe bekommst du den Standard des Modells.', '«Maximal 150 Wörter, Sie-Form, einfache Sprache, keine Aufzählung, Schweizer Rechtschreibung.»'],
    ['do', 'Beispiel zeigen', 'Ein Muster des gewünschten Stils sagt mehr als ein Absatz Beschreibung.', '«Hier ein Brief, wie wir ihn üblicherweise schreiben. Verfasse den neuen im gleichen Ton.»'],
    ['do', 'Rückfragen verlangen', 'Bei allem, was grösser ist als eine E-Mail: erst fragen lassen, dann schreiben lassen.', '«Bevor du die Stellenausschreibung schreibst: Stell mir die Fragen, die dir fehlen.»'],
    ['do', 'In Runden arbeiten', 'Die erste Antwort ist ein Entwurf. Die zweite Nachricht – «kürzer, sachlicher» – bringt oft den guten Text.', '«Gut. Jetzt den zweiten Absatz streichen und den Schluss verbindlicher formulieren.»'],
    ['do', 'Ein Thema pro Gespräch', 'Lange Gespräche mit vielen Themen verwässern den Kontext. Neues Thema, neues Fenster.', 'Das Protokoll in einem Chat, die Medienmitteilung in einem zweiten – nicht beides in einem.'],
    ['do', 'Prüfen: Zahlen, Namen, Paragrafen', 'Jede Angabe gegen die Quelle prüfen. Das Modell schreibt flüssig, auch wenn es falsch liegt.', 'Das Modell nennt «Art. 12 Abs. 3». Du öffnest das Reglement und liest nach – vor dem Versand.'],
    ['dont', 'Nicht: Zauberformeln suchen', 'Es gibt keine geheimen Wörter, die bessere Antworten erzwingen. Es gibt nur klar oder unklar gesagt, was du willst.', '«Du bist der beste Experte der Welt» bringt nichts. «Für den Gemeinderat, 1 Seite, drei Optionen mit Kosten» bringt alles.'],
    ['dont', 'Nicht: Vertrauliches in öffentliche Tools', 'Öffentliche Gratis-Werkzeuge sind wie eine E-Mail an Unbekannte. Personendaten und Internes nur in freigegebene Werkzeuge.', 'Ein Steuerdossier gehört in kein öffentliches Chat-Fenster – auch nicht «anonymisiert».'],
    ['dont', 'Nicht: Ungeprüft weiterleiten', 'Was das Modell schreibt, trägt am Ende deinen Namen. Nichts verlässt das Haus, was du nicht gelesen hast.', 'Die Antwort an die Bürgerin wird gelesen, geprüft, angepasst – dann erst gesendet.']
  ];
  root.classList.add('w');
  var grid = el('div', { class: 'dd-grid' }, root);
  var cards = CARDS.map(function (c, i) {
    var b = el('button', { type: 'button', class: 'dd ' + c[0], 'aria-expanded': 'false' }, grid);
    el('span', { class: 'tag', text: c[0] === 'do' ? 'Do' : 'Don’t' }, b);
    el('span', { class: 'h', text: c[1] }, b);
    el('span', { class: 'b', text: c[2] }, b);
    var ex = el('span', { class: 'ex' }, b); el('b', { text: 'Beispiel' }, ex); ex.appendChild(document.createTextNode(c[3]));
    b.addEventListener('click', function () { toggle(i); });
    return b;
  });
  var open = -1;
  function toggle(i) {
    open = open === i ? -1 : i;
    cards.forEach(function (c, k) { c.setAttribute('aria-expanded', String(k === open)); });
  }
  if (!ctx.reduced) {
    var k = 0, iv = setInterval(function () {
      if (!ctx.active()) return;
      if (k >= 3) { clearInterval(iv); return; }
      open = -1; toggle(k++);
    }, 2200);
    root.addEventListener('mouseenter', function () { clearInterval(iv); }, { once: true });
    root.addEventListener('focusin', function () { clearInterval(iv); }, { once: true });
  }
});
