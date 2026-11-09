// openGym Today screen · shared by iOS, Android and web.
// OG.mount({ platform: 'ios' | 'android' | 'web', content, host })
//   content: element the app renders into; host: element overlays (sheet, toast) mount in.
// The board can switch the preview state with postMessage({ ogState: 'normal' | 'active' | 'done' | 'rest' | 'multi' | 'first' }).
window.OG = (() => {
  const P = {
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>',
    play: '<path d="M7 5.5v13a1 1 0 0 0 1.5.9l10.4-6.5a1 1 0 0 0 0-1.8L8.5 4.6A1 1 0 0 0 7 5.5Z"/>',
    swap: '<path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/>',
    qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    today: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
    plan: '<rect x="4" y="5" width="16" height="16" rx="2"/><path d="M16 3v4M8 3v4M4 11h16"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    body: '<circle cx="12" cy="5" r="2"/><path d="M12 7v7M8 10l4-1 4 1M10 21l2-7 2 7"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 10h6M9 14h6"/>'
  };
  const icon = (n) => `<svg class="od-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;

  const ROUTINES = {
    push: { name: 'Push A', min: 55, muscles: ['Chest', 'Shoulders', 'Triceps'],
      list: [['Bench press', '4 × 6–8'], ['Incline dumbbell press', '3 × 8–10'], ['Overhead press', '3 × 6–8'], ['Lateral raise', '3 × 12–15'], ['Triceps pushdown', '3 × 10–12'], ['Dips', '2 × max']] },
    pull: { name: 'Pull A', min: 50, muscles: ['Back', 'Biceps', 'Rear delts'],
      list: [['Deadlift', '3 × 5'], ['Pull-up', '4 × 6–10'], ['Barbell row', '3 × 8'], ['Face pull', '3 × 15'], ['Hammer curl', '3 × 10'], ['Barbell curl', '2 × 10']] },
    legs: { name: 'Legs', min: 60, muscles: ['Quads', 'Hamstrings', 'Glutes'],
      list: [['Back squat', '4 × 5–6'], ['Romanian deadlift', '3 × 8'], ['Leg press', '3 × 10–12'], ['Leg curl', '3 × 12'], ['Calf raise', '4 × 12']] },
    core: { name: 'Core', min: 15, muscles: ['Abs', 'Obliques'],
      list: [['Hanging leg raise', '3 × 10'], ['Cable crunch', '3 × 12'], ['Side plank', '2 × 45 s']] }
  };
  const BASE_WEEK = [
    { dw: 'Mon', dn: 26, full: 'Monday 26 October', r: ['legs'], st: 'done' },
    { dw: 'Tue', dn: 27, full: 'Tuesday 27 October', r: null, st: 'rest' },
    { dw: 'Wed', dn: 28, full: 'Wednesday 28 October', r: ['push'], st: 'plan', today: true },
    { dw: 'Thu', dn: 29, full: 'Thursday 29 October', r: null, st: 'rest' },
    { dw: 'Fri', dn: 30, full: 'Friday 30 October', r: ['pull'], st: 'plan' },
    { dw: 'Sat', dn: 31, full: 'Saturday 31 October', r: ['legs'], st: 'plan' },
    { dw: 'Sun', dn: 1, full: 'Sunday 1 November', r: null, st: 'rest' }
  ];
  const TODAY = 2;
  const TABS = [['today', 'Today'], ['plan', 'Plan'], null, ['stats', 'Progress'], ['dumbbell', 'Exercises']];
  const BASE_W = [82.4,82.6,82.3,82.1,82.2,82.0,81.9,82.1,81.8,81.7,81.9,81.6,81.5,81.6,81.4,81.3,81.5,81.2,81.1,81.3,81.0,81.1,80.9,81.0,80.8,80.9,80.7,80.9,80.8,80.9];
  const fmt = (n) => n.toFixed(1);
  const clock = (ms) => { const t = Math.max(0, Math.floor(ms / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };

  function stateFor(mode) {
    const week = BASE_WEEK.map((d) => ({ ...d }));
    const s = { mode, sel: TODAY, week, active: false, startAt: 0, weights: BASE_W.slice(), done: 1, planned: 4 };
    if (mode === 'active') { s.active = true; s.startAt = Date.now() - (12 * 60 + 40) * 1000; }
    if (mode === 'done') { week[TODAY].st = 'done'; s.done = 2; }
    if (mode === 'rest') { week[TODAY].r = null; week[TODAY].st = 'rest'; s.planned = 3; }
    if (mode === 'multi') week[TODAY].r = ['push', 'core'];
    if (mode === 'first') { week.forEach((d) => { d.r = null; d.st = 'none'; }); s.weights = []; s.done = 0; s.planned = 0; }
    return s;
  }

  const spark = (ws) => {
    if (ws.length < 2) return '';
    const W = 88, H = 40, lo = Math.min(...ws) - .2, hi = Math.max(...ws) + .2;
    const pts = ws.map((v, i) => `${(i / (ws.length - 1) * (W - 4) + 2).toFixed(1)},${(2 + (1 - (v - lo) / (hi - lo)) * (H - 4)).toFixed(1)}`);
    const [lx, ly] = pts[pts.length - 1].split(',');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Trend over the last ${ws.length} weigh-ins"><polyline points="${pts.join(' ')}" fill="none" stroke="var(--acc)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${lx}" cy="${ly}" r="3" fill="var(--acc)"/></svg>`;
  };

  function hero(s) {
    const d = s.week[s.sel], isToday = s.sel === TODAY;
    const top = `<div class="hero-top"><span class="label">${isToday ? 'Today' : d.full}</span>${isToday ? '' : '<button class="mini-link" data-act="back-today">Back to today</button>'}</div>`;

    if (s.mode === 'first' && isToday) return `<section class="card hero" aria-label="Get started">${top}
        <h2 class="display">Set up your week</h2>
        <div class="body"><div class="meta">Pick a ready-made plan to start today, or build your own routines.</div>
          <div class="cta-pair"><button class="cta" data-act="starter">${icon('clipboard')}Load a starter plan</button>
          <button class="cta ghost" data-act="build">Build my own plan</button></div></div></section>`;

    if (!d.r) {
      const next = s.week.slice(s.sel + 1).find((x) => x.r);
      return `<section class="card hero" aria-label="${isToday ? 'Today' : d.full}">${top}
        <h2 class="display">Rest day</h2>
        <div class="body"><div class="meta">${s.mode === 'first' ? 'Nothing planned yet.' : `Recover. ${next ? `Next up: ${next.r.map((k) => ROUTINES[k].name).join(' + ')} on ${next.dw}.` : 'Next week starts with Legs.'}`}</div>
        ${isToday ? '<button class="cta ghost" data-act="other">Train anyway</button>' : ''}</div></section>`;
    }

    const rs = d.r.map((k) => ROUTINES[k]);
    const name = rs.map((r) => r.name).join(' + ');
    const list = rs.flatMap((r) => r.list);
    const mins = rs.reduce((a, r) => a + r.min, 0);
    const muscles = [...new Set(rs.flatMap((r) => r.muscles))];
    const preview = `<ul class="exlist">${list.slice(0, 3).map(([n, sets]) => `<li><span class="od-truncate">${n}</span><span class="sets od-nowrap">${sets}</span></li>`).join('')}
      ${list.length > 3 ? `<li class="more">+ ${list.length - 3} more</li>` : ''}</ul>`;

    let action;
    if (d.st === 'done') action = `<div class="od-row" style="justify-content:space-between"><span class="tag">Done · 54 min</span>${isToday ? '<button class="mini-link" data-act="other">Do another workout</button>' : ''}</div>`;
    else if (isToday && s.active) action = `<button class="cta ghost resume-ghost" data-act="resume">${icon('play')}Resume · 2 of ${list.length} done</button>`;
    else if (isToday) action = `<button class="cta" data-act="start">${icon('play')}Start workout</button>
        <button class="checkin-hint" data-act="checkin">${icon('qr')}At the gym?&nbsp;<b>Check in</b></button>`;
    else action = `<button class="cta ghost" data-act="early">Start this one now</button>`;

    return `<section class="card hero" aria-label="${isToday ? 'Today' : d.full}">${top}
      <h2 class="display">${name}</h2>
      <div class="body">
        <div class="meta"><span class="od-nowrap">${rs.length > 1 ? rs.length + ' routines · ' : ''}${list.length} exercises</span> · <span class="od-nowrap">about ${mins} min</span></div>
        <div class="chips">${muscles.map((m) => `<span class="chip">${m}</span>`).join('')}</div>
        ${preview}
        ${action}
      </div></section>`;
  }

  function weekCard(s) {
    const streak = s.mode === 'first' ? 'No workouts yet' : `<b>Week 7</b> streak · <b>${s.done}</b> of ${s.planned} done`;
    return `<section class="card" aria-label="This week">
      <div class="week-head"><span class="label">This week</span><span class="streak-line">${streak}</span></div>
      <div class="week" role="group" aria-label="Pick a day">
        ${s.week.map((d, i) => `<button class="day${i === TODAY ? ' today' : ''}" data-act="day" data-i="${i}" aria-pressed="${i === s.sel}" aria-label="${d.full}, ${d.r ? d.r.map((k) => ROUTINES[k].name).join(' + ') + (d.st === 'done' ? ', done' : ', planned') : 'nothing planned'}">
          <span class="dw">${d.dw}</span><span class="dn num">${d.dn}</span><span class="dot ${d.st}"></span></button>`).join('')}
      </div></section>`;
  }

  function weightRow(s) {
    const ws = s.weights;
    if (!ws.length) return `<section class="card wrow" aria-label="Body weight" style="grid-template-columns:minmax(0,1fr) auto">
      <div><span class="label" style="display:block">Body weight</span><span class="empty">No weigh-ins yet</span></div>
      <button class="pillbtn" data-act="log">${icon('plus')}Log</button></section>`;
    const cur = ws[ws.length - 1], delta = cur - ws[0];
    return `<section class="card wrow" aria-label="Body weight">
      <div class="od-stat"><span class="label">Body weight</span>
        <span><span class="big num">${fmt(cur)}</span><span class="unit">kg</span></span>
        ${ws.length > 1 ? `<span class="delta od-nowrap">${delta <= 0 ? '↓' : '↑'} ${fmt(Math.abs(delta))} kg · 30 days</span>` : ''}</div>
      <div class="spark">${spark(ws)}</div>
      <button class="pillbtn" data-act="log">${icon('plus')}Log</button></section>`;
  }

  const header = () => `<header class="hdr">
      <div><div class="date">Wednesday 28 October</div><h1 class="display">Hi Kobi</h1></div>
      <button class="iconbtn" data-act="settings" aria-label="Settings">${icon('gear')}</button>
    </header>`;

  const body = (s) => `<div class="cols"><div class="col">${hero(s)}</div><div class="col">${weekCard(s)}${weightRow(s)}</div></div>`;

  const startTab = (s) => `<button class="tab start${s.active ? ' running' : ''}" data-act="${s.active ? 'resume' : 'start'}" aria-label="${s.active ? 'Resume workout, ' + clock(Date.now() - s.startAt) + ' elapsed' : 'Start workout'}">
      <span class="cir">${icon('play')}</span><span class="lb" data-timer>${s.active ? clock(Date.now() - s.startAt) : 'Start'}</span></button>`;

  const tabbar = (s, platform) => `<nav class="tabbar" aria-label="Main">
      ${TABS.map((t, i) => t ? `<button class="tab" data-act="tab" data-tab="${t[1]}" ${i === 0 ? 'aria-current="page"' : ''}>
        ${platform === 'android' ? `<span class="pill">${icon(t[0])}</span>` : icon(t[0])}<span class="lb">${t[1]}</span></button>` : startTab(s)).join('')}
    </nav>`;

  const sidebar = (s) => `<nav class="side" aria-label="Main">
      <div class="brand display">open<b>Gym</b></div>
      <button class="side-start${s.active ? ' running' : ''}" data-act="${s.active ? 'resume' : 'start'}">${icon('play')}${s.active ? 'Resume' : 'Start workout'}${s.active ? `<span class="t" data-timer>${clock(Date.now() - s.startAt)}</span>` : ''}</button>
      ${TABS.filter(Boolean).map((t, i) => `<a href="#${t[1].toLowerCase()}" data-act="tab" data-tab="${t[1]}" ${i === 0 ? 'aria-current="page"' : ''}>${icon(t[0])}${t[1]}</a>`).join('')}
      <hr />
      ${[['history', 'History'], ['body', 'Body'], ['gear', 'Settings']].map(([ic, lb]) => `<a href="#${lb.toLowerCase()}" data-act="tab" data-tab="${lb}">${icon(ic)}${lb}</a>`).join('')}
    </nav>`;

  function render(s, platform) {
    if (platform === 'web') return `<div class="web-shell">${sidebar(s)}<main class="main">${header()}${body(s)}</main>${tabbar(s, 'web')}</div>`;
    return `<div class="app od-screen"><div class="od-scroll">${header()}${body(s)}</div>${tabbar(s, platform)}</div>`;
  }

  function mount({ platform, content, host }) {
    host.classList.add('og', 'p-' + platform);
    let s = stateFor('normal');
    const toastEl = document.createElement('div');
    toastEl.className = 'toast'; toastEl.setAttribute('role', 'status');
    host.append(toastEl);

    const scroller = () => platform === 'web' ? document.scrollingElement : content.querySelector('.od-scroll');
    const draw = (focusSel) => {
      const top = scroller()?.scrollTop || 0;
      content.innerHTML = render(s, platform);
      const sc = scroller(); if (sc) sc.scrollTop = top;
      if (focusSel) content.querySelector(focusSel)?.focus({ preventScroll: true });
    };
    // live timer: update text only, never re-render
    setInterval(() => { if (s.active) content.querySelectorAll('[data-timer]').forEach((n) => { n.textContent = clock(Date.now() - s.startAt); }); }, 1000);

    let toastT;
    const toast = (msg) => {
      toastEl.textContent = msg; toastEl.classList.add('in');
      clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('in'), 2400);
    };

    let open = false;
    function openSheet() {
      open = true;
      let val = s.weights.length ? s.weights[s.weights.length - 1] : 80.0;
      const scrim = document.createElement('div'); scrim.className = 'scrim';
      const el = document.createElement('div');
      el.className = 'sheet'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'og-sheet-title');
      el.innerHTML = `<span class="grab" aria-hidden="true"></span>
        <h4 id="og-sheet-title" class="display">Log weigh-in</h4>
        <div class="stepper">
          <button data-d="-0.1" aria-label="Decrease by 0.1 kg">−</button>
          <output class="num" aria-live="polite"><span class="v">${fmt(val)}</span><small>kg</small></output>
          <button data-d="0.1" aria-label="Increase by 0.1 kg">+</button>
        </div>
        <div class="sheet-actions">
          <button data-x="cancel">Cancel</button>
          <button class="save" data-x="save">Save</button>
        </div>`;
      host.append(scrim, el);
      requestAnimationFrame(() => requestAnimationFrame(() => { scrim.classList.add('in'); el.classList.add('in'); el.querySelector('.save').focus({ preventScroll: true }); }));
      const close = (saved) => {
        scrim.classList.remove('in'); el.classList.remove('in');
        setTimeout(() => { scrim.remove(); el.remove(); }, 200);
        open = false;
        if (saved) {
          s.weights.push(Math.round(val * 10) / 10);
          if (s.weights.length > 30) s.weights.shift();
          draw(); toast(`Saved ${fmt(val)} kg`);
        }
        content.querySelector('[data-act="log"]')?.focus({ preventScroll: true });
      };
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button'); if (!b) return;
        if (b.dataset.d) { val = Math.max(30, Math.min(250, val + Number(b.dataset.d))); el.querySelector('.v').textContent = fmt(val); }
        if (b.dataset.x) close(b.dataset.x === 'save');
      });
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close(false);
        if (e.key === 'Tab') { // keep focus inside the sheet
          const b = [...el.querySelectorAll('button')], first = b[0], last = b[b.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      scrim.addEventListener('click', () => close(false));
    }

    const later = { Plan: 'round 3', Progress: 'round 5', Exercises: 'round 4', History: 'round 5', Body: 'a later round', Settings: 'a later round' };
    content.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || open) return;
      const act = b.dataset.act;
      if (b.tagName === 'A') e.preventDefault();
      if (act === 'day') { s.sel = Number(b.dataset.i); draw(`[data-act="day"][data-i="${s.sel}"]`); }
      else if (act === 'back-today') { s.sel = TODAY; draw(`[data-act="day"][data-i="${TODAY}"]`); }
      else if (act === 'start') {
        if (!s.week[TODAY].r) { toast('Nothing planned today. The workout picker is round 3.'); return; }
        s.active = true; s.startAt = Date.now(); s.sel = TODAY;
        draw('.tab.start, .side-start'); toast('Workout started. The live screen is round 2.');
      }
      else if (act === 'resume') toast('Back to the live workout (round 2).');
      else if (act === 'early') toast(`${s.week[s.sel].r.map((k) => ROUTINES[k].name).join(' + ')} would replace today's plan.`);
      else if (act === 'log') openSheet();
      else if (act === 'checkin') toast('Check-in is a later round.');
      else if (act === 'other') toast('The workout picker is round 3.');
      else if (act === 'starter' || act === 'build') toast('Plan setup is round 3.');
      else if (act === 'settings') toast('Settings is a later round.');
      else if (act === 'tab' && b.dataset.tab !== 'Today') toast(`${b.dataset.tab} is ${later[b.dataset.tab]}.`);
    });
    window.addEventListener('message', (e) => {
      if (e.data && typeof e.data.ogState === 'string') { s = stateFor(e.data.ogState); draw(); }
    });
    draw();
  }

  return { mount };
})();
