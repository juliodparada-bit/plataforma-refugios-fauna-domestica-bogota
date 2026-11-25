# Expediente del proyecto formativo

| Campo | Valor |
|---|---|
| Programa | Tecnólogo en Análisis y Desarrollo de Software (ADSO) |
| Código | 228118 |
| Institución | Servicio Nacional de Aprendizaje — SENA |
| Aprendices | Julio David Parada León y Brayan Alejandro Sánchez (ficha 3228973 B) |
| Modalidad | Presencial nocturna (mixta) |
| Roles | Julio: Product Owner del expediente. Ambos: construcción y sustentación del prototipo |
| Nombre académico | Plataforma digital para la gestión integral de refugios de fauna doméstica en Bogotá |
| Marca de producto | Mestizo |
| Eslogan | Por convivencia, no por raza. |
| Frase del catálogo | No busca una raza. Busca un hogar. |
| Ámbito | Área urbana de Bogotá, D.C. — caninos y felinos domésticos |
| Repositorio | https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota |
| Última revisión | 25 de noviembre de 2026 (expediente T6 alineado al código) |

Este expediente lo organizamos Julio David Parada León y Brayan Alejandro Sánchez. Julio firma como Product Owner del hilo documental. El expediente SENA vive en `documentacion/` (fases 1–4). `docs/` es **otra** carpeta: material del bootcamp de pruebas (`matriz-rotacion.md`); el camino de auditoría del [PR #16](https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota/pull/16) no está en `main`. No se mezclan.

---

## Qué abre el instructor (lista T6 OA)

| Dim | Abrir |
|---|---|
| D1 visión | [4.6 Cierre T6 y T7](04-evaluacion-pruebas-y-entrega/4.6-cierre-t6-y-t7.md) |
| D1 retros | [3.6 Retrospectivas de pruebas](03-ejecucion-y-desarrollo/3.6-retrospectivas-de-pruebas.md) |
| D2 Nest / JWT / .env | [3.1 Entorno](03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md) · `api/.env.example` · [api/README.md](../api/README.md) |
| D2 arquitectura + IoT No | [2.1 Arquitectura](02-planeacion-y-diseno/2.1-arquitectura-de-la-solucion.md) |
| D2 demo e2e | [http://localhost:5173/sustentacion](http://localhost:5173/sustentacion) · guion [4.5](04-evaluacion-pruebas-y-entrega/4.5-sustentacion.md) |
| D3 plan, matriz, Postman, issues | [4.1](04-evaluacion-pruebas-y-entrega/4.1-pruebas.md) · [matriz](04-evaluacion-pruebas-y-entrega/4.1-matriz-casos.md) · `tests/postman/` |
| D4 README + API | [README.md](../README.md) sección Pruebas · [api/README.md](../api/README.md) |
| D5 lint y deuda | [4.7](04-evaluacion-pruebas-y-entrega/4.7-calidad-y-deuda.md) |

**IoT = No.** S5/S6 no están en `main` (PR #13 y #14 abiertos). Umbrales: no se tocan.

---

## Cómo leer este expediente

1. Abre cada `.md` en **vista previa** (`Ctrl+Shift+V`). El editor crudo no dibuja diagramas Mermaid ni formatea bien las tablas.
2. Cada archivo empieza igual: tabla de metadatos → un párrafo de para qué sirve → el contenido. Bajo cada diagrama hay un pie de figura.
3. Orden de lectura del análisis/diseño: **1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 2.3 → 2.4**. El 1.4 es un ejemplo paralelo (no cierra requisitos; la entrevista de campo sigue pendiente).
4. Si un instructor pide una evidencia (`GA1-220501092-AA4-EV01`, etc.), recorto o exporto el archivo de aquí. No hay un Google Doc paralelo.

---

## Cómo se organiza

La lista de internet (análisis → diseño → desarrollo → despliegue) es el ciclo de vida del software. ADSO evalúa **por proyecto formativo y por competencias**:

| Fase SENA | En ingeniería | Competencias | Índice |
|---|---|---|---|
| 1. Análisis | Requisitos y backlog | 220501092 · 220501093 | [Índice fase 1](01-analisis/00-indice-de-la-fase.md) |
| 2. Planeación | Arquitectura, UML, BD, UI | 220501094 · 220501095 | [Índice fase 2](02-planeacion-y-diseno/00-indice-de-la-fase.md) |
| 3. Ejecución | Construcción por incrementos | 220501096 | [Índice fase 3](03-ejecucion-y-desarrollo/00-indice-de-la-fase.md) |
| 4. Evaluación y control | Pruebas, sustentación T6 | 220501097 · 220501098 | [Índice fase 4](04-evaluacion-pruebas-y-entrega/00-indice-de-la-fase.md) |

---

## Estado actual

| Fase | Estado | Qué hay hoy |
|---|---|---|
| 1. Análisis | Estable | Formulación, ERS, HU, backlog. [1.4](01-analisis/1.4-entrevista-simulada-ejemplo.md) es simulación, no trabajo de campo |
| 2. Planeación y diseño | Estable | 2.1 a 2.4 vigentes. El look vive en `web/`; los wireframes del 2.4 siguen siendo el contenido y el orden |
| 3. Ejecución | Must demostrable | [3.1](03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md), [tablero 3.5](03-ejecucion-y-desarrollo/3.5-tablero-de-ejecucion.md), [Git Flow 3.4](03-ejecucion-y-desarrollo/3.4-git-flow.md), [retrospectivas 3.6](03-ejecucion-y-desarrollo/3.6-retrospectivas-de-pruebas.md) |
| 4. Evaluación y entrega | Vigente para T6 | [4.1](04-evaluacion-pruebas-y-entrega/4.1-pruebas.md), [4.2](04-evaluacion-pruebas-y-entrega/4.2-manual-tecnico.md), [4.3](04-evaluacion-pruebas-y-entrega/4.3-manual-usuario.md), [4.5](04-evaluacion-pruebas-y-entrega/4.5-sustentacion.md), [4.6](04-evaluacion-pruebas-y-entrega/4.6-cierre-t6-y-t7.md), [4.7](04-evaluacion-pruebas-y-entrega/4.7-calidad-y-deuda.md) |

---

## Mapa de archivos

### Fase 1 — Análisis

| Archivo | Para qué sirve |
|---|---|
| [Índice fase 1](01-analisis/00-indice-de-la-fase.md) | Mapa de la fase |
| [1.1 Formulación](01-analisis/1.1-formulacion-del-proyecto.md) | Problema, objetivos, alcance, metodología, marco legal |
| [1.2 ERS IEEE 830](01-analisis/1.2-ers-ieee-830.md) | Requisitos funcionales y no funcionales |
| [1.3 Historias de usuario](01-analisis/1.3-historias-de-usuario-y-product-backlog.md) | Backlog, criterios de aceptación, MoSCoW |
| [1.4 Entrevista simulada](01-analisis/1.4-entrevista-simulada-ejemplo.md) | Guion de ejemplo; no es trabajo de campo |

### Fase 2 — Planeación y diseño

| Archivo | Para qué sirve |
|---|---|
| [Índice fase 2](02-planeacion-y-diseno/00-indice-de-la-fase.md) | Mapa de artefactos |
| [2.1 Arquitectura](02-planeacion-y-diseno/2.1-arquitectura-de-la-solucion.md) | Estilo, contexto, contenedores, stack. IoT no aplica |
| [2.2 UML](02-planeacion-y-diseno/2.2-uml.md) | Casos de uso por épica, actividades, secuencia, clases, estados |
| [2.3 Base de datos](02-planeacion-y-diseno/2.3-base-de-datos.md) | DER, modelo relacional, diccionario |
| [2.4 Interfaz](02-planeacion-y-diseno/2.4-interfaz-ui-ux.md) | Mapa de navegación y wireframes (look en `web/`) |

### Fase 3 — Ejecución

| Archivo | Para qué sirve |
|---|---|
| [Índice fase 3](03-ejecucion-y-desarrollo/00-indice-de-la-fase.md) | Incrementos y convenciones |
| [3.1 Entorno](03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md) | Arranque API, web, PostgreSQL y Flutter; puertos; `.env` |
| [3.4 Git Flow](03-ejecucion-y-desarrollo/3.4-git-flow.md) | Ramas, PRs, commits; evidencia de repo y semilla |
| [3.5 Tablero de ejecución](03-ejecucion-y-desarrollo/3.5-tablero-de-ejecucion.md) | Módulos 1–5; HU Must 01–11; pantallas y rutas API |
| [3.6 Retrospectivas de pruebas](03-ejecucion-y-desarrollo/3.6-retrospectivas-de-pruebas.md) | Dos notas T6 sobre el proceso de pruebas (S1–S2 y S3–S4) |

### Fase 4 — Evaluación y entrega

| Archivo | Para qué sirve |
|---|---|
| [Índice fase 4](04-evaluacion-pruebas-y-entrega/00-indice-de-la-fase.md) | Mapa de la fase |
| [4.1 Pruebas](04-evaluacion-pruebas-y-entrega/4.1-pruebas.md) | Niveles, ambiente, umbrales, Postman, reporte y ciclos |
| [Matriz de casos](04-evaluacion-pruebas-y-entrega/4.1-matriz-casos.md) | ≥20 casos POSITIVO/NEGATIVO sacados de tests de `main` |
| [4.2 Manual técnico](04-evaluacion-pruebas-y-entrega/4.2-manual-tecnico.md) | Ancla de módulos de código |
| [4.3 Manual de usuario](04-evaluacion-pruebas-y-entrega/4.3-manual-usuario.md) | Qué hace cada rol |
| [4.5 Guion oral](04-evaluacion-pruebas-y-entrega/4.5-sustentacion.md) | Orden de 15 minutos; diapositivas en `/sustentacion` |
| [4.6 Cierre T6 y T7](04-evaluacion-pruebas-y-entrega/4.6-cierre-t6-y-t7.md) | Qué cierra el trimestre 6 y qué no |
| [4.7 Calidad y deuda](04-evaluacion-pruebas-y-entrega/4.7-calidad-y-deuda.md) | Lint real, backends de formación, deuda priorizada |

---

Las decisiones de alcance (métrica norte, sin recaudo, complemento del IDPYBA, web por URL y companion Flutter) están escritas en la [formulación 1.1](01-analisis/1.1-formulacion-del-proyecto.md), secciones 5 y 6. No las repito aquí.

---

## Convenio

- Expediente SENA: `documentacion/`. Bootcamp de pruebas: `docs/`. Código: `api/`, `web/`, `mobile/`, `e2e/`. Postman T6: `tests/postman/`.
- Mapa de módulos de código (auth, animales, postulaciones, deseos, verificación, cuenta/foto, Flutter, seed): [4.2](04-evaluacion-pruebas-y-entrega/4.2-manual-tecnico.md).
- Marca de producto: **Mestizo**. Eslogan: *Por convivencia, no por raza.* El nombre académico del expediente no cambia.
- Presentan el prototipo: Julio David Parada León y Brayan Alejandro Sánchez.
- Entrevista real con un refugio: pendiente. El 1.4 es simulación.
