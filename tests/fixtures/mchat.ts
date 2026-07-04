// ============================================================================
// Fixtures del M-CHAT-R (preguntas y resultado)
// ============================================================================
export interface MchatQuestionFixture {
  number: number;
  id: string;
  text: string;
  category: 'social' | 'communication' | 'behavior' | 'sensory';
}

export interface MchatResultFixture {
  id: string;
  childAgeMonths: number;
  totalScore: number;
  criticalFailures: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  failedQuestions: number[];
  recommendations: string;
  createdAt: string;
}

const CATEGORIES: MchatQuestionFixture['category'][] = [
  'social',
  'communication',
  'behavior',
  'sensory',
];

/** El flujo no hardcodea 20: con pocas preguntas se ejercita el mismo código. */
export function makeQuestions(n = 3): MchatQuestionFixture[] {
  return Array.from({ length: n }, (_, i) => ({
    number: i + 1,
    id: `q${i + 1}`,
    text: `¿Pregunta de prueba número ${i + 1}?`,
    category: CATEGORIES[i % CATEGORIES.length],
  }));
}

export function makeMchatResult(
  overrides: Partial<MchatResultFixture> = {},
): MchatResultFixture {
  return {
    id: 'scr_1',
    childAgeMonths: 24,
    totalScore: 1,
    criticalFailures: 0,
    riskLevel: 'LOW',
    failedQuestions: [],
    recommendations: 'Sigue observando el desarrollo de tu hijo/a.',
    createdAt: '2026-07-04T10:00:00.000Z',
    ...overrides,
  };
}
