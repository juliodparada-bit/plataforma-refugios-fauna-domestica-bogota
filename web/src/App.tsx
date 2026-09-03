import { useCallback, useEffect, useRef, useState } from 'react';
import { api, type Usuario } from './api';
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
import { MisPostulaciones } from './paginas/MisPostulaciones';
import { PerfilAnimal } from './paginas/PerfilAnimal';
import { PerfilEntidad } from './paginas/PerfilEntidad';
import { Registro } from './paginas/Registro';
import { Tablero } from './paginas/Tablero';
import { TableroPostulaciones } from './paginas/TableroPostulaciones';
import { VerificacionEntidad } from './paginas/VerificacionEntidad';

export function App() {
  const [pagina, setPagina] = useState<Pagina>('catalogo');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [docLegal, setDocLegal] = useState<DocLegal | null>(null);
  const { tema, alternar } = useTema();
  const legalRef = useRef<HTMLDivElement>(null);
  const cerrarLegal = useCallback(() => setDocLegal(null), []);
  useFocoDialogo(Boolean(docLegal), legalRef, cerrarLegal);

  useEffect(() => {
    const titulos: Record<Pagina, string> = {
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
      misPostulaciones: 'Mis postulaciones',
    };
    document.title = `${titulos[pagina]} · Mestizo — Por convivencia, no por raza.`;
  }, [pagina]);

  useEffect(() => {
    api
      .yo()
      .then((u) => {
        setUsuario(u);
      })
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

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
      'misPostulaciones',
    ];
    if (!usuario) {
      if (privadas.includes(pagina)) setPagina('catalogo');
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
    await api.salir();
    setUsuario(null);
    setPagina('catalogo');
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
          <div className="esqueleto" style={{ height: '14rem', borderRadius: '1.1rem', marginBottom: '1.25rem' }} />
          <div style={{ display: 'grid', gap: '0.55rem' }}>
            <div className="esqueleto esqueleto-linea" style={{ width: '55%', height: '1.8rem' }} />
            <div className="esqueleto esqueleto-linea" style={{ width: '80%' }} />
            <div className="esqueleto esqueleto-linea" style={{ width: '65%' }} />
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
        <Marca onClick={() => setPagina('catalogo')} />
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
      </header>

      <div className="cuerpo" id="contenido" tabIndex={-1}>

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
          alRegistro={() => setPagina('registro')}
          mostrarCta={!usuario}
        />
      )}

      {pagina === 'registro' && (
        <Registro
          alListo={(u) => {
            setUsuario(u);
            setPagina('tablero');
          }}
          alTerminos={() => irLegal('terminos')}
          alDatos={() => irLegal('datos')}
        />
      )}

      {pagina === 'entrar' && (
        <Entrar
          alListo={(u) => {
            setUsuario(u);
            setPagina('tablero');
          }}
          alRegistro={() => setPagina('registro')}
          alTerminos={() => irLegal('terminos')}
          alDatos={() => irLegal('datos')}
        />
      )}

      {pagina === 'tablero' && usuario && (
        <Tablero
          usuario={usuario}
          alVerificacion={() => setPagina('verificacion')}
          alCola={() => setPagina('cola')}
          alAlta={() => setPagina('alta')}
          alPostulaciones={() => setPagina('postulaciones')}
          alCuestionario={() => setPagina('cuestionario')}
          alDeseos={() => setPagina('deseos')}
          alCatalogo={() => setPagina('catalogo')}
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
          alVolver={() => setPagina('catalogo')}
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
            void api.yo().then(setUsuario);
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
