// Tests de las funciones puras de cálculo. Se ejecutan con: node --test tests/
// Reproducen la tabla de posiciones del README a partir de los datos reales.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const Scoring = require('../public/assets/scoring.js');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'public', 'data', 'es-2026.json'), 'utf8'));

test('xy proyecta el centro, las esquinas y los vértices del rombo', () => {
  assert.deepEqual(Scoring.xy(50, 50), [280, 280]);
  assert.deepEqual(Scoring.xy(100, 100), [280, 40]);   // arriba: libertario
  assert.deepEqual(Scoring.xy(0, 0), [280, 520]);      // abajo: autoritario
  assert.deepEqual(Scoring.xy(100, 0), [520, 280]);    // derecha
  assert.deepEqual(Scoring.xy(0, 100), [40, 280]);     // izquierda
});

test('zoneOf: centro de 35 a 65 en los dos ejes y cuadrantes fuera', () => {
  assert.equal(Scoring.zoneOf(50, 50), 'Centro');
  assert.equal(Scoring.zoneOf(65, 35), 'Centro');
  assert.equal(Scoring.zoneOf(66, 50), 'Libertario');
  assert.equal(Scoring.zoneOf(66, 34), 'Derecha');
  assert.equal(Scoring.zoneOf(34, 66), 'Izquierda');
  assert.equal(Scoring.zoneOf(34, 34), 'Autoritario');
  assert.equal(Scoring.zoneOf(50, 66), 'Libertario');
  assert.equal(Scoring.zoneOf(49.9, 66), 'Izquierda');
});

test('scoreAxes: fórmula 50 + 25 × media(respuesta × dir), ignora null y undefined', () => {
  const qs = [
    { id: 'e_a', ax: 'E', dir: 1 }, { id: 'e_b', ax: 'E', dir: -1 },
    { id: 'p_a', ax: 'P', dir: 1 }, { id: 'p_b', ax: 'P', dir: -1 },
  ];
  const answers = { e_a: 2, e_b: -2, p_a: 0 };
  const r = Scoring.scoreAxes(qs, q => answers[q.id]);
  assert.equal(r.E, 100); assert.equal(r.nE, 2);
  assert.equal(r.P, 50); assert.equal(r.nP, 1);
  const empty = Scoring.scoreAxes(qs, () => undefined);
  assert.equal(empty.E, null); assert.equal(empty.nE, 0);
  const withNull = Scoring.scoreAxes(qs, q => (q.id === 'e_a' ? null : -2));
  assert.equal(withNull.E, 100); // solo e_b: -2 × -1 = +2
});

test('affinity: 100 si coinciden, 0 en extremos opuestos, ignora preguntas sin dato del partido', () => {
  const qs = [{ id: 'e_a', ax: 'E', dir: 1, a: [2, -2, null] }, { id: 'p_a', ax: 'P', dir: 1, a: [1, -1, 1] }];
  assert.equal(Scoring.affinity(qs, { e_a: 2, p_a: 1 }, 0), 100);
  assert.equal(Scoring.affinity(qs, { e_a: 2, p_a: 1 }, 1), 25);   // diferencias 4 y 2: media 3 de 4
  assert.equal(Scoring.affinity(qs, { e_a: 2, p_a: -1 }, 1), 50);  // diferencias 4 y 0: media 2 de 4
  assert.equal(Scoring.affinity(qs, { e_a: 2, p_a: 1 }, 2), 100); // e_a sin dato no cuenta
  assert.equal(Scoring.affinity(qs, {}, 0), null);
  assert.equal(Scoring.affinity(qs, { e_a: 2 }, 2), 0); // ninguna pregunta comparable
});

test('las posiciones calculadas coinciden con la tabla del README', () => {
  const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  const S = Scoring.partyScores(data.parties, data.questions);
  const rows = [...readme.matchAll(/^\| ([^|]+?) \*?\(?(?:referencia)?\)?\*? ?\| [^|]+ \| (\d+) \| (\d+) \| (\w+) \|$/gm)];
  assert.ok(rows.length >= data.parties.length, `la tabla del README tiene ${rows.length} filas`);
  const byName = Object.fromEntries(data.parties.map(p => [p.name, p.id]));
  let checked = 0;
  for (const [, name, E, P, zone] of rows) {
    const id = byName[name.trim()]; if (!id) continue;
    const s = S[id];
    assert.equal(Math.round(s.E), Number(E), `${name}: economía`);
    assert.equal(Math.round(s.P), Number(P), `${name}: libertades`);
    assert.equal(Scoring.zoneOf(Math.round(s.E), Math.round(s.P)), zone, `${name}: zona`);
    checked++;
  }
  assert.equal(checked, data.parties.length, 'todos los partidos comprobados');
});

test('la versión de datos de la web es la del README', () => {
  const readme = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  assert.match(readme, new RegExp(`versión de datos ${data.version.replace('.', '\\.')}\\)`));
});

test('cada pregunta tiene una respuesta por partido y una justificación por partido', () => {
  for (const q of data.questions) {
    assert.equal(q.a.length, data.parties.length, q.id);
    for (const p of data.parties) assert.ok(Array.isArray(data.why[p.id][q.id]), `${p.id} ${q.id}`);
  }
});
