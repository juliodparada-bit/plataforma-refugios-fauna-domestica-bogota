# Matriz de rotación de capas

Carpeta `docs/`: artefactos del **bootcamp de pruebas** (rotación por semanas). El expediente ADSO (formulación, ERS, HU, arquitectura, cierre T6) está en `documentacion/`. No son el mismo hilo.

**Grupo**: Mestizo · **Ficha**: 3228973 B · **Stack**: React + NestJS + PostgreSQL

| Integrante (usuario GitHub) | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 |
|---|---|---|---|---|---|---|---|---|---|
| @juliodparada-bit | E2E (PR #6, `main`) | Front (PR #7, `main`) | Front: Entrar (PR #9, `main`) | API (PR #11, `main`) | | | | | |
| @brayaansanchezp29-debug | pendiente | | | | | | | | |

**S5 y S6 no están en `main`.** Viven en los PR **abiertos** [#13](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/13) (`page.route`) y [#14](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/14) (Postgres 5434). No se asignan aquí como capa cerrada. El [PR #16](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/16) (camino de auditoría) lo fusiona Brayan; ese archivo no está en este árbol.

Umbrales **vigentes** (archivos): `web/vite.config.ts` 75 / 75 / 77 / 70 (`testTimeout` 20000); `api/jest.config.cjs` 88 / 88 / 92 / 70. Front no se toca. El piso de API S4 entró a `main` por el [PR #17](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/17).

---

## Cobertura semanal (histórica)

Línea base **de esa semana**, no el umbral de hoy. En S1 el frontend aún no tenía tests de interfaz (piso 0). Hoy sí los tiene (Vitest en `web/src/**/*.test.ts(x)`). El backend de S1 salía de `puntaje.spec.ts` y `token.spec.ts`.

| Semana | Frontend (%) | Backend (%) | Umbral configurado entonces | Estado |
|---|---|---|---|---|
| S1 | 0 | 4 | 0 en el frontend. Backend: 4 líneas y 3 ramas | En `main` (PR #6) |
| S2 | 58 | 47 | 58 y 47 | En `main` (PR #7 / #8) |
| S3 | 75 | 47 | 75 y 47. El backend ya superaba el 40 | En `main` (PR #9 / #10) |
| S4 | 75 (archivo) | 88 | Contrato HTTP (PR #11) + umbral API max(50, 88) = 88/88/92/70 | En `main`: código #11, umbral [#17](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/17). El #12 fusionó el mismo bump a `test/semana-04` (rama equivocada) |
| S5 | — | — | `page.route` | PR #13 **abierto** |
| S6 | — | — | Postgres **5434** | PR #14 **abierto** |

---

## Registro de vocero aleatorio

| Semana | Vocero | Capa preguntada | Respuesta escrita | Resultado |
|---|---|---|---|---|
| S1 | Julio David Parada León | E2E | El test `entrar-contrasena-incorrecta` entra con una clave que no existe y espera la alerta «Correo o contraseña incorrectos.». Arrange abre la página. Act llena el formulario y pulsa Entrar. Assert busca `role=alert`. El mutante fue quitar `role="alert"`: Playwright falló con `element(s) not found`. | |
