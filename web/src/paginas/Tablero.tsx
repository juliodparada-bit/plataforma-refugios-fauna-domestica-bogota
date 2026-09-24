import { FormEvent, useEffect, useState } from 'react';
import { api, type Localidad, type Usuario } from '../api';
import { Pagina } from '../componentes/Pagina';
import { nombreVisible } from '../demo';
import { etiquetaRol, etiquetaSello } from '../etiquetas';

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const letras = (partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '');
  return letras.toUpperCase() || '?';
}

function fechaCorta(iso?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function Tablero({
  usuario,
  alActualizar,
  alVerificacion,
  alCola,
  alAlta,
  alPostulaciones,
  alCuestionario,
  alDeseos,
  alCatalogo,
  alNecesidades,
  alMisPostulaciones,
}: {
  usuario: Usuario;
  alActualizar: (u: Usuario) => void;
  alVerificacion: () => void;
  alCola: () => void;
  alAlta: () => void;
  alPostulaciones: () => void;
  alCuestionario: () => void;
  alDeseos: () => void;
  alCatalogo: () => void;
  alNecesidades: () => void;
  alMisPostulaciones: () => void;
}) {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [editando, setEditando] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [vistaFoto, setVistaFoto] = useState<string | null>(null);
  const [fotoRota, setFotoRota] = useState(false);

  useEffect(() => {
    void api.localidades().then(setLocalidades).catch(() => undefined);
  }, []);

  useEffect(() => {
    setFotoRota(false);
  }, [usuario.fotoUrl, vistaFoto]);

  useEffect(() => {
    return () => {
      if (vistaFoto) URL.revokeObjectURL(vistaFoto);
    };
  }, [vistaFoto]);

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setOk('');
    const datos = new FormData(e.currentTarget);
    setEnviando(true);
    try {
      const actualizado = await api.actualizarCuenta({
        nombre: String(datos.get('nombre')),
        localidadId: String(datos.get('localidadId')),
        entidadNombre:
          usuario.rol === 'entidad' ? String(datos.get('entidadNombre') ?? '') : undefined,
      });
      alActualizar(actualizado);
      setEditando(false);
      setOk('Tus datos quedaron actualizados.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pude guardar los cambios.');
    } finally {
      setEnviando(false);
    }
  }

  async function cambiarFoto(archivo: File | undefined) {
    if (!archivo) return;
    setError('');
    setOk('');
    if (vistaFoto) URL.revokeObjectURL(vistaFoto);
    setVistaFoto(URL.createObjectURL(archivo));
    setSubiendoFoto(true);
    try {
      const actualizado = await api.subirFotoPerfil(archivo);
      alActualizar(actualizado);
      setOk('La foto de perfil ya está en tu cuenta.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pude subir la foto.');
    } finally {
      setSubiendoFoto(false);
    }
  }

  const foto = !fotoRota ? (vistaFoto ?? usuario.fotoUrl ?? null) : null;
  const nombre = nombreVisible(usuario.nombre);

  return (
    <Pagina
      kicker={etiquetaRol(usuario.rol)}
      titulo="Cuenta"
      proposito="Foto, datos personales y atajos de tu rol. El correo identifica la sesión."
    >
      <section className="identidad" aria-labelledby="identidad-nombre">
        <div className="identidad-foto">
          {foto ? (
            <img src={foto} alt={`Foto de ${nombre}`} onError={() => setFotoRota(true)} />
          ) : (
            <span className="cuenta-iniciales" aria-hidden="true">
              {iniciales(nombre)}
            </span>
          )}
          <label className="cuenta-foto-accion">
            <span>{subiendoFoto ? 'Subiendo…' : foto ? 'Cambiar foto' : 'Agregar foto'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={subiendoFoto}
              onChange={(e) => void cambiarFoto(e.target.files?.[0])}
            />
          </label>
        </div>

        <div className="identidad-quien">
          <h2 id="identidad-nombre">{nombre}</h2>
          <p className="identidad-meta">
            {etiquetaRol(usuario.rol)} · {usuario.localidad}
          </p>
          <p className="identidad-correo">{usuario.correo}</p>
        </div>

        {!editando ? (
          <div className="identidad-datos">
            <dl className="cuenta-lista">
              {usuario.rol === 'entidad' && usuario.entidad && (
                <>
                  <div>
                    <dt>Hogar</dt>
                    <dd>{nombreVisible(usuario.entidad.nombre)}</dd>
                  </div>
                  <div>
                    <dt>Sello</dt>
                    <dd>
                      <span className="etiqueta etiqueta-sello">
                        {etiquetaSello(usuario.entidad.estadoVerificacion)}
                      </span>
                      {usuario.entidad.puedePublicar ? ' · Puedes publicar' : ' · Aún no publicas'}
                    </dd>
                  </div>
                </>
              )}
              {usuario.rol === 'adoptante' && (
                <div>
                  <dt>Cuestionario</dt>
                  <dd>
                    {usuario.tienePerfilAdoptante
                      ? 'Las 5 preguntas del hogar ya están respondidas.'
                      : 'Todavía no contaste cómo es tu hogar.'}
                  </dd>
                </div>
              )}
              {usuario.rol === 'donante' && (
                <div>
                  <dt>Donaciones</dt>
                  <dd>Reservas ítems en especie. Tu contacto no sale en la bitácora pública.</dd>
                </div>
              )}
              {usuario.rol === 'validador' && (
                <div>
                  <dt>Labor</dt>
                  <dd>Revisas evidencias de hogares. No te autoasignas en el registro público.</dd>
                </div>
              )}
              {usuario.consentimientoEn && (
                <div>
                  <dt>Datos personales</dt>
                  <dd>Autorizaste el tratamiento el {fechaCorta(usuario.consentimientoEn)} (Ley 1581).</dd>
                </div>
              )}
            </dl>
            <button
              type="button"
              className="secundario"
              onClick={() => {
                setEditando(true);
                setOk('');
                setError('');
              }}
            >
              Editar datos
            </button>
          </div>
        ) : (
          <form className="formulario cuenta-form" onSubmit={(e) => void guardar(e)}>
            <label>
              Nombre
              <input name="nombre" required maxLength={120} defaultValue={usuario.nombre} autoComplete="name" />
            </label>
            {usuario.rol === 'entidad' && usuario.entidad && (
              <label>
                Nombre del hogar
                <input
                  name="entidadNombre"
                  required
                  maxLength={160}
                  defaultValue={usuario.entidad.nombre}
                />
              </label>
            )}
            <label>
              Localidad en Bogotá
              <select name="localidadId" required defaultValue={usuario.localidadId ?? ''}>
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
              Correo
              <input value={usuario.correo} disabled readOnly />
            </label>
            <p className="ayuda">El correo identifica la sesión. Si necesitas cambiarlo, escribe a quien opera el piloto.</p>
            <div className="acciones acciones-fila">
              <button type="button" className="secundario" onClick={() => setEditando(false)} disabled={enviando}>
                Cancelar
              </button>
              <button type="submit" className="primario" disabled={enviando}>
                {enviando ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        )}
        {ok && (
          <p className="ayuda" role="status">
            {ok}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </section>

      {usuario.rol === 'entidad' && usuario.entidad && (
        <aside className="aviso aviso-datos">
          {usuario.entidad.puedePublicar ? (
            <p>
              Sello {usuario.entidad.estadoVerificacion === 'nivel_1' ? 'Nivel 1' : 'Nivel 2'}.
              Publica historia y foto; pide insumos sin recaudo.
            </p>
          ) : (
            <p>Aún no puedes publicar. Envía la solicitud de verificación; el validador la revisa.</p>
          )}
        </aside>
      )}

      <h2 className="tablero-titulo">Atajos</h2>
      <div className="tablero-grid">
        {usuario.rol === 'entidad' && usuario.entidad && (
          <>
            <button type="button" className="atajo" onClick={alVerificacion}>
              <span className="atajo-icono" aria-hidden="true">
                ✦
              </span>
              <strong>{usuario.entidad.puedePublicar ? 'Tu sello' : 'Solicitar verificación'}</strong>
              <span>
                {usuario.entidad.puedePublicar
                  ? 'Nivel aprobado. Puedes publicar.'
                  : 'Envía evidencias para Nivel 1 o Nivel 2.'}
              </span>
            </button>
            {usuario.entidad.puedePublicar && (
              <>
                <button type="button" className="atajo" onClick={alAlta}>
                  <span className="atajo-icono" aria-hidden="true">
                    🐾
                  </span>
                  <strong>Publicar un animal</strong>
                  <span>Historia, foto y convivencia. La raza no es el título.</span>
                </button>
                <button type="button" className="atajo" onClick={alPostulaciones}>
                  <span className="atajo-icono" aria-hidden="true">
                    📋
                  </span>
                  <strong>Postulaciones</strong>
                  <span>Puntaje explicable. Preselecciona o entrega.</span>
                </button>
                <button type="button" className="atajo" onClick={alDeseos}>
                  <span className="atajo-icono" aria-hidden="true">
                    🌾
                  </span>
                  <strong>Lista de deseos</strong>
                  <span>Alimento, medicina o aseo. Sin recaudo.</span>
                </button>
              </>
            )}
          </>
        )}
        {usuario.rol === 'adoptante' && (
          <>
            <button type="button" className="atajo" onClick={alCatalogo}>
              <span className="atajo-icono" aria-hidden="true">
                🐾
              </span>
              <strong>Catálogo</strong>
              <span>Historias en espera. Filtra por especie y localidad.</span>
            </button>
            <button type="button" className="atajo" onClick={alCuestionario}>
              <span className="atajo-icono" aria-hidden="true">
                🏡
              </span>
              <strong>{usuario.tienePerfilAdoptante ? 'Actualizar mi hogar' : 'Cinco preguntas del hogar'}</strong>
              <span>Vivienda, compañía, niños, otros animales y energía.</span>
            </button>
            <button type="button" className="atajo" onClick={alMisPostulaciones}>
              <span className="atajo-icono" aria-hidden="true">
                📋
              </span>
              <strong>Mis postulaciones</strong>
              <span>El estado de lo que ya enviaste al refugio.</span>
            </button>
          </>
        )}
        {usuario.rol === 'donante' && (
          <>
            <button type="button" className="atajo" onClick={alNecesidades}>
              <span className="atajo-icono" aria-hidden="true">
                🌾
              </span>
              <strong>Necesidades</strong>
              <span>Hogares con sello e ítems pendientes. Reserva en especie.</span>
            </button>
            <button type="button" className="atajo" onClick={alCatalogo}>
              <span className="atajo-icono" aria-hidden="true">
                🐾
              </span>
              <strong>Catálogo</strong>
              <span>También puedes leer las historias. Donar no pide postularte.</span>
            </button>
          </>
        )}
        {usuario.rol === 'validador' && (
          <button type="button" className="atajo" onClick={alCola}>
            <span className="atajo-icono" aria-hidden="true">
              ✅
            </span>
            <strong>Cola de validación</strong>
            <span>Evidencias pendientes: aprobar, rechazar o pedir complemento.</span>
          </button>
        )}
      </div>
    </Pagina>
  );
}
