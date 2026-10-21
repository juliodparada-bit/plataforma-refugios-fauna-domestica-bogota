# Mestizo (Flutter)

Companion móvil del prototipo web. Misma API Nest (`api/`, puerto **3000**), mismos roles y las mismas reglas: sin recaudo, solo Bogotá urbana, caninos y felinos. La marca en UI es **Mestizo**.

La web sigue usando la cookie `httpOnly` `sid`. Esta app guarda el JWT que ahora también devuelven `POST /auth/entrar` y `POST /auth/registro`, y lo envía como `Authorization: Bearer`.

## Requisitos

- Flutter 3.16+ (probado con 3.47 / Dart 3.13)
- API levantada (`cd api && npm run start:dev`) y Postgres en **5433**
- Un emulador Android, un simulador iOS o un teléfono en la misma red

## Cómo correrla

```bash
cd mobile
flutter pub get

# Emulador Android (el host de la máquina es 10.0.2.2)
flutter run --dart-define=API_URL=http://10.0.2.2:3000

# Simulador iOS
flutter run --dart-define=API_URL=http://127.0.0.1:3000

# Teléfono físico: usa la IP LAN del computador donde corre la API
# flutter run --dart-define=API_URL=http://192.168.x.x:3000
```

Si omites `--dart-define=API_URL=`, el valor por defecto es `http://10.0.2.2:3000` en Android y `http://127.0.0.1:3000` en iOS. En el teléfono, si la API no responde, la app muestra la URL y permite cambiarla (por ejemplo `http://10.90.41.52:3000`) sin recompilar.

HTTP en claro está permitido solo para el piloto local (`usesCleartextTraffic` / `NSAllowsLocalNetworking`).

## Cuentas de piloto

Las mismas de [3.1](../documentacion/03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md):

| Rol | Correo | Contraseña |
|---|---|---|
| Entidad Nivel 1 | `entidad.ejemplo@local.test` | `EjemploLocal123` |
| Adoptante | `adoptante.ejemplo@local.test` | `EjemploLocal123` |
| Donante | `donante.ejemplo@local.test` | `EjemploLocal123` |
| Validador | `validador@local.test` | `CambiaEsto123` |

## Qué cubre esta versión

Inicio (tres caminos), entrar/registro, cuenta con foto, catálogo + perfil de animal, cuestionario y postulaciones del adoptante, necesidades + perfil de entidad (donante), alta / postulaciones / deseos / verificación (entidad con sello), cola del validador. HU-12 a HU-14 (editar/archivar animal, recuperar contraseña, varias fotos) siguen fuera, igual que en la web.

## Análisis

```bash
flutter analyze
```
