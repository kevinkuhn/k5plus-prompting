App.widget('next-word', function (root, ctx) {
  var el = App.el, T = function (en, de) { return ctx.t({ en: en, de: de }); };
  var SEQ = {
    en: [
      { prompt: 'The capital of Switzerland is', steps: [
        [[' Bern', .71], [' not', .09], [' Zurich', .08], [' a', .05], [' located', .03]], 0,
        [[',', .44], ['.', .31], [' —', .08], [' (', .07], [' and', .05]], 0,
        [[' not', .52], [' which', .16], [' although', .11], [' a', .08], [' but', .06]], 0,
        [[' Zurich', .83], [' Geneva', .09], [' Basel', .03], [' the', .02], [' Bern', .01]], 0,
        [['.', .62], [',', .21], [' —', .07], [' as', .05], [' (', .03]], 0,
        [[' Many', .28], [' Bern', .22], [' The', .18], [' Although', .12], [' It', .09]], 0,
        [[' people', .77], [' visitors', .09], [' tourists', .06], [' Swiss', .04], [' assume', .02]], 0,
        [[' assume', .34], [' think', .31], [' believe', .19], [' are', .07], [' mistakenly', .05]], 1
      ] },
      { prompt: 'Once upon a time', steps: [
        [[',', .58], [' there', .31], [' in', .06], [' a', .03], [' the', .01]], 0,
        [[' there', .66], [' in', .19], [' a', .08], [' long', .03], [' far', .02]], 0,
        [[' was', .71], [' lived', .24], [' were', .03], [' existed', .01], [' stood', .01]], 1,
        [[' a', .87], [' an', .09], [' two', .02], [' the', .01], [' three', .01]], 0,
        [[' young', .14], [' king', .13], [' little', .12], [' poor', .11], [' girl', .09]], 3,
        [[' farmer', .32], [' fisherman', .21], [' woodcutter', .15], [' miller', .11], [' widow', .08]], 3,
        [[' who', .58], [' with', .17], [' named', .09], [' and', .06], ['.', .04]], 0,
        [[' had', .63], [' lived', .19], [' owned', .07], [' was', .05], [' could', .03]], 0
      ] },
      { prompt: 'To bake bread, you need', steps: [
        [[' flour', .61], [' four', .11], [' only', .07], [' three', .06], [' a', .05]], 0,
        [[',', .79], [' and', .11], ['.', .05], [' (', .02], [' –', .02]], 0,
        [[' water', .66], [' yeast', .21], [' salt', .09], [' sugar', .02], [' eggs', .01]], 0,
        [[',', .81], [' and', .13], ['.', .03], [' salt', .02], [' yeast', .01]], 0,
        [[' yeast', .47], [' salt', .44], [' sugar', .04], [' time', .03], [' butter', .01]], 1,
        [[' and', .71], [',', .24], ['.', .03], [' plus', .01], [' –', .01]], 0,
        [[' yeast', .88], [' time', .05], [' patience', .03], [' heat', .02], [' sugar', .01]], 0,
        [['.', .55], [',', .18], [' —', .12], [' (', .08], [' or', .04]], 0
      ] }
    ],
    de: [
      { prompt: 'Die Hauptstadt der Schweiz ist', steps: [
        [[' Bern', .74], [' nicht', .08], [' Zürich', .07], [' eine', .04], [' seit', .03]], 0,
        [[',', .41], ['.', .35], [' –', .09], [' (', .06], [' und', .05]], 0,
        [[' nicht', .55], [' obwohl', .13], [' auch', .10], [' die', .08], [' aber', .05]], 0,
        [[' Zürich', .85], [' Genf', .08], [' Basel', .03], [' Bern', .02], [' die', .01]], 0,
        [['.', .60], [',', .22], [' –', .08], [' wie', .05], [' (', .03]], 0,
        [[' Viele', .30], [' Bern', .20], [' Das', .17], [' Obwohl', .12], [' Die', .10]], 0,
        [[' Menschen', .50], [' Leute', .25], [' Touristen', .10], [' glauben', .08], [' Schweizer', .04]], 0,
        [[' glauben', .36], [' denken', .31], [' nehmen', .14], [' wissen', .08], [' vermuten', .05]], 0
      ] },
      { prompt: 'Es war einmal', steps: [
        [[' ein', .56], [' eine', .32], [' vor', .06], [',', .03], [' in', .02]], 1,
        [[' alte', .17], [' arme', .15], [' kleine', .13], [' Königin', .11], [' schöne', .09]], 1,
        [[' Müllerin', .27], [' Witwe', .22], [' Bäuerin', .18], [' Frau', .15], [' Fischerin', .07]], 0,
        [[',', .72], [' die', .15], [' mit', .06], ['.', .03], [' und', .02]], 0,
        [[' die', .83], [' deren', .07], [' und', .05], [' welche', .03], [' mit', .01]], 0,
        [[' drei', .24], [' eine', .19], [' einen', .17], [' zwei', .13], [' am', .08]], 0,
        [[' Söhne', .44], [' Töchter', .38], [' Kinder', .12], [' Ziegen', .03], [' Kühe', .02]], 1,
        [[' hatte', .79], [' besass', .09], [' liebte', .05], [' grossz', .04], [' aufzog', .02]], 0
      ] },
      { prompt: 'Für ein Brot braucht man', steps: [
        [[' Mehl', .63], [' nur', .12], [' vier', .07], [' drei', .05], [' eigentlich', .04]], 0,
        [[',', .77], [' und', .13], ['.', .05], [' Wasser', .03], [' (', .01]], 0,
        [[' Wasser', .68], [' Hefe', .19], [' Salz', .09], [' Zucker', .02], [' Eier', .01]], 0,
        [[',', .80], [' und', .14], ['.', .03], [' Salz', .02], [' Hefe', .01]], 0,
        [[' Salz', .46], [' Hefe', .45], [' Zucker', .04], [' Zeit', .03], [' Butter', .01]], 0,
        [[' und', .73], [',', .22], ['.', .03], [' sowie', .01], [' plus', .01]], 0,
        [[' Hefe', .86], [' Zeit', .06], [' Geduld', .04], [' Wärme', .02], [' Zucker', .01]], 0,
        [['.', .53], [',', .20], [' –', .13], [' (', .08], [' oder', .05]], 0
      ] }
    ]
  };
  var state = { seq: 0, step: 0, phase: 0, playing: !ctx.reduced, timer: null, tokens: [] };
  var ui = {};

  root.classList.add('w');
  var ctl = el('div', { class: 'ctl' }, root);
  ui.select = el('select', { class: 'nw-select', 'aria-label': 'Prompt' }, ctl);
  ui.select.style.cssText = 'font:inherit;padding:0.4rem 0.6rem;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink)';
  ui.play = el('button', { class: 'btn', type: 'button' }, ctl);
  ui.stepBtn = el('button', { class: 'btn secondary', type: 'button' }, ctl);
  ui.reset = el('button', { class: 'btn secondary', type: 'button' }, ctl);
  ui.text = el('div', { class: 'nw-text', 'aria-live': 'polite' }, root);
  ui.bars = el('div', { class: 'bars' }, root);
  ui.hint = el('div', { class: 'hint' }, root);

  function seqs() { return SEQ[ctx.lang()]; }
  function cur() { return seqs()[state.seq]; }

  function labels() {
    ui.play.textContent = state.playing ? T('Pause', 'Pause') : T('Play', 'Abspielen');
    ui.stepBtn.textContent = T('Step', 'Schritt');
    ui.reset.textContent = T('Restart', 'Neu starten');
    ui.hint.textContent = T('Each bar is one candidate for the next token; the highlighted one is chosen. Note that the choice is not always the most likely token (chapter 12).',
      'Jeder Balken ist ein Kandidat für das nächste Token; der hervorgehobene wird gewählt. Die Wahl fällt nicht immer auf das wahrscheinlichste Token.');
    ui.select.innerHTML = '';
    seqs().forEach(function (s, i) { var o = el('option', { value: i, text: s.prompt + ' …' }, ui.select); if (i === state.seq) o.selected = true; });
  }

  function renderText() {
    ui.text.innerHTML = '';
    el('span', { class: 'nw-prompt', text: cur().prompt }, ui.text);
    state.tokens.forEach(function (t, i) { el('span', { class: 'nw-tok' + (i === state.tokens.length - 1 && state.phase === 2 ? ' new' : ''), text: t }, ui.text); });
    el('span', { class: 'caret', 'aria-hidden': 'true' }, ui.text);
  }

  function renderBars(cands, hit) {
    ui.bars.innerHTML = '';
    cands.forEach(function (c, i) {
      var h = (i === hit) ? ' hit' : '';
      el('div', { class: 'bt' + h, text: c[0] === ',' || c[0] === '.' ? c[0] : c[0] }, ui.bars);
      var bb = el('div', { class: 'bb' }, ui.bars);
      var sp = el('span', { class: h.trim() }, bb);
      el('div', { class: 'bp' + h, text: Math.round(c[1] * 100) + ' %' }, ui.bars);
      requestAnimationFrame(function () { sp.style.width = (c[1] * 100) + '%'; });
    });
  }

  function reset(seqIndex) {
    clearTimeout(state.timer);
    state.seq = seqIndex == null ? state.seq : seqIndex;
    state.step = 0; state.phase = 0; state.tokens = [];
    renderText(); ui.bars.innerHTML = '';
    schedule(300);
  }

  // phases: 0 = show candidates, 1 = highlight pick, 2 = append
  function tick() {
    var s = cur(); var steps = s.steps;
    if (state.step * 2 >= steps.length) { // finished: restart after pause
      state.phase = 3;
      if (state.playing) schedule(2600, function () { reset(); });
      return;
    }
    var cands = steps[state.step * 2], pick = steps[state.step * 2 + 1];
    if (state.phase === 0) { renderBars(cands, -1); state.phase = 1; schedule(ctx.reduced ? 500 : 900); }
    else if (state.phase === 1) { renderBars(cands, pick); state.phase = 2; schedule(600); }
    else { state.tokens.push(cands[pick][0]); renderText(); state.step++; state.phase = 0; schedule(700); }
  }
  function schedule(ms, fn) {
    clearTimeout(state.timer);
    if (!state.playing && !fn) return;
    state.timer = setTimeout(function () { if (!ctx.active()) { schedule(ms, fn); return; } (fn || tick)(); }, ms);
  }

  ui.play.addEventListener('click', function () { state.playing = !state.playing; labels(); if (state.playing) schedule(200); else clearTimeout(state.timer); });
  ui.stepBtn.addEventListener('click', function () { state.playing = false; labels(); clearTimeout(state.timer); if (state.phase === 3) reset(); else tick(); });
  ui.reset.addEventListener('click', function () { reset(); });
  ui.select.addEventListener('change', function () { reset(parseInt(ui.select.value, 10)); });
  ctx.onLang(function () { labels(); reset(0); });

  labels();
  reset(0);
  if (!state.playing) { tick(); }
});
