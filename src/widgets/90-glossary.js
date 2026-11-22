App.widget('glossary', function (root) {
  var input = root.querySelector('.gl-input'), terms = root.querySelectorAll('.term'), empty = root.querySelector('.gl-empty');
  if (!input) return;
  function filter() {
    var q = input.value.trim().toLowerCase(), n = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      var hit = !q || t.textContent.toLowerCase().indexOf(q) >= 0;
      t.hidden = !hit; if (hit) n++;
    }
    if (empty) empty.hidden = n > 0;
  }
  input.addEventListener('input', filter);
  filter();
});
