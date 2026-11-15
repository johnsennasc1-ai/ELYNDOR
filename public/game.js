'use strict';
// ===== Elyndor — As Cinzas de Valdora: motor do jogo (ação em tempo real + salas online) =====
const $ = s => document.querySelector(s), cv = $('#c'), g = cv.getContext('2d'), W = 960, H = 540;
const BALANCE = { bossHP: 2600, enemyScale: .04, skillCost: 25, skillCd: 4 }; // ajuste aqui no balanceamento (Varkesh = 8.500 na versão final)
const XPT = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];
const touch = matchMedia('(pointer:coarse)').matches;
Object.assign(CHARS, {
  smith: { ...CHARS.tho, n: 'Ferreiro Orren', hair: '#6a3a1a', beard: '#6a3a1a', bigbeard: 0, short: 1, cloth: '#5a4a3a', trim: '#a0703a', w: 'hammer' },
  keep: { ...CHARS.dar, n: 'Taverneiro', shield: 0, cape: null, cloth: '#8a5a3a', trim: '#e8d8b0', hair: '#7a6a5a', w: 'none', bw: 1.2 },
  mor: { ...CHARS.lyra, n: 'Moradora', cloth: '#a06a8a', hair: '#4a3020', w: 'none' },
  mira: { ...CHARS.lyra, n: 'Mira', cloth: '#e8d8a0', trim: '#a0603a', hair: '#d8a060', short: .62, w: 'none', cape: null }
});
const S = { scene: 'title', hero: 'kael', name: '', room: 'valdora', id: Math.random().toString(36).slice(2, 8), xp: 0, lv: 1, gold: 0, quest: 0, talked: {}, chests: {}, skills: false, choice: '' };
let P = null, E = [], PR = [], FX = [], R = {}, cam = { x: 0, y: 0 }, shake = 0, T = 0, keys = {}, J = { x: 0, y: 0 }, held = { a: 0, s: 0 };
let cut = null, wave = null, objective = '', netOn = false, lastSend = 0, boss = null, dlgNext = null, dlgOn = false, typing = null, started = false;
const SCN = {
  village: { w: 1500, h: 900, col: [[0, 520, 700, 60], [800, 520, 1500, 60], [200, 120, 150, 100], [650, 100, 180, 110], [1100, 120, 150, 100], [200, 320, 130, 90], [745, 345, 60, 50], [0, 0, 1500, 10], [0, 0, 10, 900], [1490, 0, 10, 900], [0, 890, 1500, 10]] },
  d1: { w: 960, h: 540, col: [[300, 200, 40, 40], [620, 200, 40, 40], [300, 340, 40, 40], [620, 340, 40, 40]] },
  d2: { w: 960, h: 540, col: [[200, 250, 50, 50], [710, 250, 50, 50], [455, 150, 50, 50]] },
  boss: { w: 960, h: 540, col: [] }
};
const ET = {
  lobo: { n: 'Lobo corrompido', hp: 40, at: 8, sp: 108, xp: 12, r: 14, rng: 30 }, rast: { n: 'Rastejante sombrio', hp: 55, at: 10, sp: 80, xp: 18, r: 13, rng: 26 },
  saq: { n: 'Saqueador corrompido', hp: 75, at: 12, sp: 90, xp: 25, r: 14, rng: 30 }, cao: { n: 'Cão da névoa', hp: 85, at: 13, sp: 125, xp: 30, r: 15, rng: 30 },
  bes: { n: 'Besouro de pedra', hp: 140, at: 15, sp: 58, xp: 40, r: 18, rng: 32, def: 3 }, raiz: { n: 'Raiz devoradora', hp: 110, at: 12, sp: 0, xp: 40, r: 16, rng: 0 },
  esp: { n: 'Espectro antigo', hp: 100, at: 14, sp: 60, xp: 45, r: 14, rng: 0 }
};
const NPCS = [
  { id: 'auren', c: 'aur', n: 'Estudioso viajante', x: 835, y: 395, lines: () => S.quest < 3 ? ['"Engraçado como as pessoas passam a vida procurando respostas, sem perceber que algumas perguntas deveriam permanecer adormecidas."', '"Apenas um lugar tranquilo para descansar. Embora pareça que a tranquilidade esteja ficando cada vez mais rara."'] : ['"Vá com cuidado. Algumas portas, uma vez abertas, não se fecham."'], q: 1 },
  { id: 'ferr', c: 'smith', n: 'Ferreiro Orren', x: 300, y: 270, lines: () => ['Goblins levaram meu minério e agora essas criaturas... Que tempos! Tome estas moedas para as primeiras armas.'], q: 1, gold: 30 },
  { id: 'taver', c: 'keep', n: 'Taverneiro do Javali', x: 740, y: 235, lines: () => ['Dizem que há criaturas nas montanhas e que a água do rio anda estranha. Rumores de taverna... por enquanto.'], q: 1 },
  { id: 'mor', c: 'mor', n: 'Moradora', x: 520, y: 430, lines: () => ['Os animais estão inquietos esta semana. Algo ruim vem aí, eu sinto.'] },
  { id: 'mira', c: 'mira', n: 'Mira', x: 960, y: 450, lines: () => ['Você ouviu o sino da praça? Ele toca sozinho quando eu fico triste... Será que é bobagem?'] }
];
const CHESTS = [{ id: 'c1', x: 1200, y: 400 }, { id: 'c2', x: 300, y: 720 }];
const st = () => { const c = CHARS[S.hero]; return { mhp: c.hp + S.lv * 14, at: c.at + S.lv * 2.2, mmp: 40 + S.lv * 5 }; };
const rnd = (a, b) => a + Math.random() * (b - a), sfx = k => A.sfx(k);
const hash = (x, y) => { let h = x * 374761393 + y * 668265263; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; };
const log = (t, c) => { const l = $('#log'), d = document.createElement('div'); if (c) { const b = document.createElement('b'); b.textContent = c + ': '; d.appendChild(b); } d.appendChild(document.createTextNode(t)); l.appendChild(d); while (l.children.length > 6) l.firstChild.remove(); };
// ---------- DIÁLOGO ----------
function typeLine(tx, who, done, opts) {
  const dlg = $('#dlg'); dlg.style.display = 'block'; dlgOn = true; dlg.innerHTML = '<span class="nx">▸ continuar</span><b></b><p id="tt" style="margin:4px 0 0"></p><div class="opts"></div>';
  dlg.querySelector('b').textContent = who || ''; const el = $('#tt'); let i = 0; clearInterval(typing);
  const fin = () => { clearInterval(typing); typing = null; el.textContent = tx; if (opts) { dlg.querySelector('.nx').remove(); opts.forEach(o => { const b = document.createElement('button'); b.textContent = o[0]; b.onclick = e => { e.stopPropagation(); o[1](); }; dlg.querySelector('.opts').appendChild(b); }); dlgNext = null; } };
  typing = setInterval(() => { el.textContent = tx.slice(0, ++i); if (i % 3 === 0) sfx('blip'); if (i >= tx.length) fin(); }, 24);
  dlgNext = () => { if (typing) fin(); else { dlgNext = null; done && done(); } };
}
function hideDlg() { $('#dlg').style.display = 'none'; dlgOn = false; dlgNext = null; clearInterval(typing); typing = null; }
function say(lines, who, cb) { let i = 0; const nx = () => { if (i >= lines.length) { hideDlg(); cb && cb(); return; } typeLine(lines[i++], who, nx); }; nx(); }
$('#dlg').addEventListener('pointerdown', () => dlgNext && dlgNext());
// ---------- CUTSCENES ----------
function playCut(key, done) {
  const c = CUTS[key]; cut = { c, i: 0, t: 0, done }; A.theme(c.theme); held.a = held.s = 0;
  const show = () => { const s = c.slides[cut.i]; cut.t = 0; typeLine(s.tx, s.who, () => { cut.i++; if (cut.i >= c.slides.length) { hideDlg(); const d = cut.done; cut = null; d && d(); } else show(); }); };
  show();
}
function drawCut() {
  const s = cut.c.slides[cut.i], [a, b] = BG[s.bg || 'night'], t = cut.t, z = 1 + t * .018;
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2 - t * 2, -H / 2);
  for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,${160 + i % 80},70,${.5 * Math.abs(Math.sin(t * .9 + i))})`; g.fillRect((i * 97 + t * (14 + i % 5 * 8)) % W, H - ((i * 53 + t * (22 + i % 7 * 6)) % H), 2, 2); }
  g.fillStyle = '#000b'; g.fillRect(-40, 360, W + 80, 200);
  if (s.beast) { g.save(); g.fillStyle = '#07030a'; g.shadowColor = '#ff4422'; g.shadowBlur = 50; g.beginPath(); g.ellipse(700, 230, 190 + Math.sin(t) * 6, 150, 0, 0, 7); g.fill(); g.fillStyle = '#ff3322'; g.fillRect(630, 190, 24, 9); g.fillRect(730, 190, 24, 9); g.restore(); }
  (s.act || []).forEach((u, i) => drawChar(g, u.c, u.x, 420 + (i % 2) * 14, { d: 1, m: u.m, t: u.m === 'idle' ? 0 : t % 1.4, ph: t * 4, sil: u.sil, sc: (u.sc || 1) * 2.6 }));
  g.restore();
  if (s.flash) { g.fillStyle = `rgba(255,255,255,${Math.max(0, 1 - t * .5)})`; g.fillRect(0, 0, W, H); }
  if (s.title) { g.fillStyle = '#e8a33d'; g.textAlign = 'center'; g.font = 'bold 64px Georgia'; g.shadowColor = '#e8a33d'; g.shadowBlur = 24; g.fillText('ELYNDOR', W / 2, 190); g.font = '24px Georgia'; g.fillText('AS CINZAS DE VALDORA', W / 2, 230); g.shadowBlur = 0; g.textAlign = 'left'; }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, 46); g.fillRect(0, H - 46, W, 46);
}
// ---------- JOGADOR ----------
function newPlayer() { const s = st(); P = { x: 750, y: 470, d: 1, fx: 1, fy: 0, hp: s.mhp, mp: s.mmp, m: 'idle', mt: 0, ph: 0, atkCd: 0, skCd: 0, inv: 0, stun: 0, dead: false, dt: 0, r: 12, pend: null, stepT: 0 }; }
function setM(m) { if (P.m !== m) { P.m = m; P.mt = 0; } }
const canAct = () => !P.dead && P.stun <= 0 && !cut && !dlgOn && P.m !== 'hurt';
function aim() { let best = null, bd = 300; E.forEach(e => { if (e.dead) return; const d = Math.hypot(e.x - P.x, e.y - P.y); if (d < bd) { bd = d; best = e; } }); if (best) { const d = bd || 1; P.fx = (best.x - P.x) / d; P.fy = (best.y - P.y) / d; if (Math.abs(P.fx) > .05) P.d = P.fx > 0 ? 1 : -1; } }
function attack() {
  if (!canAct() || P.atkCd > 0) return; const c = CHARS[S.hero], s = st(); P.atkCd = .5; aim(); setM('atk'); netFx({ k: 'atk' });
  if (c.ranged) { sfx(c.w === 'bow' ? 'bow' : 'slash'); P.pend = { t: .22, fn: () => { shoot(P.x + P.d * 14, P.y - 26, P.fx, P.fy, c.el, s.at, 430, 'p', c.el); netFx({ k: 'shot', fx: P.fx, fy: P.fy, col: c.el }); } }; }
  else { sfx('slash'); P.pend = { t: .15, fn: () => melee(s.at, c.rng) }; }
}
function melee(dmg, r) {
  let hit = 0; FX.push({ k: 'slash', x: P.x + P.fx * 26, y: P.y - 20 + P.fy * 16, a: Math.atan2(P.fy, P.fx), t: 0, life: .22, col: CHARS[S.hero].el });
  E.forEach(e => { if (e.dead) return; const dx = e.x - P.x, dy = e.y - P.y, d = Math.hypot(dx, dy); if (d < r + e.r && (dx * P.fx + dy * P.fy) >= -.3 * d) { dmgE(e, dmg + rnd(0, 4), 'phys'); hit = 1; e.x += dx / (d || 1) * 8; e.y += dy / (d || 1) * 8; } });
  if (!hit) FX.push({ k: 'txt', x: P.x, y: P.y - 60, s: '', col: '#fff', t: 0, life: .1 });
}
function shoot(x, y, fx, fy, col, dmg, spd, from, elem, pierce) { PR.push({ x, y, vx: fx * spd, vy: fy * spd, col, dmg, life: 1.1, from, elem, pierce, hit: new Set(), big: pierce ? 1 : 0 }); }
function ring(x, y, r, col) { FX.push({ k: 'ring', x, y, r, col, t: 0, life: .55 }); for (let i = 0; i < 22; i++) { const a = rnd(0, 6.28), v = rnd(60, r * 2.2); FX.push({ k: 'sp', x, y: y - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .6, col, t: 0, life: rnd(.3, .7) }); } }
function skill() {
  if (!canAct() || P.skCd > 0) return; if (!S.skills) { log('Habilidades elementais ainda adormecidas...'); return; } if (P.mp < BALANCE.skillCost) { log('MP insuficiente.'); return; }
  P.mp -= BALANCE.skillCost; P.skCd = BALANCE.skillCd; aim(); setM('cast'); const s = st(), h = S.hero, c = CHARS[h]; netFx({ k: 'skill' });
  const fns = { kael: 'fire', lyra: 'heal', eld: 'wind', ser: 'shadow', dar: 'quake', tho: 'quake' };
  sfx(fns[h]); P.pend = { t: .3, fn: () => {
    if (h === 'kael') { ring(P.x, P.y, 100, c.el); E.forEach(e => !e.dead && Math.hypot(e.x - P.x, e.y - P.y) < 100 + e.r && dmgE(e, s.at * 2.2, 'fire')); }
    else if (h === 'lyra') { P.hp = Math.min(s.mhp, P.hp + s.mhp * .4); ring(P.x, P.y, 90, c.el); FX.push({ k: 'txt', x: P.x, y: P.y - 70, s: '+' + Math.round(s.mhp * .4), col: '#6f8', t: 0, life: 1 }); E.forEach(e => !e.dead && Math.hypot(e.x - P.x, e.y - P.y) < 70 && dmgE(e, s.at, 'water')); }
    else if (h === 'eld') { shoot(P.x, P.y - 24, P.fx, P.fy, c.el, s.at * 2.3, 560, 'p', 'wind', 1); netFx({ k: 'shot', fx: P.fx, fy: P.fy, col: c.el }); }
    else if (h === 'ser') { ring(P.x, P.y, 135, c.el); E.forEach(e => { if (!e.dead && Math.hypot(e.x - P.x, e.y - P.y) < 135) { dmgE(e, s.at * 1.5, 'dark'); e.stun = e.boss ? .6 : 2.6; } }); }
    else { const r = h === 'dar' ? 110 : 125; ring(P.x, P.y, r, c.el); shake = .6; E.forEach(e => { if (!e.dead && Math.hypot(e.x - P.x, e.y - P.y) < r) { dmgE(e, s.at * (h === 'dar' ? 1.9 : 2.3), 'earth'); if (h === 'dar') e.stun = .8; } }); }
  } };
}
function hurtP(d) {
  if (P.inv > 0 || P.dead) return; d = Math.round(d * (.9 + Math.random() * .2)); P.hp -= d; P.inv = .7; P.m = 'hurt'; P.mt = 0; sfx('hurt'); shake = .3;
  FX.push({ k: 'txt', x: P.x, y: P.y - 80, s: '-' + d, col: '#f55', t: 0, life: .9 });
  if (P.hp <= 0) { P.dead = true; P.dt = 0; P.m = 'dead'; P.mt = 0; sfx('die'); }
}
function gain(x) {
  S.xp += x; FX.push({ k: 'txt', x: P.x, y: P.y - 84, s: '+' + x + ' XP', col: '#e8c96a', t: 0, life: 1 });
  while (S.lv < 10 && S.xp >= XPT[S.lv]) { S.lv++; const s = st(); P.hp = s.mhp; P.mp = s.mmp; sfx('lvl'); ring(P.x, P.y, 80, '#ffd86a'); log('Nível ' + S.lv + '!', 'Sistema'); }
}
function dmgE(e, d, elem) {
  if (e.dead) return; d = Math.max(1, Math.round(d - (e.def || 0))); if (e.boss && elem === 'fire') d = Math.round(d * 1.25); e.hp -= d; e.hit = .12;
  FX.push({ k: 'txt', x: e.x + rnd(-8, 8), y: e.y - (e.boss ? 150 : 40), s: String(d), col: '#fff', t: 0, life: .8 }); sfx('hit');
  if (e.hp <= 0) { e.dead = true; e.dt = 0; if (e.boss) { sfx('boom'); shake = 1.2; bossDead(); } else { gain(ET[e.type].xp); S.gold += 2 + (Math.random() * 6 | 0); } }
}
function spawnE(type, x, y) { const t = ET[type], hp = Math.round(t.hp * (1 + BALANCE.enemyScale * S.lv)); E.push({ type, x, y, hp, mhp: hp, at: t.at, sp: t.sp, r: t.r, rng: t.rng, def: t.def || 0, d: -1, t: Math.random() * 5, ph: 0, cd: rnd(.5, 1.5), wind: 0, stun: 0, hit: 0, dead: false, dt: 0 }); }
function startWave(types, cb) { const sc = SCN[S.scene]; types.forEach((t, i) => { const a = i / types.length * 6.28 + .5; spawnE(t, Math.max(40, Math.min(sc.w - 40, P.x + Math.cos(a) * 260)), Math.max(60, Math.min(sc.h - 40, P.y + Math.sin(a) * 200))); }); wave = { cb }; }
// ---------- IA ----------
function aiE(e, dt) {
  e.t += dt; e.hit -= dt; if (e.dead) { e.dt += dt; return; } if (e.stun > 0) { e.stun -= dt; return; }
  if (e.boss) return aiBoss(e, dt);
  const dx = P.x - e.x, dy = P.y - e.y, dist = Math.hypot(dx, dy) || 1; if (Math.abs(dx) > 4) e.d = dx > 0 ? 1 : -1; if (P.dead) return;
  if (e.type === 'raiz') { e.cd -= dt; if (e.cd <= 0 && dist < 340) { e.cd = 3.2; e.tele = { x: P.x, y: P.y, t: .9, r: 46, root: 1 }; } }
  else if (e.type === 'esp') { e.cd -= dt; const w = dist < 170 ? -1 : dist > 250 ? 1 : 0; e.x += dx / dist * e.sp * dt * w; e.y += dy / dist * e.sp * dt * w; if (e.cd <= 0 && dist < 380) { e.cd = 2.2; shoot(e.x, e.y - 20, dx / dist, dy / dist, '#8af', e.at, 210, 'e'); P.mp = Math.max(0, P.mp - 4); } }
  else if (e.wind > 0) { e.wind -= dt; if (e.wind <= 0) { if (Math.hypot(P.x - e.x, P.y - e.y) < e.rng + P.r + 10) hurtP(e.at); e.cd = 1.1; } }
  else { e.cd -= dt; if (dist > e.rng * .8) { e.x += dx / dist * e.sp * dt; e.y += dy / dist * e.sp * dt; e.ph += dt * 10; } else if (e.cd <= 0) e.wind = .45; }
  if (e.tele) { e.tele.t -= dt; if (e.tele.t <= 0) { if (Math.hypot(P.x - e.tele.x, P.y - e.tele.y) < e.tele.r + 10) { hurtP(e.at); if (e.tele.root) P.stun = 1; } ring(e.tele.x, e.tele.y, e.tele.r, '#4a8a3a'); e.tele = null; } }
}
function aiBoss(e, dt) {
  const p2 = e.hp < e.mhp * .4; if (p2 && !e.p2) { e.p2 = 1; sfx('roar'); shake = 1; log('Varkesh abre o Núcleo Corrompido!', 'Aviso'); }
  const dx = P.x - e.x, dy = P.y - e.y, dist = Math.hypot(dx, dy) || 1; if (Math.abs(dx) > 4) e.d = dx > 0 ? 1 : -1; if (P.dead) return;
  e.cd -= dt;
  if (e.atk) { e.atk.t -= dt; if (e.atk.t <= 0) { const a = e.atk; e.atk = null; e.cd = p2 ? 1 : 1.9;
    if (a.k === 'slam') { ring(a.x, a.y, a.r, '#c07030'); sfx('quake'); shake = .8; if (Math.hypot(P.x - a.x, P.y - a.y) < a.r) hurtP(e.at * 1.2); }
    else if (a.k === 'roots') { a.pts.forEach(q => { ring(q.x, q.y, 50, '#4a8a3a'); if (Math.hypot(P.x - q.x, P.y - q.y) < 56) { hurtP(e.at * .7); P.stun = 1.1; } }); sfx('quake'); }
    else { const n = p2 ? 12 : 7; for (let i = 0; i < n; i++) { const an = i / n * 6.28 + e.t; shoot(e.x, e.y - 60, Math.cos(an), Math.sin(an), p2 ? '#ff7a3a' : '#9a7', e.at * .6, 200, 'e'); } sfx('boom'); } } }
  else { if (dist > 120) { const sp = p2 ? 78 : 50; e.x += dx / dist * sp * dt; e.y += dy / dist * sp * dt; }
    if (e.cd <= 0) { const r = Math.random(); if (r < .4) e.atk = { k: 'slam', t: p2 ? .7 : 1, x: P.x, y: P.y, r: 120 }; else if (r < .75) e.atk = { k: 'roots', t: 1.1, pts: [0, 1, 2].map(i => ({ x: P.x + Math.cos(i * 2.1 + e.t) * (i ? 90 : 0), y: P.y + Math.sin(i * 2.1 + e.t) * (i ? 90 : 0) })) }; else e.atk = { k: 'burst', t: .7 }; sfx('roar'); } }
}
function updPlayer(dt) {
  P.mt += dt; P.atkCd -= dt; P.skCd -= dt; P.inv -= dt; P.stun -= dt; P.mp = Math.min(st().mmp, P.mp + dt * 4);
  if (P.dead) { P.dt += dt; if (P.dt > 2.4) { P.dead = false; P.hp = st().mhp / 2; P.inv = 2; P.m = 'idle'; if (S.scene === 'village') { P.x = 750; P.y = 470; } } return; }
  if (P.pend) { P.pend.t -= dt; if (P.pend.t <= 0) { const f = P.pend.fn; P.pend = null; f(); } }
  if (held.a || keys['j'] || keys[' ']) attack(); if (held.s || keys['k']) skill();
  const locked = P.stun > 0 || (P.m === 'atk' && P.mt < .4) || (P.m === 'cast' && P.mt < .6) || (P.m === 'hurt' && P.mt < .25);
  if (!locked && (P.m === 'atk' || P.m === 'cast' || P.m === 'hurt')) setM('idle');
  let ix = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0) + J.x, iy = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0) + J.y, l = Math.hypot(ix, iy); if (l > 1) { ix /= l; iy /= l; l = 1; }
  if (!locked && !dlgOn && !cut) {
    if (l > .15) { const sp = CHARS[S.hero].sp * (l > .75 ? 1.2 : .8) * dt, sc = SCN[S.scene]; let nx = P.x + ix * sp, ny = P.y + iy * sp;
      const hit = (x, y) => sc.col.some(r => x > r[0] - 6 && x < r[0] + r[2] + 6 && y > r[1] && y < r[1] + r[3] + 10);
      if (S.scene === 'village' && nx > 695 && nx < 805 && ny > 505 && ny < 600) { /* ponte livre */ } else if (hit(nx, P.y)) nx = P.x; if (!(S.scene === 'village' && P.x > 695 && P.x < 805 && ny > 505 && ny < 600) && hit(nx, ny)) ny = P.y;
      P.x = Math.max(20, Math.min(sc.w - 20, nx)); P.y = Math.max(50, Math.min(sc.h - 14, ny)); P.fx = ix / (l || 1); P.fy = iy / (l || 1); if (Math.abs(ix) > .1) P.d = ix > 0 ? 1 : -1;
      setM(l > .75 ? 'run' : 'walk'); P.ph += dt * (l > .75 ? 15 : 10); P.stepT -= dt; if (P.stepT < 0) { P.stepT = .28; sfx('step'); }
    } else if (P.m === 'walk' || P.m === 'run') setM('idle');
  }
}
function updPR(dt) {
  PR.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (Math.random() < .7) FX.push({ k: 'sp', x: p.x, y: p.y, vx: rnd(-20, 20), vy: rnd(-20, 20), col: p.col, t: 0, life: .25 });
    if (p.from === 'p') E.forEach(e => { if (!e.dead && !p.hit.has(e) && Math.hypot(e.x - p.x, e.y - 20 - p.y) < e.r + 14 + (e.boss ? 40 : 0)) { dmgE(e, p.dmg + rnd(0, 3), p.elem === 'wind' ? 'wind' : 'phys'); p.hit.add(e); if (!p.pierce) p.life = 0; } });
    else if (p.from === 'e' && !P.dead && Math.hypot(P.x - p.x, P.y - 24 - p.y) < 18) { hurtP(p.dmg); p.life = 0; } });
  PR = PR.filter(p => p.life > 0);
}
function update(dt) {
  T += dt; shake = Math.max(0, shake - dt * 2);
  Object.values(R).forEach(r => { const dx = r.tx - r.x, dy = r.ty - r.y, d = Math.hypot(dx, dy); r.x += dx * Math.min(1, dt * 10); r.y += dy * Math.min(1, dt * 10); r.ph += d * .07; r.t += dt; if (r.say) { r.sayT -= dt; if (r.sayT < 0) r.say = null; } if (r.m === 'walk' || r.m === 'run') { if (d < 1) r.m = 'idle'; } });
  if (cut) { cut.t += dt; return; }
  if (S.scene === 'title' || !P) return;
  if (!dlgOn) { updPlayer(dt); E.forEach(e => aiE(e, dt)); updPR(dt); }
  FX.forEach(f => { f.t += dt; if (f.k === 'sp') { f.x += f.vx * dt; f.y += f.vy * dt; } }); FX = FX.filter(f => f.t < f.life); E = E.filter(e => !(e.dead && e.dt > 1));
  boss = E.find(e => e.boss && !e.dead) || null;
  if (wave && E.every(e => e.dead)) { const cb = wave.cb; wave = null; setTimeout(cb, 700); }
  zones(); const now = performance.now(); if (netOn && now - lastSend > 100) { lastSend = now; sendN('p', { x: Math.round(P.x), y: Math.round(P.y), d: P.d, m: P.m, sc: S.scene }); }
}
// ---------- HISTÓRIA ----------
function loadScene(n, x, y) { S.scene = n; P.x = x; P.y = y; E = []; PR = []; FX = []; wave = null; A.theme(n === 'village' ? 'calm' : n === 'boss' ? 'boss' : 'dungeon'); }
function setObj(t) { objective = t; }
function zones() {
  if (S.scene === 'village' && S.quest === 3 && P.y > 800 && Math.abs(P.x - 750) < 70) { S.quest = 4; loadScene('d1', 480, 490); setObj('Derrote as criaturas do Santuário das Raízes'); say(['Entrada subterrânea: criaturas pequenas e armadilhas. As raízes se movem...'], 'Santuário das Raízes', () => startWave(['bes', 'raiz', 'saq', 'saq'], () => { S.doorOpen = 1; setObj('Siga pela porta ao norte'); A.theme('dungeon'); })); A.theme('battle'); }
  if (S.scene === 'd1' && S.doorOpen && P.y < 70 && Math.abs(P.x - 480) < 60) { S.doorOpen = 0; loadScene('d2', 480, 490); say(['Galeria das Raízes: runas flutuam no ar. Monstros maiores bloqueiam o caminho.'], 'Santuário das Raízes', () => startWave(['esp', 'raiz', 'bes', 'esp'], () => { S.doorOpen = 1; setObj('Siga pela porta ao norte'); A.theme('dungeon'); })); A.theme('battle'); }
  if (S.scene === 'd2' && S.doorOpen && P.y < 70 && Math.abs(P.x - 480) < 60) { S.doorOpen = 0; loadScene('boss', 480, 490); setObj('Derrote Varkesh, o Guardião Corrompido'); P.inv = 1; playCut('boss', () => { const hp = BALANCE.bossHP; E.push({ boss: 1, type: 'boss', x: 480, y: 170, hp, mhp: hp, r: 60, d: 1, t: 0, cd: 2, stun: 0, hit: 0, dead: false, dt: 0, at: 22, def: 2, ph: 0 }); A.theme('boss'); }); }
}
function bossDead() {
  setObj(''); A.theme('sad');
  setTimeout(() => { typeLine('No santuário há dois objetos: um cristal que purifica a água de Valdora e um fragmento de metal antigo que revela a origem da corrupção. O que seu grupo faz?', 'A escolha', null, [['Preservar o cristal', () => finish('cristal')], ['Levar o fragmento', () => finish('frag')]]); }, 2600);
}
function finish(c) {
  S.choice = c; hideDlg(); gain(500); S.gold += 120;
  const w = CUTS.ending.slides[0]; w.tx = '"Os herdeiros... voltaram... Mas vocês não sabem o que estão carregando..." O núcleo se apaga. ' + (c === 'cristal' ? 'O cristal purifica o rio de Valdora; os moradores respiram aliviados.' : 'O fragmento pulsa fraco. Quem estiver por trás dos experimentos terá de se explicar.');
  playCut('ending', () => { $('#end').style.display = 'flex'; $('#end').innerHTML = `<h1>FIM DO ARCO I</h1><h2>AS CINZAS DE VALDORA</h2><p>Nível ${S.lv} · ${S.xp} XP · ${S.gold} moedas<br>Escolha: ${c === 'cristal' ? 'cristal' : 'fragmento'}<br>Próximo: Arco II — A Cidadela Norte</p><button class="big" onclick="location.reload()">Jogar de novo</button>`; });
}
function interact() {
  if (!canAct() || S.scene !== 'village') return;
  const ch = CHESTS.find(c => !S.chests[c.id] && Math.hypot(c.x - P.x, c.y - P.y) < 50); if (ch) { S.chests[ch.id] = 1; sfx('chest'); S.gold += 25; gain(80); log('Baú: +25 moedas e +80 XP', 'Sistema'); return; }
  const n = NPCS.find(n => Math.hypot(n.x - P.x, n.y - P.y) < 62); if (!n) return;
  say(n.lines(), n.n, () => {
    if (n.q && !S.talked[n.id]) { S.talked[n.id] = 1; if (n.gold) { S.gold += n.gold; sfx('coin'); } }
    if (S.quest === 0 && S.talked.auren && S.talked.ferr && S.talked.taver) { S.quest = 1; setObj(''); setTimeout(night, 600); }
    else if (S.quest === 0) setObj('Converse com os moradores (' + Object.keys(S.talked).length + '/3): Auren, Ferreiro, Taverneiro');
  });
}
function night() {
  playCut('night', () => { S.quest = 2; setObj('Defenda Valdora dos Corrompidos!'); A.theme('battle'); startWave(['lobo', 'rast', 'cao', 'lobo'], () => { S.quest = 2.5; playCut('awaken', () => { S.skills = true; S.quest = 3; setObj('Vá à ponte antiga e desça às ruínas (sul do rio). Habilidade: K / ✦'); A.theme('calm'); const s = st(); P.hp = s.mhp; P.mp = s.mmp; }); }); });
}
// ---------- REDE ----------
function connect() {
  try {
    const q = `room=${encodeURIComponent(S.room)}&id=${S.id}&name=${encodeURIComponent(S.name)}&hero=${S.hero}`, es = new EventSource('/api/join?' + q);
    es.onopen = () => { netOn = true; $('#net').textContent = '🟢 sala ' + S.room; }; es.onerror = () => { netOn = false; $('#net').textContent = '🔴 reconectando…'; };
    es.addEventListener('hello', e => JSON.parse(e.data).players.forEach(p => addR(p))); es.addEventListener('join', e => { const p = JSON.parse(e.data); addR(p); log(p.name + ' entrou na sala.', 'Sala'); });
    es.addEventListener('leave', e => { const p = JSON.parse(e.data); if (R[p.id]) { log(R[p.id].name + ' saiu.', 'Sala'); delete R[p.id]; } });
    es.addEventListener('msg', e => { const m = JSON.parse(e.data), r = R[m.id] || addR({ id: m.id, name: m.name, hero: 'kael' }), d = m.data || {};
      if (m.type === 'p') { r.tx = d.x; r.ty = d.y; r.d = d.d || 1; if (d.m !== r.m) { r.m = d.m; r.t = 0; } r.sc = d.sc; }
      else if (m.type === 'chat') { r.say = d.t; r.sayT = 5; log(d.t, r.name); }
      else if (m.type === 'fx' && r.sc === S.scene) { if (d.k === 'skill') ring(r.x, r.y, 90, CHARS[r.hero].el); if (d.k === 'shot') PR.push({ x: r.x, y: r.y - 26, vx: d.fx * 430, vy: d.fy * 430, col: d.col, life: 1, from: 'v', hit: new Set() }); } });
  } catch (e) { $('#net').textContent = 'offline'; }
}
function addR(p) { return R[p.id] = { id: p.id, name: p.name, hero: CHARS[p.hero] ? p.hero : 'kael', x: p.x || 750, y: p.y || 450, tx: p.x || 750, ty: p.y || 450, d: 1, m: 'idle', t: 0, ph: 0, sc: 'village' }; }
function sendN(type, data) { if (!netOn) return; fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room: S.room, id: S.id, type, data }), keepalive: true }).catch(() => { }); }
const netFx = d => sendN('fx', d);
// ---------- DESENHO ----------
function drawVillage() {
  const x0 = Math.floor(cam.x / 32), y0 = Math.floor(cam.y / 32);
  for (let ty = y0; ty < y0 + 18; ty++) for (let tx = x0; tx < x0 + 31; tx++) { const h = hash(tx, ty); g.fillStyle = h < .5 ? '#376e3a' : h < .85 ? '#3b7640' : '#2f6234'; g.fillRect(tx * 32, ty * 32, 33, 33); if (h > .9) { g.fillStyle = '#5a9a4a'; g.fillRect(tx * 32 + 8, ty * 32 + 10, 2, 6); g.fillRect(tx * 32 + 14, ty * 32 + 12, 2, 5); } }
  g.fillStyle = '#9c8458'; g.fillRect(725, 0, 50, 900); g.fillRect(0, 395, 1500, 40); g.beginPath(); g.arc(775, 365, 110, 0, 7); g.fill(); g.fillStyle = '#85704a'; g.beginPath(); g.arc(775, 365, 80, 0, 7); g.fill();
  g.fillStyle = '#2a64a8'; g.fillRect(0, 520, 1500, 60); for (let i = 0; i < 20; i++) { g.fillStyle = '#5a9ad8'; g.fillRect((i * 90 + T * 25) % 1500, 530 + (i % 4) * 12, 36, 3); }
  g.fillStyle = '#7a5a36'; g.fillRect(700, 510, 100, 70); g.fillStyle = '#4a361e'; for (let i = 0; i < 10; i++) g.fillRect(702 + i * 10, 510, 2, 70); g.fillRect(698, 508, 4, 74); g.fillRect(798, 508, 4, 74);
  [[200, 120, 150, 100, 'Ferreiro', '#6a2a22'], [650, 100, 180, 110, 'Taverna do Javali', '#4a3a6a'], [1100, 120, 150, 100, 'Casa de cura', '#2a5a4a'], [200, 320, 130, 90, 'Casa de Kael', '#6a4a22']].forEach(([x, y, w, h, n, rc]) => {
    g.fillStyle = '#0003'; g.fillRect(x + 6, y + h - 4, w, 12); g.fillStyle = '#b08458'; g.fillRect(x, y, w, h); g.fillStyle = '#8a6438'; g.fillRect(x, y + h - 12, w, 12); g.fillStyle = '#ffd88a'; g.fillRect(x + w * .2, y + h * .3, 18, 18); g.fillRect(x + w * .6, y + h * .3, 18, 18); g.fillStyle = '#3a2412'; g.fillRect(x + w / 2 - 10, y + h - 34, 20, 34);
    g.fillStyle = rc; g.beginPath(); g.moveTo(x - 12, y + 6); g.lineTo(x + w / 2, y - 40); g.lineTo(x + w + 12, y + 6); g.fill(); g.fillStyle = '#fff'; g.font = '12px Georgia'; g.textAlign = 'center'; g.fillText(n, x + w / 2, y - 46); g.textAlign = 'left'; });
  g.fillStyle = '#8a929c'; g.beginPath(); g.arc(775, 370, 30, 0, 7); g.fill(); g.fillStyle = '#4aa0e0'; g.beginPath(); g.arc(775, 370, 22 + Math.sin(T * 3) * 1.5, 0, 7); g.fill();
  g.fillStyle = '#5a5a66'; g.fillRect(700, 0, 20, 40); g.fillRect(780, 0, 20, 40); g.fillRect(700, 0, 100, 14);
  if (S.quest >= 3) { g.fillStyle = `rgba(232,163,61,${.3 + .2 * Math.sin(T * 4)})`; g.beginPath(); g.arc(750, 840, 46, 0, 7); g.fill(); g.fillStyle = '#e8a33d'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText('▼ Ruínas subterrâneas', 750, 800); g.textAlign = 'left'; }
  CHESTS.forEach(c => { if (!S.chests[c.id]) { g.fillStyle = '#c8902a'; g.fillRect(c.x - 12, c.y - 10, 24, 16); g.fillStyle = '#6a4a14'; g.fillRect(c.x - 12, c.y - 10, 24, 5); g.fillStyle = '#fff9'; g.fillRect(c.x - 2, c.y - 4, 4, 5); } });
  for (let i = 0; i < 70; i++) { const tx = hash(i, 7) * 1500, ty = hash(i, 9) * 900; if ((tx > 680 && tx < 820) || ty > 505 && ty < 600 || SCN.village.col.some(r => tx > r[0] - 30 && tx < r[0] + r[2] + 30 && ty > r[1] - 40 && ty < r[1] + r[3] + 30) || Math.abs(ty - 415) < 40 || Math.hypot(tx - 775, ty - 365) < 130) continue; if (tx < cam.x - 40 || tx > cam.x + W + 40 || ty < cam.y - 60 || ty > cam.y + H + 60) continue; tree(tx, ty, i); }
}
const trees = [];
function tree(x, y, i) { g.fillStyle = '#0003'; g.beginPath(); g.ellipse(x, y + 4, 22, 8, 0, 0, 7); g.fill(); g.fillStyle = '#5a3a1e'; g.fillRect(x - 5, y - 28, 10, 32); const s = 1 + hash(i, 3) * .4; g.fillStyle = '#1f5a2a'; g.beginPath(); g.arc(x, y - 44, 26 * s, 0, 7); g.fill(); g.fillStyle = '#2a7a38'; g.beginPath(); g.arc(x - 8, y - 50, 16 * s, 0, 7); g.fill(); }
function drawDungeon() {
  g.fillStyle = '#10171a'; g.fillRect(0, 0, W, H);
  for (let ty = 0; ty < 17; ty++) for (let tx = 0; tx < 30; tx++) { const h = hash(tx, ty + (S.scene === 'd2' ? 40 : S.scene === 'boss' ? 80 : 0)); g.fillStyle = h < .5 ? '#1c2a2c' : '#22343a'; g.fillRect(tx * 32 + 1, ty * 32 + 1, 30, 30); }
  g.strokeStyle = '#2f6a3a'; g.lineWidth = 6; for (let i = 0; i < 8; i++) { g.beginPath(); g.moveTo(i * 130, 0); g.quadraticCurveTo(i * 130 + 30 * Math.sin(T + i), 40, i * 130 + 10, 90 + hash(i, 1) * 60); g.stroke(); }
  const gl = .35 + .2 * Math.sin(T * 2); g.strokeStyle = `rgba(110,220,255,${gl})`; g.lineWidth = 2; g.beginPath(); g.arc(480, 290, 90 + (S.scene === 'boss' ? 60 : 0), 0, 7); g.stroke(); for (let i = 0; i < 6; i++) { const a = i * 1.047 + T * .2; g.fillStyle = `rgba(110,220,255,${gl})`; g.fillRect(480 + Math.cos(a) * 90 - 4, 290 + Math.sin(a) * 90 - 4, 8, 8); }
  SCN[S.scene].col.forEach(r => { g.fillStyle = '#3a4a50'; g.fillRect(r[0], r[1], r[2], r[3]); g.fillStyle = '#5a6a70'; g.fillRect(r[0], r[1], r[2], 8); });
  if (S.doorOpen) { g.fillStyle = `rgba(255,230,150,${.3 + .2 * Math.sin(T * 5)})`; g.fillRect(430, 0, 100, 60); g.fillStyle = '#e8a33d'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText('▲ avançar', 480, 80); g.textAlign = 'left'; } else if (S.scene !== 'boss') { g.fillStyle = '#2a3236'; g.fillRect(430, 0, 100, 40); }
  g.fillStyle = '#0006'; g.fillRect(0, 0, 14, H); g.fillRect(W - 14, 0, 14, H);
}
function drawE(e) {
  const al = e.dead ? Math.max(0, 1 - e.dt * 1.1) : 1; g.save(); g.translate(e.x, e.y); g.globalAlpha = al; const fl = e.hit > 0, C = c => fl ? '#fff' : c, bob = Math.sin(e.t * 8) * 1.5, ph = Math.sin(e.ph * 1.2) * 5;
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 0, (e.boss ? 70 : e.r + 4), e.boss ? 16 : 6, 0, 0, 7); g.fill(); g.scale(e.d, 1);
  const ty = e.type;
  if (ty === 'lobo' || ty === 'cao') { const col = ty === 'lobo' ? '#4c4c5a' : '#667'; g.strokeStyle = C('#2a2a34'); g.lineWidth = 4; [[-10, ph], [-4, -ph], [8, ph], [13, -ph]].forEach(([lx, o]) => { g.beginPath(); g.moveTo(lx, -10); g.lineTo(lx + o, 0); g.stroke(); }); g.fillStyle = C(col); g.beginPath(); g.ellipse(0, -14 + bob, 17, 9, 0, 0, 7); g.fill(); g.beginPath(); g.arc(16, -19 + bob, 7, 0, 7); g.fill(); g.beginPath(); g.moveTo(14, -25 + bob); g.lineTo(17, -33 + bob); g.lineTo(20, -25 + bob); g.fill(); g.beginPath(); g.moveTo(-16, -16); g.quadraticCurveTo(-26, -24 + bob * 2, -24, -10); g.stroke(); g.fillStyle = '#ff3322'; g.fillRect(19, -21 + bob, 3, 3); if (ty === 'cao') { g.fillStyle = 'rgba(180,190,220,.35)'; g.beginPath(); g.arc(0, -14, 22 + Math.sin(e.t * 3) * 3, 0, 7); g.fill(); } }
  else if (ty === 'rast') { g.strokeStyle = C('#1a1024'); g.lineWidth = 2.5; for (let i = 0; i < 6; i++) { const a = -.4 + i * .5 + Math.sin(e.t * 9 + i) * .15; g.beginPath(); g.moveTo(0, -10); g.lineTo(Math.cos(a + (i < 3 ? 3.1 : 0)) * 16, -10 + Math.sin(a) * 12 + 8); g.stroke(); } g.fillStyle = C('#2e1e3c'); g.beginPath(); g.ellipse(0, -10 + bob, 13, 8, 0, 0, 7); g.fill(); g.fillStyle = '#c040ff'; g.fillRect(6, -13 + bob, 3, 3); g.fillRect(2, -13 + bob, 3, 3); }
  else if (ty === 'saq') { g.fillStyle = C('#3a2a2a'); g.fillRect(-7, -28, 14, 22); g.fillStyle = C('#241818'); g.beginPath(); g.arc(0, -33 + bob, 8, Math.PI, 0); g.lineTo(8, -28); g.lineTo(-8, -28); g.fill(); g.fillStyle = '#ff5533'; g.fillRect(2, -31 + bob, 3, 3); g.strokeStyle = C('#aaa'); g.lineWidth = 3; g.beginPath(); g.moveTo(8, -18); g.lineTo(e.wind > 0 ? 24 : 18, e.wind > 0 ? -34 : -10); g.stroke(); g.fillStyle = C('#2a1a1a'); g.fillRect(-6, -8, 4, 8 + ph / 2); g.fillRect(2, -8, 4, 8 - ph / 2); }
  else if (ty === 'bes') { g.strokeStyle = C('#4a4640'); g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-10 + i * 10, -8); g.lineTo(-14 + i * 12 + ph / 2, 2); g.stroke(); } g.fillStyle = C('#807a70'); g.beginPath(); g.ellipse(0, -14, 22, 16, 0, Math.PI, 0); g.fill(); g.fillStyle = C('#5a554e'); g.fillRect(-22, -14, 44, 6); g.fillStyle = C('#a89e88'); g.beginPath(); g.moveTo(18, -16); g.lineTo(32, -22); g.lineTo(20, -8); g.fill(); g.fillStyle = '#ffa030'; g.fillRect(16, -14, 3, 3); }
  else if (ty === 'raiz') { g.strokeStyle = C('#3a2a14'); g.lineWidth = 5; for (let i = 0; i < 6; i++) { const a = -2.6 + i * .5; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(Math.cos(a) * 14 + Math.sin(e.t * 2 + i) * 8, -20 + Math.sin(a) * 10, Math.cos(a) * 26 + Math.sin(e.t * 3 + i) * 6, -36 - Math.abs(Math.sin(a)) * 16); g.stroke(); } g.fillStyle = C('#2a5a2a'); g.beginPath(); g.arc(0, -8, 10, 0, 7); g.fill(); g.fillStyle = '#e8f060'; g.fillRect(-3, -10, 2, 3); g.fillRect(2, -10, 2, 3); }
  else if (ty === 'esp') { g.globalAlpha = al * .75; g.fillStyle = C('#9ac0ff'); g.beginPath(); g.moveTo(-13, -8 + bob); g.quadraticCurveTo(-14, -42, 0, -44); g.quadraticCurveTo(14, -42, 13, -8 + bob); for (let i = 0; i < 5; i++) g.lineTo(13 - i * 6.5, -8 + bob + (i % 2 ? 6 : -2) + Math.sin(e.t * 6 + i) * 2); g.fill(); g.fillStyle = '#103070'; g.fillRect(-6, -32, 4, 6); g.fillRect(2, -32, 4, 6); }
  else if (e.boss) { const sw = Math.sin(e.t * 2) * 6; g.fillStyle = C('#3a3a30'); g.fillRect(-45, -50, 26, 50); g.fillRect(19, -50, 26, 50); g.fillStyle = C('#4a5a3a'); g.beginPath(); g.ellipse(0, -90 + bob, 52, 62, 0, 0, 7); g.fill(); g.fillStyle = C('#3a4a2e'); g.fillRect(-72, -120 + sw, 22, 70); g.fillRect(50, -120 - sw, 22, 70); g.fillStyle = C('#5a6a46'); g.beginPath(); g.arc(0, -156 + bob, 26, 0, 7); g.fill(); g.fillStyle = e.p2 ? '#ff6a30' : '#a0e060'; g.fillRect(-12, -160 + bob, 7, 6); g.fillRect(6, -160 + bob, 7, 6); const cr = e.p2 ? 20 + Math.sin(e.t * 10) * 4 : 8; g.save(); g.shadowColor = e.p2 ? '#ff5020' : '#80ff80'; g.shadowBlur = 22; g.fillStyle = e.p2 ? '#ff8a40' : '#60c060'; g.beginPath(); g.arc(0, -96, cr, 0, 7); g.fill(); g.restore(); g.strokeStyle = '#2f7a38'; g.lineWidth = 4; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-40 + i * 20, -130); g.quadraticCurveTo(-48 + i * 22, -90, -36 + i * 18, -60); g.stroke(); } }
  g.restore();
  if (e.tele) { g.strokeStyle = `rgba(255,60,40,${.5 + .5 * Math.sin(T * 20)})`; g.lineWidth = 3; g.beginPath(); g.arc(e.tele.x, e.tele.y, e.tele.r, 0, 7); g.stroke(); }
  if (e.wind > 0) { g.strokeStyle = 'rgba(255,60,40,.7)'; g.lineWidth = 2; g.beginPath(); g.arc(e.x, e.y, e.rng, 0, 7); g.stroke(); }
  if (e.atk) { const a = e.atk; g.fillStyle = `rgba(255,40,30,${.15 + .15 * Math.sin(T * 18)})`; g.strokeStyle = 'rgba(255,60,40,.9)'; g.lineWidth = 3; if (a.k === 'slam') { g.beginPath(); g.arc(a.x, a.y, a.r, 0, 7); g.fill(); g.stroke(); } else if (a.k === 'roots') a.pts.forEach(q => { g.beginPath(); g.arc(q.x, q.y, 50, 0, 7); g.fill(); g.stroke(); }); }
  if (!e.dead && !e.boss && e.hp < e.mhp) { g.fillStyle = '#400'; g.fillRect(e.x - 18, e.y - 54, 36, 4); g.fillStyle = '#e44'; g.fillRect(e.x - 18, e.y - 54, 36 * e.hp / e.mhp, 4); }
}
function drawFX() {
  FX.forEach(f => { const p = f.t / f.life; g.globalAlpha = Math.max(0, 1 - p);
    if (f.k === 'ring') { g.strokeStyle = f.col; g.lineWidth = 5; g.beginPath(); g.ellipse(f.x, f.y, f.r * Math.min(1, p * 2.2), f.r * Math.min(1, p * 2.2) * .6, 0, 0, 7); g.stroke(); g.fillStyle = f.col; g.globalAlpha *= .15; g.fill(); }
    else if (f.k === 'sp') { g.fillStyle = f.col; g.fillRect(f.x, f.y, 3, 3); }
    else if (f.k === 'slash') { g.strokeStyle = f.col; g.lineWidth = 6; g.shadowColor = f.col; g.shadowBlur = 14; g.beginPath(); g.arc(f.x - Math.cos(f.a) * 14, f.y - Math.sin(f.a) * 14, 34, f.a - 1.1 + p * 1.4, f.a + .1 + p * 1.4); g.stroke(); g.shadowBlur = 0; }
    else if (f.k === 'txt') { g.fillStyle = f.col; g.font = 'bold 18px Georgia'; g.textAlign = 'center'; g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeText(f.s, f.x, f.y - p * 32); g.fillText(f.s, f.x, f.y - p * 32); g.textAlign = 'left'; }
    g.globalAlpha = 1; });
  PR.forEach(p => { g.save(); g.shadowColor = p.col; g.shadowBlur = 16; g.fillStyle = p.col; g.beginPath(); g.arc(p.x, p.y, p.big ? 9 : 6, 0, 7); g.fill(); g.restore(); });
}
function drawWorld() {
  const sc = SCN[S.scene]; cam.x = Math.max(0, Math.min(sc.w - W, P.x - W / 2)); cam.y = Math.max(0, Math.min(sc.h - H, P.y - H / 2 - 20));
  g.save(); g.translate(-Math.round(cam.x + rnd(-1, 1) * shake * 8), -Math.round(cam.y + rnd(-1, 1) * shake * 8));
  S.scene === 'village' ? drawVillage() : drawDungeon();
  const ents = []; ents.push({ y: P.y, f: () => { if (P.inv > 0 && P.m !== 'dead' && Math.floor(T * 20) % 2) g.globalAlpha = .55; drawChar(g, S.hero, P.x, P.y, { d: P.d, m: P.m, t: P.mt, ph: P.ph, sc: 1.35, flash: P.inv > .55 && P.m === 'hurt' }); g.globalAlpha = 1; label(P.x, P.y, S.name, '#e8a33d'); } });
  Object.values(R).forEach(r => { if (r.sc === S.scene) ents.push({ y: r.y, f: () => { drawChar(g, r.hero, r.x, r.y, { d: r.d, m: r.m, t: r.t, ph: r.ph, sc: 1.35 }); label(r.x, r.y, r.name, '#9ff'); if (r.say) bubble(r.x, r.y - 104, r.say); } }); });
  if (S.scene === 'village') NPCS.forEach(n => ents.push({ y: n.y, f: () => { drawChar(g, n.c, n.x, n.y, { d: n.x < P.x ? 1 : -1, m: 'idle', t: 0, sc: 1.35 }); label(n.x, n.y, n.n, '#fff'); if (Math.hypot(n.x - P.x, n.y - P.y) < 62) bubble(n.x, n.y - 110, 'E', 1); } }));
  E.forEach(e => ents.push({ y: e.y, f: () => drawE(e) })); ents.sort((a, b) => a.y - b.y).forEach(e => e.f()); drawFX(); g.restore();
  if (P.inv > .45) { g.fillStyle = `rgba(255,0,0,${(P.inv - .45) * .6})`; g.fillRect(0, 0, W, H); } hud();
}
function label(x, y, t, c) { g.font = '11px Georgia'; g.textAlign = 'center'; g.fillStyle = '#000a'; g.fillText(t, x + 1, y - 84); g.fillStyle = c; g.fillText(t, x, y - 85); g.textAlign = 'left'; }
function bubble(x, y, t, k) { g.font = '12px Georgia'; const w = Math.min(220, g.measureText(t).width + 14); g.fillStyle = k ? '#e8a33d' : '#fffffff0'; g.fillRect(x - w / 2, y - 12, w, 20); g.fillStyle = '#222'; g.textAlign = 'center'; g.fillText(t.slice(0, 36), x, y + 3); g.textAlign = 'left'; }
function bar(x, y, w, h, p, c, bg) { g.fillStyle = bg; g.fillRect(x, y, w, h); g.fillStyle = c; g.fillRect(x, y, Math.max(0, w * Math.min(1, p)), h); g.strokeStyle = '#0008'; g.strokeRect(x, y, w, h); }
function hud() {
  const s = st(), c = CHARS[S.hero]; g.fillStyle = '#000a'; g.fillRect(8, 8, 232, 62); g.fillStyle = '#e8a33d'; g.font = 'bold 13px Georgia'; g.fillText(c.n + '  Nv ' + S.lv, 16, 24);
  bar(16, 30, 216, 10, P.hp / s.mhp, '#d03a3a', '#400'); bar(16, 43, 216, 8, P.mp / s.mmp, '#3a8ae0', '#124'); bar(16, 54, 216, 5, (S.xp - XPT[S.lv - 1]) / ((XPT[S.lv] || S.xp + 1) - XPT[S.lv - 1]), '#e8c96a', '#432');
  g.fillStyle = '#fff'; g.font = '11px Georgia'; g.fillText(Math.ceil(P.hp) + '/' + s.mhp, 20, 39); g.fillText('🪙 ' + S.gold, 190, 24);
  if (objective) { g.font = '13px Georgia'; const w = g.measureText(objective).width + 20; g.fillStyle = '#000a'; g.fillRect(W / 2 - w / 2, 8, w, 22); g.fillStyle = '#e8d8a0'; g.textAlign = 'center'; g.fillText('◆ ' + objective, W / 2, 24); g.textAlign = 'left'; }
  if (boss) { g.fillStyle = '#000b'; g.fillRect(W / 2 - 230, 40, 460, 30); g.fillStyle = '#fff'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText('VARKESH — Guardião Corrompido' + (boss.p2 ? ' (Núcleo exposto)' : ''), W / 2, 54); g.textAlign = 'left'; bar(W / 2 - 220, 58, 440, 8, boss.hp / boss.mhp, boss.p2 ? '#ff7a30' : '#6ac040', '#300'); }
  const cs = $('#bS'); if (cs) cs.textContent = !S.skills ? '🔒' : P.skCd > 0 ? Math.ceil(P.skCd) : '✦';
  if (P.dead) { g.fillStyle = '#000a'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.font = 'bold 30px Georgia'; g.textAlign = 'center'; g.fillText('A luz do selo os traz de volta...', W / 2, H / 2); g.textAlign = 'left'; }
}
// ---------- ENTRADA ----------
addEventListener('keydown', e => {
  const k = e.key.toLowerCase(); if (document.activeElement === $('#msg')) { if (k === 'enter') { const v = $('#msg').value.trim(); $('#msg').value = ''; $('#msg').blur(); if (v) { log(v, S.name); sendN('chat', { t: v }); } } e.stopPropagation(); return; }
  if (S.scene === 'title' && !cut) return; if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (k === 'enter') { $('#msg').focus(); return; } if ((k === ' ' || k === 'e') && dlgNext) { dlgNext(); return; } if (k === 'e') interact(); keys[k] = 1;
});
addEventListener('keyup', e => keys[e.key.toLowerCase()] = 0);
(() => { const j = $('#joy'), k = j.firstChild; let on = 0; const mv = e => { const r = j.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } J.x = Math.abs(x) < .12 ? 0 : x; J.y = Math.abs(y) < .12 ? 0 : y; k.style.transform = `translate(${x * 60}%,${y * 60}%)`; }; const end = () => { on = 0; J.x = J.y = 0; k.style.transform = ''; };
  j.addEventListener('pointerdown', e => { on = 1; j.setPointerCapture(e.pointerId); mv(e); }); j.addEventListener('pointermove', e => on && mv(e)); j.addEventListener('pointerup', end); j.addEventListener('pointercancel', end);
  [['#bA', 'a'], ['#bS', 's']].forEach(([id, h]) => { const b = $(id); b.addEventListener('pointerdown', e => { e.preventDefault(); held[h] = 1; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => held[h] = 0)); });
  $('#bE').addEventListener('pointerdown', e => { e.preventDefault(); dlgNext ? dlgNext() : interact(); }); })();
$('#mute').onclick = () => { $('#mute').textContent = A.toggle() ? '🔇' : '🔊'; };
$('#share').onclick = () => { const u = location.origin + '/?sala=' + S.room; navigator.clipboard?.writeText(u).catch(() => { }); log('Link copiado: ' + u, 'Sala'); };
// ---------- TÍTULO ----------
const cards = {};
(() => { const q = new URLSearchParams(location.search).get('sala'); if (q) $('#rm').value = q.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20); $('#nm').value = 'Viajante' + (Math.random() * 90 | 0);
  ['kael', 'lyra', 'eld', 'ser', 'dar', 'tho'].forEach(k => { const d = document.createElement('div'); d.className = 'card'; d.innerHTML = '<canvas width="120" height="150"></canvas><b>' + CHARS[k].n.split(' ')[0] + '</b><br>' + CHARS[k].fac; $('#heroes').appendChild(d); cards[k] = d.firstChild.getContext('2d');
    d.onclick = () => { S.hero = k; document.querySelectorAll('.card').forEach(x => x.classList.remove('sel')); d.classList.add('sel'); $('#go').disabled = false; $('#info').textContent = CHARS[k].n + ' — ' + CHARS[k].role + '. Habilidade: ' + CHARS[k].sk + '.'; A.init(); A.sfx('ui'); A.theme('calm'); }; });
  $('#go').onclick = () => { A.init(); S.name = $('#nm').value.trim().slice(0, 14) || 'Viajante'; S.room = $('#rm').value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'valdora'; $('#title').style.display = 'none'; started = true; newPlayer(); S.scene = 'village'; if (touch) { $('#joy').style.display = 'flex'; $('#btns').style.display = 'flex'; } connect(); playCut('prologue', () => { setObj('Converse com os moradores (0/3): Auren, Ferreiro, Taverneiro'); A.theme('calm'); log('WASD/joystick: mover · J/⚔: atacar · E: interagir · Enter: chat', 'Dica'); }); };
})();
// ---------- LOOP ----------
let last = 0;
function loop(ts) {
  const dt = Math.min(.05, (ts - last) / 1000); last = ts; update(dt);
  if (cut) drawCut(); else if (started && P) drawWorld(); else { g.fillStyle = '#0b0711'; g.fillRect(0, 0, W, H); }
  if (!started) for (const k in cards) { const c = cards[k]; c.clearRect(0, 0, 120, 150); c.fillStyle = '#f1e4cf'; c.fillRect(0, 0, 120, 150); drawChar(c, k, 60, 138, { d: 1, m: 'idle', t: 0, sc: 2.1 }); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
