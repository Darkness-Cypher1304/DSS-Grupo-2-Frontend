// ============================================================================
// generateMchatPdf — exporta el resultado del M-CHAT-R a PDF (RF-35)
// ============================================================================
// PDF de una página, con la marca NeuroAlert, para que el padre lo lleve al
// pediatra. Incluye una "referencia de la evaluación" (el id persistido) como
// ancla de integridad y el disclaimer educativo. Generación client-side (jsPDF),
// sin servicios ni endpoints nuevos.
// ============================================================================

export interface MchatPdfResult {
  id: string;
  childAgeMonths: number;
  totalScore: number;
  criticalFailures: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string;
  createdAt: string;
  childName?: string;
}

const RISK_LABEL: Record<MchatPdfResult['riskLevel'], string> = {
  LOW: 'Riesgo bajo',
  MEDIUM: 'Riesgo medio',
  HIGH: 'Riesgo alto',
};

function riskColor(level: MchatPdfResult['riskLevel']): [number, number, number] {
  if (level === 'LOW') return [21, 94, 89]; // teal
  if (level === 'MEDIUM') return [176, 120, 20]; // amber
  return [200, 70, 50]; // coral
}

export async function generateMchatPdf(result: MchatPdfResult): Promise<void> {
  // Import dinámico: jsPDF solo se carga al exportar (sin riesgo de SSR/prerender
  // y fuera del bundle inicial de la página).
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = 0;

  // Banda superior con la marca
  doc.setFillColor(15, 76, 71); // #0f4c47
  doc.rect(0, 0, W, 92, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('NeuroAlert', M, 48);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Resultado de tamizaje M-CHAT-R', M, 70);

  // Fecha
  y = 132;
  doc.setTextColor(90, 90, 90);
  doc.setFontSize(10);
  const fecha = new Date(result.createdAt).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Fecha de la evaluación: ${fecha}`, M, y);

  // Nivel de riesgo (titular)
  y += 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  const [r, g, b] = riskColor(result.riskLevel);
  doc.setTextColor(r, g, b);
  doc.text(RISK_LABEL[result.riskLevel], M, y);

  // Métricas
  y += 32;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text(`Puntaje total: ${result.totalScore} / 20`, M, y);
  y += 18;
  doc.text(`Ítems críticos: ${result.criticalFailures}`, M, y);
  y += 18;
  doc.text(`Edad del niño/a: ${result.childAgeMonths} meses`, M, y);
  if (result.childName) {
    y += 18;
    doc.text(`Niño/a: ${result.childName}`, M, y);
  }

  // Recomendaciones
  y += 36;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text('Recomendaciones', M, y);
  y += 18;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const lines = doc.splitTextToSize(result.recommendations || '—', W - M * 2) as string[];
  doc.text(lines, M, y);

  // Pie: referencia de integridad + disclaimer
  doc.setDrawColor(220, 220, 220);
  doc.line(M, H - 92, W - M, H - 92);
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(`Referencia de la evaluación: ${result.id}`, M, H - 74);
  const disclaimer =
    'Este documento es una guía orientativa generada por NeuroAlert y NO constituye un diagnóstico. ' +
    'El M-CHAT-R es una herramienta de tamizaje (Robins, Fein & Barton, 2009). Solo un profesional de ' +
    'la salud puede diagnosticar TEA. Lleva este resultado a tu pediatra.';
  const dlines = doc.splitTextToSize(disclaimer, W - M * 2) as string[];
  doc.text(dlines, M, H - 60);

  doc.save(`neuroalert-mchat-${result.id}.pdf`);
}
