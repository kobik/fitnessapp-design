// openGym · Workout summary (shown right after Finish). iPhone exploration.
// OGsum.mount({ dir: 'moment' | 'score' | 'story' | 'mix', state, content, host })
// Board message: { ogState: 'normal' | 'prs' | 'weekfirst' | 'best' | 'partial' | 'firstever' | 'long' | 'added' }.
// Posting the same state again replays the celebration.
// Needs og/v2.js (OGv2.ui, OGv2.tabbarHTML). Streak and records are white; the routine color only marks which routine was done.
window.OGsum = (() => {
  const ui = OGv2.ui;
  const SV = (body, extra = '') => `<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${body}</svg>`;
  const FLAME = (on) => `<svg class="od-icon" viewBox="0 0 24 24" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true"><path d="M12 21.5c-4 0-7-2.8-7-6.6 0-3.2 2.1-5.3 3.6-7 .4 1.7 1.3 2.9 2.4 3.4C11.2 7.4 12.6 4.6 15.4 2.5c.2 3.3 3.6 5.9 3.6 11 0 4.4-3 8-7 8Z"/></svg>`;
  const IC = {
    trophy: SV('<path d="M8 4h8v5a4 4 0 0 1-8 0V4Z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20.5h7M10 17h4l.5 3.5h-5Z"/>'),
    est: SV('<path d="M4 19h16"/><path d="M5 15l4-4 3 2 6-7"/><path d="M15 6h3v3"/>'),
    camera: SV('<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5Z"/><circle cx="12" cy="12.5" r="3.5"/>'),
    photos: SV('<rect x="3.5" y="5" width="17" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M20.5 16l-5-5-8 8"/>'),
    chev: SV('<path d="M9 6l6 6-6 6"/>'),
    plus: ui('plus'), check: ui('check'), x: ui('x'), up: ui('up'), down: ui('down'), flat: ui('flat'),
    leaf: SV('<path d="M12 21v-6"/><path d="M12 15c-5 0-7-4-7-9 5 0 7 4 7 9Zm0 0c4 0 6-3 6-7-4 0-6 3-6 7Z"/>')
  };

  // ── sample data (one story with Today: week Mon 26 Oct – Sun 1 Nov 2026, Mon Legs done, Wed Push today; streak 7, best 9) ──
  const ROUT = { push: 'Push A', pull: 'Pull A', legs: 'Legs' };
  const MUSCLES = { push: ['Chest', 'Shoulders', 'Triceps'], legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves'] };
  const REGIONS = { Chest: ['chest'], Shoulders: ['delts', 'rdelts'], Triceps: ['triceps'], Quads: ['quads'], Hamstrings: ['hams'], Glutes: ['glutes'], Calves: ['calves', 'calvesF'] };
  const PUSH = () => [
    { n: 'Bench press', wu: 2, w: 72.5, r: [5, 5, 5], last: { w: 72.5, r: [5, 5, 4] }, next: { w: 75, r: 5, kind: 'up' } },
    { n: 'Incline dumbbell press', w: 30, r: [10, 9, 8], last: { w: 30, r: [9, 8, 8] }, next: { w: 30, r: 10, kind: 'hold' } },
    { n: 'Overhead press', w: 50, r: [6, 6, 5], last: { w: 50, r: [6, 6, 5] }, next: { w: 50, r: 6, kind: 'hold' } },
    { n: 'Lateral raise', w: 10, r: [15, 14, 12, 12], last: { w: 10, r: [15, 13, 12, 10] }, next: { w: 10, r: 15, kind: 'hold' } },
    { n: 'Triceps pushdown', w: 32.5, r: [12, 11, 10, 10], last: { w: 32.5, r: [10, 10, 10, 10] }, next: { w: 32.5, r: 12, kind: 'hold' } },
    { n: 'Dips', w: 0, r: [12, 10, 9], last: { w: 0, r: [11, 10, 8] } }
  ];
  const LEGS = () => [
    { n: 'Back squat', wu: 2, w: 100, r: [5, 5, 5, 5], last: { w: 97.5, r: [5, 5, 5, 5] }, next: { w: 102.5, r: 5, kind: 'up' } },
    { n: 'Romanian deadlift', w: 90, r: [8, 8, 8, 7], last: { w: 90, r: [8, 8, 7, 7] }, next: { w: 90, r: 8, kind: 'hold' } },
    { n: 'Leg press', w: 160, r: [10, 10, 9, 9], last: { w: 160, r: [10, 9, 9, 8] }, next: { w: 160, r: 10, kind: 'hold' } },
    { n: 'Leg curl', w: 45, r: [12, 12, 10], last: { w: 45, r: [12, 11, 10] }, next: { w: 45, r: 12, kind: 'hold' } },
    { n: 'Calf raise', w: 70, r: [15, 15, 14, 12], last: { w: 70, r: [15, 14, 13, 12] }, next: { w: 70, r: 15, kind: 'hold' } }
  ];
  const WED = 'Wed 28 Oct', MON = 'Mon 26 Oct';
  // streak ev: 'counted' (this week already counted earlier) · 'kept' (this workout made the week count) · 'best' · 'start'
  const STATES = {
    normal: { label: 'Normal workout', make: () => ({ rid: 'push', date: WED, dur: 55, ex: PUSH(), streak: { ev: 'counted', n: 7, best: 9 } }) },
    prs: { label: 'With records', make: () => {
      const ex = PUSH();
      ex[0] = { ...ex[0], w: 75, r: [5, 5, 4], next: { w: 75, r: 5, kind: 'hold' } };
      ex[3] = { ...ex[3], w: 12, r: [12, 12, 10, 10], next: { w: 12, r: 12, kind: 'hold' } };
      return { rid: 'push', date: WED, dur: 55, ex, streak: { ev: 'counted', n: 7, best: 9 },
        prs: [{ ex: 'Bench press', val: 75, was: 72.5 }, { ex: 'Lateral raise', val: 12, was: 10 }],
        e1: [{ ex: 'Incline dumbbell press', val: 40 }] };
    } },
    weekfirst: { label: "Week's first (streak 6 → 7)", make: () => ({ rid: 'legs', date: MON, dur: 58, ex: LEGS(), streak: { ev: 'kept', was: 6, n: 7, best: 9 } }) },
    best: { label: 'New best streak', make: () => ({ rid: 'legs', date: MON, dur: 58, ex: LEGS(), streak: { ev: 'best', was: 9, n: 10, best: 10, oldBest: 9 } }) },
    partial: { label: 'Short workout', make: () => ({ rid: 'push', date: WED, dur: 26, ex: PUSH().slice(0, 3), partial: ['Lateral raise', 'Triceps pushdown', 'Dips'], streak: { ev: 'counted', n: 7, best: 9 } }) },
    firstever: { label: 'First workout ever', make: () => ({ rid: 'push', date: WED, dur: 55, ex: PUSH().map(({ last, ...e }) => ({ ...e, first: true })), streak: { ev: 'start', was: 0, n: 1, best: 1 } }) },
    long: { label: 'Long names', make: () => {
      const ex = PUSH();
      ex[1] = { ...ex[1], n: 'Paused incline dumbbell press on a 30° bench (2-second pause at the bottom)' };
      ex[3] = { ...ex[3], n: 'Single-arm cable lateral raise, leaning away, cable behind the back' };
      return { rid: 'push', name: 'Upper body power day: heavy chest and shoulders, slow lowering', date: WED, dur: 55, ex, streak: { ev: 'counted', n: 7, best: 9 } };
    } },
    added: { label: 'Added exercise + cardio', make: () => {
      const ex = PUSH();
      ex.push({ n: 'Cable fly', w: 15, r: [12, 12, 10], first: true, added: true });
      return { rid: 'push', date: WED, dur: 66, ex, streak: { ev: 'counted', n: 7, best: 9 },
        cardio: [{ n: 'Treadmill', line: '10 min · 6.0 km/h · 8% incline' }] };
    } }
  };

  // ── derived numbers (the same sums the app's summary makes) ──
  const fmtN = (v) => (Math.round(v * 10) / 10).toLocaleString('en-US');
  const kg = (v) => `${fmtN(v)} kg`;
  const setsLine = (w, r) => (w > 0 ? `${fmtN(w)} kg × ` : '') + r.join(', ') + (w > 0 ? '' : ' reps');
  const top = (x) => x.w, reps = (x) => x.r.reduce((a, b) => a + b, 0);
  const trendOf = (e) => { if (!e.last) return null; const dw = top(e) - top(e.last); if (dw) return dw > 0 ? 1 : -1; const dr = reps(e) - reps(e.last); return dr ? Math.sign(dr) : 0; };
  const NEXT_WORD = { up: 'step up', hold: 'same again', down: 'lighter', deload: 'deload' };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function model(key) {
    const s = STATES[key].make();
    s.key = key;
    s.name = s.name || ROUT[s.rid];
    s.work = s.ex.reduce((n, e) => n + e.r.length, 0);
    s.warm = s.ex.reduce((n, e) => n + (e.wu || 0), 0);
    s.vol = Math.round(s.ex.reduce((n, e) => n + e.w * reps(e), 0));
    s.prs = s.prs || []; s.e1 = s.e1 || []; s.cardio = s.cardio || [];
    s.added = s.ex.filter((e) => e.added);
    s.muscles = MUSCLES[s.rid];
    return s;
  }

  // ── shared pieces ──
  const routineTag = (s) => `<span class="sm-rt"><i aria-hidden="true"></i><span class="od-clamp-2">${esc(s.name)}</span></span>`;
  const closeBtn = () => `<button class="sm-x iconbtn" data-act="close" aria-label="Close summary">${IC.x}</button>`;
  const rollNum = (s, cls) => s.streak.was > 0 && s.streak.ev !== 'counted'
    ? `<span class="sm-roll num ${cls}" aria-hidden="true"><span class="was">${s.streak.was}</span><span class="now">${s.streak.n}</span></span>`
    : `<span class="num ${cls}" aria-hidden="true">${s.streak.n}</span>`;
  const isEvent = (s) => s.streak.ev !== 'counted';
  // the one big moment: a streak event first, then records, then a short day, otherwise "done"
  function moments(s) {
    const m = [];
    if (s.streak.ev === 'best') m.push('best');
    else if (s.streak.ev === 'kept') m.push('kept');
    else if (s.streak.ev === 'start') m.push('start');
    if (s.prs.length || s.e1.length) m.push('records');
    if (s.partial) m.push('short');
    if (!m.length) m.push('done');
    return m;
  }
  const STREAK_TXT = (s) => ({
    best: { kick: 'New best streak', head: 'Longest run ever', sub: `Your old best was ${s.streak.oldBest}. Every week from here sets a new record.` },
    kept: { kick: 'Streak kept', head: 'This week counts', sub: `${s.streak.best - s.streak.n + 1} more weeks and you beat your best of ${s.streak.best}.` },
    start: { kick: 'Your first workout', head: '', sub: 'Your streak starts here. One workout a week keeps it going.' }
  }[s.streak.ev]);
  const recCount = (s) => s.prs.length;
  // one unit label per streak number; a first week is just "1 week streak", not "1 week in a row"
  const unitOf = (s, br = '<br>') => s.streak.n === 1 ? `week${br}streak` : `weeks${br}in a row`;
  const recHead = (s) => s.prs.length ? `${s.prs.length} new record${s.prs.length > 1 ? 's' : ''}` : 'New best estimate';
  const recSub = (s) => s.prs.length ? 'The heaviest you have ever lifted on it. Strong day.' : 'Same weight, more reps: your strongest set yet.';
  const shortTxt = () => ({ head: 'Short and done', sub: 'A short workout still counts. Every set you did is saved.' });

  // stat trio: duration · volume · work sets (warm-ups as the small line)
  const statsData = (s) => [
    { v: s.dur, u: 'min', l: 'Duration' },
    { v: fmtN(s.vol), u: 'kg', l: 'Volume' },
    { v: s.work, u: '', l: 'Work sets', sub: s.warm ? `${s.work + s.warm} with warm-ups` : '' }
  ];
  function stats(s, cls = '') {
    return `<dl class="sm-stats ${cls}">${statsData(s).map((d) => `<div class="od-stat"><dt>${d.l}</dt><dd><span class="num v">${d.v}</span>${d.u ? `<span class="u">${d.u}</span>` : ''}</dd>${d.sub ? `<dd class="sub">${d.sub}</dd>` : ''}</div>`).join('')}</dl>`;
  }
  // quiet streak line, for workouts that didn't change the streak
  const streakQuiet = (s) => `<div class="sm-quiet" aria-label="${s.streak.n} weeks in a row. This week already counts.">
      <span class="fl">${FLAME(true)}</span><span class="od-fill"><b class="num">${s.streak.n}</b> weeks in a row</span><span class="cap">This week already counts</span></div>`;

  function records(s, skipTop = false) {
    const prs = skipTop && s.prs.length ? s.prs.slice(1) : s.prs, e1s = skipTop && !s.prs.length ? s.e1.slice(1) : s.e1;
    if (!prs.length && !e1s.length) return '';
    const pr = prs.map((p) => `<li class="sm-rec"><span class="ic">${IC.trophy}</span><span class="od-fill"><span class="nm od-clamp-2">${esc(p.ex)}</span><span class="dt">was ${kg(p.was)}</span></span><span class="val num">${fmtN(p.val)}<small>kg</small></span></li>`).join('');
    const e1 = e1s.map((p) => `<li class="sm-rec est"><span class="ic">${IC.est}</span><span class="od-fill"><span class="nm od-clamp-2">${esc(p.ex)}</span><span class="dt">Best estimated 1-rep max</span></span><span class="val num">${fmtN(p.val)}<small>kg</small></span></li>`).join('');
    return `<section class="sm-sec"><h3 class="sm-h">${skipTop ? 'Also new' : 'Records'}</h3><ul class="sm-recs">${pr}${e1}</ul></section>`;
  }

  function trendIcon(e) {
    const t = trendOf(e);
    if (t == null) return '<span class="sm-first">First time</span>';
    const [ic, lab] = t > 0 ? ['up', 'Up on last time'] : t < 0 ? ['down', 'Down on last time'] : ['flat', 'Same as last time'];
    return `<span class="sm-tr ${t > 0 ? 'is-up' : ''}" role="img" aria-label="${lab}">${IC[ic]}</span>`;
  }
  const nextLine = (e) => e.next ? `${setsLine(e.next.w, [e.next.r])} · ${NEXT_WORD[e.next.kind]}` : '';
  function exRows(s) {
    return `<ul class="sm-ex">${s.ex.map((e) => `<li>
      <div class="hd"><span class="nm od-clamp-2">${esc(e.n)}</span>${trendIcon(e)}</div>
      <dl class="ln"><div><dt>Today</dt><dd>${setsLine(e.w, e.r)}</dd></div>
        ${e.last ? `<div class="dim"><dt>Last time</dt><dd>${setsLine(e.last.w, e.last.r)}</dd></div>` : ''}
        ${e.next ? `<div class="nx"><dt>Next time</dt><dd>${nextLine(e)}</dd></div>` : ''}</dl></li>`).join('')}</ul>`;
  }
  const notStarted = (s) => s.partial ? `<p class="sm-note">${IC.leaf}<span>Not started today: ${s.partial.join(', ')}. They stay in ${esc(s.name)} for next time.</span></p>` : '';
  function exercises(s, head = 'Last time and next time') {
    return `<section class="sm-sec"><h3 class="sm-h">${head}</h3>${exRows(s)}${notStarted(s)}</section>`;
  }
  function cardio(s) {
    if (!s.cardio.length) return '';
    return `<section class="sm-sec"><h3 class="sm-h">Cardio</h3><ul class="sm-ex">${s.cardio.map((c) => `<li><div class="hd"><span class="nm">${c.n}</span></div><p class="ln1">${c.line}</p></li>`).join('')}</ul></section>`;
  }
  function keep(s, st) {
    if (!s.added.length) return '';
    const names = s.added.map((e) => esc(e.n)).join(', ');
    return `<section class="sm-sec"><h3 class="sm-h">New in this workout</h3>
      <div class="sm-keep"><div><p class="od-clamp-2">${names}</p><p class="rt od-clamp-2">${st.kept ? 'Now part of' : 'Not in'} ${esc(s.name)}${st.kept ? '' : ' yet'}</p></div>${st.kept
        ? `<p class="done" role="status" tabindex="-1">${IC.check}<span>Added to routine</span></p>`
        : `<button class="sm-btn outline" data-act="keep">${IC.plus}<span>Add to routine</span></button>`}</div></section>`;
  }
  function bodyMap(lit) {
    const on = (id) => lit.has(id) ? 'lit' : 'base';
    const fig = (x, back) => `<g transform="translate(${x} 0)">
      <circle class="head" cx="50" cy="16" r="11"/><rect class="base" x="45" y="27" width="10" height="7" rx="3"/>
      ${back ? `<rect class="${on('traps')}" x="36" y="32" width="28" height="12" rx="5"/>` : ''}
      <ellipse class="${on(back ? 'rdelts' : 'delts')}" cx="27" cy="44" rx="9.5" ry="8.5"/><ellipse class="${on(back ? 'rdelts' : 'delts')}" cx="73" cy="44" rx="9.5" ry="8.5"/>
      ${back ? `<rect class="${on('lats')}" x="32" y="46" width="36" height="30" rx="9"/><rect class="${on('lowback')}" x="39" y="78" width="22" height="16" rx="5"/>`
        : `<rect class="${on('chest')}" x="32" y="36" width="17.5" height="20" rx="6"/><rect class="${on('chest')}" x="50.5" y="36" width="17.5" height="20" rx="6"/>
           <rect class="${on('abs')}" x="40" y="58" width="20" height="36" rx="6"/><rect class="base" x="32" y="58" width="7" height="32" rx="3"/><rect class="base" x="61" y="58" width="7" height="32" rx="3"/>`}
      <ellipse class="${on(back ? 'triceps' : 'biceps')}" cx="21" cy="65" rx="6" ry="12"/><ellipse class="${on(back ? 'triceps' : 'biceps')}" cx="79" cy="65" rx="6" ry="12"/>
      <ellipse class="base" cx="17" cy="91" rx="5" ry="12"/><ellipse class="base" cx="83" cy="91" rx="5" ry="12"/>
      <rect class="${back ? on('glutes') : 'base'}" x="33" y="96" width="34" height="${back ? 18 : 13}" rx="7"/>
      <rect class="${on(back ? 'hams' : 'quads')}" x="33" y="${back ? 116 : 111}" width="15.5" height="${back ? 42 : 47}" rx="7"/>
      <rect class="${on(back ? 'hams' : 'quads')}" x="51.5" y="${back ? 116 : 111}" width="15.5" height="${back ? 42 : 47}" rx="7"/>
      <rect class="${on(back ? 'calves' : 'calvesF')}" x="35" y="162" width="11" height="38" rx="5"/><rect class="${on(back ? 'calves' : 'calvesF')}" x="54" y="162" width="11" height="38" rx="5"/>
      <text class="cap" x="50" y="218">${back ? 'BACK' : 'FRONT'}</text></g>`;
    return `<svg class="bm sm-bm" viewBox="0 0 215 224" aria-hidden="true">${fig(0, false)}${fig(115, true)}</svg>`;
  }
  function trained(s, cls = '') {
    const lit = new Set(s.muscles.flatMap((m) => REGIONS[m] || []));
    return `<section class="sm-sec sm-trained ${cls}"><h3 class="sm-h">What you trained</h3>
      <div class="tw">${bodyMap(lit)}<ul class="mus">${s.muscles.map((m) => `<li>${m}</li>`).join('')}</ul></div></section>`;
  }
  function photo(st) {
    return `<section class="sm-sec" aria-label="Photo">${st.photos
      ? `<div class="sm-photo"><span class="th">${IC.photos}</span><span class="od-fill">${st.photos} photo${st.photos > 1 ? 's' : ''} added to this workout</span><button class="sm-btn text" data-act="photo">Add more</button></div>`
      : `<button class="sm-btn outline wide" data-act="photo">${IC.camera}<span>Add a progress photo</span></button>`}</section>`;
  }
  const doneBar = (extra = '') => `<div class="sm-bar">${extra}<button class="sm-btn solid" data-act="done">Done</button></div>`;

  // streak strip: one white tick per week of the current run; this week's tick is the tall one, drawn last
  function weeksStrip(s) {
    const n = s.streak.n;
    const m = Math.min(n, 12);
    const ticks = Array.from({ length: m }, (_, k) => `<i class="${k === m - 1 ? 'on new' : 'on'}"></i>`).join('');
    return `<div class="sm-weeks" aria-hidden="true">${ticks}</div>`;
  }

  // ── Direction A · Moment: one big celebration up top, the details scroll under it ──
  function heroA(s) {
    const m = moments(s)[0];
    let body;
    if (m === 'best' || m === 'kept' || m === 'start') {
      const t = STREAK_TXT(s);
      body = `<div class="a-fl">${FLAME(true)}</div>
        <p class="a-kick">${t.kick}</p>
        <div class="a-num">${rollNum(s, 'n')}<span class="u">${unitOf(s)}</span></div>
        <p class="sr-only">${s.streak.n} ${unitOf(s, ' ')}.</p>
        ${weeksStrip(s)}
        ${t.head ? `<h2 class="a-head display">${t.head}</h2>` : ''}<p class="a-sub">${t.sub}</p>`;
    } else if (m === 'records') {
      // the top record is the moment; the count is the small kicker; the rest are listed under "Also new"
      const tp = s.prs[0] || s.e1[0];
      body = `<div class="a-fl tro">${IC.trophy}</div>
        <p class="a-kick">${recHead(s)}</p>
        <div class="a-num"><span class="num n pop">${fmtN(tp.val)}</span><span class="u">kg</span></div>
        <h2 class="a-head display od-clamp-2">${esc(tp.ex)}</h2><p class="a-sub">${s.prs[0] ? `Was ${kg(tp.was)}. ` : ''}${recSub(s)}</p>`;
    } else if (m === 'short') {
      const t = shortTxt(s);
      body = `<div class="a-fl soft">${IC.check}</div><p class="a-kick">Workout saved</p><h2 class="a-head display big">${t.head}</h2><p class="a-sub">${t.sub}</p>`;
    } else {
      body = `<div class="a-fl soft">${IC.check}</div><p class="a-kick">Workout saved</p><h2 class="a-head display big">Nice work</h2><p class="a-sub">Another one done. Here's how it went.</p>`;
    }
    return `<section class="a-hero m-${m}" aria-label="Summary">${body}</section>`;
  }
  function dirMoment(s, st) {
    return `<div class="app sm sm-a od-screen"><div class="od-scroll" tabindex="-1">
      <header class="sm-top">${closeBtn()}<div class="sm-meta">${routineTag(s)}<span class="d">${s.date}</span></div></header>
      ${heroA(s)}
      ${stats(s)}
      ${isEvent(s) ? '' : streakQuiet(s)}
      ${records(s, moments(s)[0] === 'records')}
      ${exercises(s)}${cardio(s)}${keep(s, st)}${trained(s)}${photo(st)}
    </div>${doneBar()}</div>`;
  }

  // compact exercise list (B and D): name + today's sets, tap for last and next time
  const exTable = (s, st) => `<ul class="b-table">${s.ex.map((e, i) => `<li style="--i:${i}"><button class="b-tr" data-act="row" data-i="${i}" aria-expanded="${!!st.open[i]}" aria-controls="b-x-${i}">
          <span class="tx"><span class="nm od-clamp-2">${esc(e.n)}</span><span class="td od-truncate">${setsLine(e.w, e.r)}</span></span>${e.last ? trendIcon(e) : '<span aria-hidden="true"></span>'}<span class="cv">${IC.chev}</span></button>
          <dl class="b-x ln" id="b-x-${i}" ${st.open[i] ? '' : 'hidden'}>${e.last ? `<div class="dim"><dt>Last time</dt><dd>${setsLine(e.last.w, e.last.r)}</dd></div>` : '<div class="dim"><dt>Last time</dt><dd>First time doing this one</dd></div>'}${e.next ? `<div class="nx"><dt>Next time</dt><dd>${nextLine(e)}</dd></div>` : ''}</dl></li>`).join('')}</ul>`;

  // ── Direction B · Scoreboard: the workout first, celebrations as white cards in one list ──
  function dirScore(s, st) {
    const m = moments(s);
    const cards = [];
    if (['best', 'kept', 'start'].includes(m[0])) {
      const t = STREAK_TXT(s);
      cards.push(`<section class="b-streak ev-${s.streak.ev}" aria-label="${t.kick}. ${s.streak.n} ${unitOf(s, ' ')}. ${t.sub}">
        <div class="top"><span class="fl">${FLAME(true)}</span><span class="k">${t.kick}</span></div>
        <div class="mid">${rollNum(s, 'n')}<span class="u">${unitOf(s, ' ')}</span></div>
        ${weeksStrip(s)}<p class="sub" aria-hidden="true">${t.sub}</p></section>`);
    } else cards.push(streakQuiet(s));
    if (s.partial) cards.push(`<div class="b-row"><span class="ic">${IC.check}</span><span class="od-fill"><b>${shortTxt(s).head}</b><span>${shortTxt(s).sub}</span></span></div>`);
    return `<div class="app sm sm-b od-screen"><div class="od-scroll" tabindex="-1">
      <header class="sm-top">${closeBtn()}<span class="d">${s.date}</span></header>
      <div class="b-title"><p class="b-kick"><span class="sm-rt"><i aria-hidden="true"></i><span>Workout done</span></span></p><h2 class="display od-clamp-2">${esc(s.name)}</h2></div>
      ${stats(s, 'b-board')}
      <div class="b-cards">${cards.join('')}</div>
      ${records(s)}
      <section class="sm-sec"><h3 class="sm-h">Exercises <span class="hint">Tap for last and next time</span></h3>
        ${exTable(s, st)}
        ${notStarted(s)}</section>
      ${cardio(s)}${keep(s, st)}${trained(s, 'b-tw')}${photo(st)}
    </div>${doneBar()}</div>`;
  }

  // ── Direction C · Story: one moment per page, swipe through, details on the last page ──
  function pagesC(s) {
    const pages = [];
    const m = moments(s);
    m.forEach((k) => {
      if (k === 'best' || k === 'kept' || k === 'start') {
        const t = STREAK_TXT(s);
        pages.push({ id: 'streak', label: t.kick, html: `<div class="c-mo c-streak"><p class="c-kick">${FLAME(true)}<span>${t.kick}</span></p>
          <div class="c-big">${rollNum(s, 'n')}</div><p class="c-unit display">${unitOf(s, ' ')}</p><p class="sr-only">${s.streak.n} ${unitOf(s, ' ')}.</p>
          ${weeksStrip(s)}<p class="c-sub">${t.sub}</p></div>` });
      } else if (k === 'records') {
        pages.push({ id: 'records', label: 'Records', html: `<div class="c-mo"><p class="c-kick">${IC.trophy}<span>${recHead(s)}</span></p>
          <ul class="c-recs">${s.prs.map((p) => `<li><span class="nm od-clamp-2">${esc(p.ex)}</span><span class="v num">${fmtN(p.val)}<small>kg</small></span><span class="was">was ${kg(p.was)}</span></li>`).join('')}
          ${s.e1.map((p) => `<li class="est"><span class="nm od-clamp-2">${esc(p.ex)}</span><span class="v num">${fmtN(p.val)}<small>kg</small></span><span class="was">best estimated 1-rep max</span></li>`).join('')}</ul></div>` });
      } else if (k === 'short') {
        const t = shortTxt(s);
        pages.push({ id: 'short', label: t.head, html: `<div class="c-mo"><p class="c-kick">${IC.check}<span>Workout saved</span></p><h2 class="c-head display">${t.head}</h2><p class="c-sub">${t.sub}</p></div>` });
      }
    });
    // the numbers page always exists; on a plain day it is the first page
    pages.push({ id: 'numbers', label: 'Numbers', html: `<div class="c-mo c-nums"><p class="c-kick">${m[0] === 'done' ? IC.check : ''}<span>${m[0] === 'done' ? 'Workout saved' : 'The numbers'}</span></p>
      ${m[0] === 'done' ? '<h2 class="c-head display">Nice work</h2>' : ''}
      <dl class="c-stack">${statsData(s).map((d) => `<div><dt>${d.l}</dt><dd><span class="num">${d.v}</span>${d.u ? `<small>${d.u}</small>` : ''}${d.sub ? `<em>${d.sub}</em>` : ''}</dd></div>`).join('')}</dl>
      ${isEvent(s) ? '' : streakQuiet(s)}</div>` });
    pages.push({ id: 'details', label: 'Exercises', html: `<div class="c-det">${exercises(s, 'Exercises')}${cardio(s)}${keep(s, S.st)}${trained(s)}${photo(S.st)}</div>` });
    return pages;
  }
  function dirStory(s, st) {
    const pages = pagesC(s);
    const i = Math.min(st.page, pages.length - 1);
    return `<div class="app sm sm-c od-screen">
      <header class="c-top">${closeBtn()}<div class="c-meta">${routineTag(s)}<span class="d">${s.date}</span></div>
        <div class="c-dots" role="tablist" aria-label="Summary pages">${pages.map((p, k) => `<button role="tab" data-act="page" data-p="${k}" aria-selected="${k === i}" aria-label="${p.label}, page ${k + 1} of ${pages.length}"><i></i></button>`).join('')}</div></header>
      <div class="c-pager" data-pager tabindex="0" aria-label="Swipe for more, or use the arrow keys">${pages.map((p, k) => `<section class="c-page${p.id === 'details' ? ' is-det' : ''}" role="tabpanel" aria-label="${p.label}" data-k="${k}" ${k === i ? '' : 'inert'}>${p.html}</section>`).join('')}</div>
      ${doneBar(i < pages.length - 1 ? `<button class="sm-btn text" data-act="next">${pages[i + 1].label}${IC.chev}</button>` : '')}</div>`;
  }

  // ── Direction D · Mix: A's big moment on top, B's compact list, plus real wins on a plain day ──
  // every "win" is worked out from the sample data; nothing is shown when there's no honest win
  const compared = (s) => s.ex.filter((e) => e.last);
  const upCount = (s) => compared(s).filter((e) => trendOf(e) > 0).length;
  // volume vs last time, only when every exercise was done last time too (otherwise the sums don't match)
  function volDelta(s) {
    if (s.partial || s.ex.some((e) => !e.last)) return 0;
    return s.vol - Math.round(s.ex.reduce((n, e) => n + e.last.w * reps(e.last), 0));
  }
  function heroD(s) {
    const m = moments(s)[0], c = compared(s).length, up = upCount(s);
    if ((m !== 'done' && m !== 'short') || !up) return heroA(s);
    const sub = m === 'short' ? shortTxt(s).sub : 'Nice work: more weight or more reps than last time.';
    return `<section class="a-hero m-${m} d-hero" aria-label="Summary">
      <div class="a-fl soft">${IC.check}</div>
      <p class="a-kick">${m === 'short' ? 'Short and done' : 'Workout saved'}</p>
      <div class="a-num"><span class="num n pop" aria-hidden="true">${up}</span><span class="u" aria-hidden="true">of ${c} lifts<br>up on last time</span></div>
      <p class="sr-only">${up} of ${c} lifts up on last time.</p>
      <p class="a-sub">${sub}</p></section>`;
  }
  function statsD(s) {
    const dv = volDelta(s);
    const d = [
      { v: s.dur, u: 'min', l: 'Duration' },
      { v: s.vol, u: 'kg', l: 'Volume', sub: dv > 0 ? `<span class="up">${IC.up}</span>+${fmtN(dv)} vs last` : '' },
      { v: s.work, u: '', l: 'Work sets', sub: s.warm ? `${s.warm} warm-ups` : '' }
    ];
    return `<dl class="sm-stats d-stats">${d.map((x) => `<div class="od-stat"><dt>${x.l}</dt><dd><span class="num v" data-count="${x.v}">${fmtN(x.v)}</span>${x.u ? `<span class="u">${x.u}</span>` : ''}</dd>${x.sub ? `<dd class="sub">${x.sub}</dd>` : ''}</div>`).join('')}</dl>`;
  }
  // streak as progress toward the best: white ticks for this run, outlined ticks up to the week that beats the best
  function streakGoal(s) {
    const { n, best } = s.streak, left = best + 1 - n;
    const line = left > 1 ? `${left} more weeks to beat your best of ${best}` : left === 1 ? `One more week beats your best of ${best}` : 'Your longest run ever';
    // ponytail: at most 12 ticks (up to 6 goal ticks, the rest the latest weeks of the run); a 52-week run can't fit a tick each
    const g = Math.min(Math.max(left, 0), 6), on = Math.min(n, 12 - g);
    const ticks = Array.from({ length: on + g }, (_, k) => `<i class="${k < on ? 'on' : 'goal'}" style="--k:${k}"></i>`).join('');
    return `<div class="d-goal">
      <div class="top"><span class="fl">${FLAME(true)}</span><span class="od-fill"><b class="num">${n}</b> weeks in a row</span><span class="cap">This week already counts</span></div>
      <div class="sm-weeks d-ticks" aria-hidden="true">${ticks}</div><p class="sub">${line}</p></div>`;
  }
  // one forward-looking line above Done: the next step-up the plan already worked out
  function nextUp(s) {
    const e = s.ex.find((x) => x.next && x.next.kind === 'up');
    if (!e) return '';
    return `<p class="d-next"><span class="ic">${IC.up}</span><span class="od-fill od-truncate">Next time: ${esc(e.n)}</span><span class="v">${setsLine(e.next.w, [e.next.r])}</span></p>`;
  }
  function dirMix(s, st) {
    return `<div class="app sm sm-d od-screen${st.intro ? ' intro' : ''}"><div class="od-scroll" tabindex="-1">
      <header class="sm-top">${closeBtn()}<div class="sm-meta">${routineTag(s)}<span class="d">${s.date}</span></div></header>
      ${heroD(s)}
      ${statsD(s)}
      ${isEvent(s) ? '' : streakGoal(s)}
      ${records(s, moments(s)[0] === 'records')}
      <section class="sm-sec" aria-label="Exercises"><h3 class="sm-h">Exercises <span class="hint">Tap for last and next time</span></h3>
        ${exTable(s, st)}${notStarted(s)}</section>
      ${cardio(s)}${keep(s, st)}${trained(s, 'b-tw')}${photo(st)}
    </div><div class="sm-bar d-bar">${nextUp(s)}<button class="sm-btn solid" data-act="done">Done</button></div></div>`;
  }

  // ── home stub: where Done and X land ──
  function home(st) {
    const tab = st.tab;
    return `<div class="app v2 od-screen tabs-combo tabs-capsule sm-home"><div class="od-scroll">
      <section class="tabpage"><h1 class="display">${tab}</h1>
        ${tab === 'Home' ? `<p>Your workout is saved. Today would show here, with ${esc(S.s.name)} marked done.</p>
        <button class="sm-btn outline" data-act="again">See the summary again</button>` : `<p>This tab is designed in its own part.</p>`}</section>
    </div>${OGv2.tabbarHTML(tab)}</div>`;
  }

  // ── mount ──
  const S = { s: null, st: null };
  function mount({ dir, state, content, host }) {
    dir = ['moment', 'score', 'story', 'mix'].includes(dir) ? dir : 'moment';
    host.classList.add('og', 'p-ios', 'sm-host');
    host.dataset.dir = dir;
    const toastEl = document.createElement('div');
    toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
    host.append(toastEl);
    let toastT;
    const toast = (msg) => { toastEl.textContent = msg; toastEl.classList.add('in'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('in'), 2400); };

    const load = (key) => {
      key = STATES[key] ? key : 'normal';
      S.s = model(key);
      S.st = { open: {}, page: 0, photos: 0, kept: false, home: false, tab: 'Home', intro: true };
      host.dataset.rc = S.s.rid;
      draw();
    };
    const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
    // stats count up from 0 (about 0.8 s, easing out); reduced motion shows the final number
    const countUp = () => {
      if (reduce()) return;
      const els = [...content.querySelectorAll('[data-count]')];
      els.forEach((el) => { el.textContent = '0'; });
      const t0 = performance.now() + 150, dur = 400;
      const step = (t) => {
        const k = Math.min(1, Math.max(0, (t - t0) / dur)), e = 1 - Math.pow(1 - k, 3);
        els.forEach((el) => { if (el.isConnected) el.textContent = fmtN(Math.round(+el.dataset.count * e)); });
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      const tb = content.querySelector('.sm-d .b-table'), sc = content.querySelector('.od-scroll');
      if (!tb) return;
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { tb.classList.add('seen'); io.disconnect(); } }, { root: sc, threshold: 0.3 });
      io.observe(tb);
    };
    const draw = (focusSel) => {
      const sc = content.querySelector('.od-scroll'), y = sc && !S.st.home ? sc.scrollTop : 0;
      const det = content.querySelector('.c-page.is-det'), dy = det ? det.scrollTop : 0;
      content.innerHTML = S.st.home ? home(S.st) : dir === 'score' ? dirScore(S.s, S.st) : dir === 'mix' ? dirMix(S.s, S.st) : dir === 'story' ? dirStory(S.s, S.st) : dirMoment(S.s, S.st);
      // D plays its arrival once per load; later redraws (opening a row) stay still
      if (dir === 'mix' && !S.st.home && S.st.intro) { S.st.intro = false; countUp(); }
      const sc2 = content.querySelector('.od-scroll'); if (sc2 && focusSel !== 'top') sc2.scrollTop = y;
      if (dir === 'story' && !S.st.home) { wirePager(); const d2 = content.querySelector('.c-page.is-det'); if (d2) d2.scrollTop = dy; }
      if (focusSel && focusSel !== 'top') content.querySelector(focusSel)?.focus({ preventScroll: true });
    };
    // story pager: scroll-snap; the dots follow the swipe without redrawing (that would restart the swipe)
    const wirePager = () => {
      const pg = content.querySelector('[data-pager]');
      const w = () => pg.clientWidth || 1;
      pg.scrollLeft = S.st.page * w();
      // the page more than half on screen is the current one (dots, Next label, inert on the others)
      const io = new IntersectionObserver((list) => {
        list.forEach((en) => { const k = +en.target.dataset.k; if (en.isIntersecting && k !== S.st.page) { S.st.page = k; syncPager(); } });
      }, { root: pg, threshold: 0.5 });
      [...pg.children].forEach((c) => io.observe(c));
      pg.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); goPage(S.st.page + (e.key === 'ArrowRight' ? 1 : -1)); }
      });
    };
    const goPage = (k) => {
      const pg = content.querySelector('[data-pager]'); if (!pg) return;
      const n = pg.children.length; k = Math.max(0, Math.min(n - 1, k));
      S.st.page = k;
      pg.scrollTo({ left: k * pg.clientWidth, behavior: reduce() ? 'auto' : 'smooth' });
      syncPager();
    };
    const syncPager = () => {
      const pages = [...content.querySelectorAll('.c-page')], k = S.st.page;
      pages.forEach((p, i) => { p.inert = i !== k; });
      content.querySelectorAll('.c-dots button').forEach((b, i) => b.setAttribute('aria-selected', String(i === k)));
      const bar = content.querySelector('.sm-bar'), nx = bar.querySelector('[data-act="next"]');
      const labels = pages.map((p) => p.getAttribute('aria-label'));
      if (k < pages.length - 1) {
        const html = `${labels[k + 1]}${IC.chev}`;
        if (nx) nx.innerHTML = html; else bar.insertAdjacentHTML('afterbegin', `<button class="sm-btn text" data-act="next">${html}</button>`);
      } else nx?.remove();
    };

    // photo sheet (the real app adds photos and clips right on the summary)
    function openPhoto(opener) {
      const scrim = document.createElement('div'); scrim.className = 'scrim';
      const el = document.createElement('div');
      el.className = 'sheet sm-sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'sm-sheet-t');
      el.innerHTML = `<div class="grab" aria-hidden="true"></div>
        <div class="sm-sh-top"><h4 id="sm-sheet-t" class="display">Add to this workout</h4><button class="iconbtn" data-x="close" aria-label="Close">${IC.x}</button></div>
        <p class="sm-sh-p">A progress photo or a clip of a set. It's saved with this workout.</p>
        <div class="sm-sh-list"><button data-x="take">${IC.camera}<span>Take a photo</span></button><button data-x="pick">${IC.photos}<span>Choose from library</span></button></div>`;
      host.append(scrim, el);
      requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('in'); el.classList.add('in'); el.querySelector('[data-x="take"]').focus({ preventScroll: true }); }));
      const close = (after) => {
        scrim.classList.remove('in'); el.classList.remove('in');
        document.removeEventListener('keydown', onKey, true);
        setTimeout(() => { scrim.remove(); el.remove(); }, 200);
        if (after) after(); else opener?.focus({ preventScroll: true });
      };
      const onKey = (e) => {
        if (e.key === 'Escape') { e.stopPropagation(); close(); }
        if (e.key === 'Tab') { const f = [...el.querySelectorAll('button')]; const a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
      };
      document.addEventListener('keydown', onKey, true);
      scrim.addEventListener('click', () => close());
      el.addEventListener('click', (e) => {
        const x = e.target.closest('[data-x]')?.dataset.x; if (!x) return;
        if (x === 'close') close();
        else close(() => { S.st.photos += 1; draw('[data-act="photo"]'); });
      });
    }

    content.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.dataset.act;
      if (act === 'done' || act === 'close') { S.st.home = true; S.st.tab = 'Home'; draw('top'); content.querySelector('.tb-i[aria-current]')?.focus({ preventScroll: true }); }
      else if (act === 'again') load(S.s.key);
      else if (act === 'tab') { S.st.tab = b.dataset.tab; draw(`.tb-i[data-tab="${S.st.tab}"]`); }
      else if (act === 'start') toast('GO starts the next workout. That screen is its own part.');
      else if (act === 'keep') { S.st.kept = true; draw('.sm-keep .done'); }
      else if (act === 'photo') openPhoto(b);
      else if (act === 'row') { const i = b.dataset.i; S.st.open[i] = !S.st.open[i]; draw(`[data-act="row"][data-i="${i}"]`); }
      else if (act === 'page') goPage(+b.dataset.p);
      else if (act === 'next') goPage(S.st.page + 1);
    });
    window.addEventListener('message', (e) => { if (e.data && e.data.ogState) load(e.data.ogState); });
    load(state);
  }
  return { mount, STATES };
})();
