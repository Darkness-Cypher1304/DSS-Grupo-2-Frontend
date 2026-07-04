import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { generateMchatPdf, type MchatPdfResult } from '@/components/mchat-pdf';

// ---------------------------------------------------------------------------
// Mock de jsPDF: capturamos las llamadas de texto y el save para verificar el
// comportamiento observable (qué se dibuja y con qué nombre se guarda), sin
// generar un PDF real. `generateMchatPdf` hace `await import('jspdf')`.
// ---------------------------------------------------------------------------
const textCalls: string[] = [];
const saveMock = jest.fn();

jest.mock('jspdf', () => {
  class MockJsPDF {
    internal = {
      pageSize: { getWidth: () => 595, getHeight: () => 842 },
    };
    setFillColor = jest.fn();
    rect = jest.fn();
    setTextColor = jest.fn();
    setFont = jest.fn();
    setFontSize = jest.fn();
    setDrawColor = jest.fn();
    line = jest.fn();
    splitTextToSize = (text: string) => [text];
    text = (content: string | string[]) => {
      const flat = Array.isArray(content) ? content.join(' ') : content;
      textCalls.push(flat);
    };
    save = saveMock;
  }
  return { jsPDF: MockJsPDF };
});

function baseResult(overrides: Partial<MchatPdfResult> = {}): MchatPdfResult {
  return {
    id: 'scr_123',
    childAgeMonths: 24,
    totalScore: 10,
    criticalFailures: 3,
    riskLevel: 'HIGH',
    recommendations: 'Acude a un especialista.',
    createdAt: '2026-06-30T12:00:00.000Z',
    ...overrides,
  };
}

describe('generateMchatPdf', () => {
  beforeEach(() => {
    textCalls.length = 0;
    saveMock.mockClear();
  });

  it('guarda el PDF con el nombre basado en el id de la evaluación', async () => {
    await generateMchatPdf(baseResult());
    expect(saveMock).toHaveBeenCalledWith('neuroalert-mchat-scr_123.pdf');
  });

  it('escribe el nivel de riesgo, el puntaje y la referencia de integridad', async () => {
    await generateMchatPdf(baseResult({ riskLevel: 'HIGH', totalScore: 12 }));
    const dibujado = textCalls.join('\n');
    expect(dibujado).toContain('Riesgo alto');
    expect(dibujado).toContain('Puntaje total: 12 / 20');
    expect(dibujado).toContain('Referencia de la evaluación: scr_123');
  });

  it('incluye la línea del nombre del niño cuando se proporciona', async () => {
    await generateMchatPdf(baseResult({ childName: 'Mateo' }));
    expect(textCalls.join('\n')).toContain('Niño/a: Mateo');
  });

  it('omite la línea del nombre cuando no hay childName', async () => {
    await generateMchatPdf(baseResult({ childName: undefined }));
    expect(textCalls.join('\n')).not.toContain('Niño/a:');
  });

  it('mapea el color y la etiqueta según el nivel de riesgo (LOW y MEDIUM)', async () => {
    await generateMchatPdf(baseResult({ riskLevel: 'LOW' }));
    expect(textCalls.join('\n')).toContain('Riesgo bajo');

    textCalls.length = 0;
    await generateMchatPdf(baseResult({ riskLevel: 'MEDIUM' }));
    expect(textCalls.join('\n')).toContain('Riesgo medio');
  });

  it('usa un guion cuando no hay recomendaciones', async () => {
    await generateMchatPdf(baseResult({ recommendations: '' }));
    expect(textCalls.join('\n')).toContain('—');
  });
});
