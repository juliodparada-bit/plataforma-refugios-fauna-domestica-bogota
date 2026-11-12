# Matriz de rotación de capas

**Grupo**: Mestizo · **Ficha**: 3228973 B · **Stack**: React + NestJS + PostgreSQL

| Integrante (usuario GitHub) | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9 |
|---|---|---|---|---|---|---|---|---|---|
| @juliodparada-bit | E2E | Front | | | | | | | |
| @brayaansanchezp29-debug | pendiente | | | | | | | | |

## Cobertura semanal

Línea base medida antes de los tests nuevos. El frontend aún no tiene tests de interfaz, así que su piso es 0. El backend sale de `puntaje.spec.ts` y `token.spec.ts`.

| Semana | Frontend (%) | Backend (%) | Umbral configurado |
|---|---|---|---|
| S1 | 0 | 4 | 0 en el frontend. Backend: 4 líneas y 3 ramas |

## Registro de vocero aleatorio

| Semana | Vocero | Capa preguntada | Respuesta escrita | Resultado |
|---|---|---|---|---|
| S1 | Julio David Parada León | E2E | El test `entrar-contrasena-incorrecta` entra con una clave que no existe y espera la alerta «Correo o contraseña incorrectos.». Arrange abre la página. Act llena el formulario y pulsa Entrar. Assert busca `role=alert`. El mutante fue quitar `role="alert"`: Playwright falló con `element(s) not found`. | |
