// openGym · Progress tab (iPhone exploration). Own file; reuses OGv2.tabbarHTML / OGv2.ui only.
// OGPG.mount({ dir: 'overview' | 'focus' | 'log' | 'mix', state, content, host })
// Board message: { ogState: 'plenty' | 'few' | 'new' | 'long' | 'live' | 'noweight' }
// Every number on screen is worked out from the sample data below, so the directions always agree.
window.OGPG = (() => {
  const ui = (n) => OGv2.ui(n);
  const SVG = (b) => `<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${b}</svg>`;
  const IC = {
    trophy: SVG('<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M9 20h6M10 17h4"/>'),
    chev: SVG('<path d="M9 6l6 6-6 6"/>'),
    chevL: SVG('<path d="M15 6l-6 6 6 6"/>'),
    chevD: SVG('<path d="M6 9l6 6 6-6"/>'),
    search: SVG('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>'),
    trash: SVG('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>'),
    cal: SVG('<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>')
  };

  // ── dates (the week is Mon 26 Oct – Sun 1 Nov 2026; today is Wed 28 Oct) ──
  const TODAY_ISO = '2026-10-28';
  const D = (iso) => new Date(iso + 'T12:00:00');
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const add = (s, n) => { const d = D(s); d.setDate(d.getDate() + n); return iso(d); };
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dShort = (s) => { const d = D(s); return `${d.getDate()} ${MON[d.getMonth()]}`; };
  const dDay = (s) => { const d = D(s); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`; };
  const weekKey = (s) => { const d = D(s); const off = (d.getDay() + 6) % 7; return add(s, -off); };
  const daysAgo = (s) => Math.round((D(TODAY_ISO) - D(s)) / 864e5);

  // ── number formats ──
  const n1 = (n) => n.toFixed(1);
  const kg = (n) => (Math.round(n * 10) / 10 % 1 ? n1(n) : String(Math.round(n)));
  const tonnes = (k) => k >= 1000 ? `${n1(k / 1000)} t` : `${Math.round(k)} kg`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ── sample routines and exercises (same story as Today: Push A, Pull A, Legs) ──
  // per exercise: sets in the routine, ALL-TIME BEST top weight (shared with the Exercises screen), step and
  // how many sessions per step (earlier sessions are worked back from the best); bw = bodyweight (best = reps)
  const EX = {
    bench: ['Bench press', 'push', 3, 72.5, 2.5, 2, 6, { Chest: 1, Triceps: .5, Shoulders: .5 }],
    incline: ['Incline dumbbell press', 'push', 4, 28, 2, 3, 10, { Chest: 1, Shoulders: .5 }],
    ohp: ['Overhead press', 'push', 3, 45, 2.5, 3, 8, { Shoulders: 1, Triceps: .5 }],
    lateral: ['Lateral raise', 'push', 4, 12, 1, 4, 12, { Shoulders: 1 }],
    pushdown: ['Triceps pushdown', 'push', 3, 32.5, 2.5, 3, 12, { Triceps: 1 }],
    dips: ['Dips', 'push', 3, 12, 1, 3, 10, { Triceps: 1, Chest: .5 }, true],
    deadlift: ['Deadlift', 'pull', 3, 140, 5, 2, 5, { Back: 1, Hamstrings: .5, Glutes: .5 }],
    pullup: ['Pull-up', 'pull', 4, 10, 1, 3, 6, { Back: 1, Biceps: .5 }, true],
    row: ['Barbell row', 'pull', 4, 70, 2.5, 2, 8, { Back: 1, Biceps: .5, 'Rear delts': .5 }],
    facepull: ['Face pull', 'pull', 3, 25, 2.5, 4, 15, { 'Rear delts': 1 }],
    hammer: ['Hammer curl', 'pull', 3, 16, 1, 3, 10, { Biceps: 1 }],
    curl: ['Barbell curl', 'pull', 3, 35, 2.5, 4, 10, { Biceps: 1 }],
    squat: ['Back squat', 'legs', 4, 110, 2.5, 3, 6, { Quads: 1, Glutes: .5 }],
    rdl: ['Romanian deadlift', 'legs', 4, 90, 2.5, 3, 8, { Hamstrings: 1, Glutes: .5 }],
    legpress: ['Leg press', 'legs', 4, 200, 10, 3, 10, { Quads: 1, Glutes: .5 }],
    legcurl: ['Leg curl', 'legs', 3, 50, 2.5, 3, 12, { Hamstrings: 1 }],
    calf: ['Calf raise', 'legs', 4, 80, 2.5, 3, 12, { Calves: 1 }]
  };
  // Bench press, exactly as the Exercises screen shows it (every Wed from 16 Sep). Earlier sessions are lighter.
  const BENCH = { '2026-09-16': [65, [6, 6, 5]], '2026-09-23': [67.5, [5, 5, 5]], '2026-09-30': [67.5, [6, 6, 5]],
    '2026-10-07': [70, [5, 5, 4]], '2026-10-14': [70, [6, 5, 5]], '2026-10-21': [72.5, [5, 5, 4]] };
  const RT = {
    push: { name: 'Push A', min: 55, ex: ['bench', 'incline', 'ohp', 'lateral', 'pushdown', 'dips'] },
    pull: { name: 'Pull A', min: 50, ex: ['deadlift', 'pullup', 'row', 'facepull', 'hammer', 'curl'] },
    legs: { name: 'Legs', min: 60, ex: ['squat', 'rdl', 'legpress', 'legcurl', 'calf'] }
  };
  const LONG = {
    ex: { bench: 'Paused close-grip bench press with a 2-second stop on the chest', pullup: 'Neutral-grip pull-up with a slow 4-second lower', legpress: 'Single-leg 45° leg press, feet high and wide' },
    rt: { push: 'Push A · Heavy chest, shoulders and triceps day', legs: 'Legs and lower back, the long Saturday session' }
  };
  const FEATURED = ['bench', 'squat', 'deadlift', 'ohp'];
  const MUSCLES = ['Chest', 'Shoulders', 'Triceps', 'Back', 'Biceps', 'Rear delts', 'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Abs'];
  // Today's body-weight sample, unchanged: 30 daily weigh-ins, 29 Sep → 28 Oct
  const W = [82.4,82.6,82.3,82.1,82.2,82.0,81.9,82.1,81.8,81.7,81.9,81.6,81.5,81.6,81.4,81.3,81.5,81.2,81.1,81.3,81.0,81.1,80.9,81.0,80.8,80.9,80.7,80.9,80.8,80.9];
  const GOAL = 78.0;

  // ── build a history: Mon Legs, Wed Push, Fri Pull, Sat Legs, from Mon 6 Jul.
  // A 9-week run (6 Jul – 6 Sep), one week off (7 Sep), then the current 7-week streak.
  function schedule() {
    const out = [], skip = { 1: [5], 4: [4], 6: [5], 11: [5], 12: [5] }; // a few missed days, like real life
    for (let wk = 0; wk <= 16; wk++) {
      if (wk === 9) continue;
      const mon = add('2026-07-06', wk * 7);
      [[0, 'legs'], [2, 'push'], [4, 'pull'], [5, 'legs']].forEach(([off, r]) => {
        const d = add(mon, off);
        if (d >= TODAY_ISO || (skip[wk] || []).includes(off)) return;
        out.push([d, r]);
      });
    }
    return out;
  }
  function build(plan) {
    const k = {}, best = {}, ws = [], K = {};
    plan.forEach(([, r]) => { K[r] = (K[r] || 0) + 1; });
    const early = plan.filter(([d, r]) => r === 'push' && d < '2026-09-16').length;
    plan.forEach(([d, r], i) => {
      const kk = k[r] = (k[r] ?? -1) + 1, prs = [], back = K[r] - 1 - kk;
      const entries = RT[r].ex.map((id) => {
        const [, , n, top0, step, every, reps, , bw] = EX[id];
        let sets;
        if (id === 'bench' && BENCH[d]) sets = BENCH[d][1].map((x) => ({ w: BENCH[d][0], r: x }));
        else if (id === 'bench') { const w = 62.5 - 2.5 * Math.floor((early - 1 - kk) / 2); sets = [6, 6, 5].map((x) => ({ w, r: x })); }
        else {
          const lvl = Math.floor(back / every), fresh = back % every === every - 1 && kk > 0;
          const top = bw ? 0 : top0 - step * lvl, base = bw ? top0 - lvl : reps - (fresh ? 1 : 0);
          sets = Array.from({ length: n }, (_, j) => ({ w: top, r: Math.max(1, base - (j >= 2 ? j - 1 : 0)) }));
        }
        const top = sets[0].w;
        if (!bw && best[id] != null && top > best[id]) prs.push(id);
        if (!bw) best[id] = Math.max(best[id] ?? 0, top);
        return { id, sets };
      });
      ws.push({ id: `w${i}`, d, r, min: RT[r].min + ((kk * 7 + i) % 9) - 4, entries, prs });
    });
    return ws;
  }
  const WEIGHT_DAYS = W.map((w, i) => ({ d: add('2026-09-29', i), w }));
  function dataFor(state) {
    const base = { workouts: [], weights: [], goal: GOAL, names: {}, live: null, state };
    if (state === 'new') return { ...base, goal: null };
    if (state === 'few') return { ...base, workouts: build([['2026-10-19', 'legs'], ['2026-10-21', 'push'], ['2026-10-26', 'legs']]),
      weights: [{ d: '2026-10-26', w: 81.1 }, { d: '2026-10-28', w: 80.9 }] };
    const all = { ...base, workouts: build(schedule()), weights: WEIGHT_DAYS.map((x) => ({ ...x })) };
    if (state === 'noweight') { all.weights = []; all.goal = null; }
    if (state === 'live') all.live = { r: 'push', startAt: Date.now() - (12 * 60 + 40) * 1000 };
    if (state === 'long') all.names = LONG;
    return all;
  }

  // ── what the screen shows, worked out from the data ──
  const exName = (D_, id) => (D_.names.ex && D_.names.ex[id]) || EX[id][0];
  const rtName = (D_, r) => (D_.names.rt && D_.names.rt[r]) || RT[r].name;
  const isBW = (id) => !!EX[id][8];
  const e1 = (s) => s.w * (1 + s.r / 30);
  const volOf = (w) => w.entries.reduce((a, e) => a + e.sets.reduce((b, s) => b + s.w * s.r, 0), 0);
  const setsOf = (w) => w.entries.reduce((a, e) => a + e.sets.length, 0);
  function streak(ws) {
    const weeks = new Set(ws.map((w) => weekKey(w.d)));
    let n = 0, best = 0, run = 0, cur = weekKey(TODAY_ISO);
    for (let i = 0; i < 60; i++) { if (weeks.has(cur)) n++; else if (i > 0) break; cur = add(cur, -7); }
    const all = [...weeks].sort();
    all.forEach((wk, i) => { run = i && add(all[i - 1], 7) === wk ? run + 1 : 1; best = Math.max(best, run); });
    return { n, best };
  }
  function series(D_, id, metric) {
    return D_.workouts.filter((w) => w.entries.some((e) => e.id === id)).map((w) => {
      const e = w.entries.find((x) => x.id === id);
      const y = isBW(id) ? Math.max(...e.sets.map((s) => s.r)) : metric === 'e1rm' ? Math.round(Math.max(...e.sets.map(e1)) * 2) / 2 : Math.max(...e.sets.map((s) => s.w));
      return { d: w.d, y, pr: w.prs.includes(id), sets: e.sets };
    });
  }
  const unitOf = (id) => (isBW(id) ? 'reps' : 'kg');
  function exList(D_) {
    const ids = Object.keys(EX).filter((id) => D_.workouts.some((w) => w.entries.some((e) => e.id === id)));
    const cur = (id) => { const s = series(D_, id, 'top'); return s.length ? s[s.length - 1].y : 0; };
    return ids.map((id) => ({ id, cur: cur(id) })).sort((a, b) => (isBW(a.id) - isBW(b.id)) || b.cur - a.cur);
  }
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  // weekly body weight, the same way Today works it out (this week = Mon–Wed so far)
  function weightInfo(D_) {
    const ws = D_.weights, n = ws.length;
    if (!n) return { n };
    const byWeek = new Map();
    ws.forEach((b) => { const k = weekKey(b.d); if (!byWeek.has(k)) byWeek.set(k, []); byWeek.get(k).push(b); });
    const weeks = [...byWeek.keys()].sort().slice(-5).map((k) => ({ k, avg: avg(byWeek.get(k).map((b) => b.w)), n: byWeek.get(k).length, days: byWeek.get(k) }));
    weeks.forEach((w, i) => { w.delta = i ? w.avg - weeks[i - 1].avg : null; });
    const cur = weeks[weeks.length - 1].avg, last = ws.slice(-21).map((b) => b.w), m = last.length;
    let rate = null;
    if (m >= 4) { const mx = (m - 1) / 2, my = avg(last); let a = 0, b = 0; last.forEach((v, i) => { a += (i - mx) * (v - my); b += (i - mx) ** 2; }); rate = a / b * 7; }
    const goal = D_.goal, dir = goal == null ? 0 : Math.sign(goal - ws[0].w) || -1;
    const flat = rate != null && Math.abs(rate) < .1, toward = rate != null && !flat && Math.sign(rate) === dir;
    return { n, weeks, cur, rate, goal, flat, toward, first: ws[0], loggedToday: ws[n - 1].d === TODAY_ISO, change: ws[n - 1].w - ws[0].w };
  }
  const wkLabel = (k) => (k === weekKey(TODAY_ISO) ? 'This week' : dShort(k));
  function weightStatus(i) {
    if (i.rate == null) return 'A couple more weigh-ins and your trend shows up here.';
    const t = i.flat ? 'Holding steady' : `${i.rate < 0 ? 'Losing' : 'Gaining'} about ${n1(Math.abs(i.rate))} kg a week`;
    const ic = ui(i.flat ? 'flat' : i.rate < 0 ? 'down' : 'up');
    if (i.goal == null) return `${ic}<span><b>${t}</b> lately.</span>`;
    if (i.toward) return `${ic}<span><b>${t}</b>, on track for your goal.</span>`;
    return `${ic}<span><b>${t}</b> lately. One week doesn't decide it.</span>`;
  }
  // muscles: sets per muscle (primary 1, secondary ½, like the app) for a window, and the plan's week
  function load(ws) {
    const L = {};
    ws.forEach((w) => w.entries.forEach((e) => Object.entries(EX[e.id][7]).forEach(([m, f]) => { L[m] = (L[m] || 0) + f * e.sets.length; })));
    return L;
  }
  const PLANNED = load([{ entries: [...RT.legs.ex, ...RT.legs.ex, ...RT.push.ex, ...RT.pull.ex].map((id) => ({ id, sets: { length: EX[id][2] } })) }]);
  function muscles(D_, range) {
    const wk = weekKey(TODAY_ISO);
    const inWin = D_.workouts.filter((w) => range === 'week' ? weekKey(w.d) === wk : daysAgo(w.d) < range);
    const L = load(inWin), planned = range === 'week' && D_.workouts.length ? PLANNED : {};
    const rows = MUSCLES.filter((m) => (L[m] || 0) > 0 || (planned[m] || 0) > 0)
      .sort((a, b) => (L[b] || 0) - (L[a] || 0) || (planned[b] || 0) - (planned[a] || 0));
    const missed = MUSCLES.filter((m) => !(L[m] > 0) && !(planned[m] > 0));
    return { L, planned, rows, missed, n: inWin.length };
  }
  function model(D_) {
    const ws = D_.workouts, s = streak(ws);
    const month = TODAY_ISO.slice(0, 7);
    const prs = [];
    ws.forEach((w) => w.prs.forEach((id) => { const e = w.entries.find((x) => x.id === id); prs.push({ id, d: w.d, w: e.sets[0].w, r: Math.max(...e.sets.filter((x) => x.w === e.sets[0].w).map((x) => x.r)) }); }));
    const records = Object.keys(EX).filter((id) => !isBW(id) && ws.some((w) => w.entries.some((e) => e.id === id))).map((id) => {
      let best = null; ws.forEach((w) => { const e = w.entries.find((x) => x.id === id); if (e) e.sets.forEach((x) => { if (!best || x.w > best.w || (x.w === best.w && x.r > best.r)) best = { id, w: x.w, r: x.r, d: w.d }; }); });
      return best;
    });
    return { sets: ws.reduce((a, w) => a + setsOf(w), 0), total: ws.length, month: ws.filter((w) => w.d.startsWith(month)).length, lifted: ws.reduce((a, w) => a + volOf(w), 0),
      streak: s.n, best: s.best, prs: prs.reverse(), recentPrs: prs.filter((p) => daysAgo(p.d) < 30), records, wt: weightInfo(D_), first: ws[0] };
  }

  // ── pieces ──
  const rc = (r) => `var(--${r})`;
  function lineChart(pts, { h = 160, unit = 'kg', name = '' } = {}) {
    if (pts.length < 2) return `<div class="pg-chart-empty"><p>${pts.length ? 'One workout so far. Do it once more and your line starts here.' : 'No workouts in this period. Pick a longer one.'}</p></div>`;
    const Wd = 361, pr = 44, top = 14, bot = 10;
    const ys = pts.map((p) => p.y), lo = Math.min(...ys), hi = Math.max(...ys), pad = (hi - lo || 1) * .12;
    const x = (i) => 6 + i / (pts.length - 1) * (Wd - pr - 12), y = (v) => top + (1 - (v - lo + pad) / (hi - lo + 2 * pad)) * (h - top - bot);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.y).toFixed(1)}`).join(' ');
    const L = pts.length - 1;
    return `<figure class="pg-chart"><svg viewBox="0 0 ${Wd} ${h}" role="img" aria-label="${esc(name)}: ${kg(pts[0].y)} ${unit} on ${dShort(pts[0].d)}, ${kg(pts[L].y)} ${unit} on ${dShort(pts[L].d)}">
      <line x1="0" x2="${Wd - pr + 4}" y1="${y(hi).toFixed(1)}" y2="${y(hi).toFixed(1)}" class="gr"/><line x1="0" x2="${Wd - pr + 4}" y1="${y(lo).toFixed(1)}" y2="${y(lo).toFixed(1)}" class="gr"/>
      <text x="${Wd}" y="${(y(hi) + 4).toFixed(1)}" class="yl">${kg(hi)}</text><text x="${Wd}" y="${(y(lo) + 4).toFixed(1)}" class="yl">${kg(lo)}</text>
      <path d="${line}" class="ln"/>
      ${pts.map((p, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(p.y).toFixed(1)}" r="${i === L ? 5 : p.pr ? 3.5 : 2.5}" class="${i === L ? 'end' : p.pr ? 'pr' : 'pt'}"/>`).join('')}
    </svg><figcaption><span>${dShort(pts[0].d)}</span>${pts.some((p) => p.pr) ? '<span class="pg-key"><i></i>Record</span>' : ''}<span>${dShort(pts[L].d)}</span></figcaption></figure>`;
  }
  function weekCols(i, { tall = false } = {}) {
    const wk = i.weeks, PH = tall ? 120 : 96;
    const vals = i.goal == null ? wk.map((w) => w.avg) : wk.map((w) => w.avg).concat(i.goal);
    const lo = Math.min(...vals) - .6, hi = Math.max(...vals) + .2, h = (v) => Math.max(6, (v - lo) / (hi - lo) * PH);
    return `<div class="pg-wks${tall ? ' is-tall' : ''}" style="--n:${wk.length}" role="img" aria-label="Weekly averages: ${wk.map((w) => `${wkLabel(w.k)} ${n1(w.avg)} kg`).join(', ')}${i.goal == null ? '' : `. Goal ${n1(i.goal)} kg`}">
      <div class="plot">${i.goal == null ? '' : `<span class="gl" style="bottom:${h(i.goal).toFixed(0)}px"></span>`}
        ${wk.map((w, k) => `<div class="wc${k === wk.length - 1 ? ' is-now' : ''}">${k === wk.length - 1 ? '' : `<span class="v num display">${n1(w.avg)}</span>`}<span class="b" style="height:${h(w.avg).toFixed(0)}px"></span></div>`).join('')}</div>
      <div class="lab">${wk.map((w) => `<span>${wkLabel(w.k)}</span>`).join('')}</div></div>`;
  }
  const goalLine = (i) => i.goal == null ? '<button class="pg-link" data-act="goal">Set a goal weight</button>'
    : `<span class="dash" aria-hidden="true"></span><span><b class="od-nowrap">${n1(Math.abs(i.cur - i.goal))} kg</b> to your <b class="od-nowrap">${n1(i.goal)} kg</b> goal</span>`;
  const logBtn = (i) => i.n && i.loggedToday
    ? `<button class="pg-pill is-done" data-act="log" aria-label="Logged today. Edit today's weigh-in">${ui('check')}Logged</button>`
    : `<button class="pg-pill" data-act="log">${ui('plus')}Log</button>`;
  function wtEmpty() {
    return `<div class="pg-empty"><h3 class="display">Start your trend</h3>
      <p>Log your weight a few mornings a week. Each week turns into one average, so one heavy morning won't throw you off.</p>
      <button class="pg-pill" data-act="log">${ui('plus')}Log first weigh-in</button></div>`;
  }

  // body map: front and back, shaded white by sets (never a routine color)
  const REG = { Chest: ['chest'], Shoulders: ['delts'], 'Rear delts': ['rdelts'], Triceps: ['triceps'], Biceps: ['biceps'], Back: ['lats', 'traps', 'lowback'], Abs: ['abs'], Glutes: ['glutes'], Quads: ['quads'], Hamstrings: ['hams'], Calves: ['calves', 'calvesF'] };
  function bodyMap(L, label) {
    const max = Math.max(0, ...Object.values(L)), lvl = {};
    Object.entries(REG).forEach(([m, rs]) => { const v = L[m] || 0; const l = !v ? 0 : Math.max(1, Math.ceil(v / max * 4)); rs.forEach((r) => { lvl[r] = Math.max(lvl[r] || 0, l); }); });
    const c = (id) => `m l${lvl[id] || 0}`;
    const fig = (x, back) => `<g transform="translate(${x} 0)"><circle class="hd" cx="50" cy="16" r="11"/><rect class="m l0" x="45" y="27" width="10" height="7" rx="3"/>
      ${back ? `<rect class="${c('traps')}" x="36" y="32" width="28" height="12" rx="5"/>` : ''}
      <ellipse class="${c(back ? 'rdelts' : 'delts')}" cx="27" cy="44" rx="9.5" ry="8.5"/><ellipse class="${c(back ? 'rdelts' : 'delts')}" cx="73" cy="44" rx="9.5" ry="8.5"/>
      ${back ? `<rect class="${c('lats')}" x="32" y="46" width="36" height="30" rx="9"/><rect class="${c('lowback')}" x="39" y="78" width="22" height="16" rx="5"/>`
        : `<rect class="${c('chest')}" x="32" y="36" width="17.5" height="20" rx="6"/><rect class="${c('chest')}" x="50.5" y="36" width="17.5" height="20" rx="6"/><rect class="${c('abs')}" x="40" y="58" width="20" height="36" rx="6"/>`}
      <ellipse class="${c(back ? 'triceps' : 'biceps')}" cx="21" cy="65" rx="6" ry="12"/><ellipse class="${c(back ? 'triceps' : 'biceps')}" cx="79" cy="65" rx="6" ry="12"/>
      <ellipse class="m l0" cx="17" cy="91" rx="5" ry="12"/><ellipse class="m l0" cx="83" cy="91" rx="5" ry="12"/>
      <rect class="${back ? c('glutes') : 'm l0'}" x="33" y="96" width="34" height="${back ? 18 : 13}" rx="7"/>
      <rect class="${c(back ? 'hams' : 'quads')}" x="33" y="${back ? 116 : 111}" width="15.5" height="${back ? 42 : 47}" rx="7"/><rect class="${c(back ? 'hams' : 'quads')}" x="51.5" y="${back ? 116 : 111}" width="15.5" height="${back ? 42 : 47}" rx="7"/>
      <rect class="${c(back ? 'calves' : 'calvesF')}" x="35" y="162" width="11" height="38" rx="5"/><rect class="${c(back ? 'calves' : 'calvesF')}" x="54" y="162" width="11" height="38" rx="5"/>
      <text class="cap" x="50" y="220">${back ? 'BACK' : 'FRONT'}</text></g>`;
    return `<svg class="pg-body" viewBox="0 0 214 226" role="img" aria-label="${esc(label)}">${fig(0, false)}${fig(114, true)}</svg>`;
  }
  const setsTxt = (v) => (Math.round(v * 10) / 10 % 1 ? n1(v) : String(Math.round(v)));
  function muscleRows(mu, limit) {
    const rows = limit ? mu.rows.slice(0, limit) : mu.rows, week = Object.keys(mu.planned).length > 0;
    const max = Math.max(1, ...mu.rows.map((m) => mu.L[m] || 0));
    return `<ul class="pg-mrows">${rows.map((m) => {
      const done = mu.L[m] || 0, plan = mu.planned[m] || 0, fill = week ? Math.min(1, done / plan) : done / max;
      return `<li><span class="nm">${m}</span><span class="bar"><i style="width:${Math.round(fill * 100)}%"></i></span><span class="v num">${week ? `${setsTxt(done)}<span class="of">/${setsTxt(plan)}</span>` : setsTxt(done)}</span></li>`;
    }).join('')}</ul>`;
  }
  const missedChips = (mu) => mu.missed.length ? `<div class="pg-missed"><span class="label">Not in your training${mu.planned && Object.keys(mu.planned).length ? ' or plan' : ''}</span>
      <div class="od-cluster">${mu.missed.map((m) => `<button class="pg-chip" data-act="muscle" data-m="${m}">${m}${IC.chev}</button>`).join('')}</div></div>` : '';

  function wRow(D_, w) {
    const pr = w.prs.length ? `<span class="pg-pr">${IC.trophy}<span>${w.prs.length}<span class="od-sr"> records</span></span></span>` : '';
    return `<li><button class="pg-wrow" data-act="workout" data-id="${w.id}" style="--c:${rc(w.r)}">
      <span class="mk" aria-hidden="true"></span>
      <span class="tx"><span class="tt od-truncate">${esc(rtName(D_, w.r))}</span><span class="ss od-truncate">${dDay(w.d)} · ${w.min} min · ${setsOf(w)} sets · ${tonnes(volOf(w))}</span></span>
      ${pr}<span class="ch">${IC.chev}</span></button></li>`;
  }
  function liveRow(D_) {
    if (!D_.live) return '';
    return `<li><button class="pg-wrow is-live" data-act="resume"><span class="mk" aria-hidden="true"></span>
      <span class="tx"><span class="tt od-truncate">${esc(rtName(D_, D_.live.r))}</span><span class="ss">In progress</span></span>
      <span class="pg-pill is-sm">Resume</span></button></li>`;
  }
  const clock = (ms) => { const t = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
  const seg = (name, val, opts, label) => `<div class="pg-seg" role="group" aria-label="${label}">${opts.map(([v, l]) => `<button data-act="${name}" data-v="${v}" aria-pressed="${String(v) === String(val)}">${l}</button>`).join('')}</div>`;
  const RANGES = [[30, '1M'], [90, '3M'], [365, '1Y'], [0, 'All']];

  // strength block shared by A (compact) and B (full)
  function strength(D_, S, full) {
    const list = exList(D_); if (!list.length) return null;
    const id = list.some((x) => x.id === S.ex) ? S.ex : (list.find((x) => x.id === 'bench') || list[0]).id;
    S.ex = id;
    const bw = isBW(id), metric = bw ? 'top' : S.metric, unit = unitOf(id);
    const all = series(D_, id, metric), pts = all.filter((p) => !S.range || daysAgo(p.d) < S.range);
    const best = all.reduce((a, p) => Math.max(a, p.y), 0), first = pts[0], last = pts[pts.length - 1];
    const diff = pts.length > 1 ? last.y - first.y : 0;
    const what = bw ? 'Most reps in a set' : metric === 'e1rm' ? 'Best estimated max' : 'Best top set';
    const delta = pts.length < 2 ? (all.length < 2 ? 'Your first time logging this one.' : '') : diff > 0 ? `<b>Up ${kg(diff)} ${unit}</b> since ${dShort(first.d)}` : 'Holding steady in this period';
    const head = `<div class="pg-big"><span class="od-nowrap"><span class="v num display">${kg(best)}</span><span class="u display">${unit}</span></span><span class="sub">${what}${delta ? ` · ${delta}` : ''}</span></div>`;
    const metricSeg = bw ? '' : seg('metric', metric, [['top', 'Top set'], ['e1rm', 'Est. max']], 'What to chart');
    const chart = lineChart(pts, { h: full ? 190 : 150, unit, name: exName(D_, id) });
    const note = metric === 'e1rm' && !bw ? '<p class="pg-fine">An estimate from your reps, not a tested max.</p>' : '';
    if (!full) {
      const chips = FEATURED.filter((f) => list.some((x) => x.id === f));
      const extra = chips.includes(id) ? '' : `<button class="pg-chip" data-act="ex" data-id="${id}" aria-pressed="true"><span class="od-truncate">${esc(exName(D_, id))}</span></button>`;
      return `<div class="pg-exrail od-rail" role="group" aria-label="Exercise">${extra}${chips.map((f) => `<button class="pg-chip" data-act="ex" data-id="${f}" aria-pressed="${f === id}"><span class="od-truncate">${esc(exName(D_, f))}</span></button>`).join('')}
        <button class="pg-chip is-more" data-act="picker">All ${list.length}${IC.chevD}</button></div>${head}${chart}<div class="pg-ctl">${metricSeg}${seg('range', S.range, RANGES, 'Period')}</div>${note}`;
    }
    return `<button class="pg-exsel" data-act="picker" aria-label="Exercise: ${esc(exName(D_, id))}. Change"><span class="od-stat"><span class="label">Exercise</span><span class="nm od-clamp-2">${esc(exName(D_, id))}</span></span>${IC.chevD}</button>
      ${head}${chart}<div class="pg-ctl">${metricSeg}${seg('range', S.range, RANGES, 'Period')}</div>${note}
      ${sessList(all, bw, 5)}`;
  }
  // the selected lift's latest sessions, newest first (B's Lifts page, and under D's Strength chart)
  function sessList(all, bw, n) {
    const recent = all.slice(-n).reverse();
    return `<h3 class="pg-h3 label">Last ${recent.length === 1 ? 'workout' : `${recent.length} workouts`}</h3>
      <ul class="pg-sess">${recent.map((p) => `<li><span class="d">${dShort(p.d)}</span><span class="s num">${p.sets.map((s) => bw ? `${s.r}` : `${kg(s.w)}×${s.r}`).join('  ')}</span>${p.pr ? `<span class="pg-pr">${IC.trophy}<span class="od-sr">Record</span></span>` : '<span></span>'}</li>`).join('')}</ul>`;
  }
  function weightBlock(D_, full) {
    const i = model(D_).wt; if (!i.n) return wtEmpty();
    const sub = i.n === 1 ? 'Your first weigh-in' : "This week's average";
    const list = full ? `<h3 class="pg-h3 label">Each week's weigh-ins</h3><ul class="pg-wklist">${i.weeks.slice().reverse().map((w) => `<li><button data-act="week-w" data-k="${w.k}">
        <span class="k">${wkLabel(w.k)}</span><span class="n">${w.n} weigh-in${w.n === 1 ? '' : 's'}</span>${IC.chev}</button></li>`).join('')}</ul>` : '';
    return `<div class="pg-big"><span class="od-nowrap"><span class="v num display">${n1(i.cur)}</span><span class="u display">kg</span></span><span class="sub">${sub}</span></div>
      ${i.n > 1 ? weekCols(i, { tall: full }) : ''}<p class="pg-st">${weightStatus(i)}</p><p class="pg-goal">${goalLine(i)}</p>${list}`;
  }

  // ── Direction A · Overview: one scroll, every topic once, in order of how often you'll look ──
  function overview(D_, S) {
    const M = model(D_);
    if (!M.total) return newUser(D_, 'overview');
    const st = strength(D_, S, false), mu = muscles(D_, 'week'), recent = D_.workouts.slice(-3).reverse();
    return `<header class="pg-hdr"><h1 class="display" tabindex="-1">Progress</h1><p class="pg-since">Since ${dShort(M.first.d)}</p></header>
      <div class="pg-stats" role="list">
        <div class="od-stat" role="listitem"><span class="num display">${M.total}</span><span class="k">Workouts</span></div>
        ${M.month !== M.total ? `<div class="od-stat" role="listitem"><span class="num display">${M.month}</span><span class="k">In ${MONTH_FULL[9]}</span></div>`
          : `<div class="od-stat" role="listitem"><span class="num display">${M.sets}</span><span class="k">Sets done</span></div>`}
        <div class="od-stat" role="listitem"><span class="num display">${M.lifted >= 1000 ? n1(M.lifted / 1000) : Math.round(M.lifted)}<small>${M.lifted >= 1000 ? 't' : 'kg'}</small></span><span class="k">Lifted in total</span></div></div>
      <section class="pg-sec" aria-labelledby="a-st"><div class="pg-top"><h2 id="a-st" class="label pg-kick">Strength</h2></div>${st}</section>
      <section class="pg-sec" aria-labelledby="a-wt"><div class="pg-top"><h2 id="a-wt" class="label pg-kick">Body weight</h2>${M.wt.n ? logBtn(M.wt) : ''}</div>${weightBlock(D_, false)}
        ${M.wt.n ? '<button class="pg-more" data-act="weighins">All weigh-ins' + IC.chev + '</button>' : ''}</section>
      <section class="pg-sec" aria-labelledby="a-mu"><div class="pg-top"><h2 id="a-mu" class="label pg-kick">Muscles this week</h2><span class="pg-meta">Sets done of planned</span></div>
        <div class="pg-murow">${bodyMap(mu.L, 'Muscles trained this week')}${muscleRows(mu, 5)}</div>${missedChips(mu)}</section>
      ${M.recentPrs.length ? `<section class="pg-sec" aria-labelledby="a-pr"><div class="pg-top"><h2 id="a-pr" class="label pg-kick">Records · last 30 days</h2></div>
        <ul class="pg-prs">${M.recentPrs.slice(0, 4).map((p) => prRow(D_, p)).join('')}</ul>
        ${M.recentPrs.length > 4 ? `<button class="pg-more" data-act="recent-records">All ${M.recentPrs.length} records${IC.chev}</button>` : ''}
        <button class="pg-more" data-act="records">Best lift for each exercise${IC.chev}</button></section>` : ''}
      <section class="pg-sec" aria-labelledby="a-hi"><div class="pg-top"><h2 id="a-hi" class="label pg-kick">Recent workouts</h2></div>
        <ul class="pg-wlist">${liveRow(D_)}${recent.map((w) => wRow(D_, w)).join('')}</ul>
        <button class="pg-more" data-act="history">All ${M.total} workouts${IC.chev}</button></section>`;
  }
  const prRow = (D_, p) => `<li><button class="pg-prrow" data-act="exsheet" data-id="${p.id}"><span class="ic">${IC.trophy}</span>
      <span class="tx"><span class="tt od-truncate">${esc(exName(D_, p.id))}</span><span class="ss">${dDay(p.d)}</span></span>
      <span class="v num">${kg(p.w)}<small> kg × ${p.r}</small></span></button></li>`;

  // ── Direction B · Focus: one topic at a time behind a switch ──
  const PANES = [['lifts', 'Lifts'], ['weight', 'Weight'], ['muscles', 'Muscles'], ['history', 'History']];
  const tabsHTML = (S) => `<div class="pg-tabs" role="tablist" aria-label="Progress topics">${PANES.map(([k, l]) => `<button role="tab" data-act="pane" data-v="${k}" aria-selected="${S.pane === k}" ${S.pane === k ? '' : 'tabindex="-1"'}>${l}</button>`).join('')}</div>`;
  function focus(D_, S) {
    const M = model(D_);
    if (!M.total && S.pane !== 'weight') return newUser(D_, 'focus', S);
    return `<header class="pg-hdr"><h1 class="display" tabindex="-1">Progress</h1></header>${tabsHTML(S)}
      <section class="pg-pane" role="tabpanel" aria-label="${PANES.find((p) => p[0] === S.pane)[1]}">${paneBody(D_, S, M)}</section>`;
  }
  function paneBody(D_, S, M) {
    let body = '';
    if (S.pane === 'lifts') body = strength(D_, S, true);
    else if (S.pane === 'weight') body = `<div class="pg-top"><span></span><span class="od-row">${M.wt.n ? `${logBtn(M.wt)}` : ''}</span></div>${weightBlock(D_, true)}`;
    else if (S.pane === 'muscles') {
      const mu = muscles(D_, S.mrange);
      body = `${seg('mrange', S.mrange, [['week', 'This week'], [30, '30 days'], [90, '90 days']], 'Period')}
        <p class="pg-meta pg-mhead">${S.mrange === 'week' ? 'Sets done this week, of what your plan has' : `Sets in the last ${S.mrange} days · ${mu.n} workouts`}</p>
        <div class="pg-bigbody">${bodyMap(mu.L, 'Muscles trained')}</div><p class="pg-legend"><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i>More sets</p>
        ${mu.rows.length ? muscleRows(mu) : '<p class="pg-meta">No workouts in this period yet.</p>'}${missedChips(mu)}`;
    } else body = monthView(D_, S, true);
    return body;
  }
  // month calendar: a solid disc in the routine's color on days you trained (like Today's week strip)
  function calendar(D_, ym) {
    const [y, m] = ym.split('-').map(Number), first = `${ym}-01`, lead = (D(first).getDay() + 6) % 7;
    const dim = new Date(y, m, 0).getDate(), byDay = {};
    D_.workouts.forEach((w) => { (byDay[w.d] = byDay[w.d] || []).push(w); });
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push('<span></span>');
    for (let d = 1; d <= dim; d++) {
      const s = `${ym}-${String(d).padStart(2, '0')}`, w = byDay[s], t = s === TODAY_ISO, live = t && D_.live;
      const lbl = `${dDay(s)}${w ? `, ${w.map((x) => rtName(D_, x.r)).join(' and ')}` : live ? ', workout in progress' : ''}`;
      cells.push(w ? `<button class="cd is-done${t ? ' is-today' : ''}" data-act="workout" data-id="${w[0].id}" style="--c:${rc(w[0].r)}" aria-label="${esc(lbl)}">${d}</button>`
        : `<span class="cd${t ? ' is-today' : ''}${live ? ' is-live' : ''}${s > TODAY_ISO ? ' is-future' : ''}" aria-label="${esc(lbl)}">${d}</span>`);
    }
    return `<div class="pg-cal"><div class="dw">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((x) => `<span aria-hidden="true">${x}</span>`).join('')}</div><div class="gd">${cells.join('')}</div></div>`;
  }
  const routineKey = (D_) => `<div class="pg-rkey">${['push', 'pull', 'legs'].filter((r) => D_.workouts.some((w) => w.r === r)).map((r) => `<span style="--c:${rc(r)}"><i></i><span class="od-truncate">${esc(rtName(D_, r))}</span></span>`).join('')}</div>`;
  function monthView(D_, S, withList) {
    const ym = S.month, [y, m] = ym.split('-').map(Number);
    const firstYM = D_.workouts.length ? D_.workouts[0].d.slice(0, 7) : TODAY_ISO.slice(0, 7);
    const prev = m === 1 ? `${y - 1}-12` : `${y}-${String(m - 1).padStart(2, '0')}`, next = m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`;
    const ws = D_.workouts.filter((w) => w.d.startsWith(ym)).reverse();
    const vol = ws.reduce((a, w) => a + volOf(w), 0);
    return `<div class="pg-mon"><button class="pg-ib" data-act="month" data-v="${prev}" aria-label="Previous month" ${prev < firstYM ? 'disabled' : ''}>${IC.chevL}</button>
        <h2 class="display">${MONTH_FULL[m - 1]}</h2><button class="pg-ib" data-act="month" data-v="${next}" aria-label="Next month" ${next > TODAY_ISO.slice(0, 7) ? 'disabled' : ''}>${IC.chev}</button></div>
      <p class="pg-meta pg-monsum">${ws.length} workout${ws.length === 1 ? '' : 's'}${ws.length ? ` · ${tonnes(vol)} lifted` : ''}</p>
      ${calendar(D_, ym)}${routineKey(D_)}
      ${withList ? `<ul class="pg-wlist">${ym === TODAY_ISO.slice(0, 7) ? liveRow(D_) : ''}${ws.map((w) => wRow(D_, w)).join('')}</ul>
        <button class="pg-more" data-act="pastlog">${ui('plus')}Log a past workout</button>` : ''}`;
  }

  // ── Direction C · Logbook: history first, each week a chapter with its weight beside it ──
  const lsum = (M) => `<div class="pg-lsum"><div class="od-stat"><span class="num display">${M.total}</span><span class="k">workouts since ${dShort(M.first.d)}</span></div>
        ${M.prs.length ? `<div class="od-stat"><span class="num display">${M.prs.length}</span><span class="k">records set</span></div>` : `<div class="od-stat"><span class="num display">${M.sets}</span><span class="k">sets done</span></div>`}
        <div class="od-stat"><span class="num display">${M.best}</span><span class="k">weeks, best run</span></div></div>`;
  // o.bare: no header or totals (D's History page) · o.preview: latest o.weeks weeks, no filter, no footer (D's overview)
  function logbook(D_, S, o = {}) {
    const M = model(D_);
    if (!M.total) return newUser(D_, 'log');
    const filter = o.preview ? '' : S.filter, shown = o.preview ? o.weeks : S.shown;
    const ws = D_.workouts.filter((w) => !filter || w.r === filter);
    const byWeek = new Map();
    ws.slice().reverse().forEach((w) => { const k = weekKey(w.d); if (!byWeek.has(k)) byWeek.set(k, []); byWeek.get(k).push(w); });
    const wkW = new Map((M.wt.weeks || []).map((w) => [w.k, w.avg]));
    const thisWk = weekKey(TODAY_ISO);
    if (D_.live && (!filter || filter === D_.live.r) && !byWeek.has(thisWk)) byWeek.set(thisWk, []);
    const keys = [...byWeek.keys()].sort().reverse().slice(0, shown);
    const gaps = (k, i, arr) => { const prev = arr[i + 1]; if (!prev || filter) return ''; const miss = Math.round((D(k) - D(prev)) / 6048e5) - 1;
      return miss > 0 ? `<li class="pg-gap"><span>${miss === 1 ? 'A week off' : `${miss} weeks off`}. Rest counts too.</span></li>` : ''; };
    const filters = [['', 'All'], ...['push', 'pull', 'legs'].map((r) => [r, rtName(D_, r)])];
    return `${o.bare || o.preview ? '' : `<header class="pg-hdr"><h1 class="display" tabindex="-1">Progress</h1></header>${lsum(M)}`}
      ${o.preview ? '' : `<div class="pg-filt od-rail" role="group" aria-label="Show routine">${filters.map(([v, l]) => `<button class="pg-chip${v ? ' has-dot' : ''}" data-act="filter" data-v="${v}" aria-pressed="${S.filter === v}" ${v ? `style="--c:${rc(v)}"` : ''}>${v ? '<i aria-hidden="true"></i>' : ''}<span class="od-truncate">${esc(l)}</span></button>`).join('')}</div>`}
      <ol class="pg-feed">${keys.map((k, i, arr) => { const g = byWeek.get(k), vol = g.reduce((a, w) => a + volOf(w), 0), wa = wkW.get(k), prN = g.reduce((a, w) => a + w.prs.length, 0);
        return `<li class="pg-wk"><div class="pg-wkh"><h2 class="display">${k === thisWk ? 'This week' : `Week of ${dShort(k)}`}</h2>
          <p class="pg-meta">${g.length} workout${g.length === 1 ? '' : 's'}${vol ? ` · ${tonnes(vol)}` : ''}${prN ? ` · ${prN} record${prN === 1 ? '' : 's'}` : ''}${wa != null ? ` · <span class="od-nowrap">${n1(wa)} kg avg</span>` : ''}</p></div>
          <ul class="pg-wlist">${k === thisWk ? liveRow(D_) : ''}${g.map((w) => wRow(D_, w)).join('')}</ul></li>${gaps(k, i, arr)}`; }).join('')}</ol>
      ${o.preview ? '' : byWeek.size > S.shown ? `<button class="pg-more is-center" data-act="older">Show older weeks</button>` : `<p class="pg-meta pg-start">That's the start: your first workout, ${dDay(M.first.d)}.</p>`}`;
  }

  // ── Direction D · Mix: A's one scroll on top, B's full page behind each heading, C's weeks as the history ──
  function mix(D_, S) {
    const M = model(D_);
    if (!M.total) return newUser(D_, 'overview');
    const st = strength(D_, S, false), mu = muscles(D_, 'week');
    const hd = (id, v, l) => `<h2 id="${id}" class="label pg-kick"><button class="pg-open" data-act="detail" data-v="${v}">${l}${IC.chev}</button></h2>`;
    return `<header class="pg-hdr"><h1 class="display" tabindex="-1">Progress</h1></header>${lsum(M)}
      ${st ? `<section class="pg-sec" aria-labelledby="d-st"><div class="pg-top">${hd('d-st', 'lifts', 'Strength')}</div>${st}${sessList(series(D_, S.ex, 'top'), isBW(S.ex), 3)}
        ${M.records.length ? `<button class="pg-more" data-act="records">Best lift for each exercise${IC.chev}</button>` : ''}</section>` : ''}
      <section class="pg-sec" aria-labelledby="d-wt"><div class="pg-top">${hd('d-wt', 'weight', 'Body weight')}${M.wt.n ? logBtn(M.wt) : ''}</div>${weightBlock(D_, false)}</section>
      <section class="pg-sec" aria-labelledby="d-mu"><div class="pg-top">${hd('d-mu', 'muscles', 'Muscles this week')}<span class="pg-meta">Sets done of planned</span></div>
        <div class="pg-murow">${bodyMap(mu.L, 'Muscles trained this week')}${muscleRows(mu, 5)}</div>${missedChips(mu)}</section>
      <section class="pg-sec" aria-labelledby="d-hi"><div class="pg-top">${hd('d-hi', 'history', 'History')}</div>${logbook(D_, S, { preview: true, weeks: 2 })}
        <button class="pg-more" data-act="detail" data-v="history">All ${M.total} workouts, week by week${IC.chev}</button></section>`;
  }
  // D's topic page: pushed over the overview, B's switch on top; History is C's full logbook with its routine filter
  function mixDetail(D_, S) {
    const M = model(D_), name = PANES.find((p) => p[0] === S.pane)[1];
    return `<header class="pg-dhdr"><button class="pg-back" data-act="back">${IC.chevL}Progress</button></header>${tabsHTML(S)}
      <section class="pg-pane" role="tabpanel" aria-label="${name}">${S.pane === 'history' ? logbook(D_, S, { bare: true }) : paneBody(D_, S, M)}</section>`;
  }

  // ── brand new user ──
  function newUser(D_, dir, S) {
    const steps = [
      ['Finish your first workout', 'It lands here with its time, sets and how much you lifted.'],
      ['Do an exercise twice', 'Its line starts, and every heavier set is marked as a record.'],
      ['Weigh in a few mornings', 'Each week becomes one average next to your goal.']];
    const wn = D_.weights.length, lastW = wn ? D_.weights[wn - 1] : null;
    if (lastW) steps[2] = ['Weigh in a few mornings', `<span class="pg-done">${ui('check')}Logged ${n1(lastW.w)} kg today.</span> A couple more mornings and your weekly average shows up.`];
    const tabs = dir === 'focus' ? `<div class="pg-tabs" role="tablist" aria-label="Progress topics">${PANES.map(([k, l]) => `<button role="tab" data-act="pane" data-v="${k}" aria-selected="${S.pane === k}">${l}</button>`).join('')}</div>` : '';
    return `<header class="pg-hdr"><h1 class="display" tabindex="-1">Progress</h1></header>${tabs}
      <section class="pg-new"><h2 class="display">Your progress starts with workout one</h2>
        <p>Nothing to show yet, and that's how everyone starts. This screen fills itself in as you train:</p>
        <ol class="pg-steps">${steps.map(([a, b], i) => `<li><span class="n num display${lastW && i === 2 ? ' is-done' : ''}">${lastW && i === 2 ? ui('check') : i + 1}</span><span class="od-stat"><b>${a}</b><span>${b}</span></span></li>`).join('')}</ol>
        <p class="pg-meta">Tap <b>GO</b> below when you're ready. Trained before openGym?</p>
        <div class="od-cluster"><button class="pg-pill" data-act="pastlog">${ui('plus')}Log a past workout</button>${lastW ? `<button class="pg-pill is-ghost" data-act="log">Edit today's weigh-in</button>` : `<button class="pg-pill is-ghost" data-act="log">${ui('plus')}Log weigh-in</button>`}</div></section>`;
  }

  // ── sheets ──
  function workoutSheet(D_, w) {
    const prs = w.prs.length;
    return `<div class="pg-sh-top"><div class="od-stat"><span class="label">${dDay(w.d)}</span><h4 id="pg-sh-t" class="display od-clamp-2" style="--c:${rc(w.r)}"><i class="mk" aria-hidden="true"></i>${esc(rtName(D_, w.r))}</h4></div>
        <button class="pg-x" data-x="close" aria-label="Close">${ui('x')}</button></div>
      <div class="pg-shstats"><span class="od-stat"><span class="num display">${w.min}</span><span class="k">min</span></span><span class="od-stat"><span class="num display">${setsOf(w)}</span><span class="k">sets</span></span>
        <span class="od-stat"><span class="num display">${tonnes(volOf(w)).replace(/ .*/, '')}</span><span class="k">${volOf(w) >= 1000 ? 'tonnes' : 'kg'} lifted</span></span><span class="od-stat"><span class="num display">${prs}</span><span class="k">record${prs === 1 ? '' : 's'}</span></span></div>
      <ol class="pg-exs">${w.entries.map((e) => `<li><button data-x="ex" data-id="${e.id}"><span class="tx"><span class="tt od-clamp-2">${esc(exName(D_, e.id))}</span>${w.prs.includes(e.id) ? `<span class="pg-pr is-in">${IC.trophy}Record</span>` : ''}
        <span class="ss num">${e.sets.map((s) => isBW(e.id) ? `${s.r} reps` : `${kg(s.w)}×${s.r}`).join('  ')}</span></span>${IC.chev}</button></li>`).join('')}</ol>
      <button class="pg-del" data-x="delete">${IC.trash}Delete workout</button>`;
  }
  function exSheet(D_, id) {
    const all = series(D_, id, 'top'), unit = unitOf(id), best = all.reduce((a, p) => Math.max(a, p.y), 0);
    return `<div class="pg-sh-top"><div class="od-stat"><span class="label">Exercise</span><h4 id="pg-sh-t" class="display od-clamp-2">${esc(exName(D_, id))}</h4></div>
        <button class="pg-x" data-x="close" aria-label="Close">${ui('x')}</button></div>
      <div class="pg-big"><span class="od-nowrap"><span class="v num display">${kg(best)}</span><span class="u display">${unit}</span></span><span class="sub">${isBW(id) ? 'Most reps in a set' : 'Best top set'} · ${all.length} workouts</span></div>
      ${lineChart(all, { h: 150, unit, name: exName(D_, id) })}
      <ul class="pg-sess">${all.slice(-4).reverse().map((p) => `<li><span class="d">${dShort(p.d)}</span><span class="s num">${p.sets.map((s) => isBW(id) ? `${s.r}` : `${kg(s.w)}×${s.r}`).join('  ')}</span>${p.pr ? `<span class="pg-pr">${IC.trophy}<span class="od-sr">Record</span></span>` : '<span></span>'}</li>`).join('')}</ul>`;
  }
  function pickerSheet(D_, S, q) {
    const list = exList(D_), ql = q.trim().toLowerCase();
    const shown = list.filter((x) => !ql || exName(D_, x.id).toLowerCase().includes(ql));
    return `<div class="pg-sh-top"><h4 id="pg-sh-t" class="display">Choose exercise</h4><button class="pg-x" data-x="close" aria-label="Close">${ui('x')}</button></div>
      <label class="pg-search">${IC.search}<span class="od-sr">Search exercises</span><input type="search" placeholder="Search ${list.length} exercises" value="${esc(q)}" data-x="q" autocomplete="off"></label>
      <ul class="pg-plist" data-list>${pickList(D_, S, shown)}</ul>`;
  }
  const pickList = (D_, S, shown) => shown.length ? shown.map((x) => `<li><button data-x="pick" data-id="${x.id}" aria-pressed="${x.id === S.ex}"><span class="nm od-clamp-2">${esc(exName(D_, x.id))}</span>
      <span class="v num">${kg(x.cur)} ${unitOf(x.id)}</span>${x.id === S.ex ? ui('check') : '<span></span>'}</button></li>`).join('') : '<li class="pg-meta">No match. Try a shorter word.</li>';
  function historySheet(D_) {
    const byM = new Map();
    D_.workouts.slice().reverse().forEach((w) => { const k = w.d.slice(0, 7); if (!byM.has(k)) byM.set(k, []); byM.get(k).push(w); });
    return `<div class="pg-sh-top"><div class="od-stat"><span class="label">${D_.workouts.length} workouts</span><h4 id="pg-sh-t" class="display">History</h4></div><button class="pg-x" data-x="close" aria-label="Close">${ui('x')}</button></div>
      <div class="pg-shscroll">${[...byM.entries()].map(([k, ws]) => `<h5 class="label pg-kick">${MONTH_FULL[Number(k.slice(5)) - 1]} · ${ws.length}</h5><ul class="pg-wlist">${(k === TODAY_ISO.slice(0, 7) ? liveRow(D_).replace('data-act="resume"', 'data-x="resume"') : '') + ws.map((w) => wRow(D_, w).replace('data-act="workout"', 'data-x="workout"')).join('')}</ul>`).join('')}</div>`;
  }
  function recentRecordsSheet(D_) {
    const M = model(D_);
    return `<div class="pg-sh-top"><div class="od-stat"><span class="label">Every heavier set you've done since ${dShort(add(TODAY_ISO, -29))}</span><h4 id="pg-sh-t" class="display">${M.recentPrs.length} records</h4></div><button class="pg-x" data-x="close" aria-label="Close">${ui('x')}</button></div>
      <div class="pg-shscroll"><ul class="pg-prs">${M.recentPrs.map((p) => prRow(D_, p).replace('data-act="exsheet"', 'data-x="ex"')).join('')}</ul></div>`;
  }
  function recordsSheet(D_) {
    const M = model(D_);
    return `<div class="pg-sh-top"><div class="od-stat"><span class="label">Heaviest set for each exercise</span><h4 id="pg-sh-t" class="display">Best lifts</h4></div><button class="pg-x" data-x="close" aria-label="Close">${ui('x')}</button></div>
      <div class="pg-shscroll"><ul class="pg-prs">${M.records.sort((a, b) => b.d.localeCompare(a.d)).map((p) => prRow(D_, p).replace('data-act="exsheet"', 'data-x="ex"')).join('')}</ul></div>`;
  }
  function weighInsSheet(D_, k) {
    const i = model(D_).wt;
    return `<div class="pg-sh-top"><div class="od-stat"><span class="label">One average per week</span><h4 id="pg-sh-t" class="display">All weigh-ins</h4></div><button class="pg-x" data-x="close" aria-label="Close">${ui('x')}</button></div>
      <div class="pg-shscroll">${i.weeks.slice().reverse().map((w) => `<section class="pg-wkgrp${w.k === k ? ' is-on' : ''}" id="wk-${w.k}"><div class="h"><h5 class="display">${wkLabel(w.k)}</h5><span class="num">${n1(w.avg)} kg avg</span></div>
        <ul>${w.days.slice().reverse().map((b) => `<li><span>${dDay(b.d)}</span><span class="num">${n1(b.w)} kg</span></li>`).join('')}</ul></section>`).join('')}</div>`;
  }

  // ── mount ──
  function mount({ dir, state, content, host }) {
    dir = ['overview', 'focus', 'log', 'mix'].includes(dir) ? dir : 'overview';
    host.classList.add('og', 'p-ios');
    const S = { ex: 'bench', metric: 'top', range: 0, pane: 'lifts', mrange: 'week', month: TODAY_ISO.slice(0, 7), filter: '', shown: 6, open: false, ovTop: 0, anim: '' };
    let D_ = dataFor(state || 'plenty');
    const toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); host.append(toastEl);
    let toastT;
    const toast = (m) => { toastEl.textContent = m; toastEl.classList.add('in'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('in'), 2400); };
    const draw = (focusSel) => {
      const sc = content.querySelector('.od-scroll'), top = sc ? sc.scrollTop : 0;
      const main = dir === 'focus' ? focus(D_, S) : dir === 'log' ? logbook(D_, S) : dir === 'mix' ? (S.open ? mixDetail(D_, S) : mix(D_, S)) : overview(D_, S);
      const cls = dir === 'mix' && S.open ? ' pg-focus' : '', anim = S.anim ? ` is-${S.anim}` : ''; S.anim = '';
      content.innerHTML = `<div class="app v2 od-screen tabs-combo tabs-capsule pg pg-${dir}${cls}"><div class="od-scroll"><div class="pg-in${anim}">${main}</div></div>${OGv2.tabbarHTML('Progress', !!D_.live, D_.live ? D_.live.startAt : undefined)}</div>`;
      content.querySelector('.od-scroll').scrollTop = top;
      if (focusSel) content.querySelector(focusSel)?.focus({ preventScroll: true });
    };
    setInterval(() => {
      if (!D_.live) return;
      const el = Date.now() - D_.live.startAt;
      host.querySelectorAll('[data-timer]').forEach((n) => { n.textContent = clock(el); });
      host.querySelectorAll('[data-arc]').forEach((n) => n.setAttribute('stroke-dashoffset', (100 - Math.min(100, el / (RT[D_.live.r].min * 600))).toFixed(1)));
    }, 1000);

    // one sheet stack: X, Escape and a tap outside close the top one; focus stays inside and returns after
    const stack = []; let sheetN = 0;
    const focusTitle = () => content.querySelector('.pg-hdr h1')?.focus({ preventScroll: true });
    function sheet(html, onX, { cls = '', alert = false } = {}) {
      const trigger = document.activeElement;
      const scrim = document.createElement('div'); scrim.className = 'scrim' + (stack.length ? ' is-over' : '');
      const el = document.createElement('div');
      el.className = `${alert ? 'pg-alert' : 'sheet pg-sheet'} ${cls}`; el.setAttribute('role', alert ? 'alertdialog' : 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'pg-sh-t');
      const tid = `pg-sh-${++sheetN}`; el.setAttribute('aria-labelledby', tid); html = html.replaceAll('pg-sh-t', tid);
      el.innerHTML = alert ? html : `<span class="grab" aria-hidden="true"></span>${html}`;
      host.append(scrim, el);
      const entry = { el, scrim, trigger };
      stack.push(entry);
      stack.slice(0, -1).forEach((s) => s.el.setAttribute('aria-hidden', 'true'));
      requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('in'); el.classList.add('in'); (el.querySelector('[data-autofocus]') || el.querySelector('input, button')).focus({ preventScroll: true }); }));
      const close = (then) => {
        const i = stack.indexOf(entry); if (i < 0) return; stack.splice(i, 1);
        scrim.classList.remove('in'); el.classList.remove('in');
        setTimeout(() => { scrim.remove(); el.remove(); }, 200);
        const below = stack[stack.length - 1]; if (below) below.el.removeAttribute('aria-hidden');
        if (then) then(); else if (trigger && document.contains(trigger)) trigger.focus({ preventScroll: true });
      };
      entry.close = close;
      el.addEventListener('click', (e) => { const b = e.target.closest('[data-x]'); if (!b || b.tagName === 'INPUT') return; if (b.dataset.x === 'close') close(); else onX(b, close, el); });
      el.addEventListener('input', (e) => { if (e.target.dataset.x === 'q' || e.target.dataset.x === 'kg') onX(e.target, close, el); });
      el.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.dataset.x === 'kg') el.querySelector('.pg-save:not([disabled])')?.click(); });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); close(); }
        if (e.key === 'Tab') {
          const f = [...el.querySelectorAll('button:not([disabled]), input')], a = f[0], z = f[f.length - 1];
          if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
          else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
        }
      });
      scrim.addEventListener('click', () => close());
      return entry;
    }
    const closeAll = () => stack.slice().reverse().forEach((s) => s.close(() => {}));

    function openWorkout(id) {
      const w = D_.workouts.find((x) => x.id === id); if (!w) return;
      sheet(workoutSheet(D_, w), (b, close) => {
        if (b.dataset.x === 'ex') openEx(b.dataset.id);
        if (b.dataset.x === 'delete') confirmDelete(w);
      }, { cls: 'is-tall' });
    }
    function confirmDelete(w) {
      sheet(`<h4 id="pg-sh-t">Delete this workout?</h4><p>${esc(rtName(D_, w.r))}, ${dDay(w.d)}. Its ${setsOf(w)} sets come out of your history and charts${w.prs.length ? `, and its ${w.prs.length} record${w.prs.length === 1 ? '' : 's'} go with it` : ''}. You can't undo this.</p>
        <div class="acts"><button data-x="close" data-autofocus>Cancel</button><button class="is-destructive" data-x="yes">Delete</button></div>`, (b, close) => {
        if (b.dataset.x !== 'yes') return;
        closeAll();
        D_.workouts = D_.workouts.filter((x) => x !== w);
        draw(); focusTitle(); toast(`${rtName(D_, w.r)} on ${dShort(w.d)} deleted`);
      }, { alert: true });
    }
    function openEx(id) { sheet(exSheet(D_, id), () => {}); }
    function openPicker() {
      let q = '';
      sheet(pickerSheet(D_, S, q), (b, close, el) => {
        if (b.dataset.x === 'q') { q = b.value; el.querySelector('[data-list]').innerHTML = pickList(D_, S, exList(D_).filter((x) => exName(D_, x.id).toLowerCase().includes(q.trim().toLowerCase()))); return; }
        if (b.dataset.x === 'pick') { S.ex = b.dataset.id; close(() => {}); draw(dir === 'focus' ? '[data-act="picker"]' : `[data-act="ex"][aria-pressed="true"]`); }
      }, { cls: 'is-tall' });
    }
    function openLog() {
      const i = model(D_).wt, today = i.n && i.loggedToday;
      let val = i.n ? D_.weights[D_.weights.length - 1].w : null;
      const field = val == null
        ? `<label class="pg-kgin"><span class="label">Your weight this morning</span><span class="row"><input type="text" inputmode="decimal" data-x="kg" data-autofocus placeholder="0.0" aria-label="Weight in kilograms" autocomplete="off"><span class="u display">kg</span></span></label>`
        : `<div class="stepper"><button data-x="d" data-d="-0.1" aria-label="Decrease by 0.1 kg">−</button><output class="num" aria-live="polite"><span class="v">${n1(val)}</span><small>kg</small></output><button data-x="d" data-d="0.1" aria-label="Increase by 0.1 kg">+</button></div>`;
      sheet(`<div class="pg-sh-top"><h4 id="pg-sh-t" class="display">${today ? "Today's weigh-in" : 'Log weigh-in'}</h4><button class="pg-x" data-x="close" aria-label="Close">${ui('x')}</button></div>
        ${today ? '<p class="pg-meta">openGym keeps one weigh-in a day. Saving replaces today\'s.</p>' : ''}
        ${field}
        <button class="pg-save" data-x="save" ${val == null ? 'disabled' : 'data-autofocus'}>Save</button>`, (b, close, el) => {
        if (b.dataset.x === 'kg') { const v = Number(b.value.replace(',', '.')); const ok = b.value.trim() !== '' && v >= 30 && v <= 250; val = ok ? Math.round(v * 10) / 10 : null; el.querySelector('.pg-save').disabled = !ok; return; }
        if (b.dataset.x === 'save' && val == null) return;
        if (b.dataset.x === 'd') { val = Math.max(30, Math.min(250, Math.round((val + Number(b.dataset.d)) * 10) / 10)); el.querySelector('.v').textContent = n1(val); }
        if (b.dataset.x === 'save') {
          close(() => {});
          if (today) D_.weights[D_.weights.length - 1].w = val; else D_.weights.push({ d: TODAY_ISO, w: val });
          draw('[data-act="log"]') ; if (!content.querySelector('[data-act="log"]')) focusTitle(); toast(`Saved ${n1(val)} kg for today`);
        }
      });
    }

    const TAB_MSG = { Home: 'Home is the Today screen, designed separately.', Plan: 'Plan is designed separately.', Exercises: 'Exercises is designed separately.' };
    content.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || stack.length) return;
      const a = b.dataset.act, v = b.dataset.v;
      if (a === 'ex') { S.ex = b.dataset.id; draw(`[data-act="ex"][data-id="${S.ex}"]`); }
      else if (a === 'metric') { S.metric = v; draw(`[data-act="metric"][data-v="${v}"]`); }
      else if (a === 'range') { S.range = Number(v); draw(`[data-act="range"][data-v="${v}"]`); }
      else if (a === 'mrange') { S.mrange = v === 'week' ? 'week' : Number(v); draw(`[data-act="mrange"][data-v="${v}"]`); }
      else if (a === 'detail') { S.ovTop = content.querySelector('.od-scroll').scrollTop; S.open = true; S.pane = v; S.anim = 'push'; content.querySelector('.od-scroll').scrollTop = 0; draw('[role="tab"][aria-selected="true"]'); }
      else if (a === 'back') goBack();
      else if (a === 'pane') { S.pane = v; content.querySelector('.od-scroll').scrollTop = 0; draw(`[data-act="pane"][data-v="${v}"]`); }
      else if (a === 'month') { S.month = v; draw(`[data-act="month"][data-v="${v}"]:not([disabled])`); }
      else if (a === 'filter') { S.filter = v; S.shown = 6; draw(`[data-act="filter"][data-v="${v}"]`); }
      else if (a === 'older') { S.shown += 6; draw(); }
      else if (a === 'picker') openPicker();
      else if (a === 'workout') openWorkout(b.dataset.id);
      else if (a === 'exsheet') openEx(b.dataset.id);
      else if (a === 'history') sheet(historySheet(D_), (x) => { if (x.dataset.x === 'workout') openWorkout(x.dataset.id); if (x.dataset.x === 'resume') toast('Back to the live workout.'); }, { cls: 'is-tall' });
      else if (a === 'recent-records') sheet(recentRecordsSheet(D_), (x) => { if (x.dataset.x === 'ex') openEx(x.dataset.id); }, { cls: 'is-tall' });
      else if (a === 'records') sheet(recordsSheet(D_), (x) => { if (x.dataset.x === 'ex') openEx(x.dataset.id); }, { cls: 'is-tall' });
      else if (a === 'weighins' || a === 'week-w') {
        const en = sheet(weighInsSheet(D_, b.dataset.k), () => {}, { cls: 'is-tall' });
        if (b.dataset.k) setTimeout(() => en.el.querySelector(`#wk-${b.dataset.k}`)?.scrollIntoView({ block: 'nearest' }), 300);
      }
      else if (a === 'log') openLog();
      else if (a === 'goal') toast('Opens the goal sheet the app already has.');
      else if (a === 'muscle') toast(`Opens exercises that train ${b.dataset.m}.`);
      else if (a === 'pastlog') toast('Opens the app\'s "Log a past workout" sheet.');
      else if (a === 'resume') toast('Back to the live workout.');
      else if (a === 'start') toast('GO starts today\'s workout, as on Today.');
      else if (a === 'tab') { if (b.dataset.tab !== 'Progress') toast(TAB_MSG[b.dataset.tab]); }
    });
    // D: back to the overview at the same scroll spot, focus on the heading that opened the page
    function goBack() {
      const from = S.pane; S.open = false; S.anim = 'pop'; draw();
      content.querySelector('.od-scroll').scrollTop = S.ovTop;
      content.querySelector(`[data-act="detail"][data-v="${from}"]`)?.focus({ preventScroll: true });
    }
    content.addEventListener('keydown', (e) => { if (e.key === 'Escape' && S.open && !stack.length) goBack(); });
    // B: arrow keys move between topic tabs
    content.addEventListener('keydown', (e) => {
      const t = e.target.closest('[role="tab"]'); if (!t || !['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      const i = PANES.findIndex((p) => p[0] === t.dataset.v), n = PANES[(i + (e.key === 'ArrowRight' ? 1 : PANES.length - 1)) % PANES.length][0];
      S.pane = n; draw(`[data-act="pane"][data-v="${n}"]`);
    });
    window.addEventListener('message', (e) => {
      if (e.data && typeof e.data.ogState === 'string') {
        closeAll(); D_ = dataFor(e.data.ogState); Object.assign(S, { filter: '', shown: 6, month: TODAY_ISO.slice(0, 7), open: false });
        if (e.data.ogState === 'long') S.ex = 'bench';
        const sc = content.querySelector('.od-scroll'); if (sc) sc.scrollTop = 0; draw();
      }
      if (e.data && typeof e.data.ogPane === 'string' && PANES.some((p) => p[0] === e.data.ogPane)) { S.pane = e.data.ogPane; draw(); }
    });
    draw();
  }
  return { mount, _test: { dataFor, model, exList, series, muscles, overview, focus, logbook, mix, mixDetail, workoutSheet, exSheet, pickerSheet, historySheet, recordsSheet, recentRecordsSheet, weighInsSheet } };
})();
