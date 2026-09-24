import { FormEvent, useEffect, useState } from 'react';
import { api, type Localidad, type Usuario } from '../api';

const ETIQUETAS: Record<string, string> = {
  rut: 'RUT',
  camara_comercio: 'Cámara de Comercio',
  representacion_legal: 'Representación legal',
  evidencia_idpyba: 'Evidencia IDPYBA',
  carta_comvezcol: 'Carta COMVEZCOL',
  en_revision: 'En revisión',
  aprobada: 'Aprobada',
  rechazada: 'Rechazada',
  complemento: 'Piden complemento',
  nivel_1: 'Nivel 1',
  nivel_2: 'Nivel 2',
};

export function VerificacionEntidad({
  usuario,
  alVolver,
  alActualizar,
}: {
  usuario: Usuario;
  alVolver: () => void;
  alActualizar: (u: Usuario) => void;
}) {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [localidadId, setLocalidadId] = useState('');
  const [nivel, setNivel] = useState<'nivel_1' | 'nivel_2'>('nivel_2');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [estado, setEstado] = useState<string>(usuario.entidad?.estadoVerificacion ?? '');
  const [estadoSolicitud, setEstadoSolicitud] = useState<string | null>(null);
  const [motivo, setMotivo] = useState<string | null>(null);
  const [puedeEnviar, setPuedeEnviar] = useState(true);

  useEffect(() => {
    void api.localidades().then(setLocalidades).catch(() => undefined);
    void api
      .miVerificacion()
      .then((r) => {
        setEstado(r.entidad.estadoVerificacion);
        setLocalidadId(r.entidad.localidadId);
        setMotivo(r.solicitud?.motivo ?? null);
        setEstadoSolicitud(r.solicitud?.estado ?? null);
        setPuedeEnviar(r.solicitud?.estado !== 'en_revision');
        if (r.entidad.nivelSolicitado === 'nivel_1' || r.entidad.nivelSolicitado === 'nivel_2') {
          setNivel(r.entidad.nivelSolicitado);
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'No pude cargar la verificación.'));
  }, []);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const form = e.currentTarget;
    const datos = new FormData(form);
    for (const [clave, valor] of [...datos.entries()]) {
      if (valor instanceof File && valor.size === 0) {
        datos.delete(clave);
      }
    }
    if (nivel === 'nivel_1') {
      for (const campo of ['rut', 'camara_comercio', 'representacion_legal']) {
        const f = datos.get(campo);
        if (!(f instanceof File) || f.size === 0) {
          setError(
            'Nivel 1 exige los tres documentos: RUT, Cámara de Comercio y representación legal.',
          );
          return;
        }
      }
    } else {
      const a = datos.get('evidencia_idpyba');
      const b = datos.get('carta_comvezcol');
      const hayA = a instanceof File && a.size > 0;
      const hayB = b instanceof File && b.size > 0;
      if (!hayA && !hayB) {
        setError('Nivel 2 exige al menos evidencia IDPYBA o carta COMVEZCOL.');
        return;
      }
    }
    setEnviando(true);
    try {
      await api.enviarVerificacion(datos);
      const yo = await api.yo();
      if (yo) alActualizar(yo);
      const mia = await api.miVerificacion();
      setEstado(mia.entidad.estadoVerificacion);
      setMotivo(mia.solicitud?.motivo ?? null);
      setEstadoSolicitud(mia.solicitud?.estado ?? null);
      setPuedeEnviar(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar la solicitud.');
    } finally {
      setEnviando(false);
    }
  }

  const verificada = estado === 'nivel_1' || estado === 'nivel_2';

  return (
    <main className="hoja">
      <button type="button" className="enlace" onClick={alVolver}>
        ← Tablero
      </button>
      <h1>Verificación de entidad</h1>
      <aside className="aviso aviso-datos">
        <p>
          Los documentos (RUT, Cámara, IDPYBA, COMVEZCOL) solo los ves tú y el
          validador. No salen en el perfil público. El sello sí.
        </p>
      </aside>
      <p>
        Estado actual: <strong>{ETIQUETAS[estado] ?? estado}</strong>
        {estadoSolicitud && estadoSolicitud !== estado ? (
          <>
            {' '}
            · solicitud: {ETIQUETAS[estadoSolicitud] ?? estadoSolicitud}
          </>
        ) : null}
      </p>
      {motivo && !verificada && (
        <aside className="aviso">
          <p>{motivo}</p>
        </aside>
      )}
      {verificada && (
        <aside className="aviso">
          <p>
            Sello visible. Ya puedes publicar (el catálogo es el siguiente módulo).
            No hay recaudo de dinero.
          </p>
        </aside>
      )}

      {puedeEnviar && !verificada && (
        <form className="formulario" onSubmit={(e) => void enviar(e)}>
          <label>
            Nombre del albergue o hogar de paso
            <input
              name="nombre"
              required
              maxLength={160}
              defaultValue={usuario.entidad?.nombre ?? usuario.nombre}
            />
          </label>
          <label>
            Localidad
            <select
              name="localidadId"
              required
              value={localidadId}
              onChange={(ev) => setLocalidadId(ev.target.value)}
            >
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
          <fieldset>
            <legend>Nivel que solicito</legend>
            <label className="radio">
              <input
                type="radio"
                name="tipoNivel"
                value="nivel_2"
                checked={nivel === 'nivel_2'}
                onChange={() => setNivel('nivel_2')}
              />
              Nivel 2 — independiente
            </label>
            <label className="radio">
              <input
                type="radio"
                name="tipoNivel"
                value="nivel_1"
                checked={nivel === 'nivel_1'}
                onChange={() => setNivel('nivel_1')}
              />
              Nivel 1 — personería jurídica
            </label>
          </fieldset>

          {nivel === 'nivel_1' ? (
            <>
              <label>
                RUT (PDF o imagen, máx. 5 MB)
                <input name="rut" type="file" accept=".pdf,image/jpeg,image/png" />
              </label>
              <label>
                Cámara de Comercio
                <input name="camara_comercio" type="file" accept=".pdf,image/jpeg,image/png" />
              </label>
              <label>
                Representación legal
                <input name="representacion_legal" type="file" accept=".pdf,image/jpeg,image/png" />
              </label>
            </>
          ) : (
            <>
              <label>
                Evidencia IDPYBA (opcional si hay carta)
                <input name="evidencia_idpyba" type="file" accept=".pdf,image/jpeg,image/png" />
              </label>
              <label>
                Carta COMVEZCOL (opcional si hay evidencia IDPYBA)
                <input name="carta_comvezcol" type="file" accept=".pdf,image/jpeg,image/png" />
              </label>
            </>
          )}

          {error && <p className="error" role="alert">{error}</p>}
          <button type="submit" className="primario" disabled={enviando}>
            {enviando ? 'Enviando…' : 'Enviar a revisión'}
          </button>
        </form>
      )}

      {!puedeEnviar && !verificada && (
        <p>Tu solicitud está en revisión. El validador te responderá en este mismo tablero.</p>
      )}
    </main>
  );
}
