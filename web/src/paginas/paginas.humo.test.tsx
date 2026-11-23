import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Usuario } from '../api';
import { Legal } from '../componentes/Legal';
import { MenuRol } from '../componentes/MenuRol';
import { AltaAnimal } from './AltaAnimal';
import { Catalogo } from './Catalogo';
import { ColaValidador } from './ColaValidador';
import { Cuestionario } from './Cuestionario';
import { DeseosEntidad } from './DeseosEntidad';
import { Inicio } from './Inicio';
import { MisPostulaciones } from './MisPostulaciones';
import { Necesidades } from './Necesidades';
import { PerfilAnimal } from './PerfilAnimal';
import { PerfilEntidad } from './PerfilEntidad';
import { Registro } from './Registro';
import { Tablero } from './Tablero';
import { TableroPostulaciones } from './TableroPostulaciones';
import { VerificacionEntidad } from './VerificacionEntidad';

vi.mock('../api', () => ({
  api: {
    localidades: vi.fn().mockResolvedValue([{ id: 'loc1', nombre: 'Chapinero', codigo: '02' }]),
    catalogo: vi.fn().mockResolvedValue([
      {
        id: 'an1',
        nombre: 'Luna',
        especie: 'felino',
        localidad: 'Chapinero',
        historia: 'Llegó de un patio.',
        necesidadEspecial: true,
        raza: null,
        edadAprox: 'adulto',
        badge: 'nivel_1',
        entidadId: 'e1',
        entidadNombre: 'Hogar Norte',
        fotoUrl: null,
        puntaje: 80,
        fraseExplicable: 'Coincide en energía',
      },
    ]),
    entidades: vi.fn().mockResolvedValue([
      {
        id: 'e1',
        nombre: 'Hogar Norte',
        localidad: 'Chapinero',
        badge: 'nivel_1',
        pendientes: 1,
        necesidades: [
          {
            id: 'i1',
            categoria: 'alimento',
            descripcion: 'Concentrado',
            cantidad: 1,
            unidad: 'bulto',
            prioridad: 'alta',
          },
        ],
      },
    ]),
    animal: vi.fn().mockResolvedValue({
      id: 'an1',
      nombre: 'Luna',
      especie: 'felino',
      sexo: 'hembra',
      talla: 'pequeno',
      edadAprox: 'adulto',
      energia: 'baja',
      historia: 'Llegó de un patio y busca calma.',
      raza: null,
      necesidadEspecial: false,
      conviveNinos: true,
      conviveOtrosAnimales: true,
      esterilizado: true,
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
    postulacionesDe: vi.fn().mockResolvedValue({
      animal: { id: 'an1', nombre: 'Luna', estado: 'publicado', necesidadEspecial: false },
      postulaciones: [],
    }),
  },
}));

const noop = () => undefined;

const adoptante: Usuario = {
  id: 'u1',
  nombre: 'Ada López',
  correo: 'ada@local.test',
  rol: 'adoptante',
  localidadId: 'loc1',
  localidad: 'Chapinero',
  entidad: null,
};

const entidad: Usuario = {
  ...adoptante,
  id: 'u2',
  nombre: 'Hogar Norte',
  rol: 'entidad',
  entidad: {
    id: 'e1',
    nombre: 'Hogar Norte',
    estadoVerificacion: 'nivel_1',
    puedePublicar: true,
  },
};

const validador: Usuario = { ...adoptante, id: 'u3', rol: 'validador', nombre: 'Nico Ruiz' };

describe('páginas de Mestizo', () => {
  it('el inicio deja elegir un camino y el catálogo muestra una historia', async () => {
    const alRegistro = vi.fn();
    const user = userEvent.setup();
    const { unmount } = render(
      <Inicio yaHaySesion={false} alCatalogo={noop} alRegistro={alRegistro} />,
    );
    await user.click(screen.getAllByRole('button', { name: /Quiero adoptar/ })[0]);
    expect(screen.getByText('Crea tu cuenta de adoptante')).toBeInTheDocument();
    unmount();

    render(
      <Catalogo alAbrir={noop} alEntidad={noop} alRegistro={noop} alInicio={noop} mostrarCta />,
    );
    expect(await screen.findByRole('button', { name: /Luna/ })).toBeInTheDocument();
  });

  it('registro, necesidades, cuestionario y postulaciones propias pintan su estado vacío o de carga', async () => {
    const registro = render(<Registro alListo={noop} alTerminos={noop} alDatos={noop} rolInicial="adoptante" />);
    expect(await within(registro.container).findByRole('option', { name: 'Chapinero' })).toBeInTheDocument();
    registro.unmount();

    const necesidades = render(<Necesidades alAbrir={noop} />);
    expect(await within(necesidades.container).findByText('Hogar Norte')).toBeInTheDocument();
    necesidades.unmount();

    const cuestionario = render(<Cuestionario alListo={noop} alVolver={noop} />);
    expect(await within(cuestionario.container).findByRole('button', { name: /Listo/ })).toBeInTheDocument();
    cuestionario.unmount();

    const mias = render(<MisPostulaciones alVolver={noop} />);
    expect(await within(mias.container).findByRole('button', { name: /Tablero/ })).toBeInTheDocument();
    mias.unmount();
  });

  it('la entidad ve alta, deseos, verificación y el tablero de postulaciones', async () => {
    const alta = render(<AltaAnimal usuario={entidad} alListo={noop} alVolver={noop} />);
    expect(await within(alta.container).findByRole('option', { name: 'Chapinero' })).toBeInTheDocument();
    alta.unmount();

    const deseos = render(<DeseosEntidad usuario={entidad} alVolver={noop} />);
    expect(await within(deseos.container).findByRole('button', { name: /Tablero/ })).toBeInTheDocument();
    deseos.unmount();

    const verificacion = render(
      <VerificacionEntidad usuario={entidad} alVolver={noop} alActualizar={noop} />,
    );
    expect(await within(verificacion.container).findByRole('heading', { name: /Verificación/ })).toBeInTheDocument();
    verificacion.unmount();

    const tableroPost = render(<TableroPostulaciones alVolver={noop} />);
    expect(await within(tableroPost.container).findByRole('heading', { name: /postulaciones/i })).toBeInTheDocument();
    tableroPost.unmount();
  });

  it('el perfil del animal, el del hogar y la cola del validador responden', async () => {
    const animal = render(
      <PerfilAnimal
        id="an1"
        usuario={null}
        alVolver={noop}
        alCuestionario={noop}
        alEntidad={noop}
        alEntrar={noop}
      />,
    );
    expect(await within(animal.container).findByText('Luna')).toBeInTheDocument();
    animal.unmount();

    const hogar = render(
      <PerfilEntidad id="e1" usuario={null} alVolver={noop} alEntrar={noop} alAbrirAnimal={noop} />,
    );
    expect(await within(hogar.container).findByRole('heading', { name: 'Hogar Norte' })).toBeInTheDocument();
    hogar.unmount();

    const cola = render(<ColaValidador alVolver={noop} />);
    expect(await within(cola.container).findByRole('heading', { name: /Cola/ })).toBeInTheDocument();
    cola.unmount();
  });

  it('el tablero y el menú cambian con el rol, y los textos legales se leen', () => {
    render(
      <Tablero
        usuario={adoptante}
        alActualizar={noop}
        alVerificacion={noop}
        alCola={noop}
        alAlta={noop}
        alPostulaciones={noop}
        alCuestionario={noop}
        alDeseos={noop}
        alCatalogo={noop}
        alNecesidades={noop}
        alMisPostulaciones={noop}
      />,
    );
    render(
      <Tablero
        usuario={entidad}
        alActualizar={noop}
        alVerificacion={noop}
        alCola={noop}
        alAlta={noop}
        alPostulaciones={noop}
        alCuestionario={noop}
        alDeseos={noop}
        alCatalogo={noop}
        alNecesidades={noop}
        alMisPostulaciones={noop}
      />,
    );
    render(
      <Tablero
        usuario={validador}
        alActualizar={noop}
        alVerificacion={noop}
        alCola={noop}
        alAlta={noop}
        alPostulaciones={noop}
        alCuestionario={noop}
        alDeseos={noop}
        alCatalogo={noop}
        alNecesidades={noop}
        alMisPostulaciones={noop}
      />,
    );

    render(<MenuRol clase="menu-escritorio" pagina="catalogo" usuario={null} alIr={noop} alSalir={noop} />);
    render(<MenuRol clase="menu-escritorio" pagina="tablero" usuario={entidad} alIr={noop} alSalir={noop} />);
    render(<MenuRol clase="menu-movil" pagina="necesidades" usuario={{ ...adoptante, rol: 'donante' }} alIr={noop} alSalir={noop} />);

    render(<Legal doc="terminos" alVolver={noop} />);
    render(<Legal doc="datos" alVolver={noop} />);
    expect(screen.getByRole('heading', { name: 'Tratamiento de datos personales' })).toBeInTheDocument();
  });
});
