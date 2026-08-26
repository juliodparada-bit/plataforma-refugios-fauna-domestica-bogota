# Plataforma digital para la gestión integral de refugios de fauna doméstica en Bogotá

Proyecto formativo ADSO (SENA, código 228118), ficha **3228973 B**, modalidad **presencial nocturna (mixta)**. Lo documento y lo construyo yo, Julio David Parada León.

Ámbito: área urbana de Bogotá; caninos y felinos domésticos. Marca comercial: **en definición**.

## Cómo leer el expediente

Empieza por el [índice maestro](documentacion/00-indice-maestro.md), en vista previa de Markdown (`Ctrl+Shift+V`).

Orden: **1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 2.3 → 2.4**. El código está en `api/` y `web/`. Cómo levantarlo: [3.1 Entorno](documentacion/03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md).

En local: Postgres en `5433`, API en `3000`, cliente en [http://localhost:5173](http://localhost:5173).

**Cuentas de ejemplo** (solo local; no son personas ni refugios reales): `entidad.ejemplo@local.test`, `adoptante.ejemplo@local.test` y `donante.ejemplo@local.test`, todas con `EjemploLocal123`. Detalle en [3.1](documentacion/03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md).

## Alcance del prototipo

Verificación de entidades, catálogo con historia, postulación corta, listas de deseos en especie y bloqueo de fauna no doméstica. Este prototipo **no recauda dinero**.
