import { useEffect, useState } from 'react';
import type { Usuario } from '../api';
import type { Pagina } from '../navegacion';

function iniciales(nombre: string) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  const letras = (partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '');
  return letras.toUpperCase() || '?';
}

function AvatarMenu({ usuario }: { usuario: Usuario }) {
  const [rota, setRota] = useState(false);
  useEffect(() => {
    setRota(false);
  }, [usuario.fotoUrl]);

  if (usuario.fotoUrl && !rota) {
    return (
      <img
        className="menu-avatar"
        src={usuario.fotoUrl}
        alt=""
        onError={() => setRota(true)}
      />
    );
  }
  return (
    <span className="menu-avatar" aria-hidden="true">
      {iniciales(usuario.nombre)}
    </span>
  );
}

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
      {!usuario && <button {...props('inicio')}>Inicio</button>}
      {usuario?.rol === 'donante' && (
        <button {...props('necesidades')}>Necesidades</button>
      )}
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
          <button {...props('tablero')} aria-label="Cuenta" title="Cuenta">
            <AvatarMenu usuario={usuario} />
          </button>
          <button type="button" onClick={alSalir}>
            Salir
          </button>
        </>
      )}
    </nav>
  );
}
