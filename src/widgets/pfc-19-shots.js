App.widget('shots', function (root) {
  var el = App.el;
  var items = root.querySelectorAll('.shot-item');
  if (!items.length || App.mode === 'print') return; // PDF: all screenshots one below the other
  var seg = el('div', { class: 'seg shots-seg', role: 'group', 'aria-label': 'Schritt' });
  root.insertBefore(seg, root.firstChild);
  var btns = [];
  function show(i) {
    for (var k = 0; k < items.length; k++) { items[k].hidden = k !== i; btns[k].setAttribute('aria-pressed', String(k === i)); }
  }
  for (var i = 0; i < items.length; i++) (function (i) {
    var b = el('button', { type: 'button', text: items[i].getAttribute('data-label') }, seg);
    b.addEventListener('click', function () { show(i); });
    btns.push(b);
  })(i);
  show(0);
});
