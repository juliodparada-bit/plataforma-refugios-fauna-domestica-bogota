import type { ReactNode } from 'react';

export function Pagina({
  kicker,
  titulo,
  proposito,
  acciones,
  children,
  className,
}: {
  kicker?: string;
  titulo: string;
  proposito?: string;
  acciones?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={['hoja', className].filter(Boolean).join(' ')}>
      <header className="pagina-cabecera">
        {kicker && <p className="ojo">{kicker}</p>}
        <h1>{titulo}</h1>
        {proposito && <p className="pagina-proposito">{proposito}</p>}
        {acciones}
      </header>
      {children}
    </main>
  );
}
