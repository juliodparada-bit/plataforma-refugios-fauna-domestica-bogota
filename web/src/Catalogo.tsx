import { useEffect, useState } from 'react';
import { api, type Localidad, type TarjetaAnimal } from './api';

const BADGE: Record<string, string> = {
  nivel_1: 'Sello Nivel 1',
  nivel_2: 'Sello Nivel 2',
  en_revision: 'En revisión',
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

  useEffect(() => {
    void api.localidades().then(setLocalidades);
  }, []);

  useEffect(() => {
    void api
      .catalogo({
        especie: especie || undefined,
        localidadId: localidadId || undefined,
      })
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'No pude cargar el catálogo.'));
  }, [especie, localidadId]);

  return (
    <main className="hoja">
      <section className="hero">
        <div>
          <p className="ojo">Bogotá urbana · perros y gatos</p>
          <h1>Un cupo libre es un rescate que sí cabe.</h1>
          <p className="lema">Adopta por convivencia, no por raza.</p>
          <p>
            Historias primero. Sello de la entidad a la vista. Insumos concretos,
            nunca un Nequi. Si puedes sostener la energía de ese animal, postúlate.
          </p>
        </div>
        <div>
          <div className="cifras">
            <div className="cifra">
              <strong>5</strong>
              <span>preguntas, no un formulario-auditoría</span>
            </div>
            <div className="cifra">
              <strong>0</strong>
              <span>pesos recaudados por la plataforma</span>
            </div>
            <div className="cifra">
              <strong>+1</strong>
              <span>cupo cuando hay entrega real</span>
            </div>
          </div>
          <div className="acciones acciones-fila">
            {mostrarCta && (
              <button type="button" className="primario" onClick={alRegistro}>
                Quiero adoptar o donar un ítem
              </button>
            )}
            <button
              type="button"
              className="secundario hero-secundario"
              onClick={() =>
                document.getElementById('lista-espera')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              Ver quién espera
            </button>
          </div>
        </div>
      </section>

      <section className="pasos" aria-label="Cómo participar">
        <p className="ojo">Cómo participar</p>
        <h2>Tres gestos. Un cupo que sí se abre.</h2>
        <ol>
          <li>
            <span>01</span>
            <strong>Lee la historia</strong>
            <p>Convivencia primero. La raza no filtra el catálogo.</p>
          </li>
          <li>
            <span>02</span>
            <strong>Postúlate o cubre un ítem</strong>
            <p>Cinco preguntas, o un bulto concreto. Nunca un monto a ciegas.</p>
          </li>
          <li>
            <span>03</span>
            <strong>El refugio cierra la entrega</strong>
            <p>Ahí nace el +1 de cupo. El sello de la entidad ya estaba a la vista.</p>
          </li>
        </ol>
      </section>

      <aside className="aviso aviso-ejemplo">
        <p>
          Las fichas <strong>EJEMPLO</strong> son del prototipo local. No son
          refugios, personas ni animales reales.
        </p>
      </aside>

      <h2 id="lista-espera">Quién espera un hogar</h2>
      <div className="filtros">
        <select value={especie} onChange={(e) => setEspecie(e.target.value)} aria-label="Especie">
          <option value="">Todas las especies</option>
          <option value="canino">Canino</option>
          <option value="felino">Felino</option>
        </select>
        <select
          value={localidadId}
          onChange={(e) => setLocalidadId(e.target.value)}
          aria-label="Localidad"
        >
          <option value="">Todas las localidades</option>
          {localidades.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nombre}
            </option>
          ))}
        </select>
      </div>
      <p className="ayuda">No hay filtro por raza. Lee la historia antes de la foto.</p>
      {error && <p className="error">{error}</p>}
      {items.length === 0 && !error && (
        <p>Aún no hay animales publicados. Cuando un refugio verificado publique, aparecen aquí.</p>
      )}
      <ul className="lista tarjetas">
        {items.map((a) => (
          <li key={a.id} className="tarjeta">
            <div className="tarjeta-media">
              {a.fotoUrl ? (
                <img className="miniatura" src={a.fotoUrl} alt="" />
              ) : (
                <div className="miniatura miniatura-vacia" aria-hidden="true" />
              )}
              {a.necesidadEspecial && (
                <span className="etiqueta etiqueta-flotante">Necesidad especial</span>
              )}
            </div>
            <div className="tarjeta-cuerpo">
              <strong className="tarjeta-titulo">{a.nombre}</strong>
              <p className="tarjeta-meta">
                {a.especie === 'canino' ? 'Canino' : 'Felino'} · {a.localidad} · {a.edadAprox}
              </p>
              <p className="cita">«{a.historia}…»</p>
              <button type="button" className="enlace" onClick={() => alEntidad(a.entidadId)}>
                <span className="etiqueta etiqueta-sello">{BADGE[a.badge] ?? a.badge}</span>{' '}
                {a.entidadNombre}
              </button>
              {a.puntaje != null && (
                <div className="puntaje">
                  <strong>{a.puntaje}</strong>
                  <span>{a.fraseExplicable}</span>
                </div>
              )}
              <div className="acciones">
                <button type="button" className="primario" onClick={() => alAbrir(a.id)}>
                  Leer su historia
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
