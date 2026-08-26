import { FormEvent, useEffect, useState } from 'react';
import {
  api,
  type ColaItem,
  type SolicitudVerificacion,
} from './api';

const ETIQUETAS: Record<string, string> = {
  rut: 'RUT',
  camara_comercio: 'Cámara de Comercio',
  representacion_legal: 'Representación legal',
  evidencia_idpyba: 'Evidencia IDPYBA',
  carta_comvezcol: 'Carta COMVEZCOL',
  en_revision: 'En revisión',
  complemento: 'Complemento',
  nivel_1: 'Nivel 1',
  nivel_2: 'Nivel 2',
};

export function ColaValidador({ alVolver }: { alVolver: () => void }) {
  const [cola, setCola] = useState<ColaItem[]>([]);
  const [detalle, setDetalle] = useState<SolicitudVerificacion | null>(null);
  const [error, setError] = useState('');

  async function cargar() {
    setCola(await api.colaVerificacion());
  }

  useEffect(() => {
    void cargar().catch((e) => setError(e instanceof Error ? e.message : 'No pude cargar la cola.'));
  }, []);

  if (detalle) {
    return (
      <DetalleValidador
        detalle={detalle}
        alVolver={() => {
          setDetalle(null);
          void cargar();
        }}
      />
    );
  }

  return (
    <main className="hoja">
      <button type="button" className="enlace" onClick={alVolver}>
        ← Tablero
      </button>
      <h1>Cola de verificación</h1>
      {error && <p className="error">{error}</p>}
      {cola.length === 0 && <p>No hay solicitudes pendientes.</p>}
      <ul className="lista">
        {cola.map((item) => (
          <li key={item.id}>
            <strong>{item.entidad.nombre}</strong>
            <p>
              {ETIQUETAS[item.tipoNivel]} · {item.entidad.localidad.nombre} ·{' '}
              {ETIQUETAS[item.estado] ?? item.estado}
            </p>
            <p>Evidencias: {item.evidencias.length} archivo(s)</p>
            <button
              type="button"
              className="primario"
              onClick={() => {
                void api.detalleVerificacion(item.id).then(setDetalle);
              }}
            >
              Abrir
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}

function DetalleValidador({
  detalle,
  alVolver,
}: {
  detalle: SolicitudVerificacion;
  alVolver: () => void;
}) {
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [listo, setListo] = useState('');

  async function resolver(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const datos = new FormData(e.currentTarget);
    const accion = String(datos.get('accion')) as 'aprobar' | 'rechazar' | 'complemento';
    const motivo = String(datos.get('motivo') ?? '').trim();
    if ((accion === 'rechazar' || accion === 'complemento') && !motivo) {
      setError('El motivo es obligatorio para rechazar o pedir complemento.');
      return;
    }
    setEnviando(true);
    try {
      await api.resolverVerificacion(detalle.id, {
        accion,
        motivo: motivo || undefined,
        visitaNecesaria: datos.get('visita') === 'on',
      });
      setListo(
        accion === 'aprobar'
          ? 'Aprobada. El sello queda visible. No se habilitó recaudo (este prototipo no recauda dinero).'
          : 'Respuesta registrada.',
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo resolver.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="hoja">
      <button type="button" className="enlace" onClick={alVolver}>
        ← Cola
      </button>
      <h1>{detalle.entidad?.nombre}</h1>
      <p>
        {ETIQUETAS[detalle.tipoNivel]} · {detalle.entidad?.localidad} ·{' '}
        {ETIQUETAS[detalle.estado] ?? detalle.estado}
      </p>
      <h2>Evidencias</h2>
      <ul className="lista">
        {detalle.evidencias.map((ev) => (
          <li key={ev.id}>
            <a
              href={api.urlEvidencia(detalle.id, ev.id)}
              target="_blank"
              rel="noreferrer"
            >
              {ETIQUETAS[ev.tipoDocumento] ?? ev.tipoDocumento}
            </a>
            <span className="ayuda"> {(ev.pesoBytes / 1024).toFixed(0)} KB</span>
          </li>
        ))}
      </ul>

      {listo ? (
        <aside className="aviso">
          <p>{listo}</p>
        </aside>
      ) : (
        <form className="formulario" onSubmit={(e) => void resolver(e)}>
          <fieldset>
            <legend>Decisión</legend>
            <label className="radio">
              <input type="radio" name="accion" value="aprobar" required /> Aprobar
              este nivel
            </label>
            <label className="radio">
              <input type="radio" name="accion" value="complemento" /> Pedir
              complemento
            </label>
            <label className="radio">
              <input type="radio" name="accion" value="rechazar" /> Rechazar
            </label>
          </fieldset>
          <label>
            Motivo (obligatorio si rechazas o pides complemento)
            <input name="motivo" maxLength={500} />
          </label>
          <label className="radio">
            <input type="checkbox" name="visita" /> Marcar visita o video (no es
            obligatorio para aprobar)
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="primario" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Registrar decisión'}
          </button>
        </form>
      )}
    </main>
  );
}
