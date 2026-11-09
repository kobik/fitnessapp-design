// openGym · Live workout (iPhone). Needs og/v2.js (OGv2.ui, OGv2.tabbarHTML).
// OGwo.mount({ dir: 'A' | 'B' | 'C', state, anim: 'full' | 'small' | 'off', open: 'anim' | null, content, host })
//   anim mirrors the app's setting (S.gifSize 'full' | 'mini' | 'off'). Needs og/anim.js (OGAnim.figure). Direction B shows no animation.
//   A = One set (big numbers, thumb dock) · B = Sets table (tick column, number pad) · C = Whole session (list + log dock)
// Board message: { ogState: one of STATES } ('first' still works as 'entering')
// C (chosen): one exercise open at a time, and the open one is the one you log. Rows never move.
window.OGwo = (() => {
  const PATHS = {
    chevD: '<path d="M6 9l6 6 6-6"/>', chevL: '<path d="M15 6l-6 6 6 6"/>', chevR: '<path d="M9 6l6 6-6 6"/>', chevU: '<path d="M6 15l6-6 6 6"/>',
    more: '<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>',
    minus: '<path d="M5 12h14"/>',
    history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1L3.5 8.5"/><path d="M3.5 3.5v5h5"/><path d="M12 7.5V12l3 2"/>',
    swap: '<path d="M7 4 3.5 7.5 7 11M3.5 7.5H17M17 13l3.5 3.5L17 20M20.5 16.5H7"/>',
    trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5M14 11v5"/>',
    note: '<path d="M5 4h10l4 4v12H5z"/><path d="M15 4v4h4M8.5 13h7M8.5 16.5h4.5"/>',
    warm: '<path d="M4 18.5h16M7.5 15a4.5 4.5 0 0 1 9 0M12 4.5v3M5.6 8.6l1.8 1.8M18.4 8.6l-1.8 1.8"/>',
    order: '<path d="M8 4v16M4.5 7.5 8 4l3.5 3.5M16 20V4M12.5 16.5 16 20l3.5-3.5"/>',
    sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>',
    del: '<path d="M9 5.5h10.5a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H9L3.5 12z"/><path d="M11.5 9.5l5 5M16.5 9.5l-5 5"/>',
    sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1" fill="currentColor"/><circle cx="4.5" cy="12" r="1" fill="currentColor"/><circle cx="4.5" cy="18" r="1" fill="currentColor"/>',
    dumbbell: '<path d="M8 12h8M2.5 12h1.5M20 12h1.5"/><rect x="4" y="7.5" width="4" height="9" rx="1.4"/><rect x="16" y="7.5" width="4" height="9" rx="1.4"/>'
  };
  const ic = (n) => PATHS[n]
    ? `<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PATHS[n]}</svg>`
    : OGv2.ui(n);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmt = (n) => String(+(+n).toFixed(2));
  const pad2 = (n) => String(n).padStart(2, '0');
  const clock = (sec) => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60; return h ? `${h}:${pad2(m)}:${pad2(s)}` : `${m}:${pad2(s)}`; };

  // ── sample data: Push A from og/v2.js, 20 sets. Last Push was Wed 21 Oct, 7 days ago. ──
  const AGO = '7 days ago';
  const mk = (o) => ({ note: '', hist: [], ...o, sets: Array.from({ length: o.n }, (_, j) => ({ w: o.w, r: o.rs ? o.rs[j] : o.r, done: false })) });
  const BASE = () => [
    // Agreed cross-screen story: best before today 72.5 kg (21 Oct, 72.5 × 5, 5, 4); today's target 75 kg, a new best if it goes up.
    mk({ name: 'Bench press', kind: 'bar', n: 3, w: 75, r: 5, rs: [5, 5, 4], step: 2.5, rest: 120, dir: 'up', pol: 'Linear progression', why: 'Every rep last time. 2.5 kg more.',
      last: [[72.5, 5], [72.5, 5], [72.5, 4]], hist: [['Wed 14 Oct', [[70, 5], [70, 5], [70, 4]]], ['Wed 7 Oct', [[67.5, 5], [67.5, 5], [67.5, 4]]]] }),
    mk({ name: 'Incline dumbbell press', kind: 'db', n: 3, w: 30, r: 11, step: 2, rest: 90, dir: 'hold', pol: 'Double progression', why: 'Same weight, aim for 11 reps this time.',
      last: [[30, 10], [30, 10], [30, 9]] }),
    mk({ name: 'Overhead press', kind: 'bar', n: 3, w: 50, r: 6, step: 2.5, rest: 120, dir: 'hold', pol: 'Linear progression', why: 'Missed reps last time. Same weight again (2 of 3 to go).',
      last: [[50, 6], [50, 5], [50, 5]] }),
    mk({ name: 'Lateral raise', kind: 'db', n: 4, w: 12, r: 12, step: 2, rest: 60, dir: 'up', pol: 'Linear progression', why: 'Every rep last time. 2 kg more.',
      last: [[10, 12], [10, 12], [10, 12], [10, 12]] }),
    mk({ name: 'Triceps pushdown', kind: 'cable', n: 4, w: 32.5, r: 12, step: 2.5, rest: 60, dir: 'hold', pol: 'Double progression', why: 'Same weight, aim for 12 reps this time.',
      last: [[32.5, 12], [32.5, 12], [32.5, 11], [32.5, 10]] }),
    mk({ name: 'Dips', kind: 'bw', n: 3, w: 0, r: 11, step: 2.5, rest: 90, dir: 'up', pol: 'Linear progression', why: 'Bodyweight: every rep last time, so go for 11 this time.',
      last: [[0, 10], [0, 10], [0, 10]] })
  ];
  const LONG = () => mk({ custom: true, name: 'Single-arm cable lateral raise with lean-away, slow negative', kind: 'cable', n: 4, w: 7.5, r: 12, step: 2.5, rest: 60, dir: 'hold',
    pol: 'Double progression', why: 'Same weight, aim for 12 reps this time.', last: [[7.5, 12], [7.5, 12], [7.5, 10], [7.5, 10]] });
  // Exercises with no history: progression has nothing to go on, so no weight is suggested (a barbell starts on the bar).
  const NEW = [
    { name: 'Machine shoulder press', kind: 'machine', step: 5, rest: 90, w: null },
    { name: 'Landmine press', kind: 'bar', step: 2.5, rest: 90, w: 20 },
    { name: 'Cable crossover', kind: 'cable', step: 2.5, rest: 60, w: null },
    { name: 'Machine chest press', kind: 'machine', step: 5, rest: 90, w: null },
    { name: 'Arnold press', kind: 'db', step: 2, rest: 90, w: null },
    { name: 'Push-up', kind: 'bw', step: 2.5, rest: 60, w: 0 }
  ];
  const fresh = (t, n, r) => mk({ ...t, n, r, dir: 'base', pol: 'Linear progression', why: 'Nothing logged yet, so this session sets the baseline.', last: null });

  // How-to steps, word for word from the app's catalogue (src/instr/en.js), minus the closing "Repeat…" line.
  const HOWTO = {
    'Bench press': ['Lie flat on a bench with your feet flat on the ground and your back pressed against the bench.', 'Grasp the barbell with an overhand grip slightly wider than shoulder-width apart.', 'Lift the barbell off the rack and hold it directly above your chest with your arms fully extended.', 'Lower the barbell slowly towards your chest, keeping your elbows tucked in.', 'Pause for a moment when the barbell touches your chest.', 'Push the barbell back up to the starting position by extending your arms.'],
    'Incline dumbbell press': ['Set up an incline bench at a 45-degree angle.', 'Sit on the bench with your feet flat on the ground and your back pressed firmly against the bench.', 'Hold a dumbbell in each hand, palms facing forward, and lift them to shoulder height.', 'Slowly lower the dumbbells to the sides of your chest, keeping your elbows at a 90-degree angle.', 'Push the dumbbells back up to the starting position, fully extending your arms.'],
    'Overhead press': ['Unrack the bar at shoulder height, hands just outside your shoulders.', 'Stand tall with feet hip-width apart and squeeze your glutes.', 'Press the bar straight up, moving your head slightly back then through.', 'Lock out overhead with the bar over your mid-foot.', 'Lower the bar back to your collarbone with control.'],
    'Lateral raise': ['Stand with your feet shoulder-width apart and hold a dumbbell in each hand, palms facing your body.', 'Keep your back straight and engage your core.', 'Raise your arms out to the sides until they are parallel to the floor, keeping a slight bend in your elbows.', 'Pause for a moment at the top, then slowly lower your arms back down to the starting position.'],
    'Triceps pushdown': ['Attach a straight bar to a high pulley cable machine.', 'Stand facing the machine with your feet shoulder-width apart and a slight bend in your knees.', 'Grasp the bar with an overhand grip, hands shoulder-width apart.', 'Keep your elbows close to your sides and your upper arms stationary.', 'Exhale and push the bar down until your elbows are fully extended.', 'Pause for a moment, then inhale and slowly return the bar to the starting position.'],
    Dips: ['Position yourself on parallel bars with your arms fully extended and your body straight.', 'Lower your body by bending your elbows until your shoulders are below your elbows.', 'Push yourself back up to the starting position by straightening your arms.'],
    'Machine shoulder press': ['Adjust the seat height and position yourself on the machine with your back against the backrest.', 'Grasp the handles with an overhand grip and position your hands at shoulder level.', 'Push the handles upward until your arms are fully extended, but do not lock your elbows.', 'Pause for a moment at the top, then slowly lower the handles back down to the starting position.']
  };

  const STATES = ['entering', 'mid', 'resting', 'switched', 'collapsed', 'fixing', 'alldone', 'checkin', 'nohist', 'long', 'last', 'finish', 'discard', 'away', 'empty'];
  let DIR = 'A', ANIM = 'full', S, content, host, toastEl, liveEl, layer = null;

  function build(state) {
    const s = { state, name: 'Push A', ex: BASE(), cur: 0, sel: null, startAt: Date.now(), rest: null, view: 'live', note: '', bw: null, ended: null, collapsed: false, fix: null };
    const restFor = (left) => { s.rest = { end: Date.now() + left * 1000, total: 120, ready: false }; };
    const doneUpTo = (n) => { for (const e of s.ex) for (const x of e.sets) if (n > 0) { x.done = true; n--; } };
    const ago = (sec) => { s.startAt = Date.now() - sec * 1000; };
    const mid = () => { doneUpTo(8); s.cur = 2; ago(760); }; // 12:40, as on Today's "in progress"
    // The clock waits ("Not started") until the first set is logged.
    if (state === 'checkin' || state === 'entering') s.startAt = null;
    else if (state === 'mid') { doneUpTo(1); ago(220); }
    else if (state === 'switched') { mid(); s.cur = 3; restFor(58); } // tapped Lateral raise with Overhead press at 2 of 3; the rest keeps running
    else if (state === 'collapsed') { mid(); s.collapsed = true; restFor(72); }
    else if (state === 'fixing') { mid(); s.fix = 0; s.sel = 0; }
    else if (state === 'resting' || state === 'away') { mid(); s.rest = { end: Date.now() + 72000, total: 120, ready: false }; if (state === 'away') s.view = 'away'; }
    else if (state === 'finish' || state === 'discard') mid();
    else if (state === 'nohist') { s.ex[2] = fresh(NEW[0], 3, 6); doneUpTo(6); s.cur = 2; ago(665); }
    else if (state === 'long') { s.ex[3] = LONG(); doneUpTo(9); s.cur = 3; ago(1265); }
    else if (state === 'last') { doneUpTo(19); s.cur = 5; ago(2910); }
    else if (state === 'alldone') { doneUpTo(20); s.cur = 5; ago(3012); s.collapsed = DIR === 'C'; }
    else if (state === 'empty') { s.ex = []; s.name = 'Freestyle'; s.startAt = null; }
    return s;
  }

  // ── model helpers ──
  const firstOpen = (e) => e.sets.findIndex((x) => !x.done);
  const exDone = (e) => e.sets.length > 0 && e.sets.every((x) => x.done);
  const curEx = () => S.ex[S.cur];
  const setIdx = (e) => { if (DIR !== 'C' && S.sel != null && S.sel < e.sets.length) return S.sel; const f = firstOpen(e); return f < 0 ? e.sets.length - 1 : f; };
  const counts = () => { let d = 0, t = 0; S.ex.forEach((e) => e.sets.forEach((x) => { t++; if (x.done) d++; })); return { d, t }; };
  const allDone = () => { const c = counts(); return c.t > 0 && c.d === c.t; };
  const nextOpenEx = (k) => { for (let j = 1; j <= S.ex.length; j++) { const i = (k + j) % S.ex.length; if (!exDone(S.ex[i])) return i; } return -1; };
  const restLeft = () => S.rest ? Math.ceil((S.rest.end - Date.now()) / 1000) : 0;
  const wTxt = (e, w) => w == null ? '–' : e.kind === 'bw' ? (w > 0 ? `+${fmt(w)}` : 'BW') : fmt(w);
  const wUnit = (e, w) => e.kind === 'bw' ? (w > 0 ? 'kg added' : 'body wt') : e.kind === 'db' ? 'kg each' : 'kg';
  const setStr = (e, x) => e.kind === 'bw' ? (x.w > 0 ? `BW+${fmt(x.w)} × ${x.r}` : `BW × ${x.r}`) : `${x.w == null ? '–' : fmt(x.w)} × ${x.r}`;
  const pairStr = (e, p) => setStr(e, { w: p[0], r: p[1] });
  const plates = (e, w) => {
    if (e.kind !== 'bar' || w == null) return '';
    if (w <= 20) return 'Just the bar';
    let side = (w - 20) / 2; const out = [];
    for (const p of [25, 20, 15, 10, 5, 2.5, 1.25]) while (side >= p - 1e-9) { out.push(fmt(p)); side -= p; }
    return `Each side of the bar: ${out.join(' + ')}`;
  };
  const isLong = (e) => e.name.length > 26;
  // Warm-ups count apart from work sets, as in the app: two warm-ups in front, and the first work set still reads 1.
  const workNo = (e, j) => e.sets.slice(0, j + 1).filter((x) => !x.warm === !e.sets[j].warm).length;
  const workCount = (e) => e.sets.filter((x) => !x.warm).length;
  const setName = (e, j) => e.sets[j].warm ? `Warm-up ${workNo(e, j)}` : `Set ${workNo(e, j)}`;
  const lastFor = (e, j) => !e.last || e.sets[j].warm ? null : e.last[workNo(e, j) - 1] || null;
  const short = (n) => n.length > 28 ? n.slice(0, 26).trimEnd() + '…' : n;
  const hasAnim = () => ANIM !== 'off' && DIR !== 'B' && typeof OGAnim !== 'undefined';
  // A small, still frame beside the name; a tap opens the full-screen how-to.
  const thumb = (k) => hasAnim() ? `<button class="wo-thumb" data-a="anim" data-i="${k}" aria-label="Show how to do ${esc(S.ex[k].name)}">${OGAnim.figure(S.ex[k].name, { tag: false, still: true })}</button>` : '';
  // While resting, the exercise that comes next: the current one if you haven't started it, else the next unfinished one.
  const upNext = () => {
    if (!S.rest || S.rest.ready) return null;
    if (!curEx().sets.some((x) => x.done)) return S.cur;
    const j = nextOpenEx(S.cur); return j >= 0 && j !== S.cur ? j : null;
  };
  const whyIcon = (e) => ic(e.dir === 'up' ? 'up' : e.dir === 'base' ? 'flag' : 'flat');

  // ── shared pieces ──
  function header() {
    const { d, t } = counts(), done = allDone();
    const idle = !S.startAt;
    return `<div class="wo-top">
      <header class="wo-hdr">
        <button class="wo-ib" data-a="min" aria-label="Minimize. The workout keeps running">${ic('chevD')}</button>
        <div class="wo-hmid"><span class="wo-rt"><i aria-hidden="true"></i><span class="od-truncate">${esc(S.name)}</span></span>
          <span class="wo-clock num${idle ? ' is-idle' : ''}" data-el="clock" role="timer" aria-label="Time so far">${idle ? 'Not started' : clock((Date.now() - S.startAt) / 1000)}</span></div>
        <button class="wo-ib" data-a="wmenu" aria-label="Workout options">${ic('sliders')}</button>
        ${done ? '' : '<button class="wo-fin" data-a="finish">Finish</button>'}
      </header>
      ${t ? `<div class="wo-prog"><div class="wo-bar" role="progressbar" aria-label="Sets done" aria-valuemin="0" aria-valuemax="${t}" aria-valuenow="${d}"><i style="width:${(d / t) * 100}%"></i></div><span><b>${d}</b>/${t} sets</span></div>` : ''}
      ${DIR === 'B' && S.ex.length ? chips() : ''}
    </div>`;
  }
  const noteLine = (e) => e.note ? `<p class="wo-note">${ic('note')}<span>${esc(e.note)}</span></p>` : '';
  const lastLine = (e) => !e.last ? '' : `<button class="wo-last" data-a="history" aria-label="${e.last ? `Last time, ${AGO}: ${e.last.map((p) => pairStr(e, p)).join(', ')}` : 'No history yet'}. Open history">${ic('history')}<span>${e.last
    ? `Last time · ${AGO}<br><b>${e.last.map((p) => pairStr(e, p)).join(' · ')}</b>` : 'No history yet for this exercise.'}</span></button>`;
  const whyLine = (e, cls = '') => `<p class="wo-why ${cls}">${whyIcon(e)}<span>${esc(e.why)}<small>${e.pol}</small></span></p>`;
  function restHTML() {
    if (!S.rest) return '';
    const left = restLeft(), ready = S.rest.ready;
    return `<div class="wo-rest${ready ? ' is-ready' : ''}">
      <i class="wo-rest-fill" data-el="restfill" style="transform:scaleX(${ready ? 0 : Math.min(1, left / S.rest.total)})"></i>
      <div class="wo-rest-t"><span class="wo-kick">${ready ? 'Rest is over' : 'Rest'}</span><span class="num" data-el="rest" role="timer">${ready ? 'Ready' : clock(left)}</span></div>
      <div class="wo-rest-acts">${ready ? '<button class="skip" data-a="rskip">Dismiss</button>'
        : '<button data-a="radj" data-d="-15" aria-label="15 seconds less rest">−15</button><button data-a="radj" data-d="15" aria-label="15 seconds more rest">+15</button><button class="skip" data-a="rskip">Skip</button>'}</div></div>`;
  }
  function primary(e, i) {
    if (allDone()) return `<button class="wo-solid" data-a="finish">${ic('flag')}Finish workout</button>`;
    const x = e.sets[i];
    if (x.done) return `<button class="wo-outline" data-a="log" aria-label="${setName(e, i)} is logged. Mark it not done">${OGv2.ui('check')}Logged · undo</button>`;
    const { d, t } = counts();
    return `<button class="wo-solid" data-a="log">${OGv2.ui('check')}${d === t - 1 ? 'Log last set' : `Log ${setName(e, i).toLowerCase()}`}</button>`;
  }
  const emptyHTML = () => `<div class="wo-empty"><span class="ic">${ic('dumbbell')}</span><p style="margin:0">Freestyle workout. Add your first exercise and off you go.</p>
    <button class="wo-solid" data-a="addex">${OGv2.ui('plus')}Add exercise</button></div>`;

  // ═════ A · One set ═════
  function renderA() {
    if (!S.ex.length) return `<div class="app wo wo-A od-screen">${header()}<div class="od-scroll a-main">${emptyHTML()}</div><div></div></div>`;
    const e = curEx(), i = setIdx(e), x = e.sets[i], n = S.ex.length, k = S.cur;
    const field = (f, val, unit, label, empty) => `<div class="a-field" role="group" aria-label="${label}">
      <button class="a-step" data-a="adj" data-f="${f}" data-d="-1" aria-label="Less ${label.toLowerCase()}">${ic('minus')}</button>
      <button class="a-out${empty ? ' is-empty' : ''}" data-a="pad" data-f="${f}" aria-label="${label}: ${val} ${unit}. Tap to type"><span class="num">${val}</span><small>${unit}</small></button>
      <button class="a-step" data-a="adj" data-f="${f}" data-d="1" aria-label="More ${label.toLowerCase()}">${OGv2.ui('plus')}</button></div>`;
    const prevB = `<button class="wo-ib ghost" data-a="exprev" ${k === 0 ? 'disabled' : ''} aria-label="Previous exercise">${ic('chevL')}</button>`;
    const nextB = `<button class="wo-ib ghost" data-a="exnext" ${k === n - 1 ? 'disabled' : ''} aria-label="Next exercise">${ic('chevR')}</button>`;
    const full = hasAnim() && ANIM === 'full';
    const un = full ? upNext() : null, ak = un == null ? k : un, an = S.ex[ak].name;
    const top = full
      ? `<div class="a-animrow">${prevB}<div class="a-anim">
          <button class="a-anim-fig" data-a="anim" data-i="${ak}" aria-label="${un != null ? `Up next: ${esc(an)}. ` : ''}Show how to do ${esc(an)}">${OGAnim.figure(an)}</button>
          ${un != null ? `<span class="a-anim-lab od-truncate">Up next · ${esc(an)}</span>` : ''}</div>${nextB}</div>
        <span class="wo-kick a-kick">Exercise ${k + 1} of ${n}</span>`
      : `<div class="a-nav">${prevB}<span class="wo-kick">Exercise ${k + 1} of ${n}</span>${nextB}</div>`;
    const main = `${top}
      <div class="wo-titlerow">${ANIM === 'small' ? thumb(k) : ''}<h1 class="display wo-name od-clamp-2${isLong(e) ? ' is-long' : ''}" title="${esc(e.name)}">${esc(e.name)}</h1>
        <button class="wo-ib" data-a="exmenu" aria-label="Options for ${esc(e.name)}">${ic('more')}</button></div>
      ${noteLine(e)}${lastLine(e)}${whyLine(e)}`;
    const dock = allDone()
      ? `<p class="a-done-note">Every set logged. Nice work.</p>${primary(e, i)}`
      : `<div class="a-slot">${S.rest ? restHTML() : `<div class="a-sethead"><span class="wo-kick">${x.warm ? `Warm-up ${workNo(e, i)}` : `Set ${workNo(e, i)} of ${workCount(e)}`}${x.done ? ' · logged' : ''}</span>
        <div class="a-pips">${e.sets.map((y, j) => `<button class="a-pip${y.done ? ' is-done' : ''}${y.warm ? ' is-warm' : ''}" data-a="pick" data-i="${j}" aria-pressed="${j === i}" aria-label="${setName(e, j)}${y.done ? ', logged' : ''}"><i></i></button>`).join('')}</div></div>`}</div>
      ${field('w', wTxt(e, x.w), wUnit(e, x.w), 'Weight', x.w == null)}
      <div class="wo-plates">${plates(e, x.w)}</div>
      ${field('r', x.r, 'reps', 'Reps')}
      ${primary(e, i)}`;
    return `<div class="app wo wo-A od-screen">${header()}<div class="od-scroll a-main">${main}</div><div class="a-dock">${dock}</div></div>`;
  }

  // ═════ B · Sets table ═════
  function chips() {
    return `<nav class="b-chips od-rail" aria-label="Exercises">${S.ex.map((e, j) => `<button class="b-chip${j === S.cur ? ' is-on' : ''}${exDone(e) ? ' is-done' : ''}" data-a="goto" data-i="${j}"${j === S.cur ? ' aria-current="step"' : ''} aria-label="${j + 1}. ${esc(e.name)}${exDone(e) ? ', done' : ''}">${exDone(e) ? OGv2.ui('check') : `<span class="num">${j + 1}</span>`}<span class="od-truncate">${esc(e.name)}</span></button>`).join('')}</nav>`;
  }
  function renderB() {
    if (!S.ex.length) return `<div class="app wo wo-B od-screen">${header()}<div class="od-scroll b-main">${emptyHTML()}</div><div></div></div>`;
    const e = curEx(), k = S.cur, n = S.ex.length, open = firstOpen(e);
    const rows = e.sets.map((x, j) => {
      const st = x.done ? 'is-done' : j === open ? 'is-cur' : 'is-later', p = lastFor(e, j), nm = setName(e, j);
      return `<div class="b-tr ${st}" role="row">
        <span class="b-n${x.warm ? ' is-warm' : ''}" role="cell">${x.warm ? 'W' : workNo(e, j)}</span>
        <span class="b-prev" role="cell">${p ? pairStr(e, p) : '–'}</span>
        <span role="cell"><button class="b-cell num${x.w == null ? ' is-empty' : ''}" data-a="pad" data-f="w" data-i="${j}" aria-label="${nm} weight: ${wTxt(e, x.w)} ${wUnit(e, x.w)}. Tap to type">${wTxt(e, x.w)}</button></span>
        <span role="cell"><button class="b-cell num" data-a="pad" data-f="r" data-i="${j}" aria-label="${nm} reps: ${x.r}. Tap to type">${x.r}</button></span>
        <span role="cell"><button class="b-ck" data-a="tick" data-i="${j}" aria-pressed="${x.done}" aria-label="${x.done ? `${nm} logged. Mark it not done` : `Log ${nm.toLowerCase()}, ${setStr(e, x)}`}">${OGv2.ui('check')}</button></span></div>`;
    }).join('');
    const pl = open >= 0 ? plates(e, e.sets[open].w) : '';
    const unitHd = e.kind === 'bw' ? '+kg' : e.kind === 'db' ? 'kg ea' : 'kg';
    const main = `<div class="wo-titlerow"><h1 class="display wo-name od-clamp-2${isLong(e) ? ' is-long' : ''}" title="${esc(e.name)}">${esc(e.name)}</h1>
        <button class="wo-ib" data-a="exmenu" aria-label="Options for ${esc(e.name)}">${ic('more')}</button></div>
      ${noteLine(e)}${whyLine(e, 'b-why')}
      <div class="b-table" role="table" aria-label="Sets for ${esc(e.name)}${e.last ? `, with last time (${AGO})` : ''}">
        <div class="b-tr b-th" role="row"><span role="columnheader">Set</span><span role="columnheader">Last</span><span role="columnheader">${unitHd}</span><span role="columnheader">Reps</span><span role="columnheader"><span class="wo-sr">Logged</span></span></div>
        ${rows}</div>
      ${pl ? `<p class="b-plates">${pl}</p>` : ''}
      <div class="b-after"><button class="wo-text" data-a="history">${ic('history')}History</button><button class="wo-text" data-a="addset">${OGv2.ui('plus')}Add set</button></div>
      <div class="b-pager"><button class="wo-outline" data-a="exprev" ${k === 0 ? 'disabled' : ''}>${ic('chevL')}Previous</button><button class="wo-outline" data-a="exnext" ${k === n - 1 ? 'disabled' : ''}>Next${ic('chevR')}</button></div>`;
    const dock = allDone() ? primary(e, 0) : `${restHTML()}${open >= 0 ? primary(e, open) : ''}`;
    return `<div class="app wo wo-B od-screen">${header()}<div class="od-scroll b-main">${main}</div><div class="b-dock">${dock}</div></div>`;
  }

  // ═════ C · Whole session (chosen) ═════
  // One exercise open at a time; the open one is the one the log bar logs. Rows keep their order.
  const wDisp = (e, w) => e.kind === 'bw' ? (w > 0 ? `BW+${fmt(w)}` : 'BW') : w == null ? 'new' : `${fmt(w)} kg`;
  function cRow(e, j) {
    const d = exDone(e), nd = e.sets.filter((x) => x.done).length, w1 = e.sets.find((x) => !x.warm) || e.sets[0];
    const top = Math.max(0, ...e.sets.filter((x) => x.done && !x.warm).map((x) => x.w || 0));
    const meta = d ? `${OGv2.ui('check')}${workCount(e)} sets · ${wDisp(e, top)}` : nd ? `${nd} of ${e.sets.length} sets` : `${workCount(e)} × ${w1.r} · ${wDisp(e, w1.w)}`;
    const say = d ? `done, ${workCount(e)} sets, ${wDisp(e, top)}` : nd ? `${nd} of ${e.sets.length} sets logged` : `not started, ${workCount(e)} sets of ${w1.r}`;
    const lead = hasAnim() ? `<span class="c-th" aria-hidden="true">${OGAnim.figure(e.name, { tag: false, still: true })}</span>` : `<span class="c-i">${j + 1}</span>`;
    return `<button class="c-row${d ? ' is-done' : nd ? ' is-half' : ''}" data-a="open" data-i="${j}" aria-expanded="false" aria-label="${esc(e.name)}, ${say}. Open to log">
      ${lead}<span class="c-nm od-truncate">${esc(e.name)}</span><span class="c-meta">${meta}</span></button>`;
  }
  const cField = (f, val, unit, label, empty, act, i) => `<div class="c-field" role="group" aria-label="${label}"><span>${unit}</span><div class="c-stp">
      <button data-a="${act}" data-f="${f}" data-d="-1" aria-label="Less ${label.toLowerCase()}">${ic('minus')}</button>
      <button class="c-out${empty ? ' is-empty' : ''}" data-a="pad" data-f="${f}"${i != null ? ` data-i="${i}"` : ''} aria-label="${label}: ${val} ${unit}. Tap to type">${val}</button>
      <button data-a="${act}" data-f="${f}" data-d="1" aria-label="More ${label.toLowerCase()}">${OGv2.ui('plus')}</button></div></div>`;
  // The open exercise fills the space between the header and the log bar. Nothing else from the list shows.
  function cOpen(e, j) {
    const nx = firstOpen(e);
    const sets = e.sets.map((x, s) => {
      const nm = setName(e, s), num = x.warm ? 'W' : workNo(e, s), each = e.kind === 'db' ? ' <small>each</small>' : '';
      if (x.done) {
        const fixing = S.fix === s;
        return `<li class="c-set is-done${fixing ? ' is-fix' : ''}"><span class="n">${num}</span>
          <button class="c-val" data-a="fix" data-i="${s}" aria-expanded="${fixing}" aria-label="${nm}: ${setStr(e, x)}. ${fixing ? 'Close the fix' : 'Fix the numbers'}">${setStr(e, x)}${each}</button>
          <button class="c-ck" data-a="unlog" data-i="${s}" aria-label="${nm} logged. Un-log it">${OGv2.ui('check')}</button></li>
          ${fixing ? `<li class="c-fixer" role="group" aria-label="Fix ${nm}"><div class="c-steps">${cField('w', wTxt(e, x.w), wUnit(e, x.w), 'Weight', x.w == null, 'fadj', s)}${cField('r', x.r, 'reps', 'Reps', false, 'fadj', s)}</div>
            <button class="wo-text" data-a="fixdone">${OGv2.ui('check')}Done fixing</button></li>` : ''}`;
      }
      return s === nx
        ? `<li class="c-set is-next"><span class="n">${num}</span><span class="c-dim">In the log bar</span><span class="st">Next</span></li>`
        : `<li class="c-set is-later"><span class="n">${num}</span><span>${setStr(e, x)}${each}</span><span></span></li>`;
    }).join('');
    const last = e.last ? `<p class="wo-last">${ic('history')}<span>Last time · ${AGO}<br><b>${e.last.map((p) => pairStr(e, p)).join(' · ')}</b></span></p>` : '';
    const n = S.ex.length, pv = S.ex[j - 1], nv = S.ex[j + 1];
    return `<section class="c-full" aria-label="${esc(e.name)}, open">
      <div class="c-nav">
        <button class="c-all" data-a="collapse" aria-label="All exercises. Back to the list">${ic('list')}All exercises</button>
        <div class="c-pos"><button class="wo-ib ghost" data-a="cstep" data-d="-1" ${pv ? `aria-label="Previous exercise: ${esc(pv.name)}"` : 'disabled aria-label="No previous exercise"'}>${ic('chevL')}</button>
          <span class="num" aria-label="Exercise ${j + 1} of ${n}">${j + 1} of ${n}</span>
          <button class="wo-ib ghost" data-a="cstep" data-d="1" ${nv ? `aria-label="Next exercise: ${esc(nv.name)}"` : 'disabled aria-label="No next exercise"'}>${ic('chevR')}</button></div>
      </div>
      <div class="wo-titlerow">${thumb(j)}<h2 class="c-h"><button class="c-title" data-a="collapse" aria-label="${esc(e.name)}. Back to all exercises">
        <span class="display wo-name od-clamp-2${isLong(e) ? ' is-long' : ''}">${esc(e.name)}</span></button></h2>
        <button class="wo-ib" data-a="exmenu" aria-label="Options for ${esc(e.name)}">${ic('more')}</button></div>
      ${noteLine(e)}${last}${whyLine(e)}
      <ol class="c-sets">${sets}</ol></section>`;
  }
  function renderC() {
    if (!S.ex.length) return `<div class="app wo wo-C od-screen">${header()}<div class="od-scroll c-list">${emptyHTML()}</div><div></div></div>`;
    const open = S.collapsed ? -1 : S.cur;
    const midHTML = open < 0
      ? `<div class="od-scroll c-list" aria-label="All exercises">${S.ex.map((e, j) => cRow(e, j)).join('')}<div class="c-foot"><button class="wo-outline" data-a="addex">${OGv2.ui('plus')}Add exercise</button></div></div>`
      : `<div class="od-scroll c-view${S.trans ? ` slide-${S.trans}` : ''}" data-swipe>${cOpen(S.ex[open], open)}</div>`;
    let bar;
    if (allDone()) bar = primary(curEx(), 0);
    else if (open < 0) bar = `${restHTML()}<p class="c-hint">Open an exercise to log</p>`;
    else {
      const e = S.ex[open], i = firstOpen(e), nm = `<span class="od-truncate c-logn">${esc(e.name)}</span>`;
      if (i < 0) bar = `${restHTML()}<button class="wo-outline c-log" data-a="addset">${OGv2.ui('plus')}<span class="c-logt">Add set ·&nbsp;</span>${nm}</button>`;
      else {
        const x = e.sets[i], { d, t } = counts();
        bar = `${restHTML()}<div class="c-steps">${cField('w', wTxt(e, x.w), wUnit(e, x.w), 'Weight', x.w == null, 'adj')}${cField('r', x.r, 'reps', 'Reps', false, 'adj')}</div>
          <button class="wo-solid c-log" data-a="log" aria-label="Log ${d === t - 1 ? 'the last set' : setName(e, i).toLowerCase()} of ${esc(e.name)}, ${setStr(e, x)}">${OGv2.ui('check')}<span class="c-logt">${d === t - 1 ? 'Log last set' : `Log ${setName(e, i).toLowerCase()}`} ·&nbsp;</span>${nm}</button>`;
      }
    }
    return `<div class="app wo wo-C od-screen">${header()}${midHTML}<div class="c-dock">${bar}</div></div>`;
  }

  // ═════ away (minimized) and ended: the tab bar is back, GO is the white live timer ═════
  function renderAway() {
    return `<div class="app v2 od-screen tabs-combo tabs-capsule wo-away"><div class="od-scroll"><section class="tabpage"><h1 class="display">Home</h1>
      <p>Today sits here (designed separately). Your workout keeps running: the white timer in the middle of the tab bar is it. Tap it to go back.</p></section></div>
      ${OGv2.tabbarHTML('Home', true, S.startAt || Date.now())}</div>`;
  }
  function renderEnded() {
    const saved = S.ended === 'saved';
    return `<div class="app v2 od-screen tabs-combo tabs-capsule wo-away"><div class="od-scroll"><section class="tabpage"><h1 class="display">${saved ? 'Saved' : 'Discarded'}</h1>
      <p>${saved ? 'Workout saved. The summary, with the streak moment, is its own screen (designed separately).' : 'Workout discarded. Nothing from this session was saved.'}</p>
      <button class="wo-outline" data-a="restart">Start the demo again</button></section></div>
      ${OGv2.tabbarHTML('Home', false)}</div>`;
  }

  // ── render + tick ──
  let jump = false;
  const still = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function render() {
    const sc = content.querySelector('.od-scroll'), top = sc ? sc.scrollTop : 0;
    const wasList = !!content.querySelector('.c-list');
    if (wasList) S.listTop = top;
    host.dataset.rc = S.name === 'Freestyle' ? 'none' : 'push';
    content.innerHTML = S.view === 'away' ? renderAway() : S.view === 'ended' ? renderEnded() : { A: renderA, B: renderB, C: renderC }[DIR]();
    const sc2 = content.querySelector('.od-scroll');
    if (sc2 && DIR !== 'C') sc2.scrollTop = jump ? 0 : top;
    else if (sc2 && !wasList && !jump && sc2.classList.contains('c-view')) sc2.scrollTop = top;
    if (DIR === 'C' && S.view === 'live' && sc2) {
      // the list keeps its own scroll; a newly opened or switched exercise starts at its top
      if (sc2.classList.contains('c-list')) sc2.scrollTop = S.listTop || 0;
      else if (wasList || jump || S.trans) sc2.scrollTop = 0;
      // the row grows into the full view (Web Animations; none under reduced motion)
      if (S.grow && sc2.classList.contains('c-view') && !still() && sc2.animate) {
        const { t, b2 } = S.grow;
        sc2.animate([{ clipPath: `inset(${t}px 16px ${b2}px 16px round 14px)` }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], { duration: 260, easing: 'cubic-bezier(.2,.8,.2,1)' });
      }
    }
    S.grow = null; S.trans = null;
    if (DIR === 'B') { const rail = content.querySelector('.b-chips'), on = rail?.querySelector('.is-on'); if (on) rail.scrollLeft = on.offsetLeft - 16; }
    jump = false;
  }
  function tick() {
    if (!S) return;
    const now = Date.now();
    if (S.startAt) content.querySelectorAll('[data-el="clock"], [data-timer]').forEach((n) => { n.textContent = clock((now - S.startAt) / 1000); });
    if (S.view === 'away') content.querySelectorAll('[data-arc]').forEach((n) => n.setAttribute('stroke-dashoffset', (100 - Math.min(100, (now - S.startAt) / (55 * 600))).toFixed(1)));
    if (S.rest && !S.rest.ready) {
      const left = restLeft();
      if (left <= 0) { S.rest.ready = true; if (S.view === 'live') { render(); announce('Rest is over. Ready for the next set.'); } return; }
      const r = content.querySelector('[data-el="rest"]'), f = content.querySelector('[data-el="restfill"]');
      if (r) r.textContent = clock(left);
      if (f) f.style.transform = `scaleX(${Math.min(1, left / S.rest.total)})`;
    }
  }
  let toastT;
  const toast = (msg, act) => {
    const dock = content.querySelector('.a-dock, .b-dock:not(:empty), .c-dock'), hb = host.getBoundingClientRect().bottom;
    const above = dock && dock.offsetHeight ? hb - dock.getBoundingClientRect().top : S.view === 'live' ? 34 : 26 + 64;
    toastEl.style.bottom = `${Math.round(above + 16)}px`;
    toastEl.classList.toggle('has-act', !!act);
    if (act) { toastEl.innerHTML = `<span>${esc(msg)}</span><button type="button">${act.label}</button>`; toastEl.querySelector('button').onclick = () => { toastEl.classList.remove('in'); act.fn(); }; }
    else toastEl.textContent = msg;
    toastEl.classList.add('in'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('in'), act ? 5000 : 2600); };
  const announce = (msg) => { liveEl.textContent = ''; setTimeout(() => { liveEl.textContent = msg; }, 30); };

  // ── actions ──
  const startRest = (sec) => { S.rest = { end: Date.now() + sec * 1000, total: sec, ready: false }; };
  function setVal(k, i, f, v) {
    const e = S.ex[k];
    if (f === 'w') {
      v = v == null ? null : Math.max(0, Math.min(500, Math.round(v * 100) / 100));
      e.sets[i].w = v;
      // like the app: a weight change carries to the sets after it that are not logged yet
      for (let j = i + 1; j < e.sets.length; j++) if (!e.sets[j].done && !e.sets[j].warm) e.sets[j].w = v;
    } else e.sets[i].r = Math.max(0, Math.min(100, Math.round(v)));
  }
  function adj(f, d) {
    const k = S.cur, e = S.ex[k], i = setIdx(e), x = e.sets[i];
    if (f === 'w') {
      const base = x.w == null ? (d > 0 ? 0 : null) : x.w;
      if (base == null) return;
      setVal(k, i, 'w', base + d * e.step);
      announce(`${wTxt(e, e.sets[i].w)} ${wUnit(e, e.sets[i].w)}`);
    } else { setVal(k, i, 'r', x.r + d); announce(`${e.sets[i].r} reps`); }
    S.sel = i; render();
  }
  function logSet(k, i) {
    const e = S.ex[k], x = e.sets[i];
    if (x.done) { x.done = false; S.cur = k; S.sel = i; announce(`${setName(e, i)} marked not done`); render(); return; }
    if (x.w == null) { toast('Add a weight first. Tap the number to type it.'); openPad(k, i, 'w'); return; }
    x.done = true; S.sel = null; S.cur = k; S.fix = null; S.collapsed = false;
    if (!S.startAt) { S.startAt = Date.now(); }
    if (allDone()) { S.rest = null; if (DIR === 'C') S.collapsed = true; announce('Last set logged. Every set is done.'); toast('Every set done. Finish when you are ready.'); render(); return; }
    startRest(e.rest);
    let msg = `${setName(e, i)} logged, ${setStr(e, x)}. Rest ${clock(e.rest)}.`;
    if (exDone(e)) { const nx = nextOpenEx(k); if (nx >= 0) { S.cur = nx; S.fix = null; jump = true; S.trans = nx > k ? 'next' : 'prev'; toast(`${short(e.name)} done. Up next: ${short(S.ex[nx].name)}`); msg += ` Up next: ${S.ex[nx].name}.`; } }
    announce(msg); render();
  }
  function go(j) { if (j < 0 || j >= S.ex.length) return; S.cur = j; S.sel = null; S.fix = null; S.collapsed = false; jump = true; render(); }
  // C: back to the list. The view shrinks to the row it came from (<=220ms), then the list shows.
  let closing = false;
  function collapseC() {
    if (closing || S.collapsed) return;
    const k = S.cur, view = content.querySelector('.c-view');
    const done = () => { closing = false; S.collapsed = true; S.fix = null; render(); content.querySelector(`[data-a="open"][data-i="${k}"]`)?.focus({ preventScroll: true }); };
    if (!view || still() || !view.animate) return done();
    const h = view.clientHeight, t = Math.max(0, Math.min(h - 56, 4 + k * 64 - (S.listTop || 0)));
    closing = true;
    view.animate([{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: `inset(${t}px 16px ${Math.max(0, h - t - 56)}px 16px round 14px)` }], { duration: 220, easing: 'cubic-bezier(.4,0,1,1)' }).onfinish = done;
  }
  // C: straight to the previous or next exercise, without a trip through the list. The log bar follows.
  function stepC(d) {
    const j = S.cur + d; if (S.collapsed || j < 0 || j >= S.ex.length) return;
    S.trans = d > 0 ? 'next' : 'prev'; go(j);
    content.querySelector(`[data-a="cstep"][data-d="${d}"]:not([disabled])`)?.focus({ preventScroll: true }) || content.querySelector('.c-all')?.focus({ preventScroll: true });
    announce(`${S.ex[j].name}, exercise ${j + 1} of ${S.ex.length}`);
  }
  // C: fix a logged set's numbers in place (the bar keeps logging the next set).
  function fixAdj(f, d) {
    const e = curEx(), i = S.fix; if (i == null) return; const x = e.sets[i];
    if (f === 'w') { const base = x.w == null ? 0 : x.w; setVal(S.cur, i, 'w', base + d * e.step); announce(`${wTxt(e, e.sets[i].w)} ${wUnit(e, e.sets[i].w)}`); }
    else { setVal(S.cur, i, 'r', x.r + d); announce(`${e.sets[i].r} reps`); }
    render();
  }

  function onClick(ev) {
    const b = ev.target.closest('[data-a], [data-act]'); if (!b || layer || b.disabled) return;
    const a = b.dataset.a || b.dataset.act, i = Number(b.dataset.i);
    if (a === 'min') { S.view = 'away'; render(); content.querySelector('.tb-start')?.focus({ preventScroll: true }); }
    else if (a === 'resume') { S.view = 'live'; render(); content.querySelector('[data-a="min"]')?.focus({ preventScroll: true }); }
    else if (a === 'tab') toast(b.dataset.tab === 'Home' ? 'You are on Home.' : `${b.dataset.tab} is designed separately. The timer keeps running.`);
    else if (a === 'start' || a === 'restart') reset('checkin');
    else if (a === 'wmenu') workoutMenu();
    else if (a === 'finish') finishSheet();
    else if (a === 'exprev') go(S.cur - 1);
    else if (a === 'exnext') go(S.cur + 1);
    else if (a === 'goto') go(i);
    else if (a === 'open') {
      const mid = content.querySelector('.c-list'), r = b.getBoundingClientRect(), m = mid.getBoundingClientRect();
      S.grow = { t: Math.max(0, r.top - m.top), b2: Math.max(0, m.bottom - r.bottom) };
      go(i); content.querySelector('.c-all')?.focus({ preventScroll: true });
    }
    else if (a === 'collapse') collapseC();
    else if (a === 'cstep') stepC(Number(b.dataset.d));
    else if (a === 'fix') { S.fix = S.fix === i ? null : i; render(); content.querySelector(`[data-a="fix"][data-i="${i}"]`)?.focus({ preventScroll: true }); }
    else if (a === 'fixdone') { const f = S.fix; S.fix = null; render(); content.querySelector(`[data-a="fix"][data-i="${f}"]`)?.focus({ preventScroll: true }); }
    else if (a === 'fadj') { fixAdj(b.dataset.f, Number(b.dataset.d)); content.querySelector(`[data-a="fadj"][data-f="${b.dataset.f}"][data-d="${b.dataset.d}"]`)?.focus({ preventScroll: true }); }
    else if (a === 'unlog') {
      const e = curEx(), x = e.sets[i], nm = setName(e, i);
      x.done = false; if (S.fix === i) S.fix = null; render(); announce(`${nm} un-logged`);
      content.querySelector('[data-a="log"]')?.focus({ preventScroll: true });
      toast(`${nm} of ${short(e.name)} un-logged.`, { label: 'Undo', fn: () => { x.done = true; render(); announce(`${nm} logged again`); } });
    }
    else if (a === 'exmenu') exerciseMenu(S.cur);
    else if (a === 'history') historySheet(S.cur);
    else if (a === 'anim') howtoSheet(i);
    else if (a === 'pick') { S.sel = i; render(); content.querySelector(`[data-a="pick"][data-i="${i}"]`)?.focus({ preventScroll: true }); }
    else if (a === 'adj') { adj(b.dataset.f, Number(b.dataset.d)); content.querySelector(`[data-a="adj"][data-f="${b.dataset.f}"][data-d="${b.dataset.d}"]`)?.focus({ preventScroll: true }); }
    else if (a === 'pad') openPad(S.cur, Number.isFinite(i) ? i : setIdx(curEx()), b.dataset.f);
    else if (a === 'log') { const e = curEx(); logSet(S.cur, setIdx(e)); content.querySelector('[data-a="log"], [data-a="finish"].wo-solid')?.focus({ preventScroll: true }); }
    else if (a === 'tick') { logSet(S.cur, i); content.querySelector(`[data-a="tick"][data-i="${i}"]`)?.focus({ preventScroll: true }); }
    else if (a === 'rskip') { S.rest = null; render(); announce('Rest skipped'); }
    else if (a === 'radj') {
      const d = Number(b.dataset.d), left = restLeft();
      if (left + d <= 0) S.rest = null; else { S.rest.end += d * 1000; S.rest.total = Math.max(S.rest.total, left + d); }
      render(); content.querySelector(`[data-a="radj"][data-d="${d}"]`)?.focus({ preventScroll: true });
    }
    else if (a === 'addex') pickerSheet('add');
    else if (a === 'reorder') reorderSheet();
    else if (a === 'addset') { addSet(S.cur); }
  }
  function addSet(k) { const e = S.ex[k], l = e.sets[e.sets.length - 1]; e.sets.push({ w: l ? l.w : null, r: l ? l.r : 10, done: false }); render(); toast(`Set ${workCount(e)} added to ${short(e.name)}.`); }

  // ── overlays ──
  // Where focus goes when the control that opened a layer is gone (a re-render, a closed sheet): the set's own action.
  const focusFallback = () => content.querySelector('.wo-solid[data-a], [data-a="log"], [data-a="tick"], [data-a="min"], .tb-start')?.focus({ preventScroll: true });
  function trap(el, e, onEsc) {
    if (e.key === 'Escape') { e.preventDefault(); onEsc(); }
    if (e.key === 'Tab') {
      const f = [...el.querySelectorAll('button:not([disabled]), input, textarea')].filter((n) => n.offsetParent !== null);
      if (!f.length) return;
      if (!el.contains(document.activeElement)) { e.preventDefault(); f[0].focus(); return; }
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  }
  function overlay({ dialog = false, title, body, onAct, onDismiss, focus, label, cls = '' }) {
    const opener = document.activeElement;
    const scrim = document.createElement('div'); scrim.className = 'scrim';
    const el = document.createElement('div');
    el.className = dialog ? 'wo-dlg' : `sheet wo-sheet ${cls}`;
    el.setAttribute('role', dialog ? 'alertdialog' : 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'wo-ov-t');
    el.innerHTML = dialog ? `<h2 id="wo-ov-t">${title}</h2>${body}`
      : `<span class="grab" aria-hidden="true"></span><div class="wo-sh-top"><h2 id="wo-ov-t" class="display od-clamp-2">${title}</h2><button class="wo-x" data-x="close" aria-label="${label || 'Close'}">${OGv2.ui('x')}</button></div>${body}`;
    host.append(scrim, el);
    let gone = false;
    const close = (then) => {
      if (gone) return; gone = true;
      scrim.classList.remove('in'); el.classList.remove('in');
      setTimeout(() => { scrim.remove(); el.remove(); }, 200);
      layer = null;
      document.removeEventListener('keydown', onKey, true);
      if (then) { then(); if (!layer && !content.contains(document.activeElement)) focusFallback(); }
      else if (opener && document.contains(opener) && opener !== document.body) opener.focus({ preventScroll: true });
      else focusFallback();
    };
    const dismiss = () => (onDismiss ? onDismiss(close) : close());
    layer = { close, el };
    requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('in'); el.classList.add('in'); (el.querySelector(focus || '[data-x]:not([data-x="close"])') || el.querySelector('[data-x]'))?.focus({ preventScroll: true }); }));
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (!b || b.disabled) return; if (b.dataset.x === 'close') dismiss(); else onAct(b.dataset.x, b, close, el); });
    // On the document, so Escape and Tab still work when focus has slipped off the sheet.
    const onKey = (e) => { if (layer && layer.el === el) trap(el, e, dismiss); };
    document.addEventListener('keydown', onKey, true);
    scrim.addEventListener('click', dismiss);
    return { el, close };
  }
  const menuHTML = (items) => `<div class="wo-menu">${items.filter(Boolean).map((it) => `<button class="wo-mi${it.danger ? ' is-danger' : ''}" data-x="${it.id}" ${it.disabled ? 'disabled' : ''}>${ic(it.icon)}<span><b>${it.label}</b>${it.sub ? `<small>${it.sub}</small>` : ''}</span></button>`).join('')}</div>`;
  function confirmDialog({ title, msg, ok, onOk }) {
    overlay({ dialog: true, title, focus: '[data-x="cancel"]', body: `<p>${msg}</p><div class="acts"><button data-x="cancel">Cancel</button><button class="is-danger" data-x="ok">${ok}</button></div>`,
      onAct: (x, b, close) => { if (x === 'cancel') close(); else close(onOk); } });
  }

  function workoutMenu() {
    overlay({ title: 'Workout options', body: menuHTML([
      { id: 'add', icon: 'plus', label: 'Add exercise' },
      { id: 'order', icon: 'order', label: 'Reorder exercises', sub: 'The only place order changes', disabled: S.ex.length < 2 },
      { id: 'note', icon: 'note', label: S.note ? 'Edit session note' : 'Add session note', sub: S.note ? esc(S.note) : 'How today went, for next time' },
      { id: 'rest', icon: 'sound', label: 'Rest and sound', sub: 'Default rest 2:00 · Sound on' },
      { id: 'discard', icon: 'trash', label: 'Discard workout', danger: true, sub: 'Asks first' }
    ]), onAct: (x, b, close) => close(() => {
      if (x === 'discard') { discardDialog(); return; }
      if (x === 'add') pickerSheet('add');
      else if (x === 'order') reorderSheet();
      else if (x === 'note') noteSheet(null);
      else if (x === 'rest') toast('Rest and sound settings open here, as in the app today.');
    }) });
  }
  function exerciseMenu(k) {
    const e = S.ex[k];
    overlay({ title: esc(e.name), body: menuHTML([
      { id: 'set', icon: 'plus', label: 'Add set' },
      { id: 'rmset', icon: 'minus', label: 'Remove last set', sub: e.sets[e.sets.length - 1]?.done ? 'Its logged numbers go too' : 'Not logged yet', disabled: e.sets.length <= 1 },
      { id: 'warm', icon: 'warm', label: 'Add warm-up set', disabled: e.kind === 'bw' || e.sets.some((x) => x.done) },
      { id: 'note', icon: 'note', label: e.note ? 'Edit note' : 'Add note', sub: 'For this exercise, this workout' },
      { id: 'hist', icon: 'history', label: 'History', sub: e.last ? `Last time ${AGO}` : 'Nothing logged yet' },
      { id: 'swap', icon: 'swap', label: 'Swap exercise' },
      { id: 'rm', icon: 'trash', label: 'Remove exercise', danger: true }
    ]), onAct: (x, b, close) => close(() => {
      if (x === 'set') addSet(k);
      else if (x === 'rmset') {
        const l = e.sets[e.sets.length - 1], nm = setName(e, e.sets.length - 1);
        const doIt = () => { e.sets.pop(); if (S.fix != null && S.fix >= e.sets.length) S.fix = null; render(); toast(`${nm} removed from ${short(e.name)}.`); };
        if (l.done) confirmDialog({ title: `Remove ${nm.toLowerCase()}?`, ok: 'Remove', msg: `It's logged as ${setStr(e, l)}. That goes too.`, onOk: doIt }); else doIt();
      }
      else if (x === 'warm') { const w = e.sets[0].w; e.sets.unshift({ w: w == null ? null : Math.round((w * 0.5) / e.step) * e.step, r: 8, done: false, warm: true }); S.sel = 0; render(); toast('Warm-up set added at the start.'); }
      else if (x === 'note') noteSheet(k);
      else if (x === 'hist') historySheet(k);
      else if (x === 'swap') pickerSheet('swap', k);
      else if (x === 'rm') {
        const logged = e.sets.filter((s) => s.done).length;
        confirmDialog({ title: `Remove ${esc(e.name)}?`, ok: 'Remove',
          msg: logged ? 'The sets you logged for this exercise in this session will be lost.' : 'This removes the exercise from your current session. Your routine stays as it is.',
          onOk: () => {
            S.ex.splice(k, 1); S.sel = null;
            if (S.cur >= S.ex.length) S.cur = Math.max(0, S.ex.length - 1);
            if (S.ex.length && exDone(S.ex[S.cur]) && !allDone()) S.cur = Math.max(0, nextOpenEx(S.cur));
            jump = true; render(); toast(`${short(e.name)} removed.`);
          } });
      }
    }) });
  }
  // Full-screen how-to: the animation large, then the catalogue's steps. Closes with X, Escape or a tap on the strip above it.
  function howtoSheet(k) {
    const e = S.ex[k]; if (!e) return;
    const steps = HOWTO[e.name];
    overlay({ title: esc(e.name), cls: 'wo-full', onAct: () => {},
      body: `<div class="wo-full-fig">${OGAnim.figure(e.name)}</div>
        <h3 class="wo-kick wo-full-h">How to do it</h3>
        ${steps ? `<ol class="wo-steps">${steps.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>`
          : `<p class="wo-sh-p">${e.custom ? 'You made this exercise yourself, so it has no how-to steps.' : 'The how-to steps come from the exercise library.'}</p>`}` });
  }
  function historySheet(k) {
    const e = S.ex[k], rows = e.last ? [['Wed 21 Oct', e.last], ...e.hist] : [];
    overlay({ title: esc(e.name), body: rows.length
      ? `<p class="wo-sh-p">Your last ${rows.length === 1 ? 'session' : `${rows.length} sessions`} with this exercise.</p><ul class="wo-hist">${rows.map(([d, s]) => `<li><b>${d}</b><span>${s.map((p) => pairStr(e, p)).join(' · ')}</span></li>`).join('')}</ul>`
      : '<p class="wo-sh-p">Nothing logged yet. The sets you log today become its first entry, and progression starts from them next time.</p>',
      onAct: () => {} });
  }
  function noteSheet(k) {
    const e = k == null ? null : S.ex[k], cur = e ? e.note : S.note;
    overlay({ title: e ? 'Exercise note' : 'Session note', focus: 'textarea',
      body: `<p class="wo-sh-p">${e ? `Shows under ${esc(e.name)} for the rest of this workout.` : 'Saved with this workout.'}</p>
        <textarea class="wo-ta" aria-label="Note" maxlength="280" placeholder="${e ? 'e.g. Seat on 4, felt the left shoulder' : 'e.g. Slept badly, still got every rep'}">${esc(cur)}</textarea>
        <div class="wo-sh-acts two"><button class="wo-outline" data-x="close">Cancel</button><button class="wo-solid" data-x="save">Save note</button></div>`,
      onAct: (x, b, close, el) => {
        if (x !== 'save') return;
        const v = el.querySelector('textarea').value.trim();
        if (e) e.note = v; else S.note = v;
        close(() => { render(); toast(v ? 'Note saved.' : 'Note removed.'); });
      } });
  }
  function pickerSheet(mode, k) {
    const from = mode === 'swap' ? S.ex[k] : null;
    const names = new Set(S.ex.map((e) => e.name));
    const list = NEW.filter((t) => !names.has(t.name));
    const { el } = overlay({ title: from ? `Swap ${esc(from.name)}` : 'Add exercise', focus: 'input',
      body: `<label class="wo-search">${ic('search')}<span class="wo-sr">Search exercises</span><input type="search" placeholder="Search exercises" autocomplete="off"></label>
        <div class="wo-menu wo-pick">${list.map((t, j) => `<button class="wo-mi" data-x="p${j}" data-name="${esc(t.name.toLowerCase())}">${ic('dumbbell')}<span><b>${esc(t.name)}</b><small>Not logged before</small></span></button>`).join('')}</div>
        <p class="wo-sh-p" data-none hidden>No match. The full library is on the Exercises tab.</p>`,
      onAct: (x, b, close) => {
        const t = list[Number(x.slice(1))];
        if (from) {
          const logged = from.sets.filter((s) => s.done).length;
          const doSwap = () => { S.ex[k] = fresh(t, from.sets.length, from.sets[0].r); S.cur = k; S.sel = null; jump = true; render(); toast(`Swapped to ${short(t.name)}. Same sets and reps.`); };
          close(() => logged ? confirmDialog({ title: `Swap ${esc(from.name)}?`, ok: 'Swap', msg: `The ${logged} set${logged === 1 ? '' : 's'} you logged for it will be lost.`, onOk: doSwap }) : doSwap());
        } else close(() => {
          S.ex.push(fresh(t, 3, t.kind === 'bw' ? 12 : 10));
          if (S.ex.length === 1 || allDone() === false && exDone(curEx())) S.cur = S.ex.length - 1;
          if (S.ex.length === 1 && !S.startAt) S.startAt = Date.now();
          jump = S.ex.length === 1; render(); toast(S.ex.length === 1 ? `${short(t.name)} added. Off you go.` : `${short(t.name)} added at the end.`);
        });
      } });
    el.querySelector('input').addEventListener('input', (ev) => {
      const q = ev.target.value.trim().toLowerCase(); let any = false;
      el.querySelectorAll('.wo-pick [data-name]').forEach((n) => { const on = !q || n.dataset.name.includes(q); n.hidden = !on; any = any || on; });
      el.querySelector('[data-none]').hidden = any;
    });
  }
  function reorderSheet() {
    const draw = (el, focusSel) => {
      el.querySelector('.wo-ord').innerHTML = S.ex.map((e, j) => `<li class="${j === S.cur ? 'is-cur' : ''}"><span class="nm"><span class="od-clamp-2">${esc(e.name)}</span><small>${exDone(e) ? 'Done' : `${e.sets.filter((s) => s.done).length} of ${e.sets.length} sets`}</small></span>
        <button class="wo-ib" data-x="up" data-j="${j}" ${j === 0 ? 'disabled' : ''} aria-label="Move ${esc(e.name)} up">${ic('chevU')}</button>
        <button class="wo-ib" data-x="dn" data-j="${j}" ${j === S.ex.length - 1 ? 'disabled' : ''} aria-label="Move ${esc(e.name)} down">${ic('chevD')}</button></li>`).join('');
      if (focusSel) el.querySelector(focusSel)?.focus({ preventScroll: true });
    };
    const { el } = overlay({ title: 'Reorder exercises', focus: '[data-x="done"]',
      body: '<p class="wo-sh-p">Changes this workout only. Your routine keeps its order.</p><ol class="wo-ord"></ol><div class="wo-sh-acts"><button class="wo-solid" data-x="done">Done</button></div>',
      onAct: (x, b, close, el2) => {
        if (x === 'done') { close(() => { jump = true; render(); }); return; }
        const j = Number(b.dataset.j), t = x === 'up' ? j - 1 : j + 1;
        const curObj = S.ex[S.cur];
        [S.ex[j], S.ex[t]] = [S.ex[t], S.ex[j]];
        S.cur = S.ex.indexOf(curObj);
        render();
        const sel = `[data-x="${x}"][data-j="${t}"]`;
        draw(el2, el2.querySelector(sel) && !el2.querySelector(sel).disabled ? sel : `[data-j="${t}"]:not([disabled])`);
        announce(`${S.ex[t].name} moved to place ${t + 1}`);
      } });
    draw(el);
  }
  function openPad(k, i, f) {
    const e = S.ex[k], x = e.sets[i];
    let val = f === 'w' ? x.w : x.r, typed = '';
    const step = f === 'w' ? e.step : 1;
    const unit = f === 'w' ? wUnit(e, val) : 'reps';
    const show = (el) => { const o = el.querySelector('output'); o.querySelector('.num').textContent = typed || (val == null ? '–' : f === 'w' ? wTxt(e, val) : val); o.classList.toggle('is-typing', !!typed); if (f === 'w') o.querySelector('small').textContent = wUnit(e, typed ? parseFloat(typed) : val); };
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'];
    overlay({ title: `${f === 'w' ? 'Weight' : 'Reps'} · ${setName(e, i).toLowerCase()}`, focus: '[data-x="ok"]',
      body: `<p class="wo-sh-p od-truncate">${esc(e.name)}${f === 'w' && e.kind === 'bw' ? ' · weight added to your body weight' : ''}</p>
        <div class="wo-pad-v"><button data-x="dec" aria-label="Less, by ${fmt(step)}">−${fmt(step)}</button>
          <output aria-live="polite"><span class="num">${val == null ? '–' : f === 'w' ? wTxt(e, val) : val}</span><small>${unit}</small></output>
          <button data-x="inc" aria-label="More, by ${fmt(step)}">+${fmt(step)}</button></div>
        <div class="wo-keys">${keys.map((c) => `<button data-x="k" data-k="${c}" ${c === '.' && f === 'r' ? 'disabled' : ''} aria-label="${c === 'del' ? 'Delete' : c === '.' ? 'Decimal point' : c}">${c === 'del' ? ic('del') : c}</button>`).join('')}</div>
        <div class="wo-sh-acts two"><button class="wo-outline" data-x="close">Cancel</button><button class="wo-solid" data-x="ok">${f === 'w' ? 'Next: reps' : 'Done'}</button></div>`,
      onAct: (xx, b, close, el) => {
        if (xx === 'k') {
          const c = b.dataset.k;
          if (c === 'del') typed = typed.slice(0, -1);
          else if (c === '.' ? !typed.includes('.') : typed.replace('.', '').length < 5) typed = (typed === '' && c === '.') ? '0.' : typed + c;
          show(el); return;
        }
        if (xx === 'dec' || xx === 'inc') {
          const base = typed ? parseFloat(typed) : val;
          val = Math.max(0, (base == null ? 0 : base) + (xx === 'inc' ? step : -step)); typed = ''; show(el); return;
        }
        if (xx === 'ok') {
          const v = typed ? parseFloat(typed) : val;
          close(() => {
            if (v != null && Number.isFinite(v)) setVal(k, i, f, v);
            S.sel = i; render();
            if (f === 'w') openPad(k, i, 'r');
            else content.querySelector(`[data-a="tick"][data-i="${i}"], [data-a="log"]`)?.focus({ preventScroll: true });
          });
        }
      } });
  }
  function finishSheet() {
    const { d, t } = counts(), left = t - d;
    overlay({ title: !d ? 'Nothing logged yet' : left ? 'Finish early?' : 'Finish workout?', focus: '[data-x="save"]',
      body: `${!d ? '<p class="wo-sh-p">You haven’t logged any sets. Finish the workout anyway?</p>' : left ? `<p class="wo-sh-p">${left} set${left === 1 ? '' : 's'} still not logged. Finish the workout now?</p>` : ''}
        <div class="wo-sh-acts"><button class="wo-solid" data-x="save">${ic('flag')}Finish and save</button><button class="wo-outline" data-x="close">Keep going</button></div>
        <div class="wo-sep"></div><button class="wo-text is-danger" data-x="discard" style="justify-self:center">${ic('trash')}Discard workout</button>`,
      onAct: (x, b, close) => {
        if (x === 'save') close(() => { S.view = 'ended'; S.ended = 'saved'; S.rest = null; render(); });
        if (x === 'discard') close(discardDialog);
      } });
  }
  function discardDialog() {
    const { d } = counts();
    confirmDialog({ title: 'Discard workout?', ok: 'Discard', msg: d ? `The ${d} set${d === 1 ? '' : 's'} you logged in this session will be lost.` : 'This workout will not be saved.',
      onOk: () => { S.view = 'ended'; S.ended = 'discarded'; S.rest = null; render(); } });
  }
  function checkinSheet() {
    let val = 80.9;
    overlay({ title: 'Quick check-in', focus: '[data-x="save"]', label: 'Close and start without weighing in',
      body: `<p class="wo-sh-p">Tap to set your weight. We ask before every workout so your curve stays honest.</p>
        <div class="stepper"><button data-x="bw" data-d="-0.1" aria-label="Decrease by 0.1 kg">−</button>
          <output class="num" aria-live="polite"><span class="v">${val.toFixed(1)}</span><small>kg</small></output>
          <button data-x="bw" data-d="0.1" aria-label="Increase by 0.1 kg">+</button></div>
        <div class="wo-sh-acts"><button class="wo-solid" data-x="save">Save &amp; start workout</button><button class="wo-text" data-x="skip" style="justify-self:center">Start without weighing in</button></div>`,
      onDismiss: (close) => close(() => begin(null)),
      onAct: (x, b, close, el) => {
        if (x === 'bw') { val = Math.round((val + Number(b.dataset.d)) * 10) / 10; el.querySelector('.v').textContent = val.toFixed(1); }
        if (x === 'save') close(() => begin(val));
        if (x === 'skip') close(() => begin(null));
      } });
  }
  function begin(bw) {
    S.bw = bw; render();
    toast(bw ? `Saved ${bw.toFixed(1)} kg. The clock starts with your first set.` : 'No weigh-in today. The clock starts with your first set.');
    content.querySelector('[data-a="log"], [data-a="tick"]')?.focus({ preventScroll: true });
  }

  function reset(state) {
    if (layer) layer.close(() => {});
    host.querySelectorAll('.scrim, .wo-sheet, .wo-dlg').forEach((n) => n.remove());
    layer = null;
    if (state === 'first') state = 'entering';
    S = build(STATES.includes(state) ? state : 'entering');
    jump = true; render();
    if (S.state === 'checkin') checkinSheet();
    if (S.state === 'finish') finishSheet();
    if (S.state === 'discard') discardDialog();
  }

  function mount(o) {
    DIR = ['A', 'B', 'C'].includes(o.dir) ? o.dir : 'A';
    ANIM = ['full', 'small', 'off'].includes(o.anim) ? o.anim : 'full';
    content = o.content; host = o.host;
    host.classList.add('og', 'p-ios');
    toastEl = document.createElement('div'); toastEl.className = 'toast wo-toast'; toastEl.setAttribute('role', 'status');
    liveEl = document.createElement('div'); liveEl.className = 'wo-sr'; liveEl.setAttribute('aria-live', 'polite');
    host.append(toastEl, liveEl);
    content.addEventListener('click', (ev) => { if (swiped) { swiped = false; ev.stopPropagation(); return; } onClick(ev); }, true);
    // C: a horizontal swipe on the open view moves to the previous or next exercise
    let sx = null, sy = 0, swiped = false;
    content.addEventListener('pointerdown', (e) => { sx = e.target.closest('[data-swipe]') ? e.clientX : null; sy = e.clientY; swiped = false; });
    content.addEventListener('pointerup', (e) => {
      if (sx == null || layer) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null;
      if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.5) { swiped = true; stepC(dx < 0 ? 1 : -1); setTimeout(() => { swiped = false; }, 0); }
    });
    // C: Escape closes the open exercise (sheets handle their own Escape first)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !e.defaultPrevented && !layer && DIR === 'C' && S.view === 'live' && !S.collapsed && S.ex.length && !/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) { e.preventDefault(); collapseC(); }
    });
    window.addEventListener('message', (e) => { if (e.data && typeof e.data.ogState === 'string' && (STATES.includes(e.data.ogState) || e.data.ogState === 'first')) reset(e.data.ogState); });
    setInterval(tick, 500);
    reset(o.state || 'entering');
    if (o.open === 'anim' && hasAnim() && S.view === 'live' && S.ex.length && !layer) howtoSheet(S.cur);
  }
  return { mount, STATES };
})();
