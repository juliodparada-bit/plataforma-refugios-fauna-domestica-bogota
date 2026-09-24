import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type Rol, type Usuario } from './api';
import { Legal, PieLegal, type DocLegal } from './componentes/Legal';
import { MenuRol } from './componentes/MenuRol';
import { Marca } from './componentes/Marca';
import { useFocoDialogo } from './hooks/useFocoDialogo';
import { useTema } from './hooks/useTema';
import type { Pagina } from './navegacion';
import { AltaAnimal } from './paginas/AltaAnimal';
import { Catalogo } from './paginas/Catalogo';
import { ColaValidador } from './paginas/ColaValidador';
import { Cuestionario } from './paginas/Cuestionario';
import { DeseosEntidad } from './paginas/DeseosEntidad';
import { Entrar } from './paginas/Entrar';
import { Inicio } from './paginas/Inicio';
import { MisPostulaciones } from './paginas/MisPostulaciones';
import { Necesidades } from './paginas/Necesidades';
import { PerfilAnimal } from './paginas/PerfilAnimal';
import { PerfilEntidad } from './paginas/PerfilEntidad';
import { Registro } from './paginas/Registro';
import { Tablero } from './paginas/Tablero';
import { TableroPostulaciones } from './paginas/TableroPostulaciones';
import { VerificacionEntidad } from './paginas/VerificacionEntidad';

export function App() {
  const [pagina, setPagina] = useState<Pagina>('inicio');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [rolRegistro, setRolRegistro] = useState<Exclude<Rol, 'validador'> | undefined>();
  const [docLegal, setDocLegal] = useState<DocLegal | null>(null);
  const [errorArranque, setErrorArranque] = useState('');
  const { tema, alternar } = useTema();
  const legalRef = useRef<HTMLDivElement>(null);
  const cerrarLegal = useCallback(() => setDocLegal(null), []);
  useFocoDialogo(Boolean(docLegal), legalRef, cerrarLegal);

  useEffect(() => {
    const titulos: Record<Pagina, string> = {
      inicio: 'Inicio',
      catalogo: 'Catálogo',
      registro: 'Crear cuenta',
      entrar: 'Entrar',
      tablero: 'Cuenta',
      verificacion: 'Verificación',
      cola: 'Cola de validación',
      animal: 'Perfil del animal',
      entidadPub: 'Perfil de la entidad',
      alta: 'Publicar animal',
      postulaciones: 'Postulaciones',
      cuestionario: 'Cuestionario',
      deseos: 'Listas de deseos',
      necesidades: 'Necesidades',
      misPostulaciones: 'Mis postulaciones',
    };
    document.title = `${titulos[pagina]} · Mestizo — Por convivencia, no por raza.`;
  }, [pagina]);

  const cargarSesion = useCallback((signal?: AbortSignal) => {
    setErrorArranque('');
    return api
      .yo({ signal })
      .then((u) => {
        setUsuario(u);
        if (u) {
          setPagina((p) =>
            p === 'inicio' ? (u.rol === 'donante' ? 'necesidades' : 'catalogo') : p,
          );
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setUsuario(null);
        setErrorArranque(
          err instanceof Error ? err.message : 'No pude hablar con la API.',
        );
      });
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    void cargarSesion(ac.signal).finally(() => {
      if (!ac.signal.aborted) setCargando(false);
    });
    return () => ac.abort();
  }, [cargarSesion]);

  useEffect(() => {
    if (cargando) return;
    const privadas: Pagina[] = [
      'tablero',
      'verificacion',
      'cola',
      'alta',
      'postulaciones',
      'cuestionario',
      'deseos',
      'necesidades',
      'misPostulaciones',
    ];
    if (!usuario) {
      if (privadas.includes(pagina)) setPagina('catalogo');
      return;
    }
    if (pagina === 'inicio') {
      setPagina(usuario.rol === 'donante' ? 'necesidades' : 'catalogo');
      return;
    }
    if (pagina === 'necesidades' && usuario.rol !== 'donante') {
      setPagina('catalogo');
      return;
    }
    const sello = Boolean(usuario.entidad?.puedePublicar);
    if (pagina === 'cola' && usuario.rol !== 'validador') {
      setPagina('tablero');
    } else if (
      (pagina === 'verificacion' && usuario.rol !== 'entidad') ||
      ((pagina === 'alta' || pagina === 'postulaciones' || pagina === 'deseos') &&
        (usuario.rol !== 'entidad' || !sello))
    ) {
      setPagina('tablero');
    } else if (
      (pagina === 'cuestionario' || pagina === 'misPostulaciones') &&
      usuario.rol !== 'adoptante'
    ) {
      setPagina('tablero');
    }
  }, [usuario, pagina, cargando]);

  function irLegal(doc: DocLegal) {
    setDocLegal(doc);
  }

  async function salir() {
    try {
      await api.salir();
    } catch {
      /* la cookie local ya no cuenta: limpiamos el estado igual */
    }
    setUsuario(null);
    setPagina('inicio');
  }

  async function reintentarArranque() {
    setCargando(true);
    await cargarSesion();
    setCargando(false);
  }

  if (cargando) {
    return (
      <>
        <a className="saltar" href="#contenido">
          Saltar al contenido
        </a>
        <div className="marco">
          <header className="barra">
            <Marca as="div" />
          </header>
          <main id="contenido" className="hoja" tabIndex={-1} aria-busy="true" aria-label="Cargando">
          <div className="pagina-cabecera">
            <div className="esqueleto esqueleto-linea" style={{ width: '22%', height: '0.7rem' }} />
            <div className="esqueleto esqueleto-linea" style={{ width: '40%', height: '1.7rem' }} />
            <div className="esqueleto esqueleto-linea" style={{ width: '70%' }} />
          </div>
          <ul className="lista tarjetas" style={{ marginTop: '2rem' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i} className="esqueleto-tarjeta" aria-hidden="true">
                <div className="esqueleto esqueleto-foto" />
                <div className="esqueleto-cuerpo">
                  <div className="esqueleto esqueleto-linea" style={{ width: '60%' }} />
                  <div className="esqueleto esqueleto-linea" style={{ width: '80%' }} />
                </div>
              </li>
            ))}
          </ul>
        </main>
        </div>
      </>
    );
  }

  return (
    <>
    <a className="saltar" href="#contenido">
      Saltar al contenido
    </a>
    <div className="marco" {...(docLegal ? { inert: true } : {})}>
      <header className="barra">
        <Marca
          onClick={() =>
            setPagina(usuario ? (usuario.rol === 'donante' ? 'necesidades' : 'catalogo') : 'inicio')
          }
        />
        <div className="barra-acciones">
          <MenuRol
            clase="menu-escritorio"
            pagina={pagina}
            usuario={usuario}
            alIr={setPagina}
            alSalir={() => void salir()}
          />
          <button
            type="button"
            className="btn-tema"
            onClick={alternar}
            aria-pressed={tema === 'oscuro'}
            aria-label={tema === 'oscuro' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            title={tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}
          >
            <span aria-hidden="true">{tema === 'oscuro' ? '☀️' : '🌙'}</span>
          </button>
        </div>
      </header>

      <div className="cuerpo" id="contenido" tabIndex={-1}>

      {errorArranque && (
        <aside className="aviso" role="alert">
          <p>{errorArranque}</p>
          <div className="acciones">
            <button type="button" className="secundario" onClick={() => void reintentarArranque()}>
              Reintentar conexión
            </button>
          </div>
        </aside>
      )}

      {pagina === 'inicio' && (
        <Inicio
          yaHaySesion={Boolean(usuario)}
          alCatalogo={() => setPagina('catalogo')}
          alRegistro={(rol) => {
            setRolRegistro(rol);
            setPagina('registro');
          }}
        />
      )}

      {pagina === 'catalogo' && (
        <Catalogo
          alAbrir={(id) => {
            setSeleccion(id);
            setPagina('animal');
          }}
          alEntidad={(id) => {
            setSeleccion(id);
            setPagina('entidadPub');
          }}
          alRegistro={() => {
            setRolRegistro(undefined);
            setPagina('registro');
          }}
          alInicio={() => setPagina('inicio')}
          mostrarCta={!usuario}
        />
      )}

      {pagina === 'necesidades' && usuario?.rol === 'donante' && (
        <Necesidades
          alAbrir={(id) => {
            setSeleccion(id);
            setPagina('entidadPub');
          }}
        />
      )}

      {pagina === 'registro' && (
        <Registro
          rolInicial={rolRegistro}
          alListo={(u) => {
            setUsuario(u);
            setPagina(u.rol === 'donante' ? 'necesidades' : 'tablero');
          }}
          alTerminos={() => irLegal('terminos')}
          alDatos={() => irLegal('datos')}
        />
      )}

      {pagina === 'entrar' && (
        <Entrar
          alListo={(u) => {
            setUsuario(u);
            setPagina(u.rol === 'donante' ? 'necesidades' : 'tablero');
          }}
          alRegistro={() => {
            setRolRegistro(undefined);
            setPagina('registro');
          }}
          alTerminos={() => irLegal('terminos')}
          alDatos={() => irLegal('datos')}
        />
      )}

      {pagina === 'tablero' && usuario && (
        <Tablero
          usuario={usuario}
          alActualizar={setUsuario}
          alVerificacion={() => setPagina('verificacion')}
          alCola={() => setPagina('cola')}
          alAlta={() => setPagina('alta')}
          alPostulaciones={() => setPagina('postulaciones')}
          alCuestionario={() => setPagina('cuestionario')}
          alDeseos={() => setPagina('deseos')}
          alCatalogo={() => setPagina('catalogo')}
          alNecesidades={() => setPagina('necesidades')}
          alMisPostulaciones={() => setPagina('misPostulaciones')}
        />
      )}

      {pagina === 'verificacion' && usuario?.rol === 'entidad' && (
        <VerificacionEntidad
          usuario={usuario}
          alVolver={() => setPagina('tablero')}
          alActualizar={setUsuario}
        />
      )}

      {pagina === 'cola' && usuario?.rol === 'validador' && (
        <ColaValidador alVolver={() => setPagina('tablero')} />
      )}

      {pagina === 'animal' && seleccion && (
        <PerfilAnimal
          id={seleccion}
          usuario={usuario}
          alVolver={() => setPagina('catalogo')}
          alCuestionario={() => setPagina('cuestionario')}
          alEntidad={(id) => {
            setSeleccion(id);
            setPagina('entidadPub');
          }}
          alEntrar={() => setPagina('entrar')}
        />
      )}

      {pagina === 'entidadPub' && seleccion && (
        <PerfilEntidad
          id={seleccion}
          usuario={usuario}
          alVolver={() =>
            setPagina(usuario?.rol === 'donante' ? 'necesidades' : 'catalogo')
          }
          alEntrar={() => setPagina('entrar')}
          alAbrirAnimal={(id) => {
            setSeleccion(id);
            setPagina('animal');
          }}
        />
      )}

      {pagina === 'alta' && usuario?.entidad?.puedePublicar && (
        <AltaAnimal
          usuario={usuario}
          alVolver={() => setPagina('tablero')}
          alListo={(id) => {
            setSeleccion(id);
            setPagina('animal');
          }}
        />
      )}

      {pagina === 'postulaciones' && usuario?.entidad?.puedePublicar && (
        <TableroPostulaciones alVolver={() => setPagina('tablero')} />
      )}

      {pagina === 'cuestionario' && usuario?.rol === 'adoptante' && (
        <Cuestionario
          alVolver={() => setPagina('tablero')}
          alListo={() => {
            void api.yo().then((u) => {
              if (u) setUsuario(u);
            });
            setPagina('catalogo');
          }}
        />
      )}

      {pagina === 'deseos' && usuario?.entidad?.puedePublicar && (
        <DeseosEntidad usuario={usuario} alVolver={() => setPagina('tablero')} />
      )}

      {pagina === 'misPostulaciones' && usuario?.rol === 'adoptante' && (
        <MisPostulaciones alVolver={() => setPagina('tablero')} />
      )}

      <PieLegal alTerminos={() => irLegal('terminos')} alDatos={() => irLegal('datos')} />
      </div>

      <MenuRol
        clase="menu-movil"
        pagina={pagina}
        usuario={usuario}
        alIr={setPagina}
        alSalir={() => void salir()}
      />
    </div>
    {docLegal && (
      <div
        ref={legalRef}
        className="capa-legal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-titulo"
      >
        <Legal doc={docLegal} alVolver={cerrarLegal} />
      </div>
    )}
    </>
  );
}
