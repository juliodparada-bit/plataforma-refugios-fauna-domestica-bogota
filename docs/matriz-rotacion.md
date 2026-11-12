# Matriz de rotación de capas

> Parte de Julio David Parada León, al cierre de la semana 6. Brayan Alejandro Sánchez todavía no tiene commits de prueba de este bootcamp en el repo.

**Grupo**: Mestizo · **Ficha**: 3228973 B · **Stack**: React + NestJS (sobre Express) + PostgreSQL

Capas: **Front** (React) · **API** (backend) · **BD** (integración) · **E2E** (Playwright)

Reglas:

- Cada semana se cambia de capa. En la semana 3 todo el grupo va a Front, como pide el reto.
- El grupo es de dos. No hay una tercera persona para la capa E2E de la semana 2: Julio monta el workflow y sus tests de esa semana siguen siendo de Front.
- Quien revisa el PR debe haber trabajado otra capa. Esa revisión es de Brayan y queda pendiente.

| Integrante (usuario GitHub) | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 |
|---|---|---|---|---|---|---|---|---|---|
| @juliodparada-bit | E2E | Front | Front: Entrar | API | E2E | BD | | | |
| @brayaansanchezp29-debug | pendiente | pendiente | pendiente | pendiente | pendiente | pendiente | | | |

## Cobertura semanal

El porcentaje es de **líneas** sobre la lógica medida (ver los comentarios de exclusión en `api/jest.config.cjs` y `web/vite.config.ts`). El umbral configurado al cerrar la semana 6 es 70 en líneas, sentencias y ramas. En el frontend las funciones quedan en 49, que es la cobertura real redondeada hacia abajo.

| Semana | Frontend (%) | Backend (%) | Umbral configurado para la semana siguiente |
|---|---|---|---|
| S1 (línea base) | 0 | cobertura de `puntaje.spec.ts` y `token.spec.ts`, sin umbral en CI | el piso medido, sin bajar |
| S6 | 72 | 88 | 70 líneas / sentencias / ramas. Funciones del frontend: 49 |

## Registro de vocero aleatorio

Julio deja escrita la respuesta de preparación. El resultado lo anota el instructor.

| Semana | Vocero | Capa preguntada | Respuesta escrita | Resultado (Alto / Medio / Bajo) |
|---|---|---|---|---|
| S1 | Julio David Parada León | E2E | El test `entrar-contrasena-incorrecta` comprueba el login fallido, que es crítico porque el mensaje no debe decir si el correo existe. Arrange prepara la visita y la respuesta 401; Act llena el formulario y pulsa Entrar; Assert busca el `role=alert`. Falla si se quita el texto de la alerta o si el formulario deja de enviar el correo. | |
| S6 | Julio David Parada León | BD | El test del nombre de 81 caracteres falla en PostgreSQL (`varchar(80)`) aunque un repositorio falso lo dejaría pasar. La limpieza es `TRUNCATE ... CASCADE` antes de cada test. La conexión sale de `DATABASE_URL` (puerto 5434, base `refugios_test`), no de la base de desarrollo del puerto 5433. | |

## Regla de rama

El grupo aplica la regla a mano: no se fusiona un PR con el workflow `tests` en rojo. En este repo público se puede activar el ruleset `main protegida` con los checks `frontend` y `backend` cuando haya permisos de administración.

## Navegación de la evidencia

Los mutantes, el inventario de dependencias y la prueba de fuego están en [evidencia/semanas-01-a-06.md](evidencia/semanas-01-a-06.md).
