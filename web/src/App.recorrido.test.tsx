import { fireEvent, render, screen, within } from '@testing-library/react';
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
      tienePerfil: true,
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
    postular: vi.fn().mockResolvedValue({ ok: true }),
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
    await user.click(screen.getByRole('button', { name: '← Tablero' }));
    expect(await screen.findByRole('heading', { name: 'Cuenta' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Cola de validación/ }));
    expect(await screen.findByRole('heading', { name: /Cola/ })).toBeInTheDocument();
  });

  it('recorre atajos, ficha del animal y el reintento de arranque', async () => {
    const user = userEvent.setup();
    vi.mocked(api.catalogo).mockResolvedValue([
      {
        id: 'an1',
        nombre: 'Luna',
        especie: 'felino',
        localidad: 'Chapinero',
        historia: 'Llegó de un patio.',
        necesidadEspecial: false,
        raza: null,
        edadAprox: 'adulto',
        badge: 'nivel_1',
        entidadId: 'e1',
        entidadNombre: 'Hogar Norte',
        fotoUrl: null,
        puntaje: null,
        fraseExplicable: null,
      },
    ]);

    vi.mocked(api.yo).mockRejectedValueOnce(new Error('No pude conectar'));
    const caido = render(<App />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No pude conectar');
    vi.mocked(api.yo).mockResolvedValue(null);
    await user.click(screen.getByRole('button', { name: 'Reintentar conexión' }));
    expect(await screen.findByRole('heading', { name: 'Elige cómo participar' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: /Lee una historia/ }));
    for (let i = 0; i < 3; i += 1) {
      const seguir = screen.getAllByRole('button', { name: 'Siguiente' });
      await user.click(seguir[seguir.length - 1]);
    }
    await user.click(screen.getByRole('button', { name: 'Crear cuenta así' }));
    expect(screen.getByRole('heading', { name: 'Crear cuenta' })).toBeInTheDocument();
    await user.click(within(menu()).getByRole('button', { name: 'Catálogo' }));
    await user.click(screen.getByRole('button', { name: /Hogar Norte/ }));
    expect(await screen.findByRole('heading', { name: 'Hogar Norte' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Catálogo' }));
    await user.click(screen.getByRole('button', { name: 'Elige cómo participar' }));
    await user.click(within(menu()).getByRole('button', { name: 'Entrar' }));
    await user.click(screen.getAllByRole('button', { name: 'Términos' })[0]);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    await user.click(screen.getAllByRole('button', { name: 'Datos personales' })[0]);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    vi.mocked(api.entrar).mockResolvedValue({ usuario: { ...base } });
    await user.type(screen.getByLabelText('Correo'), 'ada@local.test');
    await user.type(screen.getByLabelText('Contraseña'), 'Correcta123');
    const entradas = screen.getAllByRole('button', { name: 'Entrar' });
    await user.click(entradas[entradas.length - 1]);
    caido.unmount();

    vi.mocked(api.yo).mockResolvedValue({ ...base, tienePerfilAdoptante: false });
    const adoptante = render(<App />);
    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Especie'), 'felino');
    await user.selectOptions(screen.getByLabelText('Localidad'), 'loc1');
    fireEvent.submit(screen.getByRole('form', { name: 'Filtros del catálogo' }));
    await user.click(screen.getByRole('button', { name: /Luna/ }));
    await user.click(screen.getByRole('checkbox', { name: /mayor de edad/ }));
    await user.click(screen.getByRole('checkbox', { name: /Vivo en Bogotá/ }));
    await user.click(screen.getByRole('button', { name: /Postularme/ }));
    expect(await screen.findByRole('heading', { name: 'Luna' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Hogar Norte/ }));
    expect(await screen.findByRole('heading', { name: 'Hogar Norte' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Catálogo' }));

    await user.click(within(menu()).getByRole('button', { name: 'Cuenta' }));
    await user.click(screen.getByRole('button', { name: /Historias en espera/ }));
    await user.click(within(menu()).getByRole('button', { name: 'Cuenta' }));
    await user.click(screen.getByRole('button', { name: /Cinco preguntas del hogar/ }));
    expect(await screen.findByRole('heading', { name: /hogar/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Atrás' }));
    await user.click(screen.getByRole('button', { name: /Mis postulaciones/ }));
    expect(await screen.findByRole('heading', { name: 'Mis postulaciones' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Tablero' }));
    await user.click(screen.getAllByRole('button', { name: 'Datos personales' })[0]);
    expect(screen.getByRole('heading', { name: 'Tratamiento de datos personales' })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    adoptante.unmount();

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
    render(<App />);
    expect(await screen.findByRole('heading', { name: 'Catálogo' })).toBeInTheDocument();
    await user.click(within(menu()).getByRole('button', { name: 'Cuenta' }));
    await user.click(await screen.findByRole('button', { name: /Tu sello/ }));
    expect(await screen.findByRole('heading', { name: 'Verificación de entidad' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Tablero' }));
    await user.click(screen.getByRole('button', { name: /Puntaje explicable/ }));
    await user.click(screen.getByRole('button', { name: '← Tablero' }));
    await user.click(screen.getByRole('button', { name: /Sin recaudo/ }));
    await user.click(screen.getByRole('button', { name: '← Tablero' }));
    await user.click(screen.getByRole('button', { name: /Publicar un animal/ }));
    expect(await screen.findByRole('heading', { name: 'Publicar animal' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '← Tablero' }));
    await user.click(screen.getByRole('button', { name: /Mestizo/ }));
  });
});
