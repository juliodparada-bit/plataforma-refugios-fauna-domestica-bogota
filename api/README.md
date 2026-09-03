# API de Mestizo (NestJS)

Backend del prototipo. Cómo levantarlo: [3.1 Entorno](../documentacion/03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md). Sesión: cookie `httpOnly` `sid` (JWT). Hash: bcryptjs.

El cliente llama estas rutas con el prefijo `/api` (proxy de Vite).

| Método | Ruta | HU |
|---|---|---|
| POST | `/auth/registro` | HU-01 |
| POST | `/auth/entrar` · `/auth/salir` | HU-02 |
| GET | `/auth/yo` | HU-02 |
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
| GET | `/entidades/:id` · GET `/entidades/:id/deseos` | HU-10, RF-20 |
| POST | `/deseos/:id/reservar` · `/reservas/:id/confirmar` | HU-11 |
| GET | `/reservas/:id/evidencia` | HU-11 |

No hay rutas de recaudo ni de pasarela. Publicar animales o ítems exige sello Nivel 1 o Nivel 2 (`selloPermitePublicar` en `api/src/comun/entidad.ts`).
