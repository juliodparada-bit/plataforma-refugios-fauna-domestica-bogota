import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { api, type Usuario } from './api';

vi.mock('./api', () => ({
  api: {
    yo: vi.fn().mockResolvedValue(null),
    salir: vi.fn().mockResolvedValue({ ok: true }),
    entrar: vi.fn(),
    registro: vi.fn(),
    localidades: vi.fn().mockResolvedValue([{ id: 'loc1', nombre: 'Chapinero', codigo: '02' }]),
    catalogo: vi.fn().mockResolvedValue([]),
    entidades: vi.fn().mockResolvedValue([]),
    animal: vi.fn().mockResolvedValue({
      id: 'an1',
      nombre: 'Luna',
      especie: 'felino',
      sexo: 'hembra',
      talla: 'pequeno',
      edadAprox: 'adulto',
      energia: 'baja',
      historia: 'Llegó de un patio.',
      raza: null,
      necesidadEspecial: false,
      conviveNinos: true,
      conviveOtrosAnimales: true,
      esterilizado: null,
      estado: 'publicado',
      localidad: 'Chapinero',
      entidad: { id: 'e1', nombre: 'Hogar Norte', badge: 'nivel_1', localidad: 'Chapinero' },
      fotos: [],
      tienePerfil: false,
    }),
    entidadPublica: vi.fn().mockResolvedValue({
      id: 'e1',
      nombre: 'Hogar Norte',
      localidad: 'Chapinero',
      badge: 'nivel_1',
      bitacora: [],
      deseos: [],
      animales: [],
    }),
    perfil: vi.fn().mockResolvedValue(null),
    misDeseos: vi.fn().mockResolvedValue([]),
    misAnimales: vi.fn().mockResolvedValue([]),
    misPostulaciones: vi.fn().mockResolvedValue([]),
    colaVerificacion: vi.fn().mockResolvedValue([]),
    miVerificacion: vi.fn().mockResolvedValue({
      entidad: {
        id: 'e1',
        nombre: 'Hogar Norte',
        localidadId: 'loc1',
        nivelSolicitado: 'nivel_2',
        estadoVerificacion: 'nivel_1',
        puedePublicar: true,
      },
      solicitud: null,
    }),
  },
}));

const base: Usuario = {
  id: 'u1',
  nombre: 'Ada López',
  correo: 'ada@local.test',
  rol: 'adoptante',
  localidadId: 'loc1',
  localidad: 'Chapinero',
  entidad: null,
};

function menu() {
  return screen.getByRole('navigation', { name: 'Principal' });
}

describe('App', () => {
  it('sale de la carga, abre el catálogo, la cuenta y los textos legales', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Elige cómo participar' })).toBeInTheDocument();
    await user.click(within(menu()).getByRole('button', { name: 'Catálogo' }));
    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();

    await user.click(within(menu()).getByRole('button', { name: 'Entrar' }));
    expect(screen.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
    await user.click(within(menu()).getByRole('button', { name: 'Crear cuenta' }));
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Términos' })[0]);
    expect(screen.getByRole('heading', { name: 'Términos y condiciones' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));

    await user.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }));
    expect(screen.getByRole('button', { name: 'Cambiar a modo claro' })).toBeInTheDocument();
  });

  it('con sesión de entidad muestra publicar, deseos y postulaciones', async () => {
    vi.mocked(api.yo).mockResolvedValue({
      ...base,
      rol: 'entidad',
      nombre: 'Hogar Norte',
      entidad: {
        id: 'e1',
        nombre: 'Hogar Norte',
        estadoVerificacion: 'nivel_1',
        puedePublicar: true,
      },
    });
    const user = userEvent.setup();
    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
    await user.click(within(menu()).getByRole('button', { name: 'Publicar' }));
    expect(await screen.findByRole('heading', { name: 'Publicar animal' })).toBeInTheDocument();
    await user.click(within(menu()).getByRole('button', { name: 'Deseos' }));
    expect(await screen.findByRole('heading', { name: 'Lista de deseos' })).toBeInTheDocument();
    await user.click(within(menu()).getByRole('button', { name: 'Postulaciones' }));
    expect(await screen.findByRole('heading', { name: /postulaciones/i })).toBeInTheDocument();
    await user.click(within(menu()).getByRole('button', { name: 'Cuenta' }));
    expect(await screen.findByRole('heading', { name: 'Cuenta' })).toBeInTheDocument();
    await user.click(within(menu()).getByRole('button', { name: 'Salir' }));
  });

  it('el donante cae en necesidades y el validador abre la cola', async () => {
    vi.mocked(api.yo).mockResolvedValue({ ...base, rol: 'donante' });
    const user = userEvent.setup();
    const donante = render(<App />);
    expect(await screen.findByRole('heading', { name: 'Necesidades' })).toBeInTheDocument();
    donante.unmount();

    vi.mocked(api.yo).mockResolvedValue({ ...base, rol: 'validador', nombre: 'Nico Ruiz' });
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
    await user.click(within(menu()).getByRole('button', { name: 'Cola' }));
    expect(await screen.findByRole('heading', { name: /Cola/ })).toBeInTheDocument();
  });
});
