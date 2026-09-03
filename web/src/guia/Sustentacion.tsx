import { ReactNode, useEffect, useMemo, useState } from 'react';
import { NombreMarca, SimboloMarca } from '../componentes/Marca';
import { ESLOGAN } from '../marca';
import './sustentacion.css';

const PARTES = [
  { id: 'indice', label: 'Agenda', bloque: 'Apertura' },
  { id: 'stack', label: 'Tecnologías', bloque: 'Stack' },
  { id: 'idea', label: 'Idea', bloque: 'Producto' },
  { id: 'login', label: 'Login y cookie', bloque: 'Seguridad' },
  { id: 'jwt', label: 'JWT', bloque: 'Seguridad' },
  { id: 'roles', label: 'Roles', bloque: 'Seguridad' },
  { id: 'datos', label: 'Datos', bloque: 'Seguridad' },
  { id: 'arquitectura', label: 'Arquitectura', bloque: 'Integración' },
  { id: 'cruds', label: 'Cinco CRUDs', bloque: 'Integración' },
  { id: 'demo', label: 'Demo en vivo', bloque: 'Integración' },
  { id: 'agil', label: 'Historias', bloque: 'Ágil y Git' },
  { id: 'git', label: 'Git y README', bloque: 'Ágil y Git' },
  { id: 'cierre', label: 'Cierre', bloque: 'Cierre' },
] as const;

const PRESENTAN = [
  { nombre: 'Julio David Parada León', detalle: 'ADSO · ficha 3228973 B' },
  { nombre: 'Brayan Alejandro Sánchez', detalle: 'ADSO · ficha 3228973 B' },
];

type ParteId = (typeof PARTES)[number]['id'];
type TonoFila = 'success' | 'info' | 'warning' | 'neutral';

function leerHash(): ParteId {
  const id = window.location.hash.replace(/^#/, '');
  return PARTES.some((p) => p.id === id) ? (id as ParteId) : 'indice';
}

function Tabla({
  headers,
  rows,
  rowTone,
}: {
  headers: string[];
  rows: string[][];
  rowTone?: TonoFila[];
}) {
  return (
    <div className="guia-tabla-wrap">
      <table className="guia-tabla">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className={rowTone?.[i] ? `guia-fila--${rowTone[i]}` : undefined}
            >
              {row.map((celda, j) => (
                <td key={j}>{celda}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="guia-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Lead({ children }: { children: ReactNode }) {
  return <p className="guia-lead">{children}</p>;
}

export function Sustentacion() {
  const [parte, setParte] = useState<ParteId>(leerHash);
  const idx = Math.max(
    0,
    PARTES.findIndex((p) => p.id === parte),
  );
  const actual = PARTES[idx] ?? PARTES[0];
  const siguiente = PARTES[idx + 1];
  const progreso = ((idx + 1) / PARTES.length) * 100;

  useEffect(() => {
    document.title = 'Sustentación · Mestizo';
    document.body.dataset.guia = '1';
    return () => {
      delete document.body.dataset.guia;
    };
  }, []);

  useEffect(() => {
    const hash = `#${parte}`;
    if (window.location.hash !== hash) {
      window.history.replaceState(null, '', `/sustentacion${hash}`);
    }
  }, [parte]);

  useEffect(() => {
    function onHash() {
      setParte(leerHash());
    }
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  function ir(delta: number) {
    const next = Math.min(PARTES.length - 1, Math.max(0, idx + delta));
    setParte(PARTES[next].id);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        ir(1);
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        ir(-1);
      }
      if (e.key === 'Home') {
        e.preventDefault();
        setParte('indice');
      }
      if (e.key === 'End') {
        e.preventDefault();
        setParte('cierre');
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx]);

  const cuerpo = useMemo(() => {
    switch (actual.id) {
      case 'indice':
        return <Indice />;
      case 'stack':
        return <StackTecnologico />;
      case 'idea':
        return <Idea />;
      case 'login':
        return <Login />;
      case 'jwt':
        return <Jwt />;
      case 'roles':
        return <Roles />;
      case 'datos':
        return <Datos />;
      case 'arquitectura':
        return <Arquitectura />;
      case 'cruds':
        return <Cruds />;
      case 'demo':
        return <DemoViva />;
      case 'agil':
        return <Agil />;
      case 'git':
        return <Git />;
      case 'cierre':
        return <Cierre />;
    }
  }, [actual.id]);

  return (
    <div className="guia">
      <div className="guia-progreso" aria-hidden="true">
        <span style={{ width: `${progreso}%` }} />
      </div>
      <header className="guia-tope">
        <div className="guia-tope-fila">
          <div>
            <h1 className="guia-marca">
              Sustentación · <NombreMarca />
            </h1>
            <div className="guia-equipo">
              {PRESENTAN.map((p) => (
                <span className="guia-persona" key={p.nombre}>
                  <strong>{p.nombre}</strong>
                  <span>{p.detalle}</span>
                </span>
              ))}
            </div>
            <p className="guia-atajo">
              Flechas del teclado ·{' '}
              <a className="guia-enlace" href="/" target="_blank" rel="noreferrer">
                Abrir el prototipo
              </a>
            </p>
          </div>
          <div className="guia-avance">
            <span className="guia-pildora es-bloque">{actual.bloque}</span>
            <span className="guia-meta">
              {idx + 1} / {PARTES.length}
              {siguiente ? ` · ${siguiente.label}` : ' · cierre'}
            </span>
            <button
              type="button"
              className="guia-boton"
              disabled={idx === 0}
              onClick={() => ir(-1)}
            >
              Anterior
            </button>
            <button
              type="button"
              className="guia-boton es-primario"
              disabled={idx === PARTES.length - 1}
              onClick={() => ir(1)}
            >
              Siguiente
            </button>
          </div>
        </div>
        <nav className="guia-pildoras" aria-label="Diapositivas">
          {PARTES.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`guia-pildora${p.id === actual.id ? ' es-activa' : ''}`}
              onClick={() => setParte(p.id)}
            >
              {p.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="guia-cuerpo" key={actual.id}>
        {cuerpo}
      </main>
    </div>
  );
}

function Indice() {
  return (
    <>
      <div className="guia-portada">
        <div className="guia-portada-copy">
          <p className="guia-kicker">ADSO · SENA · ficha 3228973 B</p>
          <div className="guia-portada-marca">
            <SimboloMarca tamano={56} />
            <div>
              <h2>
                <NombreMarca />
              </h2>
              <p className="guia-eslogan">{ESLOGAN}</p>
            </div>
          </div>
          <Lead>
            Plataforma web para adoptar por convivencia, cubrir un ítem concreto
            y gestionar un refugio con sello. Sin recaudo. Sin Nequi. Un cupo
            liberado es la métrica que nos importa.
          </Lead>
        </div>
        <div className="guia-presentan">
          {PRESENTAN.map((p) => (
            <article className="guia-presenta" key={p.nombre}>
              <p>Presenta</p>
              <strong>{p.nombre}</strong>
              <p>{p.detalle}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="guia-stats">
        <Stat value="01" label="Seguridad y control de acceso" />
        <Stat value="02" label="Arquitectura, integración y CRUDs" />
        <Stat value="03" label="Historias, Git y cierre" />
      </div>
      <Tabla
        headers={['#', 'Diapositiva', 'Qué vamos a mostrar']}
        rows={[
          ['1', 'Tecnologías', 'Front, API, datos y por qué cada pieza'],
          ['2', 'Idea', 'El problema, el alcance y lo que no hacemos'],
          ['3', 'Login y cookie', 'Sesión real con cookie httpOnly'],
          ['4', 'JWT', 'Token firmado que el JavaScript no lee'],
          ['5', 'Roles', 'El menú cambia y el servidor también niega'],
          ['6', 'Datos', 'Hash, Ley 1581 y bitácora sin datos del donante'],
          ['7', 'Arquitectura', 'React, Nest y Postgres hablando por HTTP'],
          ['8', 'Cinco CRUDs', 'Cinco entidades persistidas, no solo lectura'],
          ['9', 'Demo en vivo', 'Flujos de punta a punta'],
          ['10', 'Historias', 'Como / quiero / para, trazadas a requisitos'],
          ['11', 'Git y README', 'Repositorio, instalación y entorno'],
          ['12', 'Cierre', 'Una frase de producto y preguntas'],
        ]}
      />
    </>
  );
}

function StackTecnologico() {
  return (
    <>
      <h2>Tres capas. Un prototipo.</h2>
      <Lead>
        El usuario entra por el navegador. React habla en JSON con NestJS. Nest
        aplica las reglas —especie, roles, puntaje, estados— y Prisma escribe en
        PostgreSQL. TypeScript está en las dos puntas. Si el centro pidiera Java,
        cambiaría el lenguaje, no las capas ni los requisitos.
      </Lead>
      <h3>Frontend</h3>
      <Tabla
        headers={['Pieza', 'Tecnología', 'Por qué la elegimos']}
        rows={[
          [
            'Interfaz',
            'React (SPA)',
            'Un solo cliente para visitante, adoptante, donante, entidad y validador. El enlace de WhatsApp abre una URL, no una tienda.',
          ],
          [
            'Build',
            'Vite',
            'Arranque local rápido y proxy /api hacia Nest. En desarrollo el navegador ve un solo origen.',
          ],
          [
            'Lenguaje',
            'TypeScript',
            'El mismo contrato de roles y DTOs que la API.',
          ],
        ]}
      />
      <h3>Backend</h3>
      <Tabla
        headers={['Pieza', 'Tecnología', 'Por qué la elegimos']}
        rows={[
          [
            'Runtime',
            'Node.js',
            'Un runtime para el cliente de desarrollo y la API.',
          ],
          [
            'Framework',
            'NestJS',
            'Módulos que copian el dominio. Los guards de sesión y rol viven en el servidor.',
          ],
          [
            'Validación',
            'class-validator',
            'Si alguien fuerza una especie que no es canino o felino, el DTO responde 400. El select del front no basta.',
          ],
          [
            'Puntaje',
            'Reglas en TypeScript',
            'Cinco respuestas, un número y una frase. No hay machine learning.',
          ],
        ]}
      />
      <h3>Datos, archivos e identidad</h3>
      <Tabla
        headers={['Pieza', 'Tecnología', 'Por qué la elegimos']}
        rows={[
          [
            'Base de datos',
            'PostgreSQL 16',
            'Relaciones reales: estado del animal, postulación, especie cerrada. No Mongo “por probar”.',
          ],
          [
            'Mapeo',
            'Prisma',
            'El schema es el DER en el repo. Las migraciones viajan con Git.',
          ],
          [
            'Archivos',
            'Disco local',
            'Fotos y evidencias. No son listables sin sesión.',
          ],
          [
            'Sesión',
            'JWT en cookie httpOnly',
            'El token va firmado. El JS no lo lee. bcryptjs hashea la contraseña.',
          ],
        ]}
      />
      <h3>Lo que dejamos fuera</h3>
      <Tabla
        headers={['Pieza', 'Decisión', 'Motivo']}
        rows={[
          ['Pagos', 'Ninguno', 'Ítem, cantidad y unidad. Una pasarela contradice el alcance.'],
          ['App nativa', 'Ninguna en este incremento', 'Un cliente web. Si mañana hay app, consume esta API.'],
          ['Contenedor', 'Docker / Podman', 'El mismo Postgres en el puerto 5433.'],
        ]}
      />
    </>
  );
}

function Idea() {
  return (
    <>
      <h2>Un cupo libre es un rescate que sí cabe.</h2>
      <Lead>
        Somos Julio David Parada León y Brayan Alejandro Sánchez, tecnólogo ADSO,
        ficha 3228973 B. Construimos <NombreMarca className="es-en-linea" />: una plataforma web para refugios y
        hogares de paso de perros y gatos en el área urbana de Bogotá.
      </Lead>
      <p className="guia-texto">
        Hay tres formas de participar: adoptar con un cuestionario corto, donar
        un ítem concreto —alimento, medicina o aseo— o gestionar un refugio
        cuando el sello de verificación está aprobado. La métrica norte no es un
        like ni un monto: es un animal que pasa a estado adoptado. La plataforma
        no recauda: no hay Nequi, no hay pasarela, no hay apadrinamiento en COP.
      </p>
      <div className="guia-stats">
        <Stat value="Canino y felino" label="Alcance de especie, como el requisito" />
        <Stat value="Sin recaudo" label="El dinero se coordina por WhatsApp" />
        <Stat value={<NombreMarca />} label="Marca del producto; el nombre académico no cambia" />
      </div>
    </>
  );
}

function Login() {
  return (
    <>
      <h2>La puerta de acceso es real.</h2>
      <Lead>
        Entramos con un adoptante de demostración. El servidor autentica, firma
        un JWT y lo entrega en una cookie httpOnly llamada <code className="guia-code">sid</code>.
        El JavaScript del cliente no puede leerla. Cada petición autenticada sale
        con credentials: el navegador adjunta la cookie solo a nuestro origen.
      </Lead>
      <p className="guia-texto">
        El cuerpo de la respuesta no trae el token en JSON: trae el usuario. El
        secreto viaja en <code className="guia-code">Set-Cookie</code>.
      </p>
      <Tabla
        headers={['Dato', 'Valor en la demo']}
        rows={[
          ['Correo', 'adoptante.ejemplo@local.test'],
          ['Contraseña', 'EjemploLocal123'],
          ['Cookie', 'sid · httpOnly · SameSite=Lax'],
          ['Payload del JWT', 'sub (id de usuario) y rol'],
        ]}
      />
    </>
  );
}

function Jwt() {
  return (
    <>
      <h2>JWT donde el frontend no lo toca.</h2>
      <Lead>
        El token lo firma Nest con <code className="guia-code">JwtService</code> y{' '}
        <code className="guia-code">JWT_SECRETO</code>. El transporte no es un
        Bearer que el cliente arme a mano: es la cabecera{' '}
        <code className="guia-code">Cookie</code>. Un script inyectado no lee
        httpOnly; sí podría leer localStorage.
      </Lead>
      <Tabla
        headers={['Qué se espera', 'Qué hicimos']}
        rows={[
          [
            'El login produce un token',
            'Se firma el JWT; el cliente recibe el usuario, no el string.',
          ],
          [
            'Almacenamiento seguro',
            'Cookie sid httpOnly y SameSite Lax. No está en localStorage.',
          ],
          [
            'Viaja en cabeceras protegidas',
            'El navegador manda Cookie: sid=… en cada fetch.',
          ],
          [
            'Guards',
            'Sin cookie válida: 401. Rol incorrecto: 403.',
          ],
        ]}
        rowTone={['success', 'success', 'info', 'success']}
      />
    </>
  );
}

function Roles() {
  return (
    <>
      <h2>El menú cambia. El servidor también niega.</h2>
      <Lead>
        Cuatro roles. Adoptante, donante y entidad se eligen al registrarse. El
        validador no se autoasigna: sale de la semilla. Cada operación sensible
        lleva SesionGuard y RolesGuard. Un adoptante que dispare POST /animales
        recibe 403 aunque pinte un botón a mano.
      </Lead>
      <Tabla
        headers={['Rol', 'Puede', 'El servidor le niega']}
        rows={[
          ['adoptante', 'Cinco preguntas y postularse', 'Publicar animal, cola, confirmar insumo'],
          ['donante', 'Reservar un ítem y dejar contacto privado', 'Publicar animal y resolver postulaciones'],
          ['entidad sin sello', 'Pedir verificación', 'POST /animales y POST /deseos'],
          ['entidad Nivel 1 o 2', 'Publicar, resolver postulaciones, confirmar ítem', 'Aprobar su propio sello'],
          ['validador', 'Cola, evidencias, aprobar o pedir complemento', 'Publicar animales'],
        ]}
      />
    </>
  );
}

function Datos() {
  return (
    <>
      <h2>Los datos sensibles no viajan en claro.</h2>
      <Lead>
        La contraseña se guarda con hash (bcryptjs, costo 12). Si el login
        falla, el mensaje es el mismo aunque el correo no exista. Al crear
        cuenta hay dos casillas obligatorias: términos y tratamiento de datos
        (Ley 1581). Sin ellas no hay INSERT.
      </Lead>
      <p className="guia-texto">
        Las evidencias de RUT o Cámara no salen en el catálogo. La bitácora
        pública muestra ítem, cantidad y fecha: no el teléfono del donante.
      </p>
      <div className="guia-stats">
        <Stat value="hash + sal" label="Contraseña" />
        <Stat value="401 genérico" label="No revela si el correo existe" />
        <Stat value="Ley 1581" label="Consentimiento o no hay cuenta" />
      </div>
    </>
  );
}

function Arquitectura() {
  return (
    <>
      <h2>React, Nest y Postgres en tres puertos.</h2>
      <Lead>
        Un solo cliente web, pensado para celular. Vite en 5173 llama a Nest en
        3000 con el proxy /api. Prisma persiste en PostgreSQL, puerto 5433. CORS
        admite solo el origen del cliente y viaja con credentials: si no, la
        cookie de sesión no cruza.
      </Lead>
      <Tabla
        headers={['Capa', 'Tecnología', 'Contrato']}
        rows={[
          ['Cliente', 'React + Vite', '5173 · fetch /api con credentials'],
          ['API', 'NestJS + ValidationPipe', '3000 · DTOs con whitelist'],
          ['Datos', 'Prisma + PostgreSQL 16', '5433 · migraciones en git'],
        ]}
      />
    </>
  );
}

function Cruds() {
  return (
    <>
      <h2>Cinco entidades que sí se persisten.</h2>
      <Lead>
        En este dominio casi no borramos filas: el animal pasa de publicado a
        reservado y a adoptado. Eso es un Update de estado. El cierre es
        rechazar, caducar una reserva o invalidar la sesión.
      </Lead>
      <Tabla
        headers={['#', 'Entidad', 'Crear', 'Leer', 'Actualizar', 'Cierre']}
        rows={[
          ['1', 'Usuario y sesión', 'POST /auth/registro', 'GET /auth/yo', '—', 'POST /auth/salir borra la cookie'],
          ['2', 'Perfil adoptante', 'PUT /perfil', 'GET /perfil', 'Editar las 5 preguntas', 'Se corrige, no se borra'],
          ['3', 'Animal', 'POST /animales con foto', 'GET /animales y GET /:id', 'Estado al resolver postulaciones', 'Archivar queda fuera del Must'],
          ['4', 'Postulación', 'POST .../postulaciones', 'GET mías y las de la entidad', 'POST .../resolver', 'Rechazar o entregar (cupo +1)'],
          ['5', 'Deseo y reserva', 'POST /deseos y reservar', 'GET públicos y míos', 'Confirmar recepción', 'A los 7 días vuelve a pendiente'],
        ]}
        rowTone={['success', 'success', 'success', 'success', 'success']}
      />
      <p className="guia-texto">
        La verificación es un flujo extra —solicitud, cola, aprobar o
        complemento— para explicar el sello, no para inflar el conteo.
      </p>
    </>
  );
}

function DemoViva() {
  return (
    <>
      <h2>Recorrido en el prototipo.</h2>
      <Lead>
        Cambiamos de cuenta con Salir. La semilla ya dejó cada rol listo. En
        cada paso nombramos el CRUD que estamos tocando.
      </Lead>
      <Tabla
        headers={['Paso', 'Cuenta', 'Recorrido', 'Qué se ve']}
        rows={[
          ['1', 'adoptante.ejemplo', 'Edita una de las cinco preguntas. Abre Mis postulaciones.', 'Perfil y lectura de postulaciones'],
          ['2', 'Misma', 'Abre Luna. Puntaje y frase. No volvemos a postular si ya está enviada.', 'El puntaje se explica'],
          ['3', 'entidad.ejemplo', 'Tablero de Luna: abrir, preseleccionar, entregar.', 'Entregar = animal adoptado = cupo'],
          ['4', 'Misma', 'Lista de deseos: el ítem pendiente.', 'CRUD de deseos, lado entidad'],
          ['5', 'donante.ejemplo', 'Perfil público. Reserva el ítem. El contacto no es público.', 'Crear reserva'],
          ['6', 'entidad.ejemplo', 'Confirma recepción o bitácora de la semilla.', 'Sin cédula ni teléfono'],
          ['7', 'validador@local.test', 'Cola y evidencias.', 'Rol que no nace en el registro'],
        ]}
        rowTone={['success', 'info', 'success', 'neutral', 'success', 'info', 'warning']}
      />
      <h3>Cuentas de demostración</h3>
      <Tabla
        headers={['Rol', 'Correo', 'Contraseña']}
        rows={[
          ['Adoptante', 'adoptante.ejemplo@local.test', 'EjemploLocal123'],
          ['Entidad Nivel 1', 'entidad.ejemplo@local.test', 'EjemploLocal123'],
          ['Donante', 'donante.ejemplo@local.test', 'EjemploLocal123'],
          ['Validador', 'validador@local.test', 'CambiaEsto123'],
        ]}
      />
    </>
  );
}

function Agil() {
  return (
    <>
      <h2>Historias en formato Como / quiero / para.</h2>
      <Lead>
        El tablero es el product backlog del documento 1.3. Cada historia Must
        tiene rol, característica, razón y criterios de aceptación, trazados a
        un requisito del IEEE 830. Las once Must de este incremento están
        construidas.
      </Lead>
      <div className="guia-stats">
        <Stat value="11" label="HU Must del incremento" />
        <Stat value="21" label="RF Must cubiertos en código" />
        <Stat value="1.3" label="Fuente del tablero" />
      </div>
      <Tabla
        headers={['Historia', 'Como', 'Quiero', 'Estado']}
        rows={[
          ['HU-01', 'visitante', 'crear cuenta con rol y consentimiento', 'Hecha'],
          ['HU-02', 'usuario', 'entrar y salir con sesión', 'Hecha'],
          ['HU-03 y 04', 'entidad y validador', 'pedir y resolver el sello', 'Hecha'],
          ['HU-05 y 06', 'entidad y visitante', 'publicar y ver el catálogo', 'Hecha'],
          ['HU-07 a 09', 'adoptante y entidad', 'puntaje, postular y entregar', 'Hecha'],
          ['HU-10 y 11', 'entidad y donante', 'ítem concreto y bitácora', 'Hecha'],
        ]}
        rowTone={['success', 'success', 'success', 'success', 'success', 'success']}
      />
      <p className="guia-texto">
        Quedó fuera a propósito, como Should: varias fotos, recuperar
        contraseña y editar o archivar el animal.
      </p>
    </>
  );
}

function Git() {
  return (
    <>
      <h2>El código está en GitHub.</h2>
      <Lead>
        Repositorio público, rama main. El README indica cómo levantar Postgres,
        la API y el cliente. Existe <code className="guia-code">api/.env.example</code> con
        DATABASE_URL, JWT_SECRETO y WEB_ORIGEN: los secretos reales no se suben.
      </Lead>
      <p className="guia-texto">
        Organizamos el trabajo por módulos del expediente: identidad,
        verificación, catálogo, postulaciones y deseos.
      </p>
      <article className="guia-tarjeta">
        <header>
          juliodparada-bit/plataforma-refugios-fauna-domestica-bogota
          <span className="guia-sello">público</span>
        </header>
        <p>
          README + documento 3.1 = instalación. compose.yml para PostgreSQL 16.
          Cookie de sesión sid. No hay claves de pago porque no hay recaudo.
        </p>
      </article>
    </>
  );
}

function Cierre() {
  return (
    <>
      <h2>Un cupo. Gracias.</h2>
      <Lead>
        Un refugio verificado publica una historia, un adoptante se postula con
        cinco respuestas, un donante cubre un bulto, y cuando hay entrega real
        se abre un cupo. <NombreMarca className="es-en-linea" /> no recauda.
      </Lead>
      <p className="guia-texto">¿Preguntas?</p>
      <h3>Si profundizamos</h3>
      <Tabla
        headers={['Pregunta', 'Nuestra respuesta']}
        rows={[
          [
            '¿Dónde está Nequi?',
            'Fuera de alcance. Categoría, cantidad y unidad. El dinero se coordina por WhatsApp.',
          ],
          [
            '¿Por qué cookie y no Bearer?',
            'El JWT existe. El transporte es httpOnly. El cliente no guarda el token.',
          ],
          [
            '¿El puntaje es machine learning?',
            'No. Cinco reglas y una frase.',
          ],
          [
            '¿Es un producto del IDPYBA?',
            'No. Prototipo formativo. El sello lo pone el rol validador del piloto.',
          ],
          [
            '¿Dónde está el delete del animal?',
            'Should. El Must cierra con estados: reservado, adoptado, rechazado.',
          ],
        ]}
      />
    </>
  );
}
