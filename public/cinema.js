// Cenas de narrativa: camadas com paralaxe, névoa, raios de luz, grão de filme e etalonagem (aspecto cinematográfico).
const CPAL = {
  ash: { sky: ['#0d0707', '#6a2a14'], glow: [.72, .62, '#ff7a30'], far: '#2a1410', mid: '#190d0a', fog: '255,120,60', stars: 0 },
  blue: { sky: ['#050a18', '#1f4278'], glow: [.5, .4, '#7ab0ff'], far: '#0f2038', mid: '#08111f', fog: '120,170,255', stars: 1 },
  night: { sky: ['#03020a', '#2a1640'], glow: [.8, .22, '#c8b8ff'], far: '#150c24', mid: '#0a0614', fog: '150,120,220', stars: 1 },
  ruin: { sky: ['#050c09', '#244a34'], glow: [.3, .35, '#8affc0'], far: '#10241a', mid: '#08140d', fog: '120,220,160', stars: 0 },
  gold: { sky: ['#140e08', '#8a5e24'], glow: [.5, .55, '#ffd080'], far: '#3a2a14', mid: '#201408', fog: '255,210,130', stars: 0 },
  day: { sky: ['#3a5c8c', '#d8c89a'], glow: [.7, .4, '#fff0c0'], far: '#5a6a5a', mid: '#2e3e26', fog: '255,240,200', stars: 0 },
  dark: { sky: ['#030206', '#1a0f2a'], glow: [.7, .45, '#8a50ff'], far: '#0c0814', mid: '#06040a', fog: '120,70,200', stars: 1 }
};
const CINL = {}; let GRAIN = null;
function cin(key) {
  if (CINL[key]) return CINL[key]; const P = CPAL[key] || CPAL.night, R = RN(key.length * 77 + key.charCodeAt(0)), L = {}, WW = 1160, HH = 540;
  let [c, x] = mk(WW, HH); const gr = x.createLinearGradient(0, 0, 0, HH); gr.addColorStop(0, P.sky[0]); gr.addColorStop(1, P.sky[1]); x.fillStyle = gr; x.fillRect(0, 0, WW, HH);
  const [gx, gy, gc] = P.glow; const g2 = x.createRadialGradient(WW * gx, HH * gy, 0, WW * gx, HH * gy, 340); g2.addColorStop(0, gc + 'cc'); g2.addColorStop(.25, gc + '44'); g2.addColorStop(1, gc + '00'); x.fillStyle = g2; x.fillRect(0, 0, WW, HH);
  if (P.stars) for (let i = 0; i < 160; i++) { x.fillStyle = `rgba(255,255,255,${R() * .8})`; x.fillRect(R() * WW, R() * HH * .6, R() < .1 ? 2 : 1, R() < .1 ? 2 : 1); }
  for (let i = 0; i < 9; i++) { const cy = 60 + R() * 220, cw = 200 + R() * 300; const cg = x.createRadialGradient(R() * WW, cy, 0, R() * WW, cy, cw); cg.addColorStop(0, `rgba(${P.fog},.10)`); cg.addColorStop(1, `rgba(${P.fog},0)`); x.fillStyle = cg; x.fillRect(0, cy - cw, WW, cw * 2); }
  L.sky = c;
  const ridge = (col, base, amp, seed, snow) => { const [cc, xx] = mk(WW, HH), RR = RN(seed); let pts = [[0, base]]; for (let px = 0; px <= WW; px += 30) pts.push([px, base - amp * (Math.abs(Math.sin(px * .006 + seed)) * .7 + RR() * .5)]); pts.push([WW, HH], [0, HH]); xx.fillStyle = col; xx.beginPath(); pts.forEach((p, i) => i ? xx.lineTo(p[0], p[1]) : xx.moveTo(p[0], p[1])); xx.fill(); const fg = xx.createLinearGradient(0, base - amp, 0, base + 60); fg.addColorStop(0, `rgba(${P.fog},0)`); fg.addColorStop(1, `rgba(${P.fog},.28)`); xx.fillStyle = fg; xx.fillRect(0, base - amp, WW, amp + 80); return cc; };
  const far = ridge(P.far, 330, 150, 3); const [cf, xf] = mk(WW / 4, HH / 4); xf.drawImage(far, 0, 0, WW / 4, HH / 4); L.far = cf; L.farW = WW;
  const mid = ridge(P.mid, 390, 90, 9); const [cm, xm] = mk(WW, HH); xm.drawImage(mid, 0, 0); xm.fillStyle = P.mid; for (let i = 0; i < 46; i++) { const tx = R() * WW, ty = 380 + R() * 40, s = 18 + R() * 30; xm.beginPath(); xm.moveTo(tx - s * .45, ty); xm.lineTo(tx, ty - s * 2.4); xm.lineTo(tx + s * .45, ty); xm.fill(); xm.beginPath(); xm.moveTo(tx - s * .6, ty - s * .6); xm.lineTo(tx, ty - s * 2.7); xm.lineTo(tx + s * .6, ty - s * .6); xm.fill(); } L.mid = cm;
  const [cn, xn] = mk(WW, HH); const ng = xn.createLinearGradient(0, 400, 0, HH); ng.addColorStop(0, P.mid); ng.addColorStop(1, '#000'); xn.fillStyle = ng; xn.fillRect(0, 400, WW, 140); xn.fillStyle = '#000'; for (let i = 0; i < 70; i++) { const gx2 = R() * WW; xn.beginPath(); xn.moveTo(gx2, 420); xn.lineTo(gx2 + (R() - .5) * 10, 395 - R() * 25); xn.lineTo(gx2 + 4, 420); xn.fill(); } [[40, 60], [WW - 50, 80]].forEach(([tx, w]) => { xn.fillStyle = '#020104'; xn.fillRect(tx - w / 2, 0, w, HH); xn.beginPath(); xn.arc(tx, 40, w * 1.2, 0, 7); xn.fill(); }); L.near = cn;
  return CINL[key] = L;
}
function drawCinema(g, key, t) {
  const L = cin(key), P = CPAL[key] || CPAL.night, dx = Math.sin(t * .18) * 28;
  g.drawImage(L.sky, -40 - dx * .3, 0); g.drawImage(L.far, 0, 0, L.farW / 4, 540 / 4, -40 - dx * .6, 0, L.farW, 540); g.drawImage(L.mid, -40 - dx, 0); g.drawImage(L.near, -40 - dx * 1.6, 0);
  g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 5; i++) { const x0 = 120 + i * 190 + Math.sin(t * .3 + i) * 20, a = .035 + .025 * Math.sin(t * .8 + i * 2); g.fillStyle = `rgba(${P.fog},${a})`; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + 70, 0); g.lineTo(x0 + 280, 540); g.lineTo(x0 + 120, 540); g.fill(); } g.restore();
  for (let i = 0; i < 3; i++) { const fy = 360 + i * 45, fo = ((t * (10 + i * 6) + i * 300) % 1400) - 300, fg = g.createLinearGradient(0, fy - 50, 0, fy + 50); fg.addColorStop(0, `rgba(${P.fog},0)`); fg.addColorStop(.5, `rgba(${P.fog},${.12 + i * .03})`); fg.addColorStop(1, `rgba(${P.fog},0)`); g.fillStyle = fg; g.fillRect(fo - 700, fy - 50, 1400, 100); }
}
function cinFinish(g, t, W, H) {
  const vg = g.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .95); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.7)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  if (!GRAIN) { const [c, x] = mk(160, 160), id = x.createImageData(160, 160); for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } x.putImageData(id, 0, 0); GRAIN = g.createPattern(c, 'repeat'); }
  g.save(); g.globalAlpha = .07; g.globalCompositeOperation = 'overlay'; g.translate((Math.random() * 160) | 0, (Math.random() * 160) | 0); g.fillStyle = GRAIN; g.fillRect(-160, -160, W + 320, H + 320); g.restore();
}
