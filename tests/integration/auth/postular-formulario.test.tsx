import { describe, it, expect, jest, afterEach } from '@jest/globals';

import ApplicationFormPage from '@/app/(auth)/postular/formulario/page';
import { api } from '@/lib/api-client';
import { renderWithProviders, screen, waitFor, fireEvent } from '../../helpers/render';
import { router } from '../../mocks/next-navigation';

type UserEvt = ReturnType<typeof renderWithProviders>['user'];

async function fillValidFields(user: UserEvt) {
  await user.type(screen.getByPlaceholderText('María'), 'María');
  await user.type(screen.getByPlaceholderText('López Quispe'), 'López Quispe');
  await user.type(screen.getByPlaceholderText('dra.lopez@gmail.com'), 'dra.lopez@gmail.com');
  await user.type(screen.getByPlaceholderText('+51 987 654 321'), '+51 987 654 321');
  await user.type(screen.getByPlaceholderText('CMP-12345'), 'CMP-12345');
  await user.type(screen.getByPlaceholderText('Pediatría del Desarrollo'), 'Pediatría del Desarrollo');
  await user.type(
    screen.getByPlaceholderText('Universidad Peruana Cayetano Heredia'),
    'Universidad Peruana Cayetano Heredia',
  );
  await user.type(screen.getByPlaceholderText('Perú'), 'Perú');
  await user.type(screen.getByPlaceholderText('Lunes a viernes, tardes'), 'Lunes a viernes, tardes');
  await user.type(
    screen.getByPlaceholderText(/Cuéntanos por qué deseas colaborar/),
    'Deseo colaborar con NeuroAlert en la detección temprana del TEA en la niñez.',
  );
  await user.click(screen.getByRole('checkbox'));
}

function uploadFiles(container: HTMLElement) {
  const inputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');
  fireEvent.change(inputs[0], { target: { files: [new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' })] } });
  fireEvent.change(inputs[1], { target: { files: [new File(['%PDF'], 'dni.pdf', { type: 'application/pdf' })] } });
}

// ---------------------------------------------------------------------------
// INTEGRATION — /postular/formulario: postulación de especialista (sin cuenta)
// ---------------------------------------------------------------------------
describe('ApplicationFormPage', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('valida los campos obligatorios', async () => {
    const { user } = renderWithProviders(<ApplicationFormPage />, { withAuth: false });

    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    expect(await screen.findByText('Nombre muy corto')).toBeInTheDocument();
    expect(screen.getByText('Correo inválido')).toBeInTheDocument();
  });

  it('exige adjuntar el currículum si falta', async () => {
    const { user } = renderWithProviders(<ApplicationFormPage />, { withAuth: false });

    await fillValidFields(user);
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    expect(await screen.findByText('Adjunta tu currículum en PDF.')).toBeInTheDocument();
  });

  it('rechaza un currículum que no sea PDF', async () => {
    const { container, user } = renderWithProviders(<ApplicationFormPage />, { withAuth: false });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');

    await fillValidFields(user);
    fireEvent.change(inputs[0], { target: { files: [new File(['x'], 'cv.png', { type: 'image/png' })] } });
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    expect(await screen.findByText('El currículum debe ser un archivo PDF.')).toBeInTheDocument();
  });

  it('exige adjuntar el DNI', async () => {
    const { container, user } = renderWithProviders(<ApplicationFormPage />, { withAuth: false });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');

    await fillValidFields(user);
    fireEvent.change(inputs[0], { target: { files: [new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' })] } });
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    expect(await screen.findByText('Adjunta tu documento de identidad (DNI).')).toBeInTheDocument();
  });

  it('permite quitar un archivo adjunto', async () => {
    const { container, user } = renderWithProviders(<ApplicationFormPage />, { withAuth: false });
    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="file"]');

    fireEvent.change(inputs[0], { target: { files: [new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' })] } });
    expect(await screen.findByText(/cv\.pdf/)).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Quitar archivo' })[0]);
    await waitFor(() => expect(screen.queryByText(/cv\.pdf/)).not.toBeInTheDocument());
  });

  it('muestra el error del servidor si la postulación falla', async () => {
    jest.spyOn(api, 'post').mockRejectedValue({
      response: { data: { message: ['Correo ya postulado', 'Revisa tus datos'] } },
    });
    const { container, user } = renderWithProviders(<ApplicationFormPage />, { withAuth: false });

    await fillValidFields(user);
    uploadFiles(container);
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    expect(await screen.findByText('Correo ya postulado · Revisa tus datos')).toBeInTheDocument();
  });

  it('envía la postulación completa y redirige a la confirmación', async () => {
    // FormData no viaja de forma fiable por el XHR de jsdom + MSW; mockeamos
    // api.post en la frontera del cliente.
    const postSpy = jest.spyOn(api, 'post').mockResolvedValue({ data: { data: {} } });
    const { container, user } = renderWithProviders(<ApplicationFormPage />, { withAuth: false });

    await fillValidFields(user);
    uploadFiles(container);
    await user.click(screen.getByRole('button', { name: 'Enviar solicitud' }));

    await waitFor(() => expect(postSpy).toHaveBeenCalledWith('/applications', expect.any(Object)));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/postular/enviado'));
  });
});
