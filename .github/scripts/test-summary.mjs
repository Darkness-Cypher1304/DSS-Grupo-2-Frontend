// ============================================================================
// test-summary.mjs — resumen de una corrida de Jest para el Job Summary de GHA
// ----------------------------------------------------------------------------
// Uso: node test-summary.mjs <ruta-results.json> "<título>"
// Lee el JSON generado por `jest --json --outputFile=...` y emite (a stdout) una
// tabla Markdown con suites, tests, aprobados, fallidos y duración. La salida se
// redirige a $GITHUB_STEP_SUMMARY desde el workflow.
// ============================================================================
import { readFileSync } from 'node:fs';

const [file, title = 'Tests'] = process.argv.slice(2);

let r;
try {
  r = JSON.parse(readFileSync(file, 'utf8'));
} catch {
  console.log(`## ${title}\n\n> No se pudo leer el reporte (${file}).`);
  process.exit(0);
}

const endTimes = (r.testResults ?? []).map((t) => t.endTime ?? 0);
const wallMs = endTimes.length ? Math.max(...endTimes) - (r.startTime ?? 0) : 0;
const duration = (wallMs / 1000).toFixed(1);
const ok = r.numFailedTests === 0 && r.numFailedTestSuites === 0;

console.log(`## ${title}\n`);
console.log('| Suites | Tests | Aprobados | Fallidos | Duración | Estado |');
console.log('|:--:|:--:|:--:|:--:|:--:|:--:|');
console.log(
  `| ${r.numTotalTestSuites} | ${r.numTotalTests} | ${r.numPassedTests} | ${r.numFailedTests} | ${duration}s | ${ok ? '✅ PASSED' : '❌ FAILED'} |`,
);
console.log('');
