import { ReactNode, useEffect, useMemo, useState } from 'react';
import { NombreMarca, SimboloMarca } from '../componentes/Marca';
import { ESLOGAN } from '../marca';
import './sustentacion.css';

const PARTES = [
  { id: 'indice', label: 'Agenda', bloque: 'Apertura' },
  { id: 'idea', label: 'Idea', bloque: 'Producto' },
  { id: 't6', label: 'T6 y T7', bloque: 'D1' },
  { id: 'jwt', label: 'Nest y JWT', bloque: 'D2' },
  { id: 'arquitectura', label: 'Arquitectura', bloque: 'D2' },
  { id: 'demo', label: 'Demo e2e', bloque: 'D2' },
  { id: 'pruebas', label: 'Pruebas', bloque: 'D3' },
  { id: 'ciclos', label: 'Issues y ciclos', bloque: 'D3' },
  { id: 'docs', label: 'README y API', bloque: 'D4' },
  { id: 'calidad', label: 'Lint y deuda', bloque: 'D5' },
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
    document.title = 'Sustentación T6 · Mestizo';
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
      case 'idea':
        return <Idea />;
      case 't6':
        return <CierreT6 />;
      case 'jwt':
        return <Jwt />;
      case 'arquitectura':
        return <Arquitectura />;
      case 'demo':
        return <DemoViva />;
      case 'pruebas':
        return <Pruebas />;
      case 'ciclos':
        return <Ciclos />;
      case 'docs':
        return <Docs />;
      case 'calidad':
        return <Calidad />;
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
              Sustentación T6 · <NombreMarca />
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
          <p className="guia-kicker">ADSO · SENA · T6 oferta abierta · ficha 3228973 B</p>
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
            Construcción Must HU-01 a HU-11, JWT cookie y Bearer, demo de punta a
            punta, pruebas S1–S4 en main. IoT no aplica. Sin recaudo.
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
        <Stat value="D1" label="Visión T6/T7 y dos retrospectivas de pruebas" />
        <Stat value="D2" label="Nest, JWT, .env, arquitectura, demo. IoT = No" />
        <Stat value="D3–D5" label="Matriz, Postman, issues, README, lint 411" />
      </div>
      <Tabla
        headers={['#', 'Diapositiva', 'Qué califica']}
        rows={[
          ['1', 'Idea', 'Producto real: roles, Bogotá, Flutter companion'],
          ['2', 'T6 y T7', 'D1 — qué cierra este trimestre y qué no'],
          ['3', 'Nest y JWT', 'D2 — 4.º backend, cookie sid + Bearer, .env'],
          ['4', 'Arquitectura', 'D2 — tres puertos, Flutter, IoT No'],
          ['5', 'Demo e2e', 'D2 — recorrido en vivo con la semilla'],
          ['6', 'Pruebas', 'D3 — S1–S4 en main, umbrales de config, Postman'],
          ['7', 'Issues y ciclos', 'D3 — #18–#21 y dos ciclos cerrados'],
          ['8', 'README y API', 'D4 — dónde está cada evidencia'],
          ['9', 'Lint y deuda', 'D5 — 411 errores honestos, sin --fix'],
          ['10', 'Cierre', 'Preguntas. S5/S6 = PR #13 y #14 abiertos'],
        ]}
      />
    </>
  );
}

function Idea() {
  return (
    <>
      <h2>Refugios de fauna doméstica en Bogotá.</h2>
      <Lead>
        <NombreMarca className="es-en-linea" /> verifica un hogar, publica una
        historia, recibe una postulación corta y cubre un ítem concreto. La
        métrica norte es un animal en estado adoptado: un cupo que sí se libera.
      </Lead>
      <Tabla
        headers={['Qué hay hoy', 'Qué no hay']}
        rows={[
          [
            'Roles: visitante, adoptante, donante, entidad, validador',
            'Recaudo, Nequi, pasarela o apadrinamiento en COP',
          ],
          [
            'Web en 5173 (cookie sid) y companion Flutter (Bearer)',
            'Play Store / App Store ni un segundo backend',
          ],
          [
            'Canino y felino, área urbana de Bogotá',
            'IoT, sensores, fauna silvestre o tiendas',
          ],
        ]}
        rowTone={['success', 'success', 'info']}
      />
    </>
  );
}

function CierreT6() {
  return (
    <>
      <h2>Qué cierra T6. Qué se lleva a T7.</h2>
      <Lead>
        En <code className="guia-code">main</code> (
        <code className="guia-code">ccac6b5</code>, merge del PR #17 sobre el
        #11) el Must está construido. No adelantamos S5/S6 a main.
      </Lead>
      <Tabla
        headers={['Cierra T6', 'No cierra T6']}
        rows={[
          ['HU Must 01–11 (módulos 1 a 5)', 'HU Should 12–14: editar animal, recuperar clave, varias fotos'],
          ['JWT: cookie httpOnly sid (web) + Bearer (Flutter)', 'Recaudo, Nequi, pasarela'],
          ['Pruebas S1–S4 en main (PR #6, #7, #9, #11) + umbral API #17', 'S5 y S6: PR #13 y #14 abiertos, no están en main'],
          ['Demo local: Postgres 5433, API 3000, web 5173', 'URL de piloto, Play Store, entrevista de campo'],
          ['IoT = No. Sin sensores ni hardware', 'Bonificación D2 por IoT: no se pide'],
        ]}
        rowTone={['success', 'success', 'warning', 'info', 'neutral']}
      />
      <p className="guia-texto">
        Dos retrospectivas del proceso de pruebas: documento 3.6 (S1–S2 y
        S3–S4). Visión escrita: documento 4.6. Front 75 no se tocó; backend S4
        en main vía #17.
      </p>
    </>
  );
}

function Jwt() {
  return (
    <>
      <h2>4.º backend: Nest arranca. JWT en cookie y en Bearer.</h2>
      <Lead>
        Un proceso NestJS 11. Login y registro responden{' '}
        <code className="guia-code">{'{ token, usuario }'}</code>. La web ignora
        el token del JSON y usa la cookie <code className="guia-code">sid</code>{' '}
        (httpOnly). Flutter guarda el token y lo manda como{' '}
        <code className="guia-code">Authorization: Bearer</code>. Si llegan las
        dos, <code className="guia-code">extraerToken</code> usa la cookie.
      </Lead>
      <Tabla
        headers={['Qué se espera', 'Qué hay en el código']}
        rows={[
          [
            'Arranque desde cero',
            'api/.env.example → .env. DATABASE_URL, JWT_SECRETO, WEB_ORIGEN, PUERTO=3000. npm run prisma:migrate y prisma:seed.',
          ],
          [
            'Validación de entrada',
            'ValidationPipe + DTO (class-validator). Especie distinta de canino/felino → 400.',
          ],
          [
            'GET /auth/yo sin sesión',
            '200 y null (visitante). No 401. Rutas con SesionGuard: 401. Rol incorrecto: 403.',
          ],
          [
            'Cuatro roles en registro; validador en semilla',
            'Adoptante, donante, entidad. El validador no se autoasigna.',
          ],
        ]}
        rowTone={['success', 'success', 'success', 'info']}
      />
    </>
  );
}

function Arquitectura() {
  return (
    <>
      <h2>Dos clientes. Una API. IoT no aplica.</h2>
      <Lead>
        Vite en 5173 llama a Nest en 3000 con el proxy /api hacia 127.0.0.1.
        Flutter pega directo al 3000 con Bearer. Prisma escribe en PostgreSQL
        16, puerto 5433. No hay capa de sensores ni hardware.
      </Lead>
      <Tabla
        headers={['Capa', 'Tecnología', 'Contrato']}
        rows={[
          ['Cliente web', 'React 19 + Vite 6', '5173 · fetch /api con credentials (cookie sid)'],
          ['Companion móvil', 'Flutter 3 (mobile/)', 'Bearer al puerto 3000; misma API; no hay tienda'],
          ['API', 'NestJS 11 + ValidationPipe', '3000 · DTOs con whitelist · JwtService'],
          ['Datos', 'Prisma + PostgreSQL 16', '5433 · schema.prisma = DER del 2.3'],
          ['IoT', 'No aplica', 'El producto no incluye sensores ni hardware'],
        ]}
        rowTone={['success', 'success', 'success', 'success', 'neutral']}
      />
      <p className="guia-texto">
        Diagrama vigente: documento 2.1. Si el centro pidiera Java, Spring
        sustituye a Nest; no cambian las capas ni los RF.
      </p>
    </>
  );
}

function DemoViva() {
  return (
    <>
      <h2>Recorrido de punta a punta en el prototipo.</h2>
      <Lead>
        Salir y entrar con la semilla. En cada paso nombramos la HU. Abrir{' '}
        <a className="guia-enlace" href="/" target="_blank" rel="noreferrer">
          localhost:5173
        </a>
        .
      </Lead>
      <Tabla
        headers={['Paso', 'Cuenta', 'Recorrido', 'HU']}
        rows={[
          ['1', 'adoptante.ejemplo', 'Cinco preguntas. Abre Luna. Puntaje y frase.', '07, 08'],
          ['2', 'entidad.ejemplo', 'Tablero de Luna: preseleccionar o entregar (cupo).', '09'],
          ['3', 'Misma', 'Lista de deseos: ítem pendiente. Sin Nequi.', '10'],
          ['4', 'donante.ejemplo', 'Necesidades → reservar. El teléfono no es público.', '11'],
          ['5', 'entidad.ejemplo', 'Confirma recepción. Bitácora sin cédula.', '11'],
          ['6', 'validador@local.test', 'Cola y evidencias. Rol que no nace en el registro.', '03, 04'],
        ]}
        rowTone={['success', 'success', 'info', 'success', 'info', 'warning']}
      />
      <h3>Cuentas de la semilla</h3>
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

function Pruebas() {
  return (
    <>
      <h2>S1–S4 están en main. S5 y S6 no.</h2>
      <Lead>
        Plan, ambiente separado (tests con dobles, sin Postgres) y matriz de 32
        casos: documento 4.1. Umbrales leídos de los archivos. No se bajan.
      </Lead>
      <Tabla
        headers={['Paquete', 'Archivo', 'Líneas', 'Sentencias', 'Ramas', 'Funciones']}
        rows={[
          ['web', 'web/vite.config.ts', '75', '75', '77', '70 (timeout 20 s)'],
          ['api', 'api/jest.config.cjs', '88', '88', '70', '92'],
        ]}
      />
      <Tabla
        headers={['Semana', 'Dónde está', 'Qué no decir']}
        rows={[
          ['S1–S4', 'main · PR #6, #7, #9, #11 + umbral #17', 'Tratar el PR #5 como cierre de las seis semanas'],
          ['S5 page.route', 'PR #13 abierto', 'Presentarlo como código de main'],
          ['S6 Postgres 5434', 'PR #14 abierto', 'Documentar 5434 como ambiente vigente'],
          ['Postman', 'tests/postman/mestizo-api.postman_collection.json', 'Que sustituye a Jest: no lo hace'],
        ]}
        rowTone={['success', 'warning', 'warning', 'info']}
      />
    </>
  );
}

function Ciclos() {
  return (
    <>
      <h2>Issues #18 a #21. Dos ciclos cerrados en main.</h2>
      <Lead>
        Detectar → corregir → verificar. El tercero vive en el PR #14 y sigue
        abierto. No se fusiona desde este expediente.
      </Lead>
      <Tabla
        headers={['Issue', 'Ciclo', 'Estado']}
        rows={[
          ['#18', 'testTimeout 5 s → 20 s (commit 040b6c4, PR #9)', 'Cerrado en main'],
          ['#19', 'Mutante role="alert": Playwright no encuentra el aviso', 'Cerrado en main'],
          ['#20', 'Avisos act() en paginas.humo. Los tests pasan.', 'Abierto · deuda T6'],
          ['#21', 'Umbral de ramas al límite; tope 80 / 5434 en PR #14', 'Abierto · umbral no se mueve'],
        ]}
        rowTone={['success', 'success', 'warning', 'warning']}
      />
    </>
  );
}

function Docs() {
  return (
    <>
      <h2>Dónde abre el instructor cada evidencia.</h2>
      <Lead>
        README raíz, sección Pruebas. API del 4.º backend: api/README.md.
        Commits de construcción (#6 #7 #9 #11) distintos de umbral/corrección
        (#8 #10 #17 y 040b6c4). El #12 fue el mismo bump a test/semana-04.
      </Lead>
      <Tabla
        headers={['Abrir', 'Para qué']}
        rows={[
          ['README.md · Pruebas', 'Comandos, umbrales de archivo, PRs'],
          ['4.6 cierre T6/T7', 'Visión honesta D1'],
          ['4.1 + 4.1-matriz-casos.md', 'Plan, 32 casos, Postman, reporte'],
          ['tests/postman/…json', 'Colección importable con pm.test'],
          ['3.6 retrospectivas', 'Dos notas sobre el proceso de pruebas'],
          ['4.7 calidad y deuda', 'Lint 411, backends, deuda priorizada'],
          ['2.1 y 3.1', 'Arquitectura y arranque .env'],
        ]}
      />
    </>
  );
}

function Calidad() {
  return (
    <>
      <h2>Lint 411. Sin --fix. Deuda escrita.</h2>
      <Lead>
        Se corrió ESLint del API sin --fix para no reescribir el prototipo.
        Resultado real (25 nov 2026): 411 errors, 9 warnings. Casi todos
        prettier y no-unsafe-*. No se afirma «0 errores».
      </Lead>
      <Tabla
        headers={['Tema', 'Hecho']}
        rows={[
          [
            '4.º backend vs los anteriores',
            'Un Nest, no cuatro APIs. Guards, Prisma y dos transportes del mismo JWT. Si pidieran Java, Spring cambia el lenguaje, no las capas.',
          ],
          [
            'Front',
            'web/ no tiene ESLint. La constancia T6 es Vitest + umbrales de vite.config.ts.',
          ],
          [
            'Deuda T7',
            'HU 12–14; S5/S6 en PR #13 y #14; issue #20 act(); issue #21 umbral estrecho. No se baja cobertura.',
          ],
        ]}
        rowTone={['info', 'neutral', 'warning']}
      />
    </>
  );
}

function Cierre() {
  return (
    <>
      <h2>Must construido. IoT no. Gracias.</h2>
      <Lead>
        Un hogar con sello publica, un adoptante se postula, un donante cubre un
        bulto. <NombreMarca className="es-en-linea" /> no recauda y no tiene
        sensores. S5 y S6 siguen en PR abiertos.
      </Lead>
      <p className="guia-texto">¿Preguntas?</p>
      <Tabla
        headers={['Pregunta', 'Respuesta']}
        rows={[
          ['¿Dónde está Nequi?', 'Fuera de alcance. Categoría, cantidad y unidad. WhatsApp coordina la entrega.'],
          ['¿IoT?', 'No aplica. No hay prototipo de sensores ni bonificación D2.'],
          ['¿Solo cookie?', 'No. Web: cookie sid httpOnly. Flutter: Bearer. Mismo JWT. Cookie gana si hay ambas.'],
          ['¿S5 y S6 ya están?', 'No en main. PR #13 y #14 abiertos. El #16 lo fusiona Brayan.'],
          ['¿Por qué 411 errores de lint?', 'Se midió sin --fix. Son estilo. Arreglarlos en T6 mezclaría formato con producto.'],
          ['¿Se bajaron umbrales?', 'No. web 75/75/77/70 (sin tocar). api 88/88/70/92 = S4 vía #17.'],
        ]}
      />
    </>
  );
}
