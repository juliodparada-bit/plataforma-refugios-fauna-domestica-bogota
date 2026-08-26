import { FormEvent, useEffect, useState } from 'react';
import { api, type PerfilAdoptante } from './api';

export function Cuestionario({ alListo, alVolver }: { alListo: () => void; alVolver: () => void }) {
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [inicial, setInicial] = useState<PerfilAdoptante | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    void api
      .perfil()
      .then((p) => setInicial(p))
      .finally(() => setListo(true));
  }, []);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const datos = new FormData(e.currentTarget);
    setEnviando(true);
    try {
      await api.guardarPerfil({
        tipoVivienda: String(datos.get('tipoVivienda')),
        horasCompania: Number(datos.get('horasCompania')),
        ninosEnHogar: datos.get('ninosEnHogar') === 'si',
        otrosAnimales: String(datos.get('otrosAnimales')),
        energiaSostenible: String(datos.get('energiaSostenible')),
      });
      alListo();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="hoja">
      <button type="button" className="enlace" onClick={alVolver}>
        ← Atrás
      </button>
      <h1>Tu hogar (5 preguntas)</h1>
      <p>No es una auditoría. Es para decirle al refugio si pueden convivir.</p>
      <aside className="aviso aviso-datos">
        <p>
          Estas respuestas las ve el refugio al postularte. No salen en el
          catálogo público.
        </p>
      </aside>
      {!listo && <p>Cargando…</p>}
      {listo && (
      <form key={inicial ? 'edit' : 'new'} className="formulario" onSubmit={(e) => void enviar(e)}>
        <label>
          Vivienda
          <select name="tipoVivienda" required defaultValue={inicial?.tipoVivienda ?? ''}>
            <option value="" disabled>
              Elige…
            </option>
            <option value="apartamento">Apartamento</option>
            <option value="casa">Casa</option>
            <option value="casa_con_patio">Casa con patio</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label>
          Horas de compañía al día
          <input
            name="horasCompania"
            type="number"
            min={0}
            max={24}
            required
            defaultValue={inicial?.horasCompania ?? 8}
          />
        </label>
        <fieldset>
          <legend>¿Niños en el hogar?</legend>
          <label className="radio">
            <input
              type="radio"
              name="ninosEnHogar"
              value="si"
              required
              defaultChecked={inicial?.ninosEnHogar === true}
            />{' '}
            Sí
          </label>
          <label className="radio">
            <input
              type="radio"
              name="ninosEnHogar"
              value="no"
              defaultChecked={inicial ? !inicial.ninosEnHogar : false}
            />{' '}
            No
          </label>
        </fieldset>
        <label>
          ¿Otros animales?
          <select name="otrosAnimales" required defaultValue={inicial?.otrosAnimales ?? 'ninguno'}>
            <option value="ninguno">Ninguno</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
            <option value="ambos">Ambos</option>
            <option value="otros">Otros</option>
          </select>
        </label>
        <label>
          Energía que puedes sostener
          <select name="energiaSostenible" required defaultValue={inicial?.energiaSostenible ?? 'media'}>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primario" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar y ver catálogo'}
        </button>
      </form>
      )}
    </main>
  );
}
