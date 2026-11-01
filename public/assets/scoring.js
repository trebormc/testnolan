/* testnolan.com · cálculo puro del test. Sin dependencias ni DOM: lo usan la web (window.Scoring) y los tests de Node (require). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.Scoring = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  // Geometría del rombo: E y P de 0 a 100 se proyectan en un lienzo de 560 × 560 con centro (280, 280).
  const C = 280, K = 2.4;
  function xy(E, P) { return [C + (E - P) * K, C - (E + P - 100) * K]; }

  // Zonas: centro si los dos ejes están a 15 o menos del 50; si no, el cuadrante.
  function zoneOf(E, P) {
    if (Math.abs(E - 50) <= 15 && Math.abs(P - 50) <= 15) return 'Centro';
    if (E >= 50 && P >= 50) return 'Libertario';
    if (E >= 50 && P < 50) return 'Derecha';
    if (E < 50 && P >= 50) return 'Izquierda';
    return 'Autoritario';
  }

  // Puntuación por eje: 50 + 25 × media(respuesta × dir), solo con las preguntas que tienen valor (null o undefined no cuentan).
  // getVal(pregunta) devuelve la respuesta de −2 a +2. Devuelve {E, P, nE, nP}; el eje sin ninguna respuesta vale null.
  function scoreAxes(questions, getVal) {
    const out = {};
    for (const ax of ['E', 'P']) {
      const vals = [];
      for (const q of questions) { if (q.ax !== ax) continue; const v = getVal(q); if (v === null || v === undefined) continue; vals.push(v * q.dir); }
      out[ax] = vals.length ? 50 + 25 * vals.reduce((a, b) => a + b, 0) / vals.length : null;
      out['n' + ax] = vals.length;
    }
    return out;
  }

  // Posición de cada partido (índice i en el array a de cada pregunta).
  function partyScores(parties, questions) {
    const out = {};
    parties.forEach((p, i) => { out[p.id] = scoreAxes(questions, q => q.a[i]); });
    return out;
  }

  // Afinidad de 0 a 100 entre las respuestas del usuario (objeto id → valor) y el partido i, solo en las preguntas respondidas donde el partido tiene dato.
  function affinity(questions, answers, i) {
    const ids = Object.keys(answers); if (!ids.length) return null;
    let diff = 0, n = 0;
    for (const q of questions) { if (answers[q.id] === undefined || q.a[i] === null) continue; diff += Math.abs(answers[q.id] - q.a[i]); n++; }
    return n ? 100 - diff / (4 * n) * 100 : 0;
  }

  // Distancia en el rombo entre dos posiciones {E, P}.
  function distance(a, b) { return Math.hypot(a.E - b.E, a.P - b.P); }

  return { C, K, xy, zoneOf, scoreAxes, partyScores, affinity, distance };
});
