import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { api, type Localidad, type TarjetaAnimal } from '../api';
import { etiquetaEspecie, etiquetaSello } from '../etiquetas';
import { SelloFicha } from '../componentes/SelloFicha';
import { esFichaDemo, historiaVisible, marcaDiagonal, nombreVisible } from '../demo';
import { ESLOGAN_HERO } from '../marca';

function EsqueletoTarjeta() {
  return (
    <li className="esqueleto-tarjeta" aria-hidden="true">
      <div className="esqueleto esqueleto-foto" />
      <div className="esqueleto-cuerpo">
        <div className="esqueleto esqueleto-linea" style={{ width: '60%' }} />
        <div className="esqueleto esqueleto-linea" style={{ width: '80%' }} />
        <div className="esqueleto esqueleto-linea" style={{ width: '45%' }} />
      </div>
    </li>
  );
}

const varianteTarjeta = {
  oculta: { opacity: 0, y: 28, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Catalogo({
  alAbrir,
  alEntidad,
  alRegistro,
  mostrarCta,
}: {
  alAbrir: (id: string) => void;
  alEntidad: (id: string) => void;
  alRegistro: () => void;
  mostrarCta: boolean;
}) {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [especie, setEspecie] = useState('');
  const [localidadId, setLocalidadId] = useState('');
  const [items, setItems] = useState<TarjetaAnimal[]>([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const reducirMovimiento = useReducedMotion();

  useEffect(() => {
    void api.localidades().then(setLocalidades);
  }, []);

  useEffect(() => {
    setCargando(true);
    void api
      .catalogo({
        especie: especie || undefined,
        localidadId: localidadId || undefined,
      })
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'No pude cargar el catálogo.'))
      .finally(() => setCargando(false));
  }, [especie, localidadId]);

  return (
    <main className="hoja">
      <section className="hero">
        <div>
          <p className="ojo">Bogotá urbana · perros y gatos</p>
          <h1>Alguien ahí afuera lleva meses esperando que seas tú.</h1>
          <p className="lema">{ESLOGAN_HERO}</p>
          <p>
            Cada historia aquí tiene nombre, tiene energía, tiene una forma de querer.
            Si sientes que puedes sostenerla, ese vínculo ya empezó.
          </p>
        </div>
        <div>
          <div className="cifras">
            <div className="cifra">
              <strong>5</strong>
              <span>preguntas para conocerte, no para juzgarte</span>
            </div>
            <div className="cifra">
              <strong>0</strong>
              <span>pesos entre tú y ese animal</span>
            </div>
            <div className="cifra">
              <strong>+1</strong>
              <span>cupo cada vez que alguien abre su corazón</span>
            </div>
          </div>
          <div className="acciones acciones-fila">
            {mostrarCta && (
              <button type="button" className="primario" onClick={alRegistro}>
                Quiero ser parte de esto
              </button>
            )}
            <button
              type="button"
              className="secundario hero-secundario"
              onClick={() =>
                document.getElementById('lista-espera')?.scrollIntoView({
                  behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                    ? 'auto'
                    : 'smooth',
                })
              }
            >
              Conocer a quien espera
            </button>
          </div>
        </div>
      </section>

      <section className="pasos" aria-label="Cómo participar">
        <p className="ojo">Tres pasos, una vida que cambia</p>
        <h2>Así nace un vínculo que dura para siempre.</h2>
        <ol>
          <li>
            <span>01</span>
            <strong>Lee su historia con el corazón</strong>
            <p>Antes de la foto está la vida. Convivencia primero, raza nunca como filtro.</p>
          </li>
          <li>
            <span>02</span>
            <strong>Da un paso, aunque sea pequeño</strong>
            <p>Cinco preguntas honestas, o un bulto concreto. Cada gesto cuenta.</p>
          </li>
          <li>
            <span>03</span>
            <strong>Alguien llega a casa</strong>
            <p>El refugio cierra la entrega y ese animal deja de esperar. Gracias a ti.</p>
          </li>
        </ol>
      </section>

      <h2 id="lista-espera">Ellos llevan tiempo esperando. Hoy podrías ser tú.</h2>
      <form className="filtros" onSubmit={(e) => e.preventDefault()}>
        <label>
          Especie
          <select value={especie} onChange={(e) => setEspecie(e.target.value)}>
            <option value="">Todas las especies</option>
            <option value="canino">Canino</option>
            <option value="felino">Felino</option>
          </select>
        </label>
        <label>
          Localidad
          <select
            value={localidadId}
            onChange={(e) => setLocalidadId(e.target.value)}
          >
            <option value="">Todas las localidades</option>
            {localidades.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
        </label>
      </form>
      <p className="ayuda">Lee primero la historia. La foto llega después, y el corazón ya supo.</p>
      {error && <p className="error" role="alert">{error}</p>}
      <ul className="lista tarjetas">
        {cargando
          ? Array.from({ length: 6 }).map((_, i) => <EsqueletoTarjeta key={i} />)
          : items.length === 0
          ? (
            <motion.li
              style={{ listStyle: 'none', border: 0, background: 'none', padding: 0, gridColumn: '1/-1' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="vacio">
                <motion.span
                  className="vacio-icono"
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >🐾</motion.span>
                <h3>Pronto habrá alguien esperando</h3>
                <p>Cuando un refugio publique su primera historia, aparece aquí. Tú ya estás listo.</p>
              </div>
            </motion.li>
          )
          : items.map((a, i) => (
            <motion.li
              key={a.id}
              className="tarjeta"
              custom={i}
              variants={varianteTarjeta}
              initial={reducirMovimiento ? false : 'oculta'}
              animate={reducirMovimiento ? false : 'visible'}
              layout={!reducirMovimiento}
            >
              <SelloFicha
                activo={esFichaDemo({ demo: a.demo, nombre: a.nombre, entidadNombre: a.entidadNombre, historia: a.historia })}
                texto={marcaDiagonal(a.nombre)}
              >
              <div className="tarjeta-media">
                {a.fotoUrl ? (
                  <img className="miniatura" src={a.fotoUrl} alt={`Foto de ${nombreVisible(a.nombre)}`} />
                ) : (
                  <div className="miniatura miniatura-vacia" aria-hidden="true" />
                )}
                {a.necesidadEspecial && (
                  <motion.span
                    className="etiqueta etiqueta-flotante"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.07 + 0.3 }}
                  >
                    Necesidad especial
                  </motion.span>
                )}
              </div>
              </SelloFicha>
              <div className="tarjeta-cuerpo">
                <strong className="tarjeta-titulo">{nombreVisible(a.nombre)}</strong>
                <p className="tarjeta-meta">
                  {etiquetaEspecie(a.especie)} · {a.localidad} · {a.edadAprox}
                </p>
                <p className="cita">«{historiaVisible(a.historia)}…»</p>
                <button type="button" className="enlace" onClick={() => alEntidad(a.entidadId)}>
                  <span className="etiqueta etiqueta-sello">{etiquetaSello(a.badge)}</span>{' '}
                  {nombreVisible(a.entidadNombre)}
                </button>
                {a.puntaje != null && (
                  <div className="puntaje">
                    <div className="puntaje-fila">
                      <span className="puntaje-numero">{a.puntaje}</span>
                      <div
                        className="puntaje-barra-cont"
                        role="meter"
                        aria-label="Afinidad"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={a.puntaje}
                      >
                        <motion.div
                          className="puntaje-barra"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(a.puntaje, 100)}%` }}
                          transition={{ delay: i * 0.07 + 0.5, duration: 0.7, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                    <p className="puntaje-frase">{a.fraseExplicable}</p>
                  </div>
                )}
                <div className="acciones">
                  <motion.button
                    type="button"
                    className="primario"
                    onClick={() => alAbrir(a.id)}
                    whileHover={reducirMovimiento ? undefined : { scale: 1.03 }}
                    whileTap={reducirMovimiento ? undefined : { scale: 0.97 }}
                  >
                    Conocer su historia 🐾
                  </motion.button>
                </div>
              </div>
            </motion.li>
          ))
        }
      </ul>
    </main>
  );
}
