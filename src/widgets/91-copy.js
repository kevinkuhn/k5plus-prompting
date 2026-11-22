App.widget('copy', function (root) {
  var el = App.el;
  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
    } else { fallback(text, done); }
  }
  function fallback(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta); done();
  }
  var pres = root.querySelectorAll('pre.cs-tpl');
  for (var i = 0; i < pres.length; i++) (function (pre) {
    var btn = el('button', { type: 'button', class: 'btn secondary cs-copy', text: 'Kopieren', 'data-copy': '', 'aria-label': 'Vorlage kopieren' });
    pre.appendChild(btn);
    btn.addEventListener('click', function () {
      var clone = pre.cloneNode(true); var b = clone.querySelector('.cs-copy'); if (b) clone.removeChild(b);
      copyText(clone.textContent.trim(), function () {
        btn.textContent = 'Kopiert ✓'; btn.classList.add('done');
        setTimeout(function () { btn.textContent = 'Kopieren'; btn.classList.remove('done'); }, 1500);
      });
    });
  })(pres[i]);
});
