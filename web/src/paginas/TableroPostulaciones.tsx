import { useEffect, useState } from 'react';
import { api, type TarjetaAnimal } from '../api';
import { nombreVisible } from '../demo';

const ETQ_ESTADO: Record<string, string> = {
  publicado: 'Publicado (en catálogo)',
  reservado: 'Reservado (preselección)',
  adoptado: 'Adoptado (cupo liberado)',
  archivado: 'Archivado',
  borrador: 'Borrador',
};

export function TableroPostulaciones({
  alVolver,
}: {
  alVolver: () => void;
}) {
  const [animales, setAnimales] = useState<TarjetaAnimal[]>([]);
  const [animalId, setAnimalId] = useState<string | null>(null);
  const [detalle, setDetalle] = useState<Awaited<ReturnType<typeof api.postulacionesDe>> | null>(null);
  const [error, setError] = useState('');

  async function cargarLista() {
    setAnimales(await api.misAnimales());
  }

  useEffect(() => {
    void cargarLista().catch((e) => setError(e instanceof Error ? e.message : 'No pude cargar.'));
  }, []);

  useEffect(() => {
    if (!animalId) {
      setDetalle(null);
      return;
    }
    void api.postulacionesDe(animalId).then(setDetalle);
  }, [animalId]);

  async function resolver(
    id: string,
    accion: 'abrir' | 'preseleccionar' | 'rechazar' | 'caer' | 'entregar' | 'seguimiento',
    extra?: { seguimientoResultado?: string; requiereEvidenciaHogar?: boolean },
  ) {
    setError('');
    try {
      await api.resolverPostulacion(id, { accion, ...extra });
      if (animalId) setDetalle(await api.postulacionesDe(animalId));
      await cargarLista();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar.');
    }
  }

  const cupos = animales.filter((a) => a.estado === 'adoptado').length;

  return (
    <main className="hoja">
      <button type="button" className="enlace" onClick={alVolver}>
        ← Tablero
      </button>
      <p className="ojo">Métrica norte</p>
      <h1>Animales y postulaciones</h1>
      <p className="ayuda">
        Cupos liberados (animales en estado adoptado): <strong>{cupos}</strong>
      </p>
      {error && <p className="error" role="alert">{error}</p>}
      {!animalId && (
        <ul className="lista">
          {animales.map((a) => (
            <li key={a.id}>
              <strong>{nombreVisible(a.nombre)}</strong>
              <p>
                {ETQ_ESTADO[a.estado ?? ''] ?? a.estado} · {a.postulaciones ?? 0} postulaciones
              </p>
              <div className="acciones acciones-fila">
                <button type="button" className="primario" onClick={() => setAnimalId(a.id)}>
                  Abrir postulaciones
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {detalle && (
        <>
          <button type="button" className="enlace" onClick={() => setAnimalId(null)}>
            ← Lista
          </button>
          <h2>
            {nombreVisible(detalle.animal.nombre)} · {ETQ_ESTADO[detalle.animal.estado] ?? detalle.animal.estado}
          </h2>
          {detalle.animal.necesidadEspecial && (
            <p className="etiqueta">Necesidad especial — se pide evidencia del hogar</p>
          )}
          <ul className="lista">
            {detalle.postulaciones.map((p) => (
              <li key={p.id}>
                <strong>
                  {nombreVisible(p.adoptante.nombre)} · {p.puntaje}
                </strong>
                <p>{p.fraseExplicable}</p>
                <p>
                  {p.estado} · {p.adoptante.localidad}
                </p>
                {p.adoptante.perfil && (
                  <p className="ayuda">
                    Vivienda: {p.adoptante.perfil.tipoVivienda.replace(/_/g, ' ')} ·{' '}
                    {p.adoptante.perfil.horasCompania} h de compañía · niños:{' '}
                    {p.adoptante.perfil.ninosEnHogar ? 'sí' : 'no'} · otros:{' '}
                    {p.adoptante.perfil.otrosAnimales} · energía:{' '}
                    {p.adoptante.perfil.energiaSostenible}
                  </p>
                )}
                {p.requiereEvidenciaHogar && (
                  <p className="etiqueta">Pide evidencia extra del hogar</p>
                )}
                {p.seguimientoResultado && (
                  <p>Seguimiento a 15 días: {p.seguimientoResultado}</p>
                )}
                <div className="acciones acciones-fila">
                  {p.estado === 'enviada' && (
                    <>
                      <button type="button" className="secundario" onClick={() => void resolver(p.id, 'abrir')}>
                        Abrir caso
                      </button>
                      <button
                        type="button"
                        className="secundario"
                        onClick={() => void resolver(p.id, 'abrir', { requiereEvidenciaHogar: true })}
                      >
                        Pedir evidencia del hogar
                      </button>
                    </>
                  )}
                  {(p.estado === 'enviada' || p.estado === 'en_revision') &&
                    detalle.animal.estado === 'publicado' && (
                      <button type="button" className="primario" onClick={() => void resolver(p.id, 'preseleccionar')}>
                        Preseleccionar
                      </button>
                    )}
                  {(p.estado === 'enviada' || p.estado === 'en_revision' || p.estado === 'preseleccionada') && (
                    <button type="button" className="peligro" onClick={() => void resolver(p.id, 'rechazar')}>
                      Rechazar
                    </button>
                  )}
                  {p.estado === 'preseleccionada' && (
                    <>
                      <button type="button" className="primario" onClick={() => void resolver(p.id, 'entregar')}>
                        Marcar entrega (cupo +1)
                      </button>
                      <button type="button" className="secundario" onClick={() => void resolver(p.id, 'caer')}>
                        Caer preselección
                      </button>
                    </>
                  )}
                  {(p.estado === 'entregada' || p.estado === 'seguimiento') && (
                    <>
                      <p className="ayuda">Resultado del seguimiento a 15 días (sin correos automáticos):</p>
                      {(['estable', 'novedad', 'retorno'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={p.seguimientoResultado === r ? 'primario' : 'secundario'}
                          onClick={() => void resolver(p.id, 'seguimiento', { seguimientoResultado: r })}
                        >
                          {r}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
