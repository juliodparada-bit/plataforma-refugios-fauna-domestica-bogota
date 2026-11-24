import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Entrar } from './Entrar';
import { api, ErrorApi } from '../api';

vi.mock('../api', () => ({
  api: { entrar: vi.fn() },
  ErrorApi: class ErrorApi extends Error {
    status: number;
    constructor(mensaje: string, status: number) {
      super(mensaje);
      this.status = status;
    }
  },
}));

const entrar = vi.mocked(api.entrar);

function montar() {
  const alListo = vi.fn();
  const alRegistro = vi.fn();
  const alTerminos = vi.fn();
  const alDatos = vi.fn();
  render(
    <Entrar alListo={alListo} alRegistro={alRegistro} alTerminos={alTerminos} alDatos={alDatos} />,
  );
  return { alListo, alRegistro, alTerminos, alDatos };
}

describe('Entrar', () => {
  beforeEach(() => {
    entrar.mockReset();
  });

  it('envía correo y contraseña y avisa cuando la sesión queda lista', async () => {
    const usuario = {
      id: 'u1',
      nombre: 'Ada',
      correo: 'ada@mestizo.test',
      rol: 'adoptante' as const,
      localidad: 'Chapinero',
      entidad: null,
    };
    entrar.mockResolvedValue({ usuario });
    const { alListo } = montar();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Correo'), 'ada@mestizo.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Correcta123');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(entrar).toHaveBeenCalledWith('ada@mestizo.test', 'Correcta123');
    expect(alListo).toHaveBeenCalledWith(usuario);
  });

  it('muestra la alerta cuando la API rechaza la contraseña', async () => {
    entrar.mockRejectedValue(new ErrorApi('Correo o contraseña incorrectos.', 401));
    montar();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Correo'), 'ada@mestizo.test');
    await user.type(screen.getByLabelText('Contraseña'), 'mala');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.');
    expect(screen.getByLabelText('Correo')).toHaveAttribute('aria-invalid', 'true');
  });

  it('los enlaces de crear cuenta, términos y datos salen del formulario', async () => {
    const { alRegistro, alTerminos, alDatos } = montar();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await user.click(screen.getByRole('button', { name: 'Términos' }));
    await user.click(screen.getByRole('button', { name: 'Datos personales' }));

    expect(alRegistro).toHaveBeenCalledOnce();
    expect(alTerminos).toHaveBeenCalledOnce();
    expect(alDatos).toHaveBeenCalledOnce();
  });
});
