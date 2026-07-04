import { describe, it, expect, jest, afterEach } from '@jest/globals';

import BecomeSpecialistPage from '@/app/(parent)/become-specialist/page';
import { api } from '@/lib/api-client';
import { renderWithProviders, screen, waitFor, fireEvent } from '../../helpers/render';

const pdf = () => new File(['%PDF-1.4 contenido'], 'licencia.pdf', { type: 'application/pdf' });

function fileInputs(container: HTMLElement) {
  return container.querySelectorAll<HTMLInputElement>('input[type="file"]');
}

// El input de archivo está oculto (display:none); fireEvent.change dispara el
// onChange de React de forma determinista sin depender de la visibilidad.
function uploadTo(input: HTMLInputElement, file: File) {
  fireEvent.change(input, { target: { files: [file] } });
}

// ---------------------------------------------------------------------------
// INTEGRATION — /become-specialist: subida de documentos + solicitud de upgrade
// ---------------------------------------------------------------------------
describe('BecomeSpecialistPage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('valida los campos obligatorios antes de enviar', async () => {
    const { user } = renderWithProviders(<BecomeSpecialistPage />, { withAuth: false });

    await user.click(screen.getByRole('button', { name: /Enviar solicitud/ }));

    expect(await screen.findByText('Ingresa tu número de colegiatura.')).toBeInTheDocument();
  });

  it('rechaza archivos con formato no permitido', async () => {
    const { container } = renderWithProviders(<BecomeSpecialistPage />, { withAuth: false });

    uploadTo(fileInputs(container)[0], new File(['texto'], 'nota.txt', { type: 'text/plain' }));

    expect(await screen.findByText(/Formato no permitido/)).toBeInTheDocument();
  });

  it('rechaza archivos que superan 4 MB', async () => {
    const { container } = renderWithProviders(<BecomeSpecialistPage />, { withAuth: false });

    const big = new File([new Uint8Array(5 * 1024 * 1024)], 'grande.pdf', { type: 'application/pdf' });
    uploadTo(fileInputs(container)[0], big);

    expect(await screen.findByText(/supera 4 MB/)).toBeInTheDocument();
  });

  it('muestra un error si el backend rechaza la solicitud', async () => {
    jest.spyOn(api, 'post').mockRejectedValue({
      response: { data: { message: 'Colegiatura no válida' } },
    });
    const { container, user } = renderWithProviders(<BecomeSpecialistPage />, { withAuth: false });

    await user.type(screen.getByPlaceholderText('CMP-12345'), 'CMP-1');
    await user.type(screen.getByPlaceholderText('Pediatría del Desarrollo'), 'Pediatría');
    uploadTo(fileInputs(container)[0], pdf());
    await user.click(screen.getByRole('button', { name: /Enviar solicitud/ }));

    expect(await screen.findByText('Colegiatura no válida')).toBeInTheDocument();
  });

  it('envía la solicitud subiendo la licencia y muestra la confirmación', async () => {
    // La subida usa multipart/FormData, que no viaja de forma fiable por el XHR
    // de jsdom interceptado por MSW (limitación del entorno de test, no del
    // código). Mockeamos api.post en la frontera del cliente: seguimos validando
    // la orquestación real del submit (validación → subida → solicitud → done).
    const postSpy = jest.spyOn(api, 'post').mockImplementation((url: string) => {
      if (url === '/storage/upload') {
        return Promise.resolve({ data: { data: { id: 'file_1' } } });
      }
      return Promise.resolve({ data: { data: { ok: true } } });
    });
    const { container, user } = renderWithProviders(<BecomeSpecialistPage />, { withAuth: false });

    await user.type(screen.getByPlaceholderText('CMP-12345'), 'CMP-12345');
    await user.type(screen.getByPlaceholderText('Pediatría del Desarrollo'), 'Pediatría del Desarrollo');
    uploadTo(fileInputs(container)[0], pdf());
    uploadTo(fileInputs(container)[1], new File(['%PDF cv'], 'cv.pdf', { type: 'application/pdf' }));
    await user.click(screen.getByRole('button', { name: /Enviar solicitud/ }));

    expect(await screen.findByText('Solicitud enviada')).toBeInTheDocument();
    await waitFor(() =>
      expect(postSpy).toHaveBeenCalledWith('/users/me/request-specialist', expect.any(Object)),
    );
  });
});
