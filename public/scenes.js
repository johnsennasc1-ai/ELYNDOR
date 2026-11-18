// Cenários pintados por código (paleta envelhecida/sépia, inspirada em RPGs clássicos). Renderizados uma vez e reaproveitados.
const BGC = {};
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function RN(seed) { let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
function blobs(x, w, h, cols, n, rr, R, a) { for (let i = 0; i < n; i++) { const px = R() * w, py = R() * h, r = rr * (.5 + R()), gr = x.createRadialGradient(px, py, 0, px, py, r); const c = cols[(R() * cols.length) | 0]; gr.addColorStop(0, c + a); gr.addColorStop(1, c + '00'); x.fillStyle = gr; x.fillRect(px - r, py - r, r * 2, r * 2); } }
function grain(x, w, h, cols, n, R, sz) { for (let i = 0; i < n; i++) { x.fillStyle = cols[(R() * cols.length) | 0]; x.fillRect((R() * w) | 0, (R() * h) | 0, sz || 2, sz || 2); } }
function shade(x, px, py, rx, ry, a) { x.fillStyle = `rgba(0,0,0,${a || .3})`; x.beginPath(); x.ellipse(px, py, rx, ry, 0, 0, 7); x.fill(); }
function rock(x, px, py, w, h, R, tone) {
  tone = tone || 0; shade(x, px + w * .5, py + h, w * .6, h * .16, .35);
  const pts = [[0, h * .7], [w * .1, h * .25], [w * .35, 0], [w * .7, h * .08], [w, h * .45], [w * .92, h], [w * .08, h]].map(p => [px + p[0] + (R() - .5) * w * .06, py + p[1]]);
  const base = [[150, 140, 120], [128, 118, 100], [170, 158, 134]][tone % 3]; const L = (k) => `rgb(${base.map(v => Math.max(0, Math.min(255, v * k | 0))).join(',')})`;
  x.fillStyle = L(.75); x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.fill();
  x.fillStyle = L(1.15); x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); x.lineTo(pts[1][0], pts[1][1]); x.lineTo(pts[2][0], pts[2][1]); x.lineTo(px + w * .45, py + h * .5); x.lineTo(px + w * .2, py + h * .85); x.closePath(); x.fill();
  x.fillStyle = L(.55); x.beginPath(); x.moveTo(pts[3][0], pts[3][1]); x.lineTo(pts[4][0], pts[4][1]); x.lineTo(pts[5][0], pts[5][1]); x.lineTo(px + w * .55, py + h * .9); x.lineTo(px + w * .5, py + h * .5); x.closePath(); x.fill();
  x.strokeStyle = 'rgba(30,24,16,.7)'; x.lineWidth = 1.5; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.closePath(); x.stroke();
  grain(x, 0, 0, [], 0, R); for (let i = 0; i < w * h / 60; i++) { x.fillStyle = R() < .5 ? 'rgba(255,240,200,.18)' : 'rgba(0,0,0,.18)'; x.fillRect(px + R() * w, py + R() * h, 2, 2); }
}
function pine(x, px, py, s, R) {
  shade(x, px, py + 2, 26 * s, 8 * s, .35); x.fillStyle = '#4a3220'; x.fillRect(px - 4 * s, py - 30 * s, 8 * s, 34 * s); x.fillStyle = '#6a4a2c'; x.fillRect(px - 4 * s, py - 30 * s, 3 * s, 34 * s);
  const greens = ['#2a3a1c', '#34481f', '#41592a', '#566a35'];
  for (let k = 0; k < 4; k++) { const cy = py - (30 + k * 20) * s, w = (30 - k * 5) * s; for (let j = 0; j < 4; j++) { x.fillStyle = greens[Math.min(3, j + (k > 1 ? 1 : 0))]; x.beginPath(); x.moveTo(px - w + j * 2, cy + 18 * s); x.lineTo(px, cy - 20 * s - j * 2); x.lineTo(px + w - j * 3, cy + 18 * s); x.closePath(); if (j === 0) x.fill(); else { x.globalAlpha = .55; x.fill(); x.globalAlpha = 1; } } }
  for (let i = 0; i < 40; i++) { x.fillStyle = R() < .5 ? 'rgba(180,200,110,.35)' : 'rgba(0,0,0,.3)'; x.fillRect(px - 26 * s + R() * 52 * s, py - 110 * s + R() * 90 * s, 2, 2); }
}
function oak(x, px, py, s, R) {
  shade(x, px, py + 2, 34 * s, 10 * s, .38); x.fillStyle = '#3e2a1a'; x.beginPath(); x.moveTo(px - 7 * s, py + 3); x.lineTo(px - 4 * s, py - 38 * s); x.lineTo(px + 4 * s, py - 38 * s); x.lineTo(px + 8 * s, py + 3); x.fill(); x.fillStyle = '#6a4a2e'; x.fillRect(px - 4 * s, py - 38 * s, 3 * s, 40 * s);
  const cols = ['#26361a', '#33481f', '#47602a', '#62793a'];
  for (let i = 0; i < 9; i++) { const a = R() * 6.28, d = R() * 22 * s, cx = px + Math.cos(a) * d, cy = py - 58 * s + Math.sin(a) * d * .6, r = (16 + R() * 12) * s; x.fillStyle = cols[i < 4 ? 0 : i < 7 ? 1 : 2]; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }
  for (let i = 0; i < 6; i++) { x.fillStyle = cols[3]; x.globalAlpha = .6; x.beginPath(); x.arc(px - 8 * s + R() * 16 * s, py - 72 * s + R() * 14 * s, (6 + R() * 6) * s, 0, 7); x.fill(); x.globalAlpha = 1; }
  for (let i = 0; i < 60; i++) { x.fillStyle = R() < .5 ? 'rgba(200,220,120,.35)' : 'rgba(0,0,0,.3)'; x.fillRect(px - 34 * s + R() * 68 * s, py - 90 * s + R() * 56 * s, 2, 2); }
}
function house(x, px, py, w, h, roof, R) {
  shade(x, px + w / 2 + 8, py + h + 4, w * .62, 10, .4);
  x.fillStyle = '#7a6a54'; x.fillRect(px, py + h - 20, w, 20); for (let i = 0; i < w / 14; i++) { x.fillStyle = R() < .5 ? '#8a7a64' : '#6a5a46'; x.fillRect(px + i * 14, py + h - 20 + (i % 2) * 8, 13, 9); }
  x.fillStyle = '#c8b690'; x.fillRect(px, py, w, h - 20); grain(x, 0, 0, [], 0, R); for (let i = 0; i < w * h / 40; i++) { x.fillStyle = R() < .5 ? 'rgba(90,60,30,.12)' : 'rgba(255,255,230,.12)'; x.fillRect(px + R() * w, py + R() * (h - 20), 2, 2); }
  x.fillStyle = '#4a2f1c'; for (let i = 0; i <= 4; i++) x.fillRect(px + i * w / 4 - 2, py, 4, h - 20); x.fillRect(px, py, w, 4); x.fillRect(px, py + (h - 20) / 2, w, 3);
  [.22, .62].forEach(k => { const wx = px + w * k, wy = py + 16; x.fillStyle = '#3a2412'; x.fillRect(wx - 3, wy - 3, 28, 28); x.fillStyle = '#ffcf6a'; x.fillRect(wx, wy, 22, 22); x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(wx, wy, 10, 10); x.fillStyle = '#3a2412'; x.fillRect(wx + 10, wy, 2, 22); x.fillRect(wx, wy + 10, 22, 2); });
  x.fillStyle = '#3a2412'; x.fillRect(px + w / 2 - 12, py + h - 44, 24, 44); x.fillStyle = '#5a3a1e'; x.fillRect(px + w / 2 - 10, py + h - 42, 20, 40); x.fillStyle = '#d9a03c'; x.fillRect(px + w / 2 + 5, py + h - 22, 3, 3);
  x.fillStyle = roof; x.beginPath(); x.moveTo(px - 16, py + 8); x.lineTo(px + w / 2, py - 52); x.lineTo(px + w + 16, py + 8); x.closePath(); x.fill();
  for (let r = 0; r < 6; r++) for (let i = 0; i < 12; i++) { x.fillStyle = R() < .5 ? 'rgba(0,0,0,.18)' : 'rgba(255,220,160,.1)'; const yy = py - 52 + r * 10 + 6, half = (w / 2 + 16) * (r + 1) / 6; x.fillRect(px + w / 2 - half + i * (half * 2 / 12), yy, half * 2 / 12 - 1, 8); }
  x.strokeStyle = 'rgba(20,10,5,.8)'; x.lineWidth = 2; x.beginPath(); x.moveTo(px - 16, py + 8); x.lineTo(px + w / 2, py - 52); x.lineTo(px + w + 16, py + 8); x.closePath(); x.stroke();
  x.fillStyle = '#5a4a3c'; x.fillRect(px + w * .72, py - 38, 14, 26); x.fillStyle = '#7a6a58'; x.fillRect(px + w * .72, py - 38, 5, 26);
}
function dots(x, pts, step, col) { x.fillStyle = col; for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], d = Math.hypot(bx - ax, by - ay), n = Math.floor(d / step); for (let k = 0; k < n; k++) { const t = k / n, px = ax + (bx - ax) * t, py = ay + (by - ay) * t; x.fillRect(px - 2, py - 2, 5, 5); x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(px - 1, py + 3, 4, 2); x.fillStyle = col; } } }
function path(x, pts, w, R) { x.lineCap = 'round'; x.lineJoin = 'round'; [[w + 10, '#5a4326'], [w + 4, '#7a5c36'], [w, '#9a7a48'], [w * .6, '#a98a54']].forEach(([lw, c]) => { x.strokeStyle = c; x.lineWidth = lw; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); }); for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.hypot(bx - ax, by - ay) / 6; for (let k = 0; k < n; k++) { const t = R(); x.fillStyle = R() < .5 ? 'rgba(60,40,20,.35)' : 'rgba(230,200,140,.3)'; x.fillRect(ax + (bx - ax) * t + (R() - .5) * w, ay + (by - ay) * t + (R() - .5) * w, 2, 2); } } }
function terrain(x, w, h, R, pal) {
  x.fillStyle = pal[0]; x.fillRect(0, 0, w, h); blobs(x, w, h, [pal[1], pal[2], pal[3], pal[4]], w * h / 9000, 90, R, 'aa'); blobs(x, w, h, ['#000000', '#d8c890'], w * h / 40000, 160, R, '22');
  grain(x, w, h, [pal[5], pal[1], pal[2], 'rgba(0,0,0,.2)', 'rgba(255,240,170,.12)'], w * h / 25, R, 2);
  for (let i = 0; i < w * h / 2200; i++) { const px = R() * w, py = R() * h; x.strokeStyle = R() < .5 ? 'rgba(140,150,70,.5)' : 'rgba(40,52,20,.5)'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (R() - .5) * 4, py - 5 - R() * 5); x.stroke(); }
}
function water(x, rx, ry, rw, rh, deep, light) { const gr = x.createLinearGradient(0, ry, 0, ry + rh); gr.addColorStop(0, light); gr.addColorStop(1, deep); x.fillStyle = gr; x.fillRect(rx, ry, rw, rh); x.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < rw / 24; i++) x.fillRect(rx + i * 24 + (i * 7) % 11, ry + 6 + (i * 13) % (rh - 12), 14, 2); x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(rx, ry, rw, 5); x.fillStyle = 'rgba(230,240,200,.35)'; x.fillRect(rx, ry + rh - 4, rw, 4); }
function paintVillage() {
  const [c, x] = mk(1500, 900), R = RN(7);
  terrain(x, 1500, 900, R, ['#5f6a35', '#6f7c3d', '#4d5a2c', '#838a4a', '#7a6a3a', '#3a4a22']);
  path(x, [[750, 0], [750, 360], [750, 900]], 52, R); path(x, [[0, 415], [750, 415], [1500, 415]], 40, R); x.fillStyle = '#9a7a48'; x.beginPath(); x.arc(775, 365, 112, 0, 7); x.fill(); x.fillStyle = '#7a5c36'; x.beginPath(); x.arc(775, 365, 84, 0, 7); x.fill(); grain(x, 1500, 900, [], 0, R);
  for (let i = 0; i < 80; i++) { const a = i / 80 * 6.28; x.fillStyle = i % 2 ? '#8a8576' : '#6f6a5c'; x.fillRect(775 + Math.cos(a) * 100 - 5, 365 + Math.sin(a) * 100 - 4, 10, 8); }
  dots(x, [[750, 120], [750, 330]], 22, '#e8b84a'); dots(x, [[750, 410], [750, 505]], 22, '#e8b84a');
  water(x, 0, 520, 700, 60, '#1f4a52', '#3c7a78'); water(x, 800, 520, 700, 60, '#1f4a52', '#3c7a78');
  for (let i = 0; i < 40; i++) rock(x, (i * 41) % 1500, 505 + (i % 2) * 70 - (i % 3) * 5, 14 + (i % 4) * 4, 10, R);
  x.fillStyle = '#6a5a46'; x.fillRect(698, 506, 104, 76); x.fillStyle = '#8a7a60'; x.fillRect(700, 510, 100, 68); for (let i = 0; i < 10; i++) { x.fillStyle = i % 2 ? '#7a6a52' : '#948468'; x.fillRect(702 + i * 10, 510, 9, 68); } x.fillStyle = '#4a3c2c'; x.fillRect(696, 504, 6, 80); x.fillRect(798, 504, 6, 80);
  [[200, 120, 150, 100, '#6a3a2a'], [650, 100, 180, 110, '#3f4a5a'], [1100, 120, 150, 100, '#4a5a3a'], [200, 320, 130, 90, '#7a4a2a']].forEach(([px, py, w, h, rc]) => house(x, px, py, w, h, rc, R));
  x.fillStyle = '#9a9484'; x.beginPath(); x.arc(775, 372, 34, 0, 7); x.fill(); x.fillStyle = '#6f6a5c'; x.beginPath(); x.arc(775, 372, 27, 0, 7); x.fill(); x.fillStyle = '#9a9484'; x.fillRect(771, 340, 8, 32);
  for (let i = 0; i < 8; i++) { x.fillStyle = '#5a4a38'; x.fillRect(560 + i * 18, 430, 4, 16); } x.fillStyle = '#6a563e'; x.fillRect(556, 436, 150, 3);
  const trees = []; for (let i = 0; i < 90; i++) { const tx = R() * 1500, ty = 20 + R() * 880; if ((tx > 690 && tx < 815) || (ty > 495 && ty < 600) || (ty > 385 && ty < 445) || Math.hypot(tx - 775, ty - 365) < 140 || SCN.village.col.slice(0, 7).some(r => tx > r[0] - 40 && tx < r[0] + r[2] + 40 && ty > r[1] - 30 && ty < r[1] + r[3] + 50)) continue; trees.push([tx, ty, .8 + R() * .5, R() < .55]); }
  trees.sort((a, b) => a[1] - b[1]).forEach(([tx, ty, s, p]) => p ? pine(x, tx, ty, s, R) : oak(x, tx, ty, s, R));
  x.fillStyle = '#5a5a4a'; x.fillRect(700, 0, 24, 50); x.fillRect(776, 0, 24, 50); x.fillRect(700, 0, 100, 18); x.fillStyle = '#7a7a66'; x.fillRect(700, 0, 8, 50); x.fillRect(776, 0, 8, 50);
  return c;
}
function paintCampos() {
  const [c, x] = mk(1800, 1100), R = RN(21);
  terrain(x, 1800, 1100, R, ['#6a7038', '#7a8442', '#58662f', '#93914e', '#8a7640', '#3e4e24']);
  blobs(x, 1800, 1100, ['#b09a5a', '#d0b878'], 24, 120, R, '55');
  path(x, [[900, 1100], [900, 800], [700, 720], [420, 700]], 50, R); path(x, [[900, 800], [880, 330], [1500, 330]], 44, R); path(x, [[900, 560], [1300, 700], [1600, 900]], 36, R);
  dots(x, [[900, 1090], [900, 810], [700, 728], [440, 706]], 26, '#e8b84a'); dots(x, [[900, 790], [884, 340], [1480, 332]], 26, '#e8b84a');
  x.fillStyle = '#1e3a2a'; x.fillRect(0, 0, 112, 1100); water(x, 0, 0, 100, 1100, '#16301f', '#2a5a3a'); x.fillStyle = 'rgba(120,255,140,.18)'; for (let i = 0; i < 40; i++) x.fillRect(8 + R() * 80, R() * 1100, 12, 3);
  for (let i = 0; i < 60; i++) rock(x, 100 + R() * 20, i * 18, 22 + R() * 12, 16, R);
  [[820, 500, 60, 60], [420, 300, 70, 50], [1300, 700, 70, 50], [1500, 200, 60, 60]].forEach(([px, py, w, h], i) => { rock(x, px - 12, py - 40, w + 30, h + 50, R, i); rock(x, px - 24, py - 20, w * .6, h * .8, R, i + 1); });
  for (let i = 0; i < 9; i++) rock(x, 1180 + R() * 580, 20 + R() * 100, 80 + R() * 70, 60 + R() * 50, R, i);
  for (let i = 0; i < 4; i++) { const px = 1000 + i * 56, py = 150 + (i % 2) * 14; x.fillStyle = '#8a8472'; x.fillRect(px, py - 70, 26, 70); x.fillStyle = '#aaa492'; x.fillRect(px, py - 70, 9, 70); x.fillStyle = '#6a6454'; x.fillRect(px - 4, py - 74, 34, 8); }
  const trees = []; for (let i = 0; i < 120; i++) { const tx = 140 + R() * 1640, ty = 60 + R() * 1020; if (Math.abs(tx - 900) < 60 && ty > 780 || (ty > 690 && ty < 760 && tx > 400 && tx < 940) || (Math.abs(tx - 890) < 50 && ty > 300 && ty < 800) || (ty > 310 && ty < 360 && tx > 860 && tx < 1560) || SCN.campos.col.slice(4).some(r => tx > r[0] - 50 && tx < r[0] + r[2] + 50 && ty > r[1] - 50 && ty < r[1] + r[3] + 60)) continue; trees.push([tx, ty, .8 + R() * .6, R() < .6]); }
  trees.sort((a, b) => a[1] - b[1]).forEach(([tx, ty, s, p]) => p ? pine(x, tx, ty, s, R) : oak(x, tx, ty, s, R));
  return c;
}
function stoneFloor(x, w, h, R, base, a, b) { x.fillStyle = base; x.fillRect(0, 0, w, h); for (let ty = 0; ty < h; ty += 36) for (let tx = (ty / 36 % 2) * 24; tx < w; tx += 48) { x.fillStyle = R() < .5 ? a : b; x.fillRect(tx + 1, ty + 1, 46, 34); x.fillStyle = 'rgba(255,230,180,.08)'; x.fillRect(tx + 1, ty + 1, 46, 3); x.fillStyle = 'rgba(0,0,0,.25)'; x.fillRect(tx + 1, ty + 33, 46, 3); } blobs(x, w, h, ['#000000', '#5a4a30'], 30, 80, R, '33'); grain(x, w, h, ['rgba(0,0,0,.25)', 'rgba(255,230,170,.12)'], w * h / 40, R, 2); }
function pillar(x, px, py, w, h, c1, c2) { shade(x, px + w / 2 + 6, py + h, w * .7, 8, .5); x.fillStyle = c2; x.fillRect(px, py, w, h); x.fillStyle = c1; x.fillRect(px, py, w * .4, h); x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(px + w * .8, py, w * .2, h); x.fillStyle = c1; x.fillRect(px - 4, py - 6, w + 8, 10); x.fillRect(px - 4, py + h - 6, w + 8, 8); x.strokeStyle = 'rgba(0,0,0,.6)'; x.strokeRect(px, py, w, h); }
function paintHall(room) {
  const [c, x] = mk(960, 540), R = RN(40 + room.length);
  if (room === 'd2') {
    x.fillStyle = '#140a24'; x.fillRect(0, 0, 960, 540); blobs(x, 960, 540, ['#3a1a5a', '#2a2a6a', '#5a2a7a'], 40, 160, R, '55'); for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(220,200,255,${R() * .6})`; x.fillRect(R() * 960, R() * 540, 2, 2); }
    [[60, 120, 840, 90], [120, 250, 760, 90], [40, 380, 880, 90]].forEach(([px, py, w, h]) => { x.fillStyle = '#0a0414'; x.fillRect(px + 8, py + h - 4, w, 22); const gr = x.createLinearGradient(0, py, 0, py + h); gr.addColorStop(0, '#6a3aa0'); gr.addColorStop(1, '#3a1a6a'); x.fillStyle = gr; x.fillRect(px, py, w, h); for (let tx = px; tx < px + w; tx += 40) for (let ty = py; ty < py + h; ty += 30) { x.strokeStyle = 'rgba(20,0,40,.5)'; x.strokeRect(tx, ty, 40, 30); x.fillStyle = R() < .4 ? 'rgba(200,140,255,.12)' : 'rgba(0,0,0,.1)'; x.fillRect(tx + 1, ty + 1, 38, 4); } x.fillStyle = 'rgba(230,180,255,.3)'; x.fillRect(px, py, w, 4); });
    return c;
  }
  stoneFloor(x, 960, 540, R, '#3a3226', '#4a4030', '#3e3628');
  for (let i = 0; i < 2; i++) { const bx = i ? 830 : 0; x.fillStyle = '#2e2620'; x.fillRect(bx, 0, 130, 540); for (let ty = 0; ty < 540; ty += 28) for (let tx = 0; tx < 130; tx += 42) { x.fillStyle = R() < .5 ? '#4a3e30' : '#3a3026'; x.fillRect(bx + tx + (ty / 28 % 2) * 14, ty, 40, 26); x.fillStyle = 'rgba(255,220,160,.1)'; x.fillRect(bx + tx + (ty / 28 % 2) * 14, ty, 40, 2); } x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(i ? bx : bx + 100, 0, 30, 540); }
  for (let k = 0; k < 6; k++) { x.fillStyle = k % 2 ? '#5a4c3a' : '#4a3e30'; x.fillRect(380, 20 + k * 12, 200, 12); x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(380, 30 + k * 12, 200, 2); }
  x.fillStyle = '#16100a'; x.fillRect(430, 0, 100, 60); x.fillStyle = '#4a3e30'; x.beginPath(); x.moveTo(420, 62); x.lineTo(420, 24); x.quadraticCurveTo(480, -22, 540, 24); x.lineTo(540, 62); x.lineTo(530, 62); x.lineTo(530, 28); x.quadraticCurveTo(480, -10, 430, 28); x.lineTo(430, 62); x.fill();
  SCN[room].col.forEach(([px, py, w, h]) => pillar(x, px, py, w, h, '#8a7a62', '#5e5240')); [130, 830].forEach(tx => [100, 260, 420].forEach(ty => { x.fillStyle = '#2a1e12'; x.fillRect(tx - 3, ty, 6, 22); x.fillStyle = '#ffb040'; x.beginPath(); x.arc(tx, ty - 4, 7, 0, 7); x.fill(); }));
  return c;
}
function paintArena() {
  const [c, x] = mk(960, 540), R = RN(99);
  const gr = x.createLinearGradient(0, 0, 0, 540); gr.addColorStop(0, '#0e0a08'); gr.addColorStop(.38, '#2a1e14'); gr.addColorStop(1, '#3a2c1c'); x.fillStyle = gr; x.fillRect(0, 0, 960, 540);
  blobs(x, 960, 200, ['#4a3a28', '#2a1a10'], 14, 120, R, '66'); for (let i = 0; i < 20; i++) { x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(i * 50, 60 + (i % 3) * 20, 4, 120); }
  x.fillStyle = '#0a0705'; x.fillRect(0, 150, 960, 60); x.strokeStyle = '#6a5a44'; x.lineWidth = 3; for (let i = 0; i < 24; i++) { x.beginPath(); x.moveTo(i * 42, 175); x.lineTo(i * 42, 215); x.stroke(); } x.beginPath(); x.moveTo(0, 190); x.lineTo(960, 190); x.stroke();
  for (let row = 0; row < 22; row++) { const t = row / 22, y = 210 + Math.pow(t, 1.6) * 330, hh = 8 + t * 44, ww = 26 + t * 110; for (let col = -2; col < 960 / ww + 2; col++) { const px = col * ww + (row % 2) * ww / 2, cx = px + ww / 2, d = Math.abs(cx - 480) / 480; const v = 46 + (R() * 30 | 0) - d * 24; x.fillStyle = `rgb(${v * 1.3 | 0},${v * 1.08 | 0},${v * .8 | 0})`; x.beginPath(); x.ellipse(cx, y, ww * .47, hh * .5, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(0,0,0,.45)'; x.stroke(); x.fillStyle = 'rgba(255,230,180,.1)'; x.beginPath(); x.ellipse(cx - ww * .1, y - hh * .15, ww * .25, hh * .15, 0, 0, 7); x.fill(); } }
  x.strokeStyle = 'rgba(200,60,40,.35)'; x.lineWidth = 3; x.beginPath(); x.ellipse(480, 380, 330, 110, 0, 0, 7); x.stroke(); x.beginPath(); x.ellipse(480, 380, 250, 80, 0, 0, 7); x.stroke(); for (let i = 0; i < 8; i++) { const a = i * .785; x.fillStyle = 'rgba(200,60,40,.4)'; x.fillRect(480 + Math.cos(a) * 290 - 3, 380 + Math.sin(a) * 95 - 3, 7, 7); }
  return c;
}
function getBG(n) { if (!BGC[n]) BGC[n] = n === 'village' ? paintVillage() : n === 'campos' ? paintCampos() : n === 'arena' ? paintArena() : paintHall(n); return BGC[n]; }
// luzes dinâmicas: tochas e escuridão nas masmorras
const DK = mk(960, 540);
const TORCH = { d1: [[130, 100], [130, 260], [130, 420], [830, 100], [830, 260], [830, 420]], d2: [[200, 160], [760, 160], [480, 300], [300, 420], [680, 420]] };
function lightPass(g, scene, px, py, cx, cy, T) {
  const [c, x] = DK; x.globalCompositeOperation = 'source-over'; x.fillStyle = scene === 'd2' ? 'rgba(6,0,18,.5)' : 'rgba(8,4,0,.45)'; x.fillRect(0, 0, 960, 540); x.globalCompositeOperation = 'destination-out';
  const L = (lx, ly, r, a) => { const gr = x.createRadialGradient(lx - cx, ly - cy, 0, lx - cx, ly - cy, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(lx - cx - r, ly - cy - r, r * 2, r * 2); };
  L(px, py - 30, 300, .95); if (scene === 'd1' || scene === 'd2') L(480, 40, 220, .8); (TORCH[scene] || []).forEach(([tx, ty], i) => L(tx, ty, 170 + Math.sin(T * 9 + i * 2) * 14, .85));
  g.drawImage(c, 0, 0);
  if (scene === 'd1') (TORCH.d1).forEach(([tx, ty], i) => { const gr = g.createRadialGradient(tx - cx, ty - cy - 4, 0, tx - cx, ty - cy - 4, 80); gr.addColorStop(0, `rgba(255,170,60,${.35 + Math.sin(T * 11 + i) * .08})`); gr.addColorStop(1, 'rgba(255,120,20,0)'); g.fillStyle = gr; g.fillRect(tx - cx - 80, ty - cy - 84, 160, 160); });
}
