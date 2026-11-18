// Armas de cada herói desenhadas por cima dos sprites 8-bit, com balanço, rastro e animação de ataque.
const WEAP = { kael: { t: 'sword' }, lyra: { t: 'staff' }, eld: { t: 'bow' }, ser: { t: 'wand' }, dar: { t: 'mace' }, tho: { t: 'hammer' } };
const WSND = { kael: 'sword', lyra: 'staff', eld: 'bowshot', ser: 'wand', dar: 'mace', tho: 'hammer' };
const ease3 = p => 1 - Math.pow(1 - p, 3);
function wpn(g, type, len, glow, col) {
  g.save(); if (glow) { g.shadowColor = col; g.shadowBlur = 14; }
  if (type === 'sword') { g.fillStyle = '#7a4a22'; g.fillRect(-6, -1.6, 9, 3.2); g.fillStyle = '#d9a83c'; g.fillRect(3, -6, 3.5, 12); g.fillStyle = '#dfe8f2'; g.fillRect(6.5, -2.4, len, 4.8); g.fillStyle = '#fff'; g.fillRect(6.5, -2.4, len, 1.4); g.fillStyle = '#9aa8b8'; g.fillRect(6.5, 1.2, len, 1.2); g.beginPath(); g.moveTo(6.5 + len, -2.4); g.lineTo(6.5 + len + 6, 0); g.lineTo(6.5 + len, 2.4); g.fill(); }
  else if (type === 'hammer') { g.fillStyle = '#6a4424'; g.fillRect(-6, -2, len, 4); g.fillStyle = '#8a929c'; g.fillRect(len - 8, -10, 17, 20); g.fillStyle = '#b6bec8'; g.fillRect(len - 8, -10, 17, 4); g.fillStyle = '#d9a03c'; g.fillRect(len - 9, -10, 3, 20); }
  else if (type === 'mace') { g.fillStyle = '#5a3a20'; g.fillRect(-6, -1.8, len, 3.6); g.fillStyle = '#8a929c'; g.beginPath(); g.arc(len + 3, 0, 8, 0, 7); g.fill(); g.fillStyle = '#c0c8d0'; for (let i = 0; i < 6; i++) { const a = i * 1.047; g.beginPath(); g.moveTo(len + 3 + Math.cos(a) * 7, Math.sin(a) * 7); g.lineTo(len + 3 + Math.cos(a) * 12, Math.sin(a) * 12); g.lineTo(len + 3 + Math.cos(a + .3) * 7, Math.sin(a + .3) * 7); g.fill(); } }
  else if (type === 'staff') { g.fillStyle = '#7a5a34'; g.fillRect(-12, -1.8, len + 12, 3.6); g.fillStyle = '#4ac8ff'; g.shadowColor = '#4ac8ff'; g.shadowBlur = 12; g.beginPath(); g.arc(len, 0, 5.5 + (glow ? 2 : 0), 0, 7); g.fill(); g.fillStyle = '#e8fcff'; g.beginPath(); g.arc(len - 1, -1, 2, 0, 7); g.fill(); g.shadowBlur = 0; g.strokeStyle = '#9a7a44'; g.lineWidth = 2; g.beginPath(); g.arc(len - 6, 0, 7, 2.2, 4.1); g.stroke(); }
  else if (type === 'wand') { g.fillStyle = '#241830'; g.fillRect(-4, -1.4, len, 2.8); g.fillStyle = '#8a5ac0'; g.fillRect(len - 5, -2.6, 3, 5.2); g.fillStyle = '#c090ff'; g.shadowColor = '#b070ff'; g.shadowBlur = 12; g.beginPath(); g.arc(len + 2, 0, 3.4 + (glow ? 2.5 : 0), 0, 7); g.fill(); }
  g.restore();
}
function drawWeapon(g, id, x, y, s) {
  const w = WEAP[id]; if (!w) return; const sc = s.sc || 1, fx = s.fx || 0, fy = s.fy == null ? 1 : s.fy, m = s.m || 'idle', t = s.t || 0, now = performance.now() / 1000;
  const sd = fx >= 0 ? 1 : -1, el = CHARS[id].el, face = Math.atan2(fy * .55, fx || (fy > 0 ? .0001 : -.0001));
  let ax = x + (fx * 9 - fy * 7) * sc, ay = y - 40 * sc + fy * 4 * sc, ang, glow = 0, c = s.c || 0, p = 0;
  if (m === 'walk' || m === 'run') ay += Math.abs(Math.sin(s.ph || 0)) * -3;
  const L = (w.t === 'sword' ? 30 : w.t === 'hammer' ? 30 : w.t === 'mace' ? 24 : w.t === 'staff' ? 44 : 18) * sc;
  ang = sd > 0 ? 1.15 + Math.sin(now * 2) * .04 : Math.PI - 1.15 - Math.sin(now * 2) * .04;
  if (w.t === 'staff') ang = -Math.PI / 2 + sd * .22 + Math.sin(now * 2) * .03;
  if (w.t === 'bow') { ang = face; }
  if (m === 'atk') { p = Math.min(1, t / .4); const e = ease3(p);
    if (w.t === 'bow') { ang = face; }
    else if (w.t === 'staff' || w.t === 'wand') { ang = face + Math.sin(p * 3.1) * -.4 * sd; ax += fx * 8 * Math.sin(p * 3.1) * sc; ay += fy * 4 * Math.sin(p * 3.1) * sc; glow = 1; }
    else { const a0 = [-1.7, 1.2, -2.9][c % 3], a1 = [1.2, -1.7, .7][c % 3]; ang = face + sd * (a0 + (a1 - a0) * e); glow = p > .2 && p < .8;
      if (p > .12 && p < .85) { g.save(); g.strokeStyle = el; g.globalAlpha = (1 - p) * .9; g.lineWidth = 8; g.lineCap = 'round'; g.shadowColor = el; g.shadowBlur = 16; const R = L + 14 * sc; g.beginPath(); g.arc(ax, ay, R, ang - sd * .9, ang, sd < 0); g.stroke(); g.restore(); } } }
  if (m === 'cast') { p = Math.min(1, t / .6); glow = 1; if (w.t === 'sword' || w.t === 'hammer' || w.t === 'mace') ang = -Math.PI / 2 + sd * .3 - Math.sin(p * 3.1) * .2; else ang = -Math.PI / 2 + sd * .35; ay -= Math.sin(p * 3.1) * 4 * sc; }
  g.save(); g.translate(ax, ay);
  if (w.t === 'bow') {
    g.rotate(face); const pull = m === 'atk' ? (p < .55 ? p / .55 : Math.max(0, 1 - (p - .55) * 6)) : 0; g.translate(10 * sc, 0);
    g.strokeStyle = '#7a5030'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -17 * sc); g.quadraticCurveTo(9 * sc, 0, 0, 17 * sc); g.stroke();
    g.strokeStyle = '#eee'; g.lineWidth = 1; g.beginPath(); g.moveTo(0, -17 * sc); g.lineTo(-pull * 12 * sc, 0); g.lineTo(0, 17 * sc); g.stroke();
    if (m === 'atk' && p < .6) { g.strokeStyle = '#d8c8a0'; g.lineWidth = 2; g.beginPath(); g.moveTo(-pull * 12 * sc, 0); g.lineTo(20 * sc, 0); g.stroke(); g.fillStyle = el; g.beginPath(); g.moveTo(20 * sc, -3); g.lineTo(27 * sc, 0); g.lineTo(20 * sc, 3); g.fill(); }
  } else { g.rotate(ang); if (sd < 0 && w.t !== 'staff') g.scale(1, -1); wpn(g, w.t, L, glow, el); }
  g.restore();
  if (m === 'cast' && glow) { const gr = g.createRadialGradient(ax, ay - 10, 2, ax, ay - 10, 34 * sc); gr.addColorStop(0, el + 'aa'); gr.addColorStop(1, el + '00'); g.fillStyle = gr; g.fillRect(ax - 40, ay - 50, 80, 80); }
}
function drawHero(g, id, x, y, s) {
  const back = (s.fy == null ? 1 : s.fy) < -.4, ph = s.sil;
  if (back && !ph) drawWeapon(g, id, x, y, s);
  const o = drawSpr(g, id, x, y, s) || { dx: 0, dy: 0 };
  if (!back && !ph) drawWeapon(g, id, x + o.dx, y + o.dy, s);
}
