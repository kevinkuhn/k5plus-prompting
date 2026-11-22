App.widget('hallucination', function (root, ctx) {
  var el = App.el, T = function (en, de) { return ctx.t({ en: en, de: de }); };
  var C = {
    en: { pre: 'The 2019 study by ', fake: 'Dr. Müller on glacier retreat in Valais', post: ' was published in …', note: 'This study does not exist. The model has to continue anyway.',
      guess: [[' Nature', .31], [' the Journal of Glaciology', .24], [' Science', .14], [' Geophysical Research Letters', .11], [' I don’t know', .03]],
      honest: [[' I don’t know', .58], [' Nature', .14], [' the Journal of Glaciology', .11], [' Science', .07], [' Geophysical Research Letters', .05]],
      rules: ['Right = 1, wrong = 0, “I don’t know” = 0', 'Right = 1, wrong = −1, “I don’t know” = 0'],
      rows: ['Guess (right 20 % of the time)', 'Say “I don’t know”'], why: ['Guessing scores higher on average, so training pushes the model to guess.', 'Now honesty scores higher — the model learns to admit uncertainty.'], hdr: 'Expected score per question', rule: 'Scoring rule used in training and tests' },
    de: { pre: 'Die Studie von ', fake: 'Dr. Müller (2019) zum Gletscherschwund im Wallis', post: ' erschien in …', note: 'Diese Studie gibt es nicht. Das Modell muss trotzdem weiterschreiben.',
      guess: [[' Nature', .31], [' dem Journal of Glaciology', .24], [' Science', .14], [' den Geophysical Research Letters', .11], [' Ich weiss es nicht', .03]],
      honest: [[' Ich weiss es nicht', .58], [' Nature', .14], [' dem Journal of Glaciology', .11], [' Science', .07], [' den Geophysical Research Letters', .05]],
      rules: ['Richtig = 1, falsch = 0, «Ich weiss es nicht» = 0', 'Richtig = 1, falsch = −1, «Ich weiss es nicht» = 0'],
      rows: ['Raten (in 20 % der Fälle richtig)', '«Ich weiss es nicht» sagen'], why: ['Raten bringt im Schnitt mehr Punkte – das Training treibt das Modell zum Raten.', 'Jetzt bringt Ehrlichkeit mehr Punkte – das Modell lernt, Unsicherheit zuzugeben.'], hdr: 'Erwartete Punkte pro Frage', rule: 'Bewertungsregel in Training und Tests' }
  };
  var state = { rule: 0 };
  root.classList.add('w');
  var prompt = el('div', { class: 'ha-prompt' }, root); var note = el('div', { class: 'ha-note' }, root);
  var ctl = el('div', { class: 'ctl' }, root); var rl = el('span', {}, ctl); var seg = el('div', { class: 'seg', role: 'group' }, ctl);
  var b0 = el('button', { type: 'button', 'aria-pressed': 'true' }, seg), b1 = el('button', { type: 'button', 'aria-pressed': 'false' }, seg);
  var wrap = el('div', { class: 'ha-wrap' }, root);
  var bars = el('div', { class: 'bars' }, wrap);
  var rule = el('div', { class: 'ha-rule' }, wrap);
  function render(animate) {
    var c = C[ctx.lang()];
    prompt.innerHTML = ''; prompt.appendChild(document.createTextNode(c.pre)); el('span', { class: 'fake', text: c.fake }, prompt); prompt.appendChild(document.createTextNode(c.post));
    note.textContent = c.note; rl.textContent = c.rule + ':'; b0.textContent = c.rules[0]; b1.textContent = c.rules[1];
    b0.setAttribute('aria-pressed', String(state.rule === 0)); b1.setAttribute('aria-pressed', String(state.rule === 1));
    var list = state.rule === 0 ? c.guess : c.honest;
    var byName = {}; list.forEach(function (x) { byName[x[0]] = x[1]; });
    // keep a stable order: order of the guess list, so bars move rather than jump
    var order = c.guess.map(function (x) { return x[0]; });
    bars.innerHTML = '';
    order.forEach(function (name) {
      var p = byName[name] || 0.01, idk = name === c.guess[4][0];
      el('div', { class: 'bt' + (idk ? ' hit' : ''), text: name }, bars);
      var bb = el('div', { class: 'bb' }, bars); var sp = el('span', { class: idk ? 'hit' : '' }, bb);
      el('div', { class: 'bp' + (idk ? ' hit' : ''), text: Math.round(p * 100) + ' %' }, bars);
      requestAnimationFrame(function () { sp.style.width = (p * 100) + '%'; });
    });
    var g = state.rule === 0 ? 0.2 : (0.2 - 0.8), a = 0;
    rule.innerHTML = '';
    el('h4', { text: c.hdr }, rule);
    var tb = el('table', {}, rule);
    var r1 = el('tr', { class: g > a ? 'win' : '' }, tb); el('td', { text: c.rows[0] }, r1); el('td', { text: (g > 0 ? '+' : '') + g.toFixed(2).replace('.', ctx.lang() === 'de' ? ',' : '.') }, r1);
    var r2 = el('tr', { class: a >= g ? 'win' : '' }, tb); el('td', { text: c.rows[1] }, r2); el('td', { text: '0' }, r2);
    el('p', { class: 'why', text: c.why[state.rule] }, rule);
  }
  b0.addEventListener('click', function () { state.rule = 0; render(true); }); b1.addEventListener('click', function () { state.rule = 1; render(true); });
  ctx.onLang(function () { render(false); });
  render(false);
});
