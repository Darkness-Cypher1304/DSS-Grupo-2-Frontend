// ============================================================================
// coverage-summary.mjs — Reporte de cobertura enriquecido para el Job Summary
// ----------------------------------------------------------------------------
// Genera (a stdout, redirigido a $GITHUB_STEP_SUMMARY) un reporte multivista:
//   1. Coverage Gate (combinada) + veredicto 85%          [autoritativo]
//   2. Cobertura global combinada (tabla)
//   3. Cobertura por tipo de test (unit / integration / combinada)  [diagnóstico]
//   4. Patch coverage: cobertura de las líneas NUEVAS vs main (estilo SonarQube)
//   5. Cobertura por capa/directorio
//   6. Focos de atención (menor % de ramas + líneas sin cubrir)
//   7. Distribución de archivos por rango de cobertura de líneas
//   8. Detalle por archivo: Unit / Integration / Combinada (colapsables)
//   9. Glosario breve
//
// IMPORTANTE: este script SOLO reporta. El gate lo aplica Jest (coverageThreshold)
// en la corrida combinada; aquí nada modifica el veredicto.
//
// Entradas (generadas por el job Coverage Gate):
//   tests/reports/coverage/coverage-summary.json   (combinada, por archivo)
//   tests/reports/coverage/coverage-final.json     (combinada, por línea)
//   tests/reports/cov-unit/coverage-summary.json   (solo unit)      [opcional]
//   tests/reports/cov-integration/coverage-summary.json (solo integ) [opcional]
// ============================================================================
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const MIN = 85;
const METRICS = ['statements', 'branches', 'functions', 'lines'];
const LABEL = { statements: 'Statements', branches: 'Branches', functions: 'Functions', lines: 'Lines' };

const readJSON = (p) => {
  try {
    return JSON.parse(readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
};

const combined = readJSON('tests/reports/coverage/coverage-summary.json');
const finalCov = readJSON('tests/reports/coverage/coverage-final.json');
const unit = readJSON('tests/reports/cov-unit/coverage-summary.json');
const integration = readJSON('tests/reports/cov-integration/coverage-summary.json');

if (!combined) {
  console.log('## Coverage Gate\n\n> No se encontró el reporte de cobertura combinada.');
  process.exit(0);
}

const out = [];
const w = (s = '') => out.push(s);

// Normaliza una ruta a "src/..." para mostrarla corta y estable.
const short = (f) => f.replace(/\\/g, '/').replace(/.*\/src\//, 'src/');

// Clasifica un archivo en una "capa" para la vista agregada.
function layerOf(file) {
  const f = short(file);
  if (f.startsWith('src/lib/')) return 'lib';
  if (f.startsWith('src/components/')) return 'components';
  if (f.startsWith('src/app/(auth)/')) return 'app · auth';
  if (f.startsWith('src/app/(parent)/')) return 'app · parent';
  if (f.startsWith('src/app/(specialist)/')) return 'app · specialist';
  if (f.startsWith('src/app/(admin)/')) return 'app · admin';
  if (f.startsWith('src/app/articles/')) return 'app · articles';
  return 'otros';
}

const files = (summary) => Object.keys(summary).filter((k) => k !== 'total');
const pct = (n) => (Number.isFinite(n) ? n.toFixed(2) : '—');

// ---------------------------------------------------------------------------
// 1) Coverage Gate (combinada) — bloque autoritativo
// ---------------------------------------------------------------------------
const total = combined.total;
const gatePass = METRICS.every((m) => total[m].pct >= MIN);

w('## 🎯 Coverage Gate\n');
w('```');
w('==========================================');
w(`UNIT + INTEGRATION · COVERAGE (mínimo ${MIN}%)`);
w('==========================================');
for (const m of METRICS) {
  w(`${LABEL[m].padEnd(12)}: ${total[m].pct.toFixed(2).padStart(6)}%  ${total[m].pct >= MIN ? 'OK' : 'FAIL'}`);
}
w('------------------------------------------');
w(`Coverage Gate (${MIN}%): ${gatePass ? 'PASSED ✅' : 'FAILED ❌'}`);
w('```\n');

// ---------------------------------------------------------------------------
// 2) Cobertura global combinada
// ---------------------------------------------------------------------------
w('### Cobertura global (combinada)\n');
w('| Métrica | Cobertura | Cubierto/Total | ≥85% |');
w('|---|:--:|:--:|:--:|');
for (const m of METRICS) {
  const d = total[m];
  w(`| ${LABEL[m]} | ${d.pct.toFixed(2)}% | ${d.covered}/${d.total} | ${d.pct >= MIN ? '✅' : '❌'} |`);
}
w('');

// ---------------------------------------------------------------------------
// 3) Cobertura por tipo de test (diagnóstico)
// ---------------------------------------------------------------------------
const coveredFileCount = (summary) =>
  summary ? files(summary).filter((f) => summary[f].statements.covered > 0).length : 0;

w('### 🧪 Cobertura por tipo de test\n');
w('| Tipo de test | % Stmts | % Branch | % Funcs | % Lines | Archivos cubiertos |');
w('|---|:--:|:--:|:--:|:--:|:--:|');
const typeRow = (name, s) =>
  s
    ? `| ${name} | ${pct(s.total.statements.pct)} | ${pct(s.total.branches.pct)} | ${pct(s.total.functions.pct)} | ${pct(s.total.lines.pct)} | ${coveredFileCount(s)} |`
    : `| ${name} | — | — | — | — | — |`;
w(typeRow('Unit', unit));
w(typeRow('Integration', integration));
w(typeRow('**Combinada (gate)**', combined));
w('');
w('> El **gate** se evalúa solo sobre la fila **Combinada**. Las filas por tipo son *diagnósticas*.');
w('> El % global de **Unit** se ve bajo **a propósito**: se mide sobre toda la superficie, pero las pruebas unitarias apuntan a `lib/` y `components/` (donde rinden 90–100%, ver el detalle por archivo); no ejecutan las páginas —eso es tarea de Integration, fiel a la pirámide—.');
w('> El % de **Integration** es informativo: su valor real es que el job **pase** validando flujos de usuario, no maximizar un porcentaje.');
w('');

// ---------------------------------------------------------------------------
// 4) Patch coverage — cobertura de líneas nuevas vs main (estilo SonarQube)
// ---------------------------------------------------------------------------
w('### 🆕 Cobertura de código nuevo (patch)\n');
const patch = computePatchCoverage(finalCov);
if (patch === null) {
  w('> No se pudo calcular (sin base de comparación disponible).');
} else if (patch.newLines === 0) {
  w('> **N/A** — este cambio no incorpora líneas de código de producción (`src/**`) nuevas o modificadas.');
} else {
  const ok = patch.coverage >= MIN;
  w(`Líneas nuevas/modificadas en \`src/**\`: **${patch.newLines}** · cubiertas: **${patch.covered}** → **${patch.coverage.toFixed(2)}%** ${ok ? '✅' : '⚠️'}`);
  if (patch.byFile.length) {
    w('');
    w('| Archivo | Líneas nuevas | Cubiertas | % patch |');
    w('|---|:--:|:--:|:--:|');
    for (const f of patch.byFile) {
      w(`| ${f.file} | ${f.total} | ${f.covered} | ${f.pct.toFixed(1)}% |`);
    }
  }
}
w('');
w('> *Patch coverage* = % de líneas nuevas/modificadas por este cambio que quedan cubiertas por tests. Es la métrica que prioriza SonarQube: asegura que **lo nuevo** se prueba, sin exigir recobertura de todo el histórico. Aquí es **informativa** (no bloquea).');
w('');

// ---------------------------------------------------------------------------
// 5) Cobertura por capa/directorio
// ---------------------------------------------------------------------------
w('### 🧱 Cobertura por capa\n');
const layers = {};
for (const f of files(combined)) {
  const L = (layers[layerOf(f)] ??= { n: 0, statements: [0, 0], branches: [0, 0], functions: [0, 0], lines: [0, 0] });
  L.n += 1;
  for (const m of METRICS) {
    L[m][0] += combined[f][m].covered;
    L[m][1] += combined[f][m].total;
  }
}
const layerPct = (pair) => (pair[1] === 0 ? 100 : (pair[0] / pair[1]) * 100);
w('| Capa | Archivos | % Stmts | % Branch | % Funcs | % Lines |');
w('|---|:--:|:--:|:--:|:--:|:--:|');
for (const [name, L] of Object.entries(layers).sort((a, b) => layerPct(a[1].branches) - layerPct(b[1].branches))) {
  w(`| ${name} | ${L.n} | ${layerPct(L.statements).toFixed(1)} | ${layerPct(L.branches).toFixed(1)} | ${layerPct(L.functions).toFixed(1)} | ${layerPct(L.lines).toFixed(1)} |`);
}
w('');

// ---------------------------------------------------------------------------
// 6) Focos de atención — menor % de ramas + líneas sin cubrir
// ---------------------------------------------------------------------------
const uncoveredByFile = buildUncoveredMap(finalCov);
const offenders = files(combined)
  .map((f) => ({ file: short(f), b: combined[f].branches.pct, l: combined[f].lines.pct, key: f }))
  .filter((r) => combined[r.key].branches.total > 0)
  .sort((a, b) => a.b - b.b || a.l - b.l)
  .slice(0, 8);

if (offenders.length) {
  w('### 🔎 Focos de atención (menor cobertura de ramas)\n');
  w('| Archivo | % Branch | % Lines | Líneas sin cubrir |');
  w('|---|:--:|:--:|---|');
  for (const r of offenders) {
    const u = uncoveredByFile.get(r.key) ?? [];
    const shown = u.slice(0, 8).join(', ') + (u.length > 8 ? `, … (+${u.length - 8})` : '') || '—';
    w(`| ${r.file} | ${r.b.toFixed(1)} | ${r.l.toFixed(1)} | ${shown} |`);
  }
  w('');
}

// ---------------------------------------------------------------------------
// 7) Distribución de archivos por rango de cobertura de líneas
// ---------------------------------------------------------------------------
const buckets = { '100%': 0, '90–99%': 0, '80–89%': 0, '<80%': 0 };
for (const f of files(combined)) {
  const p = combined[f].lines.pct;
  if (p >= 100) buckets['100%'] += 1;
  else if (p >= 90) buckets['90–99%'] += 1;
  else if (p >= 80) buckets['80–89%'] += 1;
  else buckets['<80%'] += 1;
}
w('### 📊 Distribución (cobertura de líneas por archivo)\n');
w('| 100% | 90–99% | 80–89% | <80% | Total archivos |');
w('|:--:|:--:|:--:|:--:|:--:|');
w(`| ${buckets['100%']} | ${buckets['90–99%']} | ${buckets['80–89%']} | ${buckets['<80%']} | ${files(combined).length} |`);
w('');

// ---------------------------------------------------------------------------
// 8) Detalle por archivo — por tipo (colapsable)
// ---------------------------------------------------------------------------
w(perFileDetails('Archivos cubiertos por Unit Tests', unit, true));
w(perFileDetails('Archivos cubiertos por Integration Tests', integration, true));
w(perFileDetails('Cobertura por archivo (combinada)', combined, false));

// ---------------------------------------------------------------------------
// 9) Glosario breve
// ---------------------------------------------------------------------------
w('### 📖 Glosario (1 línea)\n');
w('- **Statements**: sentencias ejecutables que corrieron al menos una vez.');
w('- **Branches**: caminos de decisión (if/else, `?:`, `&&`) ejercitados; es la métrica más exigente.');
w('- **Functions**: funciones/métodos invocados al menos una vez.');
w('- **Lines**: líneas de código ejecutadas (similar a Statements, por línea física).');
w('- **Patch / código nuevo**: cobertura solo sobre las líneas que este cambio agrega o modifica.');
w('- **Combinada**: unión de la cobertura de unit + integration; es la base del gate.');

console.log(out.join('\n'));

// ===========================================================================
// Helpers
// ===========================================================================

// Mapa file -> Map<line, hits> a partir de coverage-final.json (istanbul).
function lineHitsOf(entry) {
  const hits = new Map();
  const sm = entry.statementMap ?? {};
  const s = entry.s ?? {};
  for (const id of Object.keys(sm)) {
    const ln = sm[id]?.start?.line;
    if (!ln) continue;
    const prev = hits.get(ln) ?? 0;
    hits.set(ln, Math.max(prev, s[id] ?? 0));
  }
  return hits;
}

// file(clave corta) -> [líneas sin cubrir]
function buildUncoveredMap(final) {
  const map = new Map();
  if (!final) return map;
  for (const key of Object.keys(final)) {
    const hits = lineHitsOf(final[key]);
    const uncovered = [...hits.entries()].filter(([, h]) => h === 0).map(([l]) => l).sort((a, b) => a - b);
    if (uncovered.length) map.set(key, uncovered);
  }
  return map;
}

// Patch coverage: intersecta líneas nuevas (git diff) con la cobertura por línea.
function computePatchCoverage(final) {
  if (!final) return null;
  let range;
  try {
    const base = process.env.GITHUB_BASE_REF;
    if (base) {
      execSync(`git fetch --no-tags --depth=100 origin ${base}`, { stdio: 'ignore' });
      range = `origin/${base}...HEAD`;
    } else {
      range = 'HEAD~1...HEAD';
    }
  } catch {
    return null;
  }

  let diff;
  try {
    diff = execSync(`git diff --unified=0 --diff-filter=AM ${range} -- "src/**/*.ts" "src/**/*.tsx"`, {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    return null;
  }

  // Líneas nuevas por archivo (número de línea en la versión nueva).
  const added = new Map();
  let current = null;
  for (const line of diff.split('\n')) {
    const mf = line.match(/^\+\+\+ b\/(.+)$/);
    if (mf) {
      current = mf[1];
      if (!added.has(current)) added.set(current, new Set());
      continue;
    }
    const mh = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (mh && current) {
      const start = Number(mh[1]);
      const count = mh[2] === undefined ? 1 : Number(mh[2]);
      for (let i = 0; i < count; i += 1) added.get(current).add(start + i);
    }
  }

  // Mapa de coverage-final por ruta relativa "src/...".
  const finalByShort = new Map();
  for (const key of Object.keys(final)) finalByShort.set(short(key), lineHitsOf(final[key]));

  let totalNew = 0;
  let coveredNew = 0;
  const byFile = [];
  for (const [file, lines] of added) {
    const f = short(file);
    const hits = finalByShort.get(f);
    if (!hits) continue; // archivo nuevo excluido de la cobertura (glue) -> se ignora
    let t = 0;
    let c = 0;
    for (const ln of lines) {
      if (!hits.has(ln)) continue; // línea no ejecutable (comentario, tipo, JSX puro sin statement)
      t += 1;
      if (hits.get(ln) > 0) c += 1;
    }
    if (t > 0) {
      totalNew += t;
      coveredNew += c;
      byFile.push({ file: f, total: t, covered: c, pct: (c / t) * 100 });
    }
  }
  byFile.sort((a, b) => a.pct - b.pct);
  return {
    newLines: totalNew,
    covered: coveredNew,
    coverage: totalNew === 0 ? 0 : (coveredNew / totalNew) * 100,
    byFile: byFile.slice(0, 15),
  };
}

// Bloque <details> con la tabla por archivo de un summary dado.
function perFileDetails(title, summary, onlyCovered) {
  if (!summary) return '';
  const rows = files(summary)
    .filter((f) => (onlyCovered ? summary[f].statements.covered > 0 : true))
    .map((f) => ({
      file: short(f),
      s: summary[f].statements.pct,
      b: summary[f].branches.pct,
      fu: summary[f].functions.pct,
      l: summary[f].lines.pct,
    }))
    .sort((a, b) => a.b + a.fu - (b.b + b.fu));
  if (!rows.length) return '';
  const lines = [`<details><summary>${title} (${rows.length})</summary>\n`];
  lines.push('| Archivo | % Stmts | % Branch | % Funcs | % Lines |');
  lines.push('|---|:--:|:--:|:--:|:--:|');
  for (const r of rows) {
    lines.push(`| ${r.file} | ${r.s.toFixed(1)} | ${r.b.toFixed(1)} | ${r.fu.toFixed(1)} | ${r.l.toFixed(1)} |`);
  }
  lines.push('\n</details>\n');
  return lines.join('\n');
}
