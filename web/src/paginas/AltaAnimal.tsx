import { FormEvent, useEffect, useState } from 'react';
import { api, type Localidad, type Usuario } from '../api';

export function AltaAnimal({
  usuario,
  alListo,
  alVolver,
}: {
  usuario: Usuario;
  alListo: (id: string) => void;
  alVolver: () => void;
}) {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    void api.localidades().then(setLocalidades);
  }, []);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const datos = new FormData(e.currentTarget);
    const historia = String(datos.get('historia') ?? '').trim();
    if (historia.length < 20) {
      setError('La historia es obligatoria.');
      return;
    }
    const foto = datos.get('foto');
    if (!(foto instanceof File) || foto.size === 0) {
      setError('Adjunta al menos una foto.');
      return;
    }
    datos.set('conviveNinos', datos.get('conviveNinos') === 'on' ? 'true' : 'false');
    datos.set('conviveOtrosAnimales', datos.get('conviveOtrosAnimales') === 'on' ? 'true' : 'false');
    datos.set('necesidadEspecial', datos.get('necesidadEspecial') === 'on' ? 'true' : 'false');
    setEnviando(true);
    try {
      const animal = await api.publicarAnimal(datos);
      alListo(animal.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo publicar.');
    } finally {
      setEnviando(false);
    }
  }

  if (!usuario.entidad?.puedePublicar) {
    return (
      <main className="hoja">
        <button type="button" className="enlace" onClick={alVolver}>
          ← Tablero
        </button>
        <p>Aún no puedes publicar: falta la verificación.</p>
      </main>
    );
  }

  return (
    <main className="hoja">
      <button type="button" className="enlace" onClick={alVolver}>
        ← Tablero
      </button>
      <h1>Publicar animal</h1>
      <p>Cuenta su historia primero. Un cupo no se abre con una raza en el filtro.</p>
      <aside className="aviso aviso-datos">
        <p>
          La foto y la historia serán públicas. No subas documentos de identidad
          ni datos de un adoptante.
        </p>
      </aside>
      <form className="formulario" onSubmit={(e) => void enviar(e)}>
        <label>
          Nombre
          <input name="nombre" required maxLength={80} />
        </label>
        <label>
          Especie
          <select name="especie" required>
            <option value="canino">Canino</option>
            <option value="felino">Felino</option>
          </select>
        </label>
        <label>
          Sexo
          <select name="sexo" required>
            <option value="hembra">Hembra</option>
            <option value="macho">Macho</option>
          </select>
        </label>
        <label>
          Talla
          <select name="talla" required>
            <option value="pequeno">Pequeño</option>
            <option value="mediano">Mediano</option>
            <option value="grande">Grande</option>
          </select>
        </label>
        <label>
          Edad
          <select name="edadAprox" required>
            <option value="cachorro">Cachorro</option>
            <option value="joven">Joven</option>
            <option value="adulto">Adulto</option>
            <option value="senior">Senior</option>
          </select>
        </label>
        <label>
          Localidad
          <select name="localidadId" required defaultValue="">
            <option value="" disabled>
              Elige…
            </option>
            {localidades.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nombre}
              </option>
            ))}
          </select>
        </label>
        <label>
          Energía
          <select name="energia" required>
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
          </select>
        </label>
        <label>
          Historia (obligatoria)
          <textarea name="historia" required minLength={20} rows={5} />
        </label>
        <label className="radio">
          <input type="checkbox" name="conviveNinos" /> Convive con niños
        </label>
        <label className="radio">
          <input type="checkbox" name="conviveOtrosAnimales" /> Convive con otros animales
        </label>
        <label className="radio">
          <input type="checkbox" name="necesidadEspecial" /> Necesidad especial
        </label>
        <label>
          Esterilizado
          <select name="esterilizado">
            <option value="ns">No se conoce</option>
            <option value="si">Sí</option>
            <option value="no">No</option>
          </select>
        </label>
        <label>
          Raza (opcional, no es filtro)
          <input name="raza" maxLength={80} />
        </label>
        <label>
          Foto (mínimo una)
          <input name="foto" type="file" accept="image/jpeg,image/png,image/webp" required />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <button type="submit" className="primario" disabled={enviando}>
          {enviando ? 'Publicando…' : 'Publicar'}
        </button>
      </form>
    </main>
  );
}
