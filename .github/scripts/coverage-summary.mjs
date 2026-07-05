// ============================================================================
// coverage-summary.mjs — Reporte de cobertura para el Job Summary (multivista)
// ----------------------------------------------------------------------------
// Genera (a stdout → $GITHUB_STEP_SUMMARY) un reporte orientado a estadísticas:
//   1. Coverage Gate (mínimo 85%): veredicto + cobertura global combinada
//   2. Cobertura por tipo de test (unit / integration / combinada) + gate por tipo
//   3. Patch coverage: cobertura de líneas NUEVAS vs base (estilo SonarQube)
//   4. Focos de atención (menor % de ramas + líneas sin cubrir)
//   5. Distribución de archivos por rango de cobertura de líneas
//   6. Detalle por archivo: Unit / Integration / Combinada (colapsables)
//   7. Glosario y notas (explicaciones consolidadas al final)
//
// SOLO reporta. El gate lo aplica Jest (coverageThreshold) en la corrida
// combinada; aquí nada modifica el veredicto.
//
// Nota de consistencia: Unit(11) + Integration(36) NO suman Combinada(38) porque
// los conjuntos SE SOLAPAN (9 archivos en ambas). Combinada = UNIÓN, no suma.
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
const short = (f) => f.replace(/\\/g, '/').replace(/.*\/src\//, 'src/');
const files = (summary) => Object.keys(summary).filter((k) => k !== 'total');
const pct = (n) => (Number.isFinite(n) ? n.toFixed(2) : '—');
const gateOf = (t) => METRICS.every((m) => t[m].pct >= MIN);
const coveredFileCount = (s) => (s ? files(s).filter((f) => s[f].statements.covered > 0).length : 0);

// ---------------------------------------------------------------------------
// 1) Coverage Gate + cobertura global combinada
// ---------------------------------------------------------------------------
const total = combined.total;
const gatePass = gateOf(total);

w('## 🎯 Coverage Gate (mínimo 85%)\n');
w(`**Coverage Gate (${MIN}%): ${gatePass ? 'PASSED ✅' : 'FAILED ❌'}**\n`);

w('### Cobertura global (combinada)\n');
w('| Métrica | Cobertura | Cubierto/Total | ≥85% |');
w('|---|:--:|:--:|:--:|');
for (const m of METRICS) {
  const d = total[m];
  w(`| ${LABEL[m]} | ${d.pct.toFixed(2)}% | ${d.covered}/${d.total} | ${d.pct >= MIN ? '✅' : '❌'} |`);
}
w('');

// ---------------------------------------------------------------------------
// 2) Cobertura por tipo de test (+ gate por tipo)
// ---------------------------------------------------------------------------
w('### 🧪 Cobertura por tipo de test\n');
w('| Tipo de test | % Stmts | % Branch | % Funcs | % Lines | Gate 85% | Archivos |');
w('|---|:--:|:--:|:--:|:--:|:--:|:--:|');
const typeRow = (name, s) => {
  if (!s) return `| ${name} | — | — | — | — | — | — |`;
  const t = s.total;
  const gate = gateOf(t) ? '✅' : '❌';
  return `| ${name} | ${pct(t.statements.pct)} | ${pct(t.branches.pct)} | ${pct(t.functions.pct)} | ${pct(t.lines.pct)} | ${gate} | ${coveredFileCount(s)} |`;
};
w(typeRow('Unit', unit));
w(typeRow('Integration', integration));
w(typeRow('**Combinada (gate)**', combined));
w('');
w('> El gate solo se **exige** sobre *Combinada*; el `Gate 85%` por tipo es diagnóstico (ver *Glosario*). Los conjuntos de archivos se **solapan** → *Combinada* = unión, no suma.');
w('');

// ---------------------------------------------------------------------------
// 3) Patch coverage — cobertura de líneas nuevas vs base (estilo SonarQube)
// ---------------------------------------------------------------------------
w('### 🆕 Cobertura de código nuevo (patch)\n');
const patch = computePatchCoverage(finalCov);
if (patch === null) {
  w('> No se pudo calcular (sin base de comparación disponible).');
} else if (patch.newLines === 0) {
  w('> **N/A** — este cambio no incorpora líneas de código de producción (`src/**`) nuevas o modificadas.');
} else {
  w(`Líneas nuevas/modificadas en \`src/**\`: **${patch.newLines}** · cubiertas: **${patch.covered}** → **${patch.coverage.toFixed(2)}%** ${patch.coverage >= MIN ? '✅' : '⚠️'}`);
  if (patch.byFile.length) {
    w('');
    w('| Archivo | Líneas nuevas | Cubiertas | % patch |');
    w('|---|:--:|:--:|:--:|');
    for (const f of patch.byFile) w(`| ${f.file} | ${f.total} | ${f.covered} | ${f.pct.toFixed(1)}% |`);
  }
}
w('');

// ---------------------------------------------------------------------------
// 4) Focos de atención — menor % de ramas + líneas sin cubrir
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
    const shown = (u.slice(0, 8).join(', ') + (u.length > 8 ? `, … (+${u.length - 8})` : '')) || '—';
    w(`| ${r.file} | ${r.b.toFixed(1)} | ${r.l.toFixed(1)} | ${shown} |`);
  }
  w('');
}

// ---------------------------------------------------------------------------
// 5) Distribución de archivos por rango de cobertura de líneas
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
// 6) Detalle por archivo — por tipo (colapsable)
// ---------------------------------------------------------------------------
w(perFileDetails('Archivos cubiertos por Unit Tests', unit, true));
w(perFileDetails('Archivos cubiertos por Integration Tests', integration, true));
w(perFileDetails('Cobertura por archivo (combinada)', combined, false));

// ---------------------------------------------------------------------------
// 7) Glosario y notas (explicaciones consolidadas)
// ---------------------------------------------------------------------------
w('### 📖 Glosario y notas\n');
w('- **Patch coverage**: % de líneas nuevas/modificadas por *este* cambio que quedan cubiertas por tests (métrica estrella de SonarQube). Asegura que **lo nuevo** se prueba sin exigir recobertura del histórico. Aquí es informativa, **no bloquea**.');
w('- **Combinada**: unión de la cobertura de *unit* + *integration*; es la única fila sobre la que se **exige** el gate del 85%.');
w('- **Gate 85% por tipo (diagnóstico)**: *unit* da bajo porque se mide sobre toda la superficie pero apunta a `lib/` y `components/`; las páginas las cubre *integration* (pirámide de testing). Que ambas den ❌ por separado y *Combinada* dé ✅ es lo esperado.');
w('- **Branches**: caminos de decisión (`if/else`, `?:`, `&&`); es la métrica más exigente y suele ser la que limita el gate.');

console.log(out.join('\n'));

// ===========================================================================
// Helpers
// ===========================================================================
function lineHitsOf(entry) {
  const hits = new Map();
  const sm = entry.statementMap ?? {};
  const s = entry.s ?? {};
  for (const id of Object.keys(sm)) {
    const ln = sm[id]?.start?.line;
    if (!ln) continue;
    hits.set(ln, Math.max(hits.get(ln) ?? 0, s[id] ?? 0));
  }
  return hits;
}

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

  const finalByShort = new Map();
  for (const key of Object.keys(final)) finalByShort.set(short(key), lineHitsOf(final[key]));

  let totalNew = 0;
  let coveredNew = 0;
  const byFile = [];
  for (const [file, lines] of added) {
    const hits = finalByShort.get(short(file));
    if (!hits) continue;
    let t = 0;
    let c = 0;
    for (const ln of lines) {
      if (!hits.has(ln)) continue;
      t += 1;
      if (hits.get(ln) > 0) c += 1;
    }
    if (t > 0) {
      totalNew += t;
      coveredNew += c;
      byFile.push({ file: short(file), total: t, covered: c, pct: (c / t) * 100 });
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
  for (const r of rows) lines.push(`| ${r.file} | ${r.s.toFixed(1)} | ${r.b.toFixed(1)} | ${r.fu.toFixed(1)} | ${r.l.toFixed(1)} |`);
  lines.push('\n</details>\n');
  return lines.join('\n');
}
