App.widget('sampling', function (root, ctx) {
  var el = App.el, T = function (en, de) { return ctx.t({ en: en, de: de }); };
  var C = {
    en: { prompt: 'The best thing about Zurich is the', cands: [[' lake', 2.3], [' view', 1.6], [' food', 1.2], [' public', 0.9], [' old', 0.6], [' chocolate', 0.2], [' nightlife', -0.1], [' weather', -0.9]] },
    de: { prompt: 'Das Schönste an Zürich ist der', cands: [[' See', 2.3], [' Blick', 1.6], [' Fluss', 1.0], [' Zoo', 0.8], [' Herbst', 0.5], [' Käse', 0.1], [' Verkehr', -0.4], [' Regen', -0.9]] }
  };
  var state = { temp: 0.8, draws: [] };
  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  var lab = el('label', {}, ctl); var tl = el('span', {}, lab); var rng = el('input', { type: 'range', min: 0, max: 200, value: 80, 'aria-label': 'temperature' }, lab); var tv = el('span', { class: 'sp-temp' }, lab);
  var bS = el('button', { class: 'btn', type: 'button' }, ctl);
  var bC = el('button', { class: 'btn secondary', type: 'button' }, ctl);
  var wrap = el('div', { class: 'sp-wrap' }, root);
  var left = el('div', {}, wrap), right = el('div', { class: 'sp-out' }, wrap);
  var prompt = el('div', { class: 'sp-prompt' }, left);
  var bars = el('div', { class: 'bars' }, left);
  var k = el('div', { class: 'k' }, right); var draws = el('div', { class: 'draws' }, right); var summary = el('div', { class: 'small muted' }, right); summary.style.marginTop = '0.75rem';
  var barEls = [];
  function probs() {
    var c = C[ctx.lang()].cands, t = Math.max(state.temp, 0.02);
    var ex = c.map(function (x) { return Math.exp(x[1] / t); }), s = ex.reduce(function (a, b) { return a + b; }, 0);
    return ex.map(function (v) { return v / s; });
  }
  function build() {
    var c = C[ctx.lang()];
    prompt.innerHTML = ''; el('b', { text: c.prompt }, prompt); prompt.appendChild(document.createTextNode(' …'));
    bars.innerHTML = ''; barEls = [];
    c.cands.forEach(function (x) { el('div', { class: 'bt', text: x[0] }, bars); var bb = el('div', { class: 'bb' }, bars); var sp = el('span', {}, bb); var bp = el('div', { class: 'bp' }, bars); barEls.push({ sp: sp, bp: bp }); });
    update();
  }
  function update() {
    var p = probs();
    barEls.forEach(function (b, i) { b.sp.style.width = (p[i] * 100) + '%'; b.bp.textContent = (p[i] < 0.005 ? '< 1' : Math.round(p[i] * 100)) + ' %'; });
    tv.textContent = (state.temp).toFixed(1).replace('.', ctx.lang() === 'de' ? ',' : '.');
    tl.textContent = T('Temperature', 'Temperatur');
    bS.textContent = T('Draw 10 times', '10-mal ziehen'); bC.textContent = T('Clear', 'Leeren');
    k.textContent = T('Draws', 'Züge');
    renderDraws();
  }
  function renderDraws() {
    draws.innerHTML = '';
    var c = C[ctx.lang()].cands;
    state.draws.forEach(function (i, n) { var d = el('span', { class: 'draw' + (i >= 4 ? ' rare' : ''), text: c[i][0].trim() }, draws); d.style.animationDelay = (n * 40) + 'ms'; });
    if (!state.draws.length) { summary.textContent = T('Each draw picks one token at random, weighted by the bars.', 'Jeder Zug wählt zufällig ein Token, gewichtet nach den Balken.'); return; }
    var counts = {}; state.draws.forEach(function (i) { counts[i] = (counts[i] || 0) + 1; });
    var parts = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).map(function (i) { return c[i][0].trim() + ' ×' + counts[i]; });
    summary.textContent = parts.join(' · ') + (state.temp <= 0.05 ? ' — ' + T('always the same at temperature 0', 'bei Temperatur 0 immer dasselbe') : '');
  }
  function draw() {
    var p = probs();
    for (var n = 0; n < 10; n++) { var r = Math.random(), acc = 0, pick = 0; for (var i = 0; i < p.length; i++) { acc += p[i]; if (r <= acc) { pick = i; break; } } state.draws.push(pick); }
    if (state.draws.length > 40) state.draws = state.draws.slice(-40);
    renderDraws();
  }
  rng.addEventListener('input', function () { state.temp = rng.value / 100; update(); });
  bS.addEventListener('click', draw); bC.addEventListener('click', function () { state.draws = []; renderDraws(); });
  ctx.onLang(function () { state.draws = []; build(); });
  build();
  if (!ctx.reduced) setTimeout(function () { if (ctx.active() && !state.draws.length) draw(); }, 1200);
});
