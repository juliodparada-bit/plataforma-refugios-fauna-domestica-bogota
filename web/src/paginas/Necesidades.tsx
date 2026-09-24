import { useEffect, useState } from 'react';
import { api, type TarjetaEntidad } from '../api';
import { Pagina } from '../componentes/Pagina';
import { nombreVisible } from '../demo';
import { etiquetaCategoria, etiquetaSello, iconoCategoria } from '../etiquetas';

export function Necesidades({
  alAbrir,
}: {
  alAbrir: (id: string) => void;
}) {
  const [items, setItems] = useState<TarjetaEntidad[]>([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    void api
      .entidades()
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : 'No pude cargar los hogares.'))
      .finally(() => setCargando(false));
  }, []);

  return (
    <Pagina
      kicker="Donar en especie"
      titulo="Necesidades"
      proposito="Hogares con sello e ítems pendientes. Reservas alimento, medicina o aseo. Sin recaudo ni Nequi."
    >
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {cargando ? (
        <ul className="lista tablero-lista">
          {Array.from({ length: 3 }).map((_, i) => (
            <li key={i} className="esqueleto-tarjeta" aria-hidden="true">
              <div className="esqueleto-cuerpo">
                <div className="esqueleto esqueleto-linea" style={{ width: '55%' }} />
                <div className="esqueleto esqueleto-linea" style={{ width: '80%' }} />
              </div>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className="vacio">
          <h3>Aún no hay hogares verificados</h3>
          <p>Cuando un refugio tenga sello, su lista de deseos aparece aquí.</p>
        </div>
      ) : (
        <ul className="lista tablero-lista">
          {items.map((e) => (
            <li key={e.id} className="tarjeta tarjeta-hub">
              <div className="tarjeta-cuerpo">
                <div className="hub-cabeza">
                  <strong className="tarjeta-titulo">{nombreVisible(e.nombre)}</strong>
                  <p className="tarjeta-meta">
                    <span className="etiqueta etiqueta-sello">{etiquetaSello(e.badge)}</span> {e.localidad}
                  </p>
                </div>
                {e.pendientes === 0 ? (
                  <p className="ayuda">Ahora no tiene ítems pendientes. Puedes ver su bitácora.</p>
                ) : (
                  <>
                    <p className="hub-cifra">
                      {e.pendientes === 1 ? '1 necesidad pendiente' : `${e.pendientes} necesidades pendientes`}
                    </p>
                    <ul className="lista-ejemplo">
                      {e.necesidades.map((n) => (
                        <li key={n.id} className="necesidad-item">
                          <span className="necesidad-icono" aria-hidden="true">
                            {iconoCategoria(n.categoria)}
                          </span>
                          <span>
                            <strong>{etiquetaCategoria(n.categoria)}</strong>
                            {' · '}
                            {nombreVisible(n.descripcion)} ({n.cantidad} {n.unidad})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="acciones">
                  <button
                    type="button"
                    className="primario"
                    onClick={() => alAbrir(e.id)}
                    aria-label={
                      e.pendientes > 0
                        ? `Ver y reservar en ${nombreVisible(e.nombre)}`
                        : `Ver el hogar ${nombreVisible(e.nombre)}`
                    }
                  >
                    {e.pendientes > 0 ? 'Ver y reservar' : 'Ver el hogar'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Pagina>
  );
}
