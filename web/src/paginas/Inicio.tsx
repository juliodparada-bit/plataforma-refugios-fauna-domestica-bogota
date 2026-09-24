import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Rol } from '../api';
import { Pagina } from '../componentes/Pagina';
import { ESLOGAN_HERO } from '../marca';

export type CaminoGuia = Exclude<Rol, 'validador'>;

type FormaHuella = 'perro' | 'gato';
type Paso = { titulo: string; cuerpo: string };

const CAMINOS: Record<
  CaminoGuia,
  { etiqueta: string; resumen: string; forma: FormaHuella; pasos: Paso[] }
> = {
  adoptante: {
    etiqueta: 'Quiero adoptar',
    resumen: 'Lee una historia, cuenta cómo es tu hogar y postúlate.',
    forma: 'perro',
    pasos: [
      {
        titulo: 'Crea tu cuenta de adoptante',
        cuerpo: 'Regístrate con «Quiero adoptar». Sin cuenta puedes leer el catálogo; para postularte sí hace falta.',
      },
      {
        titulo: 'Cinco preguntas sobre tu hogar',
        cuerpo: 'Vivienda, horas de compañía, niños, otros animales y energía. Sirven para que el encuentro encaje.',
      },
      {
        titulo: 'Elige por convivencia, no por raza',
        cuerpo: 'Filtra por especie y localidad. Lee la historia. Si ya respondiste, verás un puntaje con una frase de por qué coinciden.',
      },
      {
        titulo: 'Postúlate y espera al refugio',
        cuerpo: 'Confirmas mayoría de edad y que vives en Bogotá. El hogar preselecciona o entrega. Al entregar, ese animal deja de esperar.',
      },
    ],
  },
  donante: {
    etiqueta: 'Quiero donar un insumo',
    resumen: 'Reservas alimento, medicina o aseo. Sin Nequi y sin recaudo.',
    forma: 'gato',
    pasos: [
      {
        titulo: 'Crea tu cuenta de donante',
        cuerpo: 'Elige «Quiero donar un insumo». No pedimos tarjeta ni monto: se cubren ítems, no se recauda dinero.',
      },
      {
        titulo: 'Mira qué necesita cada hogar',
        cuerpo: 'Al entrar vas a Necesidades: hogares con sello e ítems pendientes. Entras al perfil para reservar.',
      },
      {
        titulo: 'Reserva un ítem concreto',
        cuerpo: 'Eliges bulto, pipetas o aseo y dejas un contacto solo para coordinar. Ese dato no sale en la bitácora pública.',
      },
      {
        titulo: 'La entidad confirma la recepción',
        cuerpo: 'Cuando el refugio confirma, el ítem queda cubierto. La comunidad ve qué llegó, no quién lo donó.',
      },
    ],
  },
  entidad: {
    etiqueta: 'Tengo un hogar de paso',
    resumen: 'Te verifican, publicas historias y gestionas postulaciones.',
    forma: 'perro',
    pasos: [
      {
        titulo: 'Crea la cuenta del hogar',
        cuerpo: 'Elige «Soy un refugio o hogar de paso». Sin sello no publicas animales ni ítems; el catálogo sí lo ves.',
      },
      {
        titulo: 'Pide la verificación',
        cuerpo: 'Desde Cuenta envías evidencias de Nivel 1 o Nivel 2. Un validador las revisa.',
      },
      {
        titulo: 'Publica historia y foto',
        cuerpo: 'Con el sello cuentas convivencia, energía y necesidad especial. La raza no es el título. También puedes pedir insumos.',
      },
      {
        titulo: 'Resuelve postulaciones y cupo',
        cuerpo: 'Ves el puntaje explicable, preseleccionas o entregas. Al marcar entrega se libera un cupo.',
      },
    ],
  },
};

const CAMINOS_IDS = Object.keys(CAMINOS) as CaminoGuia[];

function useCarruselCompacto() {
  const [compacto, setCompacto] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 1079.98px)').matches : true,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1079.98px)');
    const sync = () => setCompacto(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return compacto;
}

function padsHuella(forma: FormaHuella) {
  if (forma === 'perro') {
    return (
      <>
        <ellipse cx="33" cy="70" rx="21" ry="28" transform="rotate(-33 33 70)" />
        <ellipse cx="73" cy="36" rx="23" ry="30" transform="rotate(-11 73 36)" />
        <ellipse cx="127" cy="36" rx="23" ry="30" transform="rotate(11 127 36)" />
        <ellipse cx="167" cy="70" rx="21" ry="28" transform="rotate(33 167 70)" />
        <path d="M42 108c-19 1-29 19-28 42 2 38 33 66 86 68 53-2 84-30 86-68 1-23-9-41-28-42-19-2-30 18-58 20-28-2-39-22-58-20z" />
      </>
    );
  }
  return (
    <>
      <ellipse cx="45" cy="61" rx="18" ry="20" transform="rotate(-24 45 61)" />
      <ellipse cx="78" cy="37" rx="19" ry="21" transform="rotate(-6 78 37)" />
      <ellipse cx="122" cy="37" rx="19" ry="21" transform="rotate(6 122 37)" />
      <ellipse cx="155" cy="61" rx="18" ry="20" transform="rotate(24 155 61)" />
      <ellipse cx="100" cy="154" rx="74" ry="50" />
    </>
  );
}

function HuellaMarco({ forma }: { forma: FormaHuella }) {
  const uid = useId().replace(/:/g, '');
  const grad = `huella-luz-${uid}`;
  const clip = `huella-clip-${uid}`;
  return (
    <svg className="huella-marco" viewBox="0 0 200 236" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={grad} x1="36%" y1="6%" x2="70%" y2="98%">
          <stop offset="0%" className="huella-grad-a" />
          <stop offset="100%" className="huella-grad-b" />
        </linearGradient>
        <clipPath id={clip}>{padsHuella(forma)}</clipPath>
      </defs>
      <rect className="huella-relleno" width="200" height="236" fill={`url(#${grad})`} clipPath={`url(#${clip})`} />
      <g className="huella-cuerpo" fill={`url(#${grad})`}>
        {padsHuella(forma)}
      </g>
    </svg>
  );
}

export function Inicio({
  yaHaySesion,
  alCatalogo,
  alRegistro,
}: {
  yaHaySesion: boolean;
  alCatalogo: () => void;
  alRegistro: (rol: CaminoGuia) => void;
}) {
  const [camino, setCamino] = useState<CaminoGuia | null>(null);
  const [paso, setPaso] = useState(0);
  const [visible, setVisible] = useState(0);
  const [arrastre, setArrastre] = useState(0);
  const reducir = useReducedMotion();
  const compacto = useCarruselCompacto();
  const ventanaRef = useRef<HTMLDivElement>(null);
  const botonesRef = useRef<Array<HTMLButtonElement | null>>([]);
  const punteroX = useRef<number | null>(null);
  const deslizo = useRef(false);
  const guia = camino ? CAMINOS[camino] : null;
  const total = guia?.pasos.length ?? 0;
  const actual = guia?.pasos[paso];
  const esUltimo = Boolean(guia && paso === total - 1);

  useEffect(() => {
    setPaso(0);
  }, [camino]);

  function irHuella(indice: number, enfocar = false) {
    const siguiente = Math.max(0, Math.min(CAMINOS_IDS.length - 1, indice));
    setVisible(siguiente);
    setArrastre(0);
    if (enfocar) {
      requestAnimationFrame(() => botonesRef.current[siguiente]?.focus());
    }
  }

  function alTecla(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') {
      return;
    }
    const actualFoco = botonesRef.current.findIndex((nodo) => nodo === document.activeElement);
    const desde = actualFoco >= 0 ? actualFoco : visible;
    const dir = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
    const destino = desde + dir;
    if (destino < 0 || destino >= CAMINOS_IDS.length) return;
    e.preventDefault();
    irHuella(destino, true);
  }

  function alPunteroAbajo(e: PointerEvent<HTMLDivElement>) {
    if (!compacto) return;
    punteroX.current = e.clientX;
    deslizo.current = false;
    setArrastre(0);
  }

  function alPunteroMueve(e: PointerEvent<HTMLDivElement>) {
    if (!compacto || punteroX.current == null) return;
    const dx = e.clientX - punteroX.current;
    if (Math.abs(dx) < 10) return;
    deslizo.current = true;
    setArrastre(dx);
  }

  function alPunteroArriba(e: PointerEvent<HTMLDivElement>) {
    if (!compacto || punteroX.current == null) return;
    const dx = e.clientX - punteroX.current;
    punteroX.current = null;
    setArrastre(0);
    if (dx < -48) irHuella(visible + 1);
    else if (dx > 48) irHuella(visible - 1);
  }

  const estiloPista = {
    '--huella-i': compacto ? visible : 0,
    '--huella-drag': `${compacto ? arrastre : 0}px`,
  } as CSSProperties;

  return (
    <Pagina
      className="inicio-guia"
      kicker="Inicio"
      titulo="Elige cómo participar"
      proposito={`${ESLOGAN_HERO} Adoptar, cubrir un insumo o publicar desde un hogar de paso. Sin recaudo. Solo Bogotá urbana, perros y gatos.`}
    >
      <fieldset className="guia-caminos">
        <legend>¿Cómo quieres participar?</legend>
        <div
          className="huellas-carrusel"
          role="region"
          aria-roledescription="carrusel"
          aria-label="Opciones para participar"
          onKeyDown={alTecla}
        >
          <div
            className="huellas-ventana"
            ref={ventanaRef}
            onPointerDown={alPunteroAbajo}
            onPointerMove={alPunteroMueve}
            onPointerUp={alPunteroArriba}
            onPointerCancel={() => {
              punteroX.current = null;
              setArrastre(0);
            }}
          >
            <ul
              className={['huellas-pista', arrastre ? 'es-arrastre' : '', reducir ? 'sin-motion' : '']
                .filter(Boolean)
                .join(' ')}
              style={estiloPista}
            >
              {CAMINOS_IDS.map((id, i) => {
                const c = CAMINOS[id];
                const activo = camino === id;
                const enFoco = !compacto || i === visible;
                return (
                  <li key={id} className={`huella-slide huella-slide-${id}`}>
                    <motion.div
                      className="huella-motion"
                      animate={
                        reducir
                          ? { scale: 1, opacity: 1 }
                          : {
                              scale: activo ? 1.04 : enFoco ? 1 : 0.92,
                              opacity: enFoco ? 1 : 0.42,
                            }
                      }
                      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <button
                        ref={(nodo) => {
                          botonesRef.current[i] = nodo;
                        }}
                        type="button"
                        className={[
                          'huella-card',
                          `huella-card-${id}`,
                          activo ? 'huella-card-activo' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        aria-pressed={activo}
                        onClick={() => {
                          if (deslizo.current) {
                            deslizo.current = false;
                            return;
                          }
                          setVisible(i);
                          setCamino(id);
                        }}
                      >
                        <span className="huella-figura" data-forma={c.forma} data-camino={id}>
                          <HuellaMarco forma={c.forma} />
                          <span className="huella-texto">
                            <strong>{c.etiqueta}</strong>
                          </span>
                        </span>
                        <span className="huella-resumen">{c.resumen}</span>
                      </button>
                    </motion.div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="huellas-controles">
              <button
                type="button"
                className="huella-nav secundario"
                disabled={visible === 0}
                onClick={() => irHuella(visible - 1)}
              >
                Anterior
              </button>
              <div className="huellas-puntos" role="group" aria-label="Ir a una opción">
                {CAMINOS_IDS.map((id, i) => (
                  <button
                    key={id}
                    type="button"
                    className={i === visible ? 'activo' : undefined}
                    aria-current={i === visible ? 'true' : undefined}
                    aria-label={CAMINOS[id].etiqueta}
                    onClick={() => irHuella(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="huella-nav secundario"
                disabled={visible === CAMINOS_IDS.length - 1}
                onClick={() => irHuella(visible + 1)}
              >
                Siguiente
              </button>
            </div>
        </div>
      </fieldset>

      {guia && actual && (
        <motion.section
          className="guia-pasos"
          aria-labelledby="guia-paso-titulo"
          initial={reducir ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          key={camino}
        >
          <p className="ojo">
            {guia.etiqueta} · paso {paso + 1} de {total}
          </p>
          <ol className="guia-puntos" aria-label="Progreso">
            {guia.pasos.map((p, i) => (
              <li key={p.titulo}>
                <button
                  type="button"
                  className={i === paso ? 'activo' : i < paso ? 'hecho' : undefined}
                  aria-current={i === paso ? 'step' : undefined}
                  aria-label={`Paso ${i + 1}: ${p.titulo}`}
                  onClick={() => setPaso(i)}
                />
              </li>
            ))}
          </ol>
          <motion.div
            key={`${camino}-${paso}`}
            className="guia-tarjeta"
            initial={reducir ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="guia-numero" aria-hidden="true">
              {String(paso + 1).padStart(2, '0')}
            </p>
            <h2 id="guia-paso-titulo">{actual.titulo}</h2>
            <p>{actual.cuerpo}</p>
          </motion.div>
          <div className="acciones acciones-fila guia-acciones">
            <button
              type="button"
              className="secundario"
              disabled={paso === 0}
              onClick={() => setPaso((n) => Math.max(0, n - 1))}
            >
              Anterior
            </button>
            {!esUltimo ? (
              <button
                type="button"
                className="primario"
                onClick={() => setPaso((n) => Math.min(total - 1, n + 1))}
              >
                Siguiente
              </button>
            ) : yaHaySesion ? (
              <button type="button" className="primario" onClick={alCatalogo}>
                Ir al catálogo
              </button>
            ) : (
              <button type="button" className="primario" onClick={() => alRegistro(camino!)}>
                Crear cuenta así
              </button>
            )}
          </div>
        </motion.section>
      )}

      <p className="guia-saltar">
        <button type="button" className="enlace" onClick={alCatalogo}>
          Saltar y ver el catálogo
        </button>
      </p>
    </Pagina>
  );
}
