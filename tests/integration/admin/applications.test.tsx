import { describe, it, expect, jest } from '@jest/globals';
import { http } from 'msw';

import AdminApplicationsPage from '@/app/(admin)/admin/applications/page';
import { renderWithProviders, screen, waitFor } from '../../helpers/render';
import { server } from '../../mocks/server';
import { API, wrap } from '../../mocks/handlers';

function summary(over = {}) {
  return {
    id: 'app1',
    firstName: 'Ana',
    lastName: 'Torres',
    email: 'ana@correo.pe',
    phoneNumber: '+51 999',
    licenseNumber: 'CMP-12345',
    specialty: 'Pediatría',
    university: 'UPCH',
    country: 'Perú',
    yearsOfExperience: 8,
    status: 'PENDING' as const,
    createdAt: '2026-07-01T00:00:00Z',
    reviewedAt: null,
    rejectionReason: null,
    ...over,
  };
}

function detail() {
  return {
    ...summary(),
    linkedinUrl: null,
    availability: 'Tiempo parcial',
    motivationLetter: 'Quiero ayudar a las familias con detección temprana.',
    cvFileId: 'cv1',
    dniFileId: 'dni1',
    cvSha256: 'abc',
    dniSha256: 'def',
    consentAccepted: true,
    submittedIp: '1.2.3.4',
    submittedUserAgent: 'jest',
  };
}

// ---------------------------------------------------------------------------
// INTEGRATION — /admin/applications: revisión con checklist obligatorio (12)
// ---------------------------------------------------------------------------
describe('AdminApplicationsPage', () => {
  it('muestra el estado vacío sin postulaciones', async () => {
    server.use(http.get(`${API}/applications`, () => wrap([])));
    renderWithProviders(<AdminApplicationsPage />, { withAuth: false });

    expect(await screen.findByText('No hay postulaciones en este estado.')).toBeInTheDocument();
  });

  it('exige completar el checklist de 6 ítems antes de aprobar', async () => {
    const approve = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/applications`, () => wrap([summary()])),
      http.get(`${API}/applications/app1`, () => wrap(detail())),
      http.patch(`${API}/applications/app1/approve`, approve),
    );
    const { user } = renderWithProviders(<AdminApplicationsPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Revisar y verificar/ }));
    // Espera a que cargue el detalle
    await screen.findByText(/Quiero ayudar a las familias/);

    const approveBtn = screen.getByRole('button', { name: /Aprobar especialista/ });
    expect(approveBtn).toBeDisabled();

    // Marca los 6 ítems del checklist
    const checks = screen.getAllByRole('checkbox');
    for (const c of checks) await user.click(c);

    expect(approveBtn).toBeEnabled();
    await user.click(approveBtn);
    await waitFor(() => expect(approve).toHaveBeenCalled());
  });

  it('permite rechazar una postulación con motivo', async () => {
    const reject = jest.fn(() => wrap({ ok: true }));
    server.use(
      http.get(`${API}/applications`, () => wrap([summary()])),
      http.get(`${API}/applications/app1`, () => wrap(detail())),
      http.patch(`${API}/applications/app1/reject`, reject),
    );
    const { user } = renderWithProviders(<AdminApplicationsPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Revisar y verificar/ }));
    await screen.findByText(/Quiero ayudar a las familias/);

    await user.click(screen.getByRole('button', { name: 'Rechazar' }));
    await user.type(screen.getByPlaceholderText(/no aparece registrada/), 'Datos inconsistentes');
    await user.click(screen.getByRole('button', { name: 'Confirmar rechazo' }));

    await waitFor(() => expect(reject).toHaveBeenCalled());
  });

  it('muestra el motivo en una postulación rechazada', async () => {
    server.use(
      http.get(`${API}/applications`, ({ request }) => {
        const status = new URL(request.url).searchParams.get('status');
        if (status === 'REJECTED') {
          return wrap([summary({ id: 'app3', status: 'REJECTED', rejectionReason: 'Colegiatura no válida' })]);
        }
        return wrap([]);
      }),
    );
    const { user } = renderWithProviders(<AdminApplicationsPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: 'Rechazadas' }));
    expect(await screen.findByText(/Motivo: Colegiatura no válida/)).toBeInTheDocument();
  });

  it('abre los documentos de la postulación', async () => {
    server.use(
      http.get(`${API}/applications`, () => wrap([summary()])),
      http.get(`${API}/applications/app1`, () => wrap(detail())),
      http.get(`${API}/storage/cv1`, () =>
        new Response(new Uint8Array([1, 2, 3]), { headers: { 'Content-Type': 'application/pdf' } }),
      ),
    );
    const { user } = renderWithProviders(<AdminApplicationsPage />, { withAuth: false });

    await user.click(await screen.findByRole('button', { name: /Revisar y verificar/ }));
    await user.click(await screen.findByRole('button', { name: /Ver CV/ }));
    await waitFor(() => expect(window.open).toHaveBeenCalled());
  });

  it('filtra por estado con las pestañas', async () => {
    server.use(
      http.get(`${API}/applications`, ({ request }) => {
        const status = new URL(request.url).searchParams.get('status');
        if (status === 'APPROVED') return wrap([summary({ id: 'app2', status: 'APPROVED', firstName: 'Luis' })]);
        return wrap([summary()]);
      }),
    );
    const { user } = renderWithProviders(<AdminApplicationsPage />, { withAuth: false });

    expect(await screen.findByText(/Ana Torres|Dr\(a\)\. Ana/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Aprobadas' }));
    await waitFor(() => expect(screen.getByText(/Luis/)).toBeInTheDocument());
  });
});
