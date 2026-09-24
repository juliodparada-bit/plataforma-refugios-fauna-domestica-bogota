import { FormEvent, useEffect, useState } from 'react';
import { api, type Usuario } from '../api';
import { etiquetaEspecie, etiquetaSello } from '../etiquetas';
import { nombreVisible } from '../demo';

export function PerfilEntidad({
  id,
  usuario,
  alVolver,
  alEntrar,
  alAbrirAnimal,
}: {
  id: string;
  usuario: Usuario | null;
  alVolver: () => void;
  alEntrar: () => void;
  alAbrirAnimal: (id: string) => void;
}) {
  const [data, setData] = useState<Awaited<ReturnType<typeof api.entidadPublica>> | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  useEffect(() => {
    const ac = new AbortController();
    setData(null);
    setError('');
    void api
      .entidadPublica(id, { signal: ac.signal })
      .then((perfil) => {
        if (!ac.signal.aborted) setData(perfil);
      })
      .catch((e) => {
        if (e instanceof DOMException && e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : 'No encontré la entidad.');
      });
    return () => ac.abort();
  }, [id]);

  async function reservar(e: FormEvent<HTMLFormElement>, itemId: string) {
    e.preventDefault();
    setError('');
    const contacto = String(new FormData(e.currentTarget).get('contacto') ?? '').trim();
    try {
      await api.reservarDeseo(itemId, contacto);
      setOk('Ítem reservado. Coordina la entrega por WhatsApp; no hay recaudo.');
      setData(await api.entidadPublica(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo reservar.');
    }
  }

  if (!data) {
    return (
      <main className="hoja">
        <button type="button" className="enlace" onClick={alVolver}>
          {usuario?.rol === 'donante' ? '← Necesidades' : '← Catálogo'}
        </button>
        {error ? (
          <div className="vacio">
            <h3>No pude abrir este hogar</h3>
            <p className="error" role="alert">
              {error}
            </p>
          </div>
        ) : (
          <p>Cargando…</p>
        )}
      </main>
    );
  }

  return (
    <main className="hoja">
      <button type="button" className="enlace" onClick={alVolver}>
        {usuario?.rol === 'donante' ? '← Necesidades' : '← Catálogo'}
      </button>
      <p className="ojo">Refugio con sello a la vista</p>
      <h1>{nombreVisible(data.nombre)}</h1>
      <p>
        <span className="etiqueta etiqueta-sello">{etiquetaSello(data.badge)}</span>{' '}
        {data.localidad}
      </p>
      <p className="ayuda">
        Un ítem cubierto aquí es un cupo que puede abrirse. Sin recaudo y sin
        datos del donante en la bitácora.
      </p>
      <h2>Animales publicados</h2>
      {data.animales?.length ? (
        <ul className="lista tarjetas">
          {data.animales.map((a) => (
          <li key={a.id}>
            {a.fotoUrl && <img className="miniatura" src={a.fotoUrl} alt="" />}
            <strong>{nombreVisible(a.nombre)}</strong>
            <p>
              {etiquetaEspecie(a.especie)} · {a.localidad}
            </p>
            {a.necesidadEspecial && <p className="etiqueta">Necesidad especial</p>}
            <button type="button" className="primario" onClick={() => alAbrirAnimal(a.id)}>
              Ver historia
            </button>
          </li>
        ))}
        </ul>
      ) : (
        <p>No hay animales publicados ahora.</p>
      )}
      <h2>Insumos cubiertos</h2>
      {data.bitacora.length === 0 && <p>Aún no hay ítems cubiertos.</p>}
      <ul className="lista">
        {data.bitacora.map((b, i) => (
          <li key={i}>
            {nombreVisible(b.descripcion)} · {b.cantidad} {b.unidad} · {new Date(b.cubiertoEn).toLocaleDateString('es-CO')}
          </li>
        ))}
      </ul>
      <h2>Lista de deseos</h2>
      {ok && (
        <aside className="aviso">
          <p>{ok}</p>
        </aside>
      )}
      {error && <p className="error" role="alert">{error}</p>}
      {data.deseos.length === 0 && <p>Este hogar no tiene ítems pendientes ahora.</p>}
      <ul className="lista">
        {data.deseos.map((d) => (
          <li key={d.id}>
            <strong>
              {d.categoria} · {d.prioridad}
            </strong>
            <p>
              {nombreVisible(d.descripcion)} · {d.cantidad} {d.unidad} · {d.estado}
            </p>
            {d.estado === 'pendiente' && usuario?.rol === 'donante' && (
              <form className="formulario" onSubmit={(e) => void reservar(e, d.id)}>
                <label>
                  Contacto para entregar (no es público)
                  <input name="contacto" required maxLength={120} />
                </label>
                <button type="submit" className="primario">
                  Reservar este ítem
                </button>
                  <p className="ayuda">
                    Este contacto solo lo ve la entidad. No aparece en la bitácora
                    pública. Tienes 7 días. No hay recaudo ni Nequi.
                  </p>
              </form>
            )}
            {d.estado === 'pendiente' && !usuario && (
              <button type="button" className="primario" onClick={alEntrar}>
                Entrar para reservar
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
