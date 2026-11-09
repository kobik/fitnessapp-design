// openGym · Plan tab (iPhone exploration). Needs og/v2.js loaded first (tab bar + icons).
// OGPlan.mount({ dir: 'a' | 'b' | 'c', state, content, host })
//   a = Two lists, "Lists" layout (Schedule | Routines). The default.
//   c = Routine cards, "Cards" layout (each routine owns its days).
//   a and c are one screen with a Settings switch ("Plan layout: Lists · Cards") and share one editor,
//   built like workout C: the routine as a list, then one exercise open with its sets. Save bar until saved.
//   b = Week board (dropped; kept on the board for comparison, with its own Cancel / Save draft editor)
// Board message: { ogState: 'normal'|'routines'|'first'|'long'|'loop'|'edit'|'unsaved'|'delete'|'newr'|'settings' }
window.OGPlan = (() => {
  const ui = OGv2.ui;
  const SV = (b) => `<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
  const I = {
    more: SV('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
    right: SV('<path d="M9.5 5.5 16 12l-6.5 6.5"/>'),
    left: SV('<path d="M14.5 5.5 8 12l6.5 6.5"/>'),
    down: SV('<path d="M6 9.5l6 6 6-6"/>'),
    up: SV('<path d="M6 14.5l6-6 6 6"/>'),
    minus: SV('<path d="M6 12h12"/>'),
    plus: ui('plus'), x: ui('x'), check: ui('check'), clip: ui('clipboard'),
    pencil: SV('<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z"/><path d="M13.5 6.5l4 4"/>'),
    link: SV('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    share: SV('<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'),
    print: SV('<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>'),
    file: SV('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M12 11v6M9 14l3 3 3-3"/>'),
    moon: SV('<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>'),
    repeat: SV('<path d="M17 3l3 3-3 3"/><path d="M4 12v-2a4 4 0 0 1 4-4h12"/><path d="M7 21l-3-3 3-3"/><path d="M20 12v2a4 4 0 0 1-4 4H4"/>'),
    cal: SV('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>'),
    gear: SV('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>')
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));

  // ── data: the same story as Today. Week Mon 26 Oct – Sun 1 Nov 2026, today Wed 28. ──
  const DAYS = [['Mon', 'Monday', 26], ['Tue', 'Tuesday', 27], ['Wed', 'Wednesday', 28], ['Thu', 'Thursday', 29], ['Fri', 'Friday', 30], ['Sat', 'Saturday', 31], ['Sun', 'Sunday', 1]];
  const TODAY = 2;
  let U = 0;
  const uid = () => 'x' + (++U);
  const E = (n, sets, reps, w, rest, sg) => ({ u: uid(), n, sets, reps, w, rest, ss: Array.from({ length: sets }, () => ({ id: uid(), r: reps, w })), ...(sg ? { sg } : {}) });
  const MUSCLES = { push: ['Chest', 'Shoulders', 'Triceps'], pull: ['Back', 'Biceps', 'Rear delts'], legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] };
  const exPush = () => [E('Bench press', 4, 8, 75, 150), E('Incline dumbbell press', 3, 10, 26, 90), E('Overhead press', 3, 8, 50, 120), E('Lateral raise', 4, 12, 10, 60, 'A'), E('Triceps pushdown', 3, 12, 30, 60, 'A'), E('Dips', 3, 10, 0, 90)];
  const exPull = () => [E('Deadlift', 3, 5, 140, 180), E('Pull-up', 4, 8, 0, 120), E('Barbell row', 4, 8, 70, 120), E('Face pull', 3, 15, 25, 60), E('Hammer curl', 3, 10, 16, 60), E('Barbell curl', 3, 10, 35, 60)];
  const exLegs = () => [E('Back squat', 4, 6, 110, 180), E('Romanian deadlift', 3, 8, 100, 150), E('Leg press', 4, 10, 180, 120), E('Leg curl', 4, 12, 45, 60), E('Calf raise', 4, 15, 60, 60)];
  function sample() {
    return {
      mode: 'week',
      routines: [
        { id: 'push', name: 'Push A', rc: 'push', mus: MUSCLES.push, prog: 'linear', deload: false, ex: exPush() },
        { id: 'pull', name: 'Pull A', rc: 'pull', mus: MUSCLES.pull, prog: 'linear', deload: false, ex: exPull() },
        { id: 'legs', name: 'Legs', rc: 'legs', mus: MUSCLES.legs, prog: 'linear', deload: false, ex: exLegs() }
      ],
      week: [['legs'], [], ['push'], [], ['pull'], ['legs'], []],
      loop: { seq: ['legs', 'push', 'pull'], done: 1 }
    };
  }
  // A few catalogue exercises for "Add exercise" (the real picker searches the whole catalogue).
  const CATALOG = ['Cable fly', 'Push-up', 'Arnold press', 'Skull crusher', 'Chest-supported row', 'Bulgarian split squat', 'Single-arm cable lateral raise with lean-away and pause'];
  const STARTERS = [['ppl', 'Push / Pull / Legs', 3, 'Push, pull and legs each get their own day.'], ['ul', 'Upper / Lower', 4, 'Upper body twice, lower body twice.'],
    ['fb', 'Full Body', 3, 'Three sessions, the whole body each time.'], ['5x5', '5×5', 3, 'Five sets of five on the main barbell lifts.']];
  // Exercise stills and the how-to sheet use the shared stand-in animation (og/anim.js).
  const still = (e) => `<button type="button" class="pl-still" data-a="anim" data-u="${e.u}" aria-label="${esc(`How to do ${e.n}`)}">${OGAnim.figure(e.n, { still: true, tag: false })}</button>`;
  const HOW = {
    bench: ['Lie back with your feet flat and shoulder blades pulled together.', 'Lower the weight to your mid chest with control.', 'Press it back up until your arms are straight.'],
    overhead: ['Stand tall, weight at your shoulders, core tight.', 'Press straight up until your arms lock out overhead.', 'Lower it back to your shoulders with control.'],
    raise: ['Stand tall with a light weight in each hand.', 'Lift your arms out to the sides, elbows slightly bent, up to shoulder height.', 'Lower slowly. No swinging.'],
    squat: ['Feet about shoulder width, chest up.', 'Sit down and back until your thighs are about level with the floor.', 'Drive up through your whole foot.'],
    pull: ['Hang with straight arms, hands a little wider than your shoulders.', 'Pull your chest toward the bar.', 'Lower all the way down with control.'],
    pushdown: ['Stand at the cable with your elbows tucked at your sides.', 'Push the handle down until your arms are straight.', 'Let it come back up without moving your elbows.'],
    row: ['Hinge forward with a flat back, the weight hanging below you.', 'Pull it toward your lower ribs, elbows close.', 'Lower it with control.'],
    hinge: ['Stand close to the weight, back flat.', 'Push your hips back and lower the weight along your legs.', 'Stand up by driving your hips forward.'],
    dips: ['Hold the bars with straight arms, shoulders down.', 'Bend your elbows and lower until your upper arms are about level.', 'Press back up to straight arms.'],
    curl: ['Stand tall, elbows at your sides.', 'Curl the weight up toward your shoulders.', 'Lower it slowly all the way down.']
  };
  const PROG = [['off', 'No automatic progression', 'Targets stay where you set them.'], ['linear', 'Linear progression', 'Hit every rep in every set and the weight goes up.'],
    ['greyskull', 'Greyskull LP', 'Linear, with a last set for as many reps as you can.'], ['double', 'Double progression', 'Reps climb to the top of a range, then the weight goes up.'],
    ['triple', 'Triple progression', 'Reps, then sets, then weight.']];

  // ── formatting ──
  const exN = (n) => (n === 1 ? '1 exercise' : `${n} exercises`);
  const kg = (w) => String(Math.round(w * 10) / 10);
  const restF = (s) => (s ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}` : 'No timer');
  const live = (r) => r.ex.filter((e) => !e.gone);
  const setsOf = (r) => live(r).reduce((n, e) => n + e.sets, 0);
  const line = (e) => `${e.sets} × ${e.reps}${e.w ? ` · ${kg(e.w)} kg` : ''}`;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  const listJoin = (a) => (a.length < 2 ? a.join('') : `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}`);
  const F = {
    sets: { lab: 'Sets', step: 1, min: 1, max: 10, fmt: (v) => String(v), short: (v) => String(v) },
    reps: { lab: 'Reps', step: 1, min: 1, max: 50, fmt: (v) => String(v), short: (v) => String(v) },
    w: { lab: 'Weight', step: 2.5, min: 0, max: 500, fmt: (v) => (v ? `${kg(v)} kg` : 'Bodyweight'), short: (v) => (v ? kg(v) : '–') },
    rest: { lab: 'Rest', step: 15, min: 0, max: 600, fmt: restF, short: (v) => (v ? restF(v) : 'Off') }
  };
  const FIELDS = ['sets', 'reps', 'w', 'rest'];
  // per-set targets (A and C's editor). sets/reps/w follow the first set so the Plan pages and B keep working.
  const sync = (e) => { e.sets = e.ss.length; e.reps = e.ss[0].r; e.w = e.ss[0].w; };
  const rng = (a, f = String) => { const lo = Math.min(...a), hi = Math.max(...a); return lo === hi ? f(lo) : `${f(lo)}–${f(hi)}`; };
  const sumW = (e) => { const ws = e.ss.map((x) => x.w); return `${plural(e.ss.length, 'set')} · ${rng(e.ss.map((x) => x.r))} reps · ${ws.every((w) => !w) ? 'bodyweight' : `${rng(ws, kg)} kg`}`; };
  const stepV = (f, v, s) => Math.max(F[f].min, Math.min(F[f].max, Math.round((v + s * F[f].step) * 10) / 10));

  // ── module state ──
  let DIR = 'a', DIR0 = 'a', host, content, toastEl, toastT;
  let D, V;
  const R = (id) => D.routines.find((r) => r.id === id);
  const col = (r) => (r && r.rc ? `var(--${r.rc})` : '#8e8e93');
  const daysOf = (id) => D.week.map((ids, i) => (ids.includes(id) ? i : -1)).filter((i) => i >= 0);
  const namesOn = (i) => D.week[i].map(R).filter(Boolean);
  const cur = () => V.draft;
  function ssMap(ex) {
    const m = new Map(); let k = -1, prev = null, n = 0;
    ex.forEach((e) => { if (e.gone) return; if (e.sg) { if (e.sg !== prev) { k++; n = 0; } n++; m.set(e.u, String.fromCharCode(65 + k) + n); prev = e.sg; } else prev = null; });
    return m;
  }

  // ── draft (every editor): what changed against the routine as it was opened ──
  const orig = (e) => V.orig && V.orig.ex.find((x) => x.u === e.u);
  const fieldChanged = (e, f) => { const p = orig(e); return !!p && p[f] !== e[f]; };
  const isNewEx = (e) => !!V.orig && !orig(e);
  function changes() {
    if (!V.draft) return [];
    const o = V.orig, d = V.draft, out = [];
    if (o.name !== d.name) out.push('name');
    if (o.prog !== d.prog) out.push('prog');
    if (o.deload !== d.deload) out.push('deload');
    d.ex.forEach((e) => {
      const p = orig(e);
      if (!p) { if (!e.gone) out.push('add'); return; }
      if (e.gone) { out.push('remove'); return; }
      if (DIR === 'b') { FIELDS.forEach((f) => { if (p[f] !== e[f]) out.push(f); }); return; }
      for (let n = setDiffs(e); n > 0; n--) out.push('set');
      if (p.rest !== e.rest) out.push('rest');
    });
    const now = d.ex.filter((e) => !e.gone && orig(e)).map((e) => e.u);
    const was = o.ex.map((e) => e.u).filter((u) => now.includes(u));
    if (now.join() !== was.join()) out.push('order');
    return out;
  }
  const nChanges = () => changes().length;
  // sets are matched by id, not position: removing set 2 of a pyramid leaves sets 3 and 4 unchanged
  const origSet = (e, x) => { const p = orig(e); return p && p.ss.find((q) => q.id === x.id); };
  const setChg = (e, k) => { if (!orig(e)) return false; const x = e.ss[k], q = origSet(e, x); return !q || q.r !== x.r || q.w !== x.w; };
  const goneSets = (e) => { const p = orig(e); return p ? p.ss.map((q, k) => ({ q, k })).filter(({ q }) => !e.ss.some((x) => x.id === q.id)) : []; };
  const setDiffs = (e) => goneSets(e).length + e.ss.filter((_, k) => setChg(e, k)).length;
  const exChanged = (e) => !!orig(e) && (setDiffs(e) > 0 || orig(e).rest !== e.rest);
  const changesTxt = (n) => `${n} unsaved change${n === 1 ? '' : 's'}`;

  // ── overlays: sheet, alert, toast ──
  const stack = [];
  function trap(e, root) {
    if (e.key !== 'Tab') return;
    const f = [...root.querySelectorAll('button:not([disabled]), input, [tabindex="0"]')];
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  // A selector for the element that opened an overlay, so focus can return to its redrawn twin.
  function selOf(el) {
    if (!el || !el.closest) return null;
    if (el.id) return '#' + el.id;
    const k = ['a', 'act', 'tab', 'id', 'i', 'd', 'u', 'f', 's', 'v'].filter((x) => el.dataset[x] !== undefined);
    return k.length ? k.map((x) => `[data-${x}="${el.dataset[x]}"]`).join('') : null;
  }
  function refocus(prev, sel) {
    const t = prev && prev.isConnected ? prev : sel ? content.querySelector(sel) || host.querySelector(sel) : null;
    t?.focus({ preventScroll: true });
  }
  function sheet({ html, cls = '', label = 'pl-st', onAct, guard }) {
    const scrim = document.createElement('div'); scrim.className = 'scrim';
    const el = document.createElement('div');
    el.className = `sheet pl-sheet ${cls}`; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', label);
    const prev = document.activeElement, psel = selOf(prev);
    const api = {
      el,
      set(h) { el.innerHTML = `<span class="grab" aria-hidden="true"></span>${h}`; },
      close(then) {
        const i = stack.indexOf(api); if (i >= 0) stack.splice(i, 1);
        scrim.classList.remove('in'); el.classList.remove('in');
        setTimeout(() => { scrim.remove(); el.remove(); }, 200);
        if (then) then(); else refocus(prev, psel);
      },
      tryClose() { if (guard && !guard(api)) return; api.close(); }
    };
    api.set(html);
    host.append(scrim, el);
    stack.push(api);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      scrim.classList.add('in'); el.classList.add('in');
      (el.querySelector('[data-focus]') || el.querySelector('button:not([disabled])'))?.focus({ preventScroll: true });
    }));
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-x]'); if (!b || b.disabled) return;
      if (b.dataset.x === 'close') api.tryClose(); else onAct && onAct(b.dataset.x, b, api);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); api.tryClose(); }
      trap(e, el);
    });
    scrim.addEventListener('click', () => api.tryClose());
    return api;
  }
  function alertBox({ title, msg, ok, cancel = 'Cancel', danger = true, onOk, onCancel }) {
    const scrim = document.createElement('div'); scrim.className = 'scrim pl-ascrim';
    const el = document.createElement('div');
    el.className = 'pl-alert'; el.setAttribute('role', 'alertdialog'); el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-labelledby', 'pl-at'); el.setAttribute('aria-describedby', 'pl-am');
    el.innerHTML = `<h4 id="pl-at">${title}</h4><p id="pl-am">${msg}</p>
      <div class="pl-alert-acts"><button type="button" data-x="no">${cancel}</button><button type="button" data-x="ok" class="${danger ? 'is-danger' : 'is-strong'}">${ok}</button></div>`;
    const prev = document.activeElement, psel = selOf(prev);
    host.append(scrim, el);
    const api = {
      close(then) {
        const i = stack.indexOf(api); if (i >= 0) stack.splice(i, 1);
        scrim.classList.remove('in'); el.classList.remove('in');
        setTimeout(() => { scrim.remove(); el.remove(); }, 160);
        if (then) then(); else refocus(prev, psel);
      },
      tryClose() { api.close(); onCancel && onCancel(); }
    };
    stack.push(api);
    requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('in'); el.classList.add('in'); el.querySelector('[data-x="no"]').focus({ preventScroll: true }); }));
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-x]'); if (!b) return;
      if (b.dataset.x === 'ok') api.close(() => onOk && onOk()); else api.tryClose();
    });
    el.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); api.tryClose(); } trap(e, el); });
    scrim.addEventListener('click', () => api.tryClose());
    return api;
  }
  function closeAll() { [...stack].forEach((a) => a.close(() => {})); host.querySelectorAll('.scrim, .pl-sheet, .pl-alert').forEach((n) => n.remove()); stack.length = 0; }
  function toast(msg, undo) {
    toastEl.innerHTML = `<span>${msg}</span>${undo ? '<button type="button" data-undo>Undo</button>' : ''}`;
    toastEl._undo = undo || null;
    toastEl.classList.add('in'); clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('in'), undo ? 5000 : 2600);
  }

  // ── shared pieces ──
  const bars = (rs) => (rs.length ? rs.map((r) => `<i style="--c:${col(r)}"></i>`).join('') : '<i class="none"></i>');
  function header(sub, extra = '') {
    return `<header class="pl-hdr"><div class="od-stat"><h1 class="display">Plan</h1>${sub ? `<span class="pl-sub">${sub}</span>` : ''}</div>
      <div class="pl-hdr-acts">${extra}${DIR === 'b' ? '' : `<button type="button" class="iconbtn" data-a="settings" aria-label="Settings">${I.gear}</button>`}<button type="button" class="iconbtn" data-a="menu" aria-label="Plan options">${I.more}</button></div></header>`;
  }
  const emptyPlan = () => `<section class="pl-empty" aria-labelledby="pl-et"><span class="pl-empty-ic">${I.cal}</span>
    <h2 id="pl-et" class="display">No plan yet</h2>
    <p>Start from a ready-made plan and change anything later, or build your first routine yourself.</p>
    <div class="pl-empty-acts"><button type="button" class="pl-solid" data-a="starter">${I.clip}Load starter plan</button>
    <button type="button" class="pl-out" data-a="new">${I.plus}New routine</button></div></section>`;
  const loopState = (i) => (i < D.loop.done ? 'done' : i === D.loop.done ? 'next' : 'later');
  const LOOP_WORD = { done: 'Done', next: 'Up next', later: 'Later' };
  const canMv = (i, s) => i >= D.loop.done && i + s >= D.loop.done && i + s < D.loop.seq.length;
  const loopFoot = () => `${D.loop.done} of ${D.loop.seq.length} done this round.`;
  const stepRow = (f, v, was, attrs) => {
    const chg = was !== undefined && was !== v, M = F[f];
    return `<div class="pl-step${chg ? ' chg' : ''}"><span class="od-stat"><span class="lab">${M.lab}${chg ? '<i class="dot" aria-hidden="true"></i>' : ''}</span>
      <span class="was">${chg ? `was ${M.fmt(was)}` : '&nbsp;'}</span></span>
      <button type="button" class="pm" ${attrs} data-f="${f}" data-s="-1" aria-label="Less ${M.lab.toLowerCase()}" ${v <= M.min ? 'disabled' : ''}>${I.minus}</button>
      <output class="num${/^[\d.:]+( kg)?$/.test(M.fmt(v)) ? '' : ' txt'}" aria-live="polite">${M.fmt(v)}</output>
      <button type="button" class="pm" ${attrs} data-f="${f}" data-s="1" aria-label="More ${M.lab.toLowerCase()}" ${v >= M.max ? 'disabled' : ''}>${I.plus}</button></div>`;
  };

  // ═════════════════════ Direction A · Two lists ═════════════════════
  function planA() {
    let h = header('');
    if (!D.routines.length) return h + emptyPlan();
    h += `<div class="pl-seg" role="tablist" aria-label="Plan views">${[['schedule', 'Schedule'], ['routines', 'Routines']].map(([v, l]) =>
      `<button type="button" role="tab" data-a="view" data-v="${v}" aria-selected="${V.view === v}">${l}</button>`).join('')}</div>`;
    return h + (V.view === 'routines' ? routinesA() : scheduleA());
  }
  function scheduleA() {
    const loop = D.mode === 'loop';
    let h = `<div class="pl-group"><div class="pl-row pl-set"><span class="od-fill">How you train</span>
      <div class="pl-seg sm" role="radiogroup" aria-label="How you train">${[['week', 'Fixed week'], ['loop', 'Rotation']].map(([v, l]) =>
        `<button type="button" role="radio" data-a="modeset" data-v="${v}" aria-checked="${D.mode === v}">${l}</button>`).join('')}</div></div></div>
`;
    if (!loop) {
      h += `<h3 class="pl-sec">This week</h3><div class="pl-group">${D.week.map((_, i) => dayRowA(i)).join('')}</div>
        <p class="pl-foot">Want two routines on one day? Tap the day and pick both.</p>`;
    } else h += loopBlock();
    return h;
  }
  function dayRowA(i) {
    const rs = namesOn(i), [dw, full] = DAYS[i];
    const plain = rs.length ? rs.map((r) => r.name).join(' and ') : 'rest day';
    const sub = rs.length === 1 ? `${exN(live(rs[0]).length)} · ${setsOf(rs[0])} sets` : rs.length ? `${rs.length} routines together` : '';
    return `<button type="button" class="pl-row pl-day${rs.length ? '' : ' is-rest'}" data-a="day" data-d="${i}" aria-label="${esc(`${full}: ${plain}. Change`)}">
      <span class="dw">${dw}</span><span class="bars">${bars(rs)}</span>
      <span class="od-fill od-stat"><span class="t od-truncate">${rs.length ? rs.map((r) => esc(r.name)).join(' + ') : 'Rest'}</span>${sub ? `<span class="s">${sub}</span>` : ''}</span>
      <span class="chev">${I.right}</span></button>`;
  }
  function loopBlock() {
    const ed = V.loopEdit, seq = D.loop.seq;
    const rows = seq.map((id, i) => {
      const rest = id === 'rest', r = rest ? null : R(id), st = loopState(i), nm = rest ? 'Rest day' : r ? r.name : id;
      return `<div class="pl-row pl-loop is-${st}">
        ${ed ? `<button type="button" class="pl-minus" data-a="loop-out" data-i="${i}" aria-label="${esc(`Take ${nm} out of the loop`)}">${I.minus}</button>` : ''}
        <span class="ord num" aria-hidden="true">${st === 'done' ? I.check : i + 1}</span><span class="bars">${rest ? '<i class="none"></i>' : bars([r])}</span>
        <span class="od-fill od-stat"><span class="t od-truncate">${esc(nm)}</span><span class="s">${LOOP_WORD[st]}</span></span>
        ${ed ? `<span class="mv"><button type="button" data-a="loop-mv" data-i="${i}" data-s="-1" aria-label="${esc(`Move ${nm} earlier`)}" ${canMv(i, -1) ? '' : 'disabled'}>${I.up}</button><button type="button" data-a="loop-mv" data-i="${i}" data-s="1" aria-label="${esc(`Move ${nm} later`)}" ${canMv(i, 1) ? '' : 'disabled'}>${I.down}</button></span>` : ''}</div>`;
    }).join('');
    return `<div class="pl-sec-h"><h3 class="pl-sec">The loop</h3><div class="pl-sec-acts">
        ${seq.length ? `<button type="button" class="pl-textbtn" data-a="loop-edit" aria-pressed="${ed}">${ed ? 'Done' : 'Edit'}</button>` : ''}
        <button type="button" class="pl-out sm" data-a="loop-add">${I.plus}Add</button></div></div>
      ${seq.length ? `<div class="pl-group">${rows}</div>
      <p class="pl-foot">${loopFoot()} ${ed ? 'Arrows reorder what is still to come; done ones stay put. The minus takes one out; the routine itself stays.' : 'Trained out of order? Just pick another routine on Home.'}</p>
      <button type="button" class="pl-out" data-a="loop-over">Start the loop over</button>`
      : '<p class="pl-none">No rotation yet. Add routines in the order you want to train them.</p>'}`;
  }
  function routinesA() {
    const ed = V.listEdit, rs = D.routines;
    const rows = rs.map((r, i) => {
      const ds = daysOf(r.id).map((d) => DAYS[d][0]);
      const sub = `${exN(r.ex.length)} · ${ds.length ? ds.join(', ') : 'Not on the week'}`;
      const info = `<span class="bars">${bars([r])}</span><span class="od-fill od-stat"><span class="t od-clamp-2">${esc(r.name)}</span><span class="s">${sub}</span></span>`;
      if (!ed) return `<button type="button" class="pl-row pl-rt" data-a="open" data-id="${r.id}">${info}<span class="chev">${I.right}</span></button>`;
      return `<div class="pl-row pl-rt"><button type="button" class="pl-minus is-del" data-a="r-del" data-id="${r.id}" aria-label="${esc(`Delete ${r.name}`)}">${I.minus}</button>${info}
        <span class="mv"><button type="button" data-a="r-mv" data-i="${i}" data-s="-1" aria-label="${esc(`Move ${r.name} up`)}" ${i === 0 ? 'disabled' : ''}>${I.up}</button><button type="button" data-a="r-mv" data-i="${i}" data-s="1" aria-label="${esc(`Move ${r.name} down`)}" ${i === rs.length - 1 ? 'disabled' : ''}>${I.down}</button></span></div>`;
    }).join('');
    return `<div class="pl-sec-h"><button type="button" class="pl-textbtn" data-a="list-edit" aria-pressed="${ed}">${ed ? 'Done' : 'Edit'}</button>
        <button type="button" class="pl-out sm" data-a="new">${I.plus}New routine</button></div>
      <div class="pl-group">${rows}</div>
      <p class="pl-foot">${ed ? 'Use the arrows to reorder. The minus deletes, after asking.' : 'Tap a routine to edit it. Reorder and delete are behind Edit.'}</p>`;
  }
  // ═════════════════════ Direction B · Week board ═════════════════════
  function modePill() {
    const loop = D.mode === 'loop', n = D.week.filter((ids) => ids.some((id) => R(id))).length;
    return `<button type="button" class="pl-mode" data-a="mode" aria-label="How you train: ${loop ? 'Rotation' : 'Fixed week'}. Change">${loop ? I.repeat : I.cal}<span>${loop ? 'Rotation' : 'Fixed week'}</span>
      <span class="dim">${loop ? `${D.loop.seq.length} in the loop` : `${n} workout days`}</span>${I.down}</button>`;
  }
  function planB() {
    if (!D.routines.length) return header('') + emptyPlan();
    const loop = D.mode === 'loop';
    let h = header('', '') + modePill();
    if (!loop) {
      h += `<ol class="pb-tt" aria-label="This week">${D.week.map((_, i) => {
        const rs = namesOn(i), t = i === TODAY, [dw, full, dn] = DAYS[i];
        const plain = rs.length ? rs.map((r) => r.name).join(' and ') : 'rest day';
        return `<li><button type="button" class="pb-d${t ? ' is-today' : ''}${rs.length ? '' : ' is-rest'}" data-a="day" data-d="${i}" aria-label="${esc(`${full}${t ? ', today' : ''}: ${plain}. Change`)}">
          <span class="dw"><b class="display">${dw}</b><span class="num">${dn}</span></span>
          <span class="nm display od-fill">${rs.length ? rs.map((r) => `<span style="color:${col(r)}">${esc(r.name)}</span>`).join('<span class="amp"> + </span>') : 'Rest'}</span>
          ${t ? '<span class="pl-tag">Today</span>' : ''}</button></li>`;
      }).join('')}</ol><p class="pl-foot">Tap a day to change it. Two routines on one day train together.</p>`;
    } else {
      const ed = V.loopEdit, seq = D.loop.seq;
      h += `<div class="pl-sec-h"><h2 class="display pb-h2">The loop</h2><div class="pl-sec-acts">
        ${seq.length ? `<button type="button" class="pl-textbtn" data-a="loop-edit" aria-pressed="${ed}">${ed ? 'Done' : 'Edit'}</button>` : ''}
        <button type="button" class="pl-out sm" data-a="loop-add">${I.plus}Add</button></div></div>
        ${seq.length ? `<ol class="pb-loop">${seq.map((id, i) => {
          const rest = id === 'rest', r = rest ? null : R(id), st = loopState(i), nm = rest ? 'Rest day' : r.name;
          return `<li class="pb-lp is-${st}">${ed ? `<button type="button" class="pl-minus" data-a="loop-out" data-i="${i}" aria-label="${esc(`Take ${nm} out of the loop`)}">${I.minus}</button>` : ''}
            <span class="ord display num">${String(i + 1).padStart(2, '0')}</span>
            <span class="od-fill od-stat"><span class="nm display od-clamp-2" style="color:${rest ? 'var(--text-2)' : col(r)}">${esc(nm)}</span><span class="st">${st === 'done' ? `${I.check}Done` : LOOP_WORD[st]}</span></span>
            ${ed ? `<span class="mv"><button type="button" data-a="loop-mv" data-i="${i}" data-s="-1" aria-label="${esc(`Move ${nm} earlier`)}" ${canMv(i, -1) ? '' : 'disabled'}>${I.up}</button><button type="button" data-a="loop-mv" data-i="${i}" data-s="1" aria-label="${esc(`Move ${nm} later`)}" ${canMv(i, 1) ? '' : 'disabled'}>${I.down}</button></span>` : ''}</li>`;
        }).join('')}</ol><p class="pl-foot">${loopFoot()} Whatever is next stays next until you train it.</p>
        <button type="button" class="pl-textbtn" data-a="loop-over">Start the loop over</button>`
        : '<p class="pl-none">No rotation yet. Add routines in the order you want to train them.</p>'}`;
    }
    h += `<div class="pl-sec-h" id="pb-routines"><h2 class="display pb-h2">Routines</h2><button type="button" class="pl-out sm" data-a="new">${I.plus}New</button></div>
      <div class="pb-grid">${D.routines.map((r) => {
        const ds = daysOf(r.id).map((d) => DAYS[d][0]);
        return `<button type="button" class="pb-tile" data-a="open" data-id="${r.id}" style="--c:${col(r)}"><span class="nm display">${esc(r.name)}</span>
          <span class="s">${exN(r.ex.length)} · ${setsOf(r)} sets</span><span class="days">${loop ? (D.loop.seq.includes(r.id) ? 'In the loop' : 'Not in the loop') : ds.length ? ds.join(' · ') : 'Not on the week'}</span></button>`;
      }).join('')}</div>`;
    return h;
  }
  function editB() {
    const d = V.draft, n = nChanges(), ss = ssMap(d.ex), ds = daysOf(d.id).map((x) => DAYS[x][1]);
    let k = 0;
    const rows = d.ex.map((e) => {
      if (e.gone) return `<li class="pb-ex is-gone"><span class="od-fill od-stat"><s class="t od-truncate">${esc(e.n)}</s><span class="s">Removed. Gone once you save.</span></span>
        <button type="button" class="pl-textbtn" data-a="unrm" data-u="${e.u}">Undo</button></li>`;
      const i = k++, open = V.open === e.u, nw = isNewEx(e), chg = FIELDS.filter((f) => fieldChanged(e, f)).length;
      const flag = nw ? '<i class="dot"></i>New · ' : chg ? '<i class="dot"></i>Changed · ' : '';
      return `<li class="pb-ex${open ? ' is-open' : ''}${chg || nw ? ' chg' : ''}"><div class="pb-row">${still(e)}<button type="button" class="hd" data-a="toggle" data-u="${e.u}" aria-expanded="${open}">
          <span class="od-fill od-stat"><span class="t od-clamp-2">${ss.get(e.u) ? `<b class="pl-ssb num">${ss.get(e.u)}</b>` : ''}${esc(e.n)}</span><span class="s">${flag}${e.w ? `${kg(e.w)} kg · ` : ''}Rest ${restF(e.rest)}</span></span>
          <span class="big display num" aria-label="${e.sets} sets of ${e.reps}">${e.sets}×${e.reps}</span></button></div>
        ${open ? `<div class="pb-panel">${FIELDS.map((f) => stepRow(f, e[f], nw ? undefined : orig(e)[f], `data-a="step" data-u="${e.u}"`)).join('')}
          <div class="pb-tools"><button type="button" class="pl-out sm" data-a="dmv" data-u="${e.u}" data-s="-1" ${i === 0 ? 'disabled' : ''}>${I.up}Up</button>
          <button type="button" class="pl-out sm" data-a="dmv" data-u="${e.u}" data-s="1" ${i === live(d).length - 1 ? 'disabled' : ''}>${I.down}Down</button>
          <button type="button" class="pl-textbtn danger" data-a="rm" data-u="${e.u}">Remove</button></div></div>` : ''}</li>`;
    }).join('');
    return `<div class="pb-nav"><button type="button" class="pl-textbtn" data-a="cancel">Cancel</button><span class="ttl">${V.isNew ? 'New routine' : 'Edit routine'}</span>
        <button type="button" class="pl-textbtn strong" data-a="save" ${n ? '' : 'disabled'}>Save</button></div>
      <div class="pb-pend${n ? ' on' : ''}" role="status">${n ? `<i class="dot" aria-hidden="true"></i><b>${changesTxt(n)}</b><span>Save keeps them. Cancel drops them.</span>` : ''}</div>
      <div class="pb-hero" style="--c:${col(d)}"><span class="kick">${ds.length ? `On ${listJoin(ds)}` : 'Not on the week yet'}</span>
        <h1 class="display${V.orig.name !== d.name ? ' chg' : ''}">${esc(d.name)}</h1>
        <div class="pb-hero-row"><span class="pl-meta">${exN(live(d).length)} · ${setsOf(d)} sets</span><button type="button" class="pl-textbtn" data-a="rename">${I.pencil}Rename</button></div></div>
      <div class="pl-sec-h"><h3 class="pl-sec">Exercises</h3><button type="button" class="pl-out sm" data-a="add-ex">${I.plus}Add exercise</button></div>
      ${d.ex.length ? `<ol class="pb-exl">${rows}</ol><p class="pl-foot">Tap an exercise to change its targets or move it.</p>` : '<p class="pl-none">No exercises yet. Add your first one.</p>'}
      <button type="button" class="pl-solid pb-save2" data-a="save" ${n ? '' : 'disabled'}>${n ? `Save ${changesTxt(n).replace(' unsaved', '')}` : 'No changes to save'}</button>
      ${V.isNew ? '' : '<button type="button" class="pl-danger" data-a="delete">Delete routine</button>'}`;
  }

  // ═════════════════════ Direction C · Routine cards ═════════════════════
  function planC() {
    if (!D.routines.length) return header('') + emptyPlan();
    const loop = D.mode === 'loop';
    let rs = D.routines.slice();
    if (loop) rs.sort((a, b) => (D.loop.seq.indexOf(a.id) + 1 || 99) - (D.loop.seq.indexOf(b.id) + 1 || 99));
    const cards = rs.map((r) => {
      const ex = live(r), pv = ex.slice(0, 3).map((e) => esc(e.n)).join(' · ') + (ex.length > 3 ? ` · +${ex.length - 3}` : '');
      let foot;
      if (!loop) {
        foot = `<div class="pc-days" role="group" aria-label="${esc(`Days for ${r.name}`)}">${DAYS.map(([dw, full], i) => {
          const on = D.week[i].includes(r.id);
          return `<button type="button" class="pc-dt${on ? ' on' : ''}" data-a="tog" data-id="${r.id}" data-d="${i}" aria-pressed="${on}" aria-label="${full}">${dw.slice(0, 2)}</button>`;
        }).join('')}</div>`;
      } else {
        const at = D.loop.seq.indexOf(r.id);
        foot = at < 0 ? `<div class="pc-lp"><span class="od-fill dim">Not in the loop</span><button type="button" class="pl-out sm" data-a="loop-addr" data-id="${r.id}">${I.plus}Add to the loop</button></div>`
          : `<div class="pc-lp is-${loopState(at)}"><span class="ord num">${loopState(at) === 'done' ? I.check : at + 1}</span><span class="od-fill">${LOOP_WORD[loopState(at)]}</span>
            <span class="mv"><button type="button" data-a="loop-mv" data-i="${at}" data-s="-1" aria-label="${esc(`Move ${r.name} earlier`)}" ${canMv(at, -1) ? '' : 'disabled'}>${I.up}</button><button type="button" data-a="loop-mv" data-i="${at}" data-s="1" aria-label="${esc(`Move ${r.name} later`)}" ${canMv(at, 1) ? '' : 'disabled'}>${I.down}</button>
            <button type="button" data-a="loop-out" data-i="${at}" aria-label="${esc(`Take ${r.name} out of the loop`)}">${I.minus}</button></span></div>`;
      }
      return `<article class="pc-card" style="--c:${col(r)}"><button type="button" class="pc-head" data-a="open" data-id="${r.id}" aria-label="${esc(`Edit ${r.name}`)}">
          <span class="od-fill od-stat"><span class="nm display od-clamp-2">${esc(r.name)}</span><span class="s">${exN(ex.length)} · ${setsOf(r)} sets</span>
          ${pv ? `<span class="pv od-truncate">${pv}</span>` : ''}</span><span class="chev">${I.right}</span></button>${foot}</article>`;
    }).join('');
    return header('') + modePill() + `<div class="pc-list">${cards}</div>
      <button type="button" class="pl-out wide" data-a="new">${I.plus}New routine</button>
      <p class="pl-foot">${loop ? `${loopFoot()} Whatever is next stays next until you train it.` : 'Tap a day on a routine to put it there or take it off. Two routines on one day train together.'}</p>
      ${loop && D.loop.seq.length ? '<button type="button" class="pl-textbtn" data-a="loop-over">Start the loop over</button>' : ''}`;
  }
  // Shared editor (A and C), modeled on workout C: the whole routine as a list, or one exercise open with its sets.
  function editC() {
    const d = V.draft, open = V.exOpen && findEx(V.exOpen);
    if (open && !open.gone) return exOpenW(d, open);
    V.exOpen = V.setSel = null;
    const ss = ssMap(d.ex), ds = daysOf(d.id).map((x) => DAYS[x][0]);
    let k = 0;
    const rows = d.ex.map((e) => {
      if (e.gone) return `<li class="pw-row is-gone"><span class="od-fill od-stat"><s class="t od-truncate">${esc(e.n)}</s><span class="s">Removed. Gone once you save.</span></span>
        <button type="button" class="pl-textbtn" data-a="unrm" data-u="${e.u}">Undo</button></li>`;
      const i = k++, nw = isNewEx(e) && !V.isNew, chg = exChanged(e);
      const name = `<span class="t od-clamp-2">${ss.get(e.u) ? `<b class="pw-ss num">${ss.get(e.u)}</b>` : ''}${esc(e.n)}</span>`;
      const sub = `<span class="s">${nw ? '<i class="dot"></i>New · ' : chg ? '<i class="dot"></i>Changed · ' : ''}${sumW(e)} · ${e.rest ? `rest ${restF(e.rest)}` : 'no rest timer'}</span>`;
      if (V.reorder) return `<li class="pw-row${chg || nw ? ' chg' : ''}"><span class="od-fill od-stat">${name}${sub}</span>
        <span class="mv"><button type="button" data-a="dmv" data-u="${e.u}" data-s="-1" aria-label="${esc(`Move ${e.n} up`)}" ${i === 0 ? 'disabled' : ''}>${I.up}</button><button type="button" data-a="dmv" data-u="${e.u}" data-s="1" aria-label="${esc(`Move ${e.n} down`)}" ${i === live(d).length - 1 ? 'disabled' : ''}>${I.down}</button>
        <button type="button" data-a="rm" data-u="${e.u}" aria-label="${esc(`Remove ${e.n}`)}">${I.minus}</button></span></li>`;
      return `<li class="pw-row${chg || nw ? ' chg' : ''}">${still(e)}<button type="button" class="pw-main" data-a="xopen" data-u="${e.u}"><span class="od-fill od-stat">${name}${sub}</span><span class="chev">${I.right}</span></button></li>`;
    }).join('');
    return `<div class="pl-nav"><button type="button" class="pl-back" data-a="back">${I.left}Plan</button>
        <span class="pl-nav-acts">${d.ex.length ? `<button type="button" class="pl-textbtn" data-a="reorder" aria-pressed="${V.reorder}">${V.reorder ? 'Done' : 'Reorder'}</button>` : ''}
        <button type="button" class="iconbtn" data-a="ropts" aria-label="Routine options">${I.more}</button></span></div>
      <div class="pc-title" style="--c:${col(d)}"><h1 class="display${V.orig.name !== d.name ? ' chg' : ''}">${esc(d.name)}</h1>
        <button type="button" class="iconbtn" data-a="rename" aria-label="Rename routine">${I.pencil}</button></div>
      <p class="pl-meta">${ds.length ? ds.join(', ') : 'Not on the week yet'} · ${exN(live(d).length)} · ${setsOf(d)} sets</p>
      ${d.ex.length ? `<ol class="pw-list">${rows}</ol>` : '<p class="pl-none">No exercises yet. Add your first one.</p>'}
      <button type="button" class="pl-out wide" data-a="add-ex">${I.plus}Add exercise</button>
      <p class="pl-foot">${V.reorder ? 'Arrows move an exercise. The minus takes it out; nothing is gone until you save.' : 'Tap an exercise to see and change its sets. Nothing is kept until you tap Save.'}</p>
      ${V.isNew ? '' : '<button type="button" class="pl-danger" data-a="delete">Delete routine</button>'}`;
  }
  function exOpenW(d, e) {
    const L = live(d), i = L.indexOf(e), p = orig(e), sg = ssMap(d.ex).get(e.u);
    const prev = L[i - 1], next = L[i + 1];
    const fresh = V.isNew || isNewEx(e);
    const sets = e.ss.map((x, k) => {
      const sel = V.setSel === k, chg = !fresh && setChg(e, k), q = origSet(e, x);
      const wv = x.w ? `${kg(x.w)} kilograms` : 'bodyweight';
      // the selected set's numbers live in its steppers, so the row shows only the set number
      return `<li class="pw-set${sel ? ' is-sel' : ''}${chg ? ' chg' : ''}"><button type="button" class="pw-sr" data-a="sset" data-k="${k}" aria-expanded="${sel}"
          aria-label="${esc(`Set ${k + 1}: ${x.r} reps, ${wv}${chg ? (q ? ', changed' : ', new set') : ''}`)}"><span class="n num" aria-hidden="true">${k + 1}</span>
          ${sel ? `<span class="pw-sl" aria-hidden="true">Set ${k + 1}${chg && !q ? ' · new' : ''}</span>` : `<span class="v num" aria-hidden="true">${x.r}<small>reps</small></span><span class="v num" aria-hidden="true">${x.w ? kg(x.w) : '–'}<small>${x.w ? 'kg' : 'bodyweight'}</small></span>`}
          <span class="chev" aria-hidden="true">${sel ? I.up : I.down}</span></button>
        ${sel ? `<div class="pw-ed">${stepRow('reps', x.r, q ? q.r : undefined, `data-a="sstep" data-k="${k}"`)}${stepRow('w', x.w, q ? q.w : undefined, `data-a="sstep" data-k="${k}"`)}
          ${e.ss.length > 1 ? `<button type="button" class="pl-textbtn" data-a="sdel" data-k="${k}">Remove set ${k + 1}</button>` : ''}</div>` : ''}</li>`;
    }).join('');
    // sets taken off the end stay visible until Save, with a way back
    // removed sets stay visible until Save, named by their original number, with Undo
    const gone = fresh ? '' : goneSets(e).map(({ q, k }) => `<li class="pw-set chg is-gone"><div class="pw-sr"><span class="n num" aria-hidden="true">–</span>
        <span class="pw-sl">Set ${k + 1} removed · ${q.r} reps · ${q.w ? `${kg(q.w)} kg` : 'bodyweight'}</span><button type="button" class="pl-textbtn" data-a="sback" data-id="${q.id}" aria-label="Undo removing set ${k + 1}">Undo</button></div></li>`).join('');
    const long = e.n.length > 32;
    return `<div class="pl-nav"><button type="button" class="pl-back" data-a="xlist">${I.left}All exercises</button>
        <span class="pw-pager"><span class="num">${i + 1} of ${L.length}</span>
        <button type="button" class="iconbtn" data-a="xnav" data-s="-1" aria-label="${esc(prev ? `Previous: ${prev.n}` : 'Previous')}" ${prev ? '' : 'disabled'}>${I.left}</button>
        <button type="button" class="iconbtn" data-a="xnav" data-s="1" aria-label="${esc(next ? `Next: ${next.n}` : 'Next')}" ${next ? '' : 'disabled'}>${I.right}</button></span></div>
      <section class="pw-open" data-swipe aria-label="${esc(e.n)}">
        <div class="pw-head">${still(e)}<h2 class="pw-h"><button type="button" class="pw-title" data-a="xlist" aria-label="${esc(`${e.n}. Back to all exercises`)}">
          ${sg ? `<span class="pw-kick">Superset ${sg}</span>` : isNewEx(e) && !V.isNew ? '<span class="pw-kick">New in this routine</span>' : ''}<span class="display${long ? ' is-long' : ''}">${esc(e.n)}</span></button></h2></div>
        <ol class="pw-sets">${sets}${gone}</ol>
        <button type="button" class="pl-out wide" data-a="sadd" ${e.ss.length >= F.sets.max ? 'disabled' : ''}>${I.plus}Add set</button>
        <div class="pl-group pw-rest">${stepRow('rest', e.rest, p ? p.rest : undefined, `data-a="step" data-u="${e.u}"`)}</div>
      </section>
      <p class="pl-foot">Tap a set to change it. Each set can have its own reps and weight. ‹ › or a swipe goes to the next exercise.</p>`;
  }
  function saveBarC() {
    const n = nChanges(); if (!n) return '';
    return `<div class="pc-save" role="region" aria-label="Unsaved changes"><span class="od-fill" role="status"><i class="dot" aria-hidden="true"></i><b>${changesTxt(n)}</b></span>
      <button type="button" class="pl-ghost" data-a="undoall">Undo all</button><button type="button" class="pl-solid sm" data-a="save">Save</button></div>`;
  }

  // ═════════════════════ Settings (stand-in: only the Plan layout row) ═════════════════════
  const LAYOUTS = [['a', 'Lists', 'Your week as a list of days, with your routines one tap away.'], ['c', 'Cards', 'Each routine as a card with its own day buttons.']];
  function settingsPage() {
    const [, , desc] = LAYOUTS.find(([k]) => k === DIR);
    return `<div class="pl-nav"><button type="button" class="pl-back" data-a="back">${I.left}Plan</button></div>
      <h1 class="display pl-set-h">Settings</h1>
      <div class="pl-group"><div class="pl-row pl-set"><span class="od-fill">Plan layout</span>
        <div class="pl-seg sm" role="group" aria-label="Plan layout">${LAYOUTS.map(([k, l]) =>
          `<button type="button" data-a="layout" data-v="${k}" aria-pressed="${DIR === k}">${l}</button>`).join('')}</div></div></div>
      <p class="pl-foot" role="status">${desc} Editing a routine works the same in both.</p>
      <p class="pl-foot">Only this row is designed so far. The rest of Settings comes later.</p>`;
  }
  function setLayout(k) {
    if (k === DIR) return;
    DIR = k; host.dataset.pl = k; V.view = 'schedule'; V.listEdit = V.loopEdit = false;
    draw(`[data-a="layout"][data-v="${k}"]`);
  }

  // ═════════════════════ draw + actions ═════════════════════
  function draw(focusSel, keepScroll = true) {
    const sc = content.querySelector('.od-scroll'), top = sc && keepScroll ? sc.scrollTop : 0;
    const editing = V.screen === 'edit';
    const body = V.screen === 'settings' ? settingsPage() : { a: [planA, editC], b: [planB, editB], c: [planC, editC] }[DIR][editing ? 1 : 0]();
    const modal = DIR === 'b' && editing;
    const bar = DIR !== 'b' && editing ? saveBarC() : '';
    // both layouts share C's editor, so the editor wears C's class
    const cls = editing && DIR === 'a' ? 'c' : DIR;
    const t0 = namesOn(TODAY)[0];
    host.dataset.rc = t0 && t0.rc ? t0.rc : 'none';
    content.innerHTML = `<div class="app v2 od-screen pl pl-${cls}${modal ? ' pl-modal' : ' tabs-combo tabs-capsule'}${bar ? ' has-save' : ''}">
      <div class="od-scroll"><div class="pl-in">${body}</div></div>${modal ? '' : OGv2.tabbarHTML('Plan')}${bar}</div>`;
    content.querySelector('.od-scroll').scrollTop = top;
    if (focusSel) content.querySelector(focusSel)?.focus({ preventScroll: true });
  }
  const go = (screen, focusSel) => { V.screen = screen; draw(focusSel, false); };
  function startEdit(id, isNew) {
    V.editId = id; V.isNew = !!isNew; V.open = null; V.reorder = false; V.exOpen = null; V.setSel = null;
    V.orig = isNew ? { id, name: 'New routine', rc: null, prog: 'linear', deload: false, ex: [] } : clone(R(id)); V.draft = clone(V.orig);
    V.screen = 'edit';
  }
  function newRoutine() {
    const id = 'n' + uid();
    startEdit(id, true);
  }
  function dropRoutine(id) {
    const r = R(id); if (!r) return;
    D.routines = D.routines.filter((x) => x.id !== id);
    D.week = D.week.map((ids) => ids.filter((x) => x !== id));
    D.loop.seq.forEach((x, i) => { if (x === id && i < D.loop.done) D.loop.done--; });
    D.loop.seq = D.loop.seq.filter((x) => x !== id);
  }
  function confirmDelete(id, after) {
    const r = id === (V.draft && V.draft.id) ? V.draft : R(id); if (!r) return;
    const ds = daysOf(id).map((d) => DAYS[d][1]);
    alertBox({
      title: `Delete ${esc(r.name)}?`,
      msg: `${esc(r.name)} and its ${exN(live(r).length)} will be removed${ds.length ? `, and ${listJoin(ds)} become${ds.length === 1 ? 's' : ''} a rest day` : ''}. Past workouts stay in your history.`,
      ok: 'Delete',
      onOk: () => { const nm = r.name, wasEdit = V.screen === 'edit'; dropRoutine(id); V.draft = null; V.screen = 'plan'; draw(after, !wasEdit); toast(`${esc(nm)} deleted`); }
    });
  }
  // leaving a dirty draft (b: Cancel, c: back or a tab) asks first
  function leave(then) {
    const n = nChanges();
    if (!n) { V.draft = null; V.exOpen = V.setSel = null; then(); return; }
    alertBox({ title: `Discard ${changesTxt(n).replace(' unsaved', '')}?`, msg: `${esc(V.draft.name)} stays as it was before you started editing.`, ok: 'Discard', cancel: 'Keep editing',
      onOk: () => { V.draft = null; V.exOpen = V.setSel = null; then(); } });
  }
  function saveDraft() {
    const d = V.draft; d.ex = d.ex.filter((e) => !e.gone);
    if (V.isNew) D.routines.push(d); else D.routines[D.routines.findIndex((r) => r.id === d.id)] = d;
    if (V.isNew && DIR === 'a') V.view = 'routines';
    V.draft = null; V.exOpen = V.setSel = null; V.screen = 'plan'; draw(`[data-a="open"][data-id="${d.id}"]`, false); toast(`${esc(d.name)} saved`);
  }
  const findEx = (u) => V.draft.ex.find((e) => e.u === u);
  function moveDraft(u, s) {
    const ex = V.draft.ex, liveIdx = ex.map((e, i) => (e.gone ? -1 : i)).filter((i) => i >= 0);
    const at = liveIdx.indexOf(ex.findIndex((e) => e.u === u)), to = at + s;
    if (to < 0 || to >= liveIdx.length) return;
    const a = liveIdx[at], b = liveIdx[to];[ex[a], ex[b]] = [ex[b], ex[a]];
  }

  function daySheet(i) {
    const html = () => {
      const ids = D.week[i], [, full, dn] = DAYS[i];
      return `<div class="ds-top"><div class="od-stat"><span class="pl-kick">${dn} ${i === 6 ? 'November' : 'October'}</span><h4 id="pl-st" class="display">${full}</h4></div>
        <button type="button" class="ds-x" data-x="close" aria-label="Close">${I.x}</button></div>
        <p class="pl-sheet-sub">Pick one routine, or more to train them together.</p>
        <div class="pl-group pl-pick">
          <button type="button" class="pl-row pl-opt" data-x="rest" aria-pressed="${!ids.length}"><span class="bars"><i class="none"></i></span><span class="od-fill">Rest day</span><span class="ck">${ids.length ? '' : I.check}</span></button>
          ${D.routines.map((r) => { const on = ids.includes(r.id); return `<button type="button" class="pl-row pl-opt" data-x="pick" data-id="${r.id}" aria-pressed="${on}"><span class="bars">${bars([r])}</span>
            <span class="od-fill od-stat"><span class="t od-truncate">${esc(r.name)}</span><span class="s">${exN(r.ex.length)}</span></span><span class="ck">${on ? (ids.length > 1 ? `<b class="num">${ids.indexOf(r.id) + 1}</b>` : I.check) : ''}</span></button>`; }).join('')}
        </div>
        ${ids.length > 1 ? `<p class="pl-sheet-sub">${ids.map((id) => esc(R(id).name)).join(' then ')}, in one workout.</p>` : ''}
        <button type="button" class="pl-solid" data-x="close">Done</button>`;
    };
    sheet({ html: html(), onAct(x, b, api) {
      if (x === 'rest') { D.week[i] = []; draw(); api.close(); toast(`${DAYS[i][1]} is a rest day`); return; }
      if (x === 'pick') { const id = b.dataset.id, ids = D.week[i]; D.week[i] = ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]; draw(); api.set(html()); api.el.querySelector(`[data-id="${id}"]`)?.focus(); }
    } });
  }
  function menu() {
    const has = D.routines.some((r) => r.ex.length);
    const items = [['export', I.share, 'Export plan file', 'A small file a friend can import into their own openGym. Routines only.', !has], ['print', I.print, 'Print / Save as PDF', '', !has],
      ['import', I.file, 'Import a plan file', '', false], ['starter', I.clip, 'Load starter plan', '', false]];
    sheet({ html: `<div class="ds-top"><h4 id="pl-st" class="display">Plan</h4><button type="button" class="ds-x" data-x="close" aria-label="Close">${I.x}</button></div>
      ${has ? '' : '<p class="pl-sheet-sub">Add an exercise to a routine first. An empty plan has nothing to share.</p>'}
      <div class="pl-group">${items.map(([k, ic, l, s, dis]) => `<button type="button" class="pl-row pl-opt" data-x="${k}" ${dis ? 'disabled' : ''}><span class="ic">${ic}</span><span class="od-fill od-stat"><span class="t">${l}</span>${s ? `<span class="s">${s}</span>` : ''}</span></button>`).join('')}</div>`,
    onAct(x, b, api) { api.close(() => (x === 'starter' ? starterSheet() : toast({ export: 'The plan file is shared from here, as in the app.', print: 'Opens the print page, as in the app.', import: 'Opens the file picker, as in the app.' }[x]))); } });
  }
  function loadPPL() {
    const mk = (id, name, rc, ex) => { const have = R(id); if (!have) D.routines.push({ id, name, rc, mus: MUSCLES[rc], prog: 'linear', deload: false, ex }); return id; };
    D.week[0] = [mk('s-push', 'Push Day', 'push', exPush())]; D.week[2] = [mk('s-pull', 'Pull Day', 'pull', exPull())]; D.week[4] = [mk('s-legs', 'Leg Day', 'legs', exLegs())];
    D.mode = 'week'; V.screen = 'plan'; draw(null, false); toast('Push / Pull / Legs loaded');
  }
  function starterSheet() {
    sheet({ html: `<div class="ds-top"><h4 id="pl-st" class="display">Starter plans</h4><button type="button" class="ds-x" data-x="close" aria-label="Close">${I.x}</button></div>
      <p class="pl-sheet-sub">Each one adds its routines and puts them on the week. Change anything afterwards.</p>
      <div class="pl-group">${STARTERS.map(([k, n, d, a]) => `<button type="button" class="pl-row pl-opt" data-x="${k}"><span class="ic">${I.clip}</span><span class="od-fill od-stat"><span class="t">${n}</span><span class="s">${d} days a week · ${a}</span></span><span class="chev">${I.right}</span></button>`).join('')}</div>`,
    onAct(x, b, api) {
      if (x !== 'ppl') { toast('In this mock only Push / Pull / Legs loads.'); return; }
      const taken = [0, 2, 4].filter((d) => namesOn(d).length);
      api.close(() => {
        if (!taken.length) { loadPPL(); return; }
        alertBox({ title: 'Load Push / Pull / Legs?', msg: 'The new plan goes on Monday, Wednesday and Friday. Your existing routines stay; only those days of the week change.', ok: 'Load plan', danger: false, onOk: loadPPL });
      });
    } });
  }
  function modeSheet() {
    const opts = [['week', I.cal, 'Fixed week', 'The same routines on the same weekdays, every week.'], ['loop', I.repeat, 'Rotation', 'Routines in a loop. Whatever is next stays next until you train it, whatever the day.']];
    sheet({ html: `<div class="ds-top"><h4 id="pl-st" class="display">How you train</h4><button type="button" class="ds-x" data-x="close" aria-label="Close">${I.x}</button></div>
      <div class="pl-group">${opts.map(([k, ic, l, s]) => `<button type="button" class="pl-row pl-opt" role="radio" aria-checked="${D.mode === k}" data-x="${k}"><span class="ic">${ic}</span><span class="od-fill od-stat"><span class="t">${l}</span><span class="s">${s}</span></span><span class="ck">${D.mode === k ? I.check : ''}</span></button>`).join('')}</div>`,
    onAct(x, b, api) { api.close(() => setMode(x)); } });
  }
  function setMode(m) {
    if (m === D.mode) return;
    if (m === 'loop') { D.mode = 'loop'; draw(); return; }
    if (!D.loop.done) { D.mode = 'week'; draw(); return; }
    alertBox({ title: 'Back to a fixed week?', msg: 'The loop stops. Your weekdays stay as they are, and the loop is saved for later.', ok: 'Use fixed week', danger: false, onOk: () => { D.mode = 'week'; draw(); } });
  }
  function loopAddSheet() {
    const seq = D.loop.seq;
    sheet({ html: `<div class="ds-top"><h4 id="pl-st" class="display">Add to the loop</h4><button type="button" class="ds-x" data-x="close" aria-label="Close">${I.x}</button></div>
      <div class="pl-group">${seq.length ? `<button type="button" class="pl-row pl-opt" data-x="add" data-id="rest"><span class="ic">${I.moon}</span><span class="od-fill od-stat"><span class="t">Rest day</span><span class="s">A day off before the next one</span></span></button>` : ''}
      ${D.routines.map((r) => `<button type="button" class="pl-row pl-opt" data-x="add" data-id="${r.id}"><span class="bars">${bars([r])}</span><span class="od-fill od-stat"><span class="t od-truncate">${esc(r.name)}</span>${seq.includes(r.id) ? '<span class="s">Already in the loop: adds it again</span>' : ''}</span></button>`).join('')}</div>`,
    onAct(x, b, api) { const id = b.dataset.id; seq.push(id); api.close(() => { draw(); toast(`${id === 'rest' ? 'Rest day' : esc(R(id).name)} added to the loop`); }); } });
  }
  function takeOut(i) {
    const seq = D.loop.seq, id = seq[i], snap = clone(D.loop);
    seq.splice(i, 1); if (i < D.loop.done) D.loop.done--;
    draw();
    toast(`${id === 'rest' ? 'Rest day' : esc(R(id).name)} is out of the loop`, () => { D.loop = snap; draw(); });
  }
  function addExSheet() {
    const r = cur(), have = new Set(r.ex.filter((e) => !e.gone).map((e) => e.n));
    sheet({ html: `<div class="ds-top"><h4 id="pl-st" class="display">Add exercise</h4><button type="button" class="ds-x" data-x="close" aria-label="Close">${I.x}</button></div>
      <p class="pl-sheet-sub">A few from the catalogue. The app's picker searches all of it.</p>
      <div class="pl-group">${CATALOG.map((n) => `<button type="button" class="pl-row pl-opt" data-x="add" data-n="${esc(n)}" ${have.has(n) ? 'disabled' : ''}><span class="od-fill od-stat"><span class="t od-clamp-2">${esc(n)}</span><span class="s">${have.has(n) ? 'Already in this routine' : 'Starts at 3 × 10'}</span></span><span class="ic">${I.plus}</span></button>`).join('')}</div>`,
    onAct(x, b, api) {
      const e = E(b.dataset.n, 3, 10, 0, 90); r.ex.push(e);
      if (DIR === 'b') V.open = e.u;
      api.close(() => draw(DIR === 'b' ? `[data-u="${e.u}"]` : '[data-a="add-ex"]'));
    } });
  }
  function renameSheet() {
    const d = V.draft;
    const api = sheet({ html: `<div class="ds-top"><h4 id="pl-st" class="display">Rename</h4><button type="button" class="ds-x" data-x="close" aria-label="Close">${I.x}</button></div>
      <label class="pl-field"><span class="pl-kick">Routine name</span><input class="pl-input" value="${esc(d.name)}" maxlength="80" autocomplete="off" data-focus></label>
      <div class="pl-pair"><button type="button" class="pl-out" data-x="close">Cancel</button><button type="button" class="pl-solid" data-x="ok">Done</button></div>`,
    onAct(x, b, api) { if (x === 'ok') commit(api); } });
    const commit = (a) => { const v = a.el.querySelector('input').value.trim(); if (v) d.name = v; a.close(() => draw('[data-a="rename"]')); };
    api.el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); commit(api); } });
  }
  // Routine options (shared editor): progression and deload are draft edits like any other; Copy and Print act on the saved routine.
  function roptsSheet() {
    const d = V.draft, saved = R(d.id);
    const html = () => `<div class="ds-top"><h4 id="pl-st" class="display">Routine options</h4><button type="button" class="ds-x" data-x="close" aria-label="Close">${I.x}</button></div>
      <h5 class="pl-kick">Progression</h5>
      <div class="pl-group">${PROG.map(([k, l, sub]) => `<button type="button" class="pl-row pl-opt" aria-pressed="${d.prog === k}" data-x="prog" data-v="${k}"><span class="od-fill od-stat"><span class="t">${l}</span><span class="s">${sub}</span></span><span class="ck">${d.prog === k ? I.check : ''}</span></button>`).join('')}</div>
      <div class="pl-group"><div class="pl-row pl-set"><span class="od-fill od-stat"><span>Deload routine</span><span class="s">Its workouts don't count toward progression.</span></span>
        <button type="button" class="pl-switch" role="switch" aria-checked="${!!d.deload}" aria-label="Deload routine" data-x="deload"></button></div></div>
      ${saved ? `<div class="pl-group"><button type="button" class="pl-row pl-opt" data-x="copy"><span class="od-fill od-stat"><span class="t">Copy routine</span><span class="s">Copies it as it was last saved.</span></span></button>
        <button type="button" class="pl-row pl-opt" data-x="print" ${saved.ex.length ? '' : 'disabled'}><span class="od-fill">Print / Save as PDF</span></button></div>` : ''}
      <p class="pl-sheet-sub">Progression and deload changes wait for Save, like everything else here.</p>`;
    sheet({ html: html(), onAct(x, b, api) {
      if (x === 'prog') { d.prog = b.dataset.v; api.set(html()); draw(); api.el.querySelector(`[data-v="${d.prog}"]`)?.focus(); }
      else if (x === 'deload') { d.deload = !d.deload; api.set(html()); draw(); api.el.querySelector('[data-x="deload"]')?.focus(); }
      else if (x === 'print') api.close(() => toast('Opens the print page for this routine, as in the app.'));
      else if (x === 'copy') {
        const c = clone(saved); c.id = 'n' + uid(); c.rc = null; c.name = `${saved.name} (Copy)`; c.ex.forEach((e) => { e.u = uid(); }); D.routines.push(c);
        api.close(() => { draw('[data-a="ropts"]'); toast(`Copied as ${esc(c.name)}`); });
      }
    } });
  }
  function animSheet(u) {
    const e = (cur() || { ex: [] }).ex.find((x) => x.u === u); if (!e) return;
    const steps = HOW[OGAnim.kind(e.n)] || HOW.overhead;
    sheet({ cls: 'pl-anim', html: `<div class="ds-top"><span class="pl-kick">How to</span><button type="button" class="ds-x" data-x="close" aria-label="Close">${I.x}</button></div>
      <div class="pl-anim-fig">${OGAnim.figure(e.n, { tag: true })}</div>
      <h4 id="pl-st" class="display od-clamp-2">${esc(e.n)}</h4>
      <ol class="pl-how">${steps.map((t) => `<li>${t}</li>`).join('')}</ol>` });
  }
  function xnav(s) {
    const L = live(V.draft), i = L.findIndex((x) => x.u === V.exOpen), t = L[i + s]; if (!t) return;
    V.exOpen = t.u; V.setSel = null;
    draw(`[data-a="xnav"][data-s="${s}"]:not([disabled])`, false);
    if (!content.querySelector(':focus')) content.querySelector('.pw-title')?.focus({ preventScroll: true });
  }
  // the open exercise: a sideways swipe goes to the previous or next one; Escape goes back to the list
  let sx = null, swiped = false;
  function onDown(e) { sx = e.target.closest('[data-swipe]') ? [e.clientX, e.clientY] : null; swiped = false; }
  function onUp(e) {
    if (!sx || stack.length) return; const dx = e.clientX - sx[0], dy = e.clientY - sx[1]; sx = null;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; xnav(dx < 0 ? 1 : -1); setTimeout(() => { swiped = false; }, 0); }
  }
  function onKeyW(e) {
    if (e.key !== 'Escape' || e.defaultPrevented || stack.length || V.screen !== 'edit') return;
    const b = content.querySelector('.pl-back[data-a="xlist"]'); if (!b) return;
    e.preventDefault(); b.click();
  }
  function onClick(e) {
    const tb = e.target.closest('[data-act]');
    if (tb) {
      if (tb.dataset.act === 'tab' && tb.dataset.tab === 'Plan') { if (V.screen === 'edit') { if (DIR !== 'b') leave(() => go('plan')); else go('plan'); } else if (V.screen === 'settings') go('plan', '[data-a="settings"]'); return; }
      const msg = tb.dataset.act === 'tab' ? `${tb.dataset.tab} is its own screen in this prototype set.` : (namesOn(TODAY).length ? `GO starts today's workout: ${namesOn(TODAY).map((r) => esc(r.name)).join(' + ')}.` : 'Nothing planned today. GO lets you pick a routine.');
      if (DIR !== 'b' && V.screen === 'edit' && nChanges()) leave(() => { go('plan'); toast(msg); }); else toast(msg);
      return;
    }
    const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
    const a = b.dataset.a, id = b.dataset.id, i = Number(b.dataset.i), s = Number(b.dataset.s), u = b.dataset.u;
    switch (a) {
      case 'menu': return menu();
      case 'starter': return starterSheet();
      case 'new': newRoutine(); return draw('[data-a="rename"]', false);
      case 'settings': return go('settings', '[data-a="layout"][aria-pressed="true"]');
      case 'layout': return setLayout(b.dataset.v);
      case 'view': V.view = b.dataset.v; return draw(`[data-v="${V.view}"]`, false);
      case 'modeset': return setMode(b.dataset.v);
      case 'mode': return modeSheet();
      case 'day': return daySheet(Number(b.dataset.d));
      case 'open': startEdit(id); return draw(DIR === 'a' ? '.pl-back' : DIR === 'b' ? '[data-a="cancel"]' : '.pl-back', false);
      case 'list-edit': V.listEdit = !V.listEdit; return draw('[data-a="list-edit"]');
      case 'r-mv': { const rs = D.routines, j = i + s; [rs[i], rs[j]] = [rs[j], rs[i]]; return draw(`[data-a="r-mv"][data-i="${j}"][data-s="${s}"]`); }
      case 'r-del': return confirmDelete(id, '[data-a="list-edit"]');
      case 'loop-edit': V.loopEdit = !V.loopEdit; return draw('[data-a="loop-edit"]');
      case 'loop-add': return loopAddSheet();
      case 'loop-addr': D.loop.seq.push(id); draw(); return toast(`${esc(R(id).name)} added to the loop`);
      case 'loop-mv': { if (!canMv(i, s)) return; const q = D.loop.seq, j = i + s; [q[i], q[j]] = [q[j], q[i]]; return draw(`[data-a="loop-mv"][data-i="${j}"][data-s="${s}"]`); }
      case 'loop-out': return takeOut(i);
      case 'loop-over': return alertBox({ title: 'Start the loop over?', msg: `This round starts again from ${esc(R(D.loop.seq.find((x) => x !== 'rest'))?.name || 'the top')}. Workouts you've done stay in your history.`, ok: 'Start over', danger: false,
        onOk: () => { D.loop.done = 0; draw(); toast('The loop starts over today'); } });
      case 'tog': {
        const d = Number(b.dataset.d), ids = D.week[d], had = ids.includes(id), before = ids.slice(), r = R(id);
        D.week[d] = had ? ids.filter((x) => x !== id) : [...ids, id];
        draw(`[data-a="tog"][data-id="${id}"][data-d="${d}"]`);
        const now = namesOn(d);
        return toast(had ? `${esc(r.name)} is off ${DAYS[d][1]}` : now.length > 1 ? `${DAYS[d][1]} now has ${now.map((x) => esc(x.name)).join(' + ')}` : `${esc(r.name)} is on ${DAYS[d][1]} now`, () => { D.week[d] = before; draw(); });
      }
      // ── editor ──
      case 'back': if (V.screen === 'settings') return go('plan', '[data-a="settings"]');
        if (DIR !== 'b') return leave(() => go('plan', `[data-a="open"][data-id="${V.editId}"]`)); return go('plan', `[data-a="open"][data-id="${V.editId}"]`);
      case 'cancel': return leave(() => go('plan', `[data-a="open"][data-id="${V.editId}"]`));
      case 'save': return saveDraft();
      case 'undoall': { const n = nChanges(); return alertBox({ title: `Undo all ${n} change${n === 1 ? '' : 's'}?`, msg: `${esc(V.orig.name)} goes back to how it was when you opened it.`, ok: 'Undo all',
        onOk: () => { V.draft = clone(V.orig); V.exOpen = V.setSel = null; draw('.pl-back'); } }); }
      case 'delete': return confirmDelete(V.editId, null);
      case 'add-ex': return addExSheet();
      case 'anim': return animSheet(u);
      case 'rename': return renameSheet();
      case 'ropts': return roptsSheet();
      case 'toggle': V.open = V.open === u ? null : u; return draw(`[data-a="toggle"][data-u="${u}"]`);
      case 'step': { const x = findEx(u), f = b.dataset.f; x[f] = stepV(f, x[f], s); return draw(`[data-a="step"][data-u="${u}"][data-f="${f}"][data-s="${s}"]:not([disabled])`); }
      case 'dmv': moveDraft(u, s); return draw(`[data-a="${DIR === 'b' ? 'toggle' : 'dmv'}"][data-u="${u}"]${DIR !== 'b' ? `[data-s="${s}"]` : ''}`);
      case 'rm': { const x = findEx(u); if (isNewEx(x)) V.draft.ex = V.draft.ex.filter((y) => y !== x); else x.gone = true; V.open = null; return draw(`[data-a="unrm"][data-u="${u}"]`); }
      case 'unrm': delete findEx(u).gone; return draw(DIR === 'b' ? `[data-a="toggle"][data-u="${u}"]` : '[data-a="reorder"]');
      case 'reorder': V.reorder = !V.reorder; return draw('[data-a="reorder"]');
      case 'xopen': V.exOpen = u; V.setSel = null; V.reorder = false; return draw('.pl-back[data-a="xlist"]', false);
      case 'xlist': { const was = V.exOpen; V.exOpen = null; V.setSel = null; draw(`[data-a="xopen"][data-u="${was}"]`, false); return content.querySelector(`[data-a="xopen"][data-u="${was}"]`)?.scrollIntoView({ block: 'center' }); }
      case 'xnav': return xnav(s);
      case 'sset': { const k = Number(b.dataset.k); V.setSel = V.setSel === k ? null : k; return draw(`[data-a="sset"][data-k="${k}"]`); }
      case 'sstep': { const x = findEx(V.exOpen), k = Number(b.dataset.k), f = b.dataset.f, key = f === 'reps' ? 'r' : 'w'; x.ss[k][key] = stepV(f, x.ss[k][key], s); sync(x);
        draw(`[data-a="sstep"][data-k="${k}"][data-f="${f}"][data-s="${s}"]:not([disabled])`);
        if (!content.contains(document.activeElement) || document.activeElement === document.body) content.querySelector(`[data-a="sstep"][data-k="${k}"][data-f="${f}"]:not([disabled])`)?.focus({ preventScroll: true });
        return; }
      case 'sadd': { const x = findEx(V.exOpen); x.ss.push({ ...x.ss[x.ss.length - 1], id: uid() }); sync(x); V.setSel = x.ss.length - 1; return draw(`[data-a="sstep"][data-k="${V.setSel}"][data-f="reps"][data-s="1"]`); }
      case 'sdel': { const x = findEx(V.exOpen); x.ss.splice(Number(b.dataset.k), 1); sync(x); V.setSel = null; return draw('[data-a="sadd"]'); }
      case 'sback': {
        // put the set back where it was: after every remaining set that came before it originally
        const x = findEx(V.exOpen), p = orig(x), oi = p.ss.findIndex((q) => q.id === id);
        const at = x.ss.filter((y) => { const j = p.ss.findIndex((q) => q.id === y.id); return j >= 0 && j < oi; }).length;
        x.ss.splice(at, 0, { ...p.ss[oi] }); sync(x); return draw(`[data-a="sset"][data-k="${at}"]`);
      }
    }
  }
  function setState(st) {
    closeAll();
    clearTimeout(toastT); toastEl._undo = null; toastEl.classList.remove('in');
    DIR = DIR0; host.dataset.pl = DIR0;
    D = sample();
    V = { st, screen: 'plan', view: 'schedule', listEdit: false, loopEdit: false, editId: null, draft: null, orig: null, isNew: false, open: null, reorder: false };
    if (st === 'first') { D.routines = []; D.week = D.week.map(() => []); D.loop.seq = []; D.loop.done = 0; }
    if (st === 'long') { R('pull').name = 'Pull A · Back thickness and biceps, heavy 6-week block'; R('push').ex[3].n = 'Single-arm cable lateral raise with lean-away and pause'; }
    if (st === 'loop') D.mode = 'loop';
    if (DIR === 'a' && ['routines', 'edit', 'unsaved', 'delete', 'newr'].includes(st)) V.view = 'routines';
    if (st === 'settings' && DIR !== 'b') V.screen = 'settings';
    if (['edit', 'unsaved', 'delete'].includes(st)) startEdit('push');
    if (st === 'newr') newRoutine();
    if (st === 'unsaved') {
      const bench = V.draft.ex[0];
      if (DIR === 'b') { bench.w = 77.5; bench.rest = 180; V.open = bench.u; }
      else { bench.ss[0].w = 77.5; bench.ss[1].w = 77.5; sync(bench); V.exOpen = bench.u; V.setSel = 0; }
    }
    draw(null, false);
    if (st === 'routines' && DIR === 'b') { const sc = content.querySelector('.od-scroll'), t = content.querySelector('#pb-routines'); if (sc && t) sc.scrollTop = t.offsetTop - 80; }
    if (st === 'delete') confirmDelete('push', null);
  }

  function mount({ dir, state, open, content: c, host: h }) {
    DIR = DIR0 = ['a', 'b', 'c'].includes(dir) ? dir : 'a';
    content = c; host = h;
    host.classList.add('og', 'p-ios'); host.dataset.pl = DIR;
    toastEl = document.createElement('div'); toastEl.className = 'pl-toast'; toastEl.setAttribute('role', 'status');
    host.append(toastEl);
    toastEl.addEventListener('click', (e) => { if (e.target.closest('[data-undo]') && toastEl._undo) { const f = toastEl._undo; toastEl._undo = null; toastEl.classList.remove('in'); f(); } });
    content.addEventListener('click', (ev) => { if (swiped) { swiped = false; ev.stopPropagation(); return; } onClick(ev); }, true);
    content.addEventListener('pointerdown', onDown);
    content.addEventListener('pointerup', onUp);
    document.addEventListener('keydown', onKeyW);
    window.addEventListener('message', (e) => { if (e.data && typeof e.data.ogState === 'string') setState(e.data.ogState); });
    setState(state || 'normal');
    if (open === 'anim') {
      if (V.screen !== 'edit') { startEdit('push'); draw(null, false); }
      if (DIR !== 'b' && cur().ex[0]) { V.exOpen = cur().ex[0].u; draw(null, false); }
      const b = content.querySelector('[data-a="anim"]'); if (b) { b.focus({ preventScroll: true }); animSheet(b.dataset.u); }
    }
  }
  return { mount };
})();
