#!/usr/bin/env node
// Valida public/data/es-2026.json: estructura, rangos y coherencia. Sale con código 1 si hay errores.
// Uso: node tests/validate-data.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'public', 'data', 'es-2026.json');
const d = JSON.parse(fs.readFileSync(file, 'utf8'));
const errors = [], warnings = [];
const err = m => errors.push(m), warn = m => warnings.push(m);

if (!/^\d+\.\d+$/.test(String(d.version))) err(`version debe ser «mayor.menor», es «${d.version}»`);
if (!d.date) err('falta date');
if (!Array.isArray(d.parties) || d.parties.length < 2) err('parties debe ser un array con al menos dos partidos');
if (!Array.isArray(d.topics) || !d.topics.length) err('topics vacío');
if (!Array.isArray(d.questions) || !d.questions.length) err('questions vacío');

const pids = d.parties.map(p => p.id), tids = d.topics.map(t => t.id);
if (new Set(pids).size !== pids.length) err('ids de partido repetidos');
if (new Set(tids).size !== tids.length) err('ids de ámbito repetidos');
d.parties.forEach(p => { for (const k of ['id', 'name', 'full', 'lead']) if (!p[k]) err(`partido ${p.id || '?'} sin ${k}`); if (p.ref && !p.color) err(`referencia ${p.id} sin color`); });
d.topics.forEach(t => { if (!['E', 'P'].includes(t.ax)) err(`ámbito ${t.id} con eje inválido`); if (!t.t) err(`ámbito ${t.id} sin título`); });

const qids = d.questions.map(q => q.id);
if (new Set(qids).size !== qids.length) err('ids de pregunta repetidos');
const perAxis = { E: 0, P: 0 };
d.questions.forEach(q => {
  const tag = `pregunta ${q.id}`;
  if (!/^[ep]_[a-z]+$/.test(q.id)) err(`${tag}: id con formato inválido`);
  if (!['E', 'P'].includes(q.ax)) err(`${tag}: eje inválido`); else perAxis[q.ax]++;
  if (q.id[0] !== q.ax.toLowerCase()) err(`${tag}: el prefijo del id no coincide con el eje`);
  if (![1, -1].includes(q.dir)) err(`${tag}: dir debe ser +1 o −1`);
  if (!tids.includes(q.g)) err(`${tag}: ámbito ${q.g} no existe`);
  if (!q.t || q.t.length < 15) err(`${tag}: texto demasiado corto`);
  if (!q.k) err(`${tag}: falta la etiqueta corta k`);
  if (!q.c) warn(`${tag}: sin contexto c`);
  if (!Array.isArray(q.a) || q.a.length !== pids.length) err(`${tag}: a tiene ${q.a && q.a.length} valores y hay ${pids.length} partidos`);
  else q.a.forEach((v, i) => { if (!(v === null || (Number.isInteger(v) && v >= -2 && v <= 2))) err(`${tag}: valor inválido ${JSON.stringify(v)} para ${pids[i]}`); });
  const real = q.a.slice(0, d.parties.filter(p => !p.ref).length);
  if (real.every(v => v === null)) err(`${tag}: ningún partido español tiene dato`);
});
for (const ax of ['E', 'P']) if (perAxis[ax] < 10) err(`solo ${perAxis[ax]} preguntas en el eje ${ax} (mínimo 10)`);
if (perAxis.E !== perAxis.P) warn(`ejes desiguales: ${perAxis.E} de economía y ${perAxis.P} de libertades`);
d.topics.forEach(t => { const n = d.questions.filter(q => q.g === t.id).length; if (!n) err(`ámbito ${t.id} sin preguntas`); });

// Justificaciones: una por partido y pregunta, con frase y url válida o vacía
if (!d.why || typeof d.why !== 'object') err('falta why'); else {
  pids.forEach(pid => {
    if (!d.why[pid]) { err(`why sin entrada para ${pid}`); return; }
    qids.forEach(qid => {
      const w = d.why[pid][qid];
      if (!Array.isArray(w) || w.length !== 2) { err(`why[${pid}][${qid}] debe ser [frase, url]`); return; }
      if (typeof w[0] !== 'string' || w[0].length < 20) err(`why[${pid}][${qid}]: frase demasiado corta`);
      if (/[;()]|—/.test(w[0])) warn(`why[${pid}][${qid}]: la frase lleva punto y coma, paréntesis o raya`);
      if (w[1] && !/^https?:\/\//.test(w[1])) err(`why[${pid}][${qid}]: url inválida`);
    });
    Object.keys(d.why[pid]).forEach(qid => { if (!qids.includes(qid)) warn(`why[${pid}] tiene la pregunta retirada ${qid}`); });
  });
}

const nulls = d.questions.reduce((n, q) => n + q.a.filter(v => v === null).length, 0);
console.log(`${d.questions.length} preguntas (${perAxis.E} economía, ${perAxis.P} libertades), ${pids.length} partidos, ${d.topics.length} ámbitos, ${nulls} casillas sin dato, versión ${d.version}.`);
warnings.forEach(w => console.log('aviso:', w));
if (errors.length) { errors.forEach(e => console.error('ERROR:', e)); console.error(`${errors.length} errores.`); process.exit(1); }
console.log('Datos válidos.');
