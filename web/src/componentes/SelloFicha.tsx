import type { CSSProperties, ReactNode } from 'react';

export function SelloFicha({
  children,
  activo,
  texto,
  compacto,
  className,
  style,
}: {
  children?: ReactNode;
  activo: boolean;
  texto: string;
  compacto?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  if (!activo || !texto) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={['sello-ficha', compacto ? 'es-compacto' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {children}
      <span className="sello-ficha-marca" aria-hidden="true">
        {texto}
      </span>
    </div>
  );
}
