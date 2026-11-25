// Chefes por turnos (câmera inclinada). Online: todos na sala lutam juntos (lockstep determinístico, cada um age no seu turno).
// Cada chefe tem 2 comparsas bot. Especial: R, T, R (ou ⚔ + ✦ juntos no celular).
const BOSSES = {
  sino: { n: 'O Sinoqueiro', spr: 'sino', sc: 1.3, arena: 'capela', hp: 430, at: 17, xp: 260, gold: 60, elv: 3, mins: ['ald', 'rast'], moves: [['bell', 'all', .7, 'O Sinoqueiro balança o sino de ferro!'], ['wave', 'one', 1, 'Uma onda sonora desorienta {t}!', 'stun'], ['call', 'call', 0, 'O Sinoqueiro invoca corrompidos!']], ph: [{ at: .5, msg: 'O Sinoqueiro toca o sino sem parar!', mul: 1.25, extra: ['all', .35, 'Badalada contínua!'] }] },
  matri: { n: 'A Matriarca das Raízes', spr: 'matri', sc: 1.45, arena: 'floresta', hp: 620, at: 20, xp: 600, gold: 90, elv: 6, mins: ['spider', 'mist'], shield: 160, moves: [['roots', 'one', 1.1, 'Raízes emergem sob {t}!', 'stun'], ['seeds', 'call', 0, 'A Matriarca lança sementes!'], ['legs', 'all', .65, 'As patas da Matriarca varrem o campo!']], ph: [{ at: .5, msg: 'A Matriarca se prende às árvores e ataca de todos os lados!', double: 1, mul: 1.1 }] },
  cav: { n: 'O Cavaleiro Sem Brasão', spr: 'cav', sc: 1.5, arena: 'ruinas', hp: 800, at: 23, xp: 900, gold: 120, elv: 8, mins: ['guard', 'xbow'], guard: .45, moves: [['slash', 'one', 1.25, 'O Cavaleiro desfere um golpe pesado em {t}!'], ['charge', 'all', .7, 'O Cavaleiro investe contra todos!'], ['stance', 'guardup', 0, 'O Cavaleiro assume postura defensiva!']], ph: [{ at: .5, msg: 'O Cavaleiro abandona a espada e luta com as mãos!', double: 1, guard: 0, mul: 1.15 }] },
  cirur: { n: 'A Aberração Cirúrgica', spr: 'cirur', sc: 1.5, arena: 'enferm', hp: 900, at: 25, xp: 1400, gold: 140, elv: 11, mins: ['exp', 'doc'], moves: [['arms', 'one', 1, 'Braços extensíveis agarram {t}!', 'bleed'], ['cut', 'one', .9, 'A Aberração rasga {t}!', 'bleed'], ['eat', 'eat', 0, 'A Aberração absorve um experimento!']], ph: [{ at: .5, msg: 'O corpo se abre e revela núcleos pulsantes!', mul: 1.2, double: 1 }] },
  vigia: { n: 'O Vigia das Mil Vozes', spr: 'vigia', sc: 1.4, arena: 'vozes', hp: 950, at: 26, xp: 1700, gold: 150, elv: 12, mins: ['ilus', 'ilus'], moves: [['mirror', 'mirror', 1, 'O Vigia copia a última habilidade usada!'], ['illus', 'call', 0, 'O Vigia cria ilusões de vocês!'], ['sound', 'all', .6, 'Ondas sonoras interrompem as habilidades!', 'silence']], ph: [{ at: .4, msg: 'As ilusões se multiplicam!', double: 1, mul: 1.1 }] },
  ferrb: { n: 'O Ferreiro das Correntes', spr: 'ferrb', sc: 1.5, arena: 'arsenal', hp: 1000, at: 28, xp: 2000, gold: 170, elv: 13, mins: ['sentinel', 'sentinel'], moves: [['hammer', 'all', .8, 'O martelo do Ferreiro faz o chão tremer!'], ['chain', 'one', 1, 'Correntes puxam {t}!', 'stun'], ['trap', 'one', .8, 'Armadilhas de metal prendem {t}!', 'bleed']], ph: [{ at: .5, msg: 'O Ferreiro aquece o martelo!', mul: 1.3, extra: ['all', .4, 'Brasas voam por todo o campo!'] }] },
  selo: { n: 'O Guardião do Selo', spr: 'selo', sc: 1.6, arena: 'torre', hp: 1100, at: 30, xp: 2600, gold: 200, elv: 14, mins: ['cryst', 'cryst'], protect: 1, moves: [['smash', 'one', 1.5, 'O Guardião esmaga {t}!'], ['wave', 'all', .75, 'Ondas de energia percorrem o campo!'], ['stones', 'call', 0, 'Os cristais voltam a brilhar!']], ph: [{ at: .5, msg: 'O Guardião liberta sua fúria ancestral!', double: 1, mul: 1.15 }] },
  elite2: { n: 'Guardião da Ruína', spr: 'ruinag', sc: 1.35, arena: 'ultimo', hp: 900, at: 28, xp: 3000, gold: 220, elv: 15, mins: ['lancer', 'elite'], pair: 1, moves: [['shield', 'one', 1.1, 'O Guardião golpeia {t} com o escudo!'], ['counter', 'all', .7, 'O Guardião contra-ataca!'], ['rush', 'one', 1.3, 'O Lanceiro do Abismo atravessa o campo!']], ph: [{ at: .5, msg: 'Os guardas entram em fúria!', mul: 1.3 }] },
  carrasco: { n: "O Carrasco de Nhal'Zareth", spr: 'exec', sc: 1.3, arena: 'ultimo', hp: 1800, at: 32, xp: 4000, gold: 400, elv: 16, mins: ['elite', 'lancer'], final: 1, chainHp: 260,
    moves: [['sentence', 'one', 1.8, 'Sentença Final! A lâmina do Carrasco cai sobre {t}!'], ['chains', 'one', .8, 'Correntes do Julgamento prendem {t}!', 'stun'], ['guilt', 'all', .7, 'Peso da Culpa! Uma onda de choque percorre a arena!'], ['blade', 'one', .9, 'Lâmina Impiedosa: três golpes seguidos em {t}!']],
    ph: [{ at: .6, msg: 'O Carrasco absorve a energia de Lyra! Seu corpo brilha em vermelho!', mul: 1.25, moves: [['sentence', 'one', 1.8, 'Sentença Final sobre {t}!'], ['exec', 'exec', 2, 'Execução! O Carrasco avança sobre {t}!'], ['circle', 'all', .8, 'Círculo da Execução explode no chão!'], ['thousand', 'all', .6, 'Mil Correntes cruzam a câmara!']] },
      { at: .35, msg: 'A armadura se rompe! Correntes gigantes flutuam ao redor dele!', mul: 1.3, double: 1, chain: 1, moves: [['decree', 'decree', 1.2, 'Decreto de Morte! O Carrasco escolhe {t}!'], ['rupture', 'rupture', .9, 'Ruptura do Abismo! Quebrem a corrente central!'], ['last', 'last', 0, 'Último Julgamento! O Carrasco concentra toda a energia!'], ['thousand', 'all', .6, 'Mil Correntes cruzam a câmara!']] }] }
};
const TBPOS = [[600, 425], [700, 385], [800, 432], [885, 392], [745, 480]], TBBOSS = [250, 305], TBMIN = [[120, 380], [385, 392], [250, 440]];
const tbSc = y => .95 + (y - 300) / 420, tbEase = ease3;
let tbSeed = 1; const tbR = () => { tbSeed |= 0; tbSeed = tbSeed + 0x6D2B79F5 | 0; let t = Math.imul(tbSeed ^ tbSeed >>> 15, 1 | tbSeed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const tbPick = a => a[Math.floor(tbR() * a.length)];
function tbMates() { const f = CHARS[S.hero].fac; return Object.keys(CHARS).filter(k => k !== 'aur' && k !== 'lyra' && k !== S.hero).sort((a, b) => (CHARS[b].fac === f) - (CHARS[a].fac === f)); }
function startTB(key, cb, net) {
  if (TB) return; const cfg = BOSSES[key], seed = (Math.random() * 1e9) | 0;
  const members = [{ id: S.id, hero: S.hero, name: S.name, lv: S.lv }]; if (netOn) Object.values(R).forEach(r => members.push({ id: r.id, hero: r.hero, name: r.name, lv: r.lv || 1 }));
  const used0 = new Set(members.map(m => m.hero)), msg = { k: 'start', boss: key, seed, members: members.slice(0, 5), bots: tbMates().filter(k => !used0.has(k)).slice(0, 3), host: S.id, elv: Math.round(cfg.elv), diff: S.diff, chg: S.chg || 0 };
  if (netOn) sendN('tb', msg); beginTB(msg, cb);
}
function beginTB(msg, cb) {
  if (TB) return; tbSeed = msg.seed; const cfg = BOSSES[msg.boss], mates = msg.bots || [];
  const mem = msg.members.slice().sort((a, b) => a.id < b.id ? -1 : 1).map(m => ({ ...m, human: 1 })); let bi = 0; while (mem.length < 3 && mates[bi]) mem.push({ id: 'bot' + bi, hero: mates[bi++], name: CHARS[mates[bi - 1]].n.split(' ')[0], lv: msg.members[0].lv, human: 0 });
  const D = DIFF[msg.diff || 'normal'], n = mem.length, party = mem.map((m, i) => { const c = CHARS[m.hero], mhp = c.hp + m.lv * 14, mmp = 40 + m.lv * 5; return { k: m.hero, i, id: m.id, name: m.name, human: m.human, hp: mhp, mhp, mp: mmp, mmp, at: c.at + m.lv * 2.2, bx: TBPOS[i][0], by: TBPOS[i][1], x: TBPOS[i][0], y: TBPOS[i][1], m: 'idle', mt: 0, def: 0, stun: 0, bleed: 0, dead: false, fx: -1, fy: -.6, hit: 0 }; });
  const avg = mem.reduce((a, m) => a + m.lv, 0) / n, hpk = (1 + .1 * (avg - 1)) * D.hp * (1 + .45 * (mem.filter(m => m.human).length - 1)) * BALANCE.bossMul, mk = (t, i) => { const e = ET[t] || ET.ald, hp = Math.round((e.hp || 60) * BALANCE.hpMul * .6 * (1 + .12 * msg.elv) * D.hp); return { type: t, spr: t === 'ilus' ? party[i % party.length].k : e.spr, n: e.n || 'Ilusão', hp: t === 'ilus' ? Math.round(cfg.hp * .08) : t === 'cryst' ? Math.round(cfg.hp * .12) : hp, mhp: 0, at: (e.at || 12) * (1 + .06 * msg.elv) * D.dmg, x: TBMIN[i][0], y: TBMIN[i][1], m: 'idle', mt: 0, hit: 0, dead: false, fx: 1, fy: .6, sc: t === 'cryst' ? 1.6 : (e.sc || 1) * 1.15, ph: 0 }; };
  const mins = cfg.mins.map(mk); if (msg.boss === 'selo') mins.push(mk('cryst', 2)); mins.forEach(m => m.mhp = m.hp);
  const bhp = Math.round(cfg.hp * hpk), B = { cfg, key: msg.boss, hp: bhp, mhp: bhp, x: TBBOSS[0], y: TBBOSS[1], m: 'idle', mt: 0, hit: 0, dead: false, dt: 0, fx: 1, fy: .6, mul: D.dmg * (1 + .06 * msg.elv), shield: cfg.shield ? Math.round(cfg.shield * hpk) : 0, shieldMax: cfg.shield ? Math.round(cfg.shield * hpk) : 0, guardOn: !!cfg.guard, stag: 0, moves: cfg.moves, extra: null, double: 0, phd: {}, focus: null, charging: 0, exposed: 0, chain: null, dmgRound: 0 };
  TB = { cb, host: msg.host, party, boss: B, mins, i: -1, phase: 'intro', t: 0, anim: null, seq: [], seqT: 0, round: 1, turn: 0, banner: '', bannerT: 0, flash: 0, tele: null, chg: msg.chg || 0, cmdQ: [], tgt: 0, silence: 0, last: null, wait: 0, key: msg.boss, prevDlg: dlgOn };
  $('#dlg').style.display = 'none'; $('#stage').classList.add('tb'); A.theme('boss'); banner('Batalha contra ' + cfg.n + '!', 3);
}
function banner(t, s) { if (TB) { TB.banner = t; TB.bannerT = s || 1.6; } }
const alive = () => TB.party.filter(p => !p.dead), me = () => TB.party.find(p => p.id === S.id);
function foes() { const t = TB, l = [t.boss]; t.mins.forEach(m => { if (!m.dead) l.push(m); }); if (t.boss.exposed > 0 && t.boss.chain && t.boss.chain.hp > 0) l.push(t.boss.chain); return l; }
function tgtName() { const o = tgtObj(); return o.cfg ? o.cfg.n.replace('O ', '').replace('A ', '') : o.chain ? 'Corrente' : o.n; }
function tgtObj() { const l = foes(); return l[Math.min(TB.tgt, l.length - 1)] || TB.boss; }
function tbMenu() {
  const tb = TB; tb.phase = 'menu'; tb.turn++; const m = tb.party[tb.i], c = CHARS[m.k], el = $('#tbm');
  if (m.stun > 0) { m.stun = 0; banner(m.name + ' está atordoado e perde o turno!'); tb.phase = 'skip'; setTimeout(tbNext, 900); return; }
  m.def = 0; if (!m.human || m.id !== S.id) { el.style.display = 'none'; if (!m.human) { tb.phase = 'bot'; tb.botT = .9; } else { tb.phase = 'wait'; tb.waitT = 0; banner('Turno de ' + m.name + '...', 1.2); } return; }
  const sil = tb.silence > 0; el.innerHTML = `<div class="tbh"><img src="assets/p_${m.k}.jpg"><b>${c.n.split(' ')[0]} — seu turno</b><small>HP ${m.hp}/${m.mhp} · MP ${m.mp}/${m.mmp}</small></div>
  <button data-a="atk">⚔ Atacar <i>J</i></button><button data-a="skill" ${m.mp < 25 || sil ? 'disabled' : ''}>✦ ${c.sk} <i>K/T · 25 MP</i></button>
  <button data-a="chg" ${tb.chg < 10 || sil ? 'disabled' : ''}>✧ Carregado <i>R · ${tb.chg}/10</i></button><button data-a="spec" ${tb.chg < 10 || sil ? 'disabled' : ''}>★ Especial <i>R·T·R</i></button><button data-a="def">🛡 Defender <i>F</i></button><button data-a="tgt">🎯 Alvo: ${tgtName()} <i>Q</i></button>`;
  el.style.display = 'flex'; el.querySelectorAll('button').forEach(b => b.onclick = () => tbDo(b.dataset.a));
}
function tbDo(kind) { const tb = TB; if (!tb || tb.phase !== 'menu' || paused) return; if (kind === 'tgt') { tb.tgt = (tb.tgt + 1) % foes().length; tbMenu(); tb.turn--; return; } const m = tb.party[tb.i]; if (!tbOk(m, kind)) return; const tg = tb.tgt; if (netOn) sendN('tb', { k: 'cmd', n: tb.turn, a: kind, tg }); tbApply(m, kind, tg); }
function tbOk(m, kind) { const tb = TB, sil = tb.silence > 0; if (kind === 'skill' && (m.mp < 25 || sil)) { log(sil ? 'Silêncio! Habilidades bloqueadas neste turno.' : 'MP insuficiente.'); return false; } if ((kind === 'chg' || kind === 'spec') && (tb.chg < 10 || sil)) { log(sil ? 'Silêncio! Habilidades bloqueadas neste turno.' : 'Carga ' + tb.chg + '/10: use ataques normais.', 'Combate'); return false; } return true; }
function tbApply(m, kind, tg) {
  const tb = TB, c = CHARS[m.k], s = m.at; tb.tgt = tg; const te = tgtObj(); $('#tbm').style.display = 'none'; tb.phase = 'act'; tb.seq = [];
  const hv = () => 1 + tbR() * .25;
  if (kind === 'atk') { tb.chg = Math.min(10, tb.chg + 1); if (tb.chg === 10) sfx('ready'); strike(m, te, { dmg: s * hv(), elem: 'phys' }); }
  else if (kind === 'skill') { m.mp -= 25; tb.chg = Math.min(10, tb.chg + 1); const k = m.k; tb.last = { k, d: s * 2 };
    if (k === 'lyra') strike(m, te, { cast: 1, snd: 'heal', heal: .35 }); else if (k === 'kael') strike(m, te, { dmg: s * 2.2 * hv(), elem: 'fire', cast: 1, snd: 'fire', col: c.el, big: 1 }); else if (k === 'eld') strike(m, te, { dmg: s * 2.3 * hv(), elem: 'wind', cast: 1, snd: 'wind', col: c.el, big: 1 });
    else if (k === 'ser') strike(m, te, { dmg: s * 1.6 * hv(), elem: 'dark', cast: 1, snd: 'shadow', col: c.el, big: 1, after: () => { tb.boss.down = 1; banner('A sombra enfraquece o inimigo!'); } });
    else if (k === 'dar') strike(m, te, { dmg: s * 1.9 * hv(), elem: 'earth', cast: 1, snd: 'quake', col: c.el, big: 1, after: () => { tb.boss.taunt = m.i; m.def = 1; banner(m.name + ' atrai a atenção do chefe!'); } }); else strike(m, te, { dmg: s * 2.4 * hv(), elem: 'earth', cast: 1, snd: 'quake', col: c.el, big: 1 }); }
  else if (kind === 'chg') { tb.chg = 0; tb.last = { k: m.k, d: s * 4 }; strike(m, te, { dmg: s * 4.5 * hv(), elem: c.ranged ? 'wind' : 'fire', cast: 1, snd: 'special', col: c.el, big: 2 }); }
  else if (kind === 'spec') { tb.chg = 0; special(te); }
  else { m.def = 1; m.mp = Math.min(m.mmp, m.mp + 10); sfx('ui'); FX.push({ k: 'txt', x: m.x, y: m.y - 110, s: 'Defendendo', col: '#8cf', t: 0, life: 1 }); tb.anim = { t: 0, dur: .7, step() { }, done: tbNext }; }
}
function strike(m, te, o) {
  const tb = TB, c = CHARS[m.k], ranged = !!c.ranged, tx = te.x + 100, ty = te.y + 70; let swung = 0, hit = 0;
  tb.anim = { t: 0, dur: ranged ? 1.1 : 1.45, step: t => {
    if (!ranged) { const k = t < .35 ? tbEase(t / .35) : t > .85 ? 1 - tbEase((t - .85) / .6) : 1; m.x = m.bx + (tx - m.bx) * k; m.y = m.by + (ty - m.by) * k; }
    const dx = te.x - m.x, dy = te.y - m.y, l = len(dx, dy) || 1; m.fx = dx / l; m.fy = dy / l;
    if (!swung && t >= (ranged ? .1 : .35)) { swung = 1; m.m = o.cast ? 'cast' : 'atk'; m.mt = 0; sfx(o.snd || WSND[m.k]); }
    if (ranged && swung && t < .6) FX.push({ k: 'sp', x: m.x + (te.x - m.x) * (t - .1) * 2, y: m.y - 45 + (te.y - 70 - m.y + 45) * (t - .1) * 2, vx: rnd(-20, 20), vy: rnd(-20, 20), col: c.el, t: 0, life: .3 });
    if (!hit && t >= (ranged ? .6 : .55)) { hit = 1; if (o.heal) { alive().forEach(p => { const h = Math.round(p.mhp * o.heal); p.hp = Math.min(p.mhp, p.hp + h); FX.push({ k: 'txt', x: p.x, y: p.y - 110, s: '+' + h, col: '#6f8', t: 0, life: 1 }); ring(p.x, p.y, 60, c.el); }); } else tbHit(te, o.dmg, o.elem, o.col || c.el, o.big); }
    if (m.m !== 'idle' && t > (ranged ? .8 : .9)) m.m = 'idle'; },
    done: () => { m.m = 'idle'; m.x = m.bx; m.y = m.by; o.after && o.after(); tbNext(); } };
}
function tbHit(te, d, elem, col, big) {
  const B = TB.boss; if (te.dead || B.dead) return;
  if (B.chain && te === B.chain) { te.hp -= Math.round(d); FX.push({ k: 'txt', x: B.x + 40, y: B.y - 150, s: String(Math.round(d)), col: '#ffd86a', t: 0, life: 1 }); ring(B.x, B.y - 30, 90, col); sfx('hit'); if (te.hp <= 0) { te.hp = 0; B.exposed = 0; tbPhase4(); } return; }
  if (te === B) { let mul = 1; if (B.cfg.protect && TB.mins.some(m => !m.dead && m.type === 'cryst')) mul *= .25; if (B.guardOn && !B.stag) { mul *= B.cfg.guard || .5; if (big) { B.guardOn = false; B.stag = 2; banner('Guarda quebrada!'); } } if (B.stag > 0) mul *= 1.3; if (B.cfg.final && B.exposed) mul *= .5; d *= mul; }
  d = Math.max(1, Math.round(d - 2)); if (elem === 'fire' && te === B) d = Math.round(d * 1.1);
  if (te === B && B.shield > 0) { B.shield -= d; FX.push({ k: 'txt', x: B.x, y: B.y - 190, s: String(d), col: '#9cf', t: 0, life: 1 }); ring(B.x, B.y - 40, 100, '#8cf'); sfx('hit'); if (B.shield <= 0) { B.shield = 0; B.stag = 2; banner('Escudo de raízes destruído! O núcleo está exposto!'); sfx('boom'); } B.hit = .15; return; }
  te.hp = Math.max(0, te.hp - d); te.hit = .18; te.m = 'hurt'; te.mt = 0; sfx('hit'); shake = big ? 1 : .35; if (te === B) B.dmgRound += d;
  FX.push({ k: 'txt', x: te.x + rnd(-20, 20), y: te.y - (te === B ? 190 : 120), s: String(d), col: big ? '#ffd86a' : '#fff', t: 0, life: 1 }); ring(te.x, te.y + 10, big ? 130 : 70, col); for (let i = 0; i < 8; i++) FX.push({ k: 'sp', x: te.x, y: te.y - 80, vx: rnd(-160, 160), vy: rnd(-160, 40), col: '#ffe9a0', t: 0, life: .4 });
  if (big > 1) TB.flash = .5;
  if (te !== B && te.hp <= 0) { te.dead = true; te.m = 'dead'; te.mt = 0; sfx('die'); if (B.cfg.pair) { B.mul *= 1.3; banner('O sobrevivente entra em fúria!'); } if (B.cfg.protect && !TB.mins.some(m => !m.dead && m.type === 'cryst')) { B.stag = 3; banner('Todos os cristais caíram! O Guardião está vulnerável!'); } }
  if (te === B) tbPhases();
}
function tbPhases() { const B = TB.boss; (B.cfg.ph || []).forEach((p, i) => { if (!B.phd[i] && B.hp <= B.mhp * p.at && B.hp > 0) { B.phd[i] = 1; B.mul *= p.mul || 1; if (p.double) B.double = 1; if (p.guard === 0) B.guardOn = false; if (p.moves) B.moves = p.moves; if (p.extra) B.extra = p.extra; if (p.chain) B.chain = { hp: B.cfg.chainHp * (1 + .1 * 0), mhp: B.cfg.chainHp, chain: 1, x: B.x + 50, y: B.y - 40, dead: false }; banner(p.msg, 3); sfx('roar'); TB.flash = .35; } }); }
function tbPhase4() { const B = TB.boss; B.mul *= .85; banner('A corrente se rompe! Lyra se liberta! O Carrasco está ferido!', 3.2); sfx('boom'); TB.flash = .7; B.hp = Math.min(B.hp, Math.round(B.mhp * .28)); }
function special(te) {
  const tb = TB, B = tb.boss, al = alive(); let done = al.map(() => 0); banner('ATAQUE ESPECIAL EM GRUPO!', 2.4); sfx('special');
  tb.anim = { t: 0, dur: .3 + al.length * .85 + .8, step: t => {
    al.forEach((m, j) => { const s0 = .3 + j * .85, u = t - s0, c = CHARS[m.k]; if (u < 0) return; const tx = te.x + 90 + j * 22, ty = te.y + 55 + j * 20;
      const k = u < .3 ? tbEase(u / .3) : u > .6 ? Math.max(0, 1 - tbEase((u - .6) / .25)) : 1; if (!c.ranged) { m.x = m.bx + (tx - m.bx) * k; m.y = m.by + (ty - m.by) * k; }
      const dx = te.x - m.x, dy = te.y - m.y, l = len(dx, dy) || 1; m.fx = dx / l; m.fy = dy / l;
      if (!done[j] && u >= .3) { done[j] = 1; m.m = j % 2 ? 'cast' : 'atk'; m.mt = 0; sfx(WSND[m.k]); tbHit(te.dead ? B : te, m.at * 3.4, c.ranged ? 'wind' : 'fire', c.el, 2); }
      if (u > .75) { m.m = 'idle'; m.x = m.bx; m.y = m.by; } });
    if (t > .3 + al.length * .85 + .3 && !tb.fin) { tb.fin = 1; tbHit(B, al.reduce((a, m) => a + m.at, 0) * 1.4, 'fire', '#ffffff', 2); sfx('boom'); } },
    done: () => { tb.fin = 0; al.forEach(m => { m.m = 'idle'; m.x = m.bx; m.y = m.by; }); tbNext(); } };
}
function tbNext() {
  const tb = TB; if (!tb) return; tb.anim = null; if (tb.boss.hp <= 0 && !tb.boss.dead) return tbVictory();
  do { tb.i++; } while (tb.i < tb.party.length && tb.party[tb.i].dead);
  if (tb.i >= tb.party.length) { tb.i = -1; tb.phase = 'enemy'; setTimeout(tbEnemyPhase, 500); return; } tbMenu();
}
function tbBot(m) {
  const tb = TB, c = CHARS[m.k], r = tbR(), tg = tb.mins.findIndex(x => !x.dead && (x.type === 'cryst' && tb.boss.cfg.protect)) >= 0 ? foes().findIndex(x => x.type === 'cryst') : (tbR() < .35 && tb.mins.some(x => !x.dead) ? 1 : 0);
  let a = 'atk'; if (tb.silence <= 0) { if (tb.chg >= 10 && alive().length >= 2 && r < .45) a = 'spec'; else if (tb.chg >= 10 && r < .8) a = 'chg'; else if (m.mp >= 25 && r < .5) a = 'skill'; } if (m.hp < m.mhp * .3 && r > .7) a = 'def'; if (c === CHARS.lyra && m.mp >= 25 && alive().some(p => p.hp < p.mhp * .5)) a = 'skill';
  tbApply(m, a, Math.max(0, tg));
}
function tbEnemyPhase() {
  const tb = TB, B = tb.boss; if (!tb || B.dead) return; const q = []; B.dmgRound0 = B.dmgRound; q.push(B); if (B.double) q.push(B); tb.mins.forEach(m => { if (!m.dead && m.type !== 'cryst') q.push(m); }); let i = 0;
  const next = () => { if (!TB) return; if (!alive().length) return tbDefeat(); if (i >= q.length) return tbRoundEnd(); const a = q[i++]; if (a.dead || a.hp <= 0) return next(); a === B ? bossAct(next) : minAct(a, next); }; next();
}
function tbRoundEnd() {
  const tb = TB, B = tb.boss; alive().forEach(m => { if (m.bleed > 0) { const d = Math.round(m.mhp * .04); m.hp = Math.max(0, m.hp - d); m.bleed--; FX.push({ k: 'txt', x: m.x, y: m.y - 110, s: '-' + d + ' (sangue)', col: '#e55', t: 0, life: 1 }); if (m.hp <= 0) { m.dead = true; m.m = 'dead'; m.mt = 0; sfx('die'); } } });
  if (!alive().length) return tbDefeat(); if (B.stag > 0) B.stag--; if (B.exposed > 0) B.exposed--; B.down = 0; B.taunt = -1; B.dmgRound = 0; if (tb.silence > 0) tb.silence--; tb.round++; tb.tgt = 0; tb.i = -1; tbNext();
}
function minAct(a, done) {
  const tb = TB, t = tbPick(alive()); tb.tele = null; let hit = 0; const sx = a.x, sy = a.y;
  tb.anim = { t: 0, dur: 1.4, step: tt => { const k = tt < .35 ? tbEase(tt / .35) : tt > .85 ? Math.max(0, 1 - tbEase((tt - .85) / .5)) : 1; a.x = sx + (t.x - 90 - sx) * k * .8; a.y = sy + (t.y - 30 - sy) * k * .8; const dx = t.x - a.x, dy = t.y - a.y, l = len(dx, dy) || 1; a.fx = dx / l; a.fy = dy / l; if (tt > .4 && a.m !== 'atk' && !hit) { a.m = 'atk'; a.mt = 0; } if (!hit && tt >= .55) { hit = 1; tbHurt(t, a.at * .7 * (a.type === 'xbow' || a.type === 'doc' ? 1 : 1)); } if (tt > .9) a.m = 'idle'; },
    done: () => { a.x = sx; a.y = sy; a.m = 'idle'; done(); } };
}
function tbHurt(m, d, fx) { if (m.dead) return; d = Math.round(d * (m.def ? .4 : 1) * (.9 + tbR() * .2)); m.hp = Math.max(0, m.hp - d); m.m = 'hurt'; m.mt = 0; m.hit = .2; FX.push({ k: 'txt', x: m.x, y: m.y - 120, s: '-' + d, col: '#f55', t: 0, life: 1 }); sfx('hurt'); ring(m.x, m.y, 60, '#f84'); if (fx === 'stun') m.stun = 1; if (fx === 'bleed') m.bleed = 2; if (m.hp <= 0) { m.dead = true; m.m = 'dead'; m.mt = 0; sfx('die'); } }
function bossAct(done) {
  const tb = TB, B = tb.boss, al = alive(); let mv = tbPick(B.moves);
  if (B.charging) { B.charging = 0; if (B.dmgRound >= B.mhp * .08) { banner('A concentração do Carrasco foi quebrada!'); B.stag = 1; return setTimeout(done, 1200); } mv = ['unleash', 'all', 2.2, 'ÚLTIMO JULGAMENTO! Uma explosão devastadora!']; }
  else if (mv[1] === 'last') { B.charging = 1; banner(mv[3], 2.4); sfx('roar'); tb.tele = { kind: 'spin', tgt: B }; return setTimeout(() => { tb.tele = null; done(); }, 1500); }
  let tgt = tbPick(al); if (B.focus && B.focus.t > 0 && !B.focus.m.dead) { tgt = B.focus.m; B.focus.t--; } if (B.taunt >= 0 && !tb.party[B.taunt].dead && mv[1] === 'one') tgt = tb.party[B.taunt]; if (mv[1] === 'exec') tgt = al.reduce((a, m) => m.hp < a.hp ? m : a, al[0]); if (mv[1] === 'decree') { B.focus = { m: tgt, t: 3 }; }
  const kind = mv[1], mul = (mv[2] || 0) * B.mul * (B.down ? .6 : 1) * B.cfg.at, fx = mv[4], msg = (mv[3] || '').replace('{t}', tgt.name);
  banner(msg, 1.8); sfx('roar'); const melee = kind === 'one' || kind === 'exec' || kind === 'decree'; tb.tele = { kind: melee ? 'one' : 'spin', tgt }; let go = 0, hit = 0; const sx = B.x, sy = B.y;
  tb.anim = { t: 0, dur: 2.3, step: t => {
    const k = t < 1 ? 0 : t < 1.25 ? tbEase((t - 1) / .25) : t > 1.8 ? Math.max(0, 1 - tbEase((t - 1.8) / .5)) : 1; if (melee) { B.x = sx + (tgt.x - 130 - sx) * k * .7; B.y = sy + (tgt.y - 40 - sy) * k * .7; } const dx = tgt.x - B.x, dy = tgt.y - B.y, l = len(dx, dy) || 1; B.fx = dx / l; B.fy = dy / l;
    if (!go && t >= 1) { go = 1; B.m = 'atk'; B.mt = 0; }
    if (!hit && t >= 1.2) { hit = 1; tb.tele = null; shake = .9; sfx(kind === 'all' ? 'boom' : 'quake');
      if (kind === 'one' || kind === 'exec' || kind === 'decree') tbHurt(tgt, mul, fx); else if (kind === 'all' || kind === 'rupture') { ring(B.x, B.y, 240, '#ff4030'); alive().forEach(m => tbHurt(m, mul, fx)); if (fx === 'silence') { tb.silence = 1; banner('Silêncio! Nada de habilidades neste turno!'); } if (kind === 'rupture') { B.exposed = 2; banner('A corrente central está exposta! Ataque a Corrente (Alvo)!', 3); } }
      else if (kind === 'call') { const d = tb.mins.find(m => m.dead); if (d) { d.dead = false; d.hp = Math.round(d.mhp * .5); d.m = 'idle'; ring(d.x, d.y, 80, '#9f8'); FX.push({ k: 'txt', x: d.x, y: d.y - 100, s: 'Invocado!', col: '#9f8', t: 0, life: 1 }); } else { const a = tb.mins.find(m => !m.dead); if (a) { a.hp = Math.min(a.mhp, a.hp + Math.round(a.mhp * .4)); } } }
      else if (kind === 'eat') { const v = tb.mins.find(m => !m.dead); if (v) { v.hp = 0; v.dead = true; v.m = 'dead'; v.mt = 0; B.hp = Math.min(B.mhp, B.hp + Math.round(B.mhp * .1)); FX.push({ k: 'txt', x: B.x, y: B.y - 190, s: '+' + Math.round(B.mhp * .1), col: '#6f8', t: 0, life: 1 }); } }
      else if (kind === 'mirror') { const L = tb.last; if (L) tbHurt(tgt, L.d * .8 * B.mul, ''); else tbHurt(tgt, mul * .8, ''); }
      else if (kind === 'guardup') { B.guardOn = true; ring(B.x, B.y, 80, '#aab'); }
      else if (kind === 'unleash') { ring(B.x, B.y, 260, '#ff2010'); alive().forEach(m => tbHurt(m, mul, '')); }
      if (B.extra && (kind !== 'call')) { alive().forEach(m => tbHurt(m, B.extra[1] * B.mul * B.cfg.at, '')); } }
    if (t > 1.5 && B.m === 'atk') B.m = 'idle'; },
    done: () => { B.x = sx; B.y = sy; B.m = 'idle'; tb.tele = null; done(); } };
}
function tbVictory() {
  const tb = TB, B = tb.boss; B.dead = true; B.dt = 0; B.m = 'dead'; sfx('boom'); banner(B.cfg.n + ' foi derrotado!', 3); $('#tbm').style.display = 'none'; tb.phase = 'win';
  const xp = Math.round(B.cfg.xp * DIFF[S.diff].xp); setTimeout(() => { gain(xp); S.gold += B.cfg.gold; const cb = tb.cb; endTB(); if (cb) cb(); }, 2800);
}
function endTB() { TB = null; $('#stage').classList.remove('tb'); $('#tbm').style.display = 'none'; if (dlgOn) $('#dlg').style.display = 'flex'; }
function tbDefeat() {
  const tb = TB; tb.phase = 'lose'; const host = tb.host === S.id || !netOn; $('#tbm').style.display = 'flex';
  $('#tbm').innerHTML = host ? '<div class="tbh"><b>Os heróis caíram...</b><small>A luz do selo os chama de volta.</small></div><button id="tbr">Tentar de novo</button>' : '<div class="tbh"><b>Os heróis caíram...</b><small>Aguardando o anfitrião reiniciar a luta.</small></div>';
  if (host) $('#tbr').onclick = () => { const key = tb.key, cb = tb.cb; endTB(); startTB(key, cb); };
}
// ---------- entrada ----------
function tbSeqTimeout() { const tb = TB; if (!tb) return; const s = tb.seq.join(''); tb.seq = []; if (tb.phase !== 'menu') return; if (s === 'r') tbDo('chg'); else if (s === 'rt') tbDo('skill'); }
function tbKey(k) {
  const tb = TB; if (!tb || tb.phase !== 'menu') return; if (k === 'j') tbDo('atk'); else if (k === 'f') tbDo('def'); else if (k === 'q') tbDo('tgt'); else if (k === 'k') tbDo('skill');
  else if (k === 'r') { if (tb.seq.join('') === 'rt') { tb.seq = []; tbDo('spec'); } else if (!tb.seq.length) { tb.seq = ['r']; tb.seqT = .55; } }
  else if (k === 't') { if (tb.seq.join('') === 'r') { tb.seq = ['r', 't']; tb.seqT = .8; } else tbDo('skill'); }
}
let tbLast = { a: 0, s: 0 };
function tbBtn(b) { const now = performance.now(), o = b === 'a' ? 's' : 'a'; tbLast[b] = now; if (now - tbLast[o] < 170) { tbLast.a = tbLast.s = 0; clearTimeout(tbBtn.t); tbDo('spec'); return; } clearTimeout(tbBtn.t); tbBtn.t = setTimeout(() => { if (tbLast[b] === now) tbDo(b === 'a' ? 'atk' : 'skill'); }, 180); }
function tbRecv(m) {
  if (m.k === 'start') { if (!TB) { S.diff = m.diff || S.diff; beginTB(m, null); } return; }
  if (!TB) return; if (m.k === 'cmd') TB.cmdQ.push(m);
}
function updTB(dt) {
  const tb = TB; tb.t += dt; shake = Math.max(0, shake - dt * 2); if (tb.bannerT > 0) tb.bannerT -= dt; tb.flash = Math.max(0, tb.flash - dt); if (tb.seqT > 0) { tb.seqT -= dt; if (tb.seqT <= 0) tbSeqTimeout(); }
  const B = tb.boss; tb.party.forEach(m => { m.mt += dt; m.hit -= dt; if (m.m === 'hurt' && m.mt > .35 && !m.dead) m.m = 'idle'; }); [B, ...tb.mins].forEach(e => { e.mt += dt; e.hit -= dt; if (e.m === 'hurt' && e.mt > .3 && !e.dead) e.m = 'idle'; }); if (B.dead) B.dt += dt;
  FX.forEach(f => { f.t += dt; if (f.k === 'sp') { f.x += f.vx * dt; f.y += f.vy * dt; } }); FX = FX.filter(f => f.t < f.life);
  if (tb.phase === 'intro' && tb.t > 1.6) tbNext();
  if (tb.phase === 'bot') { tb.botT -= dt; if (tb.botT <= 0) tbBot(tb.party[tb.i]); }
  if (tb.phase === 'wait') { tb.waitT += dt; const c = tb.cmdQ.findIndex(x => x.n === tb.turn); if (c >= 0) { const m = tb.cmdQ.splice(c, 1)[0]; tbApply(tb.party[tb.i], m.a, m.tg); } else if (tb.waitT > 45 && tb.host === S.id && netOn) { sendN('tb', { k: 'cmd', n: tb.turn, a: 'atk', tg: 0 }); tbApply(tb.party[tb.i], 'atk', 0); } }
  if (tb.anim) { const a = tb.anim; a.t += dt; a.step(a.t, dt); if (a.t >= a.dur) { tb.anim = null; a.done && a.done(); } }
}
function drawTB() {
  const tb = TB, B = tb.boss; g.save();
  if (tb.phase === 'intro') { const k = tbEase(Math.min(1, tb.t / 1.5)); g.translate(W / 2, H / 2); g.rotate((1 - k) * .5); g.scale(1 + (1 - k) * .6, 1 + (1 - k) * .6); g.translate(-W / 2, -H / 2); }
  g.translate(rnd(-1, 1) * shake * 8, rnd(-1, 1) * shake * 8); g.drawImage(getBG('arena_' + B.cfg.arena), 0, 0);
  for (let i = 0; i < 6; i++) { const gr = g.createRadialGradient(80 + i * 160, 150, 0, 80 + i * 160, 150, 120); gr.addColorStop(0, `rgba(255,170,70,${.12 + Math.sin(T * 9 + i) * .03})`); gr.addColorStop(1, 'rgba(255,120,20,0)'); g.fillStyle = gr; g.fillRect(i * 160 - 40, 30, 240, 240); }
  const te = tb.tele; if (te) { g.fillStyle = `rgba(255,40,30,${.14 + .12 * Math.sin(T * 18)})`; g.strokeStyle = 'rgba(255,60,40,.9)'; g.lineWidth = 3; g.beginPath(); if (te.kind === 'spin') g.ellipse(B.x, B.y, 260, 120, 0, 0, 7); else g.ellipse(te.tgt.x, te.tgt.y, 90, 40, 0, 0, 7); g.fill(); g.stroke(); }
  const tg = tgtObj(), ents = tb.party.map(m => ({ y: m.y, f: () => { if (m.dead) { drawHero(g, m.k, m.x, m.y, { fx: m.fx, fy: m.fy, m: 'dead', t: m.mt, sc: tbSc(m.y), a: .6 }); return; } drawHero(g, m.k, m.x, m.y, { fx: m.fx, fy: m.fy, m: m.m, t: m.mt, ph: 0, sc: tbSc(m.y), c: 0, el: CHARS[m.k].el, flash: m.hit > .1 }); const act = tb.party[tb.i] === m && (tb.phase === 'menu' || tb.phase === 'wait' || tb.phase === 'bot'); g.fillStyle = m.id === S.id ? '#e8a33d' : '#9ff'; g.font = '10px Georgia'; g.textAlign = 'center'; const yy = m.y - SPR[m.k].ch * tbSc(m.y) - 8; g.fillText(m.name, m.x, yy); g.textAlign = 'left'; if (act) { g.fillStyle = '#e8a33d'; g.beginPath(); g.moveTo(m.x - 8, yy - 24 + Math.sin(T * 6) * 3); g.lineTo(m.x + 8, yy - 24 + Math.sin(T * 6) * 3); g.lineTo(m.x, yy - 12 + Math.sin(T * 6) * 3); g.fill(); } if (m.def) { g.strokeStyle = '#8cf'; g.lineWidth = 2; g.beginPath(); g.ellipse(m.x, m.y - 40, 34, 56, 0, 0, 7); g.stroke(); } } }));
  tb.mins.forEach(m => ents.push({ y: m.y, f: () => { drawSpr(g, m.spr, m.x, m.y, { fx: m.fx, fy: m.fy, m: m.dead ? 'dead' : m.m, t: m.mt, sc: tbSc(m.y) * m.sc, flash: m.hit > .08, a: m.type === 'ilus' ? .6 : m.dead ? .35 : 1 }); if (!m.dead) { const hh = SPR[m.spr].ch * tbSc(m.y) * m.sc + 12; bar(m.x - 24, m.y - hh, 48, 5, m.hp / m.mhp, '#e44', '#400'); g.fillStyle = '#fff'; g.font = '10px Georgia'; g.textAlign = 'center'; g.fillText(m.n, m.x, m.y - hh - 3); g.textAlign = 'left'; } if (tg === m && !m.dead) { g.fillStyle = '#ff6a5a'; g.beginPath(); g.moveTo(m.x - 8, m.y - SPR[m.spr].ch * tbSc(m.y) * m.sc - 34); g.lineTo(m.x + 8, m.y - SPR[m.spr].ch * tbSc(m.y) * m.sc - 34); g.lineTo(m.x, m.y - SPR[m.spr].ch * tbSc(m.y) * m.sc - 22); g.fill(); } } }));
  ents.push({ y: B.y, f: () => { drawSpr(g, B.cfg.spr, B.x, B.y, { fx: B.fx, fy: B.fy, m: B.m, t: B.m === 'dead' ? B.dt : B.mt, sc: tbSc(B.y) * B.cfg.sc, flash: B.hit > .08, a: B.dead ? Math.max(0, 1 - B.dt * .5) : 1 }); if (tg === B) { g.fillStyle = '#ff6a5a'; const yy = B.y - SPR[B.cfg.spr].ch * tbSc(B.y) * B.cfg.sc - 14; g.beginPath(); g.moveTo(B.x - 9, yy - 12); g.lineTo(B.x + 9, yy - 12); g.lineTo(B.x, yy); g.fill(); } if (B.chain && B.exposed > 0 && B.chain.hp > 0) { g.strokeStyle = tg === B.chain ? '#ff6a5a' : '#f8d060'; g.lineWidth = 5; g.beginPath(); g.moveTo(B.x + 30, B.y - 130); g.lineTo(B.x + 120, B.y - 200); g.stroke(); bar(B.x + 60, B.y - 230, 70, 6, B.chain.hp / B.chain.mhp, '#f8d060', '#432'); B.chain.x = B.x + 90; B.chain.y = B.y - 150; } } });
  ents.sort((a, b) => a.y - b.y).forEach(e => e.f()); drawFX(); g.restore();
  const gr = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,4,0,.65)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (tb.flash > 0) { g.fillStyle = `rgba(255,255,255,${tb.flash})`; g.fillRect(0, 0, W, H); }
  g.fillStyle = '#000b'; g.fillRect(W / 2 - 230, 6, 460, B.shield > 0 ? 44 : 34); g.fillStyle = '#fff'; g.font = 'bold 13px Georgia'; g.textAlign = 'center'; g.fillText(B.cfg.n + (B.stag > 0 ? ' — VULNERÁVEL' : B.guardOn ? ' — GUARDA' : ''), W / 2, 20); g.textAlign = 'left'; bar(W / 2 - 220, 26, 440, 9, B.hp / B.mhp, '#c04040', '#300'); if (B.shield > 0) bar(W / 2 - 220, 38, 440, 6, B.shield / B.shieldMax, '#8cf', '#123');
  const sm = tb.party.length > 3 ? 36 : 46; tb.party.forEach((m, i) => { const y = H - 8 - (tb.party.length - i) * sm, x = 8; g.fillStyle = tb.party[tb.i] === m && (tb.phase === 'menu' || tb.phase === 'wait' || tb.phase === 'bot') ? '#3a2a10e0' : '#000a'; g.fillRect(x, y, 190, sm - 3); const im = ART['p_' + m.k]; if (im.complete) g.drawImage(im, x + 2, y + 2, 24, sm - 7); g.fillStyle = m.dead ? '#888' : m.id === S.id ? '#e8a33d' : '#fff'; g.font = 'bold 10px Georgia'; g.fillText(m.name + (m.stun ? ' ⛓' : '') + (m.bleed ? ' 🩸' : ''), x + 30, y + 10); bar(x + 30, y + 13, 154, 7, m.hp / m.mhp, '#d03a3a', '#400'); bar(x + 30, y + 22, 154, 5, m.mp / m.mmp, '#3a8ae0', '#124'); });
  for (let i = 0; i < 10; i++) { g.fillStyle = i < tb.chg ? (tb.chg >= 10 ? `hsl(${40 + Math.sin(T * 8) * 20},100%,60%)` : '#ffb84a') : '#3a2a1a'; g.fillRect(210 + i * 14, H - 16, 11, 6); } g.fillStyle = '#e8d8a0'; g.font = '10px Georgia'; g.fillText(tb.chg >= 10 ? 'CARGA PRONTA' : 'Carga ' + tb.chg + '/10', 210, H - 20);
  if (tb.bannerT > 0) { g.font = 'bold 18px Georgia'; const w = Math.min(W - 20, g.measureText(tb.banner).width + 36); g.fillStyle = '#000c'; g.fillRect(W / 2 - w / 2, 62, w, 32); g.fillStyle = '#ffe9a0'; g.textAlign = 'center'; g.fillText(tb.banner, W / 2, 85); g.textAlign = 'left'; }
}
