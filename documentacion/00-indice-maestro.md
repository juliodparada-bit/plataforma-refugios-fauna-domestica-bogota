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
| Marca propuesta | Mestizo (aún no cerrada) |
| Ámbito | Área urbana de Bogotá, D.C. — caninos y felinos domésticos |
| Repositorio | https://github.com/yuliedma1003-boop/plataforma-refugios-fauna-domestica-bogota |

Fuente única de documentación. Se construye por fases SENA, con artefactos de ingeniería (IEEE 830, UML, DER, pruebas, manuales).

---

## Cómo leer este expediente

1. Abre cada `.md` en **vista previa** (`Ctrl+Shift+V`). El editor crudo no dibuja diagramas Mermaid ni formatea bien las tablas.
2. Cada archivo empieza igual: tabla de metadatos → un párrafo de para qué sirve → el contenido. Bajo cada diagrama hay un pie de figura.
3. Orden de lectura: este índice → **1.1 → 1.2 → 1.3 → 2.1 → 2.2 → 2.3**. El 1.4 es un ejemplo paralelo (no cierra requisitos). Falta el **2.4** (wireframes).
4. Si el instructor pide una evidencia (`GA1-220501092-AA4-EV01`, etc.), se recorta o se exporta el archivo de aquí. No hay un Google Doc paralelo.

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
| 1. Análisis | Estable para diseñar | Formulación, ERS, HU, backlog, entrevista de ejemplo |
| 2. Planeación y diseño | En construcción | 2.1, 2.2 y 2.3 vigentes; falta 2.4 (wireframes) |
| 3. Ejecución | Pendiente | Aún no hay código de producto |
| 4. Evaluación y entrega | Pendiente | Se abre con el primer incremento usable |

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
| 2.4 Interfaz (UI/UX) | Aún no existe: mapa de navegación y wireframes |

### Fase 3 — Ejecución

| Archivo | Para qué sirve |
|---|---|
| [Índice fase 3](03-ejecucion-y-desarrollo/00-indice-de-la-fase.md) | Sprints y convenciones |

### Fase 4 — Evaluación y entrega

| Archivo | Para qué sirve |
|---|---|
| [Índice fase 4](04-evaluacion-pruebas-y-entrega/00-indice-de-la-fase.md) | Pruebas, manuales, despliegue, pitch |

---

## Decisiones de producto

1. **Métrica norte:** cupos liberados por adopción efectiva.
2. **Alcance:** verificación, catálogo con historia, postulación corta, listas de deseos en especie, bloqueo de fauna no doméstica. Canal: web por enlace (WhatsApp / Instagram).
3. **Fuera de alcance:** recaudo, apadrinamiento, matching con histórico. App nativa: pendiente de posible integración (formulación 6.3).
4. **Posicionamiento:** complementar al IDPYBA; no duplicar la UCA.
5. **Gobernanza:** Nivel 1 y Nivel 2. Este prototipo no recauda dinero.

---

## Convenio

- Un solo hilo: `documentacion/`.
- De la fase 2 falta el **2.4 UI**.
- **Mestizo** es propuesta de marca hasta que se cierre.
- La entrevista real con un refugio sigue pendiente; el 1.4 es simulación.
