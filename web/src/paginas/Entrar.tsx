import { FormEvent, useState } from 'react';
import { api, type Usuario } from '../api';
import { CuentasEjemplo } from '../componentes/CuentasEjemplo';

export function Entrar({
  alListo,
  alRegistro,
  alTerminos,
  alDatos,
}: {
  alListo: (u: Usuario) => void;
  alRegistro: () => void;
  alTerminos: () => void;
  alDatos: () => void;
}) {
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const datos = new FormData(e.currentTarget);
    setEnviando(true);
    try {
      const { usuario } = await api.entrar(
        String(datos.get('correo')),
        String(datos.get('contrasena')),
      );
      alListo(usuario);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Correo o contraseña incorrectos.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="hoja">
      <section className="hero hero-corto">
        <p className="ojo">Bienvenido de vuelta</p>
        <h1>Alguien te ha estado esperando.</h1>
        <p className="lema">Cada vez que entras, traes contigo la posibilidad de cambiar algo.</p>
      </section>
      <CuentasEjemplo />
      <form className="formulario" onSubmit={(e) => void enviar(e)}>
        <label>
          Correo
          <input
            name="correo"
            type="email"
            required
            autoComplete="username"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'entrar-error' : undefined}
          />
        </label>
        <label>
          Contraseña
          <input
            name="contrasena"
            type="password"
            required
            autoComplete="current-password"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'entrar-error' : undefined}
          />
        </label>
        {error && (
          <p id="entrar-error" className="error" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="primario" disabled={enviando}>
          {enviando ? 'Abriendo la puerta…' : 'Entrar'}
        </button>
      </form>
      <p>
        <button type="button" className="enlace" onClick={alRegistro}>
          Crear cuenta
        </button>
        {' · '}
        <button type="button" className="enlace" onClick={alTerminos}>
          Términos
        </button>
        {' · '}
        <button type="button" className="enlace" onClick={alDatos}>
          Datos personales
        </button>
      </p>
    </main>
  );
}
