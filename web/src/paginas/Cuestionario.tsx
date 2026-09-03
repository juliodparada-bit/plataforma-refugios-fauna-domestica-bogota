import { FormEvent, useEffect, useState } from 'react';
import { api, type PerfilAdoptante } from '../api';

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
      <h1>Cuéntanos cómo es tu hogar 🏡</h1>
      <p>No es un examen. Es una conversación honesta para que el animal que llegue, llegue al lugar correcto.</p>
      <aside className="aviso aviso-datos">
        <p>
          Solo el refugio verá estas respuestas cuando te postules. Son tuyas y de nadie más.
          Aquí no hay respuestas incorrectas, solo verdades que ayudan.
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
          ¿Cuántas horas al día puede estar acompañado?
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
          ¿Qué energía puedes acompañar con amor?
          <select name="energiaSostenible" required defaultValue={inicial?.energiaSostenible ?? 'media'}>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="primario" disabled={enviando}>
          {enviando ? 'Guardando tu historia…' : 'Listo — quiero conocer a quien me espera 🐾'}
        </button>
      </form>
      )}
    </main>
  );
}
