// ============================================================================
// Stub de `react-markdown` para los tests
// ----------------------------------------------------------------------------
// react-markdown es ESM puro con un árbol de dependencias grande (micromark,
// mdast…). No testeamos el renderizado de Markdown en sí, así que lo sustituimos
// por un componente que vuelca el texto tal cual. Se mapea vía moduleNameMapper.
// ============================================================================
import React, { type ReactNode } from 'react';

export default function ReactMarkdown({ children }: { children?: ReactNode }) {
  return <div data-testid="markdown">{children}</div>;
}
