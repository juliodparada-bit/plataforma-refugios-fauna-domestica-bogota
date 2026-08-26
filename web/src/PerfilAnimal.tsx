import { useEffect, useState } from 'react';
import { api, type DetalleAnimal, type Usuario } from './api';

const BADGE: Record<string, string> = { nivel_1: 'Nivel 1', nivel_2: 'Nivel 2' };
const TALLA: Record<string, string> = { pequeno: 'pequeño', mediana: 'mediana', grande: 'grande' };

export function PerfilAnimal({
  id,
  usuario,
  alVolver,
  alCuestionario,
  alEntidad,
  alEntrar,
}: {
  id: string;
  usuario: Usuario | null;
  alVolver: () => void;
  alCuestionario: () => void;
  alEntidad: (id: string) => void;
  alEntrar: () => void;
}) {
  const [animal, setAnimal] = useState<DetalleAnimal | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [mayorDeEdad, setMayorDeEdad] = useState(false);
  const [viveEnBogota, setViveEnBogota] = useState(false);

  useEffect(() => {
    void api.animal(id).then(setAnimal).catch((e) => setError(e instanceof Error ? e.message : 'No encontré el perfil.'));
  }, [id]);

  async function postular() {
    setError('');
    if (!mayorDeEdad || !viveEnBogota) {
      setError('Debes confirmar que eres mayor de edad y vives en Bogotá.');
      return;
    }
    setEnviando(true);
    try {
      await api.postular(id, { mayorDeEdad, viveEnBogota });
      setOk('Postulación enviada. El refugio verá tu puntaje y tus respuestas.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo postular.');
    } finally {
      setEnviando(false);
    }
  }

  if (!animal && !error) {
    return (
      <main className="hoja">
        <p>Cargando…</p>
      </main>
    );
  }

  if (!animal) {
    return (
      <main className="hoja">
        <button type="button" className="enlace" onClick={alVolver}>
          ← Catálogo
        </button>
        <p className="error">{error}</p>
      </main>
    );
  }

  return (
    <main className="hoja">
      <button type="button" className="enlace" onClick={alVolver}>
        ← Catálogo
      </button>
      {animal.fotos[0] && <img className="portada" src={animal.fotos[0].url} alt="" />}
      <p className="ojo">
        {animal.especie === 'canino' ? 'Canino' : 'Felino'} · {animal.localidad}
      </p>
      <h1>{animal.nombre}</h1>
      <p className="lema-suave">Si puedes sostener su energía, este puede ser su hogar.</p>
      <ul className="chips">
        <li>{animal.edadAprox}</li>
        <li>{TALLA[animal.talla] ?? animal.talla}</li>
        <li>{animal.sexo}</li>
        <li>Energía {animal.energia}</li>
        {animal.necesidadEspecial && <li>Necesidad especial</li>}
      </ul>
      <button type="button" className="enlace" onClick={() => alEntidad(animal.entidad.id)}>
        <span className="etiqueta etiqueta-sello">
          Sello {BADGE[animal.entidad.badge] ?? animal.entidad.badge}
        </span>{' '}
        {animal.entidad.nombre} · {animal.entidad.localidad}
      </button>
      <h2>Historia</h2>
      <p className="historia">{animal.historia}</p>
      <h2>Convivencia</h2>
      <p>
        Niños: {animal.conviveNinos ? 'sí' : 'no'}. Otros animales:{' '}
        {animal.conviveOtrosAnimales ? 'sí' : 'no'}.
        {animal.raza ? ` Raza (dato secundario): ${animal.raza}.` : ''}
      </p>
      {usuario?.rol === 'adoptante' && animal.puntaje != null && (
        <div className="puntaje">
          <strong>{animal.puntaje}</strong>
          <span>{animal.fraseExplicable}</span>
        </div>
      )}
      {ok && (
        <aside className="aviso">
          <p>{ok}</p>
        </aside>
      )}
      {error && <p className="error">{error}</p>}
      {animal.estado === 'publicado' && (
        <div className="acciones">
          {!usuario && (
            <button type="button" className="primario" onClick={alEntrar}>
              Entrar para postularme
            </button>
          )}
          {usuario?.rol === 'adoptante' && !animal.tienePerfil && (
            <button type="button" className="primario" onClick={alCuestionario}>
              Responder 5 preguntas
            </button>
          )}
          {usuario?.rol === 'adoptante' && animal.tienePerfil && !ok && (
            <>
              <label className="radio">
                <input
                  type="checkbox"
                  checked={mayorDeEdad}
                  onChange={(e) => setMayorDeEdad(e.target.checked)}
                />{' '}
                Soy mayor de edad
              </label>
              <label className="radio">
                <input
                  type="checkbox"
                  checked={viveEnBogota}
                  onChange={(e) => setViveEnBogota(e.target.checked)}
                />{' '}
                Vivo en Bogotá
              </label>
              <button type="button" className="primario" disabled={enviando} onClick={() => void postular()}>
                {enviando ? 'Enviando…' : 'Postularme a este hogar'}
              </button>
              <p className="ayuda">
                El refugio verá tu puntaje y las cinco respuestas. No publicamos tu correo
                en el catálogo.
              </p>
            </>
          )}
        </div>
      )}
    </main>
  );
}
