export const CUENTAS_EJEMPLO = [
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
      <p className="ojo">Solo ejemplos de demostración</p>
      <p>
        Estas cuentas no son personas ni refugios reales. Sirven para probar cada
        rol en local. La contraseña de las tres es <code>EjemploLocal123</code>.
      </p>
      <ul className="lista-ejemplo">
        {CUENTAS_EJEMPLO.map((c) => (
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
