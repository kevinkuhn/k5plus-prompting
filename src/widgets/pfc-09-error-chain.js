App.widget('error-chain', function (root) {
  var el = App.el, svg = App.svg;
  root.classList.add('w', 'ec');
  var ctl = el('div', { class: 'ctl' }, root);
  var l1 = el('label', {}, ctl); l1.appendChild(document.createTextNode('Je Schritt korrekt'));
  var rp = el('input', { type: 'range', min: '80', max: '99.9', step: '0.1', value: '95' }, l1); var vp = el('b', { class: 'tnum' }, l1);
  var l2 = el('label', {}, ctl); l2.appendChild(document.createTextNode('Schritte'));
  var rn = el('input', { type: 'range', min: '1', max: '30', step: '1', value: '10' }, l2); var vn = el('b', { class: 'tnum' }, l2);

  var top = el('div', { class: 'ec-top' }, root);
  var big = el('div', { class: 'kpi' }, top); var bigB = el('b', {}, big); el('span', { text: 'Wahrscheinlichkeit, dass alle Schritte korrekt sind' }, big);
  var chain = el('div', { class: 'ec-chain', 'aria-hidden': 'true' }, top);

  var W = 520, H = 210, P = { l: 36, r: 12, t: 10, b: 26 }, N = 30;
  var s = svg('svg', { viewBox: '0 0 ' + W + ' ' + H, class: 'ec-svg', role: 'img', 'aria-label': 'Kurve: Wahrscheinlichkeit nach Anzahl Schritte' }, root);
  function x(n) { return P.l + (n - 1) / (N - 1) * (W - P.l - P.r); }
  function y(v) { return P.t + (1 - v) * (H - P.t - P.b); }
  [0, 0.25, 0.5, 0.75, 1].forEach(function (v) {
    svg('line', { x1: P.l, x2: W - P.r, y1: y(v), y2: y(v), class: 'grid' }, s);
    svg('text', { x: P.l - 6, y: y(v) + 4, 'text-anchor': 'end', class: 'axis-label' }, s).textContent = (v * 100) + ' %';
  });
  [1, 5, 10, 15, 20, 25, 30].forEach(function (n) { svg('text', { x: x(n), y: H - 8, 'text-anchor': 'middle', class: 'axis-label' }, s).textContent = n; });
  function path(p) { var d = ''; for (var n = 1; n <= N; n++) d += (n === 1 ? 'M' : 'L') + x(n).toFixed(1) + ',' + y(Math.pow(p, n)).toFixed(1); return d; }
  [0.99, 0.9].forEach(function (p) {
    svg('path', { d: path(p), class: 'ec-ref' }, s);
    svg('text', { x: x(N) - 2, y: y(Math.pow(p, N)) - 5, 'text-anchor': 'end', class: 'axis-label' }, s).textContent = (p * 100) + ' % je Schritt';
  });
  var cur = svg('path', { class: 'ec-cur' }, s);
  var vline = svg('line', { class: 'ec-v' }, s);
  var dot = svg('circle', { r: 5, class: 'ec-dot' }, s);

  function fmtPct(v) { return (v * 100).toFixed(v >= 0.995 || v < 0.1 ? 1 : 0).replace('.', ',') + ' %'; }
  function render() {
    var p = rp.value / 100, n = +rn.value, v = Math.pow(p, n);
    vp.textContent = (+rp.value).toFixed(1).replace('.', ',').replace(',0', '') + ' %'; vn.textContent = n;
    bigB.textContent = fmtPct(v);
    big.classList.toggle('warm', v < 0.7);
    cur.setAttribute('d', path(p));
    vline.setAttribute('x1', x(n)); vline.setAttribute('x2', x(n)); vline.setAttribute('y1', P.t); vline.setAttribute('y2', H - P.b);
    dot.setAttribute('cx', x(n)); dot.setAttribute('cy', y(v));
    chain.innerHTML = '';
    for (var i = 1; i <= n; i++) { var c = el('span', {}, chain); c.style.opacity = (0.25 + 0.75 * Math.pow(p, i)).toFixed(2); }
  }
  rp.addEventListener('input', render); rn.addEventListener('input', render);
  render();
});
