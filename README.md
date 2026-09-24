# Mestizo

Proyecto formativo ADSO (SENA, código 228118), ficha **3228973 B**, modalidad **presencial nocturna (mixta)**. Nombre académico: plataforma digital para la gestión integral de refugios de fauna doméstica en Bogotá.

Lo construimos y lo presentamos **Julio David Parada León** (Product Owner del expediente) y **Brayan Alejandro Sánchez**.

Ámbito: área urbana de Bogotá; caninos y felinos domésticos. Marca de producto: **Mestizo**. Eslogan: *Por convivencia, no por raza.* En el catálogo: *No busca una raza. Busca un hogar.*

## Cómo leer el expediente

Empieza por el [índice maestro](documentacion/00-indice-maestro.md), en vista previa de Markdown (`Ctrl+Shift+V`).

Orden: **1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 2.3 → 2.4**. El código está en `api/` y `web/`. Cómo levantarlo: [3.1 Entorno](documentacion/03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md). Avance de historias: [tablero 3.5](documentacion/03-ejecucion-y-desarrollo/3.5-tablero-de-ejecucion.md). Ramas y PRs (Git Flow; ambos aprendices): [3.4](documentacion/03-ejecucion-y-desarrollo/3.4-git-flow.md).

En local: Postgres en `5433`, API en `3000`, cliente en [http://localhost:5173](http://localhost:5173). Guion de 15 minutos: [http://localhost:5173/sustentacion](http://localhost:5173/sustentacion) ([4.5](documentacion/04-evaluacion-pruebas-y-entrega/4.5-sustentacion.md)).

**Cuentas de piloto** (solo local): `entidad.ejemplo@local.test`, `adoptante.ejemplo@local.test` y `donante.ejemplo@local.test`, todas con `EjemploLocal123`. Detalle en [3.1](documentacion/03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md).

## Alcance del prototipo

Verificación de entidades, catálogo con historia, postulación corta, listas de deseos en especie y bloqueo de fauna no doméstica. Este prototipo **no recauda dinero**.
