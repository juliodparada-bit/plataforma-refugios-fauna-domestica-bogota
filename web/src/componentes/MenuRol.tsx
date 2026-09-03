import type { Usuario } from '../api';
import type { Pagina } from '../navegacion';

export function MenuRol({
  clase,
  pagina,
  usuario,
  alIr,
  alSalir,
}: {
  clase: string;
  pagina: Pagina;
  usuario: Usuario | null;
  alIr: (p: Pagina) => void;
  alSalir: () => void;
}) {
  const props = (p: Pagina) => ({
    type: 'button' as const,
    className: pagina === p ? 'activo' : undefined,
    'aria-current': pagina === p ? ('page' as const) : undefined,
    onClick: () => alIr(p),
  });

  return (
    <nav
      className={clase}
      aria-label={clase === 'menu-movil' ? 'Principal, barra inferior' : 'Principal'}
    >
      <button {...props('catalogo')}>Catálogo</button>
      {!usuario && (
        <>
          <button {...props('entrar')}>Entrar</button>
          <button {...props('registro')}>Crear cuenta</button>
        </>
      )}
      {usuario?.rol === 'adoptante' && (
        <button {...props('misPostulaciones')}>Postulaciones</button>
      )}
      {usuario?.rol === 'entidad' && usuario.entidad?.puedePublicar && (
        <>
          <button {...props('postulaciones')}>Postulaciones</button>
          <button {...props('deseos')}>Deseos</button>
          <button {...props('alta')}>Publicar</button>
        </>
      )}
      {usuario?.rol === 'validador' && <button {...props('cola')}>Cola</button>}
      {usuario && (
        <>
          <button {...props('tablero')}>Cuenta</button>
          <button type="button" onClick={alSalir}>
            Salir
          </button>
        </>
      )}
    </nav>
  );
}
