// ============================================================================
// Doble de `next/link` para jsdom
// ----------------------------------------------------------------------------
// Renderiza un ancla nativa y descarta las props exclusivas de Next (prefetch,
// replace, scroll…) para no ensuciar el DOM ni provocar warnings de React.
// ============================================================================
import React, { type AnchorHTMLAttributes, type ReactNode } from 'react';

type LinkProps = {
  href: string | { pathname?: string };
  children: ReactNode;
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  passHref?: boolean;
  legacyBehavior?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

export default function Link({
  href,
  children,
  prefetch: _prefetch,
  replace: _replace,
  scroll: _scroll,
  shallow: _shallow,
  passHref: _passHref,
  legacyBehavior: _legacyBehavior,
  ...rest
}: LinkProps) {
  const to = typeof href === 'string' ? href : (href?.pathname ?? '#');
  return (
    <a href={to} {...rest}>
      {children}
    </a>
  );
}
