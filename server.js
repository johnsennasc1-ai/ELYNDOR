// Servidor do Elyndor: arquivos estáticos + salas em tempo real via SSE (sem dependências).
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 3000, PUB = path.join(__dirname, 'public'), MAX = 8;
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };
const rooms = new Map(); // sala -> Map(id -> {res,name,hero,x,y})
const clean = (s, n) => String(s || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, n);
const send = (res, ev, d) => res.write('event: ' + ev + '\ndata: ' + JSON.stringify(d) + '\n\n');
function bcast(room, from, ev, d) { const r = rooms.get(room); if (!r) return; for (const [id, p] of r) if (id !== from) send(p.res, ev, d); }

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');
  if (u.pathname === '/health') { res.end('ok'); return; }
  if (u.pathname === '/api/join') {
    const room = clean(u.searchParams.get('room'), 20) || 'valdora', id = clean(u.searchParams.get('id'), 12);
    const name = String(u.searchParams.get('name') || 'Viajante').slice(0, 14), hero = clean(u.searchParams.get('hero'), 6) || 'kael';
    if (!id) { res.writeHead(400); res.end(); return; }
    if (!rooms.has(room)) rooms.set(room, new Map());
    const r = rooms.get(room);
    if (r.size >= MAX && !r.has(id)) { res.writeHead(403); res.end('sala cheia'); return; }
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive', 'X-Accel-Buffering': 'no' });
    const me = { res, name, hero, x: 750, y: 450 };
    r.set(id, me);
    send(res, 'hello', { players: [...r].filter(([k]) => k !== id).map(([k, p]) => ({ id: k, name: p.name, hero: p.hero, x: p.x, y: p.y })) });
    bcast(room, id, 'join', { id, name, hero });
    req.on('close', () => { r.delete(id); bcast(room, id, 'leave', { id }); if (!r.size) rooms.delete(room); });
    return;
  }
  if (u.pathname === '/api/send' && req.method === 'POST') {
    let b = ''; req.on('data', c => { b += c; if (b.length > 4096) req.destroy(); });
    req.on('end', () => {
      try {
        const m = JSON.parse(b), room = clean(m.room, 20), id = clean(m.id, 12), p = rooms.get(room)?.get(id);
        if (!p) { res.writeHead(404); res.end(); return; }
        if (m.type === 'p' && m.data) { p.x = +m.data.x || 0; p.y = +m.data.y || 0; }
        if (m.type === 'chat') m.data = { t: String(m.data?.t || '').slice(0, 140) };
        if (['p', 'chat', 'fx', 'tb'].includes(m.type)) bcast(room, id, 'msg', { id, name: p.name, type: m.type, data: m.data });
        res.writeHead(204); res.end();
      } catch (e) { res.writeHead(400); res.end(); }
    });
    return;
  }
  let f = path.normalize(path.join(PUB, u.pathname === '/' ? 'index.html' : u.pathname));
  if (!f.startsWith(PUB)) { res.writeHead(403); res.end(); return; }
  fs.readFile(f, (e, d) => { if (e) { res.writeHead(404); res.end('404'); return; } res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); res.end(d); });
}).listen(PORT, () => console.log('Elyndor rodando na porta ' + PORT));
setInterval(() => { for (const r of rooms.values()) for (const p of r.values()) p.res.write(': ping\n\n'); }, 15000);
