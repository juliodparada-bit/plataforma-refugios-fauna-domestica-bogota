# Evidencia de Julio David Parada León — semanas 1 a 6

Autor de los commits de prueba: **Julio David Parada León** (`juliodparada-bit`). La revisión cruzada la tiene que correr Brayan en su máquina; este archivo deja el texto que iría en cada pull request.

## Semana 1 — E2E

Flujo: entrar con contraseña incorrecta (`e2e/tests/entrar-contrasena-incorrecta.test.js`).

Mutante corrido: se quitó `role="alert"` del error de `Entrar.tsx` y el test E2E falló con `Error: element(s) not found` en `getByRole('alert')`. Se restauró el rol.

## Semana 2 — Front

Tests de `etiquetaEspecie`, `iniciales` y `nombreVisible`. `iniciales` se sacó de `MenuRol` para poder probarla sin renderizar.

Mutante corrido: `toUpperCase()` pasó a `toLowerCase()`. Vitest falló con `expected 'al' to be 'AL'`. Se restauró.

CI: `.github/workflows/tests.yml` con jobs `frontend`, `backend` y `evidencia-individual`. Un umbral de líneas en 99 hace fallar `npm test`.

## Semana 3 — Front: Entrar

Tres tests del formulario: envío feliz, alerta de contraseña (estado no feliz, con `user-event`) y los enlaces de registro, términos y datos.

Como Julio tuvo Front en S2, también sube el backend por encima del 40% con tests unitarios de puntaje, sellos, sesión y registro.

Mutante corrido: se borró el `setError` del `catch` de `Entrar`. El test falló con `Unable to find role="alert"`. Se restauró.

## Semana 4 — API, recurso principal

Ángulo API: animales y el contrato de entrar. Los tests no abren PostgreSQL: el servicio es un mock y el JWT es un stub.

Casos: catálogo 200 JSON, animal inexistente 404, `GET /animales/mios` en 401 sin sesión, 403 con adoptante y 200 con entidad, JSON mal formado en 400 sin HTML, nombre de 81 caracteres rechazado.

Hallazgo: `POST /animales` aceptaba un nombre de 81 caracteres. La columna `animal.nombre` es `varchar(80)`, así que PostgreSQL respondía error de longitud (500 si el servicio no lo traducía). Corregido con tope de 80 en el servicio y en `PublicarAnimalDto`. Test de límite: 80 se guarda, 81 no llama a `create`.

Mutante corrido: se quitó el tope de 80 en el servicio. El test falló con `Received promise resolved instead of rejected`. Se restauró.

## Semana 5 — E2E con dobles

Inventario de dependencias que el proyecto no controla:

- PostgreSQL (Prisma). En unitarias es un fake; en la semana 6 es la base real.
- Reloj: la reserva de un deseo vence a los 7 días (`DeseosService.reservar` usa `new Date()`).
- Disco: fotos de perfil, de animales, de verificación y de recepción (`fs/promises`).
- El API, visto desde el navegador.

Tests con `page.route` (stub de la red):

- lista de animales vacía
- API caída en el catálogo
- 400 de validación al entrar

Revisión de mocks: el test de catálogo vacío afirma el texto que ve la persona (`Aún no hay historias publicadas`), no que el stub haya sido llamado. No se reescribió: no es un test que solo verifica el doble.

Mutante corrido: el título vacío pasó a «No hay animales». Playwright falló con `element(s) not found` en el heading `Aún no hay historias publicadas`. Se restauró.

## Semana 6 — BD

`docker-compose.yml` levanta PostgreSQL 16 en el puerto **5434**, base `refugios_test`. El desarrollo sigue en `compose.yml`, puerto 5433.

Limpieza: `TRUNCATE ... CASCADE` antes de cada test, porque no hay una transacción que envuelva el `PrismaClient` de varias consultas y queremos el mismo estado aunque un test haga commit.

Los tres tests de integración:

- filtro por especie y `ORDER BY creadoEn DESC` (sin `ORDER BY`, PostgreSQL no promete el orden de inserción)
- el correo de usuario es único
- un nombre de 81 caracteres lo rechaza la tabla; uno de 80 queda guardado

Prueba de fuego: las dos corridas seguidas de `animales.integracion.test.ts` quedaron en verde, con la misma `DATABASE_URL` y el esquema aplicado con `prisma migrate deploy`. En este entorno no hay Docker, así que no se pudo ejecutar `docker compose down -v`; el truncado entre tests es el que deja la segunda corrida igual que la primera.

Mutante corrido: se quitó el `orderBy`. PostgreSQL devolvió `['Antes', 'Después']` y el test esperaba `['Después', 'Antes']`. Se restauró. En esta sesión no hay Docker: las dos corridas verdes se hicieron contra PostgreSQL 16 con `TRUNCATE`, no con `docker compose down -v`. El `docker-compose.yml` queda para correr esa prueba de fuego en el computador de Brayan.
