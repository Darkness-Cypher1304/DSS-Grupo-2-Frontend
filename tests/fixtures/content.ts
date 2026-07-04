// ============================================================================
// Fixtures de contenido educativo (artículos)
// ============================================================================
export interface ContentItemFixture {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  tags: string[];
  publishedAt: string;
  author: { fullName: string };
}

export function makeArticle(overrides: Partial<ContentItemFixture> = {}): ContentItemFixture {
  return {
    id: 'cnt_1',
    slug: 'senales-tempranas-tea',
    title: 'Señales tempranas del TEA',
    summary: 'Qué observar en el desarrollo de tu hijo/a.',
    category: 'Desarrollo',
    tags: ['tea', 'desarrollo'],
    publishedAt: '2026-06-01T10:00:00.000Z',
    author: { fullName: 'Dra. Ana Torres' },
    ...overrides,
  };
}

export function makeContentList(items = [makeArticle()]) {
  return {
    items,
    pagination: { page: 1, perPage: 20, total: items.length, totalPages: 1 },
  };
}
