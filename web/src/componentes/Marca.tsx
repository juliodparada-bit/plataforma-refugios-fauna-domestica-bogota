import { ESLOGAN, NOMBRE_MARCA } from '../marca';

export function NombreMarca({
  className,
  as: Tag = 'span',
}: {
  className?: string;
  as?: 'span' | 'strong';
}) {
  return (
    <Tag className={['nombre-marca', className].filter(Boolean).join(' ')}>
      {NOMBRE_MARCA}
    </Tag>
  );
}

export function SimboloMarca({ tamano = 36 }: { tamano?: number }) {
  return (
    <img
      className="marca-simbolo"
      src="/marca.png"
      width={tamano}
      height={tamano}
      alt=""
      aria-hidden="true"
    />
  );
}

export function Marca({
  as = 'button',
  onClick,
}: {
  as?: 'button' | 'div';
  onClick?: () => void;
}) {
  const contenido = (
    <>
      <SimboloMarca />
      <span className="marca-texto">
        <NombreMarca className="marca-nombre" />
        <span className="marca-eslogan">{ESLOGAN}</span>
      </span>
    </>
  );

  if (as === 'div') {
    return <div className="marca">{contenido}</div>;
  }

  return (
    <button type="button" className="marca" onClick={onClick}>
      {contenido}
    </button>
  );
}
