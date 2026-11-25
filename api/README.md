# API de Mestizo (NestJS)

Backend del prototipo. Arranque: copiar `.env.example` a `.env` (Postgres de desarrollo en **5433**, `PUERTO=3000`). Cómo levantarlo: [3.1 Entorno](../documentacion/03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md). Sesión: JWT firmado (bcryptjs). Web: cookie `httpOnly` `sid`. Flutter: cuerpo `{ token, usuario }` y cabecera `Authorization: Bearer`. `extraerToken` en `src/auth/token.ts`. El cliente web (Vite **5173**) llama con el prefijo `/api` (proxy). Pruebas y Postman: [4.1](../documentacion/04-evaluacion-pruebas-y-entrega/4.1-pruebas.md).

Rutas (el cliente web las llama con el prefijo `/api` del proxy de Vite; Postman apunta a `http://localhost:3000` sin ese prefijo):

| Método | Ruta | HU |
|---|---|---|
| POST | `/auth/registro` | HU-01 |
| POST | `/auth/entrar` · `/auth/salir` | HU-02 |
| GET | `/auth/yo` | HU-02 (200 sin cookie: visitante, no 401) |
| PATCH | `/auth/yo` | Cuenta: nombre, localidad y nombre del hogar |
| GET · POST | `/auth/yo/foto` | Foto de perfil (JPEG/PNG/WebP) |
| GET | `/localidades` | Catálogo de 19 localidades urbanas |
| POST | `/verificaciones` | HU-03 |
| GET | `/verificaciones/mia` | HU-03 |
| GET | `/verificaciones` · `/verificaciones/:id` | HU-04 |
| GET | `/verificaciones/:id/evidencias/:evidenciaId` | HU-04 |
| POST | `/verificaciones/:id/resolver` | HU-04 |
| POST | `/animales` | HU-05 |
| GET | `/animales` · `/animales/:id` | HU-06 |
| GET | `/animales/mios` | HU-05 |
| GET | `/animales/:id/fotos/:fotoId` | HU-06 |
| PUT | `/perfil` · GET `/perfil` | HU-07 |
| POST | `/animales/:id/postulaciones` | HU-08 |
| GET | `/postulaciones/mias` | HU-08 |
| GET | `/animales/:id/postulaciones` | HU-09 |
| POST | `/postulaciones/:id/resolver` | HU-09 |
| POST | `/deseos` · GET `/deseos/mios` | HU-10 |
| GET | `/entidades` | Hogares con sello y necesidades pendientes |
| GET | `/entidades/:id` | HU-10, RF-20 (el perfil ya embebe los deseos públicos) |
| POST | `/deseos/:id/reservar` · `/reservas/:id/confirmar` | HU-11 |
| GET | `/reservas/:id/evidencia` | HU-11 |

No hay rutas de recaudo ni de pasarela. Publicar animales o ítems exige sello Nivel 1 o Nivel 2 (`selloPermitePublicar` en `api/src/comun/entidad.ts`).
