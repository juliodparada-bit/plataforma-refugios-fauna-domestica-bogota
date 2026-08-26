import { FormEvent, useEffect, useState } from 'react';
import { api, type Usuario } from './api';

export function DeseosEntidad({ usuario, alVolver }: { usuario: Usuario; alVolver: () => void }) {
  const [items, setItems] = useState<Awaited<ReturnType<typeof api.misDeseos>>>([]);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  async function cargar() {
    setItems(await api.misDeseos());
  }

  useEffect(() => {
    void cargar().catch((e) => setError(e instanceof Error ? e.message : 'No pude cargar.'));
  }, []);

  async function publicar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const datos = new FormData(e.currentTarget);
    try {
      await api.publicarDeseo({
        categoria: String(datos.get('categoria')),
        descripcion: String(datos.get('descripcion')),
        cantidad: Number(datos.get('cantidad')),
        unidad: String(datos.get('unidad')),
        prioridad: String(datos.get('prioridad')),
      });
      e.currentTarget.reset();
      setOk('Ítem publicado. No hay recaudo.');
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar.');
    }
  }

  async function confirmar(e: FormEvent<HTMLFormElement>, reservaId: string) {
    e.preventDefault();
    const datos = new FormData(e.currentTarget);
    datos.set('checkRecibido', datos.get('checkRecibido') === 'on' ? 'true' : 'false');
    try {
      await api.confirmarReserva(reservaId, datos);
      setOk('Ítem cubierto. Sale en la bitácora pública sin datos del donante.');
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo confirmar.');
    }
  }

  if (!usuario.entidad?.puedePublicar) {
    return (
      <main className="hoja">
        <button type="button" className="enlace" onClick={alVolver}>
          ← Tablero
        </button>
        <p>Aún no puedes publicar ítems: falta la verificación.</p>
      </main>
    );
  }

  return (
    <main className="hoja">
      <button type="button" className="enlace" onClick={alVolver}>
        ← Tablero
      </button>
      <h1>Lista de deseos</h1>
      {ok && (
        <aside className="aviso">
          <p>{ok}</p>
        </aside>
      )}
      <form className="formulario" onSubmit={(e) => void publicar(e)}>
        <label>
          Categoría
          <select name="categoria" required>
            <option value="alimento">Alimento</option>
            <option value="medicina">Medicina</option>
            <option value="aseo">Aseo</option>
          </select>
        </label>
        <label>
          Descripción
          <input name="descripcion" required maxLength={200} />
        </label>
        <label>
          Cantidad
          <input name="cantidad" type="number" min={1} required defaultValue={1} />
        </label>
        <label>
          Unidad
          <input name="unidad" required maxLength={30} defaultValue="bulto" />
        </label>
        <label>
          Prioridad
          <select name="prioridad" required>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </label>
        <button type="submit" className="primario">
          Publicar ítem
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul className="lista">
        {items.map((i) => {
          const reserva = i.reservas[0];
          return (
            <li key={i.id}>
              <strong>
                {i.descripcion} · {i.estado}
              </strong>
              <p>
                {i.cantidad} {i.unidad} · {i.categoria}
              </p>
              {reserva?.estado === 'reservado' && (
                <form className="formulario" onSubmit={(e) => void confirmar(e, reserva.id)}>
                  <p className="ayuda">Contacto (solo tú lo ves): {reserva.contactoEntrega}</p>
                  <label className="radio">
                    <input type="checkbox" name="checkRecibido" /> Recibido
                  </label>
                  <label>
                    Foto (opcional)
                    <input name="foto" type="file" accept="image/jpeg,image/png,image/webp" />
                  </label>
                  <button type="submit" className="primario">
                    Confirmar cobertura
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
