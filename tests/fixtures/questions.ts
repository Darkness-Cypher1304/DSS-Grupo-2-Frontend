// ============================================================================
// Fixtures de consultas padre ↔ especialista
// ============================================================================
export type QuestionStatus = 'OPEN' | 'ASSIGNED' | 'ANSWERED' | 'CLOSED';

export interface QuestionListItemFixture {
  id: string;
  title: string;
  body: string;
  status: QuestionStatus;
  isUrgent: boolean;
  createdAt: string;
  answers: { id: string }[];
  assignedTo?: { fullName: string } | null;
}

export function makeQuestion(
  overrides: Partial<QuestionListItemFixture> = {},
): QuestionListItemFixture {
  return {
    id: 'q_1',
    title: 'Mi hijo de 20 meses no señala, ¿es normal?',
    body: 'He notado que no señala objetos ni pide con el dedo.',
    status: 'OPEN',
    isUrgent: false,
    createdAt: '2026-07-01T10:00:00.000Z',
    answers: [],
    assignedTo: null,
    ...overrides,
  };
}

export interface AnswerFixture {
  id: string;
  body: string;
  isAccepted: boolean;
  createdAt: string;
  specialist: {
    id: string;
    fullName: string;
    specialistProfile?: { specialty?: string; institution?: string | null } | null;
  };
}

export function makeAnswer(overrides: Partial<AnswerFixture> = {}): AnswerFixture {
  return {
    id: 'ans_1',
    body: 'Es recomendable observar y consultar con tu pediatra.',
    isAccepted: false,
    createdAt: '2026-07-02T10:00:00.000Z',
    specialist: {
      id: 'sp_1',
      fullName: 'Dra. Ana Torres',
      specialistProfile: { specialty: 'Pediatría', institution: 'Hospital del Niño' },
    },
    ...overrides,
  };
}

export function makeQuestionDetail(
  overrides: Partial<QuestionListItemFixture & { isAnonymous: boolean; childAgeMonths: number | null; answers: AnswerFixture[] }> = {},
) {
  return {
    id: 'q_1',
    title: 'Mi hijo de 20 meses no señala, ¿es normal?',
    body: 'He notado que no señala objetos ni pide con el dedo.',
    status: 'ANSWERED' as QuestionStatus,
    isUrgent: false,
    isAnonymous: true,
    childAgeMonths: 20,
    createdAt: '2026-07-01T10:00:00.000Z',
    answers: [makeAnswer()],
    ...overrides,
  };
}
