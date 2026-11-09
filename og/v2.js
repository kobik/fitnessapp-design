// openGym Today v2 (iPhone exploration).
// OGv2.mount({ dir: 'full' | 'poster', day: 'push' | 'legs', content, host })
// Board messages: { ogState: 'normal'|'active'|'done'|'rest'|'first' }, { ogIcons: 'A'|'B' }, { ogTab: 'Home'|'Plan'|… }.
// Part 3: mount({ week: 'score' | 'tiles' | 'sets' }) (round 2; round 1 'rail' | 'rings' | 'big' kept) swaps the week section; board message { ogSel: dayIndex } picks a day.
// Part 2: mount({ tabs: 'capsule' | 'disc' | 'text' | 'combo' }) swaps in a round-2 tab bar; OGv2.strip() draws one bar alone for the board.
window.OGv2 = (() => {
  // ── icon sets: A = bold outline (filled when selected), B = solid geometric ──
  const SA = (body) => `<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const SB = (body) => `<svg class="od-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${body}</svg>`;
  const ICONS = {
    A: {
      today: (on) => SA(`<path d="M3 19h18"/>${on ? '<path d="M7 19a5 5 0 0 1 10 0Z" fill="currentColor"/>' : '<path d="M7 19a5 5 0 0 1 10 0"/>'}<path d="M12 6v3M5.6 9.6l2 2M18.4 9.6l-2 2"/>`),
      plan: (on) => SA(`<rect x="3.5" y="5" width="17" height="15" rx="3" ${on ? 'fill="currentColor"' : ''}/><path d="M8 3v4M16 3v4"/>${[[8, 12], [12, 12], [16, 12], [8, 16]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="${on ? 'var(--bg)' : 'currentColor'}" stroke="none"/>`).join('')}`),
      start: () => SA('<path d="M8.5 6.5v11l9-5.5z" fill="currentColor"/>'),
      stats: (on) => SA(`${on ? '<path d="M3 19l6-7 4 3 7-8v12H3Z" fill="currentColor" opacity=".35" stroke="none"/>' : ''}<path d="M3 19l6-7 4 3 7-8"/><circle cx="20" cy="7" r="2" fill="currentColor"/>`),
      dumbbell: (on) => SA(`<path d="M2 12h20"/><rect x="4" y="6.5" width="3.2" height="11" rx="1" ${on ? 'fill="currentColor"' : ''}/><rect x="16.8" y="6.5" width="3.2" height="11" rx="1" ${on ? 'fill="currentColor"' : ''}/><path d="M9 9.5v5M15 9.5v5"/>`)
    },
    B: {
      today: () => SB('<circle cx="12" cy="10" r="4.5"/><rect x="3" y="17" width="18" height="3" rx="1.5"/>'),
      plan: () => SB('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2" opacity=".45"/>'),
      start: () => SB('<path d="M8 5.5v13l10.5-6.5z"/>'),
      stats: () => SB('<rect x="4" y="13" width="4" height="7" rx="1.5"/><rect x="10" y="9" width="4" height="11" rx="1.5"/><rect x="16" y="4" width="4" height="16" rx="1.5"/>'),
      dumbbell: () => SB('<rect x="2" y="10.75" width="20" height="2.5" rx="1.25"/><rect x="4.5" y="6" width="3.5" height="12" rx="1.25"/><rect x="16" y="6" width="3.5" height="12" rx="1.25"/>')
    }
  };
  // ── round 2 icon family: 2px stroke, round joins, 2.5 corner radius; selected = the main shape fills ──
  const SC = (body) => `<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  const F = (on) => on ? 'fill="currentColor"' : '';
  const CUT = 'stroke="var(--cut, #000)"';
  const IC = {
    today: (on) => SC(`<path d="M4 10.4 11.1 4.6a1.4 1.4 0 0 1 1.8 0L20 10.4V19a2 2 0 0 1-2 2h-3.5v-5.5h-5V21H6a2 2 0 0 1-2-2Z" ${F(on)}/>`),
    plan: (on) => SC(`<rect x="3.5" y="5" width="17" height="15.5" rx="3" ${F(on)}/><path d="M8 3v4M16 3v4"/><path d="M3.5 10h17" ${on ? CUT : ''}/><rect x="13" y="13.5" width="3.5" height="3.5" rx="1" fill="${on ? 'var(--cut, #000)' : 'currentColor'}" stroke="none"/>`),
    // line graph on two axes, rising to a peak dot; selected = the area under the line fills
    stats: (on) => SC(`<path d="M4 4v14.5a1.5 1.5 0 0 0 1.5 1.5H20"/>${on ? '<path d="M7.5 16.5l3.5-4.5 3 2.5 5-6.5V17H7.5Z" fill="currentColor" stroke="none" opacity=".45"/>' : ''}<path d="M7.5 16.5l3.5-4.5 3 2.5 5-6.5"/><circle cx="19" cy="8" r="1.6" fill="currentColor" stroke="none"/>`),
    dumbbell: (on) => SC(`<path d="M8 12h8M2 12h1.5M20.5 12H22"/><rect x="3.5" y="7" width="4.5" height="10" rx="1.5" ${F(on)}/><rect x="16" y="7" width="4.5" height="10" rx="1.5" ${F(on)}/>`),
    start: () => SC('<path d="M8.5 6.3v11.4a1 1 0 0 0 1.5.86l9.2-5.7a1 1 0 0 0 0-1.72L10 5.44a1 1 0 0 0-1.5.86Z" fill="currentColor"/>')
  };
  const UI = {
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    play: '<path d="M7 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L8.5 4.6A1 1 0 0 0 7 5.5Z"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    down: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    flat: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/>'
  };
  const ui = (n) => `<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${UI[n]}</svg>`;

  // ── data ──
  const ROUTINES = {
    push: { name: 'Push A', min: 55, sets: 20, muscles: ['Chest', 'Shoulders', 'Triceps'], ex: ['Bench press', 'Incline dumbbell press', 'Overhead press', 'Lateral raise', 'Triceps pushdown', 'Dips'] },
    pull: { name: 'Pull A', min: 50, sets: 20, muscles: ['Back', 'Biceps', 'Rear delts'], ex: ['Deadlift', 'Pull-up', 'Barbell row', 'Face pull', 'Hammer curl', 'Barbell curl'] },
    legs: { name: 'Legs', min: 60, sets: 19, muscles: ['Quads', 'Hamstrings', 'Glutes', 'Calves'], ex: ['Back squat', 'Romanian deadlift', 'Leg press', 'Leg curl', 'Calf raise'] }
  };
  // which body-map regions each muscle lights
  const REGIONS = {
    Chest: ['chest'], Shoulders: ['delts', 'rdelts'], Triceps: ['triceps'], Back: ['lats', 'traps', 'lowback'],
    Biceps: ['biceps'], 'Rear delts': ['rdelts'], Quads: ['quads'], Hamstrings: ['hams'], Glutes: ['glutes'], Calves: ['calves', 'calvesF']
  };
  const DAYS = [['Mon', 26, 'Monday 26 October'], ['Tue', 27, 'Tuesday 27 October'], ['Wed', 28, 'Wednesday 28 October'], ['Thu', 29, 'Thursday 29 October'], ['Fri', 30, 'Friday 30 October'], ['Sat', 31, 'Saturday 31 October'], ['Sun', 1, 'Sunday 1 November']];
  const PLANS = { push: ['legs', null, 'push', null, 'pull', 'legs', null], legs: ['pull', null, 'legs', null, 'push', 'pull', null] };
  const TODAY = 2;
  const PHOTOS = { push: 'assets/hero/push.jpg' }; // add pull / legs / rest as they arrive
  let PHOTO_MODE = 'none'; // 'none' | 'full' | 'framed'
  const W = [82.4,82.6,82.3,82.1,82.2,82.0,81.9,82.1,81.8,81.7,81.9,81.6,81.5,81.6,81.4,81.3,81.5,81.2,81.1,81.3,81.0,81.1,80.9,81.0,80.8,80.9,80.7,80.9,80.8,80.9];
  const GOAL = 78.0;
  const fmt = (n) => n.toFixed(1);
  const clock = (ms) => { const t = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

  function stateFor(mode, day) {
    const week = DAYS.map(([dw, dn, full], i) => {
      const r = PLANS[day][i];
      return { dw, dn, full, r, st: !r ? 'rest' : i < TODAY ? 'done' : 'plan' };
    });
    const s = { mode, sel: TODAY, week, active: false, startAt: 0, weights: W.slice(), weekNo: 7 };
    applyWt(s);
    if (mode === 'active') { s.active = true; s.startAt = Date.now() - (12 * 60 + 40) * 1000; }
    if (mode === 'done') week[TODAY].st = 'done';
    if (mode === 'rest') { week[TODAY].r = null; week[TODAY].st = 'rest'; }
    if (mode === 'first') { week.forEach((d) => { d.r = null; d.st = 'none'; }); s.weights = []; s.weekNo = 0; }
    return s;
  }

  // ── body map: front + back, simple geometric regions ──
  function bodyMap(lit) {
    const on = (id) => lit.has(id) ? 'lit' : 'base';
    const fig = (x, back) => `<g transform="translate(${x} 0)">
      <circle class="head" cx="50" cy="16" r="11"/>
      <rect class="base" x="45" y="27" width="10" height="7" rx="3"/>
      ${back ? `<rect class="${on('traps')}" x="36" y="32" width="28" height="12" rx="5"/>` : ''}
      <ellipse class="${on(back ? 'rdelts' : 'delts')}" cx="27" cy="44" rx="9.5" ry="8.5"/>
      <ellipse class="${on(back ? 'rdelts' : 'delts')}" cx="73" cy="44" rx="9.5" ry="8.5"/>
      ${back
        ? `<rect class="${on('lats')}" x="32" y="46" width="36" height="30" rx="9"/><rect class="${on('lowback')}" x="39" y="78" width="22" height="16" rx="5"/>`
        : `<rect class="${on('chest')}" x="32" y="36" width="17.5" height="20" rx="6"/><rect class="${on('chest')}" x="50.5" y="36" width="17.5" height="20" rx="6"/>
           <rect class="${on('abs')}" x="40" y="58" width="20" height="36" rx="6"/><rect class="base" x="32" y="58" width="7" height="32" rx="3"/><rect class="base" x="61" y="58" width="7" height="32" rx="3"/>`}
      <ellipse class="${on(back ? 'triceps' : 'biceps')}" cx="21" cy="65" rx="6" ry="12"/>
      <ellipse class="${on(back ? 'triceps' : 'biceps')}" cx="79" cy="65" rx="6" ry="12"/>
      <ellipse class="base" cx="17" cy="91" rx="5" ry="12"/><ellipse class="base" cx="83" cy="91" rx="5" ry="12"/>
      <rect class="${back ? on('glutes') : 'base'}" x="33" y="96" width="34" height="${back ? 18 : 13}" rx="7"/>
      <rect class="${on(back ? 'hams' : 'quads')}" x="33" y="${back ? 116 : 111}" width="15.5" height="${back ? 42 : 47}" rx="7"/>
      <rect class="${on(back ? 'hams' : 'quads')}" x="51.5" y="${back ? 116 : 111}" width="15.5" height="${back ? 42 : 47}" rx="7"/>
      <rect class="${on(back ? 'calves' : 'calvesF')}" x="35" y="162" width="11" height="38" rx="5"/>
      <rect class="${on(back ? 'calves' : 'calvesF')}" x="54" y="162" width="11" height="38" rx="5"/>
      <text class="cap" x="50" y="218">${back ? 'BACK' : 'FRONT'}</text>
    </g>`;
    return `<svg class="bm" viewBox="0 0 215 224" aria-hidden="true">${fig(0, false)}${fig(115, true)}</svg>`;
  }

  // ── sections ──
  function poster(s) {
    const d = s.week[s.sel], isToday = s.sel === TODAY;
    const top = `<div class="top"><span class="date">Wed 28 October</span><button class="iconbtn" data-act="settings" aria-label="Settings">${ui('gear')}</button></div>`;
    const kick = (txt) => `<div class="kicker"><span class="label">${txt}</span>${isToday ? '' : '<button class="mini-link" data-act="back-today">Back to today</button>'}</div>`;
    const when = isToday ? 'Today' : d.full;

    if (s.mode === 'first' && isToday) return `<section class="poster muted" aria-label="Get started">${top}
        <div class="fig">${bodyMap(new Set())}</div><div class="grow"></div>
        ${kick('Welcome, Kobi')}<h2 class="display" style="--poster-size:76px">Set up your week</h2>
        <div class="meta">Pick a ready-made plan to start today, or build your own.</div>
        <div class="actions"><button class="cta" data-act="starter">${ui('clipboard')}Load a starter plan</button><button class="cta ghost" data-act="build">Build my own plan</button></div></section>`;

    if (!d.r) {
      const next = s.week.slice(s.sel + 1).find((x) => x.r);
      return `<section class="poster muted" aria-label="${when}">${top}
        <div class="fig">${bodyMap(new Set())}</div><div class="grow"></div>
        ${kick(when)}<h2 class="display">Rest day</h2>
        <div class="meta">${next ? `Recover. Next up: ${ROUTINES[next.r].name} on ${next.dw}.` : 'Nothing planned.'}</div>
        ${isToday ? '<div class="actions"><button class="cta ghost" data-act="other">Train anyway</button></div>' : ''}</section>`;
    }

    const r = ROUTINES[d.r];
    const lit = new Set(r.muscles.flatMap((m) => REGIONS[m] || []));
    let actions;
    if (d.st === 'done') actions = `<div class="od-row" style="justify-content:space-between"><span class="tag">Done · ${isToday ? 54 : 58} min</span>${isToday ? '<button class="mini-link" data-act="other">Do another workout</button>' : ''}</div>`;
    else if (isToday && s.active) actions = `<button class="cta ghost resume-ghost" data-act="resume">${ui('play')}Resume · 2 of ${r.ex.length} done</button>`;
    else if (isToday) actions = `<button class="cta" data-act="start">${ui('play')}Start workout</button><button class="checkin-hint" data-act="checkin">${ui('qr')}At the gym?&nbsp;<b>Check in</b></button>`;
    else actions = `<button class="cta ghost" data-act="early">Start this one now</button>`;
    const photo = PHOTO_MODE !== 'none' && PHOTOS[d.r];
    const visual = !photo ? `<div class="fig">${bodyMap(lit)}</div><div class="grow"></div>`
      : PHOTO_MODE === 'full' ? `<img class="hero-bg" src="${photo}" alt="" width="896" height="1200" aria-hidden="true"><div class="grow photo-grow"></div>`
      : `<figure class="hero-frame"><img class="od-media od-media-cover" style="--od-ratio:4/5" src="${photo}" alt="" width="896" height="1200" aria-hidden="true"></figure>`;
    const cls = photo ? ` photo photo-${PHOTO_MODE}${d.st === 'done' ? ' is-done' : ''}` : '';
    return `<section class="poster${cls}" aria-label="${when}: ${r.name}">${top}
      ${visual}
      ${kick(when)}
      <h2 class="display">${r.name}</h2>
      <div class="muscles">${r.muscles.join(' · ')}</div>
      <div class="meta"><span class="od-nowrap">${r.ex.length} exercises</span> · <span class="od-nowrap">about ${r.min} min</span> · <span class="od-nowrap">${r.sets} sets</span></div>
      <div class="actions">${actions}</div></section>`;
  }

  const dayLabel = (d) => `${d.full}, ${d.r ? ROUTINES[d.r].name + (d.st === 'done' ? ', done' : ', planned') : 'nothing planned'}`;
  const doneCount = (s) => s.week.filter((d) => d.st === 'done' && d.r).length;
  const plannedCount = (s) => s.week.filter((d) => d.r).length;

  function weekBars(s) {
    const head = s.mode === 'first'
      ? '<span class="label">This week</span><span class="ticks"><span class="t">No workouts yet</span></span>'
      : `<span class="label">This week · ${doneCount(s)} of ${plannedCount(s)}</span>
         <span class="ticks" aria-label="${s.weekNo} week streak"><span class="n num">${s.weekNo}</span><span class="t">week streak</span>${'<i></i>'.repeat(6)}<i class="cur"></i></span>`;
    const bars = s.week.map((d, i) => {
      const c = d.r ? `var(--${d.r})` : 'var(--text-3)';
      let track;
      if (!d.r) track = `<span class="track rest"></span>`;
      else if (d.st === 'done') track = `<span class="track"><span class="fill" style="height:100%"></span></span>`;
      else if (i === TODAY && s.active) track = `<span class="track planned"><span class="fill" style="height:30%"></span></span>`;
      else track = `<span class="track planned"></span>`;
      return `<button class="bar${i === TODAY ? ' today' : ''}" style="--c:${c}" data-act="day" data-i="${i}" aria-pressed="${i === s.sel}" aria-label="${dayLabel(d)}">
        <span class="dw">${d.dw}</span>${track}<span class="dn">${d.dn}</span></button>`;
    }).join('');
    const used = [...new Set(s.week.filter((d) => d.r).map((d) => d.r))];
    return `<section class="card" aria-label="This week">
      <div class="wk-head">${head}</div>
      <div class="bars" role="group" aria-label="Pick a day">${bars}</div>
      ${used.length ? `<div class="legend">${used.map((k) => `<span style="--c:var(--${k})"><i></i>${ROUTINES[k].name}</span>`).join('')}<span><i style="background:none;box-shadow:inset 0 0 0 1.5px var(--text-2)"></i>Planned</span></div>` : ''}
    </section>`;
  }

  function weekDots(s) {
    const streak = s.mode === 'first' ? 'No workouts yet' : `<b>Week ${s.weekNo}</b> streak · <b>${doneCount(s)}</b> of ${plannedCount(s)} done`;
    return `<section class="card" aria-label="This week">
      <div class="week-head"><span class="label">This week</span><span class="streak-line">${streak}</span></div>
      <div class="week" role="group" aria-label="Pick a day">
        ${s.week.map((d, i) => `<button class="day${i === TODAY ? ' today' : ''}" data-act="day" data-i="${i}" aria-pressed="${i === s.sel}" aria-label="${dayLabel(d)}">
          <span class="dw">${d.dw}</span><span class="dn num">${d.dn}</span><span class="dot ${d.r ? d.st : 'rest'}"></span></button>`).join('')}
      </div></section>`;
  }

  // ── Part 3: week directions (mount({ week: 'rail' | 'rings' | 'big' })) ──
  let WEEK = null;
  const CHK = '<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const short = (r) => r.toUpperCase();
  const isLive = (s, i) => i === TODAY && s.active && s.week[i].st !== 'done';
  const livePct = (s) => (100 - arcOff(s)) / 100;
  const firstRun = (s) => s.mode === 'first';
  const emptyLine = `<p class="wk-empty">No plan yet. Pick a starter split and your week fills in here. <button class="mini-link" data-act="build">Set up your plan</button></p>`;
  const wkTitle = (s) => `<span class="wk-kick label">This week</span>`;

  // A · rail of day cards on black
  function weekRail(s) {
    const head = firstRun(s)
      ? `<div class="wk-top">${wkTitle(s)}</div>`
      : `<div class="wk-top">${wkTitle(s)}<span class="wk-sum"><b class="num">${doneCount(s)}</b> of ${plannedCount(s)} done · <b class="num">${s.weekNo}</b> week streak</span></div>`;
    const cards = s.week.map((d, i) => {
      const live = isLive(s, i), today = i === TODAY;
      const cls = ['rc', today ? 'is-today' : '', !d.r ? 'rest' : d.st === 'done' ? 'done' : live ? 'live' : 'plan', firstRun(s) ? 'none' : ''].filter(Boolean).join(' ');
      let foot;
      if (firstRun(s)) foot = `<span class="nm">—</span>`;
      else if (!d.r) foot = `<span class="nm">Rest</span>`;
      else if (d.st === 'done') foot = `<span class="nm">${short(d.r)}</span><span class="st">${CHK}Done</span>`;
      else if (live) foot = `<span class="nm">${short(d.r)}</span><span class="st num" data-timer>${clock(Date.now() - s.startAt)}</span>`;
      else foot = `<span class="nm">${short(d.r)}</span>`;
      return `<button class="${cls}" style="--c:${d.r ? `var(--${d.r})` : 'var(--text-3)'}${live ? `;--p:${livePct(s)}` : ''}" data-act="day" data-i="${i}" aria-pressed="${i === s.sel}" aria-label="${dayLabel(d)}${live ? ', in progress' : ''}">
        ${live ? '<span class="lv" data-pct aria-hidden="true"></span>' : ''}
        <span class="dw">${today ? 'Today' : d.dw}</span><span class="dn num">${d.dn}</span>${foot}</button>`;
    }).join('');
    return `<section class="wk wk-rail" aria-label="This week">${head}
      <div class="rail od-rail" role="group" aria-label="Pick a day">${cards}</div>${firstRun(s) ? emptyLine : ''}</section>`;
  }

  // B · streak stat + one ring per day
  function weekRings(s) {
    const head = firstRun(s)
      ? `<div class="wk-top">${wkTitle(s)}</div>`
      : `<div class="wk-stats">
          <div class="od-stat"><span class="big num">${s.weekNo}</span><span class="cap">week streak</span></div>
          <div class="od-stat r"><span class="big num od-nowrap">${doneCount(s)}<small>/${plannedCount(s)}</small></span><span class="cap">done this week</span></div></div>`;
    const rings = s.week.map((d, i) => {
      const live = isLive(s, i), done = d.r && d.st === 'done';
      let ring;
      if (firstRun(s)) ring = `<circle cx="22" cy="22" r="19" class="dash"/>`;
      else if (!d.r) ring = `<circle cx="22" cy="22" r="3" class="restdot"/>`;
      else if (done) ring = `<circle cx="22" cy="22" r="20" class="solid"/>`;
      else if (live) ring = `<circle cx="22" cy="22" r="19" class="trk"/><circle cx="22" cy="22" r="19" class="arc" data-arc pathLength="100" stroke-dasharray="100" stroke-dashoffset="${arcOff(s)}" transform="rotate(-90 22 22)"/>`;
      else ring = `<circle cx="22" cy="22" r="19" class="out"/>`;
      const mid = done ? `<span class="mid ck">${CHK}</span>` : d.r || firstRun(s) ? `<span class="mid num">${d.dn}</span>` : '';
      return `<button class="ring-d${i === TODAY ? ' is-today' : ''}${live ? ' live' : ''}" style="--c:${d.r ? `var(--${d.r})` : 'var(--text-3)'}" data-act="day" data-i="${i}" aria-pressed="${i === s.sel}" aria-label="${dayLabel(d)}${live ? ', in progress' : ''}">
        <span class="dw">${d.dw.slice(0, 1)}</span><span class="rg"><svg viewBox="0 0 44 44" aria-hidden="true">${ring}</svg>${mid}</span></button>`;
    }).join('');
    const used = [...new Set(s.week.filter((d) => d.r).map((d) => d.r))];
    return `<section class="wk wk-rings" aria-label="This week">${head}
      <div class="rings" role="group" aria-label="Pick a day">${rings}</div>
      ${firstRun(s) ? emptyLine : `<div class="legend">${used.map((k) => `<span style="--c:var(--${k})"><i></i>${short(k)}</span>`).join('')}<span><i class="ck">${CHK}</i>Done</span></div>`}</section>`;
  }

  // C · big poster bars, no card
  function weekBig(s) {
    const head = firstRun(s)
      ? `<div class="wk-top">${wkTitle(s)}</div>`
      : `<div class="wk-head2"><div class="od-stat"><span class="wk-kick label">This week</span><span class="hl display od-nowrap">${doneCount(s)} of ${plannedCount(s)}</span></div>
          <div class="od-stat r"><span class="sn num">${s.weekNo}</span><span class="cap">week streak</span></div></div>`;
    const cols = s.week.map((d, i) => {
      const live = isLive(s, i), done = d.r && d.st === 'done';
      let bar;
      if (firstRun(s)) bar = `<span class="bb none"></span>`;
      else if (!d.r) bar = `<span class="bb rest"></span>`;
      else if (done) bar = `<span class="bb done"><span class="ck">${CHK}</span></span>`;
      else if (live) bar = `<span class="bb live" style="--p:${livePct(s)}"><span class="lv" data-pct></span></span>`;
      else bar = `<span class="bb plan"></span>`;
      return `<button class="bcol${i === TODAY ? ' is-today' : ''}" style="--c:${d.r ? `var(--${d.r})` : 'var(--text-3)'}" data-act="day" data-i="${i}" aria-pressed="${i === s.sel}" aria-label="${dayLabel(d)}${live ? ', in progress' : ''}">
        <span class="nm">${d.r && !firstRun(s) ? short(d.r).slice(0, 4) : ''}</span>${bar}<span class="dw">${d.dw}</span><span class="dn num">${d.dn}</span></button>`;
    }).join('');
    return `<section class="wk wk-big" aria-label="This week">${head}
      <div class="bigbars" role="group" aria-label="Pick a day">${cols}</div>${firstRun(s) ? emptyLine : ''}</section>`;
  }

  // ── Part 3 · round 2: week at hero scale (mount({ week: 'score' | 'tiles' | 'sets' })) ──
  const workouts = (s) => s.week.map((d, i) => ({ ...d, i })).filter((d) => d.r);
  const cvar = (d) => `var(--${d.r})`;
  const liveOn = (s, d) => d.i === TODAY && s.active && d.st !== 'done';
  function nextLine(s) {
    const t = s.week[TODAY];
    if (s.active && t.r && t.st !== 'done') return `<b>In progress</b> · ${ROUTINES[t.r].name} · <span class="num" data-timer>${clock(Date.now() - s.startAt)}</span>`;
    const nx = workouts(s).find((d) => d.i >= TODAY && d.st !== 'done');
    const pre = !t.r ? '<b>Rest day</b> · next ' : t.st === 'done' ? '<b>Done today</b> · next ' : '<b>Next</b> · ';
    if (!nx) return '<b>Week complete</b> · every workout done';
    return `${pre}${ROUTINES[nx.r].name} · ${nx.i === TODAY ? 'today' : nx.full.split(' ')[0]}`;
  }
  const setsDone = (s) => workouts(s).reduce((n, d) => n + (d.st === 'done' ? ROUTINES[d.r].sets : liveOn(s, d) ? Math.floor(ROUTINES[d.r].sets * livePct(s)) : 0), 0);
  const setsAll = (s) => workouts(s).reduce((n, d) => n + ROUTINES[d.r].sets, 0);

  // ── streak. openGym's rule: weeks in a row with at least one workout; this week counts once it
  // has one, and an empty current week doesn't break it until it ends. The app also keeps the best run.
  // Three looks (mount({ streak: 'card' | 'poster' | 'chain' })) × seven situations (board message { ogStreak }).
  let STREAK_STYLE = 'card', STREAK_CASE = null;
  const FLAME = (on) => `<svg class="od-icon" viewBox="0 0 24 24" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 21.5c-4 0-7-2.8-7-6.6 0-3.2 2.1-5.3 3.6-7 .4 1.7 1.3 2.9 2.4 3.4C11.2 7.4 12.6 4.6 15.4 2.5c.2 3.3 3.6 5.9 3.6 11 0 4.4-3 8-7 8Z"/></svg>`;
  const STREAK_CASES = {
    counted: { n: 7, counted: true, best: 9, label: 'This week counts' },
    risk: { n: 6, counted: false, best: 9, label: 'Not yet this week' },
    lastday: { n: 6, counted: false, best: 9, label: 'Last day of the week' },
    kept: { n: 7, counted: true, best: 9, kept: true, label: 'Streak kept (just now)' },
    near: { n: 8, counted: true, best: 9, label: 'One week from best' },
    best: { n: 10, counted: true, best: 10, label: 'New best' },
    restart: { n: 1, counted: true, best: 9, label: 'Starting over' },
    first: { n: 0, counted: false, best: 0, label: 'First run' }
  };
  // copy: coach = warm full sentence, hype = short caps headline + line, stats = just the facts
  const STREAK_COPY = {
    counted: { coach: 'This week counts. <b>3 more weeks</b> to beat your best of 9.', hype: ['Keep it rolling', 'Week 7 is locked in.'], stats: '7 weeks · best 9 · <b>3 to beat</b>' },
    risk: { coach: 'One workout this week makes it <b>7</b>. Any day works.', hype: ["Don't break the chain", 'Train once this week to make it 7.'], stats: '6 weeks · <b>this week still open</b>' },
    kept: { coach: '<b>7 weeks in a row.</b> This week counts, nice work.', hype: ['Streak kept', '7 weeks in a row.'], stats: '7 weeks · <b>this week counts</b>' },
    lastday: { coach: 'Last day of the week. <b>One workout today</b> keeps your 6 weeks going.', hype: ['Last call', 'Train today and the streak lives on.'], stats: '6 weeks · <b>this week ends tonight</b>' },
    near: { coach: 'One more week and you <b>tie your best</b>. Two and you beat it.', hype: ['One more week', 'Then you tie your best of 9.'], stats: '8 weeks · <b>1 to tie your best</b>' },
    best: { coach: '10 weeks. <b>Your longest run ever.</b> Every week now is a new record.', hype: ['New record', "10 weeks. Longest you've ever gone."], stats: '10 weeks · <b>new best</b>' },
    restart: { coach: 'Week 1 of a new run. Your best is 9, <b>go get it</b>.', hype: ['Back at it', 'Week 1 of the next run.'], stats: '1 week · best 9' },
    first: { coach: 'Your first workout <b>starts your streak</b>.', hype: ['Start your streak', 'One workout this week is week 1.'], stats: '0 weeks · <b>start this week</b>' }
  };
  function streakData(s) {
    if (STREAK_CASE) return { key: STREAK_CASE, ...STREAK_CASES[STREAK_CASE] };
    if (firstRun(s)) return { key: 'first', ...STREAK_CASES.first };
    const counted = doneCount(s) > 0, n = counted ? s.weekNo : s.weekNo - 1;
    return { key: counted ? 'counted' : 'risk', n, counted, best: 9 };
  }
  const plain = (h) => h.replace(/<[^>]+>/g, '');
  function streakBlock(s) {
    const d = streakData(s), c = STREAK_COPY[d.key];
    // streak kept: plays once, the first time Today is seen after the week's first workout
    const num = d.kept ? `<span class="sn num roll" aria-hidden="true"><span class="was">${d.n - 1}</span><span class="now">${d.n}</span></span>`
      : `<span class="sn num${d.n ? '' : ' ghost'}">${d.n}</span>`;
    const lit = d.counted ? ` lit${d.kept ? ' kept' : ''}` : '';
    if (STREAK_STYLE === 'poster') return `<section class="streak st-poster${lit}" aria-label="${d.n} week streak. ${plain(c.hype[1])}">
      <div class="pn">${num}<span class="pw"><span class="fl">${FLAME(d.counted)}</span><span class="sl">weeks<br>in a row</span></span></div>
      <div class="pc"><span class="hl display">${c.hype[0]}</span><span class="sub">${c.hype[1]}</span></div></section>`;
    if (STREAK_STYLE === 'chain') {
      // links up to one past the best, so the next record is always in sight
      const len = Math.min(11, Math.max(d.best + 1, d.n + 1, 6));
      const start = Math.max(0, d.n + 1 - len);
      const links = Array.from({ length: len }, (_, k) => {
        const w = start + k + 1; // week number in the run
        const now = d.counted ? d.n : d.n + 1;
        const cls = w <= d.n ? 'on' : w === now ? 'open' : 'ghost';
        const tag = !d.best ? '' : w === d.best + 1 && d.key !== 'best' ? '<span class="tg">New best</span>' : w === d.best ? '<span class="tg">Best</span>' : '';
        return `<span class="lk ${cls}${w === now ? ' now' : ''}">${tag}</span>`;
      }).join('');
      return `<section class="streak st-chain${lit}" aria-label="${plain(c.stats)}">
        <div class="cn"><span class="fl">${FLAME(d.counted)}</span>${num}</div>
        <div class="ch"><div class="links" aria-hidden="true">${links}</div><p class="cap">${c.stats}</p></div></section>`;
    }
    // card
    const hist = Array.from({ length: 12 }, (_, k) => { const ago = 11 - k; return ago === 0 ? (d.counted ? 'on' : 'open') : ago <= d.n - (d.counted ? 1 : 0) ? 'on' : ago === d.n + (d.counted ? 0 : 1) ? 'off' : 'old'; });
    return `<section class="streak st-card${lit}" aria-label="${d.n} week streak. ${plain(c.coach)}">
      <span class="fl">${FLAME(d.counted)}</span>
      <div class="od-stat">${num}<span class="sl">weeks in a row</span></div>
      ${d.n || d.counted ? `<div class="hist" aria-hidden="true">${hist.map((h) => `<i class="${h}"></i>`).join('')}</div>` : ''}
      <p class="enc">${c.coach}</p></section>`;
  }

  // D · scoreboard: one giant number, one segment per planned workout
  function weekScore(s) {
    // a plain week; practice days are marked on the date itself (ring = planned, solid + check = done, white = live)
    const head = `${streakBlock(s)}<div class="wk-top">${wkTitle(s)}${firstRun(s) ? '' : `<span class="wk-sum"><b class="num">${doneCount(s)}</b> of ${plannedCount(s)} done</span>`}</div>`;
    const cols = s.week.map((d, i) => {
      const live = d.r && liveOn(s, { ...d, i }), done = d.r && d.st === 'done';
      const cls = firstRun(s) ? 'none' : !d.r ? 'rest' : done ? 'done' : live ? 'live' : 'plan';
      const mark = `<span class="mk">${live ? `<svg viewBox="0 0 48 48" aria-hidden="true"><circle class="trk" cx="24" cy="24" r="22"/><circle class="arc" data-arc cx="24" cy="24" r="22" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${arcOff(s)}" transform="rotate(-90 24 24)"/></svg>` : ''}<span class="dn num">${d.dn}</span>${done ? `<span class="badge">${CHK}</span>` : ''}</span>`;
      const tag = `<button class="seg ${cls}${i === TODAY ? ' is-today' : ''}" style="--c:${d.r ? `var(--${d.r})` : 'var(--text-3)'}" data-act="day" data-i="${i}" aria-pressed="${i === s.sel}" aria-label="${dayLabel(d)}${live ? ', in progress' : ''}">`;
      return `${firstRun(s) ? '<span class="seg none">' : tag}<span class="dw">${i === TODAY ? 'Today' : d.dw}</span>${mark}${firstRun(s) ? '</span>' : '</button>'}`;
    }).join('');
    return `<section class="wk wk-score" aria-label="This week">${head}
      <div class="segs" role="group" aria-label="Pick a day">${cols}</div>
      ${firstRun(s) ? emptyLine : ''}</section>`;
  }

  // E · workout tiles: the hero's body map, one tile per planned workout
  function weekTiles(s) {
    const head = firstRun(s)
      ? `${streakBlock(s)}<div class="wk-top">${wkTitle(s)}</div>`
      : `${streakBlock(s)}<div class="tl-head"><span class="wk-kick label">This week</span><span class="tl-n display od-nowrap">${doneCount(s)} of ${plannedCount(s)} done</span></div>`;
    if (firstRun(s)) return `<section class="wk wk-tiles" aria-label="This week">${head}
      <div class="tiles od-rail">${'<span class="tile none"><span class="bmw">' + bodyMap(new Set()) + '</span></span>'.repeat(3)}</div>${emptyLine}</section>`;
    let out = '';
    s.week.forEach((d, i) => {
      if (!d.r) { if (i > 0 && i < 6) out += `<span class="tl-rest" aria-hidden="true"><span>Rest</span></span>`; return; }
      const w = { ...d, i }, live = liveOn(s, w), done = d.st === 'done';
      const lit = new Set(ROUTINES[d.r].muscles.flatMap((m) => REGIONS[m] || []));
      out += `<button class="tile ${done ? 'done' : live ? 'live' : 'plan'}${i === TODAY ? ' is-today' : ''}" style="--c:${cvar(w)};--rc:${live ? '#fff' : cvar(w)}" data-act="day" data-i="${i}" aria-pressed="${i === s.sel}" aria-label="${dayLabel(d)}${live ? ', in progress' : ''}">
        <span class="tt"><span class="dd">${i === TODAY ? 'Today' : `${d.dw} ${d.dn}`}</span>${done ? `<span class="stamp">${CHK}</span>` : ''}</span>
        <span class="bmw">${bodyMap(lit).replace('viewBox="0 0 215 224"', 'viewBox="0 0 215 204"')}</span>
        <span class="nm">${short(d.r)}</span>
        <span class="st">${done ? 'Done' : live ? `<span class="num" data-timer>${clock(Date.now() - s.startAt)}</span>` : `${ROUTINES[d.r].sets} sets · ${ROUTINES[d.r].min} min`}</span></button>`;
    });
    return `<section class="wk wk-tiles" aria-label="This week">${head}<div class="tiles od-rail rail" role="group" aria-label="Pick a workout">${out}</div></section>`;
  }

  // F · sets meter: the week counted in sets, one tick per set
  function weekSets(s) {
    if (firstRun(s)) return `<section class="wk wk-sets" aria-label="This week">
      <div class="st-head"><span class="st-n num ghost">0</span><span class="st-of"><span class="wk-kick label">Sets this week</span></span></div>
      <div class="meter"><span class="grp none" style="flex-grow:1"><span class="tk"></span></span></div>${emptyLine}</section>`;
    const grps = workouts(s).map((d) => {
      const live = liveOn(s, d), done = d.st === 'done', n = ROUTINES[d.r].sets;
      return `<button class="grp ${done ? 'done' : live ? 'live' : 'plan'}${d.i === TODAY ? ' is-today' : ''}" style="flex-grow:${n};--c:${cvar(d)}${live ? `;--p:${livePct(s)}` : ''}" data-act="day" data-i="${d.i}" aria-pressed="${d.i === s.sel}" aria-label="${dayLabel(d)}, ${n} sets${live ? ', in progress' : ''}">
        <span class="tk">${live ? '<span class="lv" data-pct></span>' : ''}</span>
        <span class="nm">${done ? CHK : ''}${short(d.r)}</span><span class="dd">${d.i === TODAY ? 'Today' : d.dw}</span></button>`;
    }).join('');
    return `<section class="wk wk-sets" aria-label="This week">
      <div class="st-head"><span class="st-n num od-nowrap"><span data-sets>${setsDone(s)}</span><small>/${setsAll(s)}</small></span>
        <span class="st-of od-stat"><span class="wk-kick label">Sets this week</span><span class="sc-st">${doneCount(s)} of ${plannedCount(s)} workouts · ${s.weekNo}-week streak</span></span></div>
      <div class="meter" role="group" aria-label="Pick a workout">${grps}</div>
      <p class="sc-next">${nextLine(s)}</p></section>`;
  }

  function trend(ws) {
    const Wd = 360, H = 72, lo = Math.min(...ws) - .3, hi = Math.max(...ws) + .3;
    const pts = ws.map((v, i) => [i / (ws.length - 1) * Wd, 6 + (1 - (v - lo) / (hi - lo)) * (H - 12)]);
    const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
    return `<svg viewBox="0 0 ${Wd} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <path d="${line} L${Wd} ${H} L0 ${H}Z" fill="var(--acc)" opacity=".10"/>
      <path d="${line}" fill="none" stroke="var(--acc)" stroke-width="2.5" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
  }

  function weightBig(s) {
    const ws = s.weights;
    const head = `<div class="wt-head"><span class="label">Body weight</span><button class="pillbtn" data-act="log">${ui('plus')}Log</button></div>`;
    if (!ws.length) return `<section class="card wbig" aria-label="Body weight">${head}<div class="meta" style="color:var(--text-2)">No weigh-ins yet. Log one to start your trend line.</div></section>`;
    const cur = ws[ws.length - 1], delta = cur - ws[0];
    return `<section class="card wbig" aria-label="Body weight">${head}
      <div class="num-line"><span class="od-nowrap"><span class="big num">${fmt(cur)}</span> <span class="unit">kg</span></span>
        ${ws.length > 1 ? `<span class="delta od-nowrap">${delta <= 0 ? '↓' : '↑'} ${fmt(Math.abs(delta))} kg in 30 days</span>` : ''}</div>
      <div class="goal"><span class="od-nowrap">${fmt(Math.max(0, cur - GOAL))} kg</span> to your ${fmt(GOAL)} kg goal</div>
      ${ws.length > 1 ? `<div class="trend">${trend(ws)}</div>` : ''}</section>`;
  }

  function weightSlim(s) {
    const ws = s.weights;
    if (!ws.length) return `<section class="card wrow" aria-label="Body weight" style="grid-template-columns:minmax(0,1fr) auto">
      <div><span class="label" style="display:block">Body weight</span><span class="empty">No weigh-ins yet</span></div>
      <button class="pillbtn" data-act="log">${ui('plus')}Log</button></section>`;
    const cur = ws[ws.length - 1], delta = cur - ws[0];
    const lo = Math.min(...ws) - .2, hi = Math.max(...ws) + .2;
    const pts = ws.map((v, i) => `${(i / Math.max(1, ws.length - 1) * 84 + 2).toFixed(1)},${(2 + (1 - (v - lo) / (hi - lo)) * 36).toFixed(1)}`).join(' ');
    return `<section class="card wrow" aria-label="Body weight">
      <div class="od-stat"><span class="label">Body weight</span><span><span class="big num">${fmt(cur)}</span><span class="unit">kg</span></span>
        ${ws.length > 1 ? `<span class="delta od-nowrap">${delta <= 0 ? '↓' : '↑'} ${fmt(Math.abs(delta))} kg · 30 days</span>` : ''}</div>
      <div class="spark">${ws.length > 1 ? `<svg viewBox="0 0 88 40" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="var(--acc)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>` : ''}</div>
      <button class="pillbtn" data-act="log">${ui('plus')}Log</button></section>`;
  }

  // ── Part 4 · body weight. mount({ weight: 'big' | 'track' | 'weeks' }); board message { ogWeight: case } ──
  // Mirrors the real app: one goal weight (gain or lose is read from where you started), one weigh-in a day,
  // weekly averages, and a weekly rate drawn as a straight line through the last 3 weeks of weigh-ins.
  let WEIGHT = null, WT_CASE = 'trend';
  const UP = W.slice().reverse(); // the same month, drifting up instead of down
  function shift(d) { return W.map((v) => Math.round((v + d) * 10) / 10); }
  const WT_CASES = {
    trend: { label: 'Has a trend' },
    empty: { label: 'No weigh-ins yet', w: [] },
    one: { label: 'One weigh-in', w: [80.9] },
    logged: { label: 'Logged today', logged: true },
    away: { label: 'Away from goal', w: UP },
    bulk: { label: 'Gaining to a bulk goal', w: UP, goal: 84.0 },
    nogoal: { label: 'No goal set', goal: null },
    // Goal moments: the screen never works these out. The app sends `app` (see APP_GOAL below) and the screen only draws it.
    moment: { label: 'Goal reached (moment)', w: shift(-2.9),
      app: { reached: true, celebrate: true, change: -1.5, since: '29 Sep', range: 1, holdWeeks: 1, weekIn: [false, false, false, false, true] } },
    holding: { label: 'Holding 3 weeks', w: shift(-3.4),
      app: { reached: true, celebrate: false, change: -1.9, since: '29 Sep', range: 1, holdWeeks: 3, weekIn: [false, false, true, true, true] } },
    outside: { label: 'Just outside range', w: shift(-3.4).map((v, i, a) => i >= a.length - 3 ? v + 1.6 : v),
      app: { reached: true, celebrate: false, change: -0.4, since: '29 Sep', range: 1, holdWeeks: 0, weekIn: [false, false, true, true, false] } }
  };
  // What the app provides for goal moments (one object, or nothing). Without it the section shows no moment, band or checks.
  //   reached    goal reached, judged by the app on weekly averages
  //   celebrate  true only until the moment has been shown once; the app clears it after
  //   change     kg since the first weigh-in (− down, + up); since = that weigh-in's date
  //   range      holding range, ± kg around the goal (new setting; ±1 proposed)
  //   holdWeeks  weeks in a row inside the range since reaching the goal
  //   weekIn     for each week shown, oldest first: inside the range or not
  const APP_GOAL = ['reached', 'celebrate', 'change', 'since', 'range', 'holdWeeks', 'weekIn'];
  function applyWt(s) {
    const c = WT_CASES[WT_CASE] || {};
    s.weights = (c.w || W).slice(); s.goal = 'goal' in c ? c.goal : GOAL; s.logged = !!c.logged;
    s.app = c.app ? { ...c.app } : null; s.played = false;
  }
  const avg = (a) => a.reduce((x, y) => x + y, 0) / a.length;
  const WK_LABELS = ['This week', '19 Oct', '12 Oct', '5 Oct', '28 Sep', '21 Sep'];
  function wtInfo(s) {
    const ws = s.weights, n = ws.length;
    if (!n) return { n };
    // weekly averages, newest last: this week so far (Mon–Wed), then whole weeks back
    const weeks = []; let end = n, size = TODAY + 1;
    while (end > 0 && weeks.length < 5) { weeks.unshift(avg(ws.slice(Math.max(0, end - size), end))); end -= size; size = 7; }
    const cur = weeks[weeks.length - 1], last = ws.slice(-21), m = last.length;
    let rate = null; // kg a week; needs 4+ weigh-ins, like the app
    if (m >= 4) { const mx = (m - 1) / 2, my = avg(last); let a = 0, b = 0; last.forEach((v, i) => { a += (i - mx) * (v - my); b += (i - mx) ** 2; }); rate = a / b * 7; }
    const goal = s.goal, dir = goal == null ? 0 : Math.sign(goal - ws[0]) || -1;
    const app = s.app, reached = goal != null && !!(app && app.reached); // the app decides, never the screen
    const flat = rate != null && Math.abs(rate) < .1;
    const toward = rate != null && !flat && Math.sign(rate) === dir;
    return { n, ws, cur, weeks, rate, goal, dir, reached, app, flat, toward, start: ws[0], left: goal == null ? 0 : Math.abs(goal - cur) };
  }
  const rateTxt = (i) => i.flat ? 'Holding steady' : `${i.rate < 0 ? 'Losing' : 'Gaining'} about ${fmt(Math.abs(i.rate))} kg a week`;
  const rateIcon = (i) => ui(i.flat ? 'flat' : i.rate < 0 ? 'down' : 'up');
  // one status sentence; meaning is always in the words, never in color alone
  function wtStatus(i) {
    if (i.n === 1) return 'Log a few more this week and your trend shows up here.';
    if (i.rate == null) return 'A couple more weigh-ins and your trend shows up here.';
    if (i.reached) {
      const a = i.app, now = a.weekIn ? a.weekIn[a.weekIn.length - 1] : true;
      const since = a.change != null ? ` ${fmt(Math.abs(a.change))} kg ${a.change < 0 ? 'down' : 'up'} since ${a.since}.` : '';
      if (a.celebrate) return `${ui('check')}<span><b>You did it.</b>${since}</span>`;
      if (!now) return `${ui('flat')}<span><b>Just outside your range</b> this week. Next week counts more.</span>`;
      if (a.holdWeeks > 0) return `${ui('check')}<span><b>${a.holdWeeks} week${a.holdWeeks === 1 ? '' : 's'} holding</b> at your goal. Steady is the hard part, and you're doing it.</span>`;
      return `${ui('check')}<span><b>At your goal.</b> Hold it here, or set a new one.</span>`;
    }
    if (i.goal == null) return `${rateIcon(i)}<span><b>${rateTxt(i)}</b> lately.</span>`;
    if (i.toward) return `${rateIcon(i)}<span><b>${rateTxt(i)}</b>, on track for your goal.</span>`;
    if (i.flat) return `${rateIcon(i)}<span><b>Holding steady</b> lately. Weeks count more than days.</span>`;
    return `${rateIcon(i)}<span><b>${rateTxt(i)}</b> lately, away from your goal. One week doesn't decide it.</span>`;
  }
  const goalTxt = (i) => i.goal == null ? '<button class="wt-link" data-act="goal">Set a goal weight</button>'
    : i.reached ? (i.app.range ? `Holding range <span class="od-nowrap">${fmt(i.goal - i.app.range)}–${fmt(i.goal + i.app.range)} kg</span>` : '')
    : `<span class="od-nowrap">${fmt(i.left)} kg</span> to your <span class="od-nowrap">${fmt(i.goal)} kg</span> goal`;
  const wtTop = (s, i) => `<div class="wt-top"><span class="label wk-kick">Body weight</span>${i.n ? (s.logged
    ? `<button class="wt-log is-done" data-act="log" aria-label="Logged today. Edit today's weigh-in">${ui('check')}Logged</button>`
    : `<button class="wt-log" data-act="log">${ui('plus')}Log</button>`) : ''}</div>`;
  const wtNum = (i, cls) => `<div class="wt-num ${cls}"><span class="od-nowrap"><span class="v num display">${fmt(i.cur)}</span><span class="u display">kg</span></span>
    <span class="wt-sub">${i.n === 1 ? 'Your first weigh-in' : "This week's average"}</span></div>`;
  function wtEmpty() {
    return `<section class="wt wt-empty" aria-label="Body weight"><div class="wt-top"><span class="label wk-kick">Body weight</span></div>
      <h3 class="display">Start your trend</h3>
      <p>Log your weight a few times a week. You'll see the weekly average, so one heavy morning won't throw you off.</p>
      <button class="wt-log" data-act="log">${ui('plus')}Log first weigh-in</button></section>`;
  }
  // A · big number: hero-size weekly average, full-width trend with the goal as a dashed line
  function wtChart(i) {
    const ws = i.ws, Wd = 390, H = 112, sm = ws.map((_, k) => avg(ws.slice(Math.max(0, k - 6), k + 1)));
    const vals = i.goal == null ? ws : ws.concat(i.goal), lo = Math.min(...vals) - .4, hi = Math.max(...vals) + .4;
    const x = (k) => 8 + k / (ws.length - 1) * (Wd - 16), y = (v) => 10 + (1 - (v - lo) / (hi - lo)) * (H - 20);
    const line = sm.map((v, k) => `${k ? 'L' : 'M'}${x(k).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');
    const gy = i.goal == null ? 0 : y(i.goal);
    return `<figure class="wt-chart"><svg viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Weight over the last 30 days${i.goal == null ? '' : `, goal ${fmt(i.goal)} kg`}">
      ${i.goal == null ? '' : `<line x1="0" x2="${Wd}" y1="${gy}" y2="${gy}" class="gl"/><text x="${Wd - 8}" y="${gy + (gy > H / 2 ? -6 : 14)}" class="gt">GOAL ${fmt(i.goal)}</text>`}
      ${ws.map((v, k) => `<circle cx="${x(k).toFixed(1)}" cy="${y(v).toFixed(1)}" r="1.8" class="pt"/>`).join('')}
      <path d="${line}" class="ln"/><circle cx="${x(ws.length - 1)}" cy="${y(sm[sm.length - 1])}" r="5" class="end"/></svg>
      <figcaption><span>30 days ago</span><span>Today</span></figcaption></figure>`;
  }
  function wtBig(s) {
    const i = wtInfo(s); if (!i.n) return wtEmpty();
    return `<section class="wt wt-big" aria-label="Body weight">${wtTop(s, i)}${wtNum(i, 'is-big')}
      <p class="wt-st">${wtStatus(i)}</p>${i.n > 1 ? wtChart(i) : ''}${goalTxt(i) ? `<p class="wt-goal">${goalTxt(i)}</p>` : ''}</section>`;
  }
  // B · goal track: start → goal as one bar, you on it; direction-neutral (works for gaining or losing)
  function wtTrack(s) {
    const i = wtInfo(s); if (!i.n) return wtEmpty();
    const chip = i.rate == null || i.reached ? '' : `<span class="wt-chip">${rateIcon(i)}<span class="od-nowrap">${i.rate < 0 ? '−' : '+'}${fmt(Math.abs(i.rate))} kg/wk</span></span>`;
    let track;
    if (i.goal == null) track = `<div class="trk-none"><p>Set a goal weight and this turns into your track from start to finish.</p><button class="wt-log" data-act="goal">${ui('flag')}Set a goal</button></div>`;
    else {
      const span = i.goal - i.start, p = i.reached ? 1 : span ? Math.max(0, Math.min(1, (i.cur - i.start) / span)) : 0;
      const done = Math.abs(i.cur - i.start);
      track = `<div class="trk" style="--p:${p.toFixed(3)}" role="img" aria-label="Started at ${fmt(i.start)} kg, now ${fmt(i.cur)} kg, goal ${fmt(i.goal)} kg">
        <div class="trk-bar"><span class="trk-fill"></span><span class="trk-goal">${ui('flag')}</span><span class="trk-dot"></span></div>
        <div class="trk-ends"><span class="od-stat"><span class="k">Start</span><span class="num display">${fmt(i.start)}</span></span>
          <span class="od-stat trk-mid"><span class="k">${i.reached ? 'Done' : p > 0 && done >= .1 ? 'So far' : 'To go'}</span><span class="num display">${i.reached ? '100%' : p > 0 && done >= .1 ? `${fmt(done)} kg` : `${fmt(i.left)} kg`}</span></span>
          <span class="od-stat trk-g"><span class="k">Goal</span><span class="num display">${fmt(i.goal)}</span></span></div></div>`;
    }
    return `<section class="wt wt-track" aria-label="Body weight">${wtTop(s, i)}
      <div class="wt-row">${wtNum(i, 'is-mid')}${chip}</div>${track}<p class="wt-st">${wtStatus(i)}</p></section>`;
  }
  // C · week by week: weekly averages as columns, this week in white, goal as a dashed line
  function wtWeeks(s) {
    const i = wtInfo(s); if (!i.n) return wtEmpty();
    const wk = i.weeks, PH = 96, band = i.reached && i.app.range ? i.app.range : 0;
    const vals = i.goal == null ? wk : wk.concat(i.goal - band, i.goal + band);
    const moment = i.reached && i.app.celebrate, anim = moment && !s.played; s.played = true;
    const inW = i.reached && i.app.weekIn ? i.app.weekIn.slice(-wk.length) : null;
    const lo = Math.min(...vals) - .6, hi = Math.max(...vals) + .2, h = (v) => Math.max(6, (v - lo) / (hi - lo) * PH);
    const lab = wk.map((_, k) => WK_LABELS[wk.length - 1 - k]);
    const cols = wk.map((v, k) => `<div class="wc${k === wk.length - 1 ? ' is-now' : ''}"><span class="v num display">${fmt(v)}</span><span class="b" style="height:${h(v).toFixed(0)}px"></span></div>`).join('');
    return `<section class="wt wt-weeks${anim ? ' is-moment' : ''}" aria-label="Body weight">${wtTop(s, i)}
      ${moment ? `<h3 class="wt-win display">${ui('flag')}<span>Goal reached</span></h3>` : ''}${wtNum(i, 'is-mid')}
      <div class="wks" style="--n:${wk.length}" role="img" aria-label="Weekly averages: ${wk.map((v, k) => `${lab[k]} ${fmt(v)} kg`).join(', ')}">
        <div class="wks-plot">${band ? `<span class="wks-band" style="bottom:${h(i.goal - band).toFixed(0)}px;height:${(h(i.goal + band) - h(i.goal - band)).toFixed(0)}px"></span>` : ''}${i.goal == null ? '' : `<span class="wks-gl${i.reached ? ' is-hit' : ''}" style="bottom:${h(i.goal).toFixed(0)}px"></span>`}${cols}</div>
        ${inW ? `<div class="wks-ck">${inW.map((v) => `<span>${v ? `${ui('check')}<span class="od-sr">in range</span>` : ''}</span>`).join('')}</div>` : ''}
        <div class="wks-lab">${lab.map((l) => `<span>${l}</span>`).join('')}</div></div>
      <p class="wt-st">${wtStatus(i)}</p>${goalTxt(i) ? `<p class="wt-goal">${i.goal == null ? '' : `<span class="dash${band ? ' is-band' : ''}" aria-hidden="true"></span>`}${goalTxt(i)}</p>` : ''}</section>`;
  }

  const TABS = [['today', 'Home'], ['plan', 'Plan'], null, ['stats', 'Progress'], ['dumbbell', 'Exercises']];
  function tabbar(s, set) {
    return `<nav class="tabbar" aria-label="Main">${TABS.map((t, i) => {
      if (!t) return `<button class="tab start${s.active ? ' running' : ''}" data-act="${s.active ? 'resume' : 'start'}" aria-label="${s.active ? 'Resume workout' : 'Start workout'}">
          <span class="cir">${ICONS[set].start()}</span><span class="lb" data-timer>${s.active ? clock(Date.now() - s.startAt) : 'Start'}</span></button>`;
      const on = i === 0;
      return `<button class="tab" data-act="tab" data-tab="${t[1]}" ${on ? 'aria-current="page"' : ''}>${ICONS[set][t[0]](on)}<span class="lb">${t[1]}</span></button>`;
    }).join('')}</nav>`;
  }

  // ── round 2 tab bars ──
  const sessionMin = (s) => (ROUTINES[s.week[TODAY].r] || { min: 60 }).min;
  const arcOff = (s) => s.active ? (100 - Math.min(100, (Date.now() - s.startAt) / (sessionMin(s) * 600))).toFixed(1) : 0;
  function startBtn(s, mode) {
    const run = s.active, t = run ? clock(Date.now() - s.startAt) : '';
    const name = run ? `Resume workout, ${t} so far` : 'Start workout';
    const inner = mode === 'text'
      ? (run ? `<span class="tx"><i class="dot" aria-hidden="true"></i><span class="num" data-timer>${t}</span></span>`
             : `<span class="tx">${IC.start()}<span>Start</span></span>`)
      : `<span class="disc"><svg class="ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="trk" cx="24" cy="24" r="22.5"/><circle class="arc" data-arc cx="24" cy="24" r="22.5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${arcOff(s)}" transform="rotate(-90 24 24)"/></svg>
          ${run ? `<span class="tm num" data-timer>${t}</span>` : '<span class="go display">Go</span>'}</span>${mode === 'disc' ? `<span class="lb">${run ? 'Resume' : 'Workout'}</span>` : ''}`;
    return `<button class="tb-start${run ? ' running' : ''}" data-act="${run ? 'resume' : 'start'}" aria-label="${name}">${inner}</button>`;
  }
  function tabbar2(s, mode) {
    return `<nav class="tb tb-${mode}${mode === 'combo' ? ' tb-capsule' : ''}" aria-label="Main">${TABS.map((t) => {
      if (!t) return startBtn(s, mode);
      const on = s.tab === t[1];
      return `<button class="tb-i" data-act="tab" data-tab="${t[1]}" ${on ? 'aria-current="page"' : ''}>${mode === 'text' ? '' : IC[t[0]](on)}<span class="lb">${t[1]}</span></button>`;
    }).join('')}</nav>`;
  }
  const tabScreen = (s) => `<section class="tabpage" aria-label="${s.tab}"><h1 class="display">${s.tab}</h1>
    <p>This screen is designed in a later part. It's here so you can see the tab bar with ${s.tab} selected.</p></section>`;
  function tick(root, s) {
    if (!s.active) return;
    root.querySelectorAll('[data-timer]').forEach((n) => { n.textContent = clock(Date.now() - s.startAt); });
    root.querySelectorAll('[data-arc]').forEach((n) => n.setAttribute('stroke-dashoffset', arcOff(s)));
    root.querySelectorAll('[data-pct]').forEach((n) => n.parentElement.style.setProperty('--p', livePct(s)));
    root.querySelectorAll('[data-sets]').forEach((n) => { n.textContent = setsDone(s); });
  }

  function render(s, dir, set, tabs) {
    const wk = { rail: weekRail, rings: weekRings, big: weekBig, score: weekScore, tiles: weekTiles, sets: weekSets }[WEEK];
    const wt = { big: wtBig, track: wtTrack, weeks: wtWeeks }[WEIGHT] || weightBig;
    const below = wk ? wk(s) + wt(s) : dir === 'full' ? weekBars(s) + weightBig(s) : weekDots(s) + weightSlim(s);
    if (!tabs) return `<div class="app v2 od-screen"><div class="od-scroll">${poster(s)}<div class="below">${below}</div></div>${tabbar(s, set)}</div>`;
    const main = s.tab === 'Home' ? `${poster(s)}<div class="below">${below}</div>` : tabScreen(s);
    return `<div class="app v2 od-screen tabs-${tabs}${tabs === 'combo' ? ' tabs-capsule' : ''}"><div class="od-scroll">${main}</div>${tabbar2(s, tabs)}</div>`;
  }

  // one bar on its own, for the board. Returns { set(mode, tab) }.
  function strip({ el, tabs, day }) {
    let s;
    const set = (mode, tab) => { s = stateFor(mode, el.dataset.day || day); s.tab = tab; el.innerHTML = `<div class="strip tabs-${tabs}${tabs === 'combo' ? ' tabs-capsule' : ''}"><div class="ghost" aria-hidden="true"></div>${tabbar2(s, tabs)}</div>`; };
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-act="tab"]'); if (b) set(s.active ? 'active' : 'normal', b.dataset.tab); });
    setInterval(() => s && tick(el, s), 1000);
    return { set };
  }

  function mount({ dir, day, photo, tabs, week, streak, weight, content, host }) {
    if (['big', 'track', 'weeks'].includes(weight)) WEIGHT = weight;
    if (['card', 'poster', 'chain'].includes(streak)) STREAK_STYLE = streak;
    if (['rail', 'rings', 'big', 'score', 'tiles', 'sets'].includes(week)) WEEK = week;
    if (!['capsule', 'disc', 'text', 'combo'].includes(tabs)) tabs = null;
    if (photo === 'full' || photo === 'framed') PHOTO_MODE = photo;
    host.classList.add('og', 'p-ios');
    host.dataset.dir = dir;
    let set = 'A';
    let s = stateFor('normal', day);
    let tab = 'Home';
    s.tab = tab;
    const toastEl = document.createElement('div');
    toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
    host.append(toastEl);

    const draw = (focusSel) => {
      const sc = content.querySelector('.od-scroll'), top = sc ? sc.scrollTop : 0;
      const d = s.week[s.sel];
      host.dataset.rc = s.mode === 'first' ? 'none' : (d.r || 'none');
      host.dataset.icons = set;
      if (tabs) host.dataset.tabs = tabs;
      content.innerHTML = render(s, dir, set, tabs);
      content.querySelector('.od-scroll').scrollTop = top;
      const rail = content.querySelector('.rail'), on = rail?.querySelector('[aria-pressed="true"]');
      if (on) rail.scrollLeft = on.offsetLeft - (rail.clientWidth - on.offsetWidth) / 2;
      if (focusSel) content.querySelector(focusSel)?.focus({ preventScroll: true });
    };
    setInterval(() => tick(content, s), 1000);

    let toastT;
    const toast = (msg) => { toastEl.textContent = msg; toastEl.classList.add('in'); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('in'), 2400); };

    let open = false;
    function openSheet() {
      open = true;
      let val = s.weights.length ? s.weights[s.weights.length - 1] : 80.0;
      const scrim = document.createElement('div'); scrim.className = 'scrim';
      const el = document.createElement('div');
      el.className = 'sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'og-sheet-title');
      el.innerHTML = `<span class="grab" aria-hidden="true"></span>
        <h4 id="og-sheet-title" class="display">${s.logged ? "Today's weigh-in" : 'Log weigh-in'}</h4>
        <div class="stepper"><button data-d="-0.1" aria-label="Decrease by 0.1 kg">−</button>
          <output class="num" aria-live="polite"><span class="v">${fmt(val)}</span><small>kg</small></output>
          <button data-d="0.1" aria-label="Increase by 0.1 kg">+</button></div>
        <div class="sheet-actions"><button data-x="cancel">Cancel</button><button class="save" data-x="save">Save</button></div>`;
      host.append(scrim, el);
      requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('in'); el.classList.add('in'); el.querySelector('.save').focus({ preventScroll: true }); }));
      const close = (saved) => {
        scrim.classList.remove('in'); el.classList.remove('in');
        setTimeout(() => { scrim.remove(); el.remove(); }, 200);
        open = false;
        if (saved) { const v = Math.round(val * 10) / 10; if (s.logged && s.weights.length) s.weights[s.weights.length - 1] = v; else { s.weights.push(v); if (s.weights.length > 30) s.weights.shift(); } s.logged = true; draw(); toast(`Saved ${fmt(v)} kg`); }
        content.querySelector('[data-act="log"]')?.focus({ preventScroll: true });
      };
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.d) { val = Math.max(30, Math.min(250, val + Number(b.dataset.d))); el.querySelector('.v').textContent = fmt(val); }
        if (b.dataset.x) close(b.dataset.x === 'save');
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close(false);
        if (e.key === 'Tab') {
          const b = [...el.querySelectorAll('button')], first = b[0], last = b[b.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      scrim.addEventListener('click', () => close(false));
    }

    // Part 3: tapping a day opens it in a sheet; the hero always stays on today
    function openDay(i) {
      if (open) return;
      open = true;
      const d = s.week[i], r = d.r && ROUTINES[d.r], isT = i === TODAY;
      const live = isT && s.active && d.st !== 'done', done = d.r && d.st === 'done';
      const trigger = content.querySelector(`[data-act="day"][data-i="${i}"]`);
      const status = !r ? 'Rest day. Recovery counts too.'
        : done ? `${CHK}<b>Done</b> · ${r.sets} sets · ${r.min} min`
        : live ? `<b>In progress</b> · <span class="num" data-timer>${clock(Date.now() - s.startAt)}</span>`
        : `<b>Planned</b> · ${r.sets} sets · about ${r.min} min`;
      const act = !r || done ? '' : live ? '<button class="ds-go" data-x="resume">Resume workout</button>'
        : isT ? '<button class="ds-go" data-x="start">Start workout</button>' : '<button class="ds-go" data-x="early">Do this today instead</button>';
      const lit = new Set(r ? r.muscles.flatMap((m) => REGIONS[m] || []) : []);
      const scrim = document.createElement('div'); scrim.className = 'scrim';
      const el = document.createElement('div');
      el.className = 'sheet day-sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'og-day-title');
      el.style.setProperty('--c', r ? (live ? '#fff' : `var(--${d.r})`) : 'var(--text-2)');
      el.style.setProperty('--rc', r ? (live ? '#fff' : `var(--${d.r})`) : 'var(--text-3)');
      el.innerHTML = `<span class="grab" aria-hidden="true"></span>
        <div class="ds-top"><div class="od-stat"><span class="ds-day label">${isT ? 'Today · ' : ''}${d.full}</span>
          <h4 id="og-day-title" class="display">${r ? r.name : 'Rest'}</h4></div>
          <button class="ds-x" data-x="close" aria-label="Close">${ui('x')}</button></div>
        <p class="ds-st">${status}</p>
        ${r ? `<div class="ds-body"><div class="ds-bm">${bodyMap(lit)}</div>
          <div><span class="label">${r.muscles.join(' · ')}</span>
          <ol class="ds-ex">${r.ex.map((x) => `<li>${x}</li>`).join('')}</ol></div></div>` : ''}
        ${act}`;
      host.append(scrim, el);
      requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('in'); el.classList.add('in'); (el.querySelector('.ds-go') || el.querySelector('.ds-x')).focus({ preventScroll: true }); }));
      const t = setInterval(() => tick(el, s), 1000);
      const close = (then) => {
        clearInterval(t);
        scrim.classList.remove('in'); el.classList.remove('in');
        setTimeout(() => { scrim.remove(); el.remove(); }, 200);
        open = false;
        if (then) then(); else trigger?.focus({ preventScroll: true });
      };
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-x]'); if (!b) return;
        const x = b.dataset.x;
        if (x === 'close') close();
        else if (x === 'early') close(() => toast(`${r.name} would replace today's plan.`));
        else if (x === 'resume') close(() => toast('Back to the live workout (round 2).'));
        else if (x === 'start') close(() => content.querySelector('[data-act="start"]')?.click());
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
        if (e.key === 'Tab') {
          const b = [...el.querySelectorAll('button')], first = b[0], last = b[b.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      scrim.addEventListener('click', () => close());
    }

    const later = { Plan: 'round 3', Progress: 'round 5', Exercises: 'round 4' };
    content.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || open) return;
      const act = b.dataset.act;
      if (act === 'day' && WEEK) openDay(Number(b.dataset.i));
      else if (act === 'day') { s.sel = Number(b.dataset.i); draw(`[data-act="day"][data-i="${s.sel}"]`); }
      else if (act === 'back-today') { s.sel = TODAY; draw(`[data-act="day"][data-i="${TODAY}"]`); }
      else if (act === 'start') {
        if (!s.week[TODAY].r || s.week[TODAY].st === 'done') { toast('Nothing left to start today. The workout picker is round 3.'); return; }
        s.active = true; s.startAt = Date.now(); s.sel = TODAY;
        draw(tabs ? '.tb-start' : '.tab.start'); toast('Workout started. The live screen is round 2.');
      }
      else if (act === 'resume') toast('Back to the live workout (round 2).');
      else if (act === 'early') toast(`${ROUTINES[s.week[s.sel].r].name} would replace today's plan.`);
      else if (act === 'log') openSheet();
      else if (act === 'goal') toast('Goal setting opens the goal sheet (as in the app today).');
      else if (act === 'checkin') toast('Check-in is a later round.');
      else if (act === 'other') toast('The workout picker is round 3.');
      else if (act === 'starter' || act === 'build') toast('Plan setup is round 3.');
      else if (act === 'settings') toast('Settings is a later round.');
      else if (act === 'tab' && tabs) { tab = s.tab = b.dataset.tab; draw(`[data-tab="${tab}"]`); }
      else if (act === 'tab' && b.dataset.tab !== 'Home') toast(`${b.dataset.tab} is ${later[b.dataset.tab]}.`);
    });
    window.addEventListener('message', (e) => {
      if (!e.data) return;
      if (typeof e.data.ogState === 'string') { s = stateFor(e.data.ogState, day); s.tab = tab; draw(); }
      if ('ogStreak' in e.data) { STREAK_CASE = STREAK_CASES[e.data.ogStreak] ? e.data.ogStreak : null; draw(); }
      if (typeof e.data.ogWeight === 'string' && WT_CASES[e.data.ogWeight]) { WT_CASE = e.data.ogWeight; applyWt(s); draw(); }
      if (typeof e.data.ogSel === 'number') { if (WEEK) openDay(e.data.ogSel); else { s.sel = e.data.ogSel; draw(); } }
      if (typeof e.data.ogTab === 'string') { tab = s.tab = e.data.ogTab; content.querySelector('.od-scroll').scrollTop = 0; draw(); }
      if (e.data.ogIcons === 'A' || e.data.ogIcons === 'B') { set = e.data.ogIcons; draw(); }
    });
    draw();
  }

  // Shared for other screens (Plan, Progress, Exercises, workout): the locked capsule tab bar with one tab selected.
  // tab: 'Home'|'Plan'|'Progress'|'Exercises'; active: a workout is running (GO turns into the white live timer).
  // Put it inside <div class="app v2 od-screen tabs-combo tabs-capsule">, after the scrolling content.
  function tabbarHTML(tab, active = false, startAt = Date.now() - 760000) {
    const s = stateFor(active ? 'active' : 'normal', 'push'); s.tab = tab; if (active) s.startAt = startAt;
    return tabbar2(s, 'combo');
  }
  return { mount, strip, tabbarHTML, ui, STREAK_CASES, STREAK_COPY, WT_CASES, APP_GOAL };
})();
