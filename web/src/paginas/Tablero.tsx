import { etiquetaRol } from '../etiquetas';
import type { Usuario } from '../api';
import { SelloFicha } from '../componentes/SelloFicha';
import { esFichaDemo, marcaDiagonal, nombreVisible } from '../demo';

export function Tablero({
  usuario,
  alVerificacion,
  alCola,
  alAlta,
  alPostulaciones,
  alCuestionario,
  alDeseos,
  alCatalogo,
  alMisPostulaciones,
}: {
  usuario: Usuario;
  alVerificacion: () => void;
  alCola: () => void;
  alAlta: () => void;
  alPostulaciones: () => void;
  alCuestionario: () => void;
  alDeseos: () => void;
  alCatalogo: () => void;
  alMisPostulaciones: () => void;
}) {
  return (
    <SelloFicha
      activo={esFichaDemo({ demo: usuario.demo, correo: usuario.correo, nombre: usuario.nombre })}
      texto={marcaDiagonal(usuario.nombre)}
      className="es-hoja"
    >
    <main className="hoja">
      <section className="hero hero-corto">
        <p className="ojo">{etiquetaRol(usuario.rol)}</p>
        <h1>
          {usuario.rol === 'adoptante' && 'Alguien ahí afuera todavía no sabe que tú eres su hogar.'}
          {usuario.rol === 'donante' && 'Un bulto de alimento es amor en forma tangible. Gracias por estar aquí.'}
          {usuario.rol === 'entidad' && 'Cada historia que publicas es una puerta que se abre. Sigues haciendo la diferencia.'}
          {usuario.rol === 'validador' && 'Tu criterio protege a quienes no tienen voz. Eso vale mucho.'}
        </h1>
        <p>Bienvenido, {nombreVisible(usuario.nombre)}. Desde {usuario.localidad} haces más grande este círculo de bien.</p>
      </section>

      {usuario.rol === 'entidad' && usuario.entidad && (
        <aside className="aviso aviso-datos">
          {usuario.entidad.puedePublicar ? (
            <p>
              Sello {usuario.entidad.estadoVerificacion === 'nivel_1' ? 'Nivel 1' : 'Nivel 2'}.
              Publica historia y foto; pide insumos sin recaudo.
            </p>
          ) : (
            <p>
              Aún no puedes publicar. Envía la solicitud de verificación;
              el validador la revisa.
            </p>
          )}
        </aside>
      )}

      <div className="tablero-grid">
        {usuario.rol === 'entidad' && usuario.entidad && (
          <>
            <button type="button" className="atajo" onClick={alVerificacion}>
              <strong>{usuario.entidad.puedePublicar ? 'Tu sello verificado ✓' : 'Solicitar verificación'}</strong>
              <span>{usuario.entidad.puedePublicar ? 'La comunidad ya confía en ti.' : 'Un paso pequeño que abre muchas puertas.'}</span>
            </button>
            {usuario.entidad.puedePublicar && (
              <>
                <button type="button" className="atajo" onClick={alAlta}>
                  <strong>Contar la historia de un animal</strong>
                  <span>Su nombre, su energía, lo que lo hace único. La historia va primero.</span>
                </button>
                <button type="button" className="atajo" onClick={alPostulaciones}>
                  <strong>Ver quién quiere adoptarlo</strong>
                  <span>Personas reales, con puntaje real. Tú eliges a quien le confías ese corazón.</span>
                </button>
                <button type="button" className="atajo" onClick={alDeseos}>
                  <strong>Lo que necesitas hoy</strong>
                  <span>Alimento, medicina o aseo. La comunidad responde cuando puede ver exactamente qué ayudar.</span>
                </button>
              </>
            )}
          </>
        )}
        {usuario.rol === 'adoptante' && (
          <>
            <button type="button" className="atajo" onClick={alCatalogo}>
              <strong>Conocer a quien espera 🐾</strong>
              <span>Lee su historia primero. Cuando algo resuene, ya sabrás.</span>
            </button>
            <button type="button" className="atajo" onClick={alCuestionario}>
              <strong>{usuario.tienePerfilAdoptante ? 'Actualizar mi hogar' : 'Cuéntanos cómo es tu hogar'}</strong>
              <span>5 preguntas honestas. Para que el animal que llegue se sienta donde debe estar.</span>
            </button>
            <button type="button" className="atajo" onClick={alMisPostulaciones}>
              <strong>Mis postulaciones</strong>
              <span>Cada una es una semilla. El refugio ve tu historia, no solo un número.</span>
            </button>
          </>
        )}
        {usuario.rol === 'donante' && (
          <button type="button" className="atajo" onClick={alCatalogo}>
            <strong>Ver qué refugio necesita ayuda hoy</strong>
            <span>Un bulto, unas pipetas. Lo que des llegará exactamente a donde tiene que llegar.</span>
          </button>
        )}
        {usuario.rol === 'validador' && (
          <button type="button" className="atajo" onClick={alCola}>
            <strong>Revisar solicitudes pendientes</strong>
            <span>Tu criterio abre la puerta a refugios que quieren hacer las cosas bien.</span>
          </button>
        )}
      </div>
    </main>
    </SelloFicha>
  );
}
