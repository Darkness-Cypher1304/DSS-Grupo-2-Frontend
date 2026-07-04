// ============================================================================
// coverage-summary.mjs — tabla de cobertura + Coverage Gate para el Job Summary
// ----------------------------------------------------------------------------
// Lee tests/reports/coverage/coverage-summary.json (reporter json-summary de
// Jest) y emite (a stdout) el resumen global de las 4 métricas, el veredicto del
// gate (mínimo 85%) y una tabla por archivo. La salida se redirige a
// $GITHUB_STEP_SUMMARY desde el workflow. El fallo del gate lo produce Jest
// (coverageThreshold); este script solo REPORTA de forma legible.
// ============================================================================
import { readFileSync } from 'node:fs';

const MIN = 85;
const SUMMARY = 'tests/reports/coverage/coverage-summary.json';

let cov;
try {
  cov = JSON.parse(readFileSync(SUMMARY, 'utf8'));
} catch {
  console.log('## Coverage Gate\n\n> No se encontró el reporte de cobertura.');
  process.exit(0);
}

const METRICS = ['statements', 'branches', 'functions', 'lines'];
const LABELS = { statements: 'Statements', branches: 'Branches', functions: 'Functions', lines: 'Lines' };
const total = cov.total;
const passed = METRICS.every((m) => total[m].pct >= MIN);

console.log('## Coverage Gate\n');
console.log('```');
console.log('==========================================');
console.log(`UNIT + INTEGRATION · COVERAGE (mínimo ${MIN}%)`);
console.log('==========================================');
for (const m of METRICS) {
  const pct = total[m].pct.toFixed(2).padStart(6);
  console.log(`${LABELS[m].padEnd(12)}: ${pct}%  ${total[m].pct >= MIN ? 'OK' : 'FAIL'}`);
}
console.log('------------------------------------------');
console.log(`Coverage Gate (${MIN}%): ${passed ? 'PASSED ✅' : 'FAILED ❌'}`);
console.log('```\n');

// Tabla resumen (Markdown)
console.log('| Métrica | Cobertura | Cubierto/Total | ≥85% |');
console.log('|---|:--:|:--:|:--:|');
for (const m of METRICS) {
  const d = total[m];
  console.log(`| ${LABELS[m]} | ${d.pct.toFixed(2)}% | ${d.covered}/${d.total} | ${d.pct >= MIN ? '✅' : '❌'} |`);
}

// Detalle por archivo (colapsable)
const files = Object.entries(cov)
  .filter(([k]) => k !== 'total')
  .map(([k, v]) => ({
    file: k.replace(/\\/g, '/').replace(/.*\/src\//, 'src/'),
    s: v.statements.pct,
    b: v.branches.pct,
    f: v.functions.pct,
    l: v.lines.pct,
  }))
  .sort((a, b) => a.b + a.f - (b.b + b.f));

console.log('\n<details><summary>Cobertura por archivo</summary>\n');
console.log('| Archivo | % Stmts | % Branch | % Funcs | % Lines |');
console.log('|---|:--:|:--:|:--:|:--:|');
for (const r of files) {
  console.log(`| ${r.file} | ${r.s.toFixed(1)} | ${r.b.toFixed(1)} | ${r.f.toFixed(1)} | ${r.l.toFixed(1)} |`);
}
console.log('\n</details>');
