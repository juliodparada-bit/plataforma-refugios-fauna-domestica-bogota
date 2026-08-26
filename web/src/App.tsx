import { FormEvent, useEffect, useState } from 'react';
import { AltaAnimal } from './AltaAnimal';
import { api, type Localidad, type Rol, type Usuario } from './api';
import { CuentasEjemplo } from './CuentasEjemplo';
import { Catalogo } from './Catalogo';
import { ColaValidador } from './ColaValidador';
import { Cuestionario } from './Cuestionario';
import { DeseosEntidad } from './DeseosEntidad';
import { Legal, PieLegal, type DocLegal } from './Legal';
import { MisPostulaciones } from './MisPostulaciones';
import { PerfilAnimal } from './PerfilAnimal';
import { PerfilEntidad } from './PerfilEntidad';
import { TableroPostulaciones } from './TableroPostulaciones';
import { VerificacionEntidad } from './VerificacionEntidad';

type Pagina =
  | 'catalogo'
  | 'registro'
  | 'entrar'
  | 'tablero'
  | 'verificacion'
  | 'cola'
  | 'animal'
  | 'entidadPub'
  | 'alta'
  | 'postulaciones'
  | 'cuestionario'
  | 'deseos'
  | 'misPostulaciones';

export function App() {
  const [pagina, setPagina] = useState<Pagina>('catalogo');
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [seleccion, setSeleccion] = useState<string | null>(null);
  const [docLegal, setDocLegal] = useState<DocLegal | null>(null);

  useEffect(() => {
    api
      .yo()
      .then((u) => {
        setUsuario(u);
      })
      .catch(() => setUsuario(null))
      .finally(() => setCargando(false));
  }, []);

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
      <div className="marco">
        <main className="hoja hoja-carga">
          <p className="ojo">Refugios Bogotá</p>
          <h1>Un cupo libre es un rescate que sí cabe.</h1>
          <p>Cargando el catálogo…</p>
        </main>
      </div>
    );
  }

  return (
    <>
    <div className="marco">
      <header className="barra">
        <button type="button" className="marca" onClick={() => setPagina('catalogo')}>
          Refugios Bogotá
          <span>Adopción con sello · insumos con bitácora</span>
        </button>
        <MenuRol
          clase="menu-escritorio"
          pagina={pagina}
          usuario={usuario}
          alIr={setPagina}
          alSalir={() => void salir()}
        />
      </header>

      <div className="cuerpo">

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

      {pagina === 'verificacion' && usuario && (
        <VerificacionEntidad
          usuario={usuario}
          alVolver={() => setPagina('tablero')}
          alActualizar={setUsuario}
        />
      )}

      {pagina === 'cola' && usuario && (
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

      {pagina === 'alta' && usuario && (
        <AltaAnimal
          usuario={usuario}
          alVolver={() => setPagina('tablero')}
          alListo={(id) => {
            setSeleccion(id);
            setPagina('animal');
          }}
        />
      )}

      {pagina === 'postulaciones' && usuario && (
        <TableroPostulaciones alVolver={() => setPagina('tablero')} />
      )}

      {pagina === 'cuestionario' && usuario && (
        <Cuestionario
          alVolver={() => setPagina('tablero')}
          alListo={() => {
            void api.yo().then(setUsuario);
            setPagina('catalogo');
          }}
        />
      )}

      {pagina === 'deseos' && usuario && (
        <DeseosEntidad usuario={usuario} alVolver={() => setPagina('tablero')} />
      )}

      {pagina === 'misPostulaciones' && usuario && (
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
      <div className="capa-legal">
        <Legal doc={docLegal} alVolver={() => setDocLegal(null)} />
      </div>
    )}
    </>
  );
}

function Registro({
  alListo,
  alTerminos,
  alDatos,
}: {
  alListo: (u: Usuario) => void;
  alTerminos: () => void;
  alDatos: () => void;
}) {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [rol, setRol] = useState<Exclude<Rol, 'validador'> | ''>('');
  const [terminosOk, setTerminosOk] = useState(false);
  const [datosOk, setDatosOk] = useState(false);

  useEffect(() => {
    api.localidades().then(setLocalidades).catch(() => setError('No pude cargar las localidades.'));
  }, []);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const datos = new FormData(e.currentTarget);
    const consentimiento = datos.get('consentimiento') === 'on';
    const terminos = datos.get('terminos') === 'on';
    if (!consentimiento || !terminos) {
      setError('Debes aceptar los términos y el tratamiento de datos personales.');
      return;
    }
    setEnviando(true);
    try {
      const { usuario } = await api.registro({
        nombre: String(datos.get('nombre')),
        correo: String(datos.get('correo')),
        contrasena: String(datos.get('contrasena')),
        localidadId: String(datos.get('localidadId')),
        rol: String(datos.get('rol')) as Exclude<Rol, 'validador'>,
        consentimientoDatos: true,
      });
      alListo(usuario);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="hoja">
      <section className="hero hero-corto">
        <p className="ojo">Un hogar o un bulto, no un monto a ciegas</p>
        <h1>Crea tu cuenta y libera un cupo.</h1>
        <p className="lema">Sin recaudo. Sin raza como filtro. Con sello a la vista.</p>
      </section>
      <p>
        Elige cómo vas a participar. Adoptar, cubrir un ítem o publicar desde un
        refugio verificado: la plataforma no cobra ni intermedia dinero.
      </p>
      <p className="ayuda">
        Si solo quieres ver el prototipo, usa las cuentas de ejemplo en Entrar. No
        son personas ni refugios reales.
      </p>
      <form className="formulario" onSubmit={(e) => void enviar(e)}>
        <label>
          Nombre
          <input name="nombre" required maxLength={120} />
        </label>
        <label>
          Correo
          <input name="correo" type="email" required />
        </label>
        <label>
          Contraseña
          <input name="contrasena" type="password" required minLength={8} />
        </label>
        <label>
          Localidad en Bogotá
          <select name="localidadId" required defaultValue="">
            <option value="" disabled>
              Elige…
            </option>
            {localidades.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>Quiero ser</legend>
          <div className="roles">
            <label className="rol-card">
              <input
                type="radio"
                name="rol"
                value="adoptante"
                required
                onChange={() => setRol('adoptante')}
              />
              <strong>Adoptante</strong>
              <span>Cinco preguntas y un puntaje que sí se explica.</span>
            </label>
            <label className="rol-card">
              <input type="radio" name="rol" value="donante" onChange={() => setRol('donante')} />
              <strong>Donante de insumos</strong>
              <span>Reservas un ítem concreto. Coordinas por WhatsApp.</span>
            </label>
            <label className="rol-card">
              <input type="radio" name="rol" value="entidad" onChange={() => setRol('entidad')} />
              <strong>Entidad / hogar de paso</strong>
              <span>Publicas cuando el sello esté aprobado.</span>
            </label>
          </div>
        </fieldset>
        {rol === 'entidad' && (
          <p className="ayuda">
            Podrás publicar animales e ítems cuando la verificación esté aprobada.
          </p>
        )}
        <aside className="aviso aviso-datos">
          <p>
            Recogemos nombre, correo, localidad y rol para operar la cuenta. La
            contraseña se guarda con hash. Las evidencias de verificación y el
            contacto del donante no son públicos.
          </p>
        </aside>
        <label className="radio">
          <input
            type="checkbox"
            name="terminos"
            checked={terminosOk}
            onChange={(e) => setTerminosOk(e.target.checked)}
          />{' '}
          Acepto los{' '}
          <button type="button" className="enlace" onClick={alTerminos}>
            términos y condiciones
          </button>
        </label>
        <label className="radio">
          <input
            type="checkbox"
            name="consentimiento"
            checked={datosOk}
            onChange={(e) => setDatosOk(e.target.checked)}
          />{' '}
          Autorizo el{' '}
          <button type="button" className="enlace" onClick={alDatos}>
            tratamiento de datos
          </button>{' '}
          (Ley 1581 de 2012)
        </label>
        <p className="ayuda">El rol validador no se crea desde aquí.</p>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primario" disabled={enviando || !terminosOk || !datosOk}>
          {enviando ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>
    </main>
  );
}

function Entrar({
  alListo,
  alRegistro,
  alTerminos,
  alDatos,
}: {
  alListo: (u: Usuario) => void;
  alRegistro: () => void;
  alTerminos: () => void;
  alDatos: () => void;
}) {
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const datos = new FormData(e.currentTarget);
    setEnviando(true);
    try {
      const { usuario } = await api.entrar(
        String(datos.get('correo')),
        String(datos.get('contrasena')),
      );
      alListo(usuario);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Correo o contraseña incorrectos.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="hoja">
      <section className="hero hero-corto">
        <p className="ojo">Sesión</p>
        <h1>Entra y libera un cupo, o cubre un bulto.</h1>
        <p className="lema">Adopta, dona un ítem o gestiona un refugio con sello.</p>
      </section>
      <CuentasEjemplo />
      <form className="formulario" onSubmit={(e) => void enviar(e)}>
        <label>
          Correo
          <input name="correo" type="email" required autoComplete="username" />
        </label>
        <label>
          Contraseña
          <input
            name="contrasena"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primario" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
      <p>
        <button type="button" className="enlace" onClick={alRegistro}>
          Crear cuenta
        </button>
        {' · '}
        <button type="button" className="enlace" onClick={alTerminos}>
          Términos
        </button>
        {' · '}
        <button type="button" className="enlace" onClick={alDatos}>
          Datos personales
        </button>
      </p>
    </main>
  );
}

function Tablero({
  usuario,
  alVerificacion,
  alCola,
  alAlta,
  alPostulaciones,
  alCuestionario,
  alDeseos,
  alCatalogo,
  alMisPostulaciones,
}: {
  usuario: Usuario;
  alVerificacion: () => void;
  alCola: () => void;
  alAlta: () => void;
  alPostulaciones: () => void;
  alCuestionario: () => void;
  alDeseos: () => void;
  alCatalogo: () => void;
  alMisPostulaciones: () => void;
}) {
  return (
    <main className="hoja">
      <section className="hero hero-corto">
        <p className="ojo">{etiquetaRol(usuario.rol)}</p>
        <h1>
          {usuario.rol === 'adoptante' && 'Tu hogar puede encajar con alguien que espera.'}
          {usuario.rol === 'donante' && 'Un ítem concreto llega más lejos que una transferencia libre.'}
          {usuario.rol === 'entidad' && 'Cada entrega es un cupo que se abre.'}
          {usuario.rol === 'validador' && 'El sello se gana con evidencia, no con una visita obligatoria.'}
        </h1>
        <p>Hola, {usuario.nombre}. Localidad: {usuario.localidad}.</p>
      </section>
      {usuario.nombre.startsWith('EJEMPLO') && (
        <aside className="aviso aviso-ejemplo">
          <p>Esta sesión es una cuenta de ejemplo. No corresponde a una persona ni a un refugio real.</p>
        </aside>
      )}

      {usuario.rol === 'entidad' && usuario.entidad && (
        <aside className="aviso aviso-datos">
          {usuario.entidad.puedePublicar ? (
            <p>
              Sello {usuario.entidad.estadoVerificacion === 'nivel_1' ? 'Nivel 1' : 'Nivel 2'}.
              Publica historia y foto; pide insumos sin recaudo.
            </p>
          ) : (
            <p>
              Aún no puedes publicar. Estado:{' '}
              <strong>{usuario.entidad.estadoVerificacion}</strong>.
            </p>
          )}
        </aside>
      )}

      <div className="tablero-grid">
        {usuario.rol === 'entidad' && usuario.entidad && (
          <>
            <button type="button" className="atajo" onClick={alVerificacion}>
              <strong>{usuario.entidad.puedePublicar ? 'Ver sello' : 'Pedir verificación'}</strong>
              <span>Las evidencias solo las ves tú y el validador.</span>
            </button>
            {usuario.entidad.puedePublicar && (
              <>
                <button type="button" className="atajo" onClick={alAlta}>
                  <strong>Publicar un animal</strong>
                  <span>La historia va primero. La raza no filtra el catálogo.</span>
                </button>
                <button type="button" className="atajo" onClick={alPostulaciones}>
                  <strong>Postulaciones</strong>
                  <span>Preselecciona, entrega y suma un cupo.</span>
                </button>
                <button type="button" className="atajo" onClick={alDeseos}>
                  <strong>Lista de deseos</strong>
                  <span>Alimento, medicina o aseo. Sin Nequi.</span>
                </button>
              </>
            )}
          </>
        )}
        {usuario.rol === 'adoptante' && (
          <>
            <button type="button" className="atajo" onClick={alCatalogo}>
              <strong>Ver quién espera</strong>
              <span>Lee la historia. El puntaje te dice si conviven.</span>
            </button>
            <button type="button" className="atajo" onClick={alCuestionario}>
              <strong>{usuario.tienePerfilAdoptante ? 'Editar las 5 preguntas' : 'Responder 5 preguntas'}</strong>
              <span>Vivienda, horas, niños, otros animales y energía.</span>
            </button>
            <button type="button" className="atajo" onClick={alMisPostulaciones}>
              <strong>Mis postulaciones</strong>
              <span>El refugio ve tu puntaje y tus respuestas, no un ranking opaco.</span>
            </button>
          </>
        )}
        {usuario.rol === 'donante' && (
          <button type="button" className="atajo" onClick={alCatalogo}>
            <strong>Ir al catálogo y a un refugio</strong>
            <span>Reserva un bulto o unas pipetas. Tu teléfono no sale en la bitácora.</span>
          </button>
        )}
        {usuario.rol === 'validador' && (
          <button type="button" className="atajo" onClick={alCola}>
            <strong>Abrir la cola</strong>
            <span>Aprueba, rechaza o pide complemento. La visita es opcional.</span>
          </button>
        )}
      </div>
    </main>
  );
}

function etiquetaRol(rol: Rol) {
  switch (rol) {
    case 'adoptante':
      return 'Adoptante';
    case 'donante':
      return 'Donante de insumos';
    case 'entidad':
      return 'Entidad';
    case 'validador':
      return 'Validador';
  }
}

function MenuRol({
  clase,
  pagina,
  usuario,
  alIr,
  alSalir,
}: {
  clase: string;
  pagina: Pagina;
  usuario: Usuario | null;
  alIr: (p: Pagina) => void;
  alSalir: () => void;
}) {
  const activo = (p: Pagina) => (pagina === p ? 'activo' : undefined);
  return (
    <nav className={clase} aria-label="Principal">
      <button type="button" className={activo('catalogo')} onClick={() => alIr('catalogo')}>
        Catálogo
      </button>
      {!usuario && (
        <>
          <button type="button" className={activo('entrar')} onClick={() => alIr('entrar')}>
            Entrar
          </button>
          <button type="button" className={activo('registro')} onClick={() => alIr('registro')}>
            Crear cuenta
          </button>
        </>
      )}
      {usuario?.rol === 'adoptante' && (
        <button
          type="button"
          className={activo('misPostulaciones')}
          onClick={() => alIr('misPostulaciones')}
        >
          Postulaciones
        </button>
      )}
      {usuario?.rol === 'entidad' && (
        <>
          <button
            type="button"
            className={activo('postulaciones')}
            onClick={() => alIr('postulaciones')}
          >
            Postulaciones
          </button>
          <button type="button" className={activo('deseos')} onClick={() => alIr('deseos')}>
            Deseos
          </button>
          {usuario.entidad?.puedePublicar && (
            <button type="button" className={activo('alta')} onClick={() => alIr('alta')}>
              Publicar
            </button>
          )}
        </>
      )}
      {usuario?.rol === 'validador' && (
        <button type="button" className={activo('cola')} onClick={() => alIr('cola')}>
          Cola
        </button>
      )}
      {usuario && (
        <>
          <button type="button" className={activo('tablero')} onClick={() => alIr('tablero')}>
            Cuenta
          </button>
          <button type="button" onClick={alSalir}>
            Salir
          </button>
        </>
      )}
    </nav>
  );
}
