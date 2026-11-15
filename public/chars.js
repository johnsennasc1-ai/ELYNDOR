// Personagens totalmente procedurais: esqueleto 2D com animação de idle, andar, correr, golpes, magia, dano e queda.
const CHARS = {
  kael: { n: 'Kael Varen', fac: 'Ascensão', role: 'Guerreiro de Fogo', skin: '#e3b48c', hair: '#4b2a17', hs: 'short', cloth: '#7a5a44', trim: '#c0303c', pants: '#2f3b5a', boots: '#3a2a20', cape: '#b02a3a', w: 'sword', el: '#ff7a2a', sk: 'Brasa Cortante', hp: 130, at: 15, sp: 150, rng: 56, ranged: 0 },
  lyra: { n: 'Lyra Solen', fac: 'Ascensão', role: 'Curandeira de Água', skin: '#efc3a0', hair: '#b5502a', hs: 'pony', cloth: '#5f8a54', trim: '#eee3c8', pants: '#3a3a30', boots: '#5a4030', cape: null, w: 'staff', el: '#4ac8ff', sk: 'Gota Restauradora', hp: 105, at: 10, sp: 150, rng: 0, ranged: 1 },
  eld: { n: 'Eldarion Thal', fac: 'Ascensão', role: 'Arqueiro de Vento', skin: '#ecd0b4', hair: '#e8e8f0', hs: 'long', ears: 1, cloth: '#4f6b3d', trim: '#caa860', pants: '#2c2a34', boots: '#3a2a20', cape: '#33482c', w: 'bow', el: '#8fe8a0', sk: 'Lâmina de Vento', hp: 100, at: 12, sp: 170, rng: 0, ranged: 1 },
  ser: { n: 'Seraphine Voss', fac: 'Redenção', role: 'Maga da Sombra', skin: '#e8c4aa', hair: '#1a1020', hs: 'long', cloth: '#4a2a6a', trim: '#8a5ac0', pants: '#2a1838', boots: '#2a1a30', cape: null, w: 'wand', el: '#b070ff', sk: 'Toque Sombrio', hp: 100, at: 13, sp: 155, rng: 0, ranged: 1 },
  dar: { n: 'Darius Korven', fac: 'Redenção', role: 'Soldado da Terra', skin: '#d4a278', hair: '#2a2018', hs: 'short', beard: '#2a2018', cloth: '#56657f', trim: '#c0c8d8', pants: '#34303a', boots: '#2a2a2e', cape: '#34587f', w: 'mace', shield: 1, el: '#c9a060', sk: 'Punho de Pedra', hp: 150, at: 13, sp: 140, rng: 52, ranged: 0, bw: 1.15 },
  tho: { n: 'Thorin Bragg', fac: 'Redenção', role: 'Anão do Metal', skin: '#d9a07c', hair: '#c8501e', hs: 'bald', beard: '#c8501e', bigbeard: 1, cloth: '#6a4630', trim: '#d9a03c', pants: '#3a2a22', boots: '#4a3322', cape: null, w: 'hammer', el: '#ff9a3c', sk: 'Impacto de Ferro', hp: 145, at: 15, sp: 130, rng: 54, ranged: 0, short: .82, bw: 1.3 },
  aur: { n: 'Auren', fac: 'Mistério', role: 'O Viajante', skin: '#d8b090', hair: '#ececf2', hs: 'long', beard: '#dcdce4', cloth: '#34345a', trim: '#6ab4ff', pants: '#2a2a40', boots: '#3a2a20', cape: '#3a3470', w: 'staff2', el: '#6ab4ff', sk: '—', hp: 200, at: 20, sp: 120, rng: 0, ranged: 1 }
};
const ease = p => 1 - Math.pow(1 - p, 3);
function limb(g, x, y, a, l, w, c) { const ex = x + Math.sin(a) * l, ey = y + Math.cos(a) * l; g.strokeStyle = c; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke(); return [ex, ey]; }
function weapon(g, c, hx, hy, a, K, glow) {
  g.save(); g.translate(hx, hy); g.rotate(-a);
  const w = c.w;
  if (w === 'sword') { g.fillStyle = K('#d8e0ea'); g.shadowColor = glow ? c.el : 'transparent'; g.shadowBlur = glow ? 14 : 0; g.fillRect(-1.6, 3, 3.2, 24); g.fillStyle = K('#b8902a'); g.fillRect(-5, 1, 10, 2.5); g.fillRect(-1.2, -4, 2.4, 5); }
  else if (w === 'hammer') { g.fillStyle = K('#6a4a2a'); g.fillRect(-1.5, -4, 3, 28); g.fillStyle = K('#8a929c'); g.fillRect(-8, 20, 16, 10); g.fillStyle = K(c.trim); g.fillRect(-8, 20, 16, 2); }
  else if (w === 'mace') { g.fillStyle = K('#6a4a2a'); g.fillRect(-1.5, -3, 3, 20); g.fillStyle = K('#8a929c'); g.beginPath(); g.arc(0, 21, 6, 0, 7); g.fill(); }
  else if (w === 'staff' || w === 'staff2') { g.fillStyle = K('#7a5a34'); g.fillRect(-1.3, -8, 2.6, 40); g.fillStyle = K(c.el); g.shadowColor = c.el; g.shadowBlur = 12; g.beginPath(); g.arc(0, 34, w === 'staff2' ? 4.5 : 3.6, 0, 7); g.fill(); }
  else if (w === 'wand') { g.fillStyle = K('#2a1a30'); g.fillRect(-1, -2, 2, 15); g.fillStyle = K(c.el); g.shadowColor = c.el; g.shadowBlur = 12; g.beginPath(); g.arc(0, 14, 2.8, 0, 7); g.fill(); }
  else if (w === 'bow') { g.strokeStyle = K('#7a5030'); g.lineWidth = 2.4; g.beginPath(); g.moveTo(0, -15); g.quadraticCurveTo(glow ? 12 : 9, 0, 0, 15); g.stroke(); g.strokeStyle = K('#e8e8e0'); g.lineWidth = .8; g.beginPath(); g.moveTo(0, -15); g.lineTo(glow ? -4 : 0, 0); g.lineTo(0, 15); g.stroke(); if (glow) { g.strokeStyle = K(c.el); g.lineWidth = 1.5; g.beginPath(); g.moveTo(-4, 0); g.lineTo(18, 0); g.stroke(); } }
  g.restore();
}
// s: {d:1|-1, m:'idle|walk|run|atk|cast|hurt|dead', t:tempo no estado, ph:fase da caminhada, sil:silhueta, a:alpha, sc:escala, flash}
function drawChar(g, id, x, y, s) {
  const c = CHARS[id], sc = (s.sc || 1) * (c.short || 1), d = s.d || 1, m = s.m || 'idle', t = s.t || 0, ph = s.ph || 0, bw = c.bw || 1;
  const K = col => s.sil ? '#07040c' : (s.flash ? '#ffffff' : col);
  const now = performance.now() / 1000;
  let bob = 0, legA = 0, armF = .1, armB = -.1, lean = 0, glow = 0, headY = 0, rot = 0;
  if (m === 'walk' || m === 'run') { const k = m === 'run' ? 1.25 : 1; legA = Math.sin(ph) * .75 * k; armB = -legA * .85; armF = legA * .85; bob = Math.abs(Math.sin(ph)) * 2.4; lean = .06 * k; }
  else if (m === 'idle') { bob = Math.sin(now * 2 + x * .01) * .9; armF = .12 + Math.sin(now * 2) * .04; armB = -.12; }
  else if (m === 'atk') {
    const p = Math.min(1, t / .4);
    if (c.ranged && c.w === 'bow') { armF = 1.57; armB = p < .6 ? 1.0 + p * .6 : 1.9 - (p - .6) * 3; glow = p < .6 ? 1 : 0; lean = -.05; }
    else if (c.ranged) { armF = 1.2 + ease(p) * .5; armB = -.4; lean = .1 * p; glow = 1; }
    else { armF = 2.9 - 2.4 * ease(p); armB = -.5 + p; lean = .28 * Math.sin(p * 3.1); glow = p > .3 && p < .7 ? 1 : 0; legA = .4 * Math.sin(p * 3.1); }
  } else if (m === 'cast') { const p = Math.min(1, t / .6); armF = 2.4 + Math.sin(now * 14) * .15; armB = 2.2; bob = -3 * Math.sin(p * 3.1); glow = 1; headY = -1.5; }
  else if (m === 'hurt') { lean = -.3; armF = -.6; armB = .8; bob = -2; }
  else if (m === 'dead') { rot = Math.min(1, t * 2.2) * -1.45; }
  g.save(); g.translate(x, y); if (s.a != null) g.globalAlpha = s.a;
  g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(0, 0, 15 * sc * bw, 5 * sc, 0, 0, 7); g.fill();
  g.scale(d * sc, sc); g.rotate(rot + lean * -.3); g.translate(0, -bob);
  // capa
  if (c.cape) { const sw = Math.sin(now * 3 + ph) * 2 + (m === 'walk' || m === 'run' ? 5 : 0); g.fillStyle = K(c.cape); g.beginPath(); g.moveTo(-3, -36); g.lineTo(-11 * bw - sw, -9); g.lineTo(-1, -10); g.lineTo(3, -34); g.fill(); }
  // braço de trás + escudo
  const sh = [-3, -34];
  const hb = limb(g, sh[0], sh[1], armB, 17, 4.6, K(c.cloth));
  if (c.shield) { g.fillStyle = K(c.trim); g.strokeStyle = K('#8a929c'); g.lineWidth = 1.5; g.beginPath(); g.arc(hb[0], hb[1], 8, 0, 7); g.fill(); g.stroke(); }
  // pernas
  limb(g, -2 * bw, -18, -legA, 18, 5.2 * bw, K(c.pants)); limb(g, 2 * bw, -18, legA, 18, 5.2 * bw, K(c.pants));
  g.fillStyle = K(c.boots); g.fillRect(-5 * bw - Math.sin(legA) * 18 * -.0 - 1, -3, 7, 4); g.fillRect(-1 + 2 * bw, -3, 7, 4);
  // torso
  g.fillStyle = K(c.cloth); g.beginPath(); g.moveTo(-6.5 * bw, -36); g.quadraticCurveTo(-8 * bw, -26, -6 * bw, -17); g.lineTo(6 * bw, -17); g.quadraticCurveTo(8 * bw, -26, 6.5 * bw, -36); g.closePath(); g.fill();
  g.fillStyle = K(c.trim); g.fillRect(-6.2 * bw, -22, 12.4 * bw, 2.6); g.fillRect(-1, -35, 2, 14);
  if (c.bigbeard) { g.fillStyle = K(c.beard); g.beginPath(); g.moveTo(-7, -42); g.quadraticCurveTo(-9, -26, 0, -22); g.quadraticCurveTo(9, -26, 7, -42); g.fill(); }
  // cabeça
  const hy = -44 + headY; g.fillStyle = K(c.skin); g.beginPath(); g.arc(0, hy, 7.2, 0, 7); g.fill();
  if (c.ears) { g.beginPath(); g.moveTo(-6, hy - 1); g.lineTo(-13, hy - 5); g.lineTo(-6, hy + 3); g.fill(); }
  if (c.beard && !c.bigbeard) { g.fillStyle = K(c.beard); g.beginPath(); g.moveTo(-5, hy + 1); g.quadraticCurveTo(0, hy + 12, 5, hy + 1); g.quadraticCurveTo(0, hy + 4, -5, hy + 1); g.fill(); }
  g.fillStyle = K(c.hair);
  if (c.hs === 'short') { g.beginPath(); g.arc(0, hy - 1, 7.8, Math.PI, 0); g.lineTo(7.5, hy - 1); g.quadraticCurveTo(2, hy - 6, -6, hy - 2); g.fill(); }
  else if (c.hs === 'pony') { g.beginPath(); g.arc(0, hy - 1, 7.8, Math.PI, 0); g.fill(); const sw = Math.sin(now * 4 + ph * 1.5) * 3; g.beginPath(); g.moveTo(-6, hy - 4); g.quadraticCurveTo(-16 - sw, hy + 4, -10 - sw, hy + 16); g.quadraticCurveTo(-8, hy + 6, -4, hy - 1); g.fill(); }
  else if (c.hs === 'long') { g.beginPath(); g.arc(0, hy - 1, 7.8, Math.PI, 0); g.lineTo(7.8, hy + 9); g.lineTo(-8, hy + 12 + Math.sin(now * 3) * 1.5); g.fill(); }
  else if (c.hs === 'bald') { g.beginPath(); g.arc(0, hy - 4, 5, Math.PI, 0); g.fill(); g.fillRect(-2, hy - 12, 4, 5); }
  if (!s.sil) { g.fillStyle = '#1a1210'; g.fillRect(2.4, hy - .5, 2, 2.2); }
  // braço da frente + arma
  const hf = limb(g, 3, -34, armF, 17, 4.8, K(c.cloth)); g.fillStyle = K(c.skin); g.beginPath(); g.arc(hf[0], hf[1], 2.6, 0, 7); g.fill();
  weapon(g, c, hf[0], hf[1], c.w === 'bow' ? 1.57 : armF, K, glow);
  if (glow && !s.sil && c.w !== 'bow') { g.globalAlpha *= .0; }
  g.restore();
}
