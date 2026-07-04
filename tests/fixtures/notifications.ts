// ============================================================================
// Fixtures de notificaciones in-app
// ============================================================================
export interface NotificationItemFixture {
  id: string;
  type: string;
  title: string;
  body: string | null;
  relatedType: string | null;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
}

export function makeNotification(
  overrides: Partial<NotificationItemFixture> = {},
): NotificationItemFixture {
  return {
    id: 'ntf_1',
    type: 'QUESTION_ANSWERED',
    title: 'Un especialista respondió tu consulta',
    body: 'Toca para ver la respuesta',
    relatedType: 'Question',
    relatedId: 'q_1',
    isRead: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
