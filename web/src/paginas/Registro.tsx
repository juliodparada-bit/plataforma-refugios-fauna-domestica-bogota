import { FormEvent, useEffect, useState } from 'react';
import { api, type Localidad, type Rol, type Usuario } from '../api';
import { Pagina } from '../componentes/Pagina';

export function Registro({
  alListo,
  alTerminos,
  alDatos,
  rolInicial,
}: {
  alListo: (u: Usuario) => void;
  alTerminos: () => void;
  alDatos: () => void;
  rolInicial?: Exclude<Rol, 'validador'>;
}) {
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [rol, setRol] = useState<Exclude<Rol, 'validador'> | ''>(rolInicial ?? '');
  const [terminosOk, setTerminosOk] = useState(false);
  const [datosOk, setDatosOk] = useState(false);

  useEffect(() => {
    api.localidades().then(setLocalidades).catch(() => setError('No pude cargar las localidades.'));
  }, []);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const datos = new FormData(e.currentTarget);
    const consentimiento = datos.get('consentimiento') === 'on';
    const terminos = datos.get('terminos') === 'on';
    if (!consentimiento || !terminos) {
      setError('Debes aceptar los términos y el tratamiento de datos personales.');
      return;
    }
    setEnviando(true);
    try {
      const { usuario } = await api.registro({
        nombre: String(datos.get('nombre')),
        correo: String(datos.get('correo')),
        contrasena: String(datos.get('contrasena')),
        localidadId: String(datos.get('localidadId')),
        rol: String(datos.get('rol')) as Exclude<Rol, 'validador'>,
        consentimientoDatos: true,
      });
      alListo(usuario);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Pagina
      className="hoja-estrecha"
      kicker="Registro"
      titulo="Crear cuenta"
      proposito="Elige cómo vas a participar: adoptar, donar un insumo o publicar desde un hogar de paso."
    >
      <p className="ayuda">
        Si quieres explorar primero, usa las cuentas de piloto al entrar.
      </p>
      <form
        className="formulario"
        onSubmit={(e) => void enviar(e)}
        aria-describedby={error ? 'registro-error' : undefined}
      >
        <label>
          Nombre
          <input name="nombre" required maxLength={120} autoComplete="name" />
        </label>
        <label>
          Correo
          <input name="correo" type="email" required autoComplete="email" />
        </label>
        <label>
          Contraseña
          <input name="contrasena" type="password" required minLength={8} autoComplete="new-password" />
        </label>
        <label>
          Localidad en Bogotá
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
        <fieldset>
          <legend>Quiero ser</legend>
          <div className="roles">
            <label className="rol-card">
              <input
                type="radio"
                name="rol"
                value="adoptante"
                required
                checked={rol === 'adoptante'}
                onChange={() => setRol('adoptante')}
              />
              <span className="guia-icono" aria-hidden="true">
                🐾
              </span>
              <strong>Quiero adoptar</strong>
              <span>Cinco preguntas honestas. Un puntaje que explica por qué encajan.</span>
            </label>
            <label className="rol-card">
              <input
                type="radio"
                name="rol"
                value="donante"
                checked={rol === 'donante'}
                onChange={() => setRol('donante')}
              />
              <span className="guia-icono" aria-hidden="true">
                🌾
              </span>
              <strong>Quiero donar un insumo</strong>
              <span>Reservas algo concreto: alimento, medicina, aseo. Sabes exactamente a dónde va.</span>
            </label>
            <label className="rol-card">
              <input
                type="radio"
                name="rol"
                value="entidad"
                checked={rol === 'entidad'}
                onChange={() => setRol('entidad')}
              />
              <span className="guia-icono" aria-hidden="true">
                🏠
              </span>
              <strong>Soy un refugio o hogar de paso</strong>
              <span>Publicas historias reales cuando el sello esté aprobado. La comunidad te respalda.</span>
            </label>
          </div>
        </fieldset>
        {rol === 'entidad' && (
          <p className="ayuda">
            Podrás publicar animales e ítems cuando la verificación esté aprobada.
          </p>
        )}
        <aside className="aviso aviso-datos">
          <p>
            Recogemos nombre, correo, localidad y rol para operar la cuenta. La
            contraseña se guarda con hash. Las evidencias de verificación y el
            contacto del donante no son públicos.
          </p>
        </aside>
        <label className="radio">
          <input
            type="checkbox"
            name="terminos"
            checked={terminosOk}
            onChange={(e) => setTerminosOk(e.target.checked)}
          />
          <span>
            Acepto los{' '}
            <button type="button" className="enlace" onClick={alTerminos}>
              términos y condiciones
            </button>
          </span>
        </label>
        <label className="radio">
          <input
            type="checkbox"
            name="consentimiento"
            checked={datosOk}
            onChange={(e) => setDatosOk(e.target.checked)}
          />
          <span>
            Autorizo el{' '}
            <button type="button" className="enlace" onClick={alDatos}>
              tratamiento de datos
            </button>{' '}
            (Ley 1581 de 2012)
          </span>
        </label>
        <p className="ayuda">El rol validador no se crea desde aquí.</p>
        {error && (
          <p id="registro-error" className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="primario" disabled={enviando || !terminosOk || !datosOk}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </Pagina>
  );
}
