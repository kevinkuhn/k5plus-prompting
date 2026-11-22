App.widget('checklist', function (root) {
  var el = App.el;
  var items = root.querySelectorAll('.check-list li');
  if (!items.length) return;
  root.classList.add('w');
  var foot = el('div', { class: 'ck-foot' }, root);
  var bar = el('div', { class: 'ck-bar' }, foot), fill = el('span', {}, bar);
  var count = el('span', { class: 'ck-count' }, foot);
  function render() {
    var n = root.querySelectorAll('.check-list li.done').length;
    fill.style.width = (n / items.length * 100) + '%';
    count.textContent = n === items.length ? 'Alle ' + n + ' Punkte erfüllt' : n + ' / ' + items.length + ' erfüllt';
  }
  for (var i = 0; i < items.length; i++) (function (li) {
    li.setAttribute('role', 'checkbox'); li.setAttribute('aria-checked', 'false'); li.tabIndex = 0;
    function toggle() { var on = li.classList.toggle('done'); li.setAttribute('aria-checked', String(on)); render(); }
    li.addEventListener('click', function (e) { if (e.target.closest('a')) return; toggle(); });
    li.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
  })(items[i]);
  render();
});
