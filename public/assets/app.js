/* testnolan.com · lógica de la página. Se carga al final del body, después de scoring.js. */
(async function(){
const SITE_URL = 'https://testnolan.com/es/';
// Datos (partidos, ámbitos, preguntas y justificaciones) en /data/es-2026.json; cálculo puro en /assets/scoring.js (compartido con los tests)
const DATA = await fetch('/data/es-2026.json', {cache:'no-cache'}).then(r=>{ if(!r.ok) throw new Error('datos '+r.status); return r.json(); });
const PARTIES = DATA.parties, TOPICS = DATA.topics, QUESTIONS = DATA.questions, WHY = DATA.why || {};
const DATA_VERSION = DATA.version, DATA_DATE = DATA.date;
const Scoring = window.Scoring;
const C = Scoring.C, K = Scoring.K, xy = Scoring.xy, zoneOf = Scoring.zoneOf;
function axisScore(getVal){ return Scoring.scoreAxes(QUESTIONS, getVal); }
function affinity(i, src=answers){ return Scoring.affinity(QUESTIONS, src, i); }
const SITE_SHORT = 'testnolan.com';
// Durante el periodo de prohibición de encuestas (24–28 de noviembre) puede ponerse a false para que la imagen compartida no muestre el partido más afín.
const SHARE_SHOW_TOP_PARTY = true;
// Veredicto «te representa», sobre la afinidad del partido más cercano (en %):
const REP_FULL = 85;     // desde aquí: «te representa»
const REP_PARTIAL = 75;  // desde aquí: «es el que más se parece a ti, con matices»; por debajo: «ninguno del todo»
const REP_TIE = 3;       // si el segundo está a esta distancia o menos, empate
const REP_MIN_AXIS = 4;  // respuestas mínimas por eje para emitir veredicto

const LABELS = ['Muy en contra','En contra','Neutral','A favor','Muy a favor'];
const STORE_KEY = 'testnolan-es-2026';
const HASH_VERSION = '3';
const NAME_MAX = 24;

let answers = {};
let hidden = new Set();
let name = '';
let page = 0;          // ámbito actual (índice en TOPICS)
let activeCard = null; // tarjeta activa (para el teclado)
let showAllMatches = false;
let group = [];        // [{name,E,P,src}] personas recibidas por enlace (#g=) o añadidas a mano. Nunca llega al servidor.

// Nombre: se permiten tildes, eñes, ces trencadas, apóstrofos y cualquier letra (se envía en UTF-8 codificado). Se quitan solo los caracteres que romperían el HTML o el formato del enlace (~ y | separan campos; % y + confunden al leer el hash).
function cleanName(s){ return String(s||'').replace(/[<>"&~|%+]/g,'').replace(/\s+/g,' ').trim().slice(0,NAME_MAX); }
function esc(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

// Por defecto solo se muestran los partidos españoles: las referencias internacionales empiezan ocultas y se encienden en la leyenda. HIDDEN_VERSION invalida la elección guardada con el criterio anterior.
const HIDDEN_VERSION = 2;
const REF_IDS = PARTIES.filter(p=>p.ref).map(p=>p.id);
hidden = new Set(REF_IDS);
try{ const s = JSON.parse(localStorage.getItem(STORE_KEY)||'null'); if(s){ answers = s.answers||{}; if(s.hv===HIDDEN_VERSION) hidden = new Set(s.hidden||[]); name = cleanName(s.name); group = Array.isArray(s.group) ? s.group.map(cleanPerson).filter(Boolean) : []; page = Number.isInteger(s.page) ? Math.min(Math.max(0,s.page),TOPICS.length-1) : 0; } }catch(e){}
// Respuestas guardadas de preguntas que ya no existen (versiones anteriores): se descartan para que no cuenten en el progreso
{ const valid = new Set(QUESTIONS.map(q=>q.id)); for(const k of Object.keys(answers)) if(!valid.has(k)) delete answers[k]; }
function save(){ try{ localStorage.setItem(STORE_KEY, JSON.stringify({answers, hidden:[...hidden], hv:HIDDEN_VERSION, name, page, group})); }catch(e){} }

const partyScores = Scoring.partyScores(PARTIES, QUESTIONS);

function cssVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }



// Enlace del grupo: #g=Nombre~E~P|Otro~E~P (puntuaciones de 0 a 100). Nunca llega al servidor. HASH_VERSION cambia si cambia el formato.
function cleanPerson(x){ if(!x) return null; const nm=cleanName(x.name), E=Math.round(+x.E), P=Math.round(+x.P); if(!nm || !(E>=0&&E<=100) || !(P>=0&&P<=100)) return null; return {name:nm, E, P, src:x.src==='link'?'link':'manual'}; }
function encodeGroup(list){ return list.map(p=>`${p.name}~${p.E}~${p.P}`).join('|'); }
function decodeGroup(str){ if(!str) return []; return str.split('|').map(t=>{ const [n,e,pp]=t.split('~'); return cleanPerson({name:n, E:e, P:pp, src:'link'}); }).filter(Boolean); }
function mergeFromHash(){
  try{
    const prm = new URLSearchParams(location.hash.replace(/^#/,'')); const inc = decodeGroup(prm.get('g')); let added = 0;
    for(const x of inc){ if(name && x.name.toLowerCase()===name.toLowerCase()) continue; if(group.some(g=>g.name===x.name && g.E===x.E && g.P===x.P)) continue; group.push(x); added++; }
    if(added) save(); return added;
  }catch(e){ return 0; }
}
function myEntry(){ const u = axisScore(q=>answers[q.id]); if(!name || (u.E===null && u.P===null)) return null; return {name, E:Math.round(u.E ?? 50), P:Math.round(u.P ?? 50), src:'me'}; }
mergeFromHash();
function baseUrl(){ return (location.origin && location.origin!=='null') ? location.origin + location.pathname : SITE_URL; }
function compareUrl(){ const me = myEntry(); const list = [...(me?[me]:[]), ...group]; return baseUrl() + (list.length ? '#g=' + encodeURIComponent(encodeGroup(list)) : ''); }

// Geometría del rombo: E y P de 0 a 100. Centro (280,280), semidiagonal 240
function pts(arr){ return arr.map(([E,P])=>xy(E,P).join(',')).join(' '); }
const ZONES = [
  {c:'--z-lib', p:[[100,100],[100,50],[50,50],[50,100]]},
  {c:'--z-der', p:[[100,0],[50,0],[50,50],[100,50]]},
  {c:'--z-aut', p:[[0,0],[50,0],[50,50],[0,50]]},
  {c:'--z-izq', p:[[0,100],[0,50],[50,50],[50,100]]},
];
const CENTER_SQ = [[65,65],[65,35],[35,35],[35,65]];
const ZONE_LABELS = [['Libertario','Libertad en todo',88,88],['Derecha','Conservador',90,14],['Izquierda','Progresista',22,90],['Autoritario','Totalitarismo',10,10]];

// Marcas de personas: tu grupo (por enlace o a mano) y tú
function personMarks(){
  const marks = [];
  group.forEach((g,i)=>marks.push({id:'g'+i, label:g.name, E:g.E, P:g.P, color:'--friend', ink:'--friend-ink'}));
  const user = axisScore(q=>answers[q.id]);
  if(user.E!==null || user.P!==null) marks.push({id:'you', label:name||'Tú', E:user.E ?? 50, P:user.P ?? 50, color:'--accent', ink:'--accent-ink'});
  return marks;
}

const svgNS = 'http://www.w3.org/2000/svg';
function el(tag, attrs={}, text){ const n=document.createElementNS(svgNS,tag); for(const k in attrs) n.setAttribute(k,attrs[k]); if(text!==undefined) n.textContent=text; return n; }

function drawChart(){
  const svg = document.getElementById('chartG');
  svg.innerHTML = '';
  const muted = cssVar('--muted');
  ZONES.forEach(z=>svg.appendChild(el('polygon',{points:pts(z.p), fill:cssVar(z.c), 'fill-opacity':cssVar('--zone-op'), stroke:muted, 'stroke-width':'0.6'})));
  svg.appendChild(el('polygon',{points:pts(CENTER_SQ), fill:cssVar('--z-cen'), 'fill-opacity':(parseFloat(cssVar('--zone-op'))+.12).toFixed(2), stroke:muted, 'stroke-width':'0.6'}));
  svg.appendChild(el('line',{x1:xy(0,100)[0], y1:280, x2:xy(100,0)[0], y2:280, stroke:muted, 'stroke-width':'0.8', 'stroke-dasharray':'4 4'}));
  const placed = [];
  const zl = (txt, sub, E, P) => { const [x,y]=xy(E,P); svg.appendChild(el('text',{x, y, 'text-anchor':'middle', class:'zone-label'}, txt)); if(sub) svg.appendChild(el('text',{x, y:y+16, 'text-anchor':'middle', class:'zone-sub'}, sub));
    const w=Math.max(txt.length*8.6, (sub||'').length*6.4); placed.push({x:x-w/2,y:y-14,w,h:34}); };
  ZONE_LABELS.forEach(z=>zl(...z));
  const [cx0,cy0]=xy(50,50); svg.appendChild(el('text',{x:cx0, y:cy0+30, 'text-anchor':'middle', class:'zone-sub'}, 'Centro')); placed.push({x:cx0-22,y:cy0+19,w:44,h:14});
  // ejes en los bordes
  const ax = (txt,x,y,rot) => { const t=el('text',{x,y,'text-anchor':'middle',class:'axis-label',transform:`rotate(${rot} ${x} ${y})`},txt); svg.appendChild(t); };
  ax('LIBERTAD ECONÓMICA →', 150, 152, -45);
  ax('← LIBERTAD PERSONAL', 410, 152, 45);
  // puntos
  const fits = (b) => b.x>=4 && b.x+b.w<=556 && b.y>=4 && b.y+b.h<=556 && !placed.some(o=> b.x < o.x+o.w && b.x+b.w > o.x && b.y < o.y+o.h && b.y+b.h > o.y);
  const items = PARTIES.filter(p=>!hidden.has(p.id)).map(p=>({p, s:partyScores[p.id]}));
  const marks = personMarks();
  // reservar huecos de los puntos
  items.forEach(({s})=>{ const [x,y]=xy(s.E,s.P); placed.push({x:x-7,y:y-7,w:14,h:14}); });
  marks.forEach(m=>{ const [x,y]=xy(m.E,m.P); m.x=x; m.y=y; placed.push({x:x-11,y:y-11,w:22,h:22}); });
  const labelOf = (txt, x, y) => {
    const w = txt.length*7.4+6, h=16;
    const cands = [[10,-8],[-10-w,-8],[-w/2,-24],[-w/2,10],[10,-20],[10,4],[-10-w,-20],[-10-w,4]];
    for(const [dx,dy] of cands){ const b={x:x+dx,y:y+dy,w,h}; if(fits(b)){ placed.push(b); return b; } }
    const b={x:x+10,y:y-8,w,h}; placed.push(b); return b;
  };
  items.forEach(({p,s})=>{
    const [x,y]=xy(s.E,s.P);
    const g = el('g');
    const fill = p.ref ? cssVar(p.color) : cssVar('--ink');
    g.appendChild(el('circle',{cx:x, cy:y, r:p.ref?6.5:5.5, fill, stroke:cssVar('--surface'), 'stroke-width':'1.5'}));
    g.appendChild(el('title',{}, `${p.full}: economía ${Math.round(s.E)}, libertades ${Math.round(s.P)}`));
    svg.appendChild(g);
  });
  // etiquetas después para que queden encima
  items.forEach(({p,s})=>{
    const [x,y]=xy(s.E,s.P); const b = labelOf(p.name, x, y);
    svg.appendChild(el('rect',{x:b.x, y:b.y, width:b.w, height:b.h, rx:3, class:'p-label-bg'}));
    const t = el('text',{x:b.x+3, y:b.y+12, class:'p-label'}, p.name); if(p.ref) t.style.fill = cssVar(p.color); svg.appendChild(t);
  });
  marks.forEach(m=>{
    const color = cssVar(m.color);
    const g = el('g',{class: m.id==='you' ? 'you-dot' : 'friend-dot'});
    g.appendChild(el('circle',{cx:m.x, cy:m.y, r:11, fill:color, 'fill-opacity':'0.18', stroke:color, 'stroke-width':'2'}));
    g.appendChild(el('circle',{cx:m.x, cy:m.y, r:4.5, fill:color}));
    g.appendChild(el('title',{}, `${m.label}: economía ${Math.round(m.E)}, libertades ${Math.round(m.P)}`));
    svg.appendChild(g);
    const b = labelOf(m.label, m.x, m.y);
    svg.appendChild(el('rect',{x:b.x, y:b.y, width:b.w, height:b.h, rx:3, fill:color}));
    const yt = el('text',{x:b.x+3, y:b.y+12, class:'p-label'}, m.label); yt.style.fill = cssVar(m.ink); svg.appendChild(yt);
  });
  // descripción accesible actualizada
  const you = marks.find(m=>m.id==='you');
  let desc = 'Rombo dividido en zonas libertaria, derecha, izquierda, autoritaria y centro, con un punto por partido calculado a partir de sus respuestas.';
  if(you) desc += ` Tu posición: zona ${zoneOf(you.E,you.P)}, libertad económica ${Math.round(you.E)} y libertad personal ${Math.round(you.P)} sobre 100.`;
  if(group.length) desc += ' También ' + group.map(g=>`${g.name} (${zoneOf(g.E,g.P)}, ${g.E} y ${g.P})`).join(', ') + '.';
  document.getElementById('chartDesc').textContent = desc;
}

function drawLegend(){
  const lg = document.getElementById('legend'); lg.innerHTML='';
  const chip = p=>{
    const b = document.createElement('button'); b.type='button'; b.className='chip'; b.id='chip-'+p.id;
    b.setAttribute('aria-pressed', hidden.has(p.id)?'false':'true');
    b.innerHTML = `<span class="dot" style="background:${p.ref?`var(${p.color})`:'var(--ink)'}"></span>${p.name}`;
    b.title = `${p.full} · ${p.lead}${p.note?` · ${p.note}`:''}`;
    b.setAttribute('aria-label', `${hidden.has(p.id)?'Mostrar':'Ocultar'} ${p.full} en el rombo`);
    b.addEventListener('click',()=>{ hidden.has(p.id)?hidden.delete(p.id):hidden.add(p.id); save(); drawLegend(); drawChart(); drawResult(); });
    return b;
  };
  const real = PARTIES.filter(p=>!p.ref), refs = PARTIES.filter(p=>p.ref);
  const g1 = document.createElement('div'); g1.className='legend-group'; real.forEach(p=>g1.appendChild(chip(p))); lg.appendChild(g1);
  if(refs.length){
    const g2 = document.createElement('div'); g2.className='legend-group';
    const lab = document.createElement('span'); lab.className='legend-lab'; lab.textContent='Referencias'; g2.appendChild(lab);
    refs.forEach(p=>g2.appendChild(chip(p)));
    const allOff = refs.every(p=>hidden.has(p.id));
    const t = document.createElement('button'); t.type='button'; t.className='linkbtn legend-all'; t.textContent = allOff ? 'Mostrar todas' : 'Ocultar todas';
    t.addEventListener('click',()=>{ refs.forEach(p=> allOff ? hidden.delete(p.id) : hidden.add(p.id)); save(); drawLegend(); drawChart(); drawResult(); });
    g2.appendChild(t); lg.appendChild(g2);
  }
}

// Temas en los que coincides (misma respuesta, sin contar el neutral) y en los que discrepas (3 o más pasos de distancia) con el partido i
function matchLists(i){
  const ag=[], dg=[];
  for(const q of QUESTIONS){
    const v = answers[q.id]; if(v===undefined || q.a[i]===null) continue;
    const d = Math.abs(v-q.a[i]);
    if(d===0 && v!==0) ag.push({q, w:Math.abs(v)});
    else if(d>=3) dg.push({q, w:d});
  }
  ag.sort((x,y)=>y.w-x.w); dg.sort((x,y)=>y.w-x.w);
  return {ag, dg};
}
// Veredicto: ¿te representa algún partido? Se basa en la afinidad del más cercano (sin las referencias internacionales).
function pname(p, withArt=true){ return (withArt && p.art ? p.art+' ' : '') + p.name; }
function joinNames(ps, withArt=true){ const n = ps.map(p=>pname(p,withArt)); return n.length>1 ? n.slice(0,-1).join(', ')+' y '+n[n.length-1] : n[0]; }
function verdict(){
  const u = axisScore(q=>answers[q.id]);
  if(u.nE<REP_MIN_AXIS || u.nP<REP_MIN_AXIS) return {level:'insufficient', u};
  const rows = PARTIES.map((p,i)=>({p,a:affinity(i)})).filter(r=>!r.p.ref).sort((x,y)=>y.a-x.a);
  const top = rows[0], tied = rows.filter(r=>top.a - r.a <= REP_TIE);
  const level = top.a>=REP_FULL ? 'full' : top.a>=REP_PARTIAL ? 'partial' : 'none';
  return {level, u, a:top.a, parties:tied.map(r=>r.p), tie:tied.length>1};
}
function verdictTexts(v){
  if(v.level==='insufficient') return {label:'Veredicto', h:'Aún sin veredicto', s:`Responde al menos ${REP_MIN_AXIS} preguntas de cada eje y te digo algo.`, short:'', share:''};
  const names = joinNames(v.parties), bare = joinNames(v.parties,false), pct = `${v.a.toFixed(0)} % de afinidad`;
  if(v.level==='full') return {label:'Veredicto', h: v.tie ? `Te representan por igual ${names}` : `Te representa ${names}`, s:`${pct}. Piensas como ${v.tie?'ellos':'él'} en casi todo lo que has respondido.`, short:`te representa: ${bare}`, share:`Me representa${v.tie?'n':''} ${names}`};
  if(v.level==='partial') return {label:'Veredicto', h: v.tie ? `Los que más se parecen a ti, con matices: ${bare}` : `El que más se parece a ti, con matices: ${bare}`, s:`${pct}. Hay acuerdo de fondo, pero fíjate en qué no coincidís, que ahí está lo interesante.`, short:`se parece: ${bare}`, share:`${v.tie?'Los que más se me parecen':'El que más se me parece'}: ${bare}`};
  return {label:'Veredicto', h:'Ningún partido te representa del todo', s:`${v.tie?'Los más cercanos son':'El más cercano es'} ${names}, con ${pct}. No eres el único, le pasa a mucha gente.`, short:`ninguno del todo (${bare})`, share:`Ningún partido me representa del todo (más cercano: ${bare})`};
}
function listTopics(arr, max){ const names = arr.slice(0,max).map(x=>x.q.k); const rest = arr.length-names.length; return names.join(', ') + (rest>0 ? ` y ${rest} más` : ''); }

function drawResult(){
  const r = document.getElementById('result'), mBox = document.getElementById('matches');
  const u = axisScore(q=>answers[q.id]);
  const n = Object.keys(answers).length;
  const me = myEntry();
  document.querySelectorAll('#nets .net').forEach(b=>b.disabled = !me); document.getElementById('dlImg').disabled = !me; document.getElementById('copyLink').disabled = !(me || group.length);
  document.getElementById('shareHint').textContent = !n ? 'Responde unas cuantas preguntas y podrás compartir tu punto en el rombo y retar a tu gente a hacer lo mismo.' : !name ? 'Pon tu nombre arriba y se activará el botón de compartir.' : 'Los botones abren la red con el texto y el enlace del grupo ya escritos. La imagen con el rombo se descarga aparte, por si quieres adjuntarla.';
  drawStrip(u, n);
  if(!n){
    r.innerHTML = `<div class="result-head"><h2>Tu posición</h2></div>
      <p class="empty">Todavía no has respondido nada. Con unas pocas respuestas en cada eje ya sales en el rombo, y aquí verás tu puntuación y lo cerca que estás de cada partido.</p>`;
    mBox.innerHTML = `<div class="result-head"><h2>En qué coincides y en qué no</h2></div>
      <p class="empty">Aquí irán saliendo los temas en los que piensas igual que cada partido, y los que no. Suele haber sorpresas.</p>`;
    return;
  }
  const E = u.E ?? 50, P = u.P ?? 50;
  const rows = PARTIES.map((p,i)=>({p, i, a:affinity(i)})).filter(r=>!(r.p.ref && hidden.has(r.p.id))).sort((x,y)=>y.a-x.a);
  const warn = (u.nE<4 || u.nP<4) ? `<p class="note" style="margin-top:10px">Responde al menos 4 preguntas de cada eje para que la posición sea fiable${u.E===null?' (en economía aún no hay ninguna)':''}${u.P===null?' (en libertades aún no hay ninguna)':''}.</p>` : '';
  // Coincidencias: partidos y referencias visibles, de más a menos afinidad. Tres por defecto; al desplegar, la lista se desplaza dentro de la barra lateral.
  const expanded = showAllMatches && rows.length>3;
  const shown = expanded ? rows : rows.slice(0,3);
  const prevList = mBox.querySelector('.matches'), prevScroll = prevList ? prevList.scrollTop : 0;
  const matches = shown.map(({p,i,a})=>{ const m = matchLists(i); return `<div class="match${p.ref?' is-ref':''}"><div class="match-h"><strong>${p.name}${p.ref?' <span class="tag-ref">referencia</span>':''}</strong><span class="pct">${a.toFixed(0)} % de afinidad</span></div>
      <p><span class="ok">Coincidís en:</span> ${m.ag.length ? listTopics(m.ag,4) : 'nada claro todavía'}.</p>
      <p><span class="ko">Discrepáis en:</span> ${m.dg.length ? listTopics(m.dg,4) : 'nada de momento'}.</p></div>`; }).join('');
  const vt = verdictTexts(verdict()), vl = verdict().level;
  r.innerHTML = `<div class="result-head"><h2>Tu posición</h2><span class="zone-pill">${zoneOf(E,P)}</span></div>
    <div class="verdict ${vl}"><span class="label">${vt.label}</span><div class="v-h">${vt.h}</div><div class="v-s">${vt.s}</div></div>
    <div class="scores">
      <div class="score"><div class="k">Libertad económica</div><div class="v">${u.E===null?'—':Math.round(u.E)}<span class="note"> /100</span></div></div>
      <div class="score"><div class="k">Libertad personal</div><div class="v">${u.P===null?'—':Math.round(u.P)}<span class="note"> /100</span></div></div>
    </div>
    ${warn}
    <h3 style="margin-top:16px">Afinidad por respuestas</h3>
    <ul class="rank">${rows.map(({p,a})=>`<li><span class="${p.ref?'ref':''}">${p.name}</span><span class="bar"><i style="width:${a.toFixed(0)}%;${p.ref?`background:var(${p.color})`:''}"></i></span><span class="pct">${a.toFixed(0)} %</span></li>`).join('')}</ul>`;
  const rest = rows.length-3;
  mBox.innerHTML = `<div class="result-head"><h2>En qué coincides y en qué no</h2></div>
    <div class="matches-wrap${expanded?' scrolls':''}"><div class="matches"${expanded?' tabindex="0" role="region" aria-label="Coincidencias con todos los partidos y referencias visibles, de más a menos afinidad"':''}>${matches}</div></div>
    ${rows.length>3 ? `<p class="matches-more"><button type="button" class="linkbtn" id="moreMatches" aria-expanded="${expanded?'true':'false'}" aria-controls="matches">${expanded?'Ver solo los tres más cercanos':`Ver ${rest===1?'el otro':'los otros '+rest}`}</button></p>` : ''}`;
  const mm = document.getElementById('moreMatches'); if(mm) mm.addEventListener('click',()=>{ showAllMatches=!showAllMatches; drawResult(); });
  if(expanded){ const list = mBox.querySelector('.matches'), wrap = mBox.querySelector('.matches-wrap'); list.scrollTop = prevScroll; const edge = ()=>{ wrap.classList.toggle('at-end', list.scrollTop + list.clientHeight >= list.scrollHeight - 2); wrap.classList.toggle('at-start', list.scrollTop <= 2); }; list.addEventListener('scroll', edge, {passive:true}); edge(); }
}

// Franja superior en móvil: zona, puntuaciones y partido más afín
function drawStrip(u, n){
  let z, sm;
  if(!n){ z = 'Tu posición'; sm = `0 de ${QUESTIONS.length} · responde y aparecerás aquí`; }
  else {
    const E = u.E ?? 50, P = u.P ?? 50;
    const vt = verdictTexts(verdict());
    z = zoneOf(E,P);
    sm = `${u.E===null?'—':Math.round(u.E)} · ${u.P===null?'—':Math.round(u.P)}${vt.short?` · ${vt.short}`:''} · ${n}/${QUESTIONS.length}`;
  }
  for(const [a,b] of [['stripZ','stripS'],['liveZ','liveS']]){ document.getElementById(a).textContent = z; document.getElementById(b).textContent = sm; }
}

function drawGroup(){
  const box = document.getElementById('groupList'), hero = document.getElementById('heroNote');
  const me = myEntry();
  const rows = [];
  if(me) rows.push(`<li class="me"><span class="who">${esc(me.name)} <span class="note">(tú)</span></span><span class="sc">${me.E} · ${me.P}</span><span class="zone-pill">${zoneOf(me.E,me.P)}</span></li>`);
  group.forEach((g,i)=>rows.push(`<li><span class="who">${esc(g.name)}</span><span class="sc">${g.E} · ${g.P}</span><span class="zone-pill friend-pill">${zoneOf(g.E,g.P)}</span><button type="button" class="linkbtn rm" data-i="${i}" aria-label="Quitar a ${esc(g.name)} del grupo">quitar</button></li>`));
  const nl = group.filter(g=>g.src==='link').length;
  const head = group.length ? `<p class="note" style="margin-top:4px">${group.length===1?'Una persona':group.length+' personas'} en tu grupo${nl?` (${nl===group.length?(nl===1?'llegó':'llegaron todas'):nl} por enlace)`:''}. Economía · libertades, de 0 a 100.</p>` : '';
  box.innerHTML = rows.length ? head + `<ul class="glist">${rows.join('')}</ul>` : `<p class="note">Aquí saldrán los nombres y las puntuaciones de quien te pase su enlace, y los tuyos.</p>`;
  box.querySelectorAll('.rm').forEach(b=>b.addEventListener('click',()=>{ group.splice(+b.dataset.i,1); save(); refresh(false); }));
  if(group.length){
    const names = group.map(g=>g.name); const shown = names.slice(0,3).map(esc).join(', ') + (names.length>3 ? ` y ${names.length-3} más` : '');
    const n = Object.keys(answers).length;
    hero.innerHTML = `<strong>${shown}</strong> ${group.length===1?'ya está':'ya están'} en el rombo. ${n ? 'Tu punto sale junto a los suyos.' : 'Responde y verás dónde caes tú.'}`; hero.hidden = false;
  } else { hero.hidden = true; hero.innerHTML=''; }
}

const POS_LABEL = {'-2':'Muy en contra','-1':'En contra','0':'Neutral','1':'A favor','2':'Muy a favor'};
function whyBox(q){
  const d = document.createElement('details'); d.className='ctx why';
  d.innerHTML = '<summary>¿Por qué responde así cada partido?</summary><div class="why-box"></div>';
  let filled = false;
  d.addEventListener('toggle',()=>{
    if(!d.open || filled) return; filled = true;
    const box = d.querySelector('.why-box');
    const rows = PARTIES.map((p,i)=>{ const v = q.a[i]; const w = (WHY[p.id]||{})[q.id]; const txt = w && w[0] ? esc(w[0]) : 'Pendiente de documentar.'; const url = w && w[1] ? `<a href="${esc(w[1])}" target="_blank" rel="nofollow noopener noreferrer" aria-label="Fuente de la posición de ${esc(p.name)}">fuente</a>` : '';
      return `<div class="why-row${p.ref?' ref':''}"><span class="why-name">${p.name}</span><span class="why-pos">${v===null?'Sin dato':POS_LABEL[v]}</span><p>${txt} ${url}</p></div>`; });
    box.innerHTML = rows.join('') + '<p class="note why-foot">Las posiciones se asignan con programas, votos y declaraciones, y en las referencias internacionales solo con lo hecho gobernando. Si ves un error, <a href="https://github.com/trebormc/testnolan/issues" target="_blank" rel="noopener">abre un aviso en GitHub</a> con la fuente.</p>';
  });
  return d;
}
function answerGroups(q){
  const g = {2:[],1:[],0:[],'-1':[],'-2':[], nodata:[]};
  PARTIES.forEach((p,i)=>{ if(q.a[i]===null) g.nodata.push(p); else g[q.a[i]].push(p); });
  return g;
}
function topicQuestions(i){ return QUESTIONS.filter(q=>q.g===TOPICS[i].id); }
function answeredIn(qs){ return qs.filter(q=>answers[q.id]!==undefined).length; }

function buildCard(q){
  const card = document.createElement('div'); card.className='q'+(answers[q.id]!==undefined?' answered':''); card.id='q-'+q.id; card.tabIndex=-1;
  const name_ = 'r-'+q.id;
  const num = String(QUESTIONS.indexOf(q)+1).padStart(2,'0');
  card.innerHTML = `<div class="q-meta"><span class="qnum">${num} / ${QUESTIONS.length}</span><span class="axis-tag">${q.ax==='E'?'Economía':'Libertades'}</span></div>
    <p class="q-text" id="t-${q.id}">${q.t}</p>
    ${q.c?`<details class="ctx"><summary>¿Qué significa?</summary><p>${q.c}</p></details>`:''}
    <div class="scale" role="radiogroup" aria-labelledby="t-${q.id}">
      ${[-2,-1,0,1,2].map((v,k)=>`<label class="opt"><input type="radio" name="${name_}" id="${name_}-${k}" value="${v}" ${answers[q.id]===v?'checked':''} title="Pulsa otra vez para quitar la respuesta"><span>${LABELS[k]}</span></label>`).join('')}
    </div>
    <div class="parties-ans" id="pa-${q.id}" role="group" aria-label="Qué responde cada partido"></div>`;
  const pa = card.querySelector('.parties-ans');
  const g = answerGroups(q);
  if(g.nodata.length){ const nd = document.createElement('p'); nd.className='nodata'; nd.textContent = 'Sin dato: ' + g.nodata.map(p=>p.name).join(', ') + '. No cuenta en su posición ni en tu afinidad.'; card.appendChild(nd); }
  card.appendChild(whyBox(q));
  [-2,-1,0,1,2].forEach((v,k)=>{
    const col = document.createElement('div'); col.className='col'+(answers[q.id]===v?' mine':'');
    col.innerHTML = g[v].length ? g[v].map(p=>`<span class="n ${p.ref?'ref':''}">${p.name}${q.src&&q.src[p.id]?`<a class="src" href="${q.src[p.id]}" target="_blank" rel="nofollow noopener noreferrer" aria-label="Fuente de la respuesta de ${p.full}">fuente</a>`:''}</span>`).join('') : '<span class="none">—</span>';
    pa.appendChild(col);
  });
  const markMine = ()=> pa.querySelectorAll('.col').forEach((c,k)=>c.classList.toggle('mine', answers[q.id]===[-2,-1,0,1,2][k]));
  card.querySelectorAll('input').forEach(inp=>{
    inp.addEventListener('pointerdown',()=>{ inp.dataset.was = inp.checked ? '1' : '0'; });
    inp.addEventListener('click',()=>{
      if(inp.dataset.was==='1'){ inp.checked=false; clearAnswer(q, card, markMine); }
      else setAnswer(q, parseInt(inp.value,10), card, markMine);
      inp.dataset.was='0';
    });
  });
  card.addEventListener('focusin',()=>setActive(card));
  card.addEventListener('pointerdown',()=>setActive(card));
  return card;
}
function setAnswer(q, v, card, markMine){ answers[q.id]=v; save(); card.classList.add('answered'); markMine(); refresh(false); }
function clearAnswer(q, card, markMine){ delete answers[q.id]; save(); card.classList.remove('answered'); markMine(); refresh(false); }
function setActive(card){ if(activeCard===card) return; if(activeCard) activeCard.classList.remove('active'); activeCard=card; if(card) card.classList.add('active'); }

function drawSteps(){
  const nav = document.getElementById('steps'); nav.innerHTML='';
  TOPICS.forEach((t,i)=>{
    const qs = topicQuestions(i), done = answeredIn(qs);
    const b = document.createElement('button'); b.type='button'; b.className='step'+(done===qs.length?' done':'');
    if(i===page) b.setAttribute('aria-current','step');
    b.setAttribute('aria-label', `Ámbito ${i+1}, ${t.t}: ${done} de ${qs.length} respondidas`);
    b.innerHTML = `<span class="s-n">${String(i+1).padStart(2,'0')} · ${done}/${qs.length}</span><span class="s-t">${t.t}</span><span class="s-b"><i style="width:${(100*done/qs.length).toFixed(0)}%"></i></span>`;
    b.addEventListener('click',()=>goPage(i, true));
    nav.appendChild(b);
  });
  const cur = nav.querySelector('[aria-current]'); if(cur && nav.scrollWidth>nav.clientWidth) nav.scrollTo({left: cur.offsetLeft - (nav.clientWidth - cur.offsetWidth)/2, behavior:'smooth'});
}

function drawQuestions(){
  const list = document.getElementById('qlist'); list.innerHTML=''; activeCard=null;
  const t = TOPICS[page], qs = topicQuestions(page);
  document.getElementById('pagerHead').innerHTML = `<div><span class="label">Ámbito ${page+1} de ${TOPICS.length} · ${t.ax==='E'?'Economía':'Libertades'}</span><h2>${t.t}</h2></div><span class="pager-sub" id="pagerSub">${answeredIn(qs)} de ${qs.length} respondidas</span>`;
  qs.forEach(q=>list.appendChild(buildCard(q)));
  const nav = document.getElementById('pagerNav');
  const last = page===TOPICS.length-1;
  nav.innerHTML = `<button type="button" class="btn" id="pgPrev" ${page===0?'disabled':''}>← Anterior</button>
    <span class="hint">${last ? 'Último ámbito' : `Siguiente: ${TOPICS[page+1].t}`}</span>
    ${last ? `<button type="button" class="btn primary" id="pgNext">Ver mi resultado</button>` : `<button type="button" class="btn primary" id="pgNext">Siguiente ámbito →</button>`}`;
  document.getElementById('pgPrev').addEventListener('click',()=>goPage(page-1, true));
  document.getElementById('pgNext').addEventListener('click',()=>{ if(last) document.getElementById('dash').scrollIntoView({behavior:'smooth', block:'start'}); else goPage(page+1, true); });
  drawSteps();
}
function goPage(i, scroll){
  if(i<0||i>=TOPICS.length) return;
  page=i; save(); drawQuestions();
  if(scroll){ const h=document.getElementById('pagerHead'); const top=h.getBoundingClientRect().top; if(top<0 || top>window.innerHeight*0.5) h.scrollIntoView({behavior:'smooth', block:'start'}); }
}

function drawProgress(){
  const n=Object.keys(answers).length;
  document.getElementById('pbar').style.width = (100*n/QUESTIONS.length).toFixed(1)+'%';
  const ps = document.getElementById('pagerSub'); if(ps) ps.textContent = `${answeredIn(topicQuestions(page))} de ${topicQuestions(page).length} respondidas`;
  drawSteps();
}

function drawTable(){
  const tb = document.querySelector('#ptable tbody');
  tb.innerHTML = PARTIES.map(p=>{ const s=partyScores[p.id]; return `<tr><td>${p.name}</td><td>${p.full} · ${p.lead}${p.note?`<br><span class="note">${p.note}</span>`:''}</td><td class="num">${Math.round(s.E)}</td><td class="num">${Math.round(s.P)}</td></tr>`; }).join('');
  document.getElementById('dataVersion').textContent = `Datos de partidos y preguntas: versión ${DATA_VERSION}, actualizada el ${DATA_DATE}. ${QUESTIONS.filter(q=>q.ax==='E').length} preguntas de economía y ${QUESTIONS.filter(q=>q.ax==='P').length} de libertades, en ${TOPICS.length} ámbitos. El registro de cambios y las fuentes están en el repositorio.`;
}

function refresh(full=true){ if(full) drawQuestions(); drawChart(); drawResult(); drawGroup(); drawProgress(); }

/* ---------- Teclado: 1–5 responde la pregunta activa, flechas cambian de pregunta (y de ámbito al llegar al borde) ---------- */
function currentCard(){
  if(activeCard && document.contains(activeCard)) return activeCard;
  const cards=[...document.querySelectorAll('#qlist .q')]; return cards.find(c=>!c.classList.contains('answered')) || cards[0] || null;
}
function focusCard(t){ setActive(t); t.focus({preventScroll:true}); const r=t.getBoundingClientRect(); if(r.top<80 || r.bottom>window.innerHeight-20) t.scrollIntoView({block:'center', behavior:'smooth'}); }
function moveCard(d){
  const cards=[...document.querySelectorAll('#qlist .q')]; if(!cards.length) return;
  const c = currentCard(); const i = cards.indexOf(c) + d;
  if(i<0){ if(page>0){ goPage(page-1,false); const cs=[...document.querySelectorAll('#qlist .q')]; focusCard(cs[cs.length-1]); } return; }
  if(i>=cards.length){ if(page<TOPICS.length-1){ goPage(page+1,false); const cs=[...document.querySelectorAll('#qlist .q')]; focusCard(cs[0]); } return; }
  focusCard(cards[i]);
}
document.addEventListener('keydown',(e)=>{
  if(e.metaKey||e.ctrlKey||e.altKey) return;
  const tg = e.target;
  if(tg.matches('input:not([type=radio]), textarea, select')) return;
  if(/^[1-5]$/.test(e.key)){
    const card = currentCard(); if(!card) return;
    const inp = card.querySelector(`input[value="${parseInt(e.key,10)-3}"]`); if(!inp) return;
    e.preventDefault(); setActive(card);
    if(inp.checked){ inp.dataset.was='1'; inp.click(); return; }
    inp.dataset.was='0'; inp.click();
    setTimeout(()=>moveCard(1),180);
    return;
  }
  if(tg.matches('input[type=radio]')) return; // las flechas en un grupo de radios cambian la selección (comportamiento nativo)
  if(e.key==='ArrowDown'||e.key==='ArrowRight'||e.key==='j'){ e.preventDefault(); moveCard(1); }
  else if(e.key==='ArrowUp'||e.key==='ArrowLeft'||e.key==='k'){ e.preventDefault(); moveCard(-1); }
});

/* ---------- Imagen para compartir (canvas 1200 × 630) ---------- */
function rr(ctx,x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
async function loadFonts(){
  if(!document.fonts) return;
  try{ await Promise.all(['700 48px "Bricolage Grotesque"','500 48px "Bricolage Grotesque"','400 24px "Source Sans 3"','600 24px "Source Sans 3"','500 20px "IBM Plex Mono"'].map(f=>document.fonts.load(f))); }catch(e){}
}
// Pinta el rombo en un canvas, en un cuadrado de lado `size` con esquina (ox, oy). Misma geometría que el SVG.
function paintChart(ctx, ox, oy, size, opts={}){
  const k = size/560;
  const T = (E,Pv)=>{ const [x,y]=xy(E,Pv); return [ox+x*k, oy+y*k]; };
  const muted=cssVar('--muted'), ink=cssVar('--ink'), ink2=cssVar('--ink-2'), surface=cssVar('--surface'), zop=parseFloat(cssVar('--zone-op'));
  const fD=s=>`700 ${s*k}px "Bricolage Grotesque", system-ui, sans-serif`, fB=(s,w=400)=>`${w} ${s*k}px "Source Sans 3", system-ui, sans-serif`, fM=s=>`500 ${s*k}px "IBM Plex Mono", ui-monospace, monospace`;
  const txt=(s,x,y,font,color,align='center')=>{ ctx.font=font; ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='alphabetic'; ctx.fillText(s,x,y); };
  const poly=(arr,fill,alpha)=>{ ctx.beginPath(); arr.forEach(([E,Pv],i)=>{ const [x,y]=T(E,Pv); i?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.closePath(); ctx.globalAlpha=alpha; ctx.fillStyle=fill; ctx.fill(); ctx.globalAlpha=1; ctx.strokeStyle=muted; ctx.lineWidth=Math.max(.6*k,.6); ctx.stroke(); };
  ZONES.forEach(z=>poly(z.p, cssVar(z.c), zop));
  poly(CENTER_SQ, cssVar('--z-cen'), zop+.12);
  ctx.save(); ctx.setLineDash([4*k,4*k]); ctx.strokeStyle=muted; ctx.lineWidth=.8*k; ctx.beginPath(); const [lx1,ly1]=T(0,100), [lx2,ly2]=T(100,0); ctx.moveTo(lx1,ly1); ctx.lineTo(lx2,ly2); ctx.stroke(); ctx.restore();
  const placed=[];
  ZONE_LABELS.forEach(([t,sub,E,Pv])=>{ const [x,y]=T(E,Pv); txt(t,x,y,fD(15),ink); txt(sub,x,y+16*k,fB(11.5),ink2); const w=Math.max(t.length*8.6,sub.length*6.4)*k; placed.push({x:x-w/2,y:y-14*k,w,h:34*k}); });
  const [cx0,cy0]=T(50,50); txt('Centro',cx0,cy0+30*k,fB(11.5),ink2); placed.push({x:cx0-22*k,y:cy0+19*k,w:44*k,h:14*k});
  const axl=(s,x,y,rot)=>{ ctx.save(); ctx.translate(ox+x*k,oy+y*k); ctx.rotate(rot*Math.PI/180); txt(s,0,0,fM(10.5),ink2); ctx.restore(); };
  axl('LIBERTAD ECONÓMICA →',150,152,-45); axl('← LIBERTAD PERSONAL',410,152,45);
  const items = PARTIES.filter(p=> opts.allParties ? true : !hidden.has(p.id)).map(p=>({p,s:partyScores[p.id]}));
  const marks = personMarks().filter(m=> (m.id==='you' ? opts.showUser!==false : opts.showGroup!==false));
  items.forEach(({s})=>{ const [x,y]=T(s.E,s.P); placed.push({x:x-7*k,y:y-7*k,w:14*k,h:14*k}); });
  marks.forEach(m=>{ const [x,y]=T(m.E,m.P); m.x=x; m.y=y; placed.push({x:x-11*k,y:y-11*k,w:22*k,h:22*k}); });
  const bx0=ox+4*k, by0=oy+4*k, bw=552*k;
  const fits=b=> b.x>=bx0 && b.x+b.w<=bx0+bw && b.y>=by0 && b.y+b.h<=by0+bw && !placed.some(o=> b.x<o.x+o.w && b.x+b.w>o.x && b.y<o.y+o.h && b.y+b.h>o.y);
  const labelOf=(t,x,y)=>{
    ctx.font=fB(12.5,600); const w=ctx.measureText(t).width+6*k, h=16*k;
    const cands=[[10*k,-8*k],[-10*k-w,-8*k],[-w/2,-24*k],[-w/2,10*k],[10*k,-20*k],[10*k,4*k],[-10*k-w,-20*k],[-10*k-w,4*k]];
    for(const [dx,dy] of cands){ const b={x:x+dx,y:y+dy,w,h}; if(fits(b)){ placed.push(b); return b; } }
    const b={x:x+10*k,y:y-8*k,w,h}; placed.push(b); return b;
  };
  items.forEach(({p,s})=>{ const [x,y]=T(s.E,s.P); ctx.beginPath(); ctx.arc(x,y,(p.ref?6.5:5.5)*k,0,Math.PI*2); ctx.fillStyle=p.ref?cssVar(p.color):ink; ctx.fill(); ctx.strokeStyle=surface; ctx.lineWidth=1.5*k; ctx.stroke(); });
  items.forEach(({p,s})=>{ const [x,y]=T(s.E,s.P); const b=labelOf(p.name,x,y); ctx.globalAlpha=.9; ctx.fillStyle=surface; rr(ctx,b.x,b.y,b.w,b.h,3*k); ctx.fill(); ctx.globalAlpha=1; txt(p.name,b.x+3*k,b.y+12*k,fB(12.5,600),p.ref?cssVar(p.color):ink,'left'); });
  marks.forEach(m=>{
    const color=cssVar(m.color);
    ctx.beginPath(); ctx.arc(m.x,m.y,11*k,0,Math.PI*2); ctx.globalAlpha=.18; ctx.fillStyle=color; ctx.fill(); ctx.globalAlpha=1; ctx.strokeStyle=color; ctx.lineWidth=2*k; ctx.stroke();
    ctx.beginPath(); ctx.arc(m.x,m.y,4.5*k,0,Math.PI*2); ctx.fillStyle=color; ctx.fill();
    const b=labelOf(m.label,m.x,m.y); ctx.fillStyle=color; rr(ctx,b.x,b.y,b.w,b.h,3*k); ctx.fill(); txt(m.label,b.x+3*k,b.y+12*k,fB(12.5,600),cssVar(m.ink),'left');
  });
}
function wrapText(ctx, text, x, y, maxW, lineH){
  const words=text.split(' '); let line=''; let yy=y;
  for(const w of words){ const test=line?line+' '+w:w; if(ctx.measureText(test).width>maxW && line){ ctx.fillText(line,x,yy); line=w; yy+=lineH; } else line=test; }
  if(line) ctx.fillText(line,x,yy); return yy;
}
// imgMode: 'user' (resultado del usuario, con las referencias que tenga visibles) u 'og' (imagen genérica para Open Graph, con todos los partidos y referencias). La genérica se captura con npm run og.
async function renderShareImage(imgMode){
  const W=1200, H=630, cv=document.getElementById('shareCanvas'); cv.width=W; cv.height=H;
  const ctx=cv.getContext('2d');
  await loadFonts();
  const bg=cssVar('--bg'), ink=cssVar('--ink'), muted=cssVar('--muted'), accent=cssVar('--ink'), surface=cssVar('--surface'), soft=cssVar('--soft'), line=cssVar('--line-strong');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  ctx.fillStyle=surface; rr(ctx,32,35,560,560,20); ctx.fill(); ctx.strokeStyle=line; ctx.lineWidth=1.5; ctx.stroke();
  paintChart(ctx, 32, 35, 560, {showUser: imgMode==='user', showGroup: imgMode==='user', allParties: imgMode!=='user'});
  const X=640, COLW=520;
  const t=(s,x,y,font,color,align='left')=>{ ctx.font=font; ctx.fillStyle=color; ctx.textAlign=align; ctx.textBaseline='alphabetic'; ctx.fillText(s,x,y); };
  try{ ctx.letterSpacing='0.08em'; }catch(e){}
  t('TEST DE NOLAN · GENERALES DE ESPAÑA · 29N 2026', X, 86, '500 17px "IBM Plex Mono", ui-monospace, monospace', muted);
  try{ ctx.letterSpacing='0px'; }catch(e){}
  if(imgMode==='user'){
    const u=axisScore(q=>answers[q.id]); const E=u.E ?? 50, P=u.P ?? 50;
    t(name ? `A ${name} le sale` : 'Me sale', X, 148, '400 26px "Source Sans 3", system-ui, sans-serif', muted);
    t(zoneOf(E,P), X, 232, '700 84px "Bricolage Grotesque", system-ui, sans-serif', ink);
    const tile=(x,y,w,h,label,val)=>{ ctx.fillStyle=soft; rr(ctx,x,y,w,h,14); ctx.fill(); t(label,x+20,y+36,'400 18px "Source Sans 3", system-ui, sans-serif',muted); const vs=val===null?'—':String(Math.round(val)); t(vs,x+20,y+92,'500 50px "IBM Plex Mono", ui-monospace, monospace',ink); ctx.font='500 50px "IBM Plex Mono", ui-monospace, monospace'; const vw=ctx.measureText(vs).width; t('/100',x+20+vw+8,y+92,'400 18px "Source Sans 3", system-ui, sans-serif',muted); };
    tile(X,268,250,116,'Libertad económica',u.E); tile(X+270,268,250,116,'Libertad personal',u.P);
    if(SHARE_SHOW_TOP_PARTY){
      const vt = verdictTexts(verdict());
      if(vt.share){ ctx.font='600 24px "Source Sans 3", system-ui, sans-serif'; ctx.fillStyle=ink; ctx.textAlign='left'; wrapText(ctx, vt.share, X, 436, COLW, 30); }
    }
    t('¿Y a ti? Son 5 minutos.', X, 536, '400 28px "Source Sans 3", system-ui, sans-serif', muted);
  } else {
    t('¿Qué partido te', X, 170, '700 60px "Bricolage Grotesque", system-ui, sans-serif', ink);
    t('representa', X, 234, '700 60px "Bricolage Grotesque", system-ui, sans-serif', ink);
    t('de verdad?', X, 298, '700 60px "Bricolage Grotesque", system-ui, sans-serif', ink);
    ctx.font='400 25px "Source Sans 3", system-ui, sans-serif'; ctx.fillStyle=muted; ctx.textAlign='left';
    wrapText(ctx, `Si no sabes a quién votar el 29N: ${QUESTIONS.length} preguntas, 5 minutos, y ves con qué partido coincides de verdad. Y con cuál no.`, X, 352, COLW, 34);
    t('Gratis, sin registro y sin guardar nada.', X, 536, '400 28px "Source Sans 3", system-ui, sans-serif', muted);
  }
  t(SITE_SHORT, X, 588, '700 46px "Bricolage Grotesque", system-ui, sans-serif', accent);
  return new Promise(res=>cv.toBlob(res,'image/png'));
}
function shareText(){
  const u=axisScore(q=>answers[q.id]); const E=u.E ?? 50, P=u.P ?? 50;
  const vt = verdictTexts(verdict());
  const g = group.length ? ` Ya somos ${group.length+1} en el rombo.` : '';
  return `Me sale ${zoneOf(E,P)} (${u.E===null?'—':Math.round(u.E)}/${u.P===null?'—':Math.round(u.P)}) en el test de Nolan para el 29N${vt.share && SHARE_SHOW_TOP_PARTY ? ' y '+vt.share.charAt(0).toLowerCase()+vt.share.slice(1) : ''}.${g} Son 5 minutos. ¿Y a ti?`;
}
function downloadBlob(blob,fname){ const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fname; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); },1500); }
function setShareMsg(s){ document.getElementById('shareMsg').textContent = s; }
// Aviso breve pegado a un botón (en lugar de un alert): se muestra 1,8 s y desaparece
const tipTimers = {};
function showTip(id, msg){ const t=document.getElementById(id); if(!t) return; t.textContent=msg; t.classList.add('show'); clearTimeout(tipTimers[id]); tipTimers[id]=setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>{ t.textContent = t.dataset.label || ''; },200); },1800); }
// Copia al portapapeles con tres vías: API moderna (solo en HTTPS o localhost), execCommand (HTTP en red local) y, si todo falla, un campo seleccionado para copiar a mano
async function copyToClipboard(str, tipId, okMsg){
  let ok = false;
  if(navigator.clipboard && window.isSecureContext){ try{ await navigator.clipboard.writeText(str); ok = true; }catch(e){} }
  if(!ok){
    try{ const ta=document.createElement('textarea'); ta.value=str; ta.setAttribute('readonly',''); ta.style.cssText='position:fixed;top:0;left:0;width:1px;height:1px;opacity:0'; document.body.appendChild(ta); ta.focus(); ta.select(); ta.setSelectionRange(0,str.length); ok = document.execCommand('copy'); ta.remove(); }catch(e){ ok=false; }
  }
  if(ok){ showTip(tipId, okMsg); setShareMsg(''); return true; }
  const box=document.getElementById('shareLinks');
  box.innerHTML = `<label class="note" style="display:block;margin-top:6px">No se ha podido copiar solo. Selecciona y copia:<input class="copyfield" readonly value="${esc(str)}" style="display:block;width:100%;margin-top:6px;font:inherit;font-size:13px;border:1px solid var(--line-strong);background:var(--bg);color:var(--ink);border-radius:var(--r);padding:8px 10px"></label>`;
  box.hidden=false; const f=box.querySelector('input'); f.focus(); f.select();
  return false;
}
function netUrl(net, text, url){
  const enc=encodeURIComponent;
  if(net==='wa') return `https://wa.me/?text=${enc(text+' '+url)}`;
  if(net==='tg') return `https://t.me/share/url?url=${enc(url)}&text=${enc(text)}`;
  if(net==='x')  return `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`;
  if(net==='fb') return `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}&quote=${enc(text)}`;
  return url;
}
document.querySelectorAll('#nets .net[data-net]').forEach(b=>b.addEventListener('click',()=>{
  if(b.disabled) return;
  const w = window.open(netUrl(b.dataset.net, shareText(), compareUrl()), '_blank', 'noopener');
  if(!w) setShareMsg('El navegador ha bloqueado la ventana. Copia el enlace y pégalo tú.');
}));
// Compartir nativo (móvil y algunos escritorios): imagen + texto + enlace en una sola hoja
const netNative = document.getElementById('netNative');
if(navigator.share) document.getElementById('netNativeWrap').hidden = false;
netNative.addEventListener('click', async ()=>{
  netNative.disabled=true; setShareMsg('Preparando la imagen…');
  try{
    const text=shareText(), url=compareUrl();
    let payload = {text, url};
    try{ const blob=await renderShareImage('user'); const file=new File([blob],'testnolan-resultado.png',{type:'image/png'}); if(navigator.canShare && navigator.canShare({files:[file]})) payload={files:[file], text, url}; }catch(e){}
    await navigator.share(payload); setShareMsg('');
  }catch(e){ setShareMsg(e && e.name==='AbortError' ? '' : 'No se ha podido abrir el menú de compartir.'); }
  finally{ netNative.disabled = !myEntry(); }
});
document.getElementById('dlImg').addEventListener('click', async ()=>{
  const btn=document.getElementById('dlImg'); btn.disabled=true; setShareMsg('');
  try{ const blob=await renderShareImage('user'); downloadBlob(blob,'testnolan-resultado.png'); showTip('dlTip','Imagen descargada'); }
  catch(e){ setShareMsg('No se ha podido generar la imagen en este navegador.'); }
  finally{ btn.disabled=false; }
});
document.getElementById('copyLink').addEventListener('click',()=>copyToClipboard(compareUrl(),'copyTip','Enlace copiado'));
document.getElementById('stripResult').addEventListener('click',()=>document.getElementById('dash').scrollIntoView({behavior:'smooth', block:'start'}));
document.getElementById('liveTop').addEventListener('click',()=>document.getElementById('dash').scrollIntoView({behavior:'smooth', block:'start'}));
const nameInput = document.getElementById('nameInput'), nameBtn = document.getElementById('nameBtn'); nameInput.value = name;
function commitName(){ name = cleanName(nameInput.value); nameInput.value = name; save(); refresh(false); nameBtn.textContent = name ? 'Cambiar' : 'Añadir mi nombre'; if(name) setShareMsg(''); }
nameBtn.textContent = name ? 'Cambiar' : 'Añadir mi nombre';
nameBtn.addEventListener('click',()=>{ if(nameBtn.textContent==='Cambiar'){ nameInput.focus(); nameInput.select(); nameBtn.textContent='Guardar'; } else commitName(); });
nameInput.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); commitName(); } });
nameInput.addEventListener('input',()=>{ if(cleanName(nameInput.value)!==name) nameBtn.textContent = name ? 'Guardar' : 'Añadir mi nombre'; });
// Añadir a mano: nombre obligatorio y dos enteros de 0 a 100. Los campos numéricos solo aceptan cifras y se recortan a 100; el botón no se activa hasta que todo es válido.
(function(){
  const nI=document.getElementById('mName'), eI=document.getElementById('mE'), pI=document.getElementById('mP'), btn=document.getElementById('mAdd'), err=document.getElementById('mErr');
  const HELP = 'Las dos puntuaciones de 0 a 100 que salen en «Tu posición».';
  const touched = new Set();
  const scoreOf = inp => { const v = inp.value.trim(); if(!/^\d{1,3}$/.test(v)) return null; const n = parseInt(v,10); return n>=0 && n<=100 ? n : null; };
  function validate(show, force){
    const nm = cleanName(nI.value), E = scoreOf(eI), P = scoreOf(pI);
    const problems = [];
    if(!nm) problems.push({inp:nI, msg: nI.value.trim() ? 'El nombre solo puede llevar letras, números y espacios.' : 'Falta el nombre.'});
    if(E===null) problems.push({inp:eI, msg:'La puntuación de economía tiene que ser un número entero de 0 a 100.'});
    if(P===null) problems.push({inp:pI, msg:'La puntuación de libertades tiene que ser un número entero de 0 a 100.'});
    const mark = pr => show && (force || touched.has(pr.inp));
    [nI,eI,pI].forEach(i=>{ const bad = problems.some(pr=>pr.inp===i && mark(pr)); i.classList.toggle('invalid', bad); i.setAttribute('aria-invalid', bad ? 'true' : 'false'); });
    btn.disabled = problems.length>0;
    const shown = problems.find(mark);
    err.textContent = shown ? shown.msg : HELP;
    err.style.color = shown ? 'var(--ko)' : '';
    return problems.length ? null : {name:nm, E, P, src:'manual'};
  }
  const digitsOnly = inp => { let v = inp.value.replace(/\D/g,'').slice(0,3); if(v!=='' && parseInt(v,10)>100) v = '100'; if(v!==inp.value) inp.value = v; };
  [eI,pI].forEach(i=>{ i.addEventListener('input',()=>{ digitsOnly(i); touched.add(i); validate(touched.size===3 || i.value!==''); }); i.addEventListener('blur',()=>{ touched.add(i); validate(true); }); });
  nI.addEventListener('input',()=>{ touched.add(nI); validate(nI.classList.contains('invalid') || (nI.value.trim()!=='' && !cleanName(nI.value))); });
  nI.addEventListener('blur',()=>{ touched.add(nI); if(nI.value.trim()) validate(true); else validate(false); });
  function add(){
    const x = validate(true, true);
    if(!x){ const first=[nI,eI,pI].find(i=>i.classList.contains('invalid')); if(first) first.focus(); return; }
    if(group.some(g=>g.name===x.name && g.E===x.E && g.P===x.P)){ err.textContent = `${x.name} ya está en el grupo con esas puntuaciones.`; err.style.color='var(--ko)'; return; }
    group.push(x); save(); nI.value=''; eI.value=''; pI.value=''; touched.clear(); validate(false); setShareMsg(`${x.name} ya está en el rombo.`); refresh(false); nI.focus();
  }
  btn.addEventListener('click',add);
  [nI,eI,pI].forEach(i=>i.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); add(); } }));
})();

/* ---------- Interacción general ---------- */
window.addEventListener('hashchange',()=>{ mergeFromHash(); refresh(false); });
// Las secciones informativas solo se abren al pulsar su título o un enlace de la barra superior; nunca por defecto ni al recargar con el hash en la URL.
document.querySelectorAll('a.top-link[href^="#"]').forEach(a=>a.addEventListener('click',()=>{ const d=document.getElementById(a.getAttribute('href').slice(1)); if(d && d.tagName==='DETAILS') d.open=true; }));

// Botón de borrar: dentro del pie de la página de preguntas para no competir con el flujo principal
(function(){
  const nav = document.querySelector('.kbd-hint');
  const b = document.createElement('button'); b.type='button'; b.className='linkbtn'; b.id='reset'; b.textContent='Borrar todas mis respuestas'; b.style.marginTop='10px'; b.style.display='inline-block';
  nav.insertAdjacentElement('afterend', b);
  let armed=false, timer;
  b.addEventListener('click',()=>{
    const note=document.getElementById('resetConfirm');
    if(!Object.keys(answers).length){ note.hidden=false; note.textContent='No hay respuestas que borrar.'; clearTimeout(timer); timer=setTimeout(()=>note.hidden=true,2500); return; }
    if(!armed){ armed=true; b.textContent='Pulsa otra vez para borrar'; timer=setTimeout(()=>{armed=false; b.textContent='Borrar todas mis respuestas';},4000); return; }
    clearTimeout(timer); armed=false; b.textContent='Borrar todas mis respuestas';
    answers={}; page=0; save(); note.hidden=false; note.textContent='Respuestas borradas de este navegador.'; setTimeout(()=>note.hidden=true,2500); refresh();
  });
})();

// Modo ?og: muestra solo la imagen de 1200 × 630. Con ?og=1 la genérica (para capturarla como og-image.png); con ?og=user la de tu resultado.
const ogMode = new URLSearchParams(location.search).get('og');
if(ogMode!==null){
  document.body.classList.add('og');
  renderShareImage(ogMode==='user'?'user':'og').then(()=>{ document.body.dataset.ogReady='1'; });
} else {
  document.getElementById('factQ').textContent = QUESTIONS.length;
  document.getElementById('factT').textContent = TOPICS.length;
  const S = partyScores, dist = (a,b)=>Math.round(Math.hypot(S[a].E-S[b].E, S[a].P-S[b].P));
  const pAff = (a,b)=>{ const ia=PARTIES.findIndex(x=>x.id===a), ib=PARTIES.findIndex(x=>x.id===b); let d=0, n=0; for(const q of QUESTIONS){ if(q.a[ia]===null||q.a[ib]===null) continue; d+=Math.abs(q.a[ia]-q.a[ib]); n++; } return Math.round(100-d/(4*n)*100); };
  document.getElementById('affFP').textContent = pAff('fa','pod'); document.getElementById('affVS').textContent = pAff('vox','salf');
  document.getElementById('refNote').innerHTML = `<strong>Trump, Biden, Macron, Meloni, Putin, Maduro, Mujica, Milei y Bukele</strong> son referencias: gobernantes de fuera de España puntuados solo por lo que han hecho, para ver en qué zona cae cada forma de pensar y cuánto se parece a los partidos españoles y a sus votantes. Se ve que no toda la derecha piensa igual ni toda la izquierda, y que donde más se separan es en las libertades personales. Están apagados al cargar la página: enciéndelos en la leyenda con «Mostrar todas».`;
  drawLegend(); drawTable(); refresh();
}
})().catch(e=>{ console.error(e); const m=document.getElementById('result'); if(m) m.innerHTML='<p class="empty">No se han podido cargar los datos del test. Recarga la página y, si sigue fallando, avísanos desde el pie.</p>'; });
