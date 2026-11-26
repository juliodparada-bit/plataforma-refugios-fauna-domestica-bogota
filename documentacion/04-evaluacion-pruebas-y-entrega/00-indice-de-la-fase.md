# Fase 4 — Evaluación, pruebas y entrega

| Campo | Valor |
|---|---|
| Código | DOC-EV-00 |
| Fase SENA | Evaluación y control |
| Competencias | 220501097 · 220501098 |
| Estado | Vigente para T6 (lista oferta abierta) |
| Depende de | Incrementos demostrables de la fase 3 (módulos 1 a 5) |

Cierro el ciclo: verificar lo construido, decir cómo se instala, cómo se pone a correr, cómo se respalda y sustentarlo. Los cinco módulos se muestran en local. **IoT no aplica. No hay URL pública.**

Los siete entregables del instructor están tabulados en el [índice maestro](../00-indice-maestro.md) y en el [README](../../README.md).

---

## Artefactos

| Archivo | Para qué sirve |
|---|---|
| [4.1 Pruebas](4.1-pruebas.md) | Plan: niveles para principiantes, ambiente, umbrales, Postman, reporte y ciclos |
| [Matriz de casos](4.1-matriz-casos.md) | 32 casos POSITIVO/NEGATIVO de tests en `main` |
| [4.2 Manual técnico](4.2-manual-tecnico.md) | Mapa a 2.1, 3.1, API y módulos de código |
| [4.3 Manual de usuario](4.3-manual-usuario.md) | Recorrido por rol (visitante → validador), cuentas de piloto |
| [4.4 Despliegue](4.4-despliegue.md) | Un comando Compose (Postgres 5433, API 3000, web 5173). Checklist de revisión |
| [4.5 Guion oral](4.5-sustentacion.md) | 15 minutos; diapositivas en `/sustentacion` |
| [4.6 Cierre T6 y T7](4.6-cierre-t6-y-t7.md) | Qué cierra el trimestre 6 y qué queda fuera |
| [4.7 Calidad y deuda](4.7-calidad-y-deuda.md) | Lint, backends de formación, deuda priorizada |
| [4.8 Plan de respaldo](4.8-plan-de-respaldo.md) | GitHub + `pg_dump` de `refugios-pg` + semilla. Sin nube |
| [4.9 Manual de instalación](4.9-manual-instalacion.md) | Primera vez: Git, Node, Docker, clonar, `.env`, npm, Prisma |

El 4.4 y el 4.9 son entregables **distintos** (el instructor los pidió aparte). El [3.1](../03-ejecucion-y-desarrollo/3.1-entorno-de-desarrollo.md) queda como resumen de entorno de desarrollo.

---

## Criterio de éxito de la entrega (formulación)

Mínimo viable de demostración: un refugio publica animales, llega una postulación y un ítem de insumos queda cubierto. En la semilla local eso ya está listo para mostrar.
