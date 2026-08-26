# Expediente del proyecto formativo

| Campo | Valor |
|---|---|
| Programa | Tecnólogo en Análisis y Desarrollo de Software (ADSO) |
| Código | 228118 |
| Institución | Servicio Nacional de Aprendizaje — SENA |
| Aprendiz | Julio David Parada León (ficha 3228973 B) |
| Modalidad | Presencial nocturna (mixta) |
| Rol | Product Owner (análisis, diseño, desarrollo, pruebas y entrega) |
| Nombre académico | Plataforma digital para la gestión integral de refugios de fauna doméstica en Bogotá |
| Marca de producto | En definición (el nombre académico no cambia) |
| Ámbito | Área urbana de Bogotá, D.C. — caninos y felinos domésticos |
| Repositorio | https://github.com/juliodparada-bit/plataforma-refugios-fauna-domestica-bogota |
| Última revisión de coherencia | 18 de agosto de 2026 |

Este expediente lo organizo yo, Julio David Parada León, como Product Owner y constructor del prototipo. Una sola carpeta: `documentacion/`. Artefactos de ingeniería (IEEE 830, UML, DER, pruebas, manuales) por fases SENA.

---

## Cómo leer este expediente

1. Abre cada `.md` en **vista previa** (`Ctrl+Shift+V`). El editor crudo no dibuja diagramas Mermaid ni formatea bien las tablas.
2. Cada archivo empieza igual: tabla de metadatos → un párrafo de para qué sirve → el contenido. Bajo cada diagrama hay un pie de figura.
3. Orden de lectura: este índice → **1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 2.3 → 2.4**. El 1.4 es un ejemplo paralelo (no cierra requisitos).
4. Si un instructor pide una evidencia (`GA1-220501092-AA4-EV01`, etc.), recorto o exporto el archivo de aquí. No hay un Google Doc paralelo.

---

## Cómo se organiza

La lista de internet (análisis → diseño → desarrollo → despliegue) es el ciclo de vida del software. ADSO evalúa **por proyecto formativo y por competencias**:

| Fase SENA | En ingeniería | Competencias | Índice |
|---|---|---|---|
| 1. Análisis | Requisitos y backlog | 220501092 · 220501093 | [Índice fase 1](01-analisis/00-indice-de-la-fase.md) |
| 2. Planeación | Arquitectura, UML, BD, UI | 220501094 · 220501095 | [Índice fase 2](02-planeacion-y-diseno/00-indice-de-la-fase.md) |
| 3. Ejecución | Construcción por sprints | 220501096 | [Índice fase 3](03-ejecucion-y-desarrollo/00-indice-de-la-fase.md) |
| 4. Evaluación y control | Pruebas, despliegue, sustentación | 220501097 · 220501098 | [Índice fase 4](04-evaluacion-pruebas-y-entrega/00-indice-de-la-fase.md) |

---

## Estado actual

| Fase | Estado | Qué hay hoy |
|---|---|---|
| 1. Análisis | Estable | Formulación, ERS, HU, backlog, entrevista de ejemplo (1.4 no es trabajo de campo) |
| 2. Planeación y diseño | Estable para construir | 2.1 a 2.4 vigentes (wireframes de baja fidelidad; alta fidelidad después) |
| 3. Ejecución | En curso | Módulos 1 a 5 demostrables en local, con cuentas de ejemplo para entidad, adoptante y donante |
| 4. Evaluación y entrega | Pendiente de artefactos | Ya hay incrementos usables; faltan 4.1 a 4.5 (pruebas formales, manuales, pitch) |

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
| [2.1 Arquitectura](02-planeacion-y-diseno/2.1-arquitectura-de-la-solucion.md) | Estilo, contexto, contenedores, stack |
| [2.2 UML](02-planeacion-y-diseno/2.2-uml.md) | Casos de uso por épica, actividades, secuencia, clases, estados |
| [2.3 Base de datos](02-planeacion-y-diseno/2.3-base-de-datos.md) | DER, modelo relacional, diccionario |
| [2.4 Interfaz](02-planeacion-y-diseno/2.4-interfaz-ui-ux.md) | Mapa de navegación y wireframes de baja fidelidad |

### Fase 3 — Ejecución

| Archivo | Para qué sirve |
|---|---|
| [Índice fase 3](03-ejecucion-y-desarrollo/00-indice-de-la-fase.md) | Sprints y convenciones |
| [3.1 Entorno](03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md) | Cómo levantar API, web y PostgreSQL |

### Fase 4 — Evaluación y entrega

| Archivo | Para qué sirve |
|---|---|
| [Índice fase 4](04-evaluacion-pruebas-y-entrega/00-indice-de-la-fase.md) | Pruebas, manuales, despliegue, pitch |

---

Las decisiones de alcance (métrica norte, sin recaudo, complemento del IDPYBA, web por URL) están escritas en la [formulación 1.1](01-analisis/1.1-formulacion-del-proyecto.md), secciones 5 y 6. No las repito aquí.

---

## Convenio

- Un solo hilo: `documentacion/`.
- Marca comercial: **en definición**. Hasta cerrarla, en pantallas y diagramas uso «la plataforma».
- Entrevista real con un refugio: pendiente. El 1.4 es simulación.
