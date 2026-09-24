import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { api, type Localidad, type TarjetaAnimal } from '../api';
import { Pagina } from '../componentes/Pagina';
import { historiaVisible, nombreVisible } from '../demo';
import { etiquetaEspecie, etiquetaSello } from '../etiquetas';
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
  oculta: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: Math.min(i, 8) * 0.04, duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export function Catalogo({
  alAbrir,
  alEntidad,
  alRegistro,
  alInicio,
  mostrarCta,
}: {
  alAbrir: (id: string) => void;
  alEntidad: (id: string) => void;
  alRegistro: () => void;
  alInicio: () => void;
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
    void api.localidades().then(setLocalidades).catch(() => undefined);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    setCargando(true);
    setError('');
    void api
      .catalogo(
        {
          especie: especie || undefined,
          localidadId: localidadId || undefined,
        },
        { signal: ac.signal },
      )
      .then((lista) => {
        if (!ac.signal.aborted) setItems(lista);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : 'No pude cargar el catálogo.');
      })
      .finally(() => {
        if (!ac.signal.aborted) setCargando(false);
      });
    return () => ac.abort();
  }, [especie, localidadId]);

  return (
    <Pagina
      kicker="Bogotá urbana · perros y gatos"
      titulo="Catálogo"
      proposito={`${ESLOGAN_HERO} Filtra por especie y localidad. La raza no es un filtro.`}
      acciones={
        mostrarCta ? (
          <p className="aviso-cta">
            <button type="button" className="enlace" onClick={alInicio}>
              Elige cómo participar
            </button>
            <span aria-hidden="true"> · </span>
            <button type="button" className="enlace" onClick={alRegistro}>
              Crear cuenta
            </button>
          </p>
        ) : undefined
      }
    >
      <form className="barra-filtros" onSubmit={(e) => e.preventDefault()} aria-label="Filtros del catálogo">
        <label>
          Especie
          <select value={especie} onChange={(e) => setEspecie(e.target.value)}>
            <option value="">Todas</option>
            <option value="canino">Canino</option>
            <option value="felino">Felino</option>
          </select>
        </label>
        <label>
          Localidad
          <select value={localidadId} onChange={(e) => setLocalidadId(e.target.value)}>
            <option value="">Todas</option>
            {localidades.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
        </label>
      </form>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <ul className="lista tarjetas" aria-label="Animales en espera">
        {cargando ? (
          Array.from({ length: 6 }).map((_, i) => <EsqueletoTarjeta key={i} />)
        ) : items.length === 0 ? (
          <li className="vacio-item">
            <div className="vacio">
              <span className="vacio-icono" aria-hidden="true">
                🐾
              </span>
              <h3>Aún no hay historias publicadas</h3>
              <p>Cuando un refugio publique, aparece aquí.</p>
            </div>
          </li>
        ) : (
          items.map((a, i) => (
            <motion.li
              key={a.id}
              className="tarjeta"
              custom={i}
              variants={varianteTarjeta}
              initial={reducirMovimiento ? false : 'oculta'}
              animate={reducirMovimiento ? false : 'visible'}
              layout={!reducirMovimiento}
            >
              <button type="button" className="tarjeta-abrir" onClick={() => alAbrir(a.id)}>
                <div className="tarjeta-media">
                  {a.fotoUrl ? (
                    <img className="miniatura" src={a.fotoUrl} alt="" />
                  ) : (
                    <div className="miniatura miniatura-vacia" aria-hidden="true" />
                  )}
                  {a.necesidadEspecial && <span className="etiqueta etiqueta-flotante">Necesidad especial</span>}
                </div>
                <div className="tarjeta-cuerpo">
                  <strong className="tarjeta-titulo">{nombreVisible(a.nombre)}</strong>
                  <p className="tarjeta-meta">
                    {etiquetaEspecie(a.especie)} · {a.localidad}
                    {a.edadAprox ? ` · ${a.edadAprox}` : ''}
                  </p>
                  <p className="cita">«{historiaVisible(a.historia)}»</p>
                </div>
              </button>
              <div className="tarjeta-pie">
                <button type="button" className="enlace tarjeta-entidad" onClick={() => alEntidad(a.entidadId)}>
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
                          initial={reducirMovimiento ? false : { width: 0 }}
                          animate={{ width: `${Math.min(a.puntaje, 100)}%` }}
                          transition={{ delay: 0.2, duration: 0.45, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                    {a.fraseExplicable && <p className="puntaje-frase">{a.fraseExplicable}</p>}
                  </div>
                )}
              </div>
            </motion.li>
          ))
        )}
      </ul>
    </Pagina>
  );
}
