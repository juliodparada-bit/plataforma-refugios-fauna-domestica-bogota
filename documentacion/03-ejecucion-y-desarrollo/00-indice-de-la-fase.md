# Fase 3 — Ejecución y desarrollo

| Campo | Valor |
|---|---|
| Código | DOC-EJ-00 |
| Fase SENA | Ejecución |
| Competencia | 220501096 |
| Estado | Must HU-01 a HU-11 demostrable |
| Depende de | Arquitectura, DER e interfaz de la fase 2 |

Construyo el software por incrementos, en el orden del product backlog ([1.3](../01-analisis/1.3-historias-de-usuario-y-product-backlog.md), sección 5).

---

## Artefactos

| Archivo | Para qué sirve |
|---|---|
| [3.1 Entorno](3.1-entorno-de-desarrollo.md) | Cómo levantar Postgres, API, cliente web y Flutter; puertos; `.env` |
| [3.4 Git Flow](3.4-git-flow.md) | Ramas `main` / `feature/HU-xx-…`, PRs, commits; repo y semilla |
| [3.5 Tablero de ejecución](3.5-tablero-de-ejecucion.md) | Módulos 1 a 5, HU, pantallas, API y evidencia |
| [3.6 Retrospectivas de pruebas](3.6-retrospectivas-de-pruebas.md) | Dos notas T6: E2E/front (S1–S2) y recorrido/umbral (S3–S4) |

Los antiguos 3.2 (sprints) y 3.3 (evidencias) se fusionaron aquí: módulos en el [3.5](3.5-tablero-de-ejecucion.md), repo/semilla en el [3.4](3.4-git-flow.md) y arranque en el [3.1](3.1-entorno-de-desarrollo.md).

---

## Fuera de esta fase

- Pruebas formales, matriz y pitch T6: [fase 4](../04-evaluacion-pruebas-y-entrega/00-indice-de-la-fase.md).
- Recaudo, apadrinamiento, IoT o aprendizaje automático. Hay un companion Flutter en `mobile/` que habla con la misma API; no sustituye el cliente web del expediente.
