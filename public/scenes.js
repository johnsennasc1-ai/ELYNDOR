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
  path(x, [[750, 0], [750, 360], [750, 900]], 52, R); path(x, [[0, 415], [750, 415], [1500, 415]], 40, R); path(x, [[760, 300], [1000, 300], [1000, 0]], 46, R); x.fillStyle = '#9a7a48'; x.beginPath(); x.arc(775, 365, 112, 0, 7); x.fill(); x.fillStyle = '#7a5c36'; x.beginPath(); x.arc(775, 365, 84, 0, 7); x.fill(); grain(x, 1500, 900, [], 0, R);
  for (let i = 0; i < 80; i++) { const a = i / 80 * 6.28; x.fillStyle = i % 2 ? '#8a8576' : '#6f6a5c'; x.fillRect(775 + Math.cos(a) * 100 - 5, 365 + Math.sin(a) * 100 - 4, 10, 8); }
  dots(x, [[750, 120], [750, 330]], 22, '#e8b84a'); dots(x, [[750, 410], [750, 505]], 22, '#e8b84a');
  water(x, 0, 520, 700, 60, '#1f4a52', '#3c7a78'); water(x, 800, 520, 700, 60, '#1f4a52', '#3c7a78');
  for (let i = 0; i < 40; i++) rock(x, (i * 41) % 1500, 505 + (i % 2) * 70 - (i % 3) * 5, 14 + (i % 4) * 4, 10, R);
  x.fillStyle = '#6a5a46'; x.fillRect(698, 506, 104, 76); x.fillStyle = '#8a7a60'; x.fillRect(700, 510, 100, 68); for (let i = 0; i < 10; i++) { x.fillStyle = i % 2 ? '#7a6a52' : '#948468'; x.fillRect(702 + i * 10, 510, 9, 68); } x.fillStyle = '#4a3c2c'; x.fillRect(696, 504, 6, 80); x.fillRect(798, 504, 6, 80);
  [[200, 120, 150, 100, '#6a3a2a'], [650, 100, 180, 110, '#3f4a5a'], [1100, 120, 150, 100, '#4a5a3a'], [200, 320, 130, 90, '#7a4a2a']].forEach(([px, py, w, h, rc]) => house(x, px, py, w, h, rc, R));
  x.fillStyle = '#9a9484'; x.beginPath(); x.arc(775, 372, 34, 0, 7); x.fill(); x.fillStyle = '#6f6a5c'; x.beginPath(); x.arc(775, 372, 27, 0, 7); x.fill(); x.fillStyle = '#9a9484'; x.fillRect(771, 340, 8, 32);
  for (let i = 0; i < 8; i++) { x.fillStyle = '#5a4a38'; x.fillRect(560 + i * 18, 430, 4, 16); } x.fillStyle = '#6a563e'; x.fillRect(556, 436, 150, 3);
  const trees = []; for (let i = 0; i < 90; i++) { const tx = R() * 1500, ty = 20 + R() * 880; if ((tx > 690 && tx < 815) || (tx > 940 && tx < 1060 && ty < 440) || (ty > 495 && ty < 600) || (ty > 385 && ty < 445) || Math.hypot(tx - 775, ty - 365) < 140 || SCN.village.col.slice(0, 7).some(r => tx > r[0] - 40 && tx < r[0] + r[2] + 40 && ty > r[1] - 30 && ty < r[1] + r[3] + 50)) continue; trees.push([tx, ty, .8 + R() * .5, R() < .55]); }
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
  const [c, x] = DK; x.globalCompositeOperation = 'source-over'; x.fillStyle = ({ d2: 'rgba(6,0,18,.5)', vozes: 'rgba(10,2,24,.5)', torre: 'rgba(2,8,24,.5)', ultimo: 'rgba(20,0,4,.5)' }[scene]) || 'rgba(8,4,0,.45)'; x.fillRect(0, 0, 960, 540); x.globalCompositeOperation = 'destination-out';
  const L = (lx, ly, r, a) => { const gr = x.createRadialGradient(lx - cx, ly - cy, 0, lx - cx, ly - cy, r); gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(lx - cx - r, ly - cy - r, r * 2, r * 2); };
  L(px, py - 30, 300, .95); if (scene === 'd1' || scene === 'd2') L(480, 40, 220, .8); (TORCH[scene] || []).forEach(([tx, ty], i) => L(tx, ty, 170 + Math.sin(T * 9 + i * 2) * 14, .85));
  g.drawImage(c, 0, 0);
  if (scene === 'd1') (TORCH.d1).forEach(([tx, ty], i) => { const gr = g.createRadialGradient(tx - cx, ty - cy - 4, 0, tx - cx, ty - cy - 4, 80); gr.addColorStop(0, `rgba(255,170,60,${.35 + Math.sin(T * 11 + i) * .08})`); gr.addColorStop(1, 'rgba(255,120,20,0)'); g.fillStyle = gr; g.fillRect(tx - cx - 80, ty - cy - 84, 160, 160); });
}
// ===== Cenários do Arco I (novo roteiro) =====
function wallBlock(x, px, py, w, h) { shade(x, px + w / 2 + 6, py + h, w * .6, 8, .4); x.fillStyle = '#6a604e'; x.fillRect(px, py, w, h); for (let ty = 0; ty < h; ty += 16) for (let tx = (ty / 16 % 2) * 12; tx < w; tx += 26) { x.fillStyle = (tx + ty) % 3 ? '#7a705c' : '#5a5040'; x.fillRect(px + tx + 1, py + ty + 1, 24, 14); } x.fillStyle = 'rgba(255,240,200,.18)'; x.fillRect(px, py, w, 4); x.strokeStyle = 'rgba(0,0,0,.6)'; x.strokeRect(px, py, w, h); }
const HP = {
  patio: { f: ['#3a3630', '#4a443a'], w: '#2e2a26', t: '#ffb040', p: 'cells' }, enferm: { f: ['#4a5a56', '#58706a'], w: '#38504c', t: '#9affe0', p: 'beds' }, vozes: { f: ['#2a2438', '#3a3050'], w: '#221a32', t: '#c090ff', p: 'mist' },
  arsenal: { f: ['#3a2a22', '#4a362a'], w: '#2a1c16', t: '#ff7a30', p: 'anvils' }, torre: { f: ['#2a3240', '#364258'], w: '#202838', t: '#80c0ff', p: 'crystals' }, ultimo: { f: ['#2a1418', '#3a1c22'], w: '#1a0c10', t: '#ff4030', p: 'circle' }, fuga: { f: ['#3a2420', '#4a2c26'], w: '#2a1816', t: '#ff6020', p: 'cracks' }
};
const TORCH2 = [[130, 150], [130, 350], [130, 550], [1070, 150], [1070, 350], [1070, 550], [520, 40], [680, 40]];
function paintHall2(key) {
  const P = HP[key], [c, x] = mk(1200, 700), R = RN(key.charCodeAt(0) * 31 + key.length);
  stoneFloor(x, 1200, 700, R, P.f[0], P.f[0], P.f[1]);
  x.fillStyle = P.w; x.fillRect(0, 0, 1200, 120); x.fillRect(0, 0, 110, 700); x.fillRect(1090, 0, 110, 700);
  for (let ty = 0; ty < 700; ty += 28) for (let tx = 0; tx < 1200; tx += 42) { if (ty > 120 && tx > 110 && tx < 1090) continue; x.fillStyle = R() < .5 ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.2)'; x.fillRect(tx + (ty / 28 % 2) * 14, ty, 40, 26); }
  x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(0, 100, 1200, 24); x.fillRect(100, 0, 14, 700); x.fillRect(1086, 0, 14, 700);
  x.fillStyle = '#0c0806'; x.fillRect(540, 0, 120, 80); x.fillStyle = P.w; x.beginPath(); x.moveTo(530, 84); x.lineTo(530, 40); x.quadraticCurveTo(600, -20, 670, 40); x.lineTo(670, 84); x.lineTo(658, 84); x.lineTo(658, 46); x.quadraticCurveTo(600, -4, 542, 46); x.lineTo(542, 84); x.fill();
  if (P.p === 'cells') for (let i = 0; i < 6; i++) { const px = i < 3 ? 120 : 1000, py = 160 + (i % 3) * 190; x.fillStyle = '#0a0806'; x.fillRect(px, py, 80, 150); for (let b = 0; b < 8; b++) { x.fillStyle = '#5a5a60'; x.fillRect(px + 4 + b * 10, py, 4, 150); } x.fillStyle = '#7a7a82'; x.fillRect(px, py, 80, 6); x.fillRect(px, py + 144, 80, 6); }
  if (P.p === 'beds') for (let i = 0; i < 6; i++) { const px = 180 + (i % 3) * 300, py = 180 + (i >> 1 & 1) * 0 + Math.floor(i / 3) * 330; x.fillStyle = '#2a3a38'; x.fillRect(px, py, 110, 56); x.fillStyle = '#d8e4e0'; x.fillRect(px + 4, py + 4, 102, 46); x.fillStyle = '#b01818'; x.fillRect(px + 30 + (i * 7) % 40, py + 14, 26, 16); x.fillStyle = '#9ab'; x.fillRect(px + 6, py + 6, 24, 20); }
  if (P.p === 'mist') blobs(x, 1200, 700, ['#8040c0', '#c090ff', '#5020a0'], 22, 140, R, '33');
  if (P.p === 'anvils') { [[260, 300], [900, 420], [560, 560]].forEach(([px, py]) => { x.fillStyle = '#16100c'; x.fillRect(px, py, 60, 22); x.fillRect(px + 12, py + 22, 36, 20); x.fillStyle = '#4a4a52'; x.fillRect(px, py, 60, 8); }); [[150, 640], [1050, 640]].forEach(([px, py]) => { const g2 = x.createRadialGradient(px, py, 4, px, py, 90); g2.addColorStop(0, 'rgba(255,140,40,.7)'); g2.addColorStop(1, 'rgba(255,100,20,0)'); x.fillStyle = g2; x.fillRect(px - 90, py - 90, 180, 180); }); }
  if (P.p === 'crystals') for (let i = 0; i < 14; i++) { const px = 130 + R() * 940, py = 150 + R() * 500, h = 30 + R() * 50; x.fillStyle = 'rgba(120,190,255,.5)'; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 10, py - h); x.lineTo(px + 22, py); x.closePath(); x.fill(); x.fillStyle = 'rgba(220,245,255,.6)'; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 10, py - h); x.lineTo(px + 8, py); x.fill(); }
  if (P.p === 'circle') { x.strokeStyle = 'rgba(255,60,40,.5)'; x.lineWidth = 4; [190, 150].forEach(r => { x.beginPath(); x.arc(600, 400, r, 0, 7); x.stroke(); }); for (let i = 0; i < 12; i++) { const a = i * .5236; x.fillStyle = 'rgba(255,80,50,.5)'; x.fillRect(600 + Math.cos(a) * 170 - 5, 400 + Math.sin(a) * 170 - 5, 10, 10); } x.strokeStyle = '#2a2a30'; x.lineWidth = 6; [[130, 130], [1070, 130], [130, 650], [1070, 650]].forEach(([cx, cy]) => { x.beginPath(); x.moveTo(cx, cy); x.lineTo(600, 400); x.stroke(); }); }
  if (P.p === 'cracks') { x.strokeStyle = 'rgba(255,90,30,.6)'; x.lineWidth = 3; for (let i = 0; i < 18; i++) { let px = R() * 1200, py = 130 + R() * 560; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (R() - .5) * 70; py += (R() - .3) * 50; x.lineTo(px, py); } x.stroke(); } }
  (SCN[key].col || []).slice(4).forEach(([px, py, w, h]) => pillar(x, px, py, w, h, '#8a7a62', '#5e5240'));
  TORCH2.forEach(([tx, ty]) => { x.fillStyle = '#2a1e12'; x.fillRect(tx - 3, ty, 6, 22); x.fillStyle = P.t; x.beginPath(); x.arc(tx, ty - 4, 7, 0, 7); x.fill(); });
  return c;
}
function paintForest() {
  const [c, x] = mk(2000, 1300), R = RN(61);
  terrain(x, 2000, 1300, R, ['#2d4a38', '#37593f', '#264232', '#4a7a52', '#5f8a64', '#1c3024']); blobs(x, 2000, 1300, ['#0a2a30', '#6ab0a0'], 40, 160, R, '30');
  const tr = [[120, 1230], [500, 1180], [700, 960], [1000, 900], [1250, 700], [1500, 520], [1800, 330]]; path(x, tr, 56, R); dots(x, tr, 28, '#8ad0e0');
  x.strokeStyle = 'rgba(120,255,200,.5)'; x.lineWidth = 4; for (let i = 0; i < 10; i++) { x.beginPath(); x.arc(1800, 300, 60 + i * 12, 0, 7); x.globalAlpha = .12; x.stroke(); x.globalAlpha = 1; }
  SCN.floresta.col.slice(4).forEach(([px, py, w, h], i) => { rock(x, px - 10, py - 40, w + 20, h + 50, R, i); });
  const T = []; for (let i = 0; i < 190; i++) { const tx = 40 + R() * 1920, ty = 80 + R() * 1200; if (tr.some((p, k) => k < 6 && Math.hypot(tx - p[0], ty - p[1]) < 95) || Math.hypot(tx - 1800, ty - 320) < 150 || Math.hypot(tx - 1500, ty - 520) < 130) continue; T.push([tx, ty, .9 + R() * .7, R() < .5]); }
  T.sort((a, b) => a[1] - b[1]).forEach(([tx, ty, s, p], i) => { p ? pine(x, tx, ty, s, R) : oak(x, tx, ty, s, R); if (i % 17 === 0) { x.fillStyle = '#f0ffd0'; x.fillRect(tx - 6, ty - 26, 4, 5); x.fillRect(tx + 2, ty - 26, 4, 5); x.fillRect(tx - 4, ty - 17, 8, 3); } });
  x.fillStyle = 'rgba(10,50,60,.38)'; x.fillRect(0, 0, 2000, 1300); blobs(x, 2000, 1300, ['#a0e0d0'], 36, 220, R, '18'); return c;
}
function paintRuins() {
  const [c, x] = mk(1800, 1100), R = RN(73);
  terrain(x, 1800, 1100, R, ['#7a6c50', '#8a7c5c', '#6a5c42', '#9a8c68', '#7a6a48', '#4a4030']); blobs(x, 1800, 1100, ['#3a3226', '#b0a078'], 30, 120, R, '33');
  const rd = [[950, 1100], [950, 700], [800, 520], [950, 300]]; path(x, rd, 70, R); dots(x, [[950, 1090], [950, 710], [810, 530], [940, 320]], 28, '#e8b84a');
  for (let i = 0; i < 160; i++) { x.fillStyle = 'rgba(40,30,20,.4)'; x.fillRect(R() * 1800, R() * 1100, 14 + R() * 20, 2); }
  SCN.ruinas.col.slice(4).forEach(([px, py, w, h]) => wallBlock(x, px, py, w, h));
  for (let i = 0; i < 18; i++) { const px = 100 + R() * 1600, py = 220 + R() * 800; if (Math.abs(px - 950) < 90) continue; pillar(x, px, py, 22 + R() * 10, 40 + R() * 50, '#9a8c70', '#6a5e48'); }
  x.fillStyle = '#1a1208'; x.fillRect(900, 150, 100, 40); x.fillStyle = '#3a2e1c'; x.fillRect(890, 120, 120, 12);
  for (let i = 0; i < 14; i++) { const tx = 80 + R() * 1640, ty = 240 + R() * 820; if (Math.abs(tx - 950) < 100) continue; x.strokeStyle = '#2a1e12'; x.lineWidth = 4; x.beginPath(); x.moveTo(tx, ty); x.lineTo(tx, ty - 40); x.moveTo(tx, ty - 26); x.lineTo(tx + 16, ty - 44); x.moveTo(tx, ty - 20); x.lineTo(tx - 14, ty - 38); x.stroke(); }
  x.fillStyle = 'rgba(70,50,30,.2)'; x.fillRect(0, 0, 1800, 1100); return c;
}
function paintPrison() {
  const [c, x] = mk(1700, 1000), R = RN(83);
  terrain(x, 1700, 1000, R, ['#3a3e48', '#464b58', '#2e323c', '#565c6a', '#4a4036', '#1e222a']); blobs(x, 1700, 1000, ['#0a0e18', '#6a78a0'], 30, 150, R, '33');
  const gr = x.createLinearGradient(0, 0, 0, 300); gr.addColorStop(0, '#0a0c12'); gr.addColorStop(1, '#2a2e3a'); x.fillStyle = gr; x.beginPath(); x.moveTo(200, 270); x.lineTo(380, 40); x.lineTo(850, 0); x.lineTo(1320, 30); x.lineTo(1500, 270); x.closePath(); x.fill();
  for (let i = 0; i < 6; i++) { const px = 330 + i * 200; x.fillStyle = '#14161e'; x.fillRect(px, 40 + (i % 2) * 30, 70, 200); x.fillStyle = '#242836'; x.fillRect(px, 40 + (i % 2) * 30, 22, 200); x.fillStyle = '#ffcf6a'; x.fillRect(px + 30, 110 + (i % 2) * 30, 10, 14); }
  x.strokeStyle = '#3a3e4a'; x.lineWidth = 8; for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(300 + i * 160, 20); x.quadraticCurveTo(350 + i * 160, 160, 260 + i * 170, 270); x.stroke(); }
  x.fillStyle = '#08080c'; x.fillRect(760, 160, 140, 120); x.fillStyle = '#3a3e4a'; for (let i = 0; i < 8; i++) x.fillRect(764 + i * 18, 160, 5, 120);
  const rd = [[830, 1000], [830, 600], [830, 290]]; path(x, rd, 60, R); dots(x, [[830, 990], [830, 610]], 28, '#e8b84a');
  x.fillStyle = '#0a0a0e'; x.fillRect(80, 760, 150, 100); x.strokeStyle = '#6a6a74'; x.lineWidth = 4; for (let i = 0; i < 7; i++) { x.beginPath(); x.moveTo(90 + i * 20, 760); x.lineTo(90 + i * 20, 860); x.stroke(); } x.fillStyle = '#4a4a54'; x.fillRect(70, 750, 170, 14);
  SCN.prisao.col.slice(4).forEach(([px, py, w, h], i) => rock(x, px, py - 20, w, h + 30, R, i));
  for (let i = 0; i < 22; i++) { const tx = 60 + R() * 1580, ty = 330 + R() * 640; if (Math.abs(tx - 830) < 100 || (tx > 60 && tx < 260 && ty > 720 && ty < 880)) continue; x.strokeStyle = '#1a1612'; x.lineWidth = 5; x.beginPath(); x.moveTo(tx, ty); x.lineTo(tx, ty - 50); x.moveTo(tx, ty - 30); x.lineTo(tx + 18, ty - 50); x.moveTo(tx, ty - 22); x.lineTo(tx - 16, ty - 44); x.stroke(); }
  x.fillStyle = 'rgba(10,20,50,.4)'; x.fillRect(0, 0, 1700, 1000); return c;
}
const PA = { // arenas por turnos: [piso rgb], parede, brilho, anel
  capela: { fl: [1.25, 1.05, .85], wall: ['#0e0a12', '#2a1c20'], glow: '255,200,120', ring: '200,160,80' }, floresta: { fl: [.7, 1.1, .85], wall: ['#06100a', '#143020'], glow: '120,255,170', ring: '100,220,140' }, ruinas: { fl: [1.2, 1.05, .8], wall: ['#100c08', '#2e2418'], glow: '255,190,110', ring: '210,170,100' },
  enferm: { fl: [.95, 1.2, 1.15], wall: ['#0a1214', '#24383a'], glow: '150,255,230', ring: '120,230,210' }, vozes: { fl: [.95, .8, 1.3], wall: ['#0a0614', '#241838'], glow: '190,140,255', ring: '170,110,255' }, arsenal: { fl: [1.35, .95, .7], wall: ['#120804', '#3a1c0c'], glow: '255,140,50', ring: '255,120,40' },
  torre: { fl: [.8, .95, 1.35], wall: ['#060a14', '#182438'], glow: '120,190,255', ring: '100,170,255' }, ultimo: { fl: [1.3, .7, .75], wall: ['#10060a', '#301018'], glow: '255,70,50', ring: '255,60,40' }
};
function paintArena2(key) {
  const P = PA[key] || PA.capela, [c, x] = mk(960, 540), R = RN(key.charCodeAt(0) * 7 + 5);
  const g0 = x.createLinearGradient(0, 0, 0, 540); g0.addColorStop(0, P.wall[0]); g0.addColorStop(.4, P.wall[1]); g0.addColorStop(1, '#241a10'); x.fillStyle = g0; x.fillRect(0, 0, 960, 540);
  blobs(x, 960, 220, ['#' + '504030', '#201410'], 14, 120, R, '55');
  for (let i = 0; i < 9; i++) { const px = 40 + i * 110; x.fillStyle = 'rgba(0,0,0,.4)'; x.fillRect(px, 40, 26, 160); x.fillStyle = `rgba(${P.glow},.12)`; x.fillRect(px + 26, 40, 8, 160); }
  if (key === 'capela') for (let i = 0; i < 5; i++) { const px = 120 + i * 180; x.fillStyle = '#0a0610'; x.beginPath(); x.moveTo(px, 190); x.lineTo(px, 80); x.quadraticCurveTo(px + 30, 30, px + 60, 80); x.lineTo(px + 60, 190); x.fill(); x.fillStyle = ['#c04040', '#4060c0', '#c0a040', '#40a060', '#a040c0'][i] + '88'; x.fillRect(px + 8, 90, 44, 90); }
  if (key === 'floresta') { x.strokeStyle = '#2a1a10'; x.lineWidth = 8; for (let i = 0; i < 12; i++) { x.beginPath(); x.moveTo(i * 90, 0); x.quadraticCurveTo(i * 90 + 40 * Math.sin(i), 90, i * 90 + 20, 200); x.stroke(); } }
  if (key === 'ruinas') for (let i = 0; i < 6; i++) pillarA(x, 80 + i * 160, 90 + (i % 2) * 20, 30, 110 - (i % 3) * 25);
  if (key === 'torre') for (let i = 0; i < 12; i++) { const px = 30 + i * 80, h = 50 + R() * 90; x.fillStyle = 'rgba(120,190,255,.45)'; x.beginPath(); x.moveTo(px, 200); x.lineTo(px + 12, 200 - h); x.lineTo(px + 26, 200); x.fill(); }
  x.fillStyle = '#0a0705'; x.fillRect(0, 150, 960, 60); x.strokeStyle = '#6a5a44'; x.lineWidth = 3; for (let i = 0; i < 24; i++) { x.beginPath(); x.moveTo(i * 42, 175); x.lineTo(i * 42, 215); x.stroke(); } x.beginPath(); x.moveTo(0, 190); x.lineTo(960, 190); x.stroke();
  for (let row = 0; row < 22; row++) { const t = row / 22, y = 210 + Math.pow(t, 1.6) * 330, hh = 8 + t * 44, ww = 26 + t * 110; for (let col = -2; col < 960 / ww + 2; col++) { const px = col * ww + (row % 2) * ww / 2, cx = px + ww / 2, d = Math.abs(cx - 480) / 480, v = 46 + (R() * 30 | 0) - d * 24; x.fillStyle = `rgb(${v * P.fl[0] | 0},${v * P.fl[1] | 0},${v * P.fl[2] | 0})`; x.beginPath(); x.ellipse(cx, y, ww * .47, hh * .5, 0, 0, 7); x.fill(); x.strokeStyle = 'rgba(0,0,0,.45)'; x.stroke(); x.fillStyle = 'rgba(255,240,200,.09)'; x.beginPath(); x.ellipse(cx - ww * .1, y - hh * .15, ww * .25, hh * .15, 0, 0, 7); x.fill(); } }
  x.strokeStyle = `rgba(${P.ring},.4)`; x.lineWidth = 3; x.beginPath(); x.ellipse(480, 380, 330, 110, 0, 0, 7); x.stroke(); x.beginPath(); x.ellipse(480, 380, 250, 80, 0, 0, 7); x.stroke(); for (let i = 0; i < 8; i++) { const a = i * .785; x.fillStyle = `rgba(${P.ring},.5)`; x.fillRect(480 + Math.cos(a) * 290 - 3, 380 + Math.sin(a) * 95 - 3, 7, 7); }
  return c;
}
function pillarA(x, px, py, w, h) { x.fillStyle = '#7a6c54'; x.fillRect(px, py, w, h); x.fillStyle = '#9a8c70'; x.fillRect(px, py, w * .35, h); x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(px + w * .8, py, w * .2, h); x.fillStyle = '#6a5e48'; x.fillRect(px - 4, py - 5, w + 8, 8); }
function getBG(n) {
  if (BGC[n]) return BGC[n];
  return BGC[n] = n === 'village' ? paintVillage() : n === 'campos' ? paintCampos() : n === 'floresta' ? paintForest() : n === 'ruinas' ? paintRuins() : n === 'prisao' ? paintPrison() : HP[n] ? paintHall2(n) : n.startsWith('arena_') ? paintArena2(n.slice(6)) : n === 'arena' ? paintArena2('capela') : paintHall(n);
}

['patio', 'enferm', 'vozes', 'arsenal', 'torre', 'ultimo', 'fuga'].forEach(k => TORCH[k] = TORCH2);
function paintVillageX() {
  const c = paintVillage(), x = c.getContext('2d'), R = RN(5);
  house(x, 400, 650, 140, 100, '#5a4a32', R); x.fillStyle = '#5a5a4a'; x.fillRect(950, 0, 24, 50); x.fillRect(1026, 0, 24, 50); x.fillRect(950, 0, 100, 18); x.fillStyle = '#7a7a66'; x.fillRect(950, 0, 8, 50); x.fillRect(1026, 0, 8, 50);
  shade(x, 1236, 765, 100, 10, .4); wallBlock(x, 1150, 660, 160, 100); wallBlock(x, 1210, 580, 44, 90);
  x.fillStyle = '#4a4a5a'; x.beginPath(); x.moveTo(1140, 664); x.lineTo(1230, 600); x.lineTo(1320, 664); x.fill(); x.fillStyle = '#3a3a48'; x.beginPath(); x.moveTo(1204, 584); x.lineTo(1232, 540); x.lineTo(1260, 584); x.fill();
  x.fillStyle = '#d9a83c'; x.beginPath(); x.arc(1232, 612, 9, 0, 7); x.fill(); x.fillStyle = '#6a4a14'; x.fillRect(1230, 612, 4, 10); x.fillStyle = '#e8e0c0'; x.fillRect(1230, 520, 4, 22); x.fillRect(1224, 526, 16, 4);
  x.fillStyle = '#0c0806'; x.beginPath(); x.moveTo(1214, 760); x.lineTo(1214, 724); x.quadraticCurveTo(1232, 700, 1250, 724); x.lineTo(1250, 760); x.fill(); x.fillStyle = '#ffcf6a'; x.fillRect(1176, 690, 14, 22); x.fillRect(1274, 690, 14, 22);
  return c;
}
getBG = (function (orig) { return function (n) { if (n === 'village' && !BGC.village) BGC.village = paintVillageX(); return orig(n); }; })(getBG);
