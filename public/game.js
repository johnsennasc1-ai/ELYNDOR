'use strict';
// ===== Elyndor — As Cinzas de Valdora: motor do jogo (ação em tempo real + salas online) =====
const $ = s => document.querySelector(s), cv = $('#c'), g = cv.getContext('2d'), W = 960, H = 540;
const BALANCE = { bossHP: 2600, bossHPTB: 1100, enemyScale: .04, skillCost: 25, skillCd: 4, dungeonMinLv: 4, respawn: 28 }; // ajuste aqui no balanceamento
const XPT = [0, 100, 250, 450, 700, 1000, 1400, 1900, 2500, 3200, 4000];
const touch = matchMedia('(pointer:coarse)').matches;
const S = { scene: 'title', hero: 'kael', name: '', room: 'valdora', id: Math.random().toString(36).slice(2, 8), xp: 0, lv: 1, gold: 0, quest: 0, talked: {}, chests: {}, skills: false, choice: '', qs: {}, sheep: [], glyph: [], clues: [], ore: 0, kt: new Set(), campT: {}, doorOpen: 0 };
let P = null, E = [], PR = [], FX = [], R = {}, cam = { x: 0, y: 0 }, shake = 0, T = 0, keys = {}, J = { x: 0, y: 0 }, held = { a: 0, s: 0 };
let TB = null, cut = null, wave = null, objective = '', netOn = false, lastSend = 0, boss = null, dlgNext = null, dlgOn = false, typing = null, started = false, paused = false, warnT = 0;
const ART = {}; ['sombroso', ...Object.keys(CHARS).flatMap(k => ['p_' + k, 'b_' + k, 'art_' + k])].forEach(k => { const i = new Image(); i.src = 'assets/' + k + (k === 'sombroso' || k.startsWith('art_') ? '.png' : '.jpg'); ART[k] = i; });
const PORT = { 'Kael Varen': 'kael', 'Lyra Solen': 'lyra', 'Eldarion Thal': 'eld', 'Seraphine Voss': 'ser', 'Darius Korven': 'dar', 'Thorin Bragg': 'tho', 'Auren': 'aur', 'Estudioso viajante': 'aur' };
const SCN = {
  village: { w: 1500, h: 900, col: [[0, 520, 700, 60], [800, 520, 1500, 60], [200, 120, 150, 100], [650, 100, 180, 110], [1100, 120, 150, 100], [200, 320, 130, 90], [745, 345, 60, 50], [0, 0, 1500, 10], [0, 0, 10, 900], [1490, 0, 10, 900], [0, 890, 1500, 10]] },
  campos: { w: 1800, h: 1100, col: [[0, 0, 1800, 10], [0, 0, 10, 1100], [1790, 0, 10, 1100], [0, 1090, 1800, 10], [820, 500, 60, 60], [420, 300, 70, 50], [1300, 700, 70, 50], [1500, 200, 60, 60]] },
  d1: { w: 960, h: 540, col: [[300, 200, 40, 40], [620, 200, 40, 40], [300, 340, 40, 40], [620, 340, 40, 40]] },
  d2: { w: 960, h: 540, col: [[200, 250, 50, 50], [710, 250, 50, 50], [455, 150, 50, 50]] },
  boss: { w: 960, h: 540, col: [] }
};
const ET = {
  wolf: { n: 'Cérbero de Correntes', spr: 'wolf', hp: 45, at: 8, sp: 125, xp: 14, r: 16, rng: 36, sc: 1.05, wind: .35 },
  bat: { n: 'Morcego Carmesim', spr: 'bat', hp: 60, at: 10, sp: 95, xp: 20, r: 16, rng: 30, sc: .85, fly: 24 },
  ogre: { n: 'Ciclope Bruto', spr: 'ogre', hp: 140, at: 17, sp: 55, xp: 36, r: 24, rng: 62, sc: .8, def: 2, wind: .85 },
  golem: { n: 'Golem de Brasa', spr: 'golem', hp: 180, at: 19, sp: 44, xp: 48, r: 26, rng: 66, sc: .78, def: 4, wind: .9 }
};
const NPCS = [
  { id: 'auren', spr: 'aur', n: 'Estudioso viajante', x: 835, y: 395 }, { id: 'ferr', spr: 'smith', n: 'Ferreiro Orren', x: 300, y: 270 },
  { id: 'taver', spr: 'keep', n: 'Taverneiro do Javali', x: 740, y: 235 }, { id: 'mor', spr: 'mor', n: 'Moradora', x: 520, y: 430 },
  { id: 'mira', spr: 'mira', n: 'Mira', x: 960, y: 450, sc: .75 }, { id: 'farm', spr: 'farm', n: 'Fazendeiro Tomás', x: 1120, y: 330 }
];
const CHESTS = [{ id: 'c1', x: 1200, y: 400, s: 'village' }, { id: 'c2', x: 300, y: 720, s: 'village' }, { id: 'c3', x: 1650, y: 900, s: 'campos' }, { id: 'c4', x: 200, y: 200, s: 'campos' }];
const SHEEP = [{ x: 420, y: 650 }, { x: 1250, y: 450 }, { x: 900, y: 900 }];
const GLYPHS = [{ x: 600, y: 150, t: 'Sete guardiões selaram o Devorador. Sete chaves, sete herdeiros.' }, { x: 1550, y: 500, t: 'O fogo guarda a coragem, a água guarda a memória, o vento guarda a promessa, a sombra guarda a verdade.' }, { x: 1000, y: 1000, t: 'O sétimo não dorme. O sétimo espera. O sétimo carrega o peso dos outros seis.' }];
const CAMPS = [['wolf', 500, 760], ['wolf', 650, 880], ['wolf', 300, 420], ['bat', 1100, 600], ['bat', 1300, 800], ['bat', 700, 300], ['ogre', 1500, 420], ['ogre', 1400, 950], ['golem', 1650, 250], ['golem', 1000, 220]];
const CLUES = [
  { x: 1100, y: 780, t: ['Soldados do reino jazem entre carroças viradas. Cada um tem uma corrente cinzenta presa ao pulso, e todos olham para o norte, como se tivessem visto algo antes de morrer.'], r: { kael: 'Essas correntes... a forja de meu pai nunca fez nada assim. Alguém as fabricou para prender coisas vivas.', lyra: 'Não morreram de ferida. Estão... murchos, como a água do rio.', eld: 'Há pegadas de feras que não deveriam existir. Foram soltas aqui, de propósito.', ser: 'Eu conheço este selo. É o símbolo da Ordem que me prendeu. Eles estão aqui.', dar: 'Reconheço a farda. São homens do meu antigo batalhão. Ordens... de quem?', tho: 'O metal destas correntes é minério de Ferro Negro. Foi roubado das minas, e usado para isto.' } },
  { x: 300, y: 960, t: ['Na margem do rio, peixes mortos boiam em uma água verde-escura. Um barril rachado, marcado com o símbolo cinzento, ainda escorre algo viscoso.'], r: { kael: 'O veneno vem do norte, mas começou aqui. Alguém derramou isto de propósito.', lyra: 'É a mesma substância que encontrei nas pedras do rio. Não é natural: foi feita.', eld: 'Veneno de raiz corrompida. Há algo apodrecendo a terra por dentro.', ser: 'Magia de drenagem. Quem fez isto sabe o que está drenando.', dar: 'Armazenamento militar. Isto saiu de um depósito do exército.', tho: 'O cheiro é de minério fundido misturado a magia. Uma forja ilegal por perto.' } },
  { x: 1550, y: 560, t: ['Um acampamento abandonado às pressas: tendas rasgadas, uma mesa de mapas e, no centro, um desenho do Santuário das Raízes sob a ponte antiga, com a palavra "SELO" circulada em vermelho.'], r: { kael: 'Querem o que está debaixo da nossa ponte. E a vila inteira não sabe.', lyra: 'Se o selo se abrir, o veneno do rio será o menor dos problemas.', eld: 'O mapa mostra raízes antigas ligadas ao santuário. É um dos selos dos Guardiões.', ser: 'Eles estão escavando. Não é só pesquisa: é colheita.', dar: 'Planejamento militar. Uma operação em andamento, com ordens de cima.', tho: 'Este desenho mostra as galerias. Há minério ali, e muito, o que explica o roubo.' } }
];
const QUESTS = {
  animais: { n: 'Os animais desaparecidos', d: 'Encontre 3 animais perdidos nos Campos de Valdora e fale com o Fazendeiro Tomás.', need: 3, xp: 80, gold: 30, prog: () => S.sheep.length },
  minerio: { n: 'O minério perdido', d: 'Recupere 5 minérios dos Ciclopes e Golens e leve ao Ferreiro Orren.', need: 5, xp: 100, gold: 40, prog: () => Math.min(5, S.ore) },
  rumores: { n: 'Rumores da taverna', d: 'Derrote um Cérbero, um Morcego, um Ciclope e um Golem e conte ao Taverneiro.', need: 4, xp: 120, gold: 40, prog: () => S.kt.size },
  palavras: { n: 'As palavras dos antigos', d: 'Leia as 3 inscrições escondidas nos Campos e fale com Auren.', need: 3, xp: 200, gold: 60, prog: () => S.glyph.length }
};
const st = () => { const c = CHARS[S.hero]; return { mhp: c.hp + S.lv * 14, at: c.at + S.lv * 2.2, mmp: 40 + S.lv * 5 }; };
const rnd = (a, b) => a + Math.random() * (b - a), sfx = k => A.sfx(k), len = (x, y) => Math.hypot(x, y);
const hash = (x, y) => { let h = x * 374761393 + y * 668265263; h = (h ^ (h >> 13)) * 1274126177; return ((h ^ (h >> 16)) >>> 0) / 4294967295; };
const log = (t, c) => { const l = $('#log'), d = document.createElement('div'); if (c) { const b = document.createElement('b'); b.textContent = c + ': '; d.appendChild(b); } d.appendChild(document.createTextNode(t)); l.appendChild(d); while (l.children.length > 6) l.firstChild.remove(); };
// ---------- DIÁLOGO ----------
function typeLine(tx, who, done, opts) {
  const dlg = $('#dlg'), pk = PORT[who]; dlg.style.display = 'flex'; dlgOn = true;
  dlg.innerHTML = (pk ? `<img class="pt" src="assets/p_${pk}.jpg">` : '') + '<div class="tx"><span class="nx">▸ continuar</span><b></b><p id="tt"></p><div class="opts"></div></div>';
  dlg.querySelector('b').textContent = who || ''; const el = $('#tt'); let i = 0; clearInterval(typing);
  const fin = () => { clearInterval(typing); typing = null; el.textContent = tx; if (opts) { dlg.querySelector('.nx').remove(); opts.forEach(o => { const b = document.createElement('button'); b.textContent = o[0]; b.onclick = e => { e.stopPropagation(); o[1](); }; dlg.querySelector('.opts').appendChild(b); }); dlgNext = null; } };
  typing = setInterval(() => { el.textContent = tx.slice(0, ++i); if (i % 3 === 0) sfx('blip'); if (i >= tx.length) fin(); }, 22);
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
  const s = cut.c.slides[cut.i], t = cut.t, z = 1 + t * .014;
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2 - t * 1.5, -H / 2);
  drawCinema(g, s.bg || 'night', t);
  for (let i = 0; i < 50; i++) { g.fillStyle = `rgba(255,${180 + i % 60},90,${.45 * Math.abs(Math.sin(t * .9 + i))})`; g.fillRect((i * 97 + t * (10 + i % 5 * 6)) % W, H - ((i * 53 + t * (18 + i % 7 * 5)) % H), 2, 2); }
  if (s.somb && ART.sombroso.complete) { const im = ART.sombroso, h = 480 + Math.sin(t * 1.2) * 8, w = im.width * h / im.height; g.save(); g.shadowColor = '#a060ff'; g.shadowBlur = 60; g.globalAlpha = .96; g.drawImage(im, 690 - w / 2, 420 - h, w, h); g.restore(); g.fillStyle = '#f0e0ff'; g.shadowColor = '#fff'; g.shadowBlur = 16; g.fillRect(666, 150, 11, 4); g.fillRect(704, 150, 11, 4); g.shadowBlur = 0; }
  (s.act || []).forEach((u, i) => { const by = 440 + (i % 2) * 14, art = ART['art_' + u.c], sc = u.sc || 1;
    g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(u.x, by, 70 * sc, 14 * sc, 0, 0, 7); g.fill();
    if (art && art.complete && art.width && !u.sil) { const h = 400 * sc, w = art.width * h / art.height, br = Math.sin(t * 1.6 + i) * 3, lean = u.m === 'atk' ? Math.sin(t * 5) * .06 : u.m === 'hurt' ? -.08 : 0, up = u.m === 'cast' ? -8 - Math.sin(t * 4) * 6 : 0; g.save(); g.translate(u.x, by); g.rotate(lean); g.shadowColor = (CHARS[u.c] && CHARS[u.c].el) || '#fff'; g.shadowBlur = u.m === 'cast' ? 36 : 10; g.drawImage(art, -w / 2, -h - br + up, w, h + br); g.restore(); if (u.m === 'cast') { const gr = g.createRadialGradient(u.x, by - 120 * sc, 0, u.x, by - 120 * sc, 180); gr.addColorStop(0, ((CHARS[u.c] && CHARS[u.c].el) || '#fff') + '66'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(u.x - 200, by - 320, 400, 400); } }
    else drawSpr(g, u.c, u.x, by, { di: u.di, fx: u.di === 2 ? 1 : u.di === 6 ? -1 : 0, fy: 1, m: u.m, t: t % 1.4, ph: t * 4, sil: u.sil, el: CHARS[u.c] && CHARS[u.c].el, sc: (u.sc || 1) * 2.7 }); });
  if (s.exec) drawSpr(g, 'exec', 480, 450, { di: 0, fx: 0, fy: 1, m: s.dead ? 'dead' : 'idle', t: s.dead ? t : 0, sc: 2.1 });
  if (s.art) s.art.forEach((k, i) => { const im = ART['art_' + k]; if (!im.complete || !im.width) return; const h = 360, w = im.width * h / im.height, x = 70 + i * 140 + 56, a = Math.min(1, Math.max(0, t * 1.4 - i * .25)); g.save(); g.globalAlpha = a; g.shadowColor = CHARS[k].el; g.shadowBlur = 34; g.drawImage(im, x - w / 2, 430 - h - (1 - a) * 20, w, h); g.restore(); });
  g.restore();
  if (s.flash) { g.fillStyle = `rgba(255,255,255,${Math.max(0, 1 - t * .5)})`; g.fillRect(0, 0, W, H); }
  cinFinish(g, t, W, H);
  if (s.title) { g.fillStyle = '#e8a33d'; g.textAlign = 'center'; g.font = 'bold 64px Georgia'; g.shadowColor = '#e8a33d'; g.shadowBlur = 24; g.fillText('ELYNDOR', W / 2, 190); g.font = '24px Georgia'; g.fillText('AS CINZAS DE VALDORA', W / 2, 230); g.shadowBlur = 0; g.textAlign = 'left'; }
  if (s.card) { g.textAlign = 'center'; g.fillStyle = '#e8a33d'; g.font = 'bold 20px Georgia'; g.fillText(s.card[0], W / 2, 200); g.fillStyle = '#fff'; g.font = 'bold 44px Georgia'; g.shadowColor = '#000'; g.shadowBlur = 12; g.fillText(s.card[1], W / 2, 255); g.shadowBlur = 0; g.textAlign = 'left'; }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, 50); g.fillRect(0, H - 50, W, 50);
}
// ---------- JOGADOR ----------
function newPlayer() { const s = st(); P = { x: 750, y: 470, fx: 0, fy: 1, hp: s.mhp, mp: s.mmp, m: 'idle', mt: 0, ph: 0, atkCd: 0, skCd: 0, inv: 0, stun: 0, dead: false, dt: 0, r: 12, pend: null, stepT: 0, combo: 0, comboT: 0, dodgeCd: 0, dash: null, lock: 0 }; S.chg = 0; }
function setM(m) { if (P.m !== m) { P.m = m; P.mt = 0; } }
const canAct = () => !P.dead && P.stun <= 0 && !cut && !dlgOn && !paused && P.m !== 'hurt';
function aim() { let best = null, bd = 300; E.forEach(e => { if (e.dead) return; const d = len(e.x - P.x, e.y - P.y); if (d < bd) { bd = d; best = e; } }); if (best) { const d = bd || 1; P.fx = (best.x - P.x) / d; P.fy = (best.y - P.y) / d; } }
const WS = { kael: 'sword', lyra: 'staff', eld: 'bowshot', ser: 'wand', dar: 'mace', tho: 'hammer' };
let hs = 0;
function attack() {
  if (!canAct() || P.atkCd > 0) return; const c = CHARS[S.hero], s = st(); aim();
  P.combo = P.comboT > 0 ? (P.combo + 1) % 3 : 0; P.comboT = .75; P.atkCd = P.combo === 2 ? .55 : .4; setM('atk'); P.mt = 0; netFx({ k: 'atk' });
  const cm = P.combo, mult = [1, 1.1, 1.8][cm]; sfx(WS[S.hero]);
  { const was = S.chg || 0; S.chg = Math.min(10, was + 1); if (was < 10 && S.chg === 10) { sfx('ready'); log('Ataque carregado pronto! Aperte R.', 'Combate'); } }
  if (c.ranged) P.pend = { t: .22, fn: () => { const sp = S.hero === 'eld' && cm === 2 ? [-.18, 0, .18] : [0]; sp.forEach(d => { const a = Math.atan2(P.fy, P.fx) + d; shoot(P.x + P.fx * 14, P.y - 42, Math.cos(a), Math.sin(a), c.el, s.at * mult * (sp.length > 1 ? .7 : 1), S.hero === 'eld' ? 520 : 400, 'p', c.el, 0, { kind: S.hero === 'eld' ? 'arrow' : S.hero === 'ser' ? 'orb' : 'bolt' }); }); netFx({ k: 'shot', fx: P.fx, fy: P.fy, col: c.el }); } };
  else P.pend = { t: .16, fn: () => melee(s.at * mult, c.rng * (cm === 2 ? 1.35 : 1), cm) };
}
function melee(dmg, r, cm) {
  const a = Math.atan2(P.fy, P.fx); FX.push({ k: 'slash', x: P.x + P.fx * 30, y: P.y - 40 + P.fy * 16, a, t: 0, life: .22, col: CHARS[S.hero].el }); if (cm === 2) ring(P.x + P.fx * 40, P.y, 60, CHARS[S.hero].el);
  E.forEach(e => { if (e.dead) return; const dx = e.x - P.x, dy = e.y - P.y, d = len(dx, dy); if (d < r + e.r && (dx * P.fx + dy * P.fy) >= -.3 * d) { dmgE(e, dmg + rnd(0, 4), 'phys'); const kb = cm === 2 ? 26 : 9; e.x += dx / (d || 1) * kb; e.y += dy / (d || 1) * kb; if (cm === 2 && !e.boss) e.stun = Math.max(e.stun, .35); sfx(S.hero === 'kael' ? 'swordhit' : 'hit'); } });
}
function charged() {
  if (!canAct()) return; if ((S.chg || 0) < 10) { log('Ataque carregado: ' + (S.chg || 0) + '/10 ataques normais.', 'Combate'); return; }
  S.chg = 0; aim(); setM('cast'); P.mt = 0; P.lock = 1; sfx('charge'); netFx({ k: 'skill' }); P.inv = Math.max(P.inv, 1);
  const h = S.hero, c = CHARS[h], s = st(), foes = r => E.filter(e => !e.dead && len(e.x - P.x, e.y - P.y) < r + e.r);
  P.pend = { t: .85, fn: () => { sfx('special'); shake = 1;
    if (h === 'kael') { ring(P.x, P.y, 180, c.el); ring(P.x + P.fx * 90, P.y + P.fy * 50, 120, '#ffd060'); foes(180).forEach(e => { dmgE(e, s.at * 4.5, 'fire'); e.stun = .8; }); }
    else if (h === 'lyra') { ring(P.x, P.y, 160, c.el); P.hp = Math.min(s.mhp, P.hp + s.mhp * .6); FX.push({ k: 'txt', x: P.x, y: P.y - 100, s: '+' + Math.round(s.mhp * .6), col: '#6f8', t: 0, life: 1 }); foes(160).forEach(e => dmgE(e, s.at * 3, 'water')); }
    else if (h === 'eld') { for (let i = -2; i <= 2; i++) { const a = Math.atan2(P.fy, P.fx) + i * .12; shoot(P.x, P.y - 42, Math.cos(a), Math.sin(a), c.el, s.at * 3.2, 720, 'p', 'wind', 1, { kind: 'arrow' }); } }
    else if (h === 'ser') { ring(P.x, P.y, 230, c.el); foes(230).forEach(e => { e.x += (P.x - e.x) * .5; e.y += (P.y - e.y) * .5; dmgE(e, s.at * 3.5, 'dark'); e.stun = e.boss ? .6 : 2.5; }); }
    else if (h === 'dar') { ring(P.x, P.y, 150, c.el); foes(150).forEach(e => { dmgE(e, s.at * 3.5, 'earth'); e.stun = 1.3; }); }
    else { ring(P.x, P.y, 190, c.el); ring(P.x, P.y, 110, '#fff'); shake = 1.4; foes(190).forEach(e => dmgE(e, s.at * 5, 'earth')); }
  } };
}
function dodge() {
  if (!canAct() || P.dodgeCd > 0) return; let ix = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0) + J.x, iy = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0) + J.y, l = len(ix, iy);
  if (l < .2) { ix = P.fx; iy = P.fy; l = 1; } ix /= l; iy /= l; P.dash = { t: .22, vx: ix * 430, vy: iy * 430 }; P.fx = ix; P.fy = iy; P.inv = Math.max(P.inv, .32); P.dodgeCd = .9; sfx('dodge'); setM('run');
}
function shoot(x, y, fx, fy, col, dmg, spd, from, elem, pierce, o) { PR.push({ x, y, vx: fx * spd, vy: fy * spd, col, dmg, life: 1.1, from, elem, pierce, hit: new Set(), big: pierce ? 1 : 0, kind: o && o.kind }); }
function ring(x, y, r, col) { FX.push({ k: 'ring', x, y, r, col, t: 0, life: .55 }); for (let i = 0; i < 22; i++) { const a = rnd(0, 6.28), v = rnd(60, r * 2.2); FX.push({ k: 'sp', x, y: y - 10, vx: Math.cos(a) * v, vy: Math.sin(a) * v * .6, col, t: 0, life: rnd(.3, .7) }); } }
function skill() {
  if (!canAct() || P.skCd > 0) return; if (!S.skills) { log('Habilidades elementais ainda adormecidas...'); return; } if (P.mp < BALANCE.skillCost) { log('MP insuficiente.'); return; }
  P.mp -= BALANCE.skillCost; P.skCd = BALANCE.skillCd; aim(); setM('cast'); const s = st(), h = S.hero, c = CHARS[h]; netFx({ k: 'skill' });
  const fns = { kael: 'fire', lyra: 'heal', eld: 'wind', ser: 'shadow', dar: 'quake', tho: 'quake' }; sfx(fns[h]);
  P.pend = { t: .3, fn: () => {
    if (h === 'kael') { ring(P.x, P.y, 100, c.el); E.forEach(e => !e.dead && len(e.x - P.x, e.y - P.y) < 100 + e.r && dmgE(e, s.at * 2.2, 'fire')); }
    else if (h === 'lyra') { P.hp = Math.min(s.mhp, P.hp + s.mhp * .4); ring(P.x, P.y, 90, c.el); FX.push({ k: 'txt', x: P.x, y: P.y - 90, s: '+' + Math.round(s.mhp * .4), col: '#6f8', t: 0, life: 1 }); E.forEach(e => !e.dead && len(e.x - P.x, e.y - P.y) < 70 && dmgE(e, s.at, 'water')); }
    else if (h === 'eld') { shoot(P.x, P.y - 40, P.fx, P.fy, c.el, s.at * 2.3, 560, 'p', 'wind', 1); netFx({ k: 'shot', fx: P.fx, fy: P.fy, col: c.el }); }
    else if (h === 'ser') { ring(P.x, P.y, 135, c.el); E.forEach(e => { if (!e.dead && len(e.x - P.x, e.y - P.y) < 135) { dmgE(e, s.at * 1.5, 'dark'); e.stun = e.boss ? .6 : 2.6; } }); }
    else { const r = h === 'dar' ? 110 : 125; ring(P.x, P.y, r, c.el); shake = .6; E.forEach(e => { if (!e.dead && len(e.x - P.x, e.y - P.y) < r) { dmgE(e, s.at * (h === 'dar' ? 1.9 : 2.3), 'earth'); if (h === 'dar') e.stun = .8; } }); }
  } };
}
function hurtP(d) {
  if (P.inv > 0 || P.dead) return; d = Math.round(d * (.9 + Math.random() * .2)); P.hp -= d; P.inv = .7; P.m = 'hurt'; P.mt = 0; sfx('hurt'); shake = .3;
  FX.push({ k: 'txt', x: P.x, y: P.y - 100, s: '-' + d, col: '#f55', t: 0, life: .9 });
  if (P.hp <= 0) { P.dead = true; P.dt = 0; P.m = 'dead'; P.mt = 0; sfx('die'); }
}
function gain(x) {
  S.xp += x; FX.push({ k: 'txt', x: P.x, y: P.y - 120, s: '+' + x + ' XP', col: '#e8c96a', t: 0, life: 1 });
  while (S.lv < 10 && S.xp >= XPT[S.lv]) { S.lv++; const s = st(); P.hp = s.mhp; P.mp = s.mmp; sfx('lvl'); ring(P.x, P.y, 80, '#ffd86a'); log('Nível ' + S.lv + '!', 'Sistema'); }
}
function dmgE(e, d, elem) {
  if (e.dead) return; d = Math.max(1, Math.round(d - (e.def || 0))); if (e.boss && elem === 'fire') d = Math.round(d * 1.25); e.hp -= d; e.hit = .12; hs = Math.max(hs, e.boss ? .07 : .045); if (!e.boss) e.stun = Math.max(e.stun, .12); for (let q = 0; q < 6; q++) FX.push({ k: 'sp', x: e.x, y: e.y - 36, vx: rnd(-120, 120), vy: rnd(-140, 20), col: '#ffe9a0', t: 0, life: .35 });
  FX.push({ k: 'txt', x: e.x + rnd(-8, 8), y: e.y - (e.boss ? 240 : 80), s: String(d), col: '#fff', t: 0, life: .8 }); sfx('hit');
  if (e.hp <= 0) {
    e.dead = true; e.dt = 0;
    if (e.boss) { sfx('boom'); shake = 1.2; bossDead(); } else {
      gain(ET[e.type].xp); S.gold += 2 + (Math.random() * 6 | 0); S.kt.add(e.type); if (e.camp != null) S.campT[e.camp] = BALANCE.respawn;
      if ((e.type === 'ogre' || e.type === 'golem') && Math.random() < .6) { S.ore++; FX.push({ k: 'txt', x: e.x, y: e.y - 110, s: '+1 Minério', col: '#9cf', t: 0, life: 1.2 }); sfx('coin'); }
    }
  }
}
function spawnE(type, x, y, camp) { const t = ET[type], hp = Math.round(t.hp * (1 + BALANCE.enemyScale * S.lv)); E.push({ type, x, y, hp, mhp: hp, at: t.at, sp: t.sp, r: t.r, rng: t.rng, def: t.def || 0, fx: 0, fy: 1, t: Math.random() * 5, ph: 0, cd: rnd(.5, 1.5), wind: 0, am: 0, stun: 0, hit: 0, dead: false, dt: 0, camp, angry: false, mv: 0 }); }
function startWave(types, cb) { const sc = SCN[S.scene]; types.forEach((t, i) => { const a = i / types.length * 6.28 + .5; spawnE(t, Math.max(40, Math.min(sc.w - 40, P.x + Math.cos(a) * 260)), Math.max(80, Math.min(sc.h - 40, P.y + Math.sin(a) * 200))); E[E.length - 1].angry = true; }); wave = { cb }; }
// ---------- IA ----------
function aiE(e, dt) {
  if (!isFinite(e.x) || !isFinite(e.y)) { e.x = P.x + 200; e.y = P.y; }
  e.t += dt; e.hit -= dt; e.am -= dt; if (e.dead) { e.dt += dt; return; } if (e.stun > 0) { e.stun -= dt; e.mv = 0; return; }
  if (e.boss) return aiBoss(e, dt);
  const dx = P.x - e.x, dy = P.y - e.y, dist = len(dx, dy) || 1; e.mv = 0;
  if (!e.angry && dist < 330) e.angry = true; if (e.angry && e.camp != null && dist > 760) e.angry = false; if (!e.angry || P.dead) return;
  if (e.type === 'bat') {
    if (e.dash > 0) { e.dash -= dt; e.x += e.dvx * dt; e.y += e.dvy * dt; e.mv = 1; e.ph += dt * 14; if (!e.hitd && len(P.x - e.x, P.y - e.y) < 32) { e.hitd = 1; hurtP(e.at); } return; }
    if (e.aim > 0) { e.aim -= dt; e.fx = (e.ax - e.x) / (len(e.ax - e.x, e.ay - e.y) || 1); e.fy = (e.ay - e.y) / (len(e.ax - e.x, e.ay - e.y) || 1); if (e.aim <= 0) { const d = len(e.ax - e.x, e.ay - e.y) || 1; e.dvx = (e.ax - e.x) / d * 420; e.dvy = (e.ay - e.y) / d * 420; e.dash = .4; e.hitd = 0; e.cd = 2.2; } return; }
    const a = e.t * 1.3 + (e.camp || 0), tx = P.x + Math.cos(a) * 150, ty = P.y + Math.sin(a) * 100, d = len(tx - e.x, ty - e.y) || 1; e.x += (tx - e.x) / d * e.sp * dt; e.y += (ty - e.y) / d * e.sp * dt; e.mv = 1; e.ph += dt * 12; e.fx = dx / dist; e.fy = dy / dist;
    e.cd -= dt; if (e.cd <= 0 && dist < 400) { e.aim = .6; e.ax = P.x; e.ay = P.y; } return;
  }
  const T_ = ET[e.type];
  if (e.wind > 0) { e.wind -= dt; if (e.wind <= 0) { e.am = .4; if (len(P.x - e.x, P.y - e.y) < e.rng + P.r + 10) hurtP(e.at); FX.push({ k: 'ring', x: e.x + e.fx * 20, y: e.y, r: e.rng, col: '#f84', t: 0, life: .3 }); e.cd = 1.1; } }
  else { e.fx = dx / dist; e.fy = dy / dist; e.cd -= dt; if (dist > e.rng * .8) { e.x += dx / dist * e.sp * dt; e.y += dy / dist * e.sp * dt; e.mv = 1; e.ph += dt * 10; } else if (e.cd <= 0) e.wind = T_.wind; }
  if (e.type === 'golem') { if (e.wc == null) e.wc = 3; e.wc -= dt; if (e.wc <= 0 && dist < 260 && !e.tele) { e.wc = 5; e.tele = { x: e.x, y: e.y, t: 1, r: 150 }; } if (e.tele) { e.tele.t -= dt; if (e.tele.t <= 0) { if (len(P.x - e.tele.x, P.y - e.tele.y) < e.tele.r + 10) hurtP(e.at * .9); ring(e.tele.x, e.tele.y, e.tele.r, '#ff8a30'); sfx('quake'); shake = .5; e.am = .4; e.tele = null; } } }
}
function aiBoss(e, dt) {
  const p2 = e.hp < e.mhp * .4; if (p2 && !e.p2) { e.p2 = 1; sfx('roar'); shake = 1; log('O Carrasco entra em fúria e solta seus cães!', 'Aviso'); spawnE('wolf', e.x - 120, e.y + 60); spawnE('wolf', e.x + 120, e.y + 60); E.slice(-2).forEach(w => w.angry = true); }
  const dx = P.x - e.x, dy = P.y - e.y, dist = len(dx, dy) || 1; e.mv = 0; e.am -= dt; if (P.dead) return;
  if (!e.atk) { e.fx = dx / dist; e.fy = dy / dist; }
  e.cd -= dt;
  if (e.atk) { e.atk.t -= dt; if (e.atk.t <= 0) { const a = e.atk; e.atk = null; e.cd = p2 ? .9 : 1.8; e.am = .5;
    if (a.k === 'slam') { ring(a.x, a.y, a.r, '#c07030'); sfx('quake'); shake = .8; if (len(P.x - a.x, P.y - a.y) < a.r) hurtP(e.at * 1.2); }
    else if (a.k === 'spin') { ring(e.x, e.y, a.r, '#ff4030'); sfx('boom'); shake = .7; if (len(P.x - e.x, P.y - e.y) < a.r) hurtP(e.at); }
    else { sfx('boom'); const ok = len(P.x - a.tx, P.y - a.ty) < 70; FX.push({ k: 'ring', x: a.tx, y: a.ty, r: 60, col: '#aaa', t: 0, life: .4 }); if (ok) { hurtP(e.at * .8); P.stun = .9; P.pullT = .3; P.px = e.x; P.py = e.y + 70; log('O Carrasco puxa você com a corrente!', 'Aviso'); } } } }
  else { if (dist > 130) { const sp = p2 ? 82 : 52; e.x += dx / dist * sp * dt; e.y += dy / dist * sp * dt; e.mv = 1; e.ph += dt * 8; }
    if (e.cd <= 0) { const r = Math.random(); e.atk = r < .4 ? { k: 'slam', t: p2 ? .7 : 1, x: P.x, y: P.y, r: 125 } : r < .7 ? { k: 'spin', t: .9, r: 150 } : { k: 'chain', t: .9, tx: P.x, ty: P.y }; sfx('roar'); } }
}
function updPlayer(dt) {
  P.mt += dt; P.comboT -= dt; P.dodgeCd -= dt; P.lock -= dt; P.atkCd -= dt; P.skCd -= dt; P.inv -= dt; P.stun -= dt; warnT -= dt; P.mp = Math.min(st().mmp, P.mp + dt * 4);
  if (P.pullT > 0) { P.pullT -= dt; P.x += (P.px - P.x) * Math.min(1, dt * 10); P.y += (P.py - P.y) * Math.min(1, dt * 10); }
  if (P.dead) { P.dt += dt; if (P.dt > 2.4) { P.dead = false; P.hp = st().mhp / 2; P.inv = 2; P.m = 'idle'; if (S.scene === 'village') { P.x = 750; P.y = 470; } } return; }
  if (P.pend) { P.pend.t -= dt; if (P.pend.t <= 0) { const f = P.pend.fn; P.pend = null; f(); } }
  if (P.dash) { const d = P.dash; d.t -= dt; const sc = SCN[S.scene]; let nx = P.x + d.vx * dt, ny = P.y + d.vy * dt; const hit = (x, y) => sc.col.some(r => x > r[0] - 6 && x < r[0] + r[2] + 6 && y > r[1] && y < r[1] + r[3] + 10); if (hit(nx, P.y)) nx = P.x; if (hit(P.x, ny)) ny = P.y; P.x = Math.max(20, Math.min(sc.w - 20, nx)); P.y = Math.max(50, Math.min(sc.h - 14, ny)); P.ph += dt * 20; FX.push({ k: 'ghost', x: P.x, y: P.y, fx: P.fx, fy: P.fy, t: 0, life: .25 }); if (d.t <= 0) P.dash = null; return; }
  if (held.a || keys['j'] || keys[' ']) attack(); if (held.s || keys['k'] || keys['t']) skill();
  const locked = P.stun > 0 || P.lock > 0 || (P.m === 'atk' && P.mt < .4) || (P.m === 'cast' && P.mt < .6) || (P.m === 'hurt' && P.mt < .25);
  if (!locked && (P.m === 'atk' || P.m === 'cast' || P.m === 'hurt')) setM('idle');
  let ix = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0) + J.x, iy = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0) + J.y, l = len(ix, iy); if (l > 1) { ix /= l; iy /= l; l = 1; }
  if (!locked && !dlgOn && !cut) {
    if (l > .15) { const sp = CHARS[S.hero].sp * (l > .75 ? 1.2 : .8) * dt, sc = SCN[S.scene]; let nx = P.x + ix * sp, ny = P.y + iy * sp;
      const hit = (x, y) => sc.col.some(r => x > r[0] - 6 && x < r[0] + r[2] + 6 && y > r[1] && y < r[1] + r[3] + 10), br = (x, y) => S.scene === 'village' && x > 695 && x < 805 && y > 505 && y < 600;
      if (!br(nx, P.y) && hit(nx, P.y)) nx = P.x; if (!br(P.x, ny) && !br(nx, ny) && hit(nx, ny)) ny = P.y;
      P.x = Math.max(20, Math.min(sc.w - 20, nx)); P.y = Math.max(50, Math.min(sc.h - 14, ny)); P.fx = ix / l; P.fy = iy / l;
      setM(l > .75 ? 'run' : 'walk'); P.ph += dt * (l > .75 ? 15 : 10); P.stepT -= dt; if (P.stepT < 0) { P.stepT = .28; sfx('step'); }
    } else if (P.m === 'walk' || P.m === 'run') setM('idle');
  }
}
function updPR(dt) {
  PR.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; if (Math.random() < .7) FX.push({ k: 'sp', x: p.x, y: p.y, vx: rnd(-20, 20), vy: rnd(-20, 20), col: p.col, t: 0, life: .25 });
    if (p.from === 'p') E.forEach(e => { if (!e.dead && !p.hit.has(e) && len(e.x - p.x, e.y - (e.boss ? 90 : 36) - p.y) < e.r + 16 + (e.boss ? 40 : 0)) { dmgE(e, p.dmg + rnd(0, 3), p.elem === 'wind' ? 'wind' : 'phys'); p.hit.add(e); if (p.kind === 'arrow') sfx('arrowhit'); if (p.kind === 'orb') { ring(p.x, p.y + 30, 55, '#b070ff'); E.forEach(o => { if (!o.dead && o !== e && len(o.x - p.x, o.y - p.y) < 70) dmgE(o, p.dmg * .5, 'dark'); }); } if (p.kind === 'bolt') P.hp = Math.min(st().mhp, P.hp + st().mhp * .02); if (!p.pierce) p.life = 0; } });
    else if (p.from === 'e' && !P.dead && len(P.x - p.x, P.y - 40 - p.y) < 18) { hurtP(p.dmg); p.life = 0; } });
  PR = PR.filter(p => p.life > 0);
}
function update(dt) {
  T += dt; shake = Math.max(0, shake - dt * 2);
  Object.values(R).forEach(r => { const dx = r.tx - r.x, dy = r.ty - r.y, d = len(dx, dy); r.x += dx * Math.min(1, dt * 10); r.y += dy * Math.min(1, dt * 10); r.ph += d * .07; r.t += dt; if (r.say) { r.sayT -= dt; if (r.sayT < 0) r.say = null; } if ((r.m === 'walk' || r.m === 'run') && d < 1) r.m = 'idle'; });
  if (cut) { cut.t += dt; return; }
  if (TB) { updTB(dt); return; }
  if (S.scene === 'title' || !P || paused) return; if (hs > 0) { hs -= dt; return; }
  if (!dlgOn) { updPlayer(dt); E.forEach(e => aiE(e, dt)); updPR(dt);
    if (S.scene === 'campos') CAMPS.forEach((c, i) => { if (!E.some(e => e.camp === i)) { S.campT[i] = (S.campT[i] || 0) - dt; if (S.campT[i] <= 0) spawnE(c[0], c[1], c[2], i); } }); }
  FX.forEach(f => { f.t += dt; if (f.k === 'sp') { f.x += f.vx * dt; f.y += f.vy * dt; } }); FX = FX.filter(f => f.t < f.life); E = E.filter(e => !(e.dead && e.dt > 1));
  boss = E.find(e => e.boss && !e.dead) || null;
  if (wave && E.every(e => e.dead)) { const cb = wave.cb; wave = null; setTimeout(cb, 700); }
  zones(); const now = performance.now(); if (netOn && now - lastSend > 100) { lastSend = now; sendN('p', { x: Math.round(P.x), y: Math.round(P.y), fx: +P.fx.toFixed(2), fy: +P.fy.toFixed(2), m: P.m, sc: S.scene }); }
}
// ---------- HISTÓRIA E MISSÕES ----------
function loadScene(n, x, y) { S.scene = n; P.x = x; P.y = y; E = []; PR = []; FX = []; wave = null; A.theme(n === 'village' || n === 'campos' ? 'calm' : n === 'boss' ? 'boss' : 'dungeon'); if (n === 'campos') S.campT = {}; }
function setObj(t) { objective = t; }
function warn(m) { if (warnT > 0) return; warnT = 4; say([m], 'Aviso'); }
function zones() {
  if (S.scene === 'village') {
    if (P.y < 40 && Math.abs(P.x - 750) < 70) { if (S.quest >= 3) { loadScene('campos', 900, 1040); if (!S.seenCampos) { S.seenCampos = 1; setObj('Investigue os Campos: encontre as 3 pistas (' + S.clues.length + '/3)'); playCut('card3', () => say(['Os Campos de Valdora se abrem diante de vocês. Criaturas acorrentadas vagam por aqui, e elas voltam sempre: ótimo para ganhar experiência, perigoso para quem se descuida.', 'Procure por sinais da Ordem: soldados mortos, a origem do veneno e um acampamento escondido. Siga a seta dourada no alto da tela.'], 'Campos de Valdora')); } } else { P.y = 70; warn('O portão norte está fechado durante a noite. Converse com os moradores primeiro.'); } }
    if (S.quest >= 3 && P.y > 800 && Math.abs(P.x - 750) < 70) { if (S.clues.length < 3) { P.y = 770; warn('Auren, ao longe: "Ainda não sabem o que há lá embaixo. Investiguem os Campos ao norte antes de descer."'); } else if (S.lv < BALANCE.dungeonMinLv) { P.y = 770; warn('Auren, ao longe: "As ruínas estão cheias do mesmo veneno do rio. Volte com mais força (nível ' + BALANCE.dungeonMinLv + '). Os Campos ao norte servem para isso."'); } else enterDungeon(); }
  } else if (S.scene === 'campos' && P.y > 1070 && Math.abs(P.x - 900) < 110) { loadScene('village', 750, 80); setObj(S.quest >= 4 ? '' : S.clues.length < 3 ? 'Investigue os Campos: encontre as 3 pistas (' + S.clues.length + '/3)' : S.lv >= BALANCE.dungeonMinLv ? 'Desça às ruínas sob a ponte antiga (sul do rio)' : 'Treine até o nível ' + BALANCE.dungeonMinLv + ' e desça às ruínas'); }
  else if (S.scene === 'd1' && S.doorOpen && P.y < 70 && Math.abs(P.x - 480) < 60) { S.doorOpen = 0; loadScene('d2', 480, 490); playCut('vision', () => { A.theme('battle'); setObj('Derrote os guardiões corrompidos da Galeria das Raízes'); startWave(['ogre', 'ogre', 'golem', 'bat', 'bat'], () => { S.doorOpen = 1; setObj('Siga pela porta ao norte'); A.theme('dungeon'); }); }); }
  else if (S.scene === 'd2' && S.doorOpen && P.y < 70 && Math.abs(P.x - 480) < 60) { S.doorOpen = 0; loadScene('boss', 480, 490); setObj('Derrote o Carrasco'); P.inv = 1; playCut('card5', () => playCut('boss', () => startTB())); }
}
function enterDungeon() {
  S.quest = 4; loadScene('d1', 480, 490); setObj('Derrote as criaturas do Santuário das Raízes');
  playCut('card4', () => say(['Entrada subterrânea: raízes se movem sozinhas e correntes arrastam pelo chão. Os monstros de cima vieram daqui.'], 'Santuário das Raízes', () => { A.theme('battle'); startWave(['wolf', 'wolf', 'wolf', 'bat', 'bat'], () => { S.doorOpen = 1; setObj('Siga pela porta ao norte'); A.theme('dungeon'); }); }));
}
function bossDead() {
  setObj(''); A.theme('sad');
  setTimeout(() => { typeLine('Entre os destroços do Carrasco há dois objetos: um cristal capaz de purificar a água de Valdora e um fragmento de metal antigo, marcado pela Ordem. O que seu grupo faz?', 'A escolha', null, [['Preservar o cristal (Ascensão)', () => finish('cristal')], ['Levar o fragmento (Redenção)', () => finish('frag')]]); }, 2600);
}
function finish(c) {
  S.choice = c; hideDlg(); gain(500); S.gold += 120; CUTS.ending.slides[1].tx = (c === 'cristal' ? 'O cristal devolve a água limpa ao rio de Valdora. ' : 'O fragmento antigo vai com vocês, para descobrir quem está por trás dos experimentos. ') + CUTS.ending.slides[1].tx;
  playCut('ending', () => { $('#end').style.display = 'flex'; $('#end').innerHTML = `<h1>FIM DO ARCO I</h1><h2>AS CINZAS DE VALDORA</h2><p>Nível ${S.lv} · ${S.xp} XP · ${S.gold} moedas<br>Missões concluídas: ${Object.values(S.qs).filter(v => v === 2).length}/4 · Escolha: ${c === 'cristal' ? 'cristal' : 'fragmento'}<br>Próximo: Arco II — A Cidadela Norte</p><button class="big" onclick="location.reload()">Jogar de novo</button>`; });
}
function qTalk(id, give, active, done, who) {
  const q = QUESTS[id], s = S.qs[id] || 0, p = q.prog();
  if (s === 0) say(give, who, () => { S.qs[id] = 1; log('Missão aceita: ' + q.n, 'Diário'); });
  else if (s === 1 && p >= q.need) say(done, who, () => { S.qs[id] = 2; gain(q.xp); S.gold += q.gold; sfx('lvl'); log('Missão concluída: ' + q.n + ' (+' + q.xp + ' XP, +' + q.gold + ' moedas)', 'Diário'); });
  else if (s === 1) say([active + ' (' + p + '/' + q.need + ')'], who);
  else say(['Obrigado por tudo. Valdora não esquecerá o que você fez.'], who);
}
function talk(n) {
  const id = n.id, w = n.n;
  if (S.quest < 3) {
    const L = { auren: ['"Engraçado como as pessoas passam a vida procurando respostas, sem perceber que algumas perguntas deveriam permanecer adormecidas."', '"Apenas um lugar tranquilo para descansar. Embora pareça que a tranquilidade esteja ficando cada vez mais rara."', '"Quem escolhe o silêncio costuma ter motivos. Você, por exemplo, parece carregar algo que ainda não nomeou."'], ferr: ['Goblins levaram meu minério e agora essas criaturas inquietas rondam o vale... Que tempos! Tome estas moedas para as primeiras armas.', 'Esse cheiro de enxofre no vento... meu avô dizia que era o hálito do que dorme sob Valdora. Bobagem de velho, ou assim eu achava.'], taver: ['Dizem que há criaturas nas montanhas e que a água do rio anda estranha. Rumores de taverna... por enquanto.', 'Há três noites um soldado de cinza passou por aqui perguntando pela ponte antiga. Não deixou nome, só uma corrente suja de lama no balcão.'], mor: ['Os animais estão inquietos esta semana. Algo ruim vem aí, eu sinto.'], mira: ['Você ouviu o sino da praça? Ele toca sozinho quando eu fico triste... Será que é bobagem?', 'O viajante da fonte disse que eu tenho "olhos de quem escuta". Não entendi, mas gostei.'], farm: ['Tenho andado preocupado com meus animais. Volte mais tarde, rapaz.'] };
    say(L[id], w, () => { if (['auren', 'ferr', 'taver'].includes(id) && !S.talked[id]) { S.talked[id] = 1; if (id === 'ferr') { S.gold += 30; sfx('coin'); } }
      if (S.quest === 0 && S.talked.auren && S.talked.ferr && S.talked.taver) { S.quest = 1; setObj(''); setTimeout(night, 600); } else if (S.quest === 0) setObj('Converse com os moradores (' + Object.keys(S.talked).length + '/3): Auren, Ferreiro, Taverneiro'); });
    return;
  }
  if (id === 'auren') qTalk('palavras', ['"Há inscrições antigas espalhadas pelos Campos. Quem as lê, lembra. Encontre três delas e me diga o que dizem."'], '"Continue procurando. As pedras só falam com quem tem paciência."', ['"Então você leu... Fico feliz que alguém ainda leia. Guarde isso: nem todo selo foi feito para proteger o mundo."'], w);
  else if (id === 'ferr') qTalk('minerio', ['Os goblins roubaram meu minério e, agora que vi essas criaturas, tenho certeza de que os Ciclopes e Golens o carregam. Traga-me cinco peças e forjo algo à altura!'], 'Ainda faltam peças de minério. Os Ciclopes e Golens nos Campos costumam carregá-lo.', ['Esse é o minério! Cinco peças perfeitas. Tome a recompensa, você merece.'], w);
  else if (id === 'taver') qTalk('rumores', ['Rumores novos: dizem que há quatro tipos de criaturas rondando os Campos. Cérbero, Morcego, Ciclope e Golem. Derrote um de cada e me conte como é lutar contra eles!'], 'Ainda não enfrentou todos os tipos de criatura, hein?', ['Você enfrentou todos! Pague uma rodada de histórias, e fique com esta recompensa.'], w);
  else if (id === 'farm') qTalk('animais', ['Perdi três ovelhas nos Campos na noite do ataque. Se encontrá-las, mande-as de volta... ou me avise onde estão!'], 'Ainda faltam ovelhas. Procure pelos Campos, perto de pedras e árvores.', ['Minhas ovelhas! Você é um herói de verdade. Tome a recompensa.'], w);
  else if (id === 'mor') say(['A água ficou turva... Dizem que as ruínas sob a ponte estão ligadas ao rio. Quem for lá, vá forte (nível ' + BALANCE.dungeonMinLv + ').'], w);
  else say(['A pedra azul do viajante brilha quando eu chego perto... ele finge que não percebe. Você também viu?'], w);
}
function reunion() {
  const h = S.hero, mates = Object.keys(CHARS).filter(k => k !== 'aur' && k !== h && CHARS[k].fac === CHARS[h].fac), ids = [h, ...mates].slice(0, 3);
  CUTS.reunion.slides = [{ bg: 'gold', who: 'Os heróis se reúnem', act: ids.map((k, i) => ({ c: k, x: 250 + i * 230, m: 'idle' })), tx: 'Na estrada, os caminhos se cruzam. Soldados mortos, um rio envenenado e um acampamento abandonado contam a mesma história: a Ordem do Domínio esteve em Valdora e abriu algo sob a ponte antiga. Nenhum deles sabe ainda por que seus poderes despertaram, mas todos sentem que a resposta está lá embaixo.' }, { bg: 'night', who: 'Auren', act: [{ c: 'aur', x: 480, m: 'idle' }], tx: '"Vocês estão mais perto do que imaginam." O viajante some entre as árvores antes que alguém responda. A ponte antiga espera ao sul de Valdora.' }];
  playCut('reunion', () => { setObj(S.lv >= BALANCE.dungeonMinLv ? 'Volte a Valdora e desça às ruínas sob a ponte antiga (sul do rio)' : 'Treine até o nível ' + BALANCE.dungeonMinLv + ' e desça às ruínas sob a ponte antiga'); A.theme('calm'); });
}
function interact() {
  if (!canAct()) return;
  const ch = CHESTS.find(c => c.s === S.scene && !S.chests[c.id] && len(c.x - P.x, c.y - P.y) < 55); if (ch) { S.chests[ch.id] = 1; sfx('chest'); S.gold += 25; gain(80); log('Baú: +25 moedas e +80 XP', 'Sistema'); return; }
  if (S.scene === 'campos') {
    const ci = CLUES.findIndex((q, i) => len(q.x - P.x, q.y - P.y) < 70); if (ci >= 0) { const q = CLUES[ci], first = !S.clues.includes(ci); say([...q.t, q.r[S.hero]], first ? 'Pista ' + (S.clues.length + 1) + '/3' : CHARS[S.hero].n, () => { if (first) { S.clues.push(ci); sfx('chest'); gain(60); if (S.clues.length >= 3) reunion(); else setObj('Investigue os Campos: encontre as 3 pistas (' + S.clues.length + '/3)'); } }); return; }
    const si = SHEEP.findIndex((s, i) => len(s.x - P.x, s.y - P.y) < 55); if (si >= 0) { if (S.sheep.includes(si)) { say(['A ovelha já foi marcada. Tomás virá buscá-la.'], 'Ovelha'); return; } S.sheep.push(si); sfx('coin'); say(['Beeeee! Você encontrou uma ovelha perdida. (' + S.sheep.length + '/3)'], 'Ovelha'); return; }
    const gi = GLYPHS.findIndex(q => len(q.x - P.x, q.y - P.y) < 60); if (gi >= 0) { if (!S.glyph.includes(gi)) S.glyph.push(gi); sfx('chest'); say(['Inscrição antiga: "' + GLYPHS[gi].t + '"'], 'Pedra rúnica', () => log('Inscrições lidas: ' + S.glyph.length + '/3', 'Diário')); return; }
  }
  if (S.scene === 'village') { const n = NPCS.find(n => len(n.x - P.x, n.y - P.y) < 62); if (n) talk(n); }
}
function night() {
  playCut('card2', () => playCut('night', () => { S.quest = 2; setObj('Defenda Valdora dos Corrompidos!'); A.theme('battle'); startWave(['wolf', 'wolf', 'wolf', 'bat'], () => { S.quest = 2.5; playCut('awaken', () => { S.skills = true; S.quest = 3; setObj('Fortaleça-se nos Campos (portão norte) e aceite missões. Habilidade: K / ✦'); A.theme('calm'); const s = st(); P.hp = s.mhp; P.mp = s.mmp; gain(60); }); }); }));
}
// ---------- REDE ----------
function connect() {
  try {
    const q = `room=${encodeURIComponent(S.room)}&id=${S.id}&name=${encodeURIComponent(S.name)}&hero=${S.hero}`, es = new EventSource('/api/join?' + q);
    es.onopen = () => { netOn = true; $('#net').textContent = '🟢 sala ' + S.room; }; es.onerror = () => { netOn = false; $('#net').textContent = '🔴 reconectando…'; };
    es.addEventListener('hello', e => JSON.parse(e.data).players.forEach(p => addR(p))); es.addEventListener('join', e => { const p = JSON.parse(e.data); addR(p); log(p.name + ' entrou na sala.', 'Sala'); });
    es.addEventListener('leave', e => { const p = JSON.parse(e.data); if (R[p.id]) { log(R[p.id].name + ' saiu.', 'Sala'); delete R[p.id]; } });
    es.addEventListener('msg', e => { const m = JSON.parse(e.data), r = R[m.id] || addR({ id: m.id, name: m.name, hero: 'kael' }), d = m.data || {};
      if (m.type === 'p') { r.tx = d.x; r.ty = d.y; r.fx = d.fx || 0; r.fy = d.fy == null ? 1 : d.fy; if (d.m !== r.m) { r.m = d.m; r.t = 0; } r.sc = d.sc; }
      else if (m.type === 'chat') { r.say = d.t; r.sayT = 5; log(d.t, r.name); }
      else if (m.type === 'fx' && r.sc === S.scene) { if (d.k === 'skill') ring(r.x, r.y, 90, CHARS[r.hero].el); if (d.k === 'shot') PR.push({ x: r.x, y: r.y - 40, vx: d.fx * 430, vy: d.fy * 430, col: d.col, life: 1, from: 'v', hit: new Set() }); } });
  } catch (e) { $('#net').textContent = 'offline'; }
}
function addR(p) { return R[p.id] = { id: p.id, name: p.name, hero: CHARS[p.hero] ? p.hero : 'kael', x: p.x || 750, y: p.y || 450, tx: p.x || 750, ty: p.y || 450, fx: 0, fy: 1, m: 'idle', t: 0, ph: 0, sc: 'village' }; }
function sendN(type, data) { if (!netOn) return; fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ room: S.room, id: S.id, type, data }), keepalive: true }).catch(() => { }); }
const netFx = d => sendN('fx', d);
// ---------- DESENHO ----------
function grass(x0, y0, cols, rows, pal) { for (let ty = y0; ty < y0 + rows; ty++) for (let tx = x0; tx < x0 + cols; tx++) { const h = hash(tx, ty); g.fillStyle = h < .5 ? pal[0] : h < .85 ? pal[1] : pal[2]; g.fillRect(tx * 32, ty * 32, 33, 33); if (h > .9) { g.fillStyle = pal[3]; g.fillRect(tx * 32 + 8, ty * 32 + 10, 2, 6); g.fillRect(tx * 32 + 14, ty * 32 + 12, 2, 5); } } }
function tree(x, y, i) { g.fillStyle = '#0003'; g.beginPath(); g.ellipse(x, y + 4, 22, 8, 0, 0, 7); g.fill(); g.fillStyle = '#5a3a1e'; g.fillRect(x - 5, y - 28, 10, 32); const s = 1 + hash(i, 3) * .4; g.fillStyle = '#1f5a2a'; g.beginPath(); g.arc(x, y - 44, 26 * s, 0, 7); g.fill(); g.fillStyle = '#2a7a38'; g.beginPath(); g.arc(x - 8, y - 50, 16 * s, 0, 7); g.fill(); }
function chests() { CHESTS.forEach(c => { if (c.s === S.scene && !S.chests[c.id]) { g.fillStyle = '#c8902a'; g.fillRect(c.x - 12, c.y - 10, 24, 16); g.fillStyle = '#6a4a14'; g.fillRect(c.x - 12, c.y - 10, 24, 5); g.fillStyle = '#fff9'; g.fillRect(c.x - 2, c.y - 4, 4, 5); } }); }
function blitBG(n) { const b = getBG(n), x = Math.max(0, Math.floor(cam.x)), y = Math.max(0, Math.floor(cam.y)), w = Math.min(W, b.width - x), h = Math.min(H, b.height - y); g.drawImage(b, x, y, w, h, x, y, w, h); }
function shimmer(rx, ry, rw, rh, col) { g.fillStyle = col; for (let i = 0; i < rw / 40; i++) { const px = rx + ((i * 53 + T * 22) % rw), py = ry + 6 + (i * 17) % Math.max(8, rh - 12); if (px > cam.x - 20 && px < cam.x + W + 20 && py > cam.y - 20 && py < cam.y + H + 20) g.fillRect(px, py, 18, 2); } }
function drawVillage() {
  blitBG('village'); shimmer(0, 520, 700, 60, 'rgba(255,255,255,.35)'); shimmer(800, 520, 700, 60, 'rgba(255,255,255,.35)');
  g.fillStyle = '#6fb4c8'; g.beginPath(); g.arc(775, 372, 22 + Math.sin(T * 3) * 1.5, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.arc(770, 366, 7, 0, 7); g.fill();
  g.font = '12px Georgia'; g.textAlign = 'center'; [['Ferreiro', 275, 62], ['Taverna do Javali', 740, 42], ['Casa de cura', 1175, 62], ['Casa de Kael', 265, 262]].forEach(([n, x, y]) => { g.fillStyle = '#000a'; g.fillText(n, x + 1, y + 1); g.fillStyle = '#f4e6c0'; g.fillText(n, x, y); });
  if (S.quest >= 3) { g.fillStyle = '#e8a33d'; g.font = 'bold 13px Georgia'; g.fillText('▲ Campos de Valdora', 750, 70); g.fillStyle = `rgba(232,163,61,${.3 + .2 * Math.sin(T * 4)})`; g.beginPath(); g.arc(750, 840, 46, 0, 7); g.fill(); g.fillStyle = '#e8a33d'; g.fillText('▼ Ruínas subterrâneas (nv ' + BALANCE.dungeonMinLv + ')', 750, 800); } g.textAlign = 'left';
  chests();
}
function drawCampos() {
  blitBG('campos'); shimmer(0, 0, 100, 1100, 'rgba(140,255,160,.35)');
  g.fillStyle = `rgba(232,163,61,${.3 + .2 * Math.sin(T * 4)})`; g.beginPath(); g.arc(900, 1070, 40, 0, 7); g.fill(); g.fillStyle = '#e8a33d'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText('▼ Valdora', 900, 1040); g.textAlign = 'left';
  CLUES.forEach((q, i) => { const done = S.clues.includes(i); g.fillStyle = '#0005'; g.beginPath(); g.ellipse(q.x, q.y + 4, 30, 9, 0, 0, 7); g.fill();
    if (i === 0) { [[-18, 0], [8, 6], [22, -4]].forEach(([dx, dy]) => { g.fillStyle = '#3a4048'; g.fillRect(q.x + dx - 8, q.y + dy - 6, 18, 8); g.fillStyle = '#aab'; g.fillRect(q.x + dx - 8, q.y + dy - 6, 6, 8); }); g.fillStyle = '#5a2a2a'; g.fillRect(q.x - 3, q.y - 30, 3, 28); g.fillStyle = '#8a3a3a'; g.fillRect(q.x, q.y - 30, 16, 10); }
    else if (i === 1) { g.fillStyle = '#5a4a32'; g.fillRect(q.x - 12, q.y - 22, 24, 24); g.fillStyle = '#3a2a1a'; g.fillRect(q.x - 12, q.y - 14, 24, 3); g.fillStyle = 'rgba(100,255,120,.6)'; g.beginPath(); g.ellipse(q.x + 14, q.y + 4, 22, 8, 0, 0, 7); g.fill(); }
    else { g.fillStyle = '#7a6a52'; g.beginPath(); g.moveTo(q.x - 34, q.y); g.lineTo(q.x, q.y - 50); g.lineTo(q.x + 34, q.y); g.fill(); g.fillStyle = '#5a4a38'; g.beginPath(); g.moveTo(q.x, q.y - 50); g.lineTo(q.x + 34, q.y); g.lineTo(q.x + 6, q.y); g.fill(); g.fillStyle = '#2a1a0a'; g.fillRect(q.x - 6, q.y - 20, 12, 20); }
    if (!done) { g.fillStyle = `rgba(255,220,100,${.7 + .3 * Math.sin(T * 5 + i)})`; g.font = 'bold 22px Georgia'; g.textAlign = 'center'; g.fillText('?', q.x, q.y - 62 - Math.abs(Math.sin(T * 3)) * 6); g.textAlign = 'left'; } });
  chests();
  SHEEP.forEach((s, i) => { g.fillStyle = '#0004'; g.beginPath(); g.ellipse(s.x, s.y + 4, 17, 6, 0, 0, 7); g.fill(); g.fillStyle = S.sheep.includes(i) ? '#c8d4e0' : '#efeadc'; g.beginPath(); g.ellipse(s.x, s.y - 10, 15, 11, 0, 0, 7); g.fill(); g.fillStyle = '#e8e2d0'; g.beginPath(); g.arc(s.x - 6, s.y - 16, 7, 0, 7); g.arc(s.x + 4, s.y - 17, 7, 0, 7); g.fill(); g.fillStyle = '#2a2a2a'; g.beginPath(); g.arc(s.x + 14, s.y - 12, 6, 0, 7); g.fill(); g.fillRect(s.x - 8, s.y - 2, 3, 8); g.fillRect(s.x + 5, s.y - 2, 3, 8); });
  GLYPHS.forEach((q, i) => { g.fillStyle = '#0004'; g.fillRect(q.x - 18, q.y - 4, 40, 10); g.fillStyle = '#7a7668'; g.fillRect(q.x - 14, q.y - 46, 28, 48); g.fillStyle = '#9a9684'; g.fillRect(q.x - 14, q.y - 46, 9, 48); g.fillStyle = S.glyph.includes(i) ? '#8fa' : '#4cf'; g.globalAlpha = .6 + .4 * Math.sin(T * 3 + i); g.fillRect(q.x - 6, q.y - 36, 12, 3); g.fillRect(q.x - 3, q.y - 30, 6, 14); g.globalAlpha = 1; });
}
function drawDungeon() {
  blitBG(S.scene === 'boss' ? 'd1' : S.scene);
  if (S.doorOpen) { g.fillStyle = `rgba(255,230,150,${.3 + .2 * Math.sin(T * 5)})`; g.fillRect(430, 0, 100, 60); g.fillStyle = '#e8a33d'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText('▲ avançar', 480, 82); g.textAlign = 'left'; }
  if (S.scene === 'd2') for (let i = 0; i < 5; i++) { const gx = [200, 760, 480, 300, 680][i], gy = [200, 200, 330, 450, 450][i], pr = .6 + .4 * Math.sin(T * 2 + i); const gr = g.createRadialGradient(gx, gy, 2, gx, gy, 60); gr.addColorStop(0, `rgba(80,255,190,${.6 * pr})`); gr.addColorStop(1, 'rgba(80,255,190,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(gx, gy, 62, 34, 0, 0, 7); g.fill(); g.strokeStyle = `rgba(150,255,220,${.7 * pr})`; g.lineWidth = 2; g.beginPath(); g.ellipse(gx, gy, 34, 18, 0, 0, 7); g.stroke(); }
}
function drawE(e) {
  const ty = e.boss ? { spr: 'exec', sc: 1.25 } : ET[e.type], al = e.dead ? Math.max(0, 1 - e.dt * 1.1) : 1, m = e.dead ? 'dead' : e.am > 0 ? 'atk' : e.mv ? 'walk' : 'idle', fly = ty.fly ? ty.fly + Math.sin(e.t * 5) * 5 : 0;
  drawSpr(g, ty.spr, e.x, e.y, { fx: e.fx, fy: e.fy, m, t: e.dead ? e.dt : e.am > 0 ? (e.boss ? .5 : .4) - e.am : 0, ph: e.ph, sc: ty.sc, a: al, fly, flash: e.hit > 0 });
  if (e.tele) { g.strokeStyle = `rgba(255,60,40,${.5 + .5 * Math.sin(T * 20)})`; g.lineWidth = 3; g.beginPath(); g.arc(e.tele.x, e.tele.y, e.tele.r, 0, 7); g.stroke(); }
  if (e.wind > 0) { g.strokeStyle = 'rgba(255,60,40,.7)'; g.lineWidth = 2; g.beginPath(); g.arc(e.x, e.y, e.rng, 0, 7); g.stroke(); }
  if (e.aim > 0) { g.strokeStyle = 'rgba(255,60,40,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(e.x, e.y - 30); g.lineTo(e.ax, e.ay - 20); g.stroke(); }
  if (e.atk) { const a = e.atk; g.fillStyle = `rgba(255,40,30,${.15 + .15 * Math.sin(T * 18)})`; g.strokeStyle = 'rgba(255,60,40,.9)'; g.lineWidth = 3; if (a.k === 'slam') { g.beginPath(); g.arc(a.x, a.y, a.r, 0, 7); g.fill(); g.stroke(); } else if (a.k === 'spin') { g.beginPath(); g.arc(e.x, e.y, a.r, 0, 7); g.fill(); g.stroke(); } else { g.beginPath(); g.moveTo(e.x, e.y - 60); g.lineTo(a.tx, a.ty); g.stroke(); g.beginPath(); g.arc(a.tx, a.ty, 60, 0, 7); g.fill(); g.stroke(); } }
  if (!e.dead && !e.boss && e.hp < e.mhp) { const hh = SPR[ty.spr].ch * ty.sc + fly + 8; g.fillStyle = '#400'; g.fillRect(e.x - 18, e.y - hh, 36, 4); g.fillStyle = '#e44'; g.fillRect(e.x - 18, e.y - hh, 36 * e.hp / e.mhp, 4); }
}
function drawFX() {
  FX.forEach(f => { const p = f.t / f.life; g.globalAlpha = Math.max(0, 1 - p);
    if (f.k === 'ring') { g.strokeStyle = f.col; g.lineWidth = 5; g.beginPath(); g.ellipse(f.x, f.y, f.r * Math.min(1, p * 2.2), f.r * Math.min(1, p * 2.2) * .6, 0, 0, 7); g.stroke(); g.fillStyle = f.col; g.globalAlpha *= .15; g.fill(); }
    else if (f.k === 'sp') { g.fillStyle = f.col; g.fillRect(f.x, f.y, 3, 3); }
    else if (f.k === 'ghost') { drawSpr(g, S.hero, f.x, f.y, { fx: f.fx, fy: f.fy, m: 'run', ph: 1, sc: .92, a: .4 * (1 - p) }); }
    else if (f.k === 'slash') { g.strokeStyle = f.col; g.lineWidth = 7; g.shadowColor = f.col; g.shadowBlur = 14; g.beginPath(); g.arc(f.x - Math.cos(f.a) * 14, f.y - Math.sin(f.a) * 14, 38, f.a - 1.1 + p * 1.4, f.a + .1 + p * 1.4); g.stroke(); g.shadowBlur = 0; }
    else if (f.k === 'txt') { g.fillStyle = f.col; g.font = 'bold 18px Georgia'; g.textAlign = 'center'; g.strokeStyle = '#000'; g.lineWidth = 3; g.strokeText(f.s, f.x, f.y - p * 32); g.fillText(f.s, f.x, f.y - p * 32); g.textAlign = 'left'; }
    g.globalAlpha = 1; });
  PR.forEach(p => { g.save(); g.shadowColor = p.col; g.shadowBlur = 16; g.fillStyle = p.col; if (p.kind === 'arrow') { g.translate(p.x, p.y); g.rotate(Math.atan2(p.vy, p.vx)); g.strokeStyle = '#e8dcc0'; g.lineWidth = 2; g.beginPath(); g.moveTo(-18, 0); g.lineTo(2, 0); g.stroke(); g.beginPath(); g.moveTo(2, -4); g.lineTo(10, 0); g.lineTo(2, 4); g.fill(); g.strokeStyle = p.col; g.beginPath(); g.moveTo(-18, -3); g.lineTo(-14, 0); g.lineTo(-18, 3); g.stroke(); } else if (p.kind === 'orb') { g.fillStyle = '#2a1040'; g.beginPath(); g.arc(p.x, p.y, 9, 0, 7); g.fill(); g.strokeStyle = p.col; g.lineWidth = 2; g.beginPath(); g.arc(p.x, p.y, 9 + Math.sin(T * 20), 0, 7); g.stroke(); } else { g.beginPath(); g.arc(p.x, p.y, p.big ? 9 : 6, 0, 7); g.fill(); } g.restore(); });
}
function drawWorld() {
  const sc = SCN[S.scene]; cam.x = Math.max(0, Math.min(sc.w - W, P.x - W / 2)); cam.y = Math.max(0, Math.min(sc.h - H, P.y - H / 2 - 20));
  g.save(); g.translate(-Math.round(cam.x + rnd(-1, 1) * shake * 8), -Math.round(cam.y + rnd(-1, 1) * shake * 8));
  S.scene === 'village' ? drawVillage() : S.scene === 'campos' ? drawCampos() : drawDungeon();
  const ents = [], hsc = .92, lh = k => SPR[k].ch * hsc + 10;
  ents.push({ y: P.y, f: () => { if (P.inv > 0 && P.m !== 'dead' && Math.floor(T * 20) % 2) g.globalAlpha = .55; drawHero(g, S.hero, P.x, P.y, { fx: P.fx, fy: P.fy, m: P.m, t: P.mt, ph: P.ph, sc: hsc, c: P.combo, el: CHARS[S.hero].el, flash: P.m === 'hurt' && P.mt < .08 }); g.globalAlpha = 1; label(P.x, P.y - lh(S.hero), S.name, '#e8a33d'); } });
  Object.values(R).forEach(r => { if (r.sc === S.scene) ents.push({ y: r.y, f: () => { drawHero(g, r.hero, r.x, r.y, { fx: r.fx, fy: r.fy, m: r.m, t: r.t, ph: r.ph, sc: hsc, el: CHARS[r.hero].el }); label(r.x, r.y - lh(r.hero), r.name, '#9ff'); if (r.say) bubble(r.x, r.y - lh(r.hero) - 22, r.say); } }); });
  if (S.scene === 'village') NPCS.forEach(n => ents.push({ y: n.y, f: () => { const d = len(P.x - n.x, P.y - n.y), s = n.sc || hsc; drawSpr(g, n.spr, n.x, n.y, { fx: d < 220 ? (P.x - n.x) / d : 0, fy: d < 220 ? (P.y - n.y) / d : 1, m: 'idle', sc: s }); label(n.x, n.y - SPR[n.spr].ch * s - 10, n.n, '#fff'); if (d < 62) bubble(n.x, n.y - SPR[n.spr].ch * s - 32, 'E', 1); } }));
  if (S.scene === 'campos') { SHEEP.forEach(s => { if (len(P.x - s.x, P.y - s.y) < 55) ents.push({ y: s.y + 1, f: () => bubble(s.x, s.y - 40, 'E', 1) }); }); GLYPHS.forEach(q => { if (len(P.x - q.x, P.y - q.y) < 60) ents.push({ y: q.y + 1, f: () => bubble(q.x, q.y - 62, 'E', 1) }); }); CLUES.forEach(q => { if (len(P.x - q.x, P.y - q.y) < 70) ents.push({ y: q.y + 1, f: () => bubble(q.x, q.y - 76, 'E', 1) }); }); }
  E.forEach(e => ents.push({ y: e.y, f: () => drawE(e) })); ents.sort((a, b) => a.y - b.y).forEach(e => e.f()); drawFX(); g.restore();
  if (S.scene === 'd1' || S.scene === 'd2' || S.scene === 'boss') lightPass(g, S.scene === 'boss' ? 'd1' : S.scene, P.x, P.y, cam.x, cam.y, T); vignette();
  if (P.inv > .45) { g.fillStyle = `rgba(255,0,0,${(P.inv - .45) * .6})`; g.fillRect(0, 0, W, H); } hud();
}
function vignette() { const gr = g.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * .95); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(18,8,0,.55)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); if (S.scene === 'village' || S.scene === 'campos') { g.fillStyle = 'rgba(255,200,120,.07)'; g.fillRect(0, 0, W, H); } }
function label(x, y, t, c) { g.font = '11px Georgia'; g.textAlign = 'center'; g.fillStyle = '#000a'; g.fillText(t, x + 1, y + 1); g.fillStyle = c; g.fillText(t, x, y); g.textAlign = 'left'; }
function bubble(x, y, t, k) { g.font = '12px Georgia'; const w = Math.min(220, g.measureText(t).width + 14); g.fillStyle = k ? '#e8a33d' : '#fffffff0'; g.fillRect(x - w / 2, y - 12, w, 20); g.fillStyle = '#222'; g.textAlign = 'center'; g.fillText(t.slice(0, 36), x, y + 3); g.textAlign = 'left'; }
function bar(x, y, w, h, p, c, bg) { g.fillStyle = bg; g.fillRect(x, y, w, h); g.fillStyle = c; g.fillRect(x, y, Math.max(0, w * Math.min(1, p)), h); g.strokeStyle = '#0008'; g.strokeRect(x, y, w, h); }
function objTarget() {
  if (cut || dlgOn || !P) return null; const sc = S.scene, near = f => E.filter(e => !e.dead && f(e)).sort((a, b) => len(a.x - P.x, a.y - P.y) - len(b.x - P.x, b.y - P.y))[0];
  if (sc === 'village') { if (S.quest === 0) { const n = NPCS.find(n => ['auren', 'ferr', 'taver'].includes(n.id) && !S.talked[n.id]); return n ? { x: n.x, y: n.y } : null; } if (S.quest === 3) { if (S.clues.length < 3 || S.lv < BALANCE.dungeonMinLv) return { x: 750, y: 40 }; return { x: 750, y: 850 }; } if (S.quest === 2) { const e = near(() => 1); return e ? { x: e.x, y: e.y } : null; } return null; }
  if (sc === 'campos') { const ci = CLUES.findIndex((q, i) => !S.clues.includes(i)); if (ci >= 0) return { x: CLUES[ci].x, y: CLUES[ci].y }; if (S.lv < BALANCE.dungeonMinLv) { const e = near(() => 1); if (e) return { x: e.x, y: e.y }; } return { x: 900, y: 1070 }; }
  if (sc === 'd1' || sc === 'd2') { if (S.doorOpen) return { x: 480, y: 30 }; const e = near(() => 1); return e ? { x: e.x, y: e.y } : null; }
  return null;
}
function hud() {
  const s = st(), c = CHARS[S.hero]; g.fillStyle = '#000a'; g.fillRect(8, 8, 290, 78); const im = ART['p_' + S.hero]; if (im.complete) g.drawImage(im, 12, 12, 52, 58); g.strokeStyle = c.el; g.lineWidth = 2; g.strokeRect(12, 12, 52, 58);
  g.fillStyle = '#e8a33d'; g.font = 'bold 13px Georgia'; g.fillText(c.n + '  Nv ' + S.lv, 72, 24);
  bar(72, 30, 216, 10, P.hp / s.mhp, '#d03a3a', '#400'); bar(72, 43, 216, 8, P.mp / s.mmp, '#3a8ae0', '#124'); bar(72, 54, 216, 5, (S.xp - XPT[S.lv - 1]) / ((XPT[S.lv] || S.xp + 1) - XPT[S.lv - 1]), '#e8c96a', '#432');
  g.fillStyle = '#fff'; g.font = '11px Georgia'; g.fillText(Math.ceil(P.hp) + '/' + s.mhp, 76, 39); g.fillText('🪙 ' + S.gold, 236, 24); for (let i = 0; i < 10; i++) { g.fillStyle = i < (S.chg || 0) ? (S.chg >= 10 ? `hsl(${40 + Math.sin(T * 8) * 20},100%,60%)` : '#ffb84a') : '#3a2a1a'; g.fillRect(72 + i * 22, 66, 19, 7); } g.fillStyle = S.chg >= 10 ? '#ffe9a0' : '#999'; g.font = 'bold 10px Georgia'; g.fillText(S.chg >= 10 ? 'R — ATAQUE CARREGADO PRONTO' : 'Carga: ' + (S.chg || 0) + '/10', 72, 83); g.font = '11px Georgia';
  if (objective) { g.font = '13px Georgia'; const w = g.measureText(objective).width + 20; g.fillStyle = '#000a'; g.fillRect(W / 2 - w / 2 + 70, 8, w, 22); g.fillStyle = '#e8d8a0'; g.textAlign = 'center'; g.fillText('◆ ' + objective, W / 2 + 70, 24); g.textAlign = 'left'; }
  if (boss) { g.fillStyle = '#000b'; g.fillRect(W / 2 - 230, 40, 460, 30); g.fillStyle = '#fff'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText('O CARRASCO — Ordem do Domínio' + (boss.p2 ? ' (Fúria)' : ''), W / 2, 54); g.textAlign = 'left'; bar(W / 2 - 220, 58, 440, 8, boss.hp / boss.mhp, boss.p2 ? '#ff7a30' : '#c04040', '#300'); }
  const tg = objTarget(); if (tg) { const sx = tg.x - cam.x, sy = tg.y - cam.y, bob = Math.sin(T * 5) * 4;
    if (sx > 30 && sx < W - 30 && sy > 70 && sy < H - 30) { g.fillStyle = '#ffd86a'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx - 10, sy - 70 + bob); g.lineTo(sx + 10, sy - 70 + bob); g.lineTo(sx, sy - 52 + bob); g.closePath(); g.fill(); g.stroke(); }
    else { const cx = W / 2, cy = H / 2, a = Math.atan2(sy - cy, sx - cx), ex = Math.max(40, Math.min(W - 40, cx + Math.cos(a) * 380)), ey = Math.max(90, Math.min(H - 40, cy + Math.sin(a) * 220)); g.save(); g.translate(ex, ey); g.rotate(a); g.fillStyle = '#ffd86a'; g.strokeStyle = '#000'; g.lineWidth = 2; g.beginPath(); g.moveTo(16, 0); g.lineTo(-10, -11); g.lineTo(-4, 0); g.lineTo(-10, 11); g.closePath(); g.fill(); g.stroke(); g.restore(); g.fillStyle = '#ffe9a0'; g.font = 'bold 11px Georgia'; g.textAlign = 'center'; g.fillText(Math.round(len(tg.x - P.x, tg.y - P.y) / 10) + ' m', ex, ey + 26); g.textAlign = 'left'; } }
  const cs = $('#bS'); if (cs) cs.textContent = !S.skills ? '🔒' : P.skCd > 0 ? Math.ceil(P.skCd) : '✦';
  if (P.dead) { g.fillStyle = '#000a'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.font = 'bold 30px Georgia'; g.textAlign = 'center'; g.fillText('A luz do selo os traz de volta...', W / 2, H / 2); g.textAlign = 'left'; }
}
// ---------- PAUSA / STATUS ----------
function togglePause() {
  if (!started || cut || !P) return; paused = !paused; const el = $('#pause'); if (!paused) { el.style.display = 'none'; return; }
  const c = CHARS[S.hero], s = st(), nx = XPT[S.lv] || '—';
  const ql = Object.entries(QUESTS).map(([id, q]) => { const t = S.qs[id] || 0; return `<li class="${t === 2 ? 'ok' : ''}"><b>${q.n}</b> — ${t === 0 ? 'não iniciada' : t === 2 ? 'concluída ✔' : q.prog() + '/' + q.need}<br><small>${q.d}</small></li>`; }).join('');
  el.innerHTML = `<div class="pbox"><img class="pbody" src="assets/b_${S.hero}.jpg"><div class="pinfo"><h2>${c.n}</h2><p class="role">${c.role} · ${c.fac}</p>
  <p>Nível <b>${S.lv}</b> · XP <b>${S.xp}</b>/${nx} · 🪙 ${S.gold}</p><p>HP <b>${Math.ceil(P.hp)}/${s.mhp}</b> · MP <b>${Math.floor(P.mp)}/${s.mmp}</b> · Ataque <b>${Math.round(s.at)}</b></p>
  <p>Habilidade elemental: <b style="color:${c.el}">${c.sk}</b> ${S.skills ? '' : '(adormecida)'}</p><h3>Objetivo</h3><p>${objective || 'Explore e converse com os moradores.'}</p>
  <h3>Missões secundárias</h3><ul>${ql}</ul><p class="small">WASD/joystick mover · J/⚔ atacar · K/✦ habilidade · E interagir · Enter chat · Esc menu</p>
  <div class="btns"><button id="pr">Continuar</button><button id="pm">${$('#mute').textContent} Som</button></div></div></div>`;
  el.style.display = 'flex'; $('#pr').onclick = togglePause; $('#pm').onclick = () => { $('#mute').click(); $('#pm').textContent = $('#mute').textContent + ' Som'; };
}
// ---------- ENTRADA ----------
addEventListener('keydown', e => {
  const k = e.key.toLowerCase(); if (document.activeElement === $('#msg')) { if (k === 'enter') { const v = $('#msg').value.trim(); $('#msg').value = ''; $('#msg').blur(); if (v) { log(v, S.name); sendN('chat', { t: v }); } } e.stopPropagation(); return; }
  if (S.scene === 'title' && !cut) return; if (k === 'escape' || k === 'p') { togglePause(); return; } if (paused) return;
  if (TB) { tbKey(k); return; }
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) e.preventDefault();
  if (k === 'enter') { $('#msg').focus(); return; } if ((k === ' ' || k === 'e') && dlgNext) { dlgNext(); return; } if (k === 'e') interact(); if (k === 'r') charged(); if (k === 'shift' || k === 'l') dodge(); keys[k] = 1;
});
addEventListener('keyup', e => keys[e.key.toLowerCase()] = 0);
(() => { const j = $('#joy'), k = j.firstChild; let on = 0; const mv = e => { const r = j.getBoundingClientRect(); let x = (e.clientX - r.left - r.width / 2) / (r.width / 2), y = (e.clientY - r.top - r.height / 2) / (r.height / 2); const l = Math.hypot(x, y); if (l > 1) { x /= l; y /= l; } J.x = Math.abs(x) < .12 ? 0 : x; J.y = Math.abs(y) < .12 ? 0 : y; k.style.transform = `translate(${x * 60}%,${y * 60}%)`; }; const end = () => { on = 0; J.x = J.y = 0; k.style.transform = ''; };
  j.addEventListener('pointerdown', e => { on = 1; j.setPointerCapture(e.pointerId); mv(e); }); j.addEventListener('pointermove', e => on && mv(e)); j.addEventListener('pointerup', end); j.addEventListener('pointercancel', end);
  [['#bA', 'a'], ['#bS', 's']].forEach(([id, h]) => { const b = $(id); b.addEventListener('pointerdown', e => { e.preventDefault(); if (TB) { tbBtn(h); return; } held[h] = 1; }); ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => b.addEventListener(ev, () => held[h] = 0)); });
  $('#bE').addEventListener('pointerdown', e => { e.preventDefault(); dlgNext ? dlgNext() : interact(); }); $('#bR').addEventListener('pointerdown', e => { e.preventDefault(); TB ? tbKey('r') : charged(); }); $('#bD').addEventListener('pointerdown', e => { e.preventDefault(); dodge(); }); })();
$('#mute').onclick = () => { $('#mute').textContent = A.toggle() ? '🔇' : '🔊'; };
$('#menu').onclick = togglePause;
$('#share').onclick = () => { const u = location.origin + '/?sala=' + S.room; navigator.clipboard?.writeText(u).catch(() => { }); log('Link copiado: ' + u, 'Sala'); };
// ---------- TÍTULO ----------
let chosen = false; const pvc = $('#pvs').getContext('2d');
(() => { const q = new URLSearchParams(location.search).get('sala'); if (q) $('#rm').value = q.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20); $('#nm').value = 'Viajante' + (Math.random() * 90 | 0);
  ['kael', 'lyra', 'eld', 'ser', 'dar', 'tho'].forEach(k => { const d = document.createElement('div'); d.className = 'card'; d.innerHTML = `<img src="assets/p_${k}.jpg"><b>${CHARS[k].n.split(' ')[0]}</b><br>${CHARS[k].fac}`; $('#heroes').appendChild(d);
    d.onclick = () => { S.hero = k; chosen = true; document.querySelectorAll('.card').forEach(x => x.classList.remove('sel')); d.classList.add('sel'); $('#go').disabled = false; $('#pvb').src = 'assets/b_' + k + '.jpg'; $('#pv').style.display = 'flex'; $('#info').textContent = CHARS[k].n + ' — ' + CHARS[k].role + '. Habilidade: ' + CHARS[k].sk + '.'; A.init(); A.sfx('ui'); A.theme('calm'); }; });
  $('#go').onclick = () => { A.init(); S.name = $('#nm').value.trim().slice(0, 14) || 'Viajante'; S.room = $('#rm').value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 20) || 'valdora'; $('#title').style.display = 'none'; started = true; newPlayer(); S.scene = 'village'; if (touch) { $('#joy').style.display = 'flex'; $('#btns').style.display = 'flex'; } connect();
    playCut('prologue', () => playCut('card1', () => { CUTS.intro = { theme: 'calm', slides: INTRO[S.hero] }; playCut('intro', () => { setObj('Converse com os moradores (0/3): Auren, Ferreiro, Taverneiro'); A.theme('calm'); log('WASD/joystick: mover · J/⚔: atacar (3 golpes em sequência) · R: ataque carregado · Shift/➤: esquiva · E: interagir · Esc/☰: menu', 'Dica'); }); })); };
})();
// ---------- LOOP ----------
let last = 0;
function loop(ts) {
  const dt = Math.min(.05, (ts - last) / 1000); last = ts; update(dt);
  if (cut) drawCut(); else if (TB) drawTB(); else if (started && P) drawWorld(); else { g.fillStyle = '#0b0711'; g.fillRect(0, 0, W, H); }
  if (!started && chosen) { pvc.clearRect(0, 0, 130, 170); drawSpr(pvc, S.hero, 65, 160, { di: Math.floor(T * 1.6) % 8, fx: 0, fy: 1, m: 'idle', sc: 1.35 }); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
