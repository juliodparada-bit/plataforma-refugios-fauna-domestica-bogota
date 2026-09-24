import { FormEvent, useEffect, useState } from 'react';
import { api, type PerfilAdoptante } from '../api';
import { Pagina } from '../componentes/Pagina';

export function Cuestionario({ alListo, alVolver }: { alListo: () => void; alVolver: () => void }) {
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [inicial, setInicial] = useState<PerfilAdoptante | null>(null);
  const [listo, setListo] = useState(false);
  const [horas, setHoras] = useState(8);

  useEffect(() => {
    void api
      .perfil()
      .then((p) => {
        setInicial(p);
        if (p) setHoras(p.horasCompania);
      })
      .catch(() => setError('No pude cargar tu cuestionario. Puedes responderlo de nuevo.'))
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
    <Pagina
      className="hoja-estrecha"
      kicker="Adoptante"
      titulo="Cuéntanos cómo es tu hogar"
      proposito="No es un examen. Es una conversación honesta para que el animal que llegue, llegue al lugar correcto."
    >
      <button type="button" className="enlace" onClick={alVolver}>
        ← Atrás
      </button>
      <aside className="aviso aviso-datos">
        <p>
          Solo el refugio verá estas respuestas cuando te postules. Son tuyas y de nadie más.
          Aquí no hay respuestas incorrectas, solo verdades que ayudan.
        </p>
      </aside>
      {!listo && <p>Cargando…</p>}
      {listo && (
        <form key={inicial ? 'edit' : 'new'} className="formulario cuestionario" onSubmit={(e) => void enviar(e)}>
          <fieldset className="pregunta">
            <legend>1. Vivienda</legend>
            <div className="pregunta-opciones">
              {[
                ['apartamento', 'Apartamento'],
                ['casa', 'Casa'],
                ['casa_con_patio', 'Casa con patio'],
                ['otro', 'Otro'],
              ].map(([valor, etiqueta]) => (
                <label key={valor} className="radio">
                  <input
                    type="radio"
                    name="tipoVivienda"
                    value={valor}
                    required
                    defaultChecked={inicial?.tipoVivienda === valor}
                  />
                  <span>{etiqueta}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="pregunta">
            <legend>2. Horas de compañía al día</legend>
            <div className="rango-fila">
              <input
                id="horasCompania"
                name="horasCompania"
                type="range"
                min={0}
                max={24}
                required
                value={horas}
                onChange={(e) => setHoras(Number(e.target.value))}
                aria-valuemin={0}
                aria-valuemax={24}
                aria-valuenow={horas}
                aria-valuetext={`${horas} horas`}
              />
              <output className="rango-valor" htmlFor="horasCompania" aria-live="polite">
                {horas} h
              </output>
            </div>
          </fieldset>

          <fieldset className="pregunta">
            <legend>3. ¿Niños en el hogar?</legend>
            <div className="pregunta-opciones pregunta-fila">
              <label className="radio">
                <input
                  type="radio"
                  name="ninosEnHogar"
                  value="si"
                  required
                  defaultChecked={inicial?.ninosEnHogar === true}
                />
                <span>Sí</span>
              </label>
              <label className="radio">
                <input
                  type="radio"
                  name="ninosEnHogar"
                  value="no"
                  defaultChecked={inicial ? !inicial.ninosEnHogar : false}
                />
                <span>No</span>
              </label>
            </div>
          </fieldset>

          <fieldset className="pregunta">
            <legend>4. ¿Otros animales?</legend>
            <div className="pregunta-opciones">
              {[
                ['ninguno', 'Ninguno'],
                ['perro', 'Perro'],
                ['gato', 'Gato'],
                ['ambos', 'Ambos'],
                ['otros', 'Otros'],
              ].map(([valor, etiqueta]) => (
                <label key={valor} className="radio">
                  <input
                    type="radio"
                    name="otrosAnimales"
                    value={valor}
                    required
                    defaultChecked={(inicial?.otrosAnimales ?? 'ninguno') === valor}
                  />
                  <span>{etiqueta}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="pregunta">
            <legend>5. Energía que puedes acompañar</legend>
            <div className="pregunta-opciones pregunta-fila">
              {[
                ['baja', 'Baja'],
                ['media', 'Media'],
                ['alta', 'Alta'],
              ].map(([valor, etiqueta]) => (
                <label key={valor} className="radio">
                  <input
                    type="radio"
                    name="energiaSostenible"
                    value={valor}
                    required
                    defaultChecked={(inicial?.energiaSostenible ?? 'media') === valor}
                  />
                  <span>{etiqueta}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="primario" disabled={enviando}>
            {enviando ? 'Guardando tu historia…' : 'Listo — quiero conocer a quien me espera'}
          </button>
        </form>
      )}
    </Pagina>
  );
}
