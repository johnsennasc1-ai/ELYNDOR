// Trilha e efeitos 100% gerados em tempo real (Web Audio). Sem arquivos externos.
const A = (() => {
  let ac, mg, mus, sfxG, theme = 'calm', step = 0, nextT = 0, bar = 0, muted = false;
  const SC = [0, 2, 3, 5, 7, 8, 10];
  const TH = {
    calm: { bpm: 84, prog: [0, -4, -2, -5], arp: [0, 2, 4, 7, 4, 2, 5, 3], ty: 'triangle', dr: 0, pad: 1 },
    night: { bpm: 104, prog: [0, 1, 0, -2], arp: [0, 3, 7, 3, 0, 3, 8, 3], ty: 'sawtooth', dr: 1, pad: 1 },
    battle: { bpm: 142, prog: [0, -4, -2, -5], arp: [0, 4, 7, 4, 0, 4, 9, 7], ty: 'square', dr: 2, pad: 0 },
    boss: { bpm: 152, prog: [0, 1, -2, 0], arp: [0, 3, 5, 7, 8, 7, 5, 3], ty: 'sawtooth', dr: 2, pad: 1 },
    sad: { bpm: 62, prog: [0, -4, -5, -2], arp: [0, 4, 7, 11], ty: 'sine', dr: 0, pad: 1 },
    dungeon: { bpm: 72, prog: [0, -1, 0, -3], arp: [0, 7, 3, 10], ty: 'sine', dr: 0, pad: 1 }
  };
  const fr = s => 110 * Math.pow(2, s / 12);
  const deg = d => SC[((d % 7) + 7) % 7] + 12 * Math.floor(d / 7);
  function init() {
    if (ac) { if (ac.state === 'suspended') ac.resume(); return; }
    ac = new (window.AudioContext || window.webkitAudioContext)();
    mg = ac.createGain(); mg.gain.value = .6; mg.connect(ac.destination);
    mus = ac.createGain(); mus.gain.value = .5; mus.connect(mg);
    sfxG = ac.createGain(); sfxG.gain.value = .9; sfxG.connect(mg);
    nextT = ac.currentTime + .1; setInterval(sched, 40);
  }
  function tone(f, d, ty, v, at, dest) {
    const o = ac.createOscillator(), a = ac.createGain(); o.type = ty; o.frequency.value = f;
    a.gain.setValueAtTime(0, at); a.gain.linearRampToValueAtTime(v, at + .015); a.gain.exponentialRampToValueAtTime(.0008, at + d);
    o.connect(a); a.connect(dest || mus); o.start(at); o.stop(at + d + .05);
  }
  function noise(d, v, fq, at, dest, type) {
    const n = Math.floor(ac.sampleRate * d), b = ac.createBuffer(1, n, ac.sampleRate), x = b.getChannelData(0);
    for (let i = 0; i < n; i++) x[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), a = ac.createGain(); f.type = type || 'lowpass'; f.frequency.value = fq; a.gain.value = v;
    s.buffer = b; s.connect(f); f.connect(a); a.connect(dest || sfxG); s.start(at || ac.currentTime);
  }
  function sched() {
    if (!ac || ac.state !== 'running' || muted) return;
    const T = TH[theme];
    while (nextT < ac.currentTime + .2) {
      const sd = 60 / T.bpm / 4, root = T.prog[bar % T.prog.length], i = step % 16;
      if (i === 0 && T.pad) [0, 3, 7].forEach(k => tone(fr(root + k), sd * 16, 'sine', .07, nextT));
      tone(fr(root + deg(T.arp[step % T.arp.length]) + 12), sd * 1.8, T.ty, T.ty === 'sine' ? .09 : .045, nextT);
      if (i % 4 === 0) tone(fr(root - 12), sd * 3, 'sawtooth', .07, nextT);
      if (T.dr) { if (i % 4 === 0) { tone(90, .15, 'sine', .22, nextT); } if (i % 8 === 4) noise(.12, .12, 2500, nextT, mus, 'highpass'); if (T.dr > 1 && i % 2 === 1) noise(.04, .05, 7000, nextT, mus, 'highpass'); }
      nextT += sd; step++; if (step % 16 === 0) bar++;
    }
  }
  const S = {
    hit: () => { noise(.18, .5, 900); tone(120, .14, 'sawtooth', .18, ac.currentTime, sfxG); },
    slash: () => noise(.16, .35, 3200, 0, 0, 'bandpass'),
    bow: () => { noise(.08, .3, 5000, 0, 0, 'highpass'); tone(300, .12, 'triangle', .1, ac.currentTime, sfxG); },
    fire: () => { noise(.5, .5, 1400); [0, 1, 2].forEach(i => tone(180 + i * 60, .3, 'sawtooth', .08, ac.currentTime + i * .05, sfxG)); },
    heal: () => [0, 1, 2, 3].forEach(i => tone(440 * Math.pow(1.26, i), .45, 'sine', .16, ac.currentTime + i * .09, sfxG)),
    wind: () => noise(.45, .35, 1800, 0, 0, 'bandpass'),
    shadow: () => { tone(80, .6, 'sawtooth', .16, ac.currentTime, sfxG); noise(.5, .3, 400); },
    quake: () => { noise(.7, .7, 260); tone(55, .7, 'sawtooth', .3, ac.currentTime, sfxG); },
    boom: () => { noise(.9, .8, 300); tone(60, .9, 'sawtooth', .3, ac.currentTime, sfxG); },
    hurt: () => { tone(200, .2, 'square', .12, ac.currentTime, sfxG); noise(.12, .3, 800); },
    die: () => [0, 1, 2].forEach(i => tone(300 - i * 70, .4, 'triangle', .14, ac.currentTime + i * .15, sfxG)),
    lvl: () => [0, 1, 2, 3, 4].forEach(i => tone(330 * Math.pow(1.26, i), .5, 'triangle', .2, ac.currentTime + i * .1, sfxG)),
    chest: () => [0, 1].forEach(i => tone(880 * Math.pow(1.5, i), .25, 'sine', .15, ac.currentTime + i * .08, sfxG)),
    coin: () => tone(1320, .1, 'square', .06, ac.currentTime, sfxG),
    step: () => noise(.05, .08, 500),
    ui: () => tone(660, .07, 'square', .06, ac.currentTime, sfxG),
    blip: () => tone(500 + Math.random() * 90, .035, 'square', .03, ac.currentTime, sfxG),
    roar: () => { tone(70, 1, 'sawtooth', .3, ac.currentTime, sfxG); noise(1, .5, 500); }
  };
  return {
    init, theme: t => { if (TH[t] && theme !== t) { theme = t; step = 0; bar = 0; } },
    sfx: k => { if (ac && !muted && S[k]) S[k](); },
    toggle: () => { muted = !muted; if (mg) mg.gain.value = muted ? 0 : .6; return muted; }
  };
})();
