// Sprites 8 direções (frames: 0 frente, 1 frente-dir, 2 dir, 3 costas-dir, 4 costas, 5 costas-esq, 6 esq, 7 frente-esq)
const MAN={"kael": {"cw": 39, "ch": 100, "n": 8}, "lyra": {"cw": 33, "ch": 96, "n": 8}, "eld": {"cw": 42, "ch": 100, "n": 8}, "dar": {"cw": 52, "ch": 104, "n": 8}, "tho": {"cw": 64, "ch": 88, "n": 8}, "aur": {"cw": 52, "ch": 100, "n": 8}, "ser": {"cw": 33, "ch": 100, "n": 8}, "wolf": {"cw": 68, "ch": 72, "n": 8}, "bat": {"cw": 62, "ch": 108, "n": 8}, "ogre": {"cw": 99, "ch": 124, "n": 8}, "golem": {"cw": 101, "ch": 130, "n": 8}, "exec": {"cw": 99, "ch": 190, "n": 8}, "smith": {"cw": 64, "ch": 88, "n": 8}, "keep": {"cw": 52, "ch": 104, "n": 8}, "mor": {"cw": 33, "ch": 96, "n": 8}, "mira": {"cw": 33, "ch": 96, "n": 8}, "farm": {"cw": 52, "ch": 104, "n": 8}};
const SPR={};
for(const k in MAN){const i=new Image();i.src='assets/'+k+'.png';SPR[k]={img:i,...MAN[k]};}
const SILC={};
function dirIdx(fx,fy){if(!fx&&!fy)return 0;return(Math.round(Math.atan2(fx,fy)/(Math.PI/4))+8)%8;}
function silh(sp,i,color){const key=sp.img.src+i+color;if(SILC[key])return SILC[key];const c=document.createElement('canvas');c.width=sp.cw;c.height=sp.ch;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(sp.img,i*sp.cw,0,sp.cw,sp.ch,0,0,sp.cw,sp.ch);x.globalCompositeOperation='source-atop';x.fillStyle=color;x.fillRect(0,0,sp.cw,sp.ch);return SILC[key]=c;}
// s: {fx,fy | di, m:'idle|walk|run|atk|cast|hurt|dead', t, ph, sc, a, fly, el, sil, flash}
function drawSpr(g,k,x,y,s){
  const sp=SPR[k];if(!sp||!sp.img.complete||!sp.cw)return;
  const di=s.di!=null?s.di:dirIdx(s.fx,s.fy),m=s.m||'idle',t=s.t||0,ph=s.ph||0,sc=s.sc||1,now=performance.now()/1000;
  let dx=0,dy=0,rot=0,sx=1,sy=1,split=0,al=s.a==null?1:s.a,fx=s.fx||0,fy=s.fy||0;
  if(m==='walk'||m==='run'){const k2=m==='run'?1.25:1;dy=-Math.abs(Math.sin(ph))*3*k2;rot=Math.sin(ph)*.045*k2;sx=1+Math.sin(ph*2)*.02;split=Math.sin(ph)*3*k2;}
  else if(m==='idle'){sy=1+Math.sin(now*2+x*.01)*.012;}
  else if(m==='atk'){const p=Math.min(1,t/.4),l=Math.sin(p*Math.PI);dx=fx*14*l;dy=fy*7*l-l*3;rot=(fx>=0?1:-1)*.14*l;sy=1-.05*l;}
  else if(m==='cast'){const p=Math.min(1,t/.6);dy=-Math.sin(p*Math.PI)*7;sy=1+.03*Math.sin(now*14);}
  else if(m==='hurt'){dx=-fx*5+Math.sin(now*60)*2;rot=-(fx>=0?1:-1)*.08;}
  else if(m==='dead'){rot=(fx>=0?-1:1)*1.5*Math.min(1,t*2.2);}
  g.save();g.globalAlpha=al;
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y,sp.cw*sc*.38,sp.cw*sc*.1,0,0,7);g.fill();
  if(m==='cast'&&s.el){const r=26+Math.sin(now*10)*4,gr=g.createRadialGradient(x,y,2,x,y,r*2.4);gr.addColorStop(0,s.el+'aa');gr.addColorStop(1,s.el+'00');g.fillStyle=gr;g.beginPath();g.ellipse(x,y-10,r*2.4,r*1.5,0,0,7);g.fill();}
  g.translate(x+dx,y+dy-(s.fly||0));g.rotate(rot);g.scale(sc*sx,sc*sy);g.imageSmoothingEnabled=false;
  const th=Math.round(sp.ch*.62),sxF=di*sp.cw;
  const src=s.sil?silh(sp,di,'#07040c'):s.flash?silh(sp,di,'#ffffff'):sp.img,off=(s.sil||s.flash)?0:sxF;
  if(split){g.drawImage(src,off,0,sp.cw,th,-sp.cw/2,-sp.ch,sp.cw,th);g.drawImage(src,off,th,sp.cw,sp.ch-th,-sp.cw/2+split,-sp.ch+th,sp.cw,sp.ch-th);}
  else g.drawImage(src,off,0,sp.cw,sp.ch,-sp.cw/2,-sp.ch,sp.cw,sp.ch);
  g.restore();
  return {dx,dy:dy-(s.fly||0)};
}
