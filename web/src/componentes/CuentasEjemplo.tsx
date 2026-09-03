import { NombreMarca } from './Marca';

export const CUENTAS_PILOTO = [
  {
    rol: 'Entidad verificada (Nivel 1)',
    correo: 'entidad.ejemplo@local.test',
    clave: 'EjemploLocal123',
  },
  {
    rol: 'Adoptante (ya respondió las 5 preguntas)',
    correo: 'adoptante.ejemplo@local.test',
    clave: 'EjemploLocal123',
  },
  {
    rol: 'Donante de insumos',
    correo: 'donante.ejemplo@local.test',
    clave: 'EjemploLocal123',
  },
] as const;

export function CuentasEjemplo() {
  return (
    <aside className="aviso aviso-ejemplo">
      <p className="ojo">Cuentas de piloto</p>
      <p>
        Sirven para recorrer <NombreMarca className="es-en-linea" /> en local. No son personas ni refugios reales.
        Las tres usan la clave <code>EjemploLocal123</code>.
      </p>
      <ul className="lista-ejemplo">
        {CUENTAS_PILOTO.map((c) => (
          <li key={c.correo}>
            <strong>{c.rol}</strong>
            <br />
            {c.correo}
          </li>
        ))}
      </ul>
      <p className="ayuda">
        Validador del piloto (tampoco es un funcionario real): validador@local.test /
        CambiaEsto123
      </p>
    </aside>
  );
}
