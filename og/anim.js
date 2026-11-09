// Stand-in exercise animation for the mocks. The real app plays its own clip per exercise
// (downloaded packs, not in the code repo); this draws a looping white/grey line figure doing
// roughly the movement so placement and size can be judged. Always tagged "Animation".
// OGAnim.figure(exerciseName, { tag = true, still = false }) → HTML string (a .oga frame).
// still: true draws one pose without motion (list rows). prefers-reduced-motion also stops it.
window.OGAnim = (() => {
  // joints: h head, s shoulder, e elbow, w hand (wrist), p hip, k knee, f foot. Two poses, looped A→B→A.
  // Optional e2/w2 = second arm (front views). bar: 'disc' at hand, 'back' at shoulder, 'top' fixed bar.
  const P = {
    bench: { bar: 'disc', fixed: '<path d="M18 68H72M24 68v16M66 68v16" class="eq"/>',
      a: { h: [24, 58], s: [34, 62], e: [36, 46], w: [36, 30], p: [62, 62], k: [76, 52], f: [80, 82] },
      b: { h: [24, 58], s: [34, 62], e: [24, 66], w: [34, 50], p: [62, 62], k: [76, 52], f: [80, 82] } },
    overhead: { bar: 'disc',
      a: { h: [50, 18], s: [50, 29], e: [60, 36], w: [55, 27], p: [50, 58], k: [50, 76], f: [50, 94] },
      b: { h: [50, 18], s: [50, 29], e: [54, 17], w: [51, 5], p: [50, 58], k: [50, 76], f: [50, 94] } },
    raise: {
      a: { h: [50, 16], s: [50, 27], e: [44, 40], w: [42, 52], e2: [56, 40], w2: [58, 52], p: [50, 56], k: [50, 75], f: [50, 94] },
      b: { h: [50, 16], s: [50, 27], e: [36, 28], w: [22, 28], e2: [64, 28], w2: [78, 28], p: [50, 56], k: [50, 75], f: [50, 94] } },
    squat: { bar: 'back',
      a: { h: [50, 18], s: [50, 29], e: [40, 34], w: [46, 27], p: [50, 58], k: [52, 76], f: [50, 94] },
      b: { h: [60, 40], s: [56, 50], e: [46, 55], w: [52, 48], p: [36, 70], k: [60, 76], f: [50, 94] } },
    pull: { fixed: '<path d="M20 8H80" class="eq"/>',
      a: { h: [50, 25], s: [50, 34], e: [40, 21], w: [40, 8], e2: [60, 21], w2: [60, 8], p: [50, 63], k: [50, 80], f: [50, 96] },
      b: { h: [50, 13], s: [50, 22], e: [33, 24], w: [40, 8], e2: [67, 24], w2: [60, 8], p: [50, 51], k: [50, 68], f: [50, 84] } },
    pushdown: { fixed: '<path d="M62 2v6" class="eq"/>', cable: true,
      a: { h: [48, 18], s: [48, 29], e: [50, 46], w: [62, 36], p: [48, 58], k: [48, 76], f: [48, 94] },
      b: { h: [48, 18], s: [48, 29], e: [50, 46], w: [54, 64], p: [48, 58], k: [48, 76], f: [48, 94] } },
    row: { bar: 'disc',
      a: { h: [24, 42], s: [33, 47], e: [33, 60], w: [33, 73], p: [56, 58], k: [52, 76], f: [54, 94] },
      b: { h: [24, 42], s: [33, 47], e: [48, 46], w: [42, 60], p: [56, 58], k: [52, 76], f: [54, 94] } },
    hinge: { bar: 'disc',
      a: { h: [50, 18], s: [50, 29], e: [50, 44], w: [50, 58], p: [50, 58], k: [50, 76], f: [50, 94] },
      b: { h: [26, 42], s: [33, 48], e: [33, 62], w: [34, 76], p: [56, 60], k: [52, 77], f: [50, 94] } },
    dips: { fixed: '<path d="M30 48H58" class="eq"/>',
      a: { h: [48, 14], s: [48, 25], e: [46, 36], w: [44, 48], p: [48, 54], k: [52, 70], f: [46, 84] },
      b: { h: [48, 28], s: [48, 39], e: [62, 40], w: [44, 48], p: [48, 68], k: [52, 84], f: [46, 96] } },
    curl: {
      a: { h: [50, 18], s: [50, 29], e: [52, 46], w: [53, 63], p: [50, 58], k: [50, 76], f: [50, 94] },
      b: { h: [50, 18], s: [50, 29], e: [52, 46], w: [46, 31], p: [50, 58], k: [50, 76], f: [50, 94] } }
  };
  const RULES = [
    [/dip/i, 'dips'], [/pull-?up|chin|pulldown/i, 'pull'], [/pushdown|triceps|skull|extension/i, 'pushdown'],
    [/curl/i, 'curl'], [/row|face pull/i, 'row'], [/deadlift|romanian|rdl|hinge|good morning/i, 'hinge'],
    [/squat|leg press|lunge|split|calf|leg curl/i, 'squat'], [/lateral|raise|fly|rear delt/i, 'raise'],
    [/bench|chest press|incline|decline|push-?up/i, 'bench'], [/press/i, 'overhead']
  ];
  const kind = (name) => (RULES.find(([re]) => re.test(name || '')) || [0, 'overhead'])[1];
  const reduced = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const pts = (j, arm2) => (arm2 ? [j.w2, j.e2, j.s] : [j.w, j.e, j.s, j.p, j.k, j.f]).map((p) => p.join(',')).join(' ');
  const D = '2.4s';
  const anim = (attr, a, b, extra = '') => `<animate attributeName="${attr}" values="${a};${b};${a}" dur="${D}" repeatCount="indefinite" calcMode="spline" keyTimes="0;.5;1" keySplines=".45 0 .55 1;.45 0 .55 1"${extra}/>`;

  function figure(name, { tag = true, still = false } = {}) {
    const k = kind(name), m = P[k], a = m.a, b = m.b, move = !still && !reduced();
    const line = (arm2) => `<polyline points="${pts(a, arm2)}" class="fg">${move ? anim('points', pts(a, arm2), pts(b, arm2)) : ''}</polyline>`;
    const dot = (key, r, cls) => `<circle cx="${a[key][0]}" cy="${a[key][1]}" r="${r}" class="${cls}">${move ? anim('cx', a[key][0], b[key][0]) + anim('cy', a[key][1], b[key][1]) : ''}</circle>`;
    const barAt = m.bar === 'back' ? 's' : 'w';
    const cable = m.cable ? `<line x1="62" y1="8" x2="${a.w[0]}" y2="${a.w[1]}" class="eq">${move ? anim('x2', a.w[0], b.w[0]) + anim('y2', a.w[1], b.w[1]) : ''}</line>` : '';
    return `<div class="oga${still ? ' is-still' : ''}" data-kind="${k}">
      <svg viewBox="0 0 100 100" role="img" aria-label="How to do ${name.replace(/"/g, '')}${move ? ', animated' : ''}">
        <path d="M8 96H92" class="gd"/>${m.fixed || ''}${cable}
        ${line(false)}${a.e2 ? line(true) : ''}${dot('h', 6.5, 'hd')}${m.bar ? dot(barAt, 4.5, 'br') : ''}</svg>
      ${tag ? '<span class="oga-tag">Animation</span>' : ''}</div>`;
  }
  return { figure, kind };
})();
