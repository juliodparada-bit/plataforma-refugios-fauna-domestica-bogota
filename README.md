# Mestizo

Proyecto formativo ADSO (SENA, código 228118), ficha **3228973 B**, modalidad **presencial nocturna (mixta)**. Nombre académico: plataforma digital para la gestión integral de refugios de fauna doméstica en Bogotá.

Lo construimos y lo presentamos **Julio David Parada León** (Product Owner del expediente) y **Brayan Alejandro Sánchez**.

Ámbito: área urbana de Bogotá; caninos y felinos domésticos. Marca de producto: **Mestizo**. Eslogan: *Por convivencia, no por raza.* En el catálogo: *No busca una raza. Busca un hogar.*

## Cómo leer el expediente

Empieza por el [índice maestro](documentacion/00-indice-maestro.md), en vista previa de Markdown (`Ctrl+Shift+V`). El expediente ADSO está en `documentacion/`. `docs/` es el bootcamp de pruebas (matriz de rotación), no una segunda copia del expediente.

Orden: **1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 2.3 → 2.4**. El código está en `api/`, `web/` y `mobile/` (Flutter, misma API). Cómo levantarlo: [3.1 Entorno](documentacion/03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md). Avance de historias: [tablero 3.5](documentacion/03-ejecucion-y-desarrollo/3.5-tablero-de-ejecucion.md). Ramas y PRs (Git Flow; ambos aprendices): [3.4](documentacion/03-ejecucion-y-desarrollo/3.4-git-flow.md).

En local: Postgres en `5433`, API en `3000`, cliente web en [http://localhost:5173](http://localhost:5173), app Flutter en `mobile/`. Guion de 15 minutos: [http://localhost:5173/sustentacion](http://localhost:5173/sustentacion) ([4.5](documentacion/04-evaluacion-pruebas-y-entrega/4.5-sustentacion.md)). Detalle de la app: [mobile/README.md](mobile/README.md).

**Cuentas de piloto** (solo local): `entidad.ejemplo@local.test`, `adoptante.ejemplo@local.test` y `donante.ejemplo@local.test`, todas con `EjemploLocal123`. Detalle en [3.1](documentacion/03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md).

## Alcance del prototipo

Verificación de entidades, catálogo con historia, postulación corta, listas de deseos en especie y bloqueo de fauna no doméstica. Este prototipo **no recauda dinero**. **IoT no aplica:** el producto no incluye sensores ni hardware.

Cierre T6 / lo que queda a T7: [4.6](documentacion/04-evaluacion-pruebas-y-entrega/4.6-cierre-t6-y-t7.md).

## Pruebas

Comandos (desde cada carpeta):

```bash
cd web && npm test          # Vitest + cobertura
cd api && npm test          # Jest + cobertura
cd e2e && pnpm test         # Playwright (login fallido)
```

Umbrales vigentes, leídos de los archivos (no se cambian en el expediente T6):

| Paquete | Archivo | Líneas | Sentencias | Ramas | Funciones |
|---|---|---|---|---|---|
| web | `web/vite.config.ts` | 75 | 75 | 77 | 70 (`testTimeout` 20000) |
| api | `api/jest.config.cjs` | 47 | 47 | 37 | 43 |

Plan, niveles, ambiente, reporte y ciclos detectar–corregir–verificar: [4.1](documentacion/04-evaluacion-pruebas-y-entrega/4.1-pruebas.md). Matriz (≥20 casos del árbol): [4.1-matriz-casos.md](documentacion/04-evaluacion-pruebas-y-entrega/4.1-matriz-casos.md). Colección Postman importable: [tests/postman/mestizo-api.postman_collection.json](tests/postman/mestizo-api.postman_collection.json). Rotación del bootcamp (no es el expediente SENA): [docs/matriz-rotacion.md](docs/matriz-rotacion.md). Módulos de código: [4.2](documentacion/04-evaluacion-pruebas-y-entrega/4.2-manual-tecnico.md).

Pull requests de **construcción** de pruebas en `main`: [#6](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/6), [#7](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/7), [#9](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/9), [#11](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/11). De **umbral / corrección** en `main`: [#8](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/8), [#10](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/10) y el commit [`040b6c4`](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/commit/040b6c43e8d3c762970b0efc655e1cbedc37b223) (`testTimeout` 20 s). API documentada: [api/README.md](api/README.md).

Lint del API (resultado real, no «0 errores»): [4.7](documentacion/04-evaluacion-pruebas-y-entrega/4.7-calidad-y-deuda.md).
