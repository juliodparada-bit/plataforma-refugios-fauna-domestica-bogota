import { useEffect, useState } from 'react';
import { api } from '../api';
import { nombreVisible } from '../demo';

type Fila = {
  id: string;
  puntaje: number;
  fraseExplicable: string;
  estado: string;
  animal: { id: string; nombre: string; estado: string };
};

export function MisPostulaciones({ alVolver }: { alVolver: () => void }) {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void api
      .misPostulaciones()
      .then((lista) => setFilas(lista as Fila[]))
      .catch((e) => setError(e instanceof Error ? e.message : 'No pude cargar.'));
  }, []);

  return (
    <main className="hoja">
      <button type="button" className="enlace" onClick={alVolver}>
        ← Tablero
      </button>
      <h1>Mis postulaciones</h1>
      {error && <p className="error" role="alert">{error}</p>}
      {filas.length === 0 && !error && <p>Aún no te has postulado.</p>}
      <ul className="lista">
        {filas.map((p) => (
          <li key={p.id}>
            <strong>{nombreVisible(p.animal.nombre)}</strong>
            <p>
              {p.estado} · {p.puntaje} · animal {p.animal.estado}
            </p>
            <p>{p.fraseExplicable}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
