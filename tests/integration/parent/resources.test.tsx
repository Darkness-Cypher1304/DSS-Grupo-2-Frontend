import { describe, it, expect } from '@jest/globals';

import ResourcesPage from '@/app/(parent)/resources/page';
import { renderWithProviders, screen } from '../../helpers/render';

// ---------------------------------------------------------------------------
// INTEGRATION — /resources: biblioteca estática de PDFs + enlaces oficiales
// ---------------------------------------------------------------------------
describe('ResourcesPage', () => {
  it('lista los recursos descargables y los sitios oficiales', () => {
    renderWithProviders(<ResourcesPage />, { withAuth: false });

    expect(screen.getByText('Recursos descargables')).toBeInTheDocument();
    expect(screen.getByText('Guía para tu primera visita al pediatra')).toBeInTheDocument();

    const conadis = screen.getByRole('link', { name: /CONADIS/ });
    expect(conadis).toHaveAttribute('href', 'https://www.gob.pe/conadis');
    expect(conadis).toHaveAttribute('target', '_blank');
  });

  it('renderiza un botón de descarga por cada recurso', () => {
    renderWithProviders(<ResourcesPage />, { withAuth: false });
    expect(screen.getAllByRole('button', { name: /Descargar PDF/ })).toHaveLength(4);
  });
});
