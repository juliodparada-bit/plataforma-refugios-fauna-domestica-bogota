# Matriz de rotación de capas

Este archivo, en `main`, es el registro de la rotación. Los números que mandan son los de `web/vite.config.ts` y `api/jest.config.cjs`. Lo que todavía no está fusionado se cita por pull request y no se cuenta como parte de `main`.

**Grupo**: Mestizo · **Ficha**: 3228973 B · **Stack**: React + NestJS + PostgreSQL

| Integrante (usuario GitHub) | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 |
|---|---|---|---|---|---|---|---|---|---|
| @juliodparada-bit | E2E | Front | Front: Entrar | API | E2E, PR #13 | BD, PR #14 | | | |
| @brayaansanchezp29-debug | revisó el #6 | revisó el #7 y el #8 | revisó el #9 y el #10 | revisó el #11 | pendiente | pendiente | | | |

## Cobertura en main

El porcentaje es de líneas. El umbral configurado es el de los archivos de esta rama.

| Semana | Frontend (líneas) | Backend (líneas) | Umbral que quedó en main |
|---|---|---|---|
| S1 | 0 | 4 | Frontend en 0. Backend: 4 líneas y 3 ramas |
| S2 | 58 | 47 | Frontend 58/58/66/56. Backend 47/47/43/37 |
| S3 | 75 | 47 | Frontend 75/75/77/70. Backend se quedó en 47/47/43/37 |
| S4 | 75 | 88 medidos por Brayan | El contrato HTTP está en main (PR #11). El umbral del backend no subió: sigue 47/47/43/37. La subida a 88/88/92/70 es el PR #12, abierto |

## Fuera de main

| Semana | Pull request | Qué aporta | Base actual |
|---|---|---|---|
| S4, umbral | #12 | Solo el umbral del backend | `test/semana-04`, no `main` |
| S5 | #13 | E2E con `page.route` | `test/semana-04-umbral`, no `main` |
| S6 | #14 | PostgreSQL de pruebas en el puerto 5434 | `test/semana-05`, no `main` |

Esas tres ramas no contienen el commit `040b6c4` (`testTimeout` de 20 segundos). Ese commit sí está en `main`, dentro del PR #9.

## Registro de vocero aleatorio

El resultado lo anota el instructor.

| Semana | Vocero | Capa preguntada | Respuesta escrita | Resultado |
|---|---|---|---|---|
| S1 | Julio David Parada León | E2E | El test `entrar-contrasena-incorrecta` entra con una clave que no existe y espera la alerta «Correo o contraseña incorrectos.». Arrange abre la página. Act llena el formulario y pulsa Entrar. Assert busca `role=alert`. El mutante fue quitar `role="alert"`: Playwright falló con `element(s) not found`. | |
| S4 | Julio David Parada León | API | Un nombre de 81 caracteres no llama a `create`. La columna `animal.nombre` es `varchar(80)`. El mutante fue quitar el tope: el test recibió la promesa resuelta en vez de rechazada. El DTO también rechaza el nombre con `@MaxLength(80)`, y Brayan lo comprobó moviendo el tope del servicio a 90. | |

La respuesta de la semana 6 (puerto 5434, `TRUNCATE ... CASCADE` y el `ORDER BY creadoEn DESC`) está escrita en el cuerpo del PR #14. Ese `docker-compose.yml` no está en `main`.

## Regla de rama

No se fusiona un pull request con el workflow `tests` en rojo. Brayan aprueba antes de fusionar.
