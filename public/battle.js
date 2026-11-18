// Luta de chefe por turnos (câmera inclinada, estilo RPG clássico). Especial: R, T, R (ou os dois botões de ataque juntos no celular).

const TBPOS = [[640, 430], [760, 395], [880, 440]], TBBOSS = [250, 300];
const tbSc = y => .95 + (y - 300) / 420, tbEase = ease3;
function startTB() {
  const h = S.hero, mates = Object.keys(CHARS).filter(k => k !== 'aur' && k !== h && CHARS[k].fac === CHARS[h].fac), ids = [h, ...mates].slice(0, 3);
  const party = ids.map((k, i) => { const c = CHARS[k], mhp = c.hp + S.lv * 14, mmp = 40 + S.lv * 5; return { k, i, hp: mhp, mhp, mp: mmp, mmp, at: c.at + S.lv * 2.2, bx: TBPOS[i][0], by: TBPOS[i][1], x: TBPOS[i][0], y: TBPOS[i][1], m: 'idle', mt: 0, def: 0, stun: 0, dead: false, fx: -1, fy: -.6, hit: 0 }; });
  const hp = BALANCE.bossHPTB; TB = { party, boss: { hp, mhp: hp, x: TBBOSS[0], y: TBBOSS[1], m: 'idle', mt: 0, hit: 0, p2: 0, down: 0, taunt: -1, fx: 1, fy: .6, dead: false, dt: 0 }, i: 0, phase: 'intro', t: 0, anim: null, seq: [], seqT: 0, round: 1, banner: '', bannerT: 0, flash: 0, tele: null };
  S.scene = 'tb'; E = []; PR = []; FX = []; A.theme('boss'); $('#joy').style.display = 'none'; $('#bD').style.display = 'none'; banner('O Carrasco bloqueia a saída! Batalha por turnos!', 3);
}
function banner(t, s) { if (TB) { TB.banner = t; TB.bannerT = s || 1.6; } }
function alive() { return TB.party.filter(p => !p.dead); }
function tbMenu() {
  const tb = TB, m = tb.party[tb.i], c = CHARS[m.k], el = $('#tbm'); tb.phase = 'menu';
  el.innerHTML = `<div class="tbh"><img src="assets/p_${m.k}.jpg"><b>${c.n}</b><small>HP ${m.hp}/${m.mhp} · MP ${m.mp}/${m.mmp}</small></div>
  <button data-a="atk">⚔ Atacar <i>J</i></button><button data-a="skill" ${m.mp < 25 ? 'disabled' : ''}>✦ ${c.sk} <i>K/T · 25 MP</i></button>
  <button data-a="chg" ${S.chg < 10 ? 'disabled' : ''}>✧ Ataque carregado <i>R · ${S.chg}/10</i></button><button data-a="spec" ${S.chg < 10 ? 'disabled' : ''}>★ Especial em grupo <i>R·T·R</i></button><button data-a="def">🛡 Defender <i>F</i></button>`;
  el.style.display = 'flex'; el.querySelectorAll('button').forEach(b => b.onclick = () => tbDo(b.dataset.a));
}
function tbDo(kind) {
  const tb = TB; if (!tb || tb.phase !== 'menu' || paused) return; const m = tb.party[tb.i], c = CHARS[m.k], s = m.at;
  if (kind === 'skill' && m.mp < 25) { log('MP insuficiente.'); return; } if ((kind === 'chg' || kind === 'spec') && S.chg < 10) { log('Carga ' + S.chg + '/10: use ataques normais.', 'Combate'); return; }
  $('#tbm').style.display = 'none'; tb.phase = 'act'; tb.seq = [];
  if (kind === 'atk') { S.chg = Math.min(10, S.chg + 1); if (S.chg === 10) sfx('ready'); strike(m, { dmg: s * rnd(.95, 1.2), elem: 'phys' }); }
  else if (kind === 'skill') { m.mp -= 25; S.chg = Math.min(10, S.chg + 1); const k = m.k;
    if (k === 'lyra') strike(m, { cast: 1, snd: 'heal', heal: .35 }); else if (k === 'kael') strike(m, { dmg: s * 2.2, elem: 'fire', cast: 1, snd: 'fire', col: c.el }); else if (k === 'eld') strike(m, { dmg: s * 2.3, elem: 'wind', cast: 1, snd: 'wind', col: c.el });
    else if (k === 'ser') strike(m, { dmg: s * 1.6, elem: 'dark', cast: 1, snd: 'shadow', col: c.el, after: () => { tb.boss.down = 1; banner('A sombra enfraquece o Carrasco!'); } });
    else if (k === 'dar') strike(m, { dmg: s * 1.9, elem: 'earth', cast: 1, snd: 'quake', col: c.el, after: () => { tb.boss.taunt = m.i; m.def = 1; banner('Darius atrai a atenção do Carrasco!'); } }); else strike(m, { dmg: s * 2.4, elem: 'earth', cast: 1, snd: 'quake', col: c.el }); }
  else if (kind === 'chg') { S.chg = 0; strike(m, { dmg: s * 4.5, elem: c.ranged ? 'wind' : 'fire', cast: 1, snd: 'special', col: c.el, big: 1 }); }
  else if (kind === 'spec') { S.chg = 0; special(); }
  else { m.def = 1; m.mp = Math.min(m.mmp, m.mp + 10); sfx('ui'); FX.push({ k: 'txt', x: m.x, y: m.y - 110, s: 'Defendendo', col: '#8cf', t: 0, life: 1 }); tb.anim = { t: 0, dur: .7, step() { }, done: tbNext }; }
}
function strike(m, o) {
  const tb = TB, c = CHARS[m.k], ranged = !!c.ranged, B = tb.boss, tx = B.x + 100, ty = B.y + 70; let swung = 0, hit = 0;
  tb.anim = { t: 0, dur: ranged ? 1.1 : 1.45, step: t => {
    if (!ranged) { const k = t < .35 ? tbEase(t / .35) : t > .85 ? 1 - tbEase((t - .85) / .6) : 1; m.x = m.bx + (tx - m.bx) * k; m.y = m.by + (ty - m.by) * k; }
    const dx = B.x - m.x, dy = B.y - m.y, l = len(dx, dy) || 1; m.fx = dx / l; m.fy = dy / l;
    if (!swung && t >= (ranged ? .1 : .35)) { swung = 1; m.m = o.cast ? 'cast' : 'atk'; m.mt = 0; sfx(o.snd || WSND[m.k]); }
    if (ranged && swung && t < .6) FX.push({ k: 'sp', x: m.x + (B.x - m.x) * (t - .1) * 2, y: m.y - 45 + (B.y - 70 - m.y + 45) * (t - .1) * 2, vx: rnd(-20, 20), vy: rnd(-20, 20), col: c.el, t: 0, life: .3 });
    if (!hit && t >= (ranged ? .6 : .55)) { hit = 1; if (o.heal) { alive().forEach(p => { const h = Math.round(p.mhp * o.heal); p.hp = Math.min(p.mhp, p.hp + h); FX.push({ k: 'txt', x: p.x, y: p.y - 110, s: '+' + h, col: '#6f8', t: 0, life: 1 }); ring(p.x, p.y, 60, c.el); }); } else tbHit(o.dmg, o.elem, o.col || c.el, o.big); }
    if (m.m !== 'idle' && t > (ranged ? .8 : .9)) m.m = 'idle'; },
    done: () => { m.m = 'idle'; m.x = m.bx; m.y = m.by; o.after && o.after(); tbNext(); } };
}
function tbHit(d, elem, col, big) {
  const B = TB.boss; if (B.dead) return; d = Math.max(1, Math.round(d - 2)); if (elem === 'fire') d = Math.round(d * 1.25); B.hp = Math.max(0, B.hp - d); B.hit = .18; B.m = 'hurt'; B.mt = 0; sfx('hit'); shake = big ? 1 : .35;
  FX.push({ k: 'txt', x: B.x + rnd(-20, 20), y: B.y - 190, s: String(d), col: big ? '#ffd86a' : '#fff', t: 0, life: 1 }); ring(B.x, B.y + 10, big ? 130 : 70, col); for (let i = 0; i < 8; i++) FX.push({ k: 'sp', x: B.x, y: B.y - 80, vx: rnd(-160, 160), vy: rnd(-160, 40), col: '#ffe9a0', t: 0, life: .4 });
  if (big) TB.flash = .5; if (!B.p2 && B.hp < B.mhp * .4) { B.p2 = 1; sfx('roar'); banner('O Carrasco entra em FÚRIA e ataca duas vezes por turno!', 2.6); }
}
function special() {
  const tb = TB, B = tb.boss, al = alive(); let done = al.map(() => 0); banner('ATAQUE ESPECIAL EM GRUPO!', 2.4); sfx('special');
  tb.anim = { t: 0, dur: .3 + al.length * .95 + .8, step: t => {
    al.forEach((m, j) => { const s0 = .3 + j * .95, u = t - s0, c = CHARS[m.k]; if (u < 0) return; const tx = B.x + 90 + j * 25, ty = B.y + 55 + j * 22;
      const k = u < .3 ? tbEase(u / .3) : u > .7 ? Math.max(0, 1 - tbEase((u - .7) / .25)) : 1; if (!c.ranged) { m.x = m.bx + (tx - m.bx) * k; m.y = m.by + (ty - m.by) * k; }
      const dx = B.x - m.x, dy = B.y - m.y, l = len(dx, dy) || 1; m.fx = dx / l; m.fy = dy / l;
      if (!done[j] && u >= .3) { done[j] = 1; m.m = j % 2 ? 'cast' : 'atk'; m.mt = 0; sfx(WSND[m.k]); tbHit(m.at * 3.4, c.ranged ? 'wind' : 'fire', c.el, 1); }
      if (u > .8) { m.m = 'idle'; m.x = m.bx; m.y = m.by; } });
    if (t > .3 + al.length * .95 + .3 && !tb.fin) { tb.fin = 1; tbHit(al.reduce((a, m) => a + m.at, 0) * 1.6, 'fire', '#ffffff', 1); sfx('boom'); } },
    done: () => { tb.fin = 0; al.forEach(m => { m.m = 'idle'; m.x = m.bx; m.y = m.by; }); tbNext(); } };
}
function tbNext() {
  const tb = TB; tb.anim = null; if (tb.boss.hp <= 0) return tbVictory();
  do { tb.i++; } while (tb.i < 3 && (!tb.party[tb.i] || tb.party[tb.i].dead));
  if (tb.i >= tb.party.length) { tb.i = 0; tb.phase = 'enemy'; setTimeout(() => tbEnemy(1), 500); return; }
  const m = tb.party[tb.i]; if (m.stun > 0) { m.stun = 0; banner(CHARS[m.k].n.split(' ')[0] + ' está preso e perde o turno!'); setTimeout(tbNext, 900); return; } m.def = 0; tbMenu();
}
function tbEnemy(n) {
  const tb = TB, B = tb.boss; if (B.dead) return; const al = alive(); if (!al.length) return tbDefeat();
  const r = Math.random(), kind = r < .4 ? 'slam' : r < .7 ? 'spin' : 'chain', tgt = (B.taunt >= 0 && !tb.party[B.taunt].dead) ? tb.party[B.taunt] : al[Math.random() * al.length | 0], at = (30 + S.lv * 2) * (B.down ? .6 : 1);
  banner({ slam: 'O Carrasco ergue o machado sobre ' + CHARS[tgt.k].n.split(' ')[0] + '...', spin: 'O Carrasco gira o machado em volta de si!', chain: 'O Carrasco lança a corrente!' }[kind], 1.2); sfx('roar'); tb.tele = { kind, tgt, t: 0 }; let go = 0, hit = 0; const sx = B.x, sy = B.y;
  tb.anim = { t: 0, dur: 2.2, step: t => {
    const k = t < 1 ? 0 : t < 1.25 ? tbEase((t - 1) / .25) : t > 1.7 ? Math.max(0, 1 - tbEase((t - 1.7) / .5)) : 1; if (kind !== 'spin') { B.x = sx + (tgt.x - 120 - sx) * k * .7; B.y = sy + (tgt.y - 40 - sy) * k * .7; }
    const dx = tgt.x - B.x, dy = tgt.y - B.y, l = len(dx, dy) || 1; B.fx = dx / l; B.fy = dy / l;
    if (!go && t >= 1) { go = 1; B.m = 'atk'; B.mt = 0; }
    if (!hit && t >= 1.2) { hit = 1; tb.tele = null; shake = .9; sfx(kind === 'chain' ? 'boom' : 'quake'); const hurtM = (m, d) => { if (m.dead) return; d = Math.round(d * (m.def ? .4 : 1) * rnd(.9, 1.1)); m.hp = Math.max(0, m.hp - d); m.m = 'hurt'; m.mt = 0; m.hit = .2; FX.push({ k: 'txt', x: m.x, y: m.y - 120, s: '-' + d, col: '#f55', t: 0, life: 1 }); sfx('hurt'); ring(m.x, m.y, 60, '#f84'); if (m.hp <= 0) { m.dead = true; m.m = 'dead'; m.mt = 0; sfx('die'); } };
      if (kind === 'slam') hurtM(tgt, at * 1.35); else if (kind === 'spin') { ring(B.x, B.y, 220, '#ff4030'); alive().forEach(m => hurtM(m, at * .8)); } else { hurtM(tgt, at * .9); tgt.stun = 1; banner(CHARS[tgt.k].n.split(' ')[0] + ' foi acorrentado!'); } }
    if (t > 1.5 && B.m === 'atk') B.m = 'idle'; },
    done: () => { B.x = sx; B.y = sy; B.m = 'idle'; B.taunt = -1; if (!alive().length) return tbDefeat(); if (B.p2 && n < 2) return tbEnemy(2); B.down = 0; tb.round++; tb.i = -1; tbNext(); } };
}
function tbVictory() { const tb = TB, B = tb.boss; B.dead = true; B.dt = 0; B.m = 'dead'; sfx('boom'); banner('O Carrasco foi derrotado!', 3); $('#tbm').style.display = 'none'; tb.phase = 'win'; setTimeout(() => { TB = null; S.scene = 'boss'; P.x = 480; P.y = 400; if (touch) { $('#joy').style.display = 'flex'; $('#bD').style.display = ''; } bossDead(); }, 2800); }
function tbDefeat() { const tb = TB; tb.phase = 'lose'; $('#tbm').style.display = 'flex'; $('#tbm').innerHTML = '<div class="tbh"><b>Os heróis caíram...</b><small>A luz do selo os chama de volta.</small></div><button id="tbr">Tentar de novo</button>'; $('#tbr').onclick = () => { $('#tbm').style.display = 'none'; startTB(); TB.t = 1.4; }; }
// entrada de comandos (teclado e botões do celular)
function tbSeqTimeout() { const tb = TB; if (!tb) return; const s = tb.seq.join(''); tb.seq = []; if (tb.phase !== 'menu') return; if (s === 'r') tbDo('chg'); else if (s === 'rt') tbDo('skill'); }
function tbKey(k) {
  const tb = TB; if (!tb || tb.phase !== 'menu') return; if (k === 'j') tbDo('atk'); else if (k === 'f') tbDo('def');
  else if (k === 'k') tbDo('skill');
  else if (k === 'r') { if (tb.seq.join('') === 'rt') { tb.seq = []; tbDo('spec'); } else if (!tb.seq.length) { tb.seq = ['r']; tb.seqT = .55; } }
  else if (k === 't') { if (tb.seq.join('') === 'r') { tb.seq = ['r', 't']; tb.seqT = .8; } else tbDo('skill'); }
}
let tbLast = { a: 0, s: 0 };
function tbBtn(b) {
  const now = performance.now(), o = b === 'a' ? 's' : 'a'; tbLast[b] = now;
  if (now - tbLast[o] < 170) { tbLast.a = tbLast.s = 0; clearTimeout(tbBtn.t); tbDo('spec'); return; }
  clearTimeout(tbBtn.t); tbBtn.t = setTimeout(() => { if (tbLast[b] === now) tbDo(b === 'a' ? 'atk' : 'skill'); }, 180);
}
function updTB(dt) {
  const tb = TB; tb.t += dt; shake = Math.max(0, shake - dt * 2); if (tb.bannerT > 0) tb.bannerT -= dt; tb.flash = Math.max(0, tb.flash - dt); if (tb.seqT > 0) { tb.seqT -= dt; if (tb.seqT <= 0) tbSeqTimeout(); }
  tb.party.forEach(m => { m.mt += dt; m.hit -= dt; if (m.m === 'hurt' && m.mt > .35 && !m.dead) m.m = 'idle'; }); const B = tb.boss; B.mt += dt; B.hit -= dt; if (B.m === 'hurt' && B.mt > .3) B.m = 'idle'; if (B.dead) B.dt += dt;
  FX.forEach(f => { f.t += dt; if (f.k === 'sp') { f.x += f.vx * dt; f.y += f.vy * dt; } }); FX = FX.filter(f => f.t < f.life);
  if (tb.phase === 'intro' && tb.t > 1.6) tbMenu();
  if (tb.anim) { const a = tb.anim; a.t += dt; a.step(a.t, dt); if (a.t >= a.dur) { tb.anim = null; a.done && a.done(); } }
}
function drawTB() {
  const tb = TB, B = tb.boss; g.save();
  if (tb.phase === 'intro') { const k = tbEase(Math.min(1, tb.t / 1.5)); g.translate(W / 2, H / 2); g.rotate((1 - k) * .5); g.scale(1 + (1 - k) * .6, 1 + (1 - k) * .6); g.translate(-W / 2, -H / 2); }
  g.translate(rnd(-1, 1) * shake * 8, rnd(-1, 1) * shake * 8); g.drawImage(getBG('arena'), 0, 0);
  for (let i = 0; i < 6; i++) { const gr = g.createRadialGradient(80 + i * 160, 150, 0, 80 + i * 160, 150, 120); gr.addColorStop(0, `rgba(255,160,60,${.14 + Math.sin(T * 9 + i) * .03})`); gr.addColorStop(1, 'rgba(255,120,20,0)'); g.fillStyle = gr; g.fillRect(i * 160 - 40, 30, 240, 240); }
  const te = tb.tele; if (te) { te.t += 0; g.fillStyle = `rgba(255,40,30,${.14 + .12 * Math.sin(T * 18)})`; g.strokeStyle = 'rgba(255,60,40,.9)'; g.lineWidth = 3; g.beginPath(); if (te.kind === 'spin') g.ellipse(B.x, B.y, 260, 120, 0, 0, 7); else g.ellipse(te.tgt.x, te.tgt.y, 90, 40, 0, 0, 7); g.fill(); g.stroke(); if (te.kind === 'chain') { g.beginPath(); g.moveTo(B.x, B.y - 70); g.lineTo(te.tgt.x, te.tgt.y - 40); g.stroke(); } }
  const ents = tb.party.map(m => ({ y: m.y, f: () => { if (m.dead) { drawHero(g, m.k, m.x, m.y, { fx: m.fx, fy: m.fy, m: 'dead', t: m.mt, sc: tbSc(m.y), a: .6 }); return; } drawHero(g, m.k, m.x, m.y, { fx: m.fx, fy: m.fy, m: m.m, t: m.mt, ph: 0, sc: tbSc(m.y), c: 0, el: CHARS[m.k].el, flash: m.hit > .1 }); if (tb.phase === 'menu' && tb.party[tb.i] === m) { g.fillStyle = '#e8a33d'; g.beginPath(); const yy = m.y - SPR[m.k].ch * tbSc(m.y) - 18 + Math.sin(T * 6) * 3; g.moveTo(m.x - 8, yy - 10); g.lineTo(m.x + 8, yy - 10); g.lineTo(m.x, yy); g.fill(); } if (m.def) { g.strokeStyle = '#8cf'; g.lineWidth = 2; g.beginPath(); g.ellipse(m.x, m.y - 40, 34, 56, 0, 0, 7); g.stroke(); } } }));
  ents.push({ y: B.y, f: () => drawSpr(g, 'exec', B.x, B.y, { fx: B.fx, fy: B.fy, m: B.m, t: B.m === 'dead' ? B.dt : B.mt, sc: tbSc(B.y) * 1.05, flash: B.hit > .08, a: B.dead ? Math.max(0, 1 - B.dt * .5) : 1 }) });
  ents.sort((a, b) => a.y - b.y).forEach(e => e.f()); drawFX(); g.restore();
  const gr = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,4,0,.65)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (tb.flash > 0) { g.fillStyle = `rgba(255,255,255,${tb.flash})`; g.fillRect(0, 0, W, H); }
  g.fillStyle = '#000b'; g.fillRect(W / 2 - 230, 8, 460, 34); g.fillStyle = '#fff'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText('O CARRASCO — Ordem do Domínio' + (B.p2 ? ' (Fúria)' : ''), W / 2, 22); g.textAlign = 'left'; bar(W / 2 - 220, 28, 440, 9, B.hp / B.mhp, B.p2 ? '#ff7a30' : '#c04040', '#300');
  tb.party.forEach((m, i) => { const y = 400 + i * 46 - 0, x = 10; g.fillStyle = tb.party[tb.i] === m && tb.phase === 'menu' ? '#3a2a10e0' : '#000a'; g.fillRect(x, y, 230, 42); const im = ART['p_' + m.k]; if (im.complete) g.drawImage(im, x + 3, y + 3, 32, 36); g.fillStyle = m.dead ? '#888' : '#fff'; g.font = 'bold 11px Georgia'; g.fillText(CHARS[m.k].n.split(' ')[0] + (m.stun ? ' ⛓' : ''), x + 40, y + 12); bar(x + 40, y + 16, 180, 9, m.hp / m.mhp, '#d03a3a', '#400'); bar(x + 40, y + 28, 180, 7, m.mp / m.mmp, '#3a8ae0', '#124'); });
  for (let i = 0; i < 10; i++) { g.fillStyle = i < S.chg ? (S.chg >= 10 ? `hsl(${40 + Math.sin(T * 8) * 20},100%,60%)` : '#ffb84a') : '#3a2a1a'; g.fillRect(250 + i * 16, 520, 13, 8); } g.fillStyle = '#e8d8a0'; g.font = '10px Georgia'; g.fillText(S.chg >= 10 ? 'CARGA PRONTA — R (carregado) · R,T,R ou ⚔+✦ (especial)' : 'Carga ' + S.chg + '/10', 250, 516);
  if (tb.bannerT > 0) { g.font = 'bold 20px Georgia'; const w = g.measureText(tb.banner).width + 40; g.fillStyle = '#000c'; g.fillRect(W / 2 - w / 2, 70, w, 36); g.fillStyle = '#ffe9a0'; g.textAlign = 'center'; g.fillText(tb.banner, W / 2, 96); g.textAlign = 'left'; }
}
